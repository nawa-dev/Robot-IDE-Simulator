// ...existing code...

# 🤖 Robot IDE Simulator

<img width="1919" height="940" alt="image" src="https://github.com/user-attachments/assets/39d0fe29-494f-4955-8ad0-733e7148c2eb" />

A web-based integrated development environment (IDE) for programming robot simulations. Write JavaScript code to control a virtual robot with sensors, motors, and real-time visualization.

![Robot Simulator](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow)

## ✨ Features

- **Live Code Editor** - Monaco Editor with syntax highlighting and autocomplete
- **Robot Simulation** - Real-time 2D robot movement and rotation
- **Sensor System** - Up to 25 light sensors with brightness detection
- **Motor Control** - Left/right motor speed control (0-100)
- **Canvas Design** - Customizable canvas size and background images
- **Project Management** - Export / Import projects as JSON files (⬇️ Download / 📂 Open)
- **Interactive Debugging** - Console output and real-time sensor visualization
- **Drag & Drop** - Move robot on canvas while code is running

## 🚀 Quick Start

### Online Demo

Visit: `https://nawa-dev.github.io/Robot-IDE-Simulator/`

### Local Setup

```bash
# Clone the repository
git clone https://github.com/nawa-dev/Robot-IDE-Simulator.git

# Open in browser
# Double-click index.html or use Live Server
```

**Requirements:**

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation needed!

### Try Sample Project

1. Download `sampleProjectSetup.json` from this repository
2. Open Robot IDE Simulator in your browser
3. Click **📂 Open**
4. Select `sampleProjectSetup.json`
5. Watch the pre-configured project load with:
   - Sample code (Line Following algorithm)
   - 3 pre-positioned sensors
   - Ready-to-run robot configuration

## 📖 How to Use

### 1. Write Code

```javascript
// Control motors
motor(60, 60); // Move forward
delay(1000); // Wait 1 second

// Read sensors
var brightness = analogRead(0); // Read sensor 0
log("Light: " + brightness); // Print to console

// Loop example
while (1) {
  var left = analogRead(0);
  var right = analogRead(2);

  if (left > 500) {
    motor(30, 60); // Turn right
  } else {
    motor(60, 30); // Turn left
  }

  delay(100);
}
```

### 2. Setup Sensors

- Click **⚙ Robot Settings**
- Click **+ Add Sensor**
- Adjust position (X: 0-50, Y: 0-50)
- Sensors detect brightness (0=light, 1024=dark)

### 3. Configure Canvas

- Set Width & Height
- Upload background image for line/maze
- Robot will detect black/white lines

### 4. Run & Debug

- Click **▶ Run** to execute code
- Watch robot move in real-time
- Check **Console** for output
- **Drag robot** to reposition (even while running!)
- Click **■ Stop** to halt execution

### 5. Export / Import Project

- Click **⬇️ Download** to export the current project as a `.json` file
- Click **📂 Open** to import a saved `.json` project

## 🎮 Robot API Reference

### Motor Control

```javascript
motor(left, right);
// left: -100..100 (left motor speed)
// right: -100..100 (right motor speed)
// Example: motor(60, 40) - turn right
```

### Sensor Reading

```javascript
analogRead(index);
// index: 0-24 (sensor number)
// Returns: 0-1024 (brightness value)
// 0 = bright (white), 1024 = dark (black)

var value = analogRead(0);
```

### Utility Functions

```javascript
delay(milliseconds);
// Pause execution (uses interpreter-friendly delay)

getSensorCount();
// Get total number of sensors
// Example: var count = getSensorCount();

log(message);
// Print to console
// Example: log("Sensor value: " + value);
```

## 📚 Example Programs

### 1. Square Movement

```javascript
for (var i = 0; i < 4; i++) {
  motor(60, 60);
  delay(2000);

  motor(60, 20); // Turn right
  delay(1000);
}
motor(0, 0);
```

### 2. Line Following

```javascript
while (1) {
  var left = analogRead(0);
  var center = analogRead(1);
  var right = analogRead(2);

  if (center < 300) {
    motor(60, 60); // Forward
  } else if (left < center) {
    motor(30, 60); // Turn right
  } else {
    motor(60, 30); // Turn left
  }

  delay(50);
}
```

### 3. Obstacle Avoidance

```javascript
while (1) {
  var front = analogRead(1);

  if (front > 600) {
    // Obstacle detected
    motor(0, 0);
    delay(200);
    motor(-50, 50); // Spin right
    delay(800);
  } else {
    motor(60, 60); // Move forward
  }

  delay(100);
}
```

## 📁 Sample Projects

We provide ready-to-use sample projects:

### sampleProjectSetup.json

A complete beginner-friendly project with:

- **Code:** Simple line-following algorithm
- **Sensors:** 3 light sensors positioned for line detection
- **Canvas:** 800x600 default setup
- **Pre-configured:** Just click Open → Load → Run!

**How to use:**

```
1. Click 📂 Open
2. Select sampleProjectSetup.json
3. Click ▶ Run to see it in action
4. Modify code and sensor positions to experiment
```

## 🏗️ Project Structure

```
robotSim/
├── 📂 src/
│   ├── 📄 script.js            # Core initialization & UI handlers
│   ├── 📄 physics.js           # Physics engine & sensor logic
│   ├── 📄 canvas.js            # Canvas rendering management
│   ├── 📄 sensors.js           # Sensor data UI management
│   ├── 📄 executor.js          # Code execution engine
│   ├── 📄 storage.js           # Import/Export functionality
│   └── 📄 acorn_interpreter.js  # JavaScript interpreter engine
├── 📄 index.html               # Entry point HTML
├── 📄 style.css                # Global stylesheet
├── 📄 README.md                # Project documentation
└── 📄 sampleProjectSetup.json  # Sample configuration data
```

## 🐛 Troubleshooting

**Q: Code won't run**

- Check syntax in console
- Make sure `delay()` is used for async operations
- Verify sensor count with `getSensorCount()`

## 🔧 Technologies Used

- **Monaco Editor** - Code editor with syntax highlighting
- **Acorn** - JavaScript parser for syntax validation
- **JS-Interpreter** - Sandboxed JavaScript execution
- **HTML5 Canvas** - Graphics and simulation
- **Vanilla JavaScript** - No frameworks (lightweight)

**Happy Coding! 🚀**

Built with ❤️ for robotics enthusiasts and educators.
