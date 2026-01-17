// --- 3. Global State Variables ---

const robot = document.getElementById("robot");
const canvasArea = document.getElementById("canvas-area");
const statusDiv = document.getElementById("status");

let robotX = 100,
  robotY = 100,
  angle = 0;
let motorPos = 0;

((motorL = 0), (motorR = 0));

let isRunning = false,
  isDragging = false,
  myInterpreter = null;

let sensors = [];
const MAX_SENSORS = 25;

let canvasImageData = null;
let canvasPixelData = null;
