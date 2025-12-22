/**
 * Canvas & Image Data System
 */

// --- Update canvas image data when background changes ---
function updateCanvasImageData() {
  const canvas = document.createElement("canvas");
  canvas.width = canvasArea.offsetWidth;
  canvas.height = canvasArea.offsetHeight;
  const ctx = canvas.getContext("2d");

  const bgColor = window
    .getComputedStyle(canvasArea)
    .getPropertyValue("background-color");
  ctx.fillStyle = bgColor || "#f0f0f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgImage = window
    .getComputedStyle(canvasArea)
    .getPropertyValue("background-image");
  if (bgImage && bgImage !== "none") {
    try {
      const imageUrl = bgImage.match(/url\(["']?(.+?)["']?\)/)[1];
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvasPixelData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;
        logToConsole("Canvas image data updated.", "info");
      };
      img.onerror = () => {
        logToConsole("Failed to load background image, using default.", "info");
        canvasPixelData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;
      };
      img.src = imageUrl;
    } catch (e) {
      logToConsole("Error parsing background image URL.", "info");
      canvasPixelData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;
    }
  } else {
    canvasPixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    logToConsole("Using default canvas background.", "info");
  }
}

// --- Update canvas size ---
function updateCanvasSize() {
  canvasArea.style.width = document.getElementById("canvas-w").value + "px";
  canvasArea.style.height = document.getElementById("canvas-h").value + "px";
  updateCanvasImageData();
}

// --- Handle map change ---
function handleMapChange(select) {
  if (select.value === "upload") {
    document.getElementById("map-upload").click();
  } else {
    canvasArea.style.backgroundImage = "none";
    canvasArea.style.backgroundColor = "#f0f0f0";
    updateCanvasImageData();
  }
}

// --- Load map file ---
function loadMapFile(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      canvasArea.style.backgroundImage = `url('${e.target.result}')`;
      canvasArea.style.backgroundColor = "transparent";
      logToConsole("New map loaded successfully.");
      setTimeout(updateCanvasImageData, 100);
    };
    reader.readAsDataURL(input.files[0]);
  }
}
