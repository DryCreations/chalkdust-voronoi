let points = [];
let colors = []; // Store cell colors
let colorIndexes = [];
let layers = {
  coloredTiles: true,
  dots: true,
  delaunayCircles: true,
  delaunay: true,
  voronoiEdges: true,
  voronoiFilled: true
};
let currentEditingLayer = 'coloredTiles';
let exportScale = 1;
let width = 800, height = 1200;
let selectedDotIndex = null;
let offsetX = 0;
let offsetY = 0;
let filledCells = [];
let buffers = {};

function setup() {
  createCanvas(width, height, WEBGL);
  noStroke()
  const container = document.getElementById('canvas-container');

  // Initialize buffers for each layer
  buffers.coloredTiles = createGraphics(width, height, WEBGL);
  buffers.dots = createGraphics(width, height, WEBGL);
  buffers.delaunayCircles = createGraphics(width, height, WEBGL);
  buffers.delaunay = createGraphics(width, height, WEBGL);
  buffers.voronoiEdges = createGraphics(width, height, WEBGL);
  buffers.voronoiFilled = createGraphics(width, height, WEBGL);

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

  generateRandomPoints();
}

function getTilePalette() {
  let raw = document.getElementById('tileColorsInput').value || '#FD5901, #F78104, #FAAB36, #249EA0, #008083, #005F60';
  return raw.split(',').map(c => c.trim());
}

function getVoronoiEdgeColor() {
  return (document.getElementById('edgeColorInput').value || '#000000').trim();
}

function getDelaunayEdgeColor() {
  return (document.getElementById('delaunayEdgeColorInput').value || '#FF0000').trim();
}

function getDelaunayCircleColor() {
  return (document.getElementById('delaunayCircleColorInput').value || '#0000FF').trim();
}

function getVoronoiFillColor() {
  return (document.getElementById('voronoiFillColorInput').value || '#000000').trim();
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

  if (layers.coloredTiles) {
    drawColoredTiles(voronoi, buffers.coloredTiles);
    // applyBlurAndThreshold(buffers.coloredTiles, 'coloredTiles');
    tint(255, getEdgeTransparency());
    texture(buffers.coloredTiles);
    plane(width, height);
  }
  if (layers.dots) {
    drawDots(buffers.dots);
    applyBlurAndThreshold(buffers.dots, 'dots');
    tint(255, getDotsTransparency());
    texture(buffers.dots);
    plane(width, height);
  }
  if (layers.delaunayCircles) {
    drawDelaunayCircles(delaunay, buffers.delaunayCircles);
    applyBlurAndThreshold(buffers.delaunayCircles, 'delaunayCircles');
    tint(255, getDelaunayCircleTransparency());
    texture(buffers.delaunayCircles);
    plane(width, height);
  }
  if (layers.delaunay) {
    drawDelaunay(delaunay, buffers.delaunay);
    applyBlurAndThreshold(buffers.delaunay, 'delaunay');
    tint(255, getDelaunayEdgeTransparency());
    texture(buffers.delaunay);
    plane(width, height);
  }
  drawVoronoiEdges(voronoi, buffers.voronoiEdges);
  applyBlurAndThreshold(buffers.voronoiEdges, 'voronoiEdges');
  if (layers.voronoiEdges) {
    tint(255, getEdgeTransparency());
    texture(buffers.voronoiEdges);
    plane(width, height);
  }
  if (layers.voronoiFilled) {
    drawVoronoiFilled(voronoi, buffers.voronoiFilled);
    buffers.voronoiFilled.noStroke();
    buffers.voronoiFilled.texture(buffers.voronoiEdges);
    buffers.voronoiFilled.plane(width, height);
    applyBlurAndThreshold(buffers.voronoiFilled, 'voronoiFilled');
    tint(255, getVoronoiFillTransparency());
    texture(buffers.voronoiFilled);
    plane(width, height);
  }
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
  buffer.translate(-width / 2, -height / 2);
  let palette = getTilePalette();
  for (let i = 0; i < points.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
    buffer.fill(palette[colorIndexes[i]] || '#CCCCCC');
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
  buffer.translate(-width / 2, -height / 2);
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
  buffer.translate(-width / 2, -height / 2);
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
  buffer.translate(-width / 2, -height / 2);
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
  buffer.translate(-width / 2, -height / 2);
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
  buffer.translate(-width / 2, -height / 2);
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

setup();
