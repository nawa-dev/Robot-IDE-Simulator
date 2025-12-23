/**
 * Physics & Sensor System
 */

// --- Robot Physics & Collision ---
function updatePhysics() {
  if (isRunning && !isDragging) {
    const rad = angle * (Math.PI / 180);
    const speed = (motorL + motorR) / 100;
    const turnSpeed = (motorL - motorR) * 0.05;

    let nextX = robotX + speed * Math.cos(rad);
    let nextY = robotY + speed * Math.sin(rad);
    angle += turnSpeed;

    if (
      nextX < 0 ||
      nextX > canvasArea.offsetWidth - 50 ||
      nextY < 0 ||
      nextY > canvasArea.offsetHeight - 50
    ) {
      stopProgram();
      logToConsole("Collision Error: Robot hit the wall!", "error");
    } else {
      robotX = nextX;
      robotY = nextY;
    }
    updateRobotDOM();
  }
  requestAnimationFrame(updatePhysics);
}

// --- Sensor Dot Rendering ---
function updateSensorDots() {
  const oldDots = document.querySelectorAll(".sensor-dot");
  oldDots.forEach((dot) => dot.remove());

  sensors.forEach((sensor, index) => {
    const dot = document.createElement("div");
    dot.className = "sensor-dot";

    const localX = sensor.x - 25;
    const localY = sensor.y - 25;

    const rad = (angle * Math.PI) / 180;
    const cos_a = Math.cos(rad);
    const sin_a = Math.sin(rad);

    const rotatedX = localX * cos_a - localY * sin_a;
    const rotatedY = localX * sin_a + localY * cos_a;

    const canvasX = robotX + 25 + rotatedX;
    const canvasY = robotY + 25 + rotatedY;

    dot.style.left = canvasX + "px";
    dot.style.top = canvasY + "px";

    let brightness = 512;
    if (canvasPixelData) {
      brightness = getPixelBrightness(canvasX, canvasY);
    }

    dot.title = `${sensor.name} [${index}]\n(${sensor.x.toFixed(
      1
    )}, ${sensor.y.toFixed(1)})\nBrightness: ${brightness}`;
    dot.dataset.sensorId = sensor.id;
    dot.dataset.sensorIndex = index;

    canvasArea.appendChild(dot);
  });
}

// --- Get Pixel Brightness ---
function getPixelBrightness(x, y) {
  if (!canvasPixelData) return 512;

  const pixelX = Math.round(x);
  const pixelY = Math.round(y);

  if (
    pixelX < 0 ||
    pixelX >= canvasArea.offsetWidth ||
    pixelY < 0 ||
    pixelY >= canvasArea.offsetHeight
  ) {
    return 512;
  }

  const imageWidth = canvasArea.offsetWidth;
  const pixelIndex = (pixelY * imageWidth + pixelX) * 4;

  if (pixelIndex + 2 >= canvasPixelData.length) {
    return 512;
  }

  const r = canvasPixelData[pixelIndex];
  const g = canvasPixelData[pixelIndex + 1];
  const b = canvasPixelData[pixelIndex + 2];

  const brightness = (r + g + b) / 3;

  return Math.round((255 - brightness) * 4);
}
