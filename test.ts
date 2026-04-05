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

for (let i = 0; i < 60; i++) {
    matrixCore.clear()
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(70)
}
basic.pause(500)

// ---------------------------------------------------------------------------
// Test 9: Trail decay — addObject with decay param (long trail)
// ---------------------------------------------------------------------------
// A single smiley crosses the screen horizontally with a comet-like trail.
// DO NOT call matrixCore.clear() inside the loop — trail accumulates in the buffer.
matrixCore.clear()
matrixCore.updateDisplay()

const trailObj = matrixSprites.addObject(smiley, 0, 13, 1, 0, 160)
// factor 160/256 ≈ 62.5% each frame → ~8-frame visible tail

for (let i = 0; i < 50; i++) {
    matrixSprites.updateObjects()   // moves + decays old bbox
    matrixSprites.drawObjects()     // draws new position
    matrixCore.updateDisplay()
    basic.pause(60)
}
basic.pause(800)
matrixCore.clear()
matrixCore.updateDisplay()

// ---------------------------------------------------------------------------
// Test 10: setDecay — change decay factor mid-flight
// ---------------------------------------------------------------------------
// Start with no trail, then switch to a heavy trail mid-way across the screen.
matrixCore.clear()
matrixCore.updateDisplay()

const dynObj = matrixSprites.addObject(smiley, 0, 20, 1, 0, 255)   // no trail initially

for (let i = 0; i < 14; i++) {
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(60)
}

// Enable long trail halfway across
matrixSprites.setDecay(dynObj, 128)

for (let i = 0; i < 20; i++) {
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(60)
}
basic.pause(800)
matrixCore.clear()
matrixCore.updateDisplay()

// ---------------------------------------------------------------------------
// Test 11: Two objects with different decay factors (trail length comparison)
// ---------------------------------------------------------------------------
// Top object: short trail (decay=210).  Bottom object: long trail (decay=128).
matrixCore.clear()
matrixCore.updateDisplay()

const shortTrail = matrixSprites.addObject(ship, 0, 4,  1, 0, 210)
const longTrail  = matrixSprites.addObject(ship, 0, 22, 1, 0, 128)

for (let i = 0; i < 50; i++) {
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(60)
}
basic.pause(1000)

// ---------------------------------------------------------------------------
// Test 12: Bouncing with trails (final forever loop)
// ---------------------------------------------------------------------------
matrixCore.clear()
matrixCore.updateDisplay()

const tb1 = matrixSprites.addObject(smiley, 2, 2, 1, 1, 190)
const tb2 = matrixSprites.addObject(ship, 20, 20, -1, -1, 160)

basic.forever(function () {
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(70)
})
