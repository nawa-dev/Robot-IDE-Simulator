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
function saveProject() {
  if (currentProjectPath === null) {
    saveProjectAs();
    return;
  }

  const projectData = createProjectData();
  const jsonString = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentProjectPath;
  a.click();
  URL.revokeObjectURL(url);

  logToConsole(`Project saved: ${currentProjectPath}`, "info");
}

// --- Save as ---
function saveProjectAs() {
  const projectName = prompt(
    "Enter project name (without .json):",
    currentProjectName
  );
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

      if (!projectData.sourceCode) {
        throw new Error("Invalid project file: missing sourceCode");
      }

      stopProgram();

      document.getElementById("canvas-w").value =
        projectData.canvas.width || 800;
      document.getElementById("canvas-h").value =
        projectData.canvas.height || 600;
      updateCanvasSize();

      if (projectData.map.type === "custom" && projectData.map.imageData) {
        canvasArea.style.backgroundImage = `url('${projectData.map.imageData}')`;
        canvasArea.style.backgroundColor = "transparent";
        setTimeout(updateCanvasImageData, 100);
      } else {
        canvasArea.style.backgroundImage = "none";
        canvasArea.style.backgroundColor = "#f0f0f0";
        updateCanvasImageData();
      }

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

      editor.setValue(projectData.sourceCode);

      robotX = projectData.robotState.x || 100;
      robotY = projectData.robotState.y || 100;
      angle = projectData.robotState.angle || 0;
      updateRobotDOM();

      currentProjectName = projectData.projectName || "Untitled Project";
      currentProjectPath = file.name;

      logToConsole(`Project loaded: ${file.name}`, "info");
      logToConsole(
        `Sensors: ${sensors.length}, Canvas: ${projectData.canvas.width}x${projectData.canvas.height}`,
        "info"
      );
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

setTimeout(updateStatusBar, 100);
