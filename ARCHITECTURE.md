# ROBO-JS Architecture Documentation

## Project Overview
ROBO-JS is a web-based robot simulator that allows users to write JavaScript code to control a simulated robot with various sensors and actuators.

---

## File Structure & Dependencies

```
robotSim/
├── index.html              # Main HTML entry point
├── style.css               # Styling
├── src/
│   ├── acorn.min.js        # JavaScript parser library
│   ├── canvas.js           # Canvas rendering and robot visualization
│   ├── executor.js         # Code execution engine
│   ├── physics.js          # Physics simulation
│   ├── sensors.js          # Sensor management
│   ├── storage.js          # LocalStorage/WebStorage management
│   ├── script.js           # Main application logic
│   ├── main.js             # [Not currently used]
│   └── img/                # Image assets
```

---

## Module Dependencies Map

```
index.html
├── style.css
├── acorn.min.js (External)
├── acorn_interpreter.js (External CDN)
├── monaco-editor (External CDN)
└── Script Load Order:
    1. physics.js
    2. canvas.js
    3. sensors.js
    4. executor.js
    5. storage.js
    6. script.js
```

---

## Detailed Function Reference

### 1. **physics.js** - Physics Simulation Engine

**Purpose:** Handles robot movement, collision detection, and physics calculations

**Functions:**

| Function | Parameters | Returns | Status | Usage |
|----------|-----------|---------|--------|-------|
| `initPhysics()` | none | void | Active | Initializes physics system |
| `updatePhysics(deltaTime)` | number | void | Active | Updates physics state each frame |
| `setRobotVelocity(vx, vy)` | number, number | void | Active | Sets robot velocity |
| `getRobotPosition()` | none | {x, y} | Active | Gets current robot position |
| `checkCollision(x, y)` | number, number | boolean | Active | Checks if position collides with obstacles |
| `applyFriction(velocity)` | number | number | Active | Applies friction to movement |

**Global Variables:**
- `robotPhysics` - Physics state object
- `gravity` - Physics gravity constant
- `friction` - Friction coefficient

---

### 2. **canvas.js** - Rendering & Visualization

**Purpose:** Manages canvas drawing, robot visualization, and map rendering

**Functions:**

| Function | Parameters | Returns | Status | Usage |
|----------|-----------|---------|--------|-------|
| `initCanvas()` | none | void | Active | Initializes canvas and canvas context |
| `drawRobot()` | none | void | Active | Draws robot on canvas |
| `drawMap()` | none | void | Active | Draws map/obstacles on canvas |
| `clearCanvas()` | none | void | Active | Clears canvas for redraw |
| `updateCanvasSize()` | none | void | Active | Updates canvas size from input values |
| `drawSensors()` | none | void | Active | Draws sensor visualization |
| `drawGrid()` | none | void | Active | Draws optional grid on canvas |
| `setMapImage(imageData)` | ImageData/Image | void | Active | Sets background map image |
| `getCanvasContext()` | none | CanvasRenderingContext2D | Active | Returns canvas 2D context |

**Global Variables:**
- `canvas` - Canvas element reference
- `ctx` - Canvas 2D context
- `canvasWidth`, `canvasHeight` - Canvas dimensions
- `currentMap` - Current map image/data

---

### 3. **sensors.js** - Sensor Management

**Purpose:** Manages robot sensors (light sensors, distance sensors, buttons)

**Functions:**

| Function | Parameters | Returns | Status | Usage |
|----------|-----------|---------|--------|-------|
| `initSensors()` | none | void | Active | Initializes sensor system |
| `addSensor(config)` | {x, y, angle, type} | Sensor | Active | Adds new sensor to robot |
| `removeSensor(sensorId)` | string | void | Active | Removes sensor by ID |
| `updateSensors()` | none | void | Active | Updates all sensor readings |
| `getSensorValue(sensorId)` | string | number | Active | Gets current sensor reading |
| `getSensorList()` | none | Sensor[] | Active | Returns all sensors |
| `setSensorValue(sensorId, value)` | string, number | void | Active | Sets sensor value (for testing) |
| `addSensorToList()` | none | void | Active | UI function to add sensor |
| `removeSensorFromUI(sensorId)` | string | void | Active | UI function to remove sensor |
| `updateSensorPreview()` | none | void | Active | Updates sensor preview visualization |

**Global Variables:**
- `sensors` - Array of sensor objects
- `sensorConfig` - Sensor configuration object
- `sensorPreview` - Preview SVG element

---

### 4. **executor.js** - Code Execution Engine

**Purpose:** Interprets and executes user-written JavaScript code

**Functions:**

| Function | Parameters | Returns | Status | Usage |
|----------|-----------|---------|--------|-------|
| `runCode()` | none | void | Active | Executes code from editor |
| `stopProgram()` | none | void | Active | Stops currently running program |
| `executeStep()` | none | void | Active | Executes one step of code |
| `initInterpreter(code)` | string | Interpreter | Active | Initializes JS-Interpreter |
| `getVariable(name)` | string | any | Active | Gets variable from execution context |
| `setVariable(name, value)` | string, any | void | Active | Sets variable in execution context |
| `callFunction(funcName, args)` | string, any[] | any | Active | Calls function in interpreter |
| `executeAsync(code)` | string | Promise | Active | Executes code asynchronously |

**Global Variables:**
- `interpreter` - JS-Interpreter instance
- `isRunning` - Program execution state
- `executionSpeed` - Execution speed multiplier

---

### 5. **storage.js** - Data Persistence

**Purpose:** Manages saving and loading projects from LocalStorage/WebStorage

**Functions:**

| Function | Parameters | Returns | Status | Usage |
|----------|-----------|---------|--------|-------|
| `saveToWebStorage()` | none | void | Active | Saves current project to localStorage |
| `loadFromWebStorage()` | none | void | Active | Loads project from localStorage |
| `saveProjectAs()` | none | void | Active | Exports project as JSON file |
| `loadProject(fileInput)` | HTMLInputElement | void | Active | Loads project from file |
| `newProject()` | none | void | Active | Creates new project (clears everything) |
| `openProject()` | none | void | Active | Opens file dialog to load project |
| `clearStorage()` | none | void | Active | Clears localStorage |
| `getStorageData()` | none | {code, sensors, robot} | Active | Gets all stored data |
| `setStorageData(data)` | object | void | Active | Sets storage data |

**Global Variables:**
- `STORAGE_KEY` - LocalStorage key constant
- `projectData` - Current project data object

---

### 6. **script.js** - Main Application Logic

**Purpose:** Core application controller, integrates all modules

**Functions:**

| Function | Parameters | Returns | Status | Usage |
|----------|-----------|---------|--------|-------|
| `initApp()` | none | void | Active | Initializes entire application |
| `setupEventListeners()` | none | void | Active | Sets up all event listeners |
| `runCode()` | none | void | Active | Entry point for running code |
| `stopProgram()` | none | void | Active | Stops program execution |
| `resetPosition()` | none | void | Active | Resets robot to initial position |
| `updateRobotAngle(angle)` | number | void | Active | Updates robot rotation angle |
| `handleAngleInput(value)` | number | void | Active | Handles angle input from UI |
| `updateCanvasSize()` | none | void | Active | Updates canvas dimensions |
| `handleMapSelectChange(select)` | HTMLSelectElement | void | Active | Handles map selection change |
| `loadMapFile(fileInput)` | HTMLInputElement | void | Active | Loads map image from file |
| `openRobotSettings()` | none | void | Active | Opens sensor settings modal |
| `closeRobotSettings()` | none | void | Active | Closes sensor settings modal |
| `clearConsole()` | none | void | Active | Clears console output |
| `log(message)` | any | void | Active | Logs message to console |
| `consoleLog()` | none | void | Active | Override console.log |

**Global Variables:**
- `robot` - Robot DOM element
- `canvas` - Canvas element reference
- `editor` - Monaco editor instance
- `isRunning` - Execution state flag

---

### 7. **main.js** - [UNUSED]

**Status:** ❌ Not currently used in the project

**Note:** This file appears to be legacy or placeholder code. The functionality is handled by `script.js` instead.

---

## API Reference for Robot Control

### Common User Functions (Available in Code Editor)

```javascript
// Movement
forward(speed)          // Move robot forward
backward(speed)         // Move robot backward
stop()                  // Stop robot movement
turnLeft(angle)         // Rotate left by angle
turnRight(angle)        // Rotate right by angle

// Sensors
readSensor(id)          // Read sensor value
getSensorValue(id)      // Get current sensor reading

// Output
digitalWrite(pin, value) // Write digital output
analogWrite(pin, value)  // Write analog output

// Control
delay(ms)               // Wait milliseconds
print(message)          // Print to console
```

---

## Data Flow Diagram

```
User Code (Editor)
        ↓
   executor.js (Parse & Execute)
        ↓
   ┌────┴────┬────────┬─────────┐
   ↓        ↓        ↓         ↓
canvas.js physics.js sensors.js storage.js
   ↓        ↓        ↓         ↓
 Render   Update   Read      Save
        ↓
    DOM Display
```

---

## Function Call Chain Examples

### Running Code Flow:
```
runCode() [script.js]
    ↓
executor.js: initInterpreter()
    ↓
executor.js: executeStep()
    ↓ (each step)
physics.js: updatePhysics()
sensors.js: updateSensors()
canvas.js: drawRobot()
canvas.js: clearCanvas()
```

### Saving Project Flow:
```
saveProjectAs() [storage.js]
    ↓
getStorageData() [storage.js]
    ↓ (gathers)
editor.getValue() [monaco]
getSensorList() [sensors.js]
getRobotPosition() [physics.js]
    ↓
Export as JSON
    ↓
Download file
```

---

## Active Functions Summary

**Total Active Functions:** ~50+

**By Module:**
- physics.js: 6 functions
- canvas.js: 8 functions
- sensors.js: 10 functions
- executor.js: 8 functions
- storage.js: 9 functions
- script.js: 15+ functions

---

## Unused/Inactive Functions

**main.js** - Entire file (status: UNUSED)

---

## Configuration & Constants

### From index.html:
- Canvas default size: 800x600
- Maximum sensors: 25
- Language: Thai (th)

### External Libraries:
- Monaco Editor v0.44.0 (Code editor)
- Acorn (JavaScript parser)
- JS-Interpreter (Sandboxed code execution)
- Font Awesome 6.4.2 (Icons)

---

## Notes for Development

1. **Module Load Order Matters:** Physics → Canvas → Sensors → Executor → Storage → Script
2. **Storage:** Auto-saves to localStorage on changes
3. **Execution:** Code runs in sandboxed interpreter (JS-Interpreter)
4. **Rendering:** Continuous canvas redraw at ~60 FPS
5. **Sensors:** Can have up to 25 sensors on robot
6. **Maps:** Can load custom images as backgrounds

---

**Last Updated:** January 17, 2026
**Project:** ROBO-JS v1.0
