// test.ts — comprehensive visual tests for pxt-matrix-sprites

// ---------------------------------------------------------------------------
// Initialize the matrix
// ---------------------------------------------------------------------------
matrixCore.initNeoPixel(DigitalPin.P0, MatrixLayout.Grid2x2)

const red = matrixCore.rgb(255, 0, 0)
const green = matrixCore.rgb(0, 255, 0)
const blue = matrixCore.rgb(0, 0, 255)
const yellow = matrixCore.rgb(255, 255, 0)
const white = matrixCore.rgb(255, 255, 255)

// ---------------------------------------------------------------------------
// Create a single sprite
// ---------------------------------------------------------------------------
matrixCore.clear()
const smiley = matrixSprites.createSprite(
    matrixSprites.SMILEY_W,
    matrixSprites.SMILEY_H,
    matrixSprites.SMILEY_HEX
)

// ---------------------------------------------------------------------------
// Test 9: Trail decay — addObject with decay param (long trail)
// ---------------------------------------------------------------------------
// A single smiley crosses the screen horizontally with a comet-like trail.
// DO NOT call matrixCore.clear() inside the loop — trail accumulates in the buffer.
matrixCore.clear()
matrixCore.updateDisplay()

const trailObj = matrixSprites.addObject(smiley, 0, 13, 1, 0, 100)
// decay=100: ~3-frame visible tail (each slot decayed once per frame)

for (let i = 0; i < 50; i++) {
    matrixSprites.updateObjects()   // moves + decays old bbox
    matrixSprites.drawObjects()     // draws new position
    matrixCore.updateDisplay()
    basic.pause(60)
}
basic.pause(800)
matrixCore.clear()
matrixCore.updateDisplay()
