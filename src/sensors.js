/**
 * Sensor Management System
 */

// --- Open robot settings modal ---
function openRobotSettings() {
  document.getElementById("robot-settings-modal").style.display = "flex";
  updateSensorPreview();
  renderSensorsList();
}

// --- Close robot settings modal ---
function closeRobotSettings() {
  document.getElementById("robot-settings-modal").style.display = "none";
}

// --- Add sensor ---
function addSensorToList() {
  if (sensors.length >= MAX_SENSORS) {
    logToConsole(`Maximum sensors (${MAX_SENSORS}) reached!`, "error");
    return;
  }

  sensors.push({
    id: Date.now(),
    x: 45,
    y: 25,
    name: `Light Sensor ${sensors.length + 1}`,
    isNew: true,
  });

  updateSensorPreview();
  renderSensorsList();
  updateSensorDots();
  logToConsole(`New sensor added. Edit position in the list.`, "info");
}

// --- Delete sensor ---
function deleteSensor(id) {
  sensors = sensors.filter((s) => s.id !== id);
  updateSensorPreview();
  renderSensorsList();
  updateSensorDots();
  logToConsole("Sensor deleted.", "info");
}

// --- Update sensor value ---
function updateSensorValue(id, axis, value) {
  const sensor = sensors.find((s) => s.id === id);
  if (!sensor) return;

  const numValue = parseFloat(value);

  if (isNaN(numValue) || numValue < 0 || numValue > 50) {
    logToConsole(`Position must be between 0 and 50!`, "error");
    if (axis === "x") {
      document.getElementById(`sensor-${id}-x`).value = sensor.x;
    } else {
      document.getElementById(`sensor-${id}-y`).value = sensor.y;
    }
    return;
  }

  if (axis === "x") {
    sensor.x = numValue;
  } else {
    sensor.y = numValue;
  }

  sensor.isNew = false;
  updateSensorPreview();
  updateSensorDots();
  logToConsole(
    `Sensor ${sensor.name} updated to (${sensor.x.toFixed(
      1,
    )}, ${sensor.y.toFixed(1)})`,
    "info",
  );
}

// --- Update sensor preview ---
function updateSensorPreview() {
  const svg = document.getElementById("preview-svg");

  svg.querySelectorAll(".sensor-circle").forEach((el) => el.remove());

  sensors.forEach((sensor) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );

    circle.setAttribute("class", "sensor-circle");
    circle.setAttribute("cx", sensor.x);
    circle.setAttribute("cy", sensor.y);
    circle.setAttribute("r", "2");
    svg.appendChild(circle);
  });
}

// --- Render sensors list ---
function renderSensorsList() {
  const container = document.getElementById("sensors-container");

  if (sensors.length === 0) {
    container.innerHTML =
      '<div class="empty-message">No sensors added yet. Click "+ Add Sensor" to start.</div>';
    return;
  }

  container.innerHTML = sensors
    .map(
      (sensor, index) => `
    <div class="sensor-item ${sensor.isNew ? "sensor-item-new" : ""}">
      <div class="sensor-item-info">
        <div class="sensor-item-label">
          ${"Light Sensor " + index}
        </div>
        <div class="sensor-item-coords">
          <div class="sensor-coord-input">
            <label>X:</label>
            <input
              type="number"
              id="sensor-${sensor.id}-x"
              min="0"
              max="50"
              value="${sensor.x}"
              onchange="updateSensorValue(${sensor.id}, 'x', this.value)"
              onclick="event.stopPropagation()"
            />
          </div>
          <div class="sensor-coord-input">
            <label>Y:</label>
            <input
              type="number"
              id="sensor-${sensor.id}-y"
              min="0"
              max="50"
              value="${sensor.y}"
              onchange="updateSensorValue(${sensor.id}, 'y', this.value)"
              onclick="event.stopPropagation()"
            />
          </div>
        </div>
      </div>
      <div class="sensor-item-actions">
        <button class="btn-delete-sensor" onclick="deleteSensor(${
          sensor.id
        })">Delete</button>
      </div>
    </div>
  `,
    )
    .join("");

  const addBtn = document.querySelector(".btn-add-sensor");
  if (sensors.length >= MAX_SENSORS) {
    addBtn.disabled = true;
    addBtn.innerText = `✓ Max Sensors Reached (${MAX_SENSORS})`;
  } else {
    addBtn.disabled = false;
    addBtn.innerText = "+ Add Sensor";
  }
}

// --- Close modal when clicking outside ---
window.addEventListener("click", (e) => {
  const modal = document.getElementById("robot-settings-modal");
  if (e.target === modal) {
    closeRobotSettings();
  }
});
