/**
* 211118 - The Zebra says "King Me!" 🦓♟️
* --------------------------------------------------
* https://metamoar.notion.site/2f5088eb913c478f8e8410ff0987cecd
*/
let zOff = 0
let phase = 0

// HSL
let colors = [[344,100,69],[37,100,50],[50,100,49],[104,100,32],[174,62,47],[252,86,58]]

/**
 * 🧰 Settings
 * --------------------------------------------------
 * These can also be configured through ?queryString params ✨
 * @todo Add these to right click menu
 */
function preload () {
  params = Object.assign({
    fps: 30,
    noiseMax: 3,
    recordTime: 14,
    recordWidth: windowWidth,
    recordHeight: windowHeight
  }, getURLParams())

  // ccapture
  if (+params.record) {
    window.capturer = new CCapture({
      format: 'webm',
      framerate: +params.fps,
      verbose: true,
      display: true,
      timeLimit: +params.recordTime
    })
  }
}

/**
 * 🎨 Main draw loop
 */
function draw () {
  // Record
  if (frameCount === 1 && +params.record) {
    capturer.start()
  }
  
  // Pacemaker
  period = +params.fps * +params.recordTime
  progress = (frameCount % period) / period
  
  // Checkered pattern
  noStroke()
  let count = 0
  let columns = 20
  let w = width / columns
  let h = w

  for (let y = -2; y < h * 1.5; y ++) {
    for (let x = 0; x < columns; x++) {
      let yShift = h * 2 * progress * 2
      
      if ((++count + y) % 2 === 0) {
        fill(255)
      } else {
        fill(0)
      }

      rect(w * x, y * h + yShift - h * 2, w, h)
    }
  }

  // Circles
  noStroke()
  strokeWeight(2)
  noFill()

  push()
  translate(width / 2, height / 2)
  let size = max(width, height) * .5
  let ringWidth = size / (colors.length * 2)
  let numRings = size / ringWidth - 3

  for (let n = 0; n < numRings; n++) {
    // let color = [...colors[wrap(n + floor(colors.length * 4 * progress), 0, colors.length)]]
    let color = [...colors[wrap(n, 0, colors.length)]]
    
    fill(color)
    // color[2] -= 10
    // stroke(color)

    beginShape()
    for (let a = 0; a < TWO_PI; a += radians(1)) {
      let xOff = map(cos(a + phase), -1, 1, 0, +params.noiseMax)
      let yOff = map(sin(a + phase), -1, 1, 0, +params.noiseMax)
      let r = map(noise(xOff, yOff, zOff), 0, 1, size * .7, size * 1)

      r = r - n * ringWidth
      
      let x = r * cos(a)
      let y = r * sin(a)
      vertex(x, y)
    }
    endShape(CLOSE)
  }
  pop()

  if (+params.record || +params.loop) {
    if (progress < .5) {
      phase += 0.003
      zOff += 0.05
    } else {
      phase -= 0.003
      zOff -= 0.05
    }
  } else {
    phase += 0.003
    zOff += 0.05
  }
  
  // Overlay
  image(noiseOverlay, 0, 0)

  // Record
  if (+params.record) {
    capturer.capture(canvas)
  }  
}




/**
 * Setup scene
 */
function setupScene (skipObjects = false) {
  _renderer.position(width / 2 - width / 2, height / 2 - height / 2, 'fixed')
  offscreen.position(width / 2 - width / 2, height / 2 - height / 2, 'fixed')
  noiseOverlay.position(width / 2 - width / 2, height / 2 - height / 2, 'fixed')

  // Setup noise overlay
  noiseOverlay.pixelDensity(1)
  noiseOverlay.loadPixels()
  for (let i = 0; i < noiseOverlay.pixels.length; i += 4 * 6) {
    noiseOverlay.pixels[i] = 255
    noiseOverlay.pixels[i+1] = 255
    noiseOverlay.pixels[i+2] = 255
    noiseOverlay.pixels[i+3] = random(60)

    noiseOverlay.pixels[i+4] = 255
    noiseOverlay.pixels[i+5] = 255
    noiseOverlay.pixels[i+6] = 255
    noiseOverlay.pixels[i+7] = random(60)
  }
  noiseOverlay.updatePixels()
  // Without this the sketch will freeze!
  noiseOverlay.pixels = []

  // Recreate objects
  if (!skipObjects) {

  }
}

/**
 * Sketch entry point
 */
function setup () {
  !+params.record && params.fps && frameRate(params.fps)
  let w = windowWidth
  let h = windowHeight

  if (+params.record) {
    w = +params.recordWidth
    h = +params.recordHeight
  }

  createCanvas(w, h)
  offscreen = createGraphics(width, height)
  noiseOverlay = createGraphics(width, height)

  if (+params.record) {
    pixelDensity(1)
    offscreen.pixelDensity(1)
    noiseOverlay.pixelDensity(1)
  }
  
  colorMode(HSL, 360, 100, 100, 100)

  setupScene()
}

/**
 * Tap with two fingers to recreate sketch
 */
function touchStarted () {
  if (touches.length > 1) {
    keyPressed()
  }
}

/**
 * Handle keypressed across multiple files
 */
function windowResized () {
  let w = windowWidth
  let h = windowHeight
  if (+params.record) {
    w = +params.recordWidth
    h = +params.recordHeight
  }
  
  resizeCanvas(w, h)
  offscreen.resizeCanvas(width, height)
  noiseOverlay.resizeCanvas(width, height)
  setupScene(false)
}

/**
 * Handle keypressed across multiple files
 */
function keyPressed () {
  frameCount = 0
  setupScene()
}