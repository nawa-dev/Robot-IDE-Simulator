# 🤖 Robot IDE Simulator

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
- **Project Management** - Save/Load projects as JSON files
- **Interactive Debugging** - Console output and real-time sensor visualization
- **Drag & Drop** - Move robot on canvas while code is running

## 🚀 Quick Start

### Online Demo
Visit: `https://YOUR_USERNAME.github.io/robotSim/`

### Local Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/robotSim.git
cd robotSim

# Open in browser
# Double-click index.html or use Live Server
```

**Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation needed!

## 📖 How to Use

### 1. Write Code
```javascript
// Control motors
motor(60, 60);  // Move forward
delay(1000);    // Wait 1 second

// Read sensors
var brightness = analogRead(0);  // Read sensor 0
log("Light: " + brightness);     // Print to console

// Loop example
while (1) {
  var left = analogRead(0);
  var right = analogRead(2);
  
  if (left > 500) {
    motor(30, 60);  // Turn right
  } else {
    motor(60, 30);  // Turn left
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

### 5. Save Project
- Click **💾 Save** to save current project
- Click **💾 Save As** to save with new name
- Click **📂 Open** to load saved project

## 🎮 Robot API Reference

### Motor Control
```javascript
motor(left, right)
// left: 0-100 (left motor speed)
// right: 0-100 (right motor speed)
// Example: motor(60, 40) - turn right
```

### Sensor Reading
```javascript
analogRead(index)
// index: 0-24 (sensor number)
// Returns: 0-1024 (brightness value)
// 0 = bright (white), 1024 = dark (black)

var value = analogRead(0);
```

### Utility Functions
```javascript
delay(milliseconds)
// Pause execution
// Example: delay(1000) - wait 1 second

getSensorCount()
// Get total number of sensors
// Example: var count = getSensorCount();

log(message)
// Print to console
// Example: log("Sensor value: " + value);
```

## 📚 Example Programs

### 1. Square Movement
```javascript
for (var i = 0; i < 4; i++) {
  motor(60, 60);
  delay(2000);
  
  motor(60, 20);  // Turn right
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
    motor(60, 60);  // Forward
  } else if (left < center) {
    motor(30, 60);  // Turn right
  } else {
    motor(60, 30);  // Turn left
  }
  
  delay(50);
}
```

### 3. Obstacle Avoidance
```javascript
while (1) {
  var front = analogRead(1);
  
  if (front > 600) {  // Obstacle detected
    motor(0, 0);
    delay(200);
    motor(-50, 50);  // Spin right
    delay(800);
  } else {
    motor(60, 60);  // Move forward
  }
  
  delay(100);
}
```

## 🏗️ Project Structure

```
robotSim/
├── index.html           # Main HTML file
├── style.css            # Stylesheet
├── script.js            # Core initialization
├── physics.js           # Physics & sensor system
├── canvas.js            # Canvas management
├── sensors.js           # Sensor UI management
├── executor.js          # Code execution
├── storage.js           # Save/Load functionality
├── README.md            # This file
└── acorn_interpreter.js # JavaScript interpreter
```

## ⚙️ Customization

### Change Robot Size
Edit in `style.css`:
```css
#robot {
  width: 50px;
  height: 50px;
  /* Adjust size as needed */
}
```

### Adjust Physics Speed
Edit in `executor.js`:
```javascript
for (let i = 0; i < 50; i++) {  // Increase = faster
  if (!myInterpreter.step()) break;
}
```

### Modify Sensor Detection Radius
Edit in `physics.js`:
```javascript
function getPixelBrightness(x, y, radius = 3) {
  // radius = 3 means 7x7 pixel detection area
}
```

## 🐛 Troubleshooting

**Q: Code won't run**
- Check syntax in console
- Make sure `delay()` is used for async operations
- Verify sensor count with `getSensorCount()`

**Q: Sensors not detecting properly**
- Check sensor position (X, Y: 0-50)
- Verify background image is loaded
- Ensure brightness range is correct

**Q: Robot moves too fast/slow**
- Adjust motor speed (0-100)
- Increase/decrease delay time
- Edit step count in `executor.js`

**Q: Can't save projects**
- Use modern browser (Chrome, Firefox)
- Check browser storage permissions
- Try "Save As" instead

## 🔧 Technologies Used

- **Monaco Editor** - Code editor with syntax highlighting
- **Acorn** - JavaScript parser for syntax validation
- **JS-Interpreter** - Sandboxed JavaScript execution
- **HTML5 Canvas** - Graphics and simulation
- **Vanilla JavaScript** - No frameworks (lightweight)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📧 Contact & Support

For questions or support:
- Create an issue on GitHub
- Check existing documentation
- Review example programs

## 🎓 Educational Use

This simulator is perfect for:
- Learning robotics programming
- Understanding sensor input/output
- Teaching control algorithms
- Prototyping robot behavior

## 📦 Project Info

- **Version:** 1.0.0
- **Last Updated:** December 2025
- **Browser Support:** Chrome, Firefox, Safari, Edge
- **File Size:** ~500KB (with CDN libraries)

---

**Happy Coding! 🚀**

Built with ❤️ for robotics enthusiasts and educators.