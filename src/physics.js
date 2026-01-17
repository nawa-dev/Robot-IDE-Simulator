/**
 * Physics & Sensor System (Improved with DifferentialDrive)
 */

// --- 1. DifferentialDrive Engine ---
// ทำหน้าที่คำนวณจลนศาสตร์และความเร่งของมอเตอร์

function DifferentialDrive(opts) {
  opts = opts || {};
  this.wheelBase = opts.wheelBase || 40; // ระยะห่างระหว่างล้อ (px)
  this.maxAccel = opts.maxAccel || 300; // ความเร่งสูงสุด (px/s^2)
  this.maxSpeed = opts.maxSpeed || 250; // ความเร็วสูงสุด (px/s)

  // ⭐️ ระยะจากจุดกึ่งกลางหุ่นยนต์ไปถึงเพลาล้อ (px)
  // เช่น 15 คือ ล้ออยู่ค่อนไปข้างหน้า 15px จากจุดศูนย์กลาง
  this.axisOffset = opts.axisOffset || 0;

  this.left = { target: 0, current: 0 };
  this.right = { target: 0, current: 0 };
}

DifferentialDrive.prototype.setTargets = function (vL, vR) {
  this.left.target = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, vL));
  this.right.target = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, vR));
};

DifferentialDrive.prototype.step = function (pose, dt) {
  if (!dt || dt <= 0) return;

  const limit = this.maxAccel * dt;
  const updateWheel = (m) => {
    const diff = m.target - m.current;
    if (Math.abs(diff) <= limit) m.current = m.target;
    else m.current += Math.sign(diff) * limit;
    return m.current;
  };

  const vL = updateWheel(this.left);
  const vR = updateWheel(this.right);

  const v = 0.5 * (vR + vL);
  const omega = (vR - vL) / this.wheelBase;

  // คำนวณการเคลื่อนที่ของจุดกึ่งกลางเพลาล้อ (Axis Center)
  pose.x += v * Math.cos(pose.theta) * dt;
  pose.y += v * Math.sin(pose.theta) * dt;
  pose.theta += omega * dt;

  pose.theta = ((pose.theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
};

// สร้าง Instance สำหรับใช้งาน
const robotDrive = new DifferentialDrive({
  wheelBase: 42,
  maxAccel: 400,
  axisOffset: motorPos, // <--- ปรับตำแหน่งล้อตรงนี้
});
let lastPhysicTime = 0;

// --- 2. Main Physics Loop ---
function updatePhysics(timestamp) {
  if (isRunning && !isDragging) {
    // คำนวณ Delta Time (วินาที)
    if (!lastPhysicTime) lastPhysicTime = timestamp;
    const dt = (timestamp - lastPhysicTime) / 1000;
    lastPhysicTime = timestamp;

    // ตั้งค่าความเร็วมอเตอร์ (คูณตัวคูณเพื่อความเร็วที่เหมาะสมใน Simulator)
    robotDrive.setTargets(motorL * 2.5, motorR * 2.5);

    // เตรียมสถานะปัจจุบัน (แปลงจาก Global Variables)
    let pose = {
      x: robotX + 25 + motorPos * Math.cos((angle * Math.PI) / 180),
      y: robotY + 25 + motorPos * Math.sin((angle * Math.PI) / 180),
      theta: angle * (Math.PI / 180),
    };

    // คำนวณ Step ถัดไป
    robotDrive.step(pose, dt);
    // แปลงกลับจาก "กึ่งกลางเพลาล้อ" มาเป็น "มุมบนซ้ายของหุ่นยนต์ (robotX, robotY)"
    const newCenterX = pose.x - motorPos * Math.cos(pose.theta);
    const newCenterY = pose.y - motorPos * Math.sin(pose.theta);
    // ตรวจสอบการชนขอบจอ (Collision Detection)
    const nextX = newCenterX - 25;
    const nextY = newCenterY - 25;

    if (
      nextX < 0 ||
      nextX > canvasArea.offsetWidth - 50 ||
      nextY < 0 ||
      nextY > canvasArea.offsetHeight - 50
    ) {
      stopProgram();
      logToConsole("Collision Error: Robot hit the wall!", "error");
    } else {
      // อัปเดตค่ากลับไปยัง Global Variables
      robotX = nextX;
      robotY = nextY;
      angle = pose.theta * (180 / Math.PI);
    }

    updateRobotDOM();
  } else {
    // Reset เวลาเมื่อหยุดรัน เพื่อไม่ให้หุ่นยนต์ "วาร์ป" เมื่อกลับมารันใหม่
    lastPhysicTime = 0;
  }
  requestAnimationFrame(updatePhysics);
}

// --- 3. Sensor Management ---
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

    dot.title = `${sensor.name} [${index}]\nBrightness: ${brightness}`;
    dot.dataset.sensorId = sensor.id;

    canvasArea.appendChild(dot);
  });
}

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

  if (pixelIndex + 2 >= canvasPixelData.length) return 512;

  const r = canvasPixelData[pixelIndex];
  const g = canvasPixelData[pixelIndex + 1];
  const b = canvasPixelData[pixelIndex + 2];

  // ค่าความสว่างเฉลี่ย
  const brightness = (r + g + b) / 3;
  // แปลงค่า: 0 (ขาว) -> 1024 (ดำ) เพื่อให้เหมาะกับการเขียนโปรแกรมเดินตามเส้น
  return Math.round((255 - brightness) * 4);
}
