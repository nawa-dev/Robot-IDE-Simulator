/**
 * ROBOT IDE SIMULATOR - Core Script
 * Main initialization and UI event handlers
 */

// --- 1. Monaco Editor Setup ---
let editor;
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
  },
});
require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("monaco-container"), {
    value: [
      "for (var i = 0; i < 4; i++) {",
      "  motor(60, 60);",
      "  delay(1000);",
      "  motor(60, 20);",
      "  delay(1000);",
      "}",
      "motor(0, 0);",
    ].join("\n"),
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
    fontSize: 16,
    minimap: { enabled: false },
  });
});

// --- 2. UI Resizers ---
const resizerV = document.getElementById("drag-resizer");
const resizerH = document.getElementById("h-drag-resizer");
const editorPane = document.querySelector(".editor-pane");
const consolePane = document.querySelector(".console-pane");

resizerV.addEventListener("mousedown", () => {
  document.addEventListener("mousemove", resizeVertical);
  document.addEventListener("mouseup", () =>
    document.removeEventListener("mousemove", resizeVertical)
  );
});

function resizeVertical(e) {
  let newWidth = (e.clientX / window.innerWidth) * 100;
  if (newWidth > 15 && newWidth < 85) {
    editorPane.style.width = newWidth + "%";
  }
}

resizerH.addEventListener("mousedown", () => {
  document.addEventListener("mousemove", resizeHorizontal);
  document.addEventListener("mouseup", () =>
    document.removeEventListener("mousemove", resizeHorizontal)
  );
});

function resizeHorizontal(e) {
  const rect = editorPane.getBoundingClientRect();
  let newHeight = rect.bottom - e.clientY;
  if (newHeight > 50 && newHeight < rect.height - 100) {
    consolePane.style.height = newHeight + "px";
  }
}

// --- 3. Global State Variables ---
const robot = document.getElementById("robot");
const canvasArea = document.getElementById("canvas-area");
const statusDiv = document.getElementById("status");

let robotX = 100,
  robotY = 100,
  angle = 0;
let motorL = 0,
  motorR = 0;
let isRunning = false,
  isDragging = false,
  myInterpreter = null;

let sensors = [];
const MAX_SENSORS = 25;

let canvasImageData = null;
let canvasPixelData = null;

// --- 4. Robot Drag & Drop ---
robot.addEventListener("mousedown", () => {
  if (!isRunning) isDragging = true;
});

window.addEventListener("mouseup", () => (isDragging = false));

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const rect = canvasArea.getBoundingClientRect();

  let nextX = e.clientX - rect.left - 25;
  let nextY = e.clientY - rect.top - 25;

  const maxX = canvasArea.offsetWidth - 50;
  const maxY = canvasArea.offsetHeight - 50;

  robotX = Math.max(0, Math.min(nextX, maxX));
  robotY = Math.max(0, Math.min(nextY, maxY));

  updateRobotDOM();
});

// --- 5. Robot DOM Update ---
function updateRobotDOM() {
  robot.style.left = robotX + "px";
  robot.style.top = robotY + "px";
  robot.style.transform = `rotate(${angle}deg)`;
  updateSensorDots();
}

// --- 6. Console System ---
function logToConsole(msg, type = "info") {
  const output = document.getElementById("console-output");
  const div = document.createElement("div");
  div.className = type === "error" ? "log-error" : "log-info";
  div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function clearConsole() {
  document.getElementById("console-output").innerHTML = "";
}

// --- 7. Angle Control ---
function updateAngleDisplay(value) {
  const angleInput = document.getElementById("angle-input");
  angleInput.value = Math.round(value);
}

function handleAngleInput(value) {
  if (isRunning) {
    logToConsole("Cannot change angle while program is running!", "error");
    document.getElementById("angle-input").value = Math.round(angle);
    document.getElementById("angle-slider").value = angle;
    return;
  }

  let newAngle = parseFloat(value);

  if (isNaN(newAngle)) {
    document.getElementById("angle-input").value = Math.round(angle);
    return;
  }

  newAngle = ((newAngle % 360) + 360) % 360;

  angle = newAngle;
  document.getElementById("angle-slider").value = newAngle;
  document.getElementById("angle-input").value = Math.round(newAngle);
  updateRobotDOM();
  logToConsole(`Robot angle set to ${Math.round(angle)}°`, "info");
}

function updateRobotAngle(value) {
  if (isRunning) {
    logToConsole("Cannot change angle while program is running!", "error");
    document.getElementById("angle-slider").value = angle;
    document.getElementById("angle-input").value = Math.round(angle);
    return;
  }

  angle = parseFloat(value);
  document.getElementById("angle-input").value = Math.round(angle);
  updateRobotDOM();
}

// --- 8. Initialize System ---
updatePhysics();
updateCanvasSize();
setTimeout(() => {
  updateCanvasImageData();
  logToConsole("System initialized.", "info");
}, 1);
