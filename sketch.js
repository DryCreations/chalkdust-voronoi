let points = [];
let colors = []; // Store cell colors
let colorIndexes = [];
let colorIndexesBelowVoronoi = [];
let colorIndexesAboveVoronoi = [];
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
  voronoiFilledScreen: false,
  coloredTilesBelowVoronoi: false,
  coloredTilesBelowVoronoiShadow: false,
  coloredTilesBelowVoronoiScreen: false,
  coloredTilesAboveVoronoi: false,
  coloredTilesAboveVoronoiShadow: false,
  coloredTilesAboveVoronoiScreen: false
};
let currentEditingLayer = 'coloredTiles';
let exportScale = 1;
let width = 512, height = 512;
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
  voronoiFilledScreen: true,
  coloredTilesBelowVoronoi: true,
  coloredTilesBelowVoronoiShadow: true,
  coloredTilesBelowVoronoiScreen: true,
  coloredTilesAboveVoronoi: true,
  coloredTilesAboveVoronoiShadow: true,
  coloredTilesAboveVoronoiScreen: true
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
  buffers.coloredTilesBelowVoronoi = createGraphics(width, height);
  buffers.coloredTilesBelowVoronoiShadow = createGraphics(width, height);
  buffers.coloredTilesBelowVoronoiScreen = createGraphics(width, height);
  buffers.coloredTilesAboveVoronoi = createGraphics(width, height);
  buffers.coloredTilesAboveVoronoiShadow = createGraphics(width, height);
  buffers.coloredTilesAboveVoronoiScreen = createGraphics(width, height);

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

  // Example event listeners (similar to others):
  document.getElementById('layerColoredTilesBelowVoronoi').addEventListener('change', (e) => {
    layers.coloredTilesBelowVoronoi = e.target.checked;
    requestRedraw('coloredTilesBelowVoronoi');
  });
  document.getElementById('layerColoredTilesAboveVoronoi').addEventListener('change', (e) => {
    layers.coloredTilesAboveVoronoi = e.target.checked;
    requestRedraw('coloredTilesAboveVoronoi');
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

function getTilePaletteForExtraLayer() {
  // Include “invisible” as one of the colors
  let raw = document.getElementById('extraTileColorsInput').value || 'invisible, #FD5901, #F78104, #FAAB36, #249EA0, #008083, #005F60, ';
  return raw.split(',').map(c => c.trim());
}

function getTilePaletteBelowVoronoi() {
  let raw = document.getElementById('extraTileColorsInput').value || 'invisible, #FD5901, #F78104, #FAAB36, #249EA0, #008083, #005F60';
  return raw.split(',').map(c => c.trim());
}

function getTilePaletteAboveVoronoi() {
  let raw = document.getElementById('aboveTileColorsInput').value || 'invisible, #FD5901, #F78104, #FAAB36, #249EA0, #008083, #005F60';
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
  return parseInt(document.getElementById(`${layer}BlurInput`)?.value) ?? 0;
}

function getThresholdAmount(layer) {
  return parseInt(document.getElementById(`${layer}ThresholdInput`)?.value) ?? 128;
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

function applyBlurAndCorrectColor(buffer, color) {
    buffer.filter(BLUR, 1); // Apply minor blur

    buffer.loadPixels();
    for (let x = 0; x < buffer.width; x++) {
        for (let y = 0; y < buffer.height; y++) {
            let index = (x + y * buffer.width) * 4;
            let r = buffer.pixels[index];
            let g = buffer.pixels[index + 1];
            let b = buffer.pixels[index + 2];
            let a = buffer.pixels[index + 3];

            // Apply the correct color while keeping the blurred opacity
            buffer.pixels[index] = red(color);
            buffer.pixels[index + 1] = green(color);
            buffer.pixels[index + 2] = blue(color);
            buffer.pixels[index + 3] = a; // Keep the blurred opacity
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

function requestAllLayersRedraw() {
  ['coloredTiles','dots','delaunayCircles','delaunay','voronoiEdges','voronoiFilled'].forEach(layer => {
    requestRedraw(layer);
  });
  requestRedraw('coloredTilesBelowVoronoi');
  requestRedraw('coloredTilesAboveVoronoi');
}

function updateAllLayers() {
  let delaunay = d3.Delaunay.from(points);
  let voronoi = delaunay.voronoi([0, 0, width, height]);

  // MAIN geometry
  if (needsRedraw.coloredTiles && layers.coloredTiles) {
    drawColoredTiles(voronoi, buffers.coloredTiles);
    applyBlurAndThreshold(buffers.coloredTiles, 'coloredTiles');
    // applyBlurAndCorrectColor(buffers.coloredTiles, color(getTilePalette()[0])); // Example color
    needsRedraw.coloredTiles = false;
  }
  if (needsRedraw.dots && layers.dots) {
    drawDots(buffers.dots);
    applyBlurAndThreshold(buffers.dots, 'dots');
    // applyBlurAndCorrectColor(buffers.dots, color(getDotsColor()));
    needsRedraw.dots = false;
  }
  if (needsRedraw.delaunayCircles && layers.delaunayCircles) {
    drawDelaunayCircles(delaunay, buffers.delaunayCircles);
    applyBlurAndThreshold(buffers.delaunayCircles, 'delaunayCircles');
    applyBlurAndCorrectColor(buffers.delaunayCircles, color(getDelaunayCircleColor()));
    needsRedraw.delaunayCircles = false;
  }
  if (needsRedraw.delaunay && layers.delaunay) {
    drawDelaunay(delaunay, buffers.delaunay);
    applyBlurAndThreshold(buffers.delaunay, 'delaunay');
    applyBlurAndCorrectColor(buffers.delaunay, color(getDelaunayEdgeColor()));
    needsRedraw.delaunay = false;
  }
  if (needsRedraw.voronoiEdges && layers.voronoiEdges || needsRedraw.voronoiFilled && layers.voronoiFilled) {
    drawVoronoiEdges(voronoi, buffers.voronoiEdges);
    applyBlurAndThreshold(buffers.voronoiEdges, 'voronoiEdges');
    applyBlurAndCorrectColor(buffers.voronoiEdges, color(getVoronoiEdgeColor()));
    needsRedraw.voronoiEdges = false;
  }
  if (needsRedraw.voronoiFilled && layers.voronoiFilled) {
    // drawVoronoiEdges(voronoi, buffers.voronoiEdges);
    drawVoronoiFilled(voronoi, buffers.voronoiFilled);
    buffers.voronoiFilled.noStroke();
    buffers.voronoiFilled.image(buffers.voronoiEdges, 0, 0);
    applyBlurAndThreshold(buffers.voronoiFilled, 'voronoiFilled');
    applyBlurAndCorrectColor(buffers.voronoiFilled, color(getVoronoiFillColor()));
    needsRedraw.voronoiFilled = false;
  }
  if (needsRedraw.coloredTilesBelowVoronoi && layers.coloredTilesBelowVoronoi) {
    drawColoredTilesBelowVoronoi(voronoi, buffers.coloredTilesBelowVoronoi);
    needsRedraw.coloredTilesBelowVoronoi = false;
  }
  if (needsRedraw.coloredTilesAboveVoronoi && layers.coloredTilesAboveVoronoi) {
    drawColoredTilesAboveVoronoi(voronoi, buffers.coloredTilesAboveVoronoi);
    needsRedraw.coloredTilesAboveVoronoi = false;
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

  // Colored Tiles Below Voronoi
  if (layers.coloredTilesBelowVoronoiShadow) {
    tint(255, getShadowOpacity('coloredTilesBelowVoronoi'));
    image(buffers.coloredTilesBelowVoronoiShadow, 0, 0);
    noTint();
  }
  if (layers.coloredTilesBelowVoronoi) {
    tint(255, getLayerOpacity('coloredTilesBelowVoronoi'));
    image(buffers.coloredTilesBelowVoronoi, 0, 0);
    noTint();
  }
  if (layers.coloredTilesBelowVoronoiScreen) {
    tint(255, getScreenOpacity('coloredTilesBelowVoronoi'));
    image(buffers.coloredTilesBelowVoronoiScreen, 0, 0);
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

  // Colored Tiles Above Voronoi
  if (layers.coloredTilesAboveVoronoiShadow) {
    tint(255, getShadowOpacity('coloredTilesAboveVoronoi'));
    image(buffers.coloredTilesAboveVoronoiShadow, 0, 0);
    noTint();
  }
  if (layers.coloredTilesAboveVoronoi) {
    tint(255, getLayerOpacity('coloredTilesAboveVoronoi'));
    image(buffers.coloredTilesAboveVoronoi, 0, 0);
    noTint();
  }
  if (layers.coloredTilesAboveVoronoiScreen) {
    tint(255, getScreenOpacity('coloredTilesAboveVoronoi'));
    image(buffers.coloredTilesAboveVoronoiScreen, 0, 0);
    noTint();
  }
}

// Add a helper function to get layer opacity
function getLayerOpacity(layer) {
  switch(layer) {
    case 'coloredTiles':
      return 255;
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
    case 'coloredTilesBelowVoronoi':
      return 255;
    case 'coloredTilesAboveVoronoi':
      return 255;
    default:
      return 255;
  }
}

function generateRandomPoints() {
  points = [];
  colorIndexes = [];
  colorIndexesBelowVoronoi = [];
  colorIndexesAboveVoronoi = [];
  let numPoints = parseInt(document.getElementById('numPointsInput').value) || 10;
  let palette = getTilePalette();
  for (let i = 0; i < numPoints; i++) {
    points.push([Math.random() * width, Math.random() * height]);
    // Assign a random index from the palette
    colorIndexes.push(floor(random(palette.length)));
    colorIndexesBelowVoronoi.push(0); // "invisible"
    colorIndexesAboveVoronoi.push(0); // "invisible"
  }
  requestRedraw('coloredTiles');
  requestRedraw('dots');
  requestRedraw('delaunayCircles');
  requestRedraw('delaunay');
  requestRedraw('voronoiEdges');
  requestRedraw('voronoiFilled');
  requestRedraw('coloredTilesBelowVoronoi');
  requestRedraw('coloredTilesAboveVoronoi');
}

function drawColoredTiles(voronoi, buffer, palette = getTilePalette()) {
  buffer.clear();
  buffer.push();
  for (let i = 0; i < points.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
    let color = palette[colorIndexes[i]] || '#FAAB36'; // Changed fallback color to allowed color
    if (color === 'invisible') {
      buffer.noFill();
    } else {
      buffer.fill(color);
    }
    buffer.noStroke();
    buffer.beginShape();
    polygon.forEach(([x, y]) => buffer.vertex(x, y));
    buffer.endShape(CLOSE);
  }
  buffer.pop();
}

function drawColoredTilesBelowVoronoi(voronoi, buffer) {
  buffer.clear();
  buffer.push();
  let palette = getTilePaletteBelowVoronoi();
  for (let i = 0; i < points.length; i++) {
    let c = palette[colorIndexesBelowVoronoi[i] || 0] || '#000000';
    if (c.toLowerCase() === 'invisible') {
      buffer.noFill();
    } else {
      buffer.fill(color(c));
    }
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
    buffer.noStroke();
    buffer.beginShape();
    polygon.forEach(([x, y]) => buffer.vertex(x, y));
    buffer.endShape(CLOSE);
  }
  buffer.pop();
}

function drawColoredTilesAboveVoronoi(voronoi, buffer) {
  buffer.clear();
  buffer.push();
  let palette = getTilePaletteAboveVoronoi();
  for (let i = 0; i < points.length; i++) {
    let c = palette[colorIndexesAboveVoronoi[i] || 0] || '#000000';
    if (c.toLowerCase() === 'invisible') {
      buffer.noFill();
    } else {
      buffer.fill(color(c));
    }
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
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
  let scale = exportScale;
  let scaleRatio = scale; // Calculate scaling ratio based on exportScale

  // Define layer ordering for naming
  let layerOrder = [
    { name: 'coloredTiles', label: 'coloredTiles' },
    { name: 'dots', label: 'dots' },
    { name: 'delaunayCircles', label: 'delaunayCircles' },
    { name: 'delaunay', label: 'delaunay' },
    { name: 'voronoiEdges', label: 'voronoiEdges' },
    { name: 'voronoiFilled', label: 'voronoiFilled' },
    { name: 'coloredTilesBelowVoronoi', label: 'coloredTilesBelowVoronoi' },
    { name: 'coloredTilesAboveVoronoi', label: 'coloredTilesAboveVoronoi' } // Ensure these layers are included
  ];

  if (scale === 1) {
    // 1. Save all buffers as is
    layerOrder.forEach((layer, i) => {
      if (layers[layer.name]) {
        saveCanvasLayer(buffers[layer.name], nf(i, 2) + '_' + layer.label);
      }
    });
    // 2. Save main canvas last
    saveCanvas(nf(layerOrder.length, 2) + '_mainCanvas');
  } else {
    let bigWidth = width * scale;
    let bigHeight = height * scale;
    let tempCanvas = createGraphics(bigWidth, bigHeight);
    tempCanvas.pixelDensity(1);
    tempCanvas.background(255, 255, 255, 0);
    
    // Create scaled buffers for each layer, including new layers
    let scaledBuffers = {};
    ['coloredTiles','dots','delaunayCircles','delaunay','voronoiEdges','voronoiFilled','coloredTilesBelowVoronoi','coloredTilesAboveVoronoi'].forEach(layerName => {
      scaledBuffers[layerName] = createGraphics(bigWidth, bigHeight);
      scaledBuffers[`${layerName}Shadow`] = createGraphics(bigWidth, bigHeight);
      scaledBuffers[`${layerName}Screen`] = createGraphics(bigWidth, bigHeight);
      scaledBuffers[layerName].pixelDensity(1);
      scaledBuffers[`${layerName}Shadow`].pixelDensity(1);
      scaledBuffers[`${layerName}Screen`].pixelDensity(1);
    });

    // Redraw each layer geometry into scaled buffers
    let scaledPoints = points.map(([px, py]) => [px * scale, py * scale]);
    let delaunay = d3.Delaunay.from(scaledPoints); // Use scaledPoints
    let voronoi = delaunay.voronoi([0, 0, bigWidth, bigHeight]); // Use exact scaled dimensions

    // Scale utility for points
    // let scaledPoints = points.map(([px, py]) => [px * scale, py * scale]);

    // Draw each layer in scaled buffers with scaled weights and blurs
    if (layers.coloredTiles) {
      drawColoredTilesScaled(voronoi, scaledBuffers.coloredTiles, scaledPoints, scaleRatio);
      applyBlurAndThresholdScaled(scaledBuffers.coloredTiles, 'coloredTiles', scaleRatio);
    }
    if (layers.dots) {
      drawDotsScaled(scaledBuffers.dots, scaledPoints, scaleRatio);
      applyBlurAndThresholdScaled(scaledBuffers.dots, 'dots', scaleRatio);
      applyBlurAndCorrectColor(scaledBuffers.dots, color(getDotsColor()));
    }
    if (layers.delaunayCircles) {
      drawDelaunayCirclesScaled(delaunay, scaledBuffers.delaunayCircles, scaledPoints, scaleRatio);
      applyBlurAndThresholdScaled(scaledBuffers.delaunayCircles, 'delaunayCircles', scaleRatio);
      applyBlurAndCorrectColor(scaledBuffers.delaunayCircles, color(getDelaunayCircleColor()));
    }
    if (layers.delaunay) {
      drawDelaunayScaled(delaunay, scaledBuffers.delaunay, scaledPoints, scaleRatio);
      applyBlurAndThresholdScaled(scaledBuffers.delaunay, 'delaunay', scaleRatio);
      applyBlurAndCorrectColor(scaledBuffers.delaunay, color(getDelaunayEdgeColor()));
    }
    if (layers.voronoiEdges || layers.voronoiFilled) {
      drawVoronoiEdgesScaled(voronoi, scaledBuffers.voronoiEdges, scaleRatio);
      applyBlurAndThresholdScaled(scaledBuffers.voronoiEdges, 'voronoiEdges', scaleRatio);
      applyBlurAndCorrectColor(scaledBuffers.voronoiEdges, color(getVoronoiEdgeColor()));
    }
    if (layers.voronoiFilled) {
      drawVoronoiFilledScaled(voronoi, scaledBuffers.voronoiFilled, scaledPoints, scaleRatio);
      scaledBuffers.voronoiFilled.noStroke();
      scaledBuffers.voronoiFilled.image(scaledBuffers.voronoiEdges, 0, 0);
      applyBlurAndThresholdScaled(scaledBuffers.voronoiFilled, 'voronoiFilled', scaleRatio);
      applyBlurAndCorrectColor(scaledBuffers.voronoiFilled, color(getVoronoiFillColor()));
    }
    if (layers.coloredTilesBelowVoronoi) {
      drawColoredTilesBelowVoronoiScaled(voronoi, scaledBuffers.coloredTilesBelowVoronoi, scaledPoints, scaleRatio);
    }
    if (layers.coloredTilesAboveVoronoi) {
      drawColoredTilesAboveVoronoiScaled(voronoi, scaledBuffers.coloredTilesAboveVoronoi, scaledPoints, scaleRatio);
    }

    // Draw shadow & screen for each scaled layer, including new layers
    ['coloredTiles','dots','delaunayCircles','delaunay','voronoiEdges','voronoiFilled','coloredTilesBelowVoronoi','coloredTilesAboveVoronoi'].forEach(layer => {
      if (layers[`${layer}Shadow`]) {
        applyShadowToScaledBuffer(scaledBuffers[layer], scaledBuffers[`${layer}Shadow`], layer, scaleRatio); // Pass scaleRatio
      }
      if (layers[`${layer}Screen`]) {
        applyScreenToScaledBuffer(scaledBuffers[`${layer}Screen`], layer, bigWidth, bigHeight);
      }
    });

    // Composite in correct order into tempCanvas
    tempCanvas.push();
    tempCanvas.noTint();

    // Colored Tiles
    if (layers.coloredTilesShadow) {
      tempCanvas.tint(255, getShadowOpacity('coloredTiles'));
      tempCanvas.image(scaledBuffers.coloredTilesShadow, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.coloredTiles) {
      tempCanvas.tint(255, getLayerOpacity('coloredTiles'));
      tempCanvas.image(scaledBuffers.coloredTiles, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.coloredTilesScreen) {
      tempCanvas.tint(255, getScreenOpacity('coloredTiles'));
      tempCanvas.image(scaledBuffers.coloredTilesScreen, 0, 0);
      tempCanvas.noTint();
    }

    // Dots
    if (layers.dotsShadow) {
      tempCanvas.tint(255, getShadowOpacity('dots'));
      tempCanvas.image(scaledBuffers.dotsShadow, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.dots) {
      tempCanvas.tint(255, getLayerOpacity('dots'));
      tempCanvas.image(scaledBuffers.dots, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.dotsScreen) {
      tempCanvas.tint(255, getScreenOpacity('dots'));
      tempCanvas.image(scaledBuffers.dotsScreen, 0, 0);
      tempCanvas.noTint();
    }

    // Delaunay Circles
    if (layers.delaunayCirclesShadow) {
      tempCanvas.tint(255, getShadowOpacity('delaunayCircles'));
      tempCanvas.image(scaledBuffers.delaunayCirclesShadow, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.delaunayCircles) {
      tempCanvas.tint(255, getLayerOpacity('delaunayCircles'));
      tempCanvas.image(scaledBuffers.delaunayCircles, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.delaunayCirclesScreen) {
      tempCanvas.tint(255, getScreenOpacity('delaunayCircles'));
      tempCanvas.image(scaledBuffers.delaunayCirclesScreen, 0, 0);
      tempCanvas.noTint();
    }

    // Delaunay Triangulation
    if (layers.delaunayShadow) {
      tempCanvas.tint(255, getShadowOpacity('delaunay'));
      tempCanvas.image(scaledBuffers.delaunayShadow, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.delaunay) {
      tempCanvas.tint(255, getLayerOpacity('delaunay'));
      tempCanvas.image(scaledBuffers.delaunay, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.delaunayScreen) {
      tempCanvas.tint(255, getScreenOpacity('delaunay'));
      tempCanvas.image(scaledBuffers.delaunayScreen, 0, 0);
      tempCanvas.noTint();
    }

    // Voronoi Edges
    if (layers.voronoiEdgesShadow) {
      tempCanvas.tint(255, getShadowOpacity('voronoiEdges'));
      tempCanvas.image(scaledBuffers.voronoiEdgesShadow, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.voronoiEdges) {
      tempCanvas.tint(255, getLayerOpacity('voronoiEdges'));
      tempCanvas.image(scaledBuffers.voronoiEdges, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.voronoiEdgesScreen) {
      tempCanvas.tint(255, getScreenOpacity('voronoiEdges'));
      tempCanvas.image(scaledBuffers.voronoiEdgesScreen, 0, 0);
      tempCanvas.noTint();
    }
    
    // Colored Tiles Below Voronoi
    if (layers.coloredTilesBelowVoronoiShadow) {
      tempCanvas.tint(255, getShadowOpacity('coloredTilesBelowVoronoi'));
      tempCanvas.image(scaledBuffers.coloredTilesBelowVoronoiShadow, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.coloredTilesBelowVoronoi) {
      tempCanvas.tint(255, getLayerOpacity('coloredTilesBelowVoronoi'));
      tempCanvas.image(scaledBuffers.coloredTilesBelowVoronoi, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.coloredTilesBelowVoronoiScreen) {
      tempCanvas.tint(255, getScreenOpacity('coloredTilesBelowVoronoi'));
      tempCanvas.image(scaledBuffers.coloredTilesBelowVoronoiScreen, 0, 0);
      tempCanvas.noTint();
    }

    // Voronoi Filled
    if (layers.voronoiFilledShadow) {
      tempCanvas.tint(255, getShadowOpacity('voronoiFilled'));
      tempCanvas.image(scaledBuffers.voronoiFilledShadow, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.voronoiFilled) {
      tempCanvas.tint(255, getLayerOpacity('voronoiFilled'));
      tempCanvas.image(scaledBuffers.voronoiFilled, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.voronoiFilledScreen) {
      tempCanvas.tint(255, getScreenOpacity('voronoiFilled'));
      tempCanvas.image(scaledBuffers.voronoiFilledScreen, 0, 0);
      tempCanvas.noTint();
    }


    // Colored Tiles Above Voronoi
    if (layers.coloredTilesAboveVoronoiShadow) {
      tempCanvas.tint(255, getShadowOpacity('coloredTilesAboveVoronoi'));
      tempCanvas.image(scaledBuffers.coloredTilesAboveVoronoiShadow, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.coloredTilesAboveVoronoi) {
      tempCanvas.tint(255, getLayerOpacity('coloredTilesAboveVoronoi'));
      tempCanvas.image(scaledBuffers.coloredTilesAboveVoronoi, 0, 0);
      tempCanvas.noTint();
    }
    if (layers.coloredTilesAboveVoronoiScreen) {
      tempCanvas.tint(255, getScreenOpacity('coloredTilesAboveVoronoi'));
      tempCanvas.image(scaledBuffers.coloredTilesAboveVoronoiScreen, 0, 0);
      tempCanvas.noTint();
    }

    tempCanvas.pop();

    // Save the composited image
    tempCanvas.save('exported_scaled_' + scale + 'x.png');

    scaledBuffers.forEach(canvas => {
      canvas.remove();
    });
  }


}

// Helper functions for scaled drawing
function drawColoredTilesScaled(voronoi, buffer, scaledPoints, scaleRatio) {
  buffer.clear();
  buffer.push();
  let palette = getTilePalette();
  for (let i = 0; i < scaledPoints.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue; // Ensure polygon exists
    buffer.fill(palette[colorIndexes[i]] || '#FAAB36');
    buffer.noStroke();
    buffer.beginShape();
    polygon.forEach(([x , y]) => buffer.vertex(x , y)); // Scale coordinates
    buffer.endShape(CLOSE);
  }
  buffer.pop();
}

function drawDotsScaled(buffer, scaledPoints, scaleRatio) {
  buffer.clear();
  buffer.push();
  let dotColor = color(getDotsColor());
  let weight = getDotsWeight() * scaleRatio; // Scale line weight
  buffer.fill(dotColor.levels[0], dotColor.levels[1], dotColor.levels[2], 255);
  buffer.noStroke();
  for (let [sx, sy] of scaledPoints) {
    buffer.ellipse(sx, sy, weight, weight);
  }
  buffer.pop();
}

function drawDelaunayScaled(delaunay, buffer, scaledPoints, scaleRatio) {
  buffer.clear();
  buffer.push();
  let edgeColor = color(getDelaunayEdgeColor());
  let weight = getDelaunayEdgeWeight() * scaleRatio; // Scale line weight
  buffer.stroke(edgeColor.levels[0], edgeColor.levels[1], edgeColor.levels[2], 255);
  buffer.strokeWeight(weight);
  buffer.noFill();
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    let t0 = delaunay.triangles[i];
    let t1 = delaunay.triangles[i + 1];
    let t2 = delaunay.triangles[i + 2];
    buffer.line(scaledPoints[t0][0], scaledPoints[t0][1], scaledPoints[t1][0], scaledPoints[t1][1]);
    buffer.line(scaledPoints[t1][0], scaledPoints[t1][1], scaledPoints[t2][0], scaledPoints[t2][1]);
    buffer.line(scaledPoints[t2][0], scaledPoints[t2][1], scaledPoints[t0][0], scaledPoints[t0][1]);
  }
  buffer.pop();
}

function drawDelaunayCirclesScaled(delaunay, buffer, scaledPoints, scaleRatio) {
  buffer.clear();
  buffer.push();
  let circleColor = color(getDelaunayCircleColor());
  let weight = getDelaunayCircleWeight() * scaleRatio; // Scale line weight
  buffer.stroke(circleColor.levels[0], circleColor.levels[1], circleColor.levels[2], 255);
  buffer.strokeWeight(weight);
  buffer.noFill();
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    let t0 = delaunay.triangles[i];
    let t1 = delaunay.triangles[i + 1];
    let t2 = delaunay.triangles[i + 2];
    let [x0, y0] = scaledPoints[t0];
    let [x1, y1] = scaledPoints[t1];
    let [x2, y2] = scaledPoints[t2];

    // Calculate the circumcenter
    let D = 2 * (x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1));
    let Ux = ((x0 * x0 + y0 * y0) * (y1 - y2) + (x1 * x1 + y1 * y1) * (y2 - y0) + (x2 * x2 + y2 * y2) * (y0 - y1)) / D;
    let Uy = ((x0 * x0 + y0 * y0) * (x2 - x1) + (x1 * x1 + y1 * y1) * (x0 - x2) + (x2 * x2 + y2 * y2) * (x1 - x0)) / D;

    // Calculate the circumradius
    let r = dist(Ux, Uy, x0, y0); // Scale radius

    buffer.ellipse(Ux, Uy, r * 2, r * 2);
  }
  buffer.pop();
}

function drawVoronoiEdgesScaled(voronoi, buffer, scaleRatio) {
  buffer.clear();
  buffer.push();
  let edgeColor = color(getVoronoiEdgeColor());
  let weight = getEdgeWeight() * scaleRatio; // Scale line weight
  buffer.stroke(edgeColor.levels[0], edgeColor.levels[1], edgeColor.levels[2], 255);
  buffer.strokeWeight(weight);
  buffer.noFill();
  for (let i = 0; i < points.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
    buffer.beginShape();
    polygon.forEach(([x, y]) => buffer.vertex(x, y)); // Scale coordinates
    buffer.endShape(CLOSE);
  }
  buffer.pop();
}

function drawVoronoiFilledScaled(voronoi, buffer, scaledPoints, scaleRatio) {
  buffer.clear();
  buffer.push();
  let fillColor = color(getVoronoiFillColor());
  for (let i = 0; i < scaledPoints.length; i++) {
    if (filledCells.includes(i)) {
      let polygon = voronoi.cellPolygon(i);
      if (!polygon) continue; // Ensure polygon exists
      buffer.fill(fillColor.levels[0], fillColor.levels[1], fillColor.levels[2], 255);
      buffer.noStroke();
      buffer.beginShape();
      polygon.forEach(([x, y]) => buffer.vertex(x, y)); // Scale coordinates
      buffer.endShape(CLOSE);
    }
  }
  buffer.pop();
}

function applyBlurAndThresholdScaled(buffer, layer, scaleRatio) {
  let blurAmount = getBlurAmount(layer) * scaleRatio; // Scale blur amount
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
      buffer.pixels[i + 3] = 0;
    }
  }
  buffer.updatePixels();
}

function applyShadowToScaledBuffer(srcBuffer, shadowBuffer, layer, scaleRatio) {
  shadowBuffer.clear();
  shadowBuffer.image(srcBuffer, 0, 0);
  let blurAmount = getShadowBlur(layer) * scaleRatio; // Scale the blur amount
  if (blurAmount > 0) {
    shadowBuffer.filter(BLUR, blurAmount);
  }
  shadowBuffer.loadPixels();
  let shadowClr = color(layers[`${layer}ShadowColor`] || '#000000');
  for (let i = 0; i < shadowBuffer.pixels.length; i += 4) {
    shadowBuffer.pixels[i] = red(shadowClr);
    shadowBuffer.pixels[i + 1] = green(shadowClr);
    shadowBuffer.pixels[i + 2] = blue(shadowClr);
  }
  shadowBuffer.updatePixels();
}

function applyScreenToScaledBuffer(screenBuffer, layer, bigWidth, bigHeight) {
  screenBuffer.clear();
  screenBuffer.noStroke();
  let sc = getScreenColor(layer);
  let so = getScreenOpacity(layer);
  let overlayColor = color(sc);
  overlayColor.setAlpha(so);
  screenBuffer.fill(overlayColor);
  screenBuffer.rect(0, 0, bigWidth, bigHeight);
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
      requestAllLayersRedraw();
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
  if (currentEditingLayer === 'coloredTilesBelowVoronoi') {
    let i = findClosestPointIndex(mouseX, mouseY);
    if (i !== null) {
      colorIndexesBelowVoronoi[i] = (colorIndexesBelowVoronoi[i] + 1) % getTilePaletteBelowVoronoi().length;
      requestRedraw('coloredTilesBelowVoronoi');
    }
  } else if (currentEditingLayer === 'coloredTilesAboveVoronoi') {
    let i = findClosestPointIndex(mouseX, mouseY);
    if (i !== null) {
      colorIndexesAboveVoronoi[i] = (colorIndexesAboveVoronoi[i] + 1) % getTilePaletteAboveVoronoi().length;
      requestRedraw('coloredTilesAboveVoronoi');
    }
  }
}

// Example helper to find the nearest point
function findClosestPointIndex(x, y) {
  let minDist = Infinity;
  let index = null;
  for (let i = 0; i < points.length; i++) {
    let d = dist(x, y, points[i][0], points[i][1]);
    if (d < minDist) {
      minDist = d;
      index = i;
    }
  }
  return index;
}

function mouseDragged() {
  if (!isMouseInCanvas()) return;

  if (currentEditingLayer === 'dots' && selectedDotIndex !== null) {
    points[selectedDotIndex] = [mouseX + offsetX, mouseY + offsetY];
    requestAllLayersRedraw();
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
// Helper function for naming and saving
function saveCanvasLayer(g, filename) {
  // Make an HTML canvas copy from the p5.Graphics object
  let c = createImage(g.width, g.height);
  c.copy(g, 0, 0, g.width, g.height, 0, 0, g.width, g.height);
  c.save(filename + '.png');
}

function drawColoredTilesBelowVoronoiScaled(voronoi, buffer, scaledPoints, scaleRatio) {
  buffer.clear();
  buffer.push();
  let palette = getTilePaletteBelowVoronoi();
  for (let i = 0; i < scaledPoints.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
    let c = palette[colorIndexesBelowVoronoi[i] || 0] || '#000000';
    if (c.toLowerCase() !== 'invisible') {
      buffer.fill(c);
      buffer.noStroke();
      buffer.beginShape();
      polygon.forEach(([x, y]) => buffer.vertex(x, y));
      buffer.endShape(CLOSE);
    }
  }
  buffer.pop();
}

function drawColoredTilesAboveVoronoiScaled(voronoi, buffer, scaledPoints, scaleRatio) {
  buffer.clear();
  buffer.push();
  let palette = getTilePaletteAboveVoronoi();
  for (let i = 0; i < scaledPoints.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon) continue;
    let c = palette[colorIndexesAboveVoronoi[i] || 0] || '#000000';
    if (c.toLowerCase() !== 'invisible') {
      buffer.fill(c);
      buffer.noStroke();
      buffer.beginShape();
      polygon.forEach(([x, y]) => buffer.vertex(x, y));
      buffer.endShape(CLOSE);
    }
  }
  buffer.pop();
}