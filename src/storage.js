/**
 * Project Save/Load System
 */

let currentProjectName = "Untitled Project";
let currentProjectPath = null;

// --- Create project data ---
function createProjectData() {
  return {
    version: "1.0",
    timestamp: new Date().toISOString(),
    projectName: currentProjectName,
    canvas: {
      width: document.getElementById("canvas-w").value,
      height: document.getElementById("canvas-h").value,
    },
    map: {
      type: canvasArea.style.backgroundImage === "none" ? "default" : "custom",
      imageData: canvasArea.style.backgroundImage
        .replace(/^url\(['"]?/, "")
        .replace(/['"]?\)$/, ""),
    },
    sensors: sensors.map((s) => ({
      id: s.id,
      x: s.x,
      y: s.y,
      name: s.name,
    })),
    sourceCode: editor.getValue(),
    robotState: {
      x: robotX,
      y: robotY,
      angle: angle,
    },
  };
}

// --- Save project ---
// function saveProject() {
//   if (currentProjectPath === null) {
//     saveProjectAs();
//     return;
//   }

//   const projectData = createProjectData();
//   const jsonString = JSON.stringify(projectData, null, 2);
//   const blob = new Blob([jsonString], { type: "application/json" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = currentProjectPath;
//   a.click();
//   URL.revokeObjectURL(url);

//   logToConsole(`Project saved: ${currentProjectPath}`, "info");
// }

// --- Save as ---
function saveProjectAs() {
  const projectName = prompt("Enter project name", currentProjectName);
  if (!projectName) return;

  currentProjectName = projectName;
  currentProjectPath = projectName + ".json";

  const projectData = createProjectData();
  const jsonString = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentProjectPath;
  a.click();
  URL.revokeObjectURL(url);

  logToConsole(`Project saved as: ${currentProjectPath}`, "info");
  updateStatusBar();
}

// --- Open project ---
function openProject() {
  document.getElementById("file-input").click();
}

// --- Load project ---
function loadProject(inputElement) {
  if (!inputElement.files || !inputElement.files[0]) return;

  const file = inputElement.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const projectData = JSON.parse(e.target.result);
      applyProjectData(projectData); // ใช้ฟังก์ชันกลางที่เราสร้างใหม่
      currentProjectPath = file.name;

      logToConsole(`Project loaded: ${file.name}`, "info");
      updateStatusBar();
    } catch (error) {
      logToConsole(`Error loading project: ${error.message}`, "error");
    }
  };

  reader.readAsText(file);
  inputElement.value = "";
}

// --- Update status bar ---
function updateStatusBar() {
  const status = currentProjectPath
    ? `Project: ${currentProjectName}`
    : "Ready";
  statusDiv.innerText = status;
}
// --- ฟังก์ชันสำหรับนำข้อมูล Project Data มาแสดงผลในระบบ ---
// --- ฟังก์ชันสำหรับนำข้อมูล Project Data มาคืนค่าในระบบ ---
function applyProjectData(projectData) {
  if (!projectData || !projectData.sourceCode) return;

  stopProgram();

  // 1. ตั้งค่าพื้นผิว (Canvas & Map)
  const mapSelect = document.getElementById("map-select");
  const currentOpt = document.getElementById("current-map-option");

  document.getElementById("canvas-w").value = projectData.canvas.width || 800;
  document.getElementById("canvas-h").value = projectData.canvas.height || 600;
  updateCanvasSize();

  if (
    projectData.map &&
    projectData.map.type === "custom" &&
    projectData.map.imageData
  ) {
    canvasArea.style.backgroundImage = `url('${projectData.map.imageData}')`;
    canvasArea.style.backgroundColor = "transparent";

    // ปรับ UI Dropdown ให้เป็น Current และแสดงชื่อไฟล์ (ถ้ามี)
    if (currentOpt) {
      const fileName = projectData.map.fileName || "Project Map";
      currentOpt.textContent = `Current: ${fileName}`;
      currentOpt.dataset.filename = fileName;
      if (mapSelect) mapSelect.value = "current";
    }
    setTimeout(updateCanvasImageData, 100);
  } else {
    canvasArea.style.backgroundImage = "none";
    canvasArea.style.backgroundColor = "#f0f0f0";
    if (mapSelect) mapSelect.value = "default";
    if (currentOpt) currentOpt.textContent = "No map loaded";
    updateCanvasImageData();
  }

  // 2. คืนค่า Sensors
  sensors = projectData.sensors.map((s) => ({
    id: s.id,
    x: s.x,
    y: s.y,
    name: s.name,
    isNew: false,
  }));
  updateSensorPreview();
  renderSensorsList();
  updateSensorDots();

  // 3. คืนค่า Code ใน Editor
  if (editor) editor.setValue(projectData.sourceCode);

  // 4. คืนค่าสถานะหุ่นยนต์
  robotX = projectData.robotState.x || 100;
  robotY = projectData.robotState.y || 100;
  angle = projectData.robotState.angle || 0;
  updateRobotDOM();

  currentProjectName = projectData.projectName || "Untitled Project";
  updateStatusBar();
}
const STORAGE_KEY = "robot_sim_autosave";

function createProjectData() {
  const currentOpt = document.getElementById("current-map-option");
  return {
    version: "1.1",
    projectName: currentProjectName,
    canvas: {
      width: document.getElementById("canvas-w").value,
      height: document.getElementById("canvas-h").value,
    },
    map: {
      type: canvasArea.style.backgroundImage === "none" ? "default" : "custom",
      imageData: canvasArea.style.backgroundImage
        .replace(/^url\(['"]?/, "")
        .replace(/['"]?\)$/, ""),
      fileName: currentOpt ? currentOpt.dataset.filename : "", // เก็บชื่อไฟล์ไว้ด้วย
    },
    sensors: sensors.map((s) => ({ id: s.id, x: s.x, y: s.y, name: s.name })),
    sourceCode: editor.getValue(),
    robotState: { x: robotX, y: robotY, angle: angle },
  };
}

function autoSaveToWebStorage() {
  const data = createProjectData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log("Autosaved to WebStorage");
}

function loadFromWebStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      applyProjectData(JSON.parse(saved));
      logToConsole("Session restored from auto-save.", "info");
    } catch (e) {
      console.error(e);
    }
  }
}

function loadProject(inputElement) {
  if (!inputElement.files || !inputElement.files[0]) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      applyProjectData(data); // ใช้ฟังก์ชันกลาง
      logToConsole(`Project loaded: ${inputElement.files[0].name}`, "info");
    } catch (err) {
      logToConsole("Load Error: " + err.message, "error");
    }
  };
  reader.readAsText(inputElement.files[0]);
}
// --- 9. New Project ---
function newProject() {
  if (
    confirm(
      "สร้างโปรเจกต์ใหม่ใช่หรือไม่? ข้อมูลที่ไม่ได้เซฟเป็นไฟล์จะหายไปทั้งหมด"
    )
  ) {
    // 1. หยุดการรันโปรแกรมปัจจุบันก่อน
    stopProgram();

    // 2. ล้างค่าใน LocalStorage (ใช้ Key ให้ตรงกับที่ Auto-save ใช้)
    localStorage.removeItem("robot_sim_autosave");

    // 3. รีเซ็ตตัวแปร Project
    currentProjectName = "Untitled Project";
    currentProjectPath = null;

    // 4. รีเซ็ตโค้ดใน Editor (ใส่ Template เริ่มต้น)
    // if (window.editor) {
    //   const defaultCode = ["log('Robot Start')", "motor(0, 0);"].join("\n");
    //   window.editor.setValue(defaultCode);
    // }

    // 5. รีเซ็ตตำแหน่งหุ่นยนต์และมุม
    robotX = 100;
    robotY = 100;
    angle = 0;
    updateRobotDOM();

    // 6. รีเซ็ตแผนที่ (กลับไปเป็น Default)
    canvasArea.style.backgroundImage = "none";
    canvasArea.style.backgroundColor = "#f0f0f0";
    const mapSelect = document.getElementById("map-select");
    const currentOpt = document.getElementById("current-map-option");
    if (mapSelect) mapSelect.value = "default";
    if (currentOpt) {
      currentOpt.textContent = "No map loaded";
      currentOpt.dataset.filename = "";
    }
    updateCanvasImageData();

    // 7. รีเซ็ต Sensors
    sensors = []; // ล้างอาเรย์เซนเซอร์
    updateSensorPreview();
    renderSensorsList();
    updateSensorDots();

    // 8. ล้าง Console
    clearConsole();

    // 9. อัปเดต Status Bar
    updateStatusBar();
    logToConsole("New project created successfully.", "info");
    location.reload();
  }
}
setTimeout(updateStatusBar, 100);
