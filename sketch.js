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
let needsRedraw = {
  coloredTiles: true,
  dots: true,
  delaunayCircles: true,
  delaunay: true,
  voronoiEdges: true,
  voronoiFilled: true,
  coloredTilesShadow: true,
  dotsShadow: true,
  delaunayCirclesShadow: true,
  delaunayShadow: true,
  voronoiEdgesShadow: true,
  voronoiFilledShadow: true,
  coloredTilesScreen: true,
  dotsScreen: true,
  delaunayCirclesScreen: true,
  delaunayScreen: true,
  voronoiEdgesScreen: true,
  voronoiFilledScreen: true
};

function setup() {
  createCanvas(width, height);
  noLoop(); // Stop continuous rendering
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
  
  // Main layer event listeners
  document.getElementById('layerColoredTiles').addEventListener('change', (e) => {
    layers.coloredTiles = e.target.checked;
    requestRedraw('coloredTiles');
  });
  document.getElementById('layerDots').addEventListener('change', (e) => {
    layers.dots = e.target.checked;
    requestRedraw('dots');
  });
  document.getElementById('layerDelaunayCircles').addEventListener('change', (e) => {
    layers.delaunayCircles = e.target.checked;
    requestRedraw('delaunayCircles');
  });
  document.getElementById('layerDelaunay').addEventListener('change', (e) => {
    layers.delaunay = e.target.checked;
    requestRedraw('delaunay');
  });
  document.getElementById('layerVoronoi').addEventListener('change', (e) => {
    layers.voronoiEdges = e.target.checked;
    requestRedraw('voronoiEdges');
  });
  document.getElementById('layerVoronoiFilled').addEventListener('change', (e) => {
    layers.voronoiFilled = e.target.checked;
    requestRedraw('voronoiFilled');
  });
  document.getElementById('editingLayer').addEventListener('change', (e) => currentEditingLayer = e.target.value);
  document.getElementById('exportSize').addEventListener('change', (e) => exportScale = parseInt(e.target.value));

  // New layer event listeners for shadows and screens
  ['coloredTiles', 'dots', 'delaunayCircles', 'delaunay', 'voronoiEdges', 'voronoiFilled'].forEach(layer => {
    const capitalizeLayer = capitalize(layer);

    // Shadow controls
    const shadowToggle = document.getElementById(`layer${capitalizeLayer}Shadow`);
    const shadowColorInput = document.getElementById(`layer${capitalizeLayer}ShadowColor`);
    const shadowOpacityInput = document.getElementById(`layer${capitalizeLayer}ShadowOpacity`);
    const shadowBlurInput = document.getElementById(`layer${capitalizeLayer}ShadowBlur`);

    shadowToggle.addEventListener('change', (e) => {
      layers[`${layer}Shadow`] = e.target.checked;
      requestRedraw(`${layer}Shadow`);
    });
    shadowColorInput.addEventListener('input', (e) => {
      layers[`${layer}ShadowColor`] = e.target.value.trim();
      requestRedraw(`${layer}Shadow`);
    });
    shadowOpacityInput.addEventListener('change', (e) => {
      layers[`${layer}ShadowOpacity`] = parseInt(e.target.value) || 128;
      requestRedraw(`${layer}Shadow`);
    });
    shadowBlurInput.addEventListener('change', (e) => {
      layers[`${layer}ShadowBlur`] = parseInt(e.target.value) || 10; // Store the blur value
      requestRedraw(`${layer}Shadow`);
    });

    // Screen controls
    const screenToggle = document.getElementById(`layer${capitalizeLayer}Screen`);
    const screenColorInput = document.getElementById(`layer${capitalizeLayer}ScreenColor`);
    const screenOpacityInput = document.getElementById(`layer${capitalizeLayer}ScreenOpacity`);
    const screenBlurInput = document.getElementById(`layer${capitalizeLayer}ScreenBlur`); // If applicable

    screenToggle.addEventListener('change', (e) => {
      layers[`${layer}Screen`] = e.target.checked;
      requestRedraw(`${layer}Screen`);
    });
    screenColorInput.addEventListener('input', (e) => {
      layers[`${layer}ScreenColor`] = e.target.value.trim();
      requestRedraw(`${layer}Screen`);
    });
    screenOpacityInput.addEventListener('change', (e) => {
      layers[`${layer}ScreenOpacity`] = parseInt(e.target.value) || 128;
      requestRedraw(`${layer}Screen`);
    });
    // If Screen Blur is needed
    if (screenBlurInput) {
      screenBlurInput.addEventListener('change', (e) => {
        layers[`${layer}ScreenBlur`] = parseInt(e.target.value) || 0;
        requestRedraw(`${layer}Screen`);
      });
    }

    // Blur and Threshold inputs for main layers
    const blurInput = document.getElementById(`${layer}BlurInput`);
    const thresholdInput = document.getElementById(`${layer}ThresholdInput`);
    const weightInput = document.getElementById(`${layer}WeightInput`);

    if (blurInput) {
      blurInput.addEventListener('change', (e) => {
        layers[`${layer}Blur`] = parseInt(e.target.value) || 0;
        requestRedraw(layer);
      });
    }

    if (thresholdInput) {
      thresholdInput.addEventListener('change', (e) => {
        layers[`${layer}Threshold`] = parseInt(e.target.value) || 128;
        requestRedraw(layer);
      });
    }

    if (weightInput) {
      weightInput.addEventListener('change', (e) => {
        layers[`${layer}Weight`] = parseInt(e.target.value) || 1;
        requestRedraw(layer);
      });
    }
  });

  // Additional input listeners for weights/colors:
  document.getElementById('dotsColorInput').addEventListener('input', () => {
    requestRedraw('dots');
  });
  document.getElementById('dotsWeightInput').addEventListener('change', () => {
    requestRedraw('dots');
  });
  document.getElementById('dotsTransparencyInput').addEventListener('change', () => {
    requestRedraw('dots');
  });
  document.getElementById('delaunayEdgeColorInput').addEventListener('input', () => {
    requestRedraw('delaunay');
  });
  document.getElementById('delaunayEdgeWeightInput').addEventListener('change', () => {
    requestRedraw('delaunay');
  });
  document.getElementById('delaunayEdgeTransparencyInput').addEventListener('change', () => {
    requestRedraw('delaunay');
  });
  document.getElementById('delaunayCircleColorInput').addEventListener('input', () => {
    requestRedraw('delaunayCircles');
  });
  document.getElementById('delaunayCircleWeightInput').addEventListener('change', () => {
    requestRedraw('delaunayCircles');
  });
  document.getElementById('delaunayCircleTransparencyInput').addEventListener('change', () => {
    requestRedraw('delaunayCircles');
  });
  document.getElementById('edgeColorInput').addEventListener('input', () => {
    requestRedraw('voronoiEdges');
  });
  document.getElementById('edgeWeightInput').addEventListener('change', () => {
    requestRedraw('voronoiEdges');
  });
  document.getElementById('edgeTransparencyInput').addEventListener('change', () => {
    requestRedraw('voronoiEdges');
  });
  document.getElementById('voronoiFillColorInput').addEventListener('input', () => {
    requestRedraw('voronoiFilled');
  });
  document.getElementById('voronoiFillWeightInput').addEventListener('change', () => {
    requestRedraw('voronoiFilled');
  });
  document.getElementById('voronoiFillTransparencyInput').addEventListener('change', () => {
    requestRedraw('voronoiFilled');
  });

  // Add listener for tile colors input to trigger redraw
  document.getElementById('tileColorsInput').addEventListener('input', () => {
    requestRedraw('coloredTiles');
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

  for (let i = 0; i < buffer.pixels.length; i += 4) {
    let alpha = buffer.pixels[i + 3];
    if (alpha > thresholdAmount) {
      if (layer === 'coloredTiles') {
        // Do not change RGB, only ensure alpha is fully opaque
        buffer.pixels[i + 3] = 255;
      } else {
        let fillColor = color(
          layer === 'dots' ? getDotsColor() :
          layer === 'delaunayCircles' ? getDelaunayCircleColor() :
          layer === 'delaunay' ? getDelaunayEdgeColor() :
          layer === 'voronoiEdges' ? getVoronoiEdgeColor() :
          layer === 'voronoiFilled' ? getVoronoiFillColor() :
          '#FFFFFF' // Fallback color
        );
        buffer.pixels[i] = red(fillColor);
        buffer.pixels[i + 1] = green(fillColor);
        buffer.pixels[i + 2] = blue(fillColor);
        buffer.pixels[i + 3] = 255;
      }
    } else {
      // Set alpha to 0 to make it transparent
      buffer.pixels[i + 3] = 0;
    }
  }
  buffer.updatePixels();
}

function isMouseInCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function draw() {
  background(255, 255, 255, 0);
  updateAllLayers();
  drawAllLayers();
}

// Update the requestRedraw function to handle dependencies
function requestRedraw(layer) {
  needsRedraw[layer] = true;

  // Mark shadow and screen layers for the changed layer
  const shadowLayer = `${layer}Shadow`;
  const screenLayer = `${layer}Screen`;

  if (layers[shadowLayer]) {
    needsRedraw[shadowLayer] = true;
  }
  if (layers[screenLayer]) {
    needsRedraw[screenLayer] = true;
  }

  if (layer === 'voronoiEdges') {
    needsRedraw['voronoiFilled'] = true;
  }
  
  redraw();
}

function updateAllLayers() {
  let delaunay = d3.Delaunay.from(points);
  let voronoi = delaunay.voronoi([0, 0, width, height]);

  // MAIN geometry
  if (needsRedraw.coloredTiles && layers.coloredTiles) {
    drawColoredTiles(voronoi, buffers.coloredTiles);
    applyBlurAndThreshold(buffers.coloredTiles, 'coloredTiles');
    needsRedraw.coloredTiles = false;
  }
  if (needsRedraw.dots && layers.dots) {
    drawDots(buffers.dots);
    applyBlurAndThreshold(buffers.dots, 'dots');
    needsRedraw.dots = false;
  }
  if (needsRedraw.delaunayCircles && layers.delaunayCircles) {
    drawDelaunayCircles(delaunay, buffers.delaunayCircles);
    applyBlurAndThreshold(buffers.delaunayCircles, 'delaunayCircles');
    needsRedraw.delaunayCircles = false;
  }
  if (needsRedraw.delaunay && layers.delaunay) {
    drawDelaunay(delaunay, buffers.delaunay);
    applyBlurAndThreshold(buffers.delaunay, 'delaunay');
    needsRedraw.delaunay = false;
  }
  if (needsRedraw.voronoiEdges && layers.voronoiEdges || needsRedraw.voronoiFilled && layers.voronoiFilled) {
    drawVoronoiEdges(voronoi, buffers.voronoiEdges);
    applyBlurAndThreshold(buffers.voronoiEdges, 'voronoiEdges');
    needsRedraw.voronoiEdges = false;
  }
  if (needsRedraw.voronoiFilled && layers.voronoiFilled) {
    // drawVoronoiEdges(voronoi, buffers.voronoiEdges);
    drawVoronoiFilled(voronoi, buffers.voronoiFilled);
    buffers.voronoiFilled.noStroke();
    buffers.voronoiFilled.image(buffers.voronoiEdges, 0, 0);
    applyBlurAndThreshold(buffers.voronoiFilled, 'voronoiFilled');
    needsRedraw.voronoiFilled = false;
  }

  // SCREEN buffers
  ['coloredTiles','dots','delaunayCircles','delaunay','voronoiEdges','voronoiFilled'].forEach(layer => {
    if (needsRedraw[`${layer}Screen`] && layers[`${layer}Screen`]) {
      let sc = getScreenColor(layer);
      let so = getScreenOpacity(layer); // Changed line
      let overlayColor = color(sc);
      // overlayColor.setAlpha(so);
      buffers[`${layer}Screen`].noStroke();
      buffers[`${layer}Screen`].fill(overlayColor);
      buffers[`${layer}Screen`].rect(0, 0, width, height);

      needsRedraw[`${layer}Screen`] = false;
    }
  });

  // SHADOW buffers
  ['coloredTiles','dots','delaunayCircles','delaunay','voronoiEdges','voronoiFilled'].forEach(layer => {
    const blurAmount = getShadowBlur(layer);
    if (blurAmount > 0 && layers[`${layer}Shadow`]) {
      // Clear the shadow buffer
      buffers[`${layer}Shadow`].clear();

      // Copy main buffer
      buffers[`${layer}Shadow`].image(buffers[layer], 0, 0);
      // Apply blur
      buffers[`${layer}Shadow`].filter(BLUR, blurAmount);

      // Set RGB to shadowColor by manipulating pixels
      buffers[`${layer}Shadow`].loadPixels();
      let shadowClr = color(layers[`${layer}ShadowColor`] || '#000000');
      for (let i = 0; i < buffers[`${layer}Shadow`].pixels.length; i += 4) {
        buffers[`${layer}Shadow`].pixels[i] = red(shadowClr);     // Red
        buffers[`${layer}Shadow`].pixels[i + 1] = green(shadowClr); // Green
        buffers[`${layer}Shadow`].pixels[i + 2] = blue(shadowClr);  // Blue
        // Alpha remains unchanged from the blurred buffer
      }
      buffers[`${layer}Shadow`].updatePixels();

      needsRedraw[`${layer}Shadow`] = false;
    } else {
      // If blur is 0 or shadow is disabled, clear the shadow buffer
      buffers[`${layer}Shadow`].clear();
    }
  });
}

// Composite in order from bottom to top
function drawAllLayers() {
  // Colored Tiles
  if (layers.coloredTilesShadow) {
    // Use shadowAlpha when drawing the shadow buffer
    tint(255, getShadowOpacity('coloredTiles')); // Changed line
    image(buffers.coloredTilesShadow, 0, 0);
    noTint();
  }
  if (layers.coloredTiles) {
    tint(255, getLayerOpacity('coloredTiles'));
    image(buffers.coloredTiles, 0, 0);
    noTint();
  }
  if (layers.coloredTilesScreen) {
    tint(255, getScreenOpacity('coloredTiles')); // Changed line
    image(buffers.coloredTilesScreen, 0, 0);
    noTint();
  }

  // Dots
  if (layers.dotsShadow) {
    tint(255, getShadowOpacity('dots')); // Changed line
    image(buffers.dotsShadow, 0, 0);
    noTint();
  }
  if (layers.dots) {
    tint(255, getLayerOpacity('dots'));
    image(buffers.dots, 0, 0);
    noTint();
  }
  if (layers.dotsScreen) {
    tint(255, getScreenOpacity('dots')); // Changed line
    image(buffers.dotsScreen, 0, 0);
    noTint();
  }

  // Delaunay Circles
  if (layers.delaunayCirclesShadow) {
    tint(255, getShadowOpacity('delaunayCircles')); // Changed line
    image(buffers.delaunayCirclesShadow, 0, 0);
    noTint();
  }
  if (layers.delaunayCircles) {
    tint(255, getLayerOpacity('delaunayCircles'));
    image(buffers.delaunayCircles, 0, 0);
    noTint();
  }
  if (layers.delaunayCirclesScreen) {
    tint(255, getScreenOpacity('delaunayCircles')); // Changed line
    image(buffers.delaunayCirclesScreen, 0, 0);
    noTint();
  }

  // Delaunay Triangulation
  if (layers.delaunayShadow) {
    tint(255, getShadowOpacity('delaunay')); // Changed line
    image(buffers.delaunayShadow, 0, 0);
    noTint();
  }
  if (layers.delaunay) {
    tint(255, getLayerOpacity('delaunay'));
    image(buffers.delaunay, 0, 0);
    noTint();
  }
  if (layers.delaunayScreen) {
    tint(255, getScreenOpacity('delaunay')); // Changed line
    image(buffers.delaunayScreen, 0, 0);
    noTint();
  }

  // Voronoi Edges
  if (layers.voronoiEdgesShadow) {
    tint(255, getShadowOpacity('voronoiEdges')); // Changed line
    image(buffers.voronoiEdgesShadow, 0, 0);
    noTint();
  }
  if (layers.voronoiEdges) {
    tint(255, getLayerOpacity('voronoiEdges'));
    image(buffers.voronoiEdges, 0, 0);
    noTint();
  }
  if (layers.voronoiEdgesScreen) {
    tint(255, getScreenOpacity('voronoiEdges')); // Changed line
    image(buffers.voronoiEdgesScreen, 0, 0);
    noTint();
  }

  // Voronoi Filled
  if (layers.voronoiFilledShadow) {
    tint(255, getShadowOpacity('voronoiFilled')); // Changed line
    image(buffers.voronoiFilledShadow, 0, 0);
    noTint();
  }
  if (layers.voronoiFilled) {
    tint(255, getLayerOpacity('voronoiFilled'));
    image(buffers.voronoiFilled, 0, 0);
    noTint();
  }
  if (layers.voronoiFilledScreen) {
    tint(255, getScreenOpacity('voronoiFilled')); // Changed line
    image(buffers.voronoiFilledScreen, 0, 0);
    noTint();
  }
}

// Add a helper function to get layer opacity
function getLayerOpacity(layer) {
  switch(layer) {
    case 'coloredTiles':
      return 255
    case 'dots':
      return getDotsTransparency();
    case 'delaunayCircles':
      return getDelaunayCircleTransparency();
    case 'delaunay':
      return getDelaunayEdgeTransparency();
    case 'voronoiEdges':
      return getEdgeTransparency();
    case 'voronoiFilled':
      return getVoronoiFillTransparency();
    default:
      return 255;
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
  requestRedraw('coloredTiles'); // Instead of draw()
  requestRedraw('dots');
  requestRedraw('delaunayCircles');
  requestRedraw('delaunay');
  requestRedraw('voronoiEdges');
  requestRedraw('voronoiFilled');
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
        requestRedraw('voronoiFilled');
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
      requestRedraw('coloredTiles');
      requestRedraw('dots');
      requestRedraw('delaunayCircles');
      requestRedraw('delaunay');
      requestRedraw('voronoiEdges');
      requestRedraw('voronoiFilled');
    }
  }
  if (currentEditingLayer === 'coloredTiles') {
    let delaunay = d3.Delaunay.from(points);
    let clickedIndex = delaunay.find(mouseX, mouseY);
    if (clickedIndex >= 0) {
      let palette = getTilePalette();
      colorIndexes[clickedIndex] = (colorIndexes[clickedIndex] + 1) % palette.length;
      requestRedraw('coloredTiles');
    }
  }
  if (currentEditingLayer === 'voronoiFilled') {
    let delaunay = d3.Delaunay.from(points);
      let clickedIndex = delaunay.find(mouseX, mouseY);
      console.log(filledCells)
      if (clickedIndex >= 0 && !filledCells.includes(clickedIndex)) {
        filledCells.push(clickedIndex);
        requestRedraw('voronoiFilled');
      } else if (clickedIndex >= 0 && filledCells.includes(clickedIndex)) {
        filledCells = filledCells.filter(cell => cell !== clickedIndex);
        requestRedraw('voronoiFilled');
      }
    }
}

function mouseDragged() {
  if (!isMouseInCanvas()) return;

  if (currentEditingLayer === 'dots' && selectedDotIndex !== null) {
    points[selectedDotIndex] = [mouseX + offsetX, mouseY + offsetY];
    requestRedraw('dots');
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
  return parseInt(document.getElementById(`layer${capitalize(layer)}ShadowBlur`).value) || 10;
}

function getShadowThreshold(layer) {
  // Similarly, expose a shadow threshold input in your HTML or default to 0.
  return 0;
}
