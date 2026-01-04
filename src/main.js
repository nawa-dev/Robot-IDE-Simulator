import { Renderer } from "./core/renderer.js";
import { DifferentialDrive } from "./core/physics.js";
import { SensorSystem } from "./core/sensors.js";
import { createAPI } from "./api/bridge.js";

// configuration
const CONFIG = {
  canvasId: "canvas-area",
  width: 800,
  height: 600,
  robot: {
    width: 60,
    height: 40,
    bodyColor: "#2d3436",
    wheelColor: "#111",
    background: "#ffffff",
  },
  maxWheelSpeed: 220, // px/s
};

const renderer = new Renderer({
  containerId: CONFIG.canvasId,
  width: CONFIG.width,
  height: CONFIG.height,
});
var physics = new DifferentialDrive({
  wheelBase: 44,
  maxAccel: 400,
  maxSpeed: 220,
});

// robot state
var state = window.robotState || { pose: { x: 100, y: 100, theta: 0 } };
window.robotState = state; // expose if other scripts reference it

// hook for rendering function used in project (if canvas.js exposes one)
var renderScene =
  window.renderScene ||
  function (pose) {
    // fallback: if original code used DOM robot element, update it here (minimal)
    var el = document.getElementById("robot");
    if (el) {
      el.style.left = (pose.x | 0) + "px";
      el.style.top = (pose.y | 0) + "px";
      el.style.transform = "rotate(" + pose.theta * (180 / Math.PI) + "deg)";
    }
  };

/**
 * ============ ANIMATION LOOP WITH DELTA TIME ============
 * Uses requestAnimationFrame for consistent frame timing
 */

let rafId = null;
let lastTimestamp = null;
let isSimulating = false;

function initSimulationLoop() {
  // Initialize canvas renderer
  setTimeout(() => {
    initCanvasRenderer();
  }, 100);
}

function simulationStep(currentTimestamp) {
  if (!lastTimestamp) lastTimestamp = currentTimestamp;

  // Calculate delta time in seconds (clamp to max 50ms to avoid huge jumps)
  const dt = Math.min(0.05, (currentTimestamp - lastTimestamp) / 1000);
  lastTimestamp = currentTimestamp;

  // Physics update: differential drive model
  if (window.physics) {
    window.physics.step(
      { x: robotX, y: robotY, theta: (angle * Math.PI) / 180 },
      dt
    );

    // Update global robot position (convert back from radians)
    robotX = window.physics.state ? window.physics.state.x : robotX;
    robotY = window.physics.state ? window.physics.state.y : robotY;
    angle =
      window.physics.state && window.physics.state.theta
        ? (window.physics.state.theta * 180) / Math.PI
        : angle;
  }

  // Apply motor commands to physics
  if (window.physics) {
    const maxWheelSpeed = 220; // px/s
    const leftSpeed = (motorL / 100) * maxWheelSpeed;
    const rightSpeed = (motorR / 100) * maxWheelSpeed;
    window.physics.setTargets(leftSpeed, rightSpeed);
  }

  // Update DOM robot element (fallback for visual feedback)
  updateRobotDOM();

  // Render Canvas 2D frame
  renderCanvasFrame();

  // Update track buffer for sensor sampling
  updateTrackBuffer();

  if (isSimulating) {
    rafId = requestAnimationFrame(simulationStep);
  }
}

function startSimulationLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  lastTimestamp = null;
  isSimulating = true;
  rafId = requestAnimationFrame(simulationStep);
}

function stopSimulationLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  isSimulating = false;
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSimulationLoop);
} else {
  initSimulationLoop();
}

// expose controls to existing UI handlers
window.startSim = startSim;
window.stopSim = stopSim;
window.physics = physics; // allow other scripts to call physics.setTargets(...)
window.simState = state;

// wire existing buttons if present
document.getElementById("run-btn")?.addEventListener("click", function () {
  // if original project used runCode(), preserve call
  if (typeof runCode === "function") runCode();
  startSim();
});
document.getElementById("stop-btn")?.addEventListener("click", function () {
  if (typeof stopProgram === "function") stopProgram();
  stopSim();
});

// auto-start if desired (comment/uncomment per project expectations)
startSim();

// load optional map input from existing UI
window.loadMapFile = function (input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    renderer.loadMapImage(img);
  };
  img.src = URL.createObjectURL(file);
};
