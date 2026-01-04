/**
 * Code Execution System
 */

// --- Run code ---
function runCode() {
  if (typeof acorn === "undefined") {
    logToConsole("Error: Acorn library is not loaded yet.", "error");
    return;
  }
  autoSaveToWebStorage();
  stopProgram();
  clearConsole();

  const code = editor.getValue();

  try {
    acorn.parse(code, { ecmaVersion: 2020 });
    logToConsole("Syntax check passed. Starting execution...", "info");
  } catch (e) {
    const line = e.loc ? ` (Line ${e.loc.line})` : "";
    logToConsole(`Syntax Error${line}: ${e.message}`, "error");
    // statusDiv.innerText = "Status: Code Error";
    return;
  }

  try {
    myInterpreter = new Interpreter(code, initApi);
    isRunning = true;
    // statusDiv.innerText = "Status: Running...";

    function step() {
      if (isRunning && myInterpreter) {
        try {
          for (let i = 0; i < 50; i++) {
            if (!myInterpreter.step()) {
              stopProgram();
              logToConsole("Program finished.", "info");
              return;
            }
          }
        } catch (e) {
          // ดักจับ Error ตอนรัน เช่น ReferenceError: move is not defined
          logToConsole(`Runtime Error: ${e.message}`, "error");
          stopProgram();
          return; // หยุดการทำงานทันที
        }

        if (isRunning) requestAnimationFrame(step);
      }
    }

    step();
  } catch (e) {
    logToConsole(`Runtime Error: ${e.message}`, "error");
    stopProgram();
  }
}

// --- Stop program ---
function stopProgram() {
  isRunning = false;
  motorL = 0;
  motorR = 0;
  myInterpreter = null;
  // statusDiv.innerText = "Status: Stopped";
}

// --- Reset position ---
function resetPosition() {
  stopProgram();
  robotX = 100;
  robotY = 100;
  angle = 0;
  updateRobotDOM();
  logToConsole("Robot position reset.", "info");
}

// --- 1. ตัวแปรเก็บสถานะปุ่มทั้ง 3 (Index 0=SW1, 1=SW2, 2=SW3) ---
let swStates = [false, false, false];

// รายชื่อ ID ของปุ่มใน HTML (ตรวจสอบให้ตรงกับที่คุณตั้งไว้นะครับ)
const swIds = ["button1", "button2", "button3"];

swIds.forEach((id, index) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("mousedown", () => {
      swStates[index] = true;
      logToConsole(`SW${index + 1} Pressed`); //
    });

    btn.addEventListener("mouseup", () => {
      swStates[index] = false;
    });
    btn.addEventListener("mouseleave", () => {
      swStates[index] = false;
    });
  }
});

// --- Initialize API functions ---
function initApi(interpreter, globalObject) {
  // 1. analogRead(index) — NEW: uses area sampling
  const wrapperAnalogRead = function (index) {
    // Try advanced area-based sampling first
    if (typeof sensorAnalogReadAdvanced === "function") {
      return sensorAnalogReadAdvanced(index, 5); // 5x5 area
    }
    // Fallback to point sampling
    if (index < 0 || index >= sensors.length) {
      return 0;
    }
    const s = sensors[index];
    const localX = s.x - 25;
    const localY = s.y - 25;
    const rad = (angle * Math.PI) / 180;
    const cos_a = Math.cos(rad);
    const sin_a = Math.sin(rad);
    const rotatedX = localX * cos_a - localY * sin_a;
    const rotatedY = localX * sin_a + localY * cos_a;
    const canvasX = robotX + 25 + rotatedX;
    const canvasY = robotY + 25 + rotatedY;
    return getPixelBrightness(canvasX, canvasY);
  };

  interpreter.setProperty(
    globalObject,
    "analogRead",
    interpreter.createNativeFunction(wrapperAnalogRead)
  );

  // 2. getSensorCount()
  const wrapperGetCount = function () {
    return sensors.length;
  };
  interpreter.setProperty(
    globalObject,
    "getSensorCount",
    interpreter.createNativeFunction(wrapperGetCount)
  );

  // 3. motor(l, r) — mapped to differential-drive wheel speeds
  const wrapperMotor = function (l, r) {
    motorL = l;
    motorR = r;

    // NEW: if differential drive exists, set wheel speeds (px/s or normalized)
    if (typeof window.physics !== "undefined" && window.physics) {
      const maxSpeed = 220; // px/s
      // Assume input is -100..100 normalized, convert to px/s
      window.physics.setTargets((l / 100) * maxSpeed, (r / 100) * maxSpeed);
    }
  };

  // 3b. setWheelSpeeds(left, right) — NEW API for differential drive
  const wrapperSetWheelSpeeds = function (left, right) {
    motorL = (left / 220) * 100; // convert px/s back to -100..100
    motorR = (right / 220) * 100;

    if (typeof window.physics !== "undefined" && window.physics) {
      window.physics.setTargets(left, right); // px/s directly
    }
  };
  interpreter.setProperty(
    globalObject,
    "setWheelSpeeds",
    interpreter.createNativeFunction(wrapperSetWheelSpeeds)
  );
  interpreter.setProperty(
    globalObject,
    "motor",
    interpreter.createNativeFunction(wrapperSetWheelSpeeds)
  );
  // 4. log(text)
  const wrapperLog = function (t) {
    logToConsole("User: " + t);
  };
  interpreter.setProperty(
    globalObject,
    "log",
    interpreter.createNativeFunction(wrapperLog)
  );

  // 5. delay(ms)
  const wrapperDelay = function (ms, callback) {
    setTimeout(callback, ms);
  };
  interpreter.setProperty(
    globalObject,
    "delay",
    interpreter.createAsyncFunction(wrapperDelay)
  );

  // 6. SW(n) — switch button read
  const wrapperSW = function (n) {
    const index = n - 1;
    if (index >= 0 && index < swStates.length) {
      return swStates[index];
    }
    return false;
  };
  interpreter.setProperty(
    globalObject,
    "SW",
    interpreter.createNativeFunction(wrapperSW)
  );

  // 7. waitSW(n) — wait for button press
  const wrapperWaitSW = function (n, callback) {
    const index = n - 1;

    function checkButton() {
      if (index >= 0 && index < swStates.length) {
        if (swStates[index]) {
          callback();
        } else {
          setTimeout(checkButton, 20);
        }
      } else {
        callback();
      }
    }

    checkButton();
  };

  interpreter.setProperty(
    globalObject,
    "waitSW",
    interpreter.createAsyncFunction(wrapperWaitSW)
  );
}
