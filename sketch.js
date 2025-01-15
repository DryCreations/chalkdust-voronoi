let points = [];
let colors = []; // Store cell colors
let colorIndexes = [];
let layers = {
  coloredTiles: true,
  coloredTilesShadow: false,
  coloredTilesScreen: false,
  dots: true,
  dotsShadow: false,
  dotsScreen: false,
  delaunayCircles: true,
  delaunayCirclesShadow: false,
  delaunayCirclesScreen: false,
  delaunay: true,
  delaunayShadow: false,
  delaunayScreen: false,
  voronoiEdges: true,
  voronoiEdgesShadow: false,
  voronoiEdgesScreen: false,
  voronoiFilled: true,
  voronoiFilledShadow: false,
  voronoiFilledScreen: false
};
let currentEditingLayer = 'coloredTiles';
let exportScale = 1;
let width = 800, height = 800;
let selectedDotIndex = null;
let offsetX = 0;
let offsetY = 0;
let filledCells = [];
let buffers = {};

function setup() {
  createCanvas(width, height);
  noStroke()
  const container = document.getElementById('canvas-container');

  // Initialize buffers for each layer
  buffers.coloredTiles = createGraphics(width, height);
  buffers.coloredTilesShadow = createGraphics(width, height);
  buffers.coloredTilesScreen = createGraphics(width, height);
  buffers.dots = createGraphics(width, height);
  buffers.dotsShadow = createGraphics(width, height);
  buffers.dotsScreen = createGraphics(width, height);
  buffers.delaunayCircles = createGraphics(width, height);
  buffers.delaunayCirclesShadow = createGraphics(width, height);
  buffers.delaunayCirclesScreen = createGraphics(width, height);
  buffers.delaunay = createGraphics(width, height);
  buffers.delaunayShadow = createGraphics(width, height);
  buffers.delaunayScreen = createGraphics(width, height);
  buffers.voronoiEdges = createGraphics(width, height);
  buffers.voronoiEdgesShadow = createGraphics(width, height);
  buffers.voronoiEdgesScreen = createGraphics(width, height);
  buffers.voronoiFilled = createGraphics(width, height);
  buffers.voronoiFilledShadow = createGraphics(width, height);
  buffers.voronoiFilledScreen = createGraphics(width, height);

  // Initialize event listeners
  document.getElementById('generateNewPointsButton').addEventListener('click', generateRandomPoints);
  document.getElementById('exportImageButton').addEventListener('click', exportImage);
  document.getElementById('layerColoredTiles').addEventListener('change', (e) => layers.coloredTiles = e.target.checked);
  document.getElementById('layerDots').addEventListener('change', (e) => layers.dots = e.target.checked);
  document.getElementById('layerDelaunayCircles').addEventListener('change', (e) => layers.delaunayCircles = e.target.checked);
  document.getElementById('layerDelaunay').addEventListener('change', (e) => layers.delaunay = e.target.checked);
  document.getElementById('layerVoronoi').addEventListener('change', (e) => layers.voronoiEdges = e.target.checked);
  document.getElementById('layerVoronoiFilled').addEventListener('change', (e) => layers.voronoiFilled = e.target.checked);
  document.getElementById('editingLayer').addEventListener('change', (e) => currentEditingLayer = e.target.value);
  document.getElementById('exportSize').addEventListener('change', (e) => exportScale = parseInt(e.target.value));

  // New layer event listeners for shadows and screens
  ['coloredTiles', 'dots', 'delaunayCircles', 'delaunay', 'voronoiEdges', 'voronoiFilled'].forEach(layer => {
    const capitalizeLayer = capitalize(layer);

    // Shadow controls
    const shadowToggle = document.getElementById(`layer${capitalizeLayer}Shadow`);
    const shadowColorInput = document.getElementById(`layer${capitalizeLayer}ShadowColor`);
    const shadowOpacityInput = document.getElementById(`layer${capitalizeLayer}ShadowOpacity`);

    shadowToggle.addEventListener('change', (e) => layers[`${layer}Shadow`] = e.target.checked);
    shadowColorInput.addEventListener('input', (e) => layers[`${layer}ShadowColor`] = e.target.value.trim());
    shadowOpacityInput.addEventListener('change', (e) => layers[`${layer}ShadowOpacity`] = parseInt(e.target.value) || 128);

    // Screen controls
    const screenToggle = document.getElementById(`layer${capitalizeLayer}Screen`);
    const screenColorInput = document.getElementById(`layer${capitalizeLayer}ScreenColor`);
    const screenOpacityInput = document.getElementById(`layer${capitalizeLayer}ScreenOpacity`);

    screenToggle.addEventListener('change', (e) => layers[`${layer}Screen`] = e.target.checked);
    screenColorInput.addEventListener('input', (e) => layers[`${layer}ScreenColor`] = e.target.value.trim());
    screenOpacityInput.addEventListener('change', (e) => layers[`${layer}ScreenOpacity`] = parseInt(e.target.value) || 128);
  });

  generateRandomPoints();
}

// Helper function to capitalize layer names
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTilePalette() {
  let raw = document.getElementById('tileColorsInput').value || '#FD5901, #F78104, #FAAB36, #249EA0, #008083, #005F60';
  return raw.split(',').map(c => c.trim());
}

function getVoronoiEdgeColor() {
  return (document.getElementById('edgeColorInput').value || '#000000').trim();
}

function getDelaunayEdgeColor() {
  return (document.getElementById('delaunayEdgeColorInput').value || '#249EA0').trim(); // Changed to allowed color
}

function getDelaunayCircleColor() {
  return (document.getElementById('delaunayCircleColorInput').value || '#249EA0').trim(); // Ensured to be allowed color
}

function getVoronoiFillColor() {
  return (document.getElementById('voronoiFillColorInput').value || '#FFFFFF').trim();
}

function getEdgeTransparency() {
  return parseInt(document.getElementById('edgeTransparencyInput').value) || 255;
}

function getEdgeWeight() {
  return parseInt(document.getElementById('edgeWeightInput').value) || 1;
}

function getDelaunayEdgeTransparency() {
  return parseInt(document.getElementById('delaunayEdgeTransparencyInput').value) || 255;
}

function getDelaunayEdgeWeight() {
  return parseInt(document.getElementById('delaunayEdgeWeightInput').value) || 1;
}

function getDelaunayCircleTransparency() {
  return parseInt(document.getElementById('delaunayCircleTransparencyInput').value) || 255;
}

function getDelaunayCircleWeight() {
  return parseInt(document.getElementById('delaunayCircleWeightInput').value) || 1;
}

function getVoronoiFillTransparency() {
  return parseInt(document.getElementById('voronoiFillTransparencyInput').value) || 255;
}

function getVoronoiFillWeight() {
  return parseInt(document.getElementById('voronoiFillWeightInput').value) || 1;
}

function getDotsColor() {
  return (document.getElementById('dotsColorInput').value || '#FD5901').trim();
}

function getDotsTransparency() {
  return parseInt(document.getElementById('dotsTransparencyInput').value) || 255;
}

function getDotsWeight() {
  return parseInt(document.getElementById('dotsWeightInput').value) || 1;
}

function getBlurAmount(layer) {
  return parseInt(document.getElementById(`${layer}BlurInput`).value) || 0;
}

function getThresholdAmount(layer) {
  return parseInt(document.getElementById(`${layer}ThresholdInput`).value) || 128;
}

function applyBlurAndThreshold(buffer, layer) {
  let blurAmount = getBlurAmount(layer);
  let thresholdAmount = getThresholdAmount(layer);

  if (blurAmount > 0) {
    buffer.filter(BLUR, blurAmount);
  }

  buffer.loadPixels();
  let fillColor;
  if (layer === 'coloredTiles') {
    fillColor = color(getTilePalette()[0]);
  } else if (layer === 'dots') {
    fillColor = color(getDotsColor());
  } else if (layer === 'delaunayCircles') {
    fillColor = color(getDelaunayCircleColor());
  } else if (layer === 'delaunay') {
    fillColor = color(getDelaunayEdgeColor());
  } else if (layer === 'voronoiEdges') {
    fillColor = color(getVoronoiEdgeColor());
  } else if (layer === 'voronoiFilled') {
    fillColor = color(getVoronoiFillColor());
  }
  let r = fillColor.levels[0];
  let g = fillColor.levels[1];
  let b = fillColor.levels[2];

  for (let i = 0; i < buffer.pixels.length; i += 4) {
    let alpha = buffer.pixels[i + 3];
    if (alpha > thresholdAmount) {
      buffer.pixels[i] = r;
      buffer.pixels[i + 1] = g;
      buffer.pixels[i + 2] = b;
      buffer.pixels[i + 3] = 255;
    } else {
      buffer.pixels[i] = r;
      buffer.pixels[i + 1] = g;
      buffer.pixels[i + 2] = b;
      buffer.pixels[i + 3] = 0;
    }
  }
  buffer.updatePixels();
}

function isMouseInCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function draw() {
  background(255, 255, 255, 0); // Fully transparent background
  let delaunay = d3.Delaunay.from(points);
  let voronoi = delaunay.voronoi([0, 0, width, height]);

  ['coloredTiles', 'dots', 'delaunayCircles', 'delaunay', 'voronoiEdges', 'voronoiFilled'].forEach(layer => {
    // Render main layer
    if (layers[layer]) {
      if (layer === 'coloredTiles') {
        drawColoredTiles(voronoi, buffers.coloredTiles);
        // applyBlurAndThreshold(buffers.coloredTiles, 'coloredTiles');
        tint(255, getEdgeTransparency());
        image(buffers.coloredTiles, 0, 0);
      }
      if (layer === 'dots') {
        drawDots(buffers.dots);
        applyBlurAndThreshold(buffers.dots, 'dots');
        tint(255, getDotsTransparency());
        image(buffers.dots, 0, 0);
      }
      if (layer === 'delaunayCircles') {
        drawDelaunayCircles(delaunay, buffers.delaunayCircles);
        applyBlurAndThreshold(buffers.delaunayCircles, 'delaunayCircles');
        tint(255, getDelaunayCircleTransparency());
        image(buffers.delaunayCircles, 0, 0);
      }
      if (layer === 'delaunay') {
        drawDelaunay(delaunay, buffers.delaunay);
        applyBlurAndThreshold(buffers.delaunay, 'delaunay');
        tint(255, getDelaunayEdgeTransparency());
        image(buffers.delaunay, 0, 0);
      }
  
      if (layer === 'voronoiEdges') {
        drawVoronoiEdges(voronoi, buffers.voronoiEdges);
        applyBlurAndThreshold(buffers.voronoiEdges, 'voronoiEdges');
        tint(255, getEdgeTransparency());
        image(buffers.voronoiEdges, 0, 0);
      }
      if (layer === 'voronoiFilled') {
        drawVoronoiEdges(voronoi, buffers.voronoiEdges);
        applyBlurAndThreshold(buffers.voronoiEdges, 'voronoiEdges');
        drawVoronoiFilled(voronoi, buffers.voronoiFilled);
        buffers.voronoiFilled.noStroke();
        buffers.voronoiFilled.image(buffers.voronoiEdges, 0, 0);
        applyBlurAndThreshold(buffers.voronoiFilled, 'voronoiFilled');
        tint(255, getVoronoiFillTransparency());
        image(buffers.voronoiFilled, 0, 0);
      }
    }

    // Render screen
    if (layers[`${layer}Screen`]) {
      buffers[`${layer}Screen`].clear();

      let sc = getScreenColor(layer); // returns a string like '#FFFFFF'
      let so = getScreenOpacity(layer); // returns a number like 128
      let c = color(sc);
      c.setAlpha(so);
      buffers[`${layer}Screen`].background(c);

      // Blend mode so the screen layer doesn’t override color below
      push();
      blendMode(SCREEN);
      buffers[`${layer}Screen`].tint(255, so);
      image(buffers[`${layer}Screen`], 0, 0);
      pop();
    }

    // Render shadow
    if (layers[`${layer}Shadow`]) {
      buffers[`${layer}Shadow`].clear();
      buffers[`${layer}Shadow`].image(buffers[layer], 0, 0);
      buffers[`${layer}Shadow`].filter(BLUR, getShadowBlur(layer));
      // Optionally apply a threshold here with your existing logic:
      // applyBlurAndThreshold(buffers[`${layer}Shadow`], `${layer}Shadow`);
      buffers[`${layer}Shadow`].tint(255, getShadowOpacity(layer));
      image(buffers[`${layer}Shadow`], 0, 0);
    }
  });
}

function generateRandomPoints() {
  points = [];
  colorIndexes = [];
  let numPoints = parseInt(document.getElementById('numPointsInput').value) || 10;
  let palette = getTilePalette();
  for (let i = 0; i < numPoints; i++) {
    points.push([Math.random() * width, Math.random() * height]);
    // Assign a random index from the palette
    colorIndexes.push(floor(random(palette.length)));
  }
  draw();
}

function drawColoredTiles(voronoi, buffer) {
  buffer.clear();
  buffer.push();
  let palette = getTilePalette();
  for (let i = 0; i < points.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
    buffer.fill(palette[colorIndexes[i]] || '#FAAB36'); // Changed fallback color to allowed color
    buffer.noStroke();
    buffer.beginShape();
    polygon.forEach(([x, y]) => buffer.vertex(x, y));
    buffer.endShape(CLOSE);
  }
  buffer.pop();
}

function drawDots(buffer) {
  buffer.clear();
  buffer.push();
  let dotColor = color(getDotsColor());
  let weight = getDotsWeight();
  buffer.fill(dotColor.levels[0], dotColor.levels[1], dotColor.levels[2], 255);
  buffer.noStroke();
  for (let [x, y] of points) {
    buffer.ellipse(x, y, weight, weight);
  }
  buffer.pop();
}

function drawDelaunay(delaunay, buffer) {
  buffer.clear();
  buffer.push();
  let edgeColor = color(getDelaunayEdgeColor());
  let weight = getDelaunayEdgeWeight();
  buffer.stroke(edgeColor.levels[0], edgeColor.levels[1], edgeColor.levels[2], 255);
  buffer.strokeWeight(weight);
  buffer.noFill();
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    let t0 = delaunay.triangles[i];
    let t1 = delaunay.triangles[i + 1];
    let t2 = delaunay.triangles[i + 2];
    buffer.line(points[t0][0], points[t0][1], points[t1][0], points[t1][1]);
    buffer.line(points[t1][0], points[t1][1], points[t2][0], points[t2][1]);
    buffer.line(points[t2][0], points[t2][1], points[t0][0], points[t0][1]);
  }
  buffer.pop();
}

function drawDelaunayCircles(delaunay, buffer) {
  buffer.clear();
  buffer.push();
  let circleColor = color(getDelaunayCircleColor());
  let weight = getDelaunayCircleWeight();
  buffer.stroke(circleColor.levels[0], circleColor.levels[1], circleColor.levels[2], 255);
  buffer.strokeWeight(weight);
  buffer.noFill();
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    let t0 = delaunay.triangles[i];
    let t1 = delaunay.triangles[i + 1];
    let t2 = delaunay.triangles[i + 2];
    let [x0, y0] = points[t0];
    let [x1, y1] = points[t1];
    let [x2, y2] = points[t2];

    // Calculate the circumcenter
    let D = 2 * (x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1));
    let Ux = ((x0 * x0 + y0 * y0) * (y1 - y2) + (x1 * x1 + y1 * y1) * (y2 - y0) + (x2 * x2 + y2 * y2) * (y0 - y1)) / D;
    let Uy = ((x0 * x0 + y0 * y0) * (x2 - x1) + (x1 * x1 + y1 * y1) * (x0 - x2) + (x2 * x2 + y2 * y2) * (x1 - x0)) / D;

    // Calculate the circumradius
    let r = dist(Ux, Uy, x0, y0);

    buffer.ellipse(Ux, Uy, r * 2, r * 2);
  }
  buffer.pop();
}

function drawVoronoiEdges(voronoi, buffer) {
  buffer.clear();
  buffer.push();
  let edgeColor = color(getVoronoiEdgeColor());
  let weight = getEdgeWeight();
  buffer.stroke(edgeColor.levels[0], edgeColor.levels[1], edgeColor.levels[2], 255);
  buffer.strokeWeight(weight);
  buffer.noFill();
  for (let i = 0; i < points.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
    buffer.beginShape();
    polygon.forEach(([x, y]) => buffer.vertex(x, y));
    buffer.endShape(CLOSE);
  }
  buffer.pop();
}

function drawVoronoiFilled(voronoi, buffer) {
  buffer.clear();
  buffer.push();
  let fillColor = color(getVoronoiFillColor());
  for (let i = 0; i < points.length; i++) {
    if (filledCells.includes(i)) {
      let polygon = voronoi.cellPolygon(i);
      if (!polygon) continue;
      buffer.fill(fillColor.levels[0], fillColor.levels[1], fillColor.levels[2], 255);
      buffer.noStroke();
      buffer.beginShape();
      polygon.forEach(([x, y]) => buffer.vertex(x, y));
      buffer.endShape(CLOSE);
    }
  }
  buffer.pop();
}

function handleLayerEditing() {
  switch (currentEditingLayer) {
    case 'dots':
      // Handle moving/adding points
      break;
    case 'coloredTiles':
      // Handle changing colors
      break;
    case 'delaunayCircles':
      // Handle modifying Delaunay circles
      break;
    case 'voronoiFilled':
      let delaunay = d3.Delaunay.from(points);
      let clickedIndex = delaunay.find(mouseX, mouseY);
      console.log(filledCells)
      if (clickedIndex >= 0 && !filledCells.includes(clickedIndex)) {
        filledCells.push(clickedIndex);
        draw();
      }
      break;
    // Add other cases for different layers
  }
}

function exportImage() {
  // Placeholder export function
}

function mousePressed() {
  if (!isMouseInCanvas()) return;

  if (currentEditingLayer === 'dots') {
    selectedDotIndex = null;
    // Check if user clicked near a dot
    for (let i = 0; i < points.length; i++) {
      let [px, py] = points[i];
      if (dist(mouseX, mouseY, px, py) < 10) {
        selectedDotIndex = i;
        offsetX = px - mouseX;
        offsetY = py - mouseY;
        break;
      }
    }
    // If no dot found, add new dot
    if (selectedDotIndex === null) {
      points.push([mouseX, mouseY]);
      colors.push([random(255), random(255), random(255), 100]);
      colorIndexes.push(floor(random(getTilePalette().length))); // Add corresponding color index
      draw(); // Redraw to update layers
    }
  }
  if (currentEditingLayer === 'coloredTiles') {
    let delaunay = d3.Delaunay.from(points);
    let clickedIndex = delaunay.find(mouseX, mouseY);
    if (clickedIndex >= 0) {
      let palette = getTilePalette();
      colorIndexes[clickedIndex] = (colorIndexes[clickedIndex] + 1) % palette.length;
      draw();
    }
  }
  if (currentEditingLayer === 'voronoiFilled') {
    let delaunay = d3.Delaunay.from(points);
      let clickedIndex = delaunay.find(mouseX, mouseY);
      console.log(filledCells)
      if (clickedIndex >= 0 && !filledCells.includes(clickedIndex)) {
        filledCells.push(clickedIndex);
        draw();
      } else if (clickedIndex >= 0 && filledCells.includes(clickedIndex)) {
        filledCells = filledCells.filter(cell => cell !== clickedIndex);
        draw();
      }
    }
}

function mouseDragged() {
  if (!isMouseInCanvas()) return;

  if (currentEditingLayer === 'dots' && selectedDotIndex !== null) {
    points[selectedDotIndex] = [mouseX + offsetX, mouseY + offsetY];
  }
}

function mouseReleased() {
  if (!isMouseInCanvas()) return;

  if (currentEditingLayer === 'dots') {
    selectedDotIndex = null;
  }
}

function getShadowOpacity(layer) {
  return layers[`${layer}ShadowOpacity`] || 128;
}

function getScreenColor(layer) {
  return layers[`${layer}ScreenColor`] || '#FFFFFF';
}

function getScreenOpacity(layer) {
  return layers[`${layer}ScreenOpacity`] || 128;
}

function getShadowBlur(layer) {
  // You could expose a shadow blur input in your HTML,
  // or default to 10 for demonstration.
  return 10;
}

function getShadowThreshold(layer) {
  // Similarly, expose a shadow threshold input in your HTML or default to 0.
  return 0;
}

// setup();
// setup();

