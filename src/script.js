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
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    lib: ["es5"], // ✅ Array, Math, Object, String
    allowNonTsExtensions: true,
  });

  //   monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  //     noSemanticValidation: true,
  //     noSyntaxValidation: false,
  //   });
  editor = monaco.editor.create(document.getElementById("monaco-container"), {
    value: [
      "log('Robot Start')",
      "while (1){",
      "  motor(60,60)",
      "  delay(200)",
      "  motor(60,-60)",
      "  delay(50)",
      "}",
      "motor(0, 0);",
    ].join("\n"),
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
    fontSize: 16,
    minimap: { enabled: false },
  });

  // ✅ เรียกฟังก์ชันที่ถูกต้อง
  setupRobotHighlighting(editor);
  setupAutocomplete();
});

// --- Custom Highlighting for Robot API ---
// --- Custom Highlighting for Robot API ---
function setupRobotHighlighting(editor) {
  // ✅ ใช้ regex เดิม
  const robotRegex =
    /\b(motor|delay|analogRead|getSensorCount|log)|SW|waitSW\b/g;
  let decorationIds = [];

  function updateDecorations() {
    const model = editor.getModel();
    if (!model) return;

    const text = model.getValue();
    const decorations = [];
    let match;

    while ((match = robotRegex.exec(text)) !== null) {
      const index = match.index;
      const word = match[0];

      const start = model.getPositionAt(index);
      const end = model.getPositionAt(index + word.length);

      // *** ⭐️ ส่วนที่เพิ่มเข้ามาเพื่อตรวจสอบ Comment (//) ***
      const lineContent = model.getLineContent(start.lineNumber).trim();

      // ถ้าบรรทัดเริ่มต้นด้วย // หรือบรรทัดว่าง/มีแต่ช่องว่าง ไม่ต้อง Highlight
      if (lineContent.startsWith("//") || lineContent.length === 0) {
        continue;
      }
      // ************************************************

      decorations.push({
        range: new monaco.Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column
        ),
        options: {
          inlineClassName: "robot-function",
        },
      });
    }

    decorationIds = editor.deltaDecorations(decorationIds, decorations);
  }

  updateDecorations();
  editor.onDidChangeModelContent(updateDecorations);
}

// --- Autocomplete for Robot API ---
function setupAutocomplete() {
  const robotAPI = [
    {
      label: "motor",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "motor(${1:left}, ${2:right})",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation:
        "Control robot motors. motor(left, right) - left/right: 0-100",
      detail: "motor(left: number, right: number) -> void",
    },
    {
      label: "delay",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "delay(${1:milliseconds})",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: "Pause program for specified milliseconds",
      detail: "delay(ms: number) -> Promise",
    },
    {
      label: "analogRead",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "analogRead(${1:sensorIndex})",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation:
        "Read sensor brightness value (0-1024). 0=light, 1024=dark",
      detail: "analogRead(index: number) -> number",
    },
    {
      label: "getSensorCount",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getSensorCount()",
      documentation: "Get total number of sensors",
      detail: "getSensorCount() -> number",
    },
    {
      label: "log",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "log(${1:message})",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: "Print message to console",
      detail: "log(message: string) -> void",
    },
    {
      label: "SW",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "SW(${1:n})",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: "(n) -> boolean",
      documentation:
        "คืนค่า true หากปุ่มที่ระบุถูกกด และ false หากไม่ได้กด (1=SW1, 2=SW2, 3=SW3)",
    },
    {
      label: "waitSW",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "waitSW(${1:n});",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: "(n) -> void",
      documentation: "หยุดรอการทำงานของโปรแกรมจนกว่าปุ่มที่ระบุจะถูกกด",
    },
  ];

  monaco.languages.registerCompletionItemProvider("javascript", {
    provideCompletionItems: (model, position) => {
      return {
        suggestions: robotAPI,
      };
    },
  });
}

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
  isDragging = true;
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
}, 100);

/**
 * ============ CANVAS 2D RENDERER + TRACK BUFFER ============
 * Parallel rendering system: keeps DOM intact but adds Canvas 2D for better fidelity
 */

let canvasRenderer = null;
let trackBufferCanvas = null;
let trackBufferCtx = null;

function initCanvasRenderer() {
  const canvasArea = document.getElementById("canvas-area");
  if (!canvasArea) return;

  // Create main onscreen canvas
  canvasRenderer = document.createElement("canvas");
  canvasRenderer.id = "main-render-canvas";
  canvasRenderer.width = canvasArea.offsetWidth;
  canvasRenderer.height = canvasArea.offsetHeight;
  canvasRenderer.style.position = "absolute";
  canvasRenderer.style.top = "0";
  canvasRenderer.style.left = "0";
  canvasRenderer.style.zIndex = "5";
  canvasRenderer.style.cursor = "crosshair";

  // Create hidden track buffer canvas
  trackBufferCanvas = document.createElement("canvas");
  trackBufferCanvas.width = canvasRenderer.width;
  trackBufferCanvas.height = canvasRenderer.height;
  trackBufferCtx = trackBufferCanvas.getContext("2d");

  canvasArea.style.position = "relative";
  canvasArea.insertBefore(canvasRenderer, canvasArea.firstChild);

  logToConsole("Canvas 2D renderer initialized.", "info");
}

function renderCanvasFrame() {
  if (!canvasRenderer) return;

  const ctx = canvasRenderer.getContext("2d");
  const w = canvasRenderer.width;
  const h = canvasRenderer.height;

  // Clear and draw background
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, w, h);

  // Draw map if loaded
  if (currentMapImage) {
    ctx.drawImage(currentMapImage, 0, 0, w, h);
  }

  // Draw robot as circle + heading indicator
  const robotSize = 25;
  ctx.fillStyle = "#2d3436";
  ctx.beginPath();
  ctx.arc(robotX + 25, robotY + 25, robotSize, 0, Math.PI * 2);
  ctx.fill();

  // Draw heading line
  const rad = (angle * Math.PI) / 180;
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(robotX + 25, robotY + 25);
  ctx.lineTo(
    robotX + 25 + Math.cos(rad) * robotSize,
    robotY + 25 + Math.sin(rad) * robotSize
  );
  ctx.stroke();

  // Draw sensor positions as small dots
  ctx.fillStyle = "rgba(100,200,255,0.6)";
  sensors.forEach((s) => {
    const localX = s.x - 25;
    const localY = s.y - 25;
    const cos_a = Math.cos(rad);
    const sin_a = Math.sin(rad);
    const rotatedX = localX * cos_a - localY * sin_a;
    const rotatedY = localX * sin_a + localY * cos_a;
    const canvasX = robotX + 25 + rotatedX;
    const canvasY = robotY + 25 + rotatedY;
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Update track buffer: copy pixel data from visible canvas for sensor sampling
 * This avoids repeatedly reading from DOM/CSS backgrounds
 */
function updateTrackBuffer() {
  if (!trackBufferCtx || !canvasRenderer) return;
  const ctx = canvasRenderer.getContext("2d");
  const imgData = ctx.getImageData(
    0,
    0,
    trackBufferCanvas.width,
    trackBufferCanvas.height
  );
  trackBufferCtx.putImageData(imgData, 0, 0);
}

/**
 * Sample area around a point in track buffer (3x3 or 5x5)
 * Returns normalized brightness 0..1
 */
function sampleSensorAreaInBuffer(worldX, worldY, sampleSize = 5) {
  if (!trackBufferCtx) return 0;

  const sx = Math.max(0, Math.floor(worldX - sampleSize / 2));
  const sy = Math.max(0, Math.floor(worldY - sampleSize / 2));
  const sw = Math.min(trackBufferCanvas.width - sx, sampleSize);
  const sh = Math.min(trackBufferCanvas.height - sy, sampleSize);

  if (sw <= 0 || sh <= 0) return 0;

  try {
    const imgData = trackBufferCtx.getImageData(sx, sy, sw, sh);
    const data = imgData.data;
    let totalBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Luminance approximation (ITU-R BT.709)
      totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const avg = totalBrightness / (sw * sh);
    return Math.max(0, Math.min(1, avg / 255)); // normalize to 0..1
  } catch (e) {
    return 0;
  }
}

// Hook run/stop buttons to simulation loop
const runBtn = document.getElementById("run-btn");
const stopBtn = document.getElementById("stop-btn");

const originalRunCode = window.runCode;
window.runCode = function () {
  if (typeof originalRunCode === "function") {
    originalRunCode.call(this);
  }
  // Start RAF loop when user code starts
  if (typeof startSimulationLoop === "function") {
    startSimulationLoop();
  }
};

const originalStopProgram = window.stopProgram;
window.stopProgram = function () {
  if (typeof originalStopProgram === "function") {
    originalStopProgram.call(this);
  }
  // Stop RAF loop when user code stops
  if (typeof stopSimulationLoop === "function") {
    stopSimulationLoop();
  }
};
