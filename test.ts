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
matrixSprites.setDecay(dynObj, 100)

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
// Top object: short trail (decay=100).  Bottom object: long trail (decay=160).
matrixCore.clear()
matrixCore.updateDisplay()

const shortTrail = matrixSprites.addObject(ship, 0, 4, 1, 0, 100)
const longTrail = matrixSprites.addObject(ship, 0, 22, 1, 0, 160)

for (let i = 0; i < 50; i++) {
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(60)
}
basic.pause(1000)

// ── Test 1: 180° head-on collision ──────────────────────────────────────────
// Dot 1: starts at (5,15), moves right at speed 2
// Dot 2: starts at (25,15), moves left at speed 2
// Distance: 20 pixels. Closing rate: 4 px/frame. Collision at frame 5.
// Collision point: (15,15)
// After collision: both reverse → dot1 goes left, dot2 goes right
matrixCore.clear()
matrixCore.updateDisplay()

const h1 = matrixSprites.createTrailDot(5, 15, 1, 0, 2, 255, 0, 0, 4, 100)
const h2 = matrixSprites.createTrailDot(25, 15, -1, 0, 2, 0, 0, 255, 4, 100)
matrixSprites.setTrailDotBounceWalls(h1, true)
matrixSprites.setTrailDotBounceWalls(h2, true)
matrixSprites.setTrailDotBounceDots(h1, true)
matrixSprites.setTrailDotBounceDots(h2, true)

// Run for 40 frames (collision at frame 5, then 35 frames of post-collision motion)
for (let i = 0; i < 40; i++) {
    matrixSprites.updateTrailDots()
    matrixCore.updateDisplay()
    basic.pause(80)
}
basic.pause(1000)

// Hide test 1 dots
matrixSprites.setTrailDotVisible(h1, false)
matrixSprites.setTrailDotVisible(h2, false)
matrixCore.clear()
matrixCore.updateDisplay()
basic.pause(500)

// ── Test 2: 90° perpendicular collision ──────────────────────────────────────
// Dot 3: starts at (15,5), moves down (+Y) at speed 2
// Dot 4: starts at (25,15), moves left (-X) at speed 2
// Dot 3 reaches y=15 after 5 frames: (15, 5+2*5) = (15,15)
// Dot 4 reaches x=15 after 5 frames: (25-2*5, 15) = (15,15)
// Collision point: (15,15) at frame 5
// After collision: both reverse → dot3 goes up, dot4 goes right
matrixCore.clear()
matrixCore.updateDisplay()

const v1 = matrixSprites.createTrailDot(15, 5, 0, 1, 2, 255, 0, 0, 4, 100)
const v2 = matrixSprites.createTrailDot(25, 15, -1, 0, 2, 0, 0, 255, 4, 100)
matrixSprites.setTrailDotBounceWalls(v1, true)
matrixSprites.setTrailDotBounceWalls(v2, true)
matrixSprites.setTrailDotBounceDots(v1, true)
matrixSprites.setTrailDotBounceDots(v2, true)

for (let i = 0; i < 40; i++) {
    matrixSprites.updateTrailDots()
    matrixCore.updateDisplay()
    basic.pause(80)
}
basic.pause(1000)

// Hide test 2 dots
matrixSprites.setTrailDotVisible(v1, false)
matrixSprites.setTrailDotVisible(v2, false)
matrixCore.clear()
matrixCore.updateDisplay()
basic.pause(500)

// ── Test 3: 45° diagonal head-on collision ────────────────────────────────────
// Dot 5: starts at (5,5), moves down-right (+X,+Y) at speed 2
// Dot 6: starts at (25,25), moves up-left (-X,-Y) at speed 2
// Both move 2 px/frame on each axis. Closing rate: 4 px/frame per axis.
// Distance on each axis: 20 pixels. Collision at frame 5.
// Collision point: (15,15)
// After collision: both reverse → dot5 goes up-left, dot6 goes down-right
matrixCore.clear()
matrixCore.updateDisplay()

const d1 = matrixSprites.createTrailDot(5, 5, 1, 1, 2, 255, 0, 0, 4, 100)
const d2 = matrixSprites.createTrailDot(25, 25, -1, -1, 2, 0, 0, 255, 4, 100)
matrixSprites.setTrailDotBounceWalls(d1, true)
matrixSprites.setTrailDotBounceWalls(d2, true)
matrixSprites.setTrailDotBounceDots(d1, true)
matrixSprites.setTrailDotBounceDots(d2, true)

for (let i = 0; i < 40; i++) {
    matrixSprites.updateTrailDots()
    matrixCore.updateDisplay()
    basic.pause(80)
}
basic.pause(1000)

// Hide test 3 dots
matrixSprites.setTrailDotVisible(d1, false)
matrixSprites.setTrailDotVisible(d2, false)
matrixCore.clear()
matrixCore.updateDisplay()
basic.pause(500)

// ── Test 4: 45° mixed angle collision ─────────────────────────────────────────
// Dot 7: starts at (5,25), moves up-right (+X,-Y) at speed 2
// Dot 8: starts at (25,5), moves down-left (-X,+Y) at speed 2
// Dot 7 at frame 5: x=5+10=15, y=25-10=15 → (15,15) ✓
// Dot 8 at frame 5: x=25-10=15, y=5+10=15 → (15,15) ✓
// Collision point: (15,15) at frame 5
// After collision: both reverse → dot7 goes down-left, dot8 goes up-right
matrixCore.clear()
matrixCore.updateDisplay()

const m1 = matrixSprites.createTrailDot(5, 25, 1, -1, 2, 255, 0, 0, 4, 100)
const m2 = matrixSprites.createTrailDot(25, 5, -1, 1, 2, 0, 0, 255, 4, 100)
matrixSprites.setTrailDotBounceWalls(m1, true)
matrixSprites.setTrailDotBounceWalls(m2, true)
matrixSprites.setTrailDotBounceDots(m1, true)
matrixSprites.setTrailDotBounceDots(m2, true)

for (let i = 0; i < 40; i++) {
    matrixSprites.updateTrailDots()
    matrixCore.updateDisplay()
    basic.pause(80)
}
basic.pause(1000)

// Hide test 4 dots
matrixSprites.setTrailDotVisible(m1, false)
matrixSprites.setTrailDotVisible(m2, false)
matrixCore.clear()
matrixCore.updateDisplay()
basic.pause(500)

// ── Test 5: Free-bouncing demo (forever loop) ────────────────────────────────
// Two dots with wall bouncing and dot-to-dot bouncing, running indefinitely.
// Observe multiple collisions over time.
matrixCore.clear()
matrixCore.updateDisplay()

const f1 = matrixSprites.createTrailDot(3, 3, 1, 1, 2, 255, 0, 0, 4, 100)
const f2 = matrixSprites.createTrailDot(28, 28, -1, -1, 2, 0, 0, 255, 4, 100)
matrixSprites.setTrailDotBounceWalls(f1, true)
matrixSprites.setTrailDotBounceWalls(f2, true)
matrixSprites.setTrailDotBounceDots(f1, true)
matrixSprites.setTrailDotBounceDots(f2, true)

basic.forever(function () {
    matrixSprites.updateTrailDots()
    matrixCore.updateDisplay()
    basic.pause(80)
})

// ── Test 15: Trail Dot system demo ────────────────────────────────────────────
// Demonstrates the new built-in Trail Dot API — no manual buffer management.
//
// Dot A (red):    slow, 1 px/frame, short trail, bounces off walls
// Dot B (yellow): medium, 2 px/frame, medium trail, bounces off walls
// Dot C (green):  fast, 4 px/frame, long trail, bounces off walls
// Dot D (blue):   medium, 2 px/frame, medium trail, bounces off other dots
//
// All dots bounce off screen edges. Dot D also bounces off other dots.

matrixCore.clear()
matrixCore.updateDisplay()
matrixCore.setBrightness(40)

// Create trail dots using the new API
const dotA = matrixSprites.createTrailDot(5, 5, 1, 1, 1, 255, 0, 0, 2, 30)
const dotB = matrixSprites.createTrailDot(15, 10, 1, -1, 2, 255, 220, 0, 4, 100)
const dotC = matrixSprites.createTrailDot(25, 20, -1, -1, 4, 0, 255, 0, 8, 30)
const dotD = matrixSprites.createTrailDot(10, 25, -1, 1, 2, 0, 0, 255, 4, 100)

// Enable wall bouncing for all dots
matrixSprites.setTrailDotBounceWalls(dotA, true)
matrixSprites.setTrailDotBounceWalls(dotB, true)
matrixSprites.setTrailDotBounceWalls(dotC, true)
matrixSprites.setTrailDotBounceWalls(dotD, true)

// Enable dot-to-dot bouncing for dot D only
matrixSprites.setTrailDotBounceDots(dotD, true)

basic.forever(function () {
    matrixSprites.updateTrailDots()
    matrixCore.updateDisplay()
    basic.pause(80)
})
