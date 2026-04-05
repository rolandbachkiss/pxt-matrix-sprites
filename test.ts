// test.ts — comprehensive visual tests for pxt-matrix-sprites

// ---------------------------------------------------------------------------
// Step 1: Initialize the matrix
// ---------------------------------------------------------------------------
matrixCore.initNeoPixel(DigitalPin.P0, MatrixLayout.Grid2x2)

const red = matrixCore.rgb(255, 0, 0)
const green = matrixCore.rgb(0, 255, 0)
const blue = matrixCore.rgb(0, 0, 255)
const yellow = matrixCore.rgb(255, 255, 0)
const white = matrixCore.rgb(255, 255, 255)

// ---------------------------------------------------------------------------
// Test 1: Create and draw a single sprite (no movement)
// ---------------------------------------------------------------------------
matrixCore.clear()
const smiley = matrixSprites.createSprite(
    matrixSprites.SMILEY_W,
    matrixSprites.SMILEY_H,
    matrixSprites.SMILEY_HEX
)
// Draw at center
matrixSprites.drawSprite(smiley, 14, 14)
matrixCore.updateDisplay()
basic.pause(2000)

// ---------------------------------------------------------------------------
// Test 2: Sprite with flipping
// ---------------------------------------------------------------------------
matrixCore.clear()
// Normal smiley
matrixSprites.drawSprite(smiley, 4, 4, false, false)
// Flipped horizontally
matrixSprites.drawSprite(smiley, 20, 4, true, false)
// Flipped vertically
matrixSprites.drawSprite(smiley, 4, 20, false, true)
// Flipped both ways
matrixSprites.drawSprite(smiley, 20, 20, true, true)
matrixCore.updateDisplay()
basic.pause(2000)

// ---------------------------------------------------------------------------
// Test 3: Custom sprite from hex data (simple 3x3 arrow)
// ---------------------------------------------------------------------------
// 3x3 arrow pointing right (R=red, T=transparent magenta)
// Row 0: T T R
// Row 1: R R R
// Row 2: T T R
const arrowHex = "FF00FFFF00FFFF0000FF00FF00FFFF0000FF00FFFF00FFFF00"
const arrow = matrixSprites.createSprite(3, 3, arrowHex)
matrixCore.clear()
matrixSprites.drawSprite(arrow, 14, 14)
matrixCore.updateDisplay()
basic.pause(2000)

// ---------------------------------------------------------------------------
// Test 4: Multiple objects with automatic movement
// ---------------------------------------------------------------------------
matrixCore.clear()
const ship = matrixSprites.createSprite(
    matrixSprites.SHIP_W,
    matrixSprites.SHIP_H,
    matrixSprites.SHIP_HEX
)

// Add two objects moving in different directions
const obj1 = matrixSprites.addObject(smiley, 2, 2, 1, 1)
const obj2 = matrixSprites.addObject(ship, 20, 20, -1, -1)

for (let i = 0; i < 50; i++) {
    matrixCore.clear()
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(70)
}
basic.pause(1000)

// ---------------------------------------------------------------------------
// Test 5: Object visibility toggle
// ---------------------------------------------------------------------------
matrixCore.clear()
matrixSprites.setPosition(obj1, 8, 8)
matrixSprites.setPosition(obj2, 20, 8)
matrixSprites.setVisible(obj1, true)
matrixSprites.setVisible(obj2, true)
matrixSprites.drawObjects()
matrixCore.updateDisplay()
basic.pause(1000)

matrixSprites.setVisible(obj1, false)  // Hide smiley
matrixCore.clear()
matrixSprites.drawObjects()  // Only ship visible
matrixCore.updateDisplay()
basic.pause(1000)

matrixSprites.setVisible(obj1, true)
matrixSprites.setVisible(obj2, false)  // Hide ship
matrixCore.clear()
matrixSprites.drawObjects()  // Only smiley visible
matrixCore.updateDisplay()
basic.pause(1000)

// ---------------------------------------------------------------------------
// Test 6: Teleport objects with setPosition
// ---------------------------------------------------------------------------
matrixSprites.setVisible(obj2, true)
for (let i = 0; i < 5; i++) {
    matrixCore.clear()
    matrixSprites.setPosition(obj1, i * 6, 8)
    matrixSprites.setPosition(obj2, i * 6, 20)
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(500)
}

// ---------------------------------------------------------------------------
// Test 7: Change velocity mid-animation
// ---------------------------------------------------------------------------
matrixCore.clear()
matrixSprites.setPosition(obj1, 8, 8)
matrixSprites.setPosition(obj2, 20, 20)
matrixSprites.setVelocity(obj1, 2, 2)  // Faster
matrixSprites.setVelocity(obj2, -1, 1)  // Different direction

for (let i = 0; i < 30; i++) {
    matrixCore.clear()
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(70)
}

// ---------------------------------------------------------------------------
// Test 8: Bouncing sprites demo (4 corners)
// ---------------------------------------------------------------------------
matrixCore.clear()
const s1 = matrixSprites.addObject(smiley, 2, 2, 1, 1)
const s2 = matrixSprites.addObject(smiley, 20, 2, -1, 1)
const s3 = matrixSprites.addObject(ship, 2, 20, 1, -1)
const s4 = matrixSprites.addObject(ship, 20, 20, -1, -1)

basic.forever(function () {
    matrixCore.clear()
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(70)
})
