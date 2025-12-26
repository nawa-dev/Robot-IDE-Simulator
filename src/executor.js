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
  // 1. analogRead(index)
  const wrapperAnalogRead = function (index) {
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

    const brightness = getPixelBrightness(canvasX, canvasY);

    return brightness;
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

  // 3. motor(l, r)
  const wrapperMotor = function (l, r) {
    motorL = l;
    motorR = r;
  };
  interpreter.setProperty(
    globalObject,
    "motor",
    interpreter.createNativeFunction(wrapperMotor)
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
  const wrapperSW = function (n) {
    const index = n - 1; // แปลงจาก 1-based เป็น 0-based array
    if (index >= 0 && index < swStates.length) {
      return swStates[index]; // คืนค่า true/false ทันที
    }
    return false;
  };
  interpreter.setProperty(
    globalObject,
    "SW",
    interpreter.createNativeFunction(wrapperSW)
  );
  // ฟังก์ชัน waitSW(n) - รอจนกว่าปุ่ม n จะถูกกด
  const wrapperWaitSW = function (n, callback) {
    const index = n - 1; // แปลง 1-based เป็น 0-based

    // ฟังก์ชันตรวจสอบสถานะปุ่มภายใน
    function checkButton() {
      if (index >= 0 && index < swStates.length) {
        if (swStates[index]) {
          // ถ้าปุ่มถูกกด (true) ให้เรียก callback เพื่อรันบรรทัดถัดไป
          callback();
        } else {
          // ถ้ายังไม่กด ให้รอ 20ms แล้วกลับมาเช็คใหม่ (Polling)
          setTimeout(checkButton, 20);
        }
      } else {
        // หากระบุ index ผิด ให้รันต่อทันทีเพื่อป้องกันโปรแกรมค้าง
        callback();
      }
    }

    checkButton(); // เริ่มต้นการตรวจสอบรอบแรก
  };

  // ลงทะเบียนเป็น AsyncFunction เพื่อให้ Interpreter หยุดรอได้
  interpreter.setProperty(
    globalObject,
    "waitSW",
    interpreter.createAsyncFunction(wrapperWaitSW)
  );
}
