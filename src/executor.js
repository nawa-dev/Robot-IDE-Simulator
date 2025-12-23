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
    statusDiv.innerText = "Status: Code Error";
    return;
  }

  try {
    myInterpreter = new Interpreter(code, initApi);
    isRunning = true;
    statusDiv.innerText = "Status: Running...";

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
  statusDiv.innerText = "Status: Stopped";
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
}
