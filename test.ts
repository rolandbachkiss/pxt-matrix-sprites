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
// Tests 12–15: Trail isolation tests
//
// ROOT CAUSE FIX — why the old trail never died:
//   decayRegion was called only on the dot's CURRENT pixel, once per frame.
//   But the dot revisits each pixel only once per full lap (116 frames), so
//   every pixel was refreshed to full brightness each lap and only decayed
//   once — net result: the entire square path glowed permanently.
//
//   The fix: maintain an explicit circular trail buffer of the last N positions.
//   Every frame, every position in that buffer is decayed. The pixel at age N
//   receives N decay multiplications before the dot returns, so it truly dies.
//
// Trail buffer approach:
//   - TRAIL_A = 2 slots, factor 30  → pixel at age 1: idiv(31×30,256)=3  visible
//                                      pixel at age 2: idiv( 3×30,256)=0  gone
//   - TRAIL_B = 4 slots, factor 100 → age1=12, age2=4, age3=1, age4=0  (3 px)
//   (dot brightness stored ≈ 31 raw at setBrightness(40), drawColor 200)
//
// Speeds:
//   Dot A: moves every 2nd frame (frame counter mod 2 == 0) — half speed
//   Dot B: moves every frame — full speed (1 step/tick, no skip)
//   Same 80 ms frame rate for both; B is visually twice as fast as A.
//
// Square paths (non-overlapping, intersecting):
//   Square A: x0=2,  y0=2,  w=20, h=15  perimeter = 2×(20+15)−4 = 66 steps
//   Square B: x0=10, y0=3,  w=10, h=20  perimeter = 2×(10+20)−4 = 56 steps
//   They share pixels along two vertical overlap segments.
// ---------------------------------------------------------------------------

// Hide every object created in tests 1–11 so updateObjects() is silent.
for (let _h = 0; _h < 12; _h++) { matrixSprites.setVisible(_h, false) }

matrixCore.clear()
matrixCore.updateDisplay()
matrixCore.setBrightness(40)

// ── Square path helpers ──────────────────────────────────────────────────────
// sqWalk maps an integer step to a pixel (x,y) on the perimeter of a
// rectangle with top-left corner (x0,y0), width w, height h.
// Walk order: top → right → bottom ← left ↑ (clockwise).
// Perimeter = 2*(w+h) - 4 steps (corners counted once).
// Writes result into out[0] (x) and out[1] (y).
function sqWalk(step: number, x0: number, y0: number, w: number, h: number, out: number[]): void {
    const wm1 = w - 1   // last column index within rect
    const hm1 = h - 1   // last row index within rect
    const perim = (wm1 + hm1) * 2
    const s = step % perim
    if (s < wm1) {                          // top edge →
        out[0] = x0 + s;           out[1] = y0
    } else if (s < wm1 + hm1) {            // right edge ↓
        out[0] = x0 + wm1;         out[1] = y0 + (s - wm1)
    } else if (s < wm1 * 2 + hm1) {        // bottom edge ←
        out[0] = x0 + wm1 - (s - (wm1 + hm1)); out[1] = y0 + hm1
    } else {                                // left edge ↑
        out[0] = x0;               out[1] = y0 + hm1 - (s - (wm1 * 2 + hm1))
    }
}

// Square A: 20 wide × 15 tall, top-left at (2,2), perimeter = 2*(19+14) = 66
const SA_X0 = 2;  const SA_Y0 = 2;  const SA_W = 20; const SA_H = 15
const SA_PERIM = (SA_W - 1 + SA_H - 1) * 2   // 66

// Square B: 10 wide × 20 tall, top-left at (10,3), perimeter = 2*(9+19) = 56
const SB_X0 = 10; const SB_Y0 = 3;  const SB_W = 10; const SB_H = 20
const SB_PERIM = (SB_W - 1 + SB_H - 1) * 2   // 56

// Square C (top-right): 9 wide × 14 tall, x0=23, y0=0, perimeter = 2*(8+13) = 42
const SC_X0 = 23; const SC_Y0 = 0;  const SC_W = 9;  const SC_H = 14
const SC_PERIM = (SC_W - 1 + SC_H - 1) * 2   // 42

// Square E (bottom-left): 10 wide × 14 tall, x0=0, y0=18, perimeter = 2*(9+13) = 44
const SE_X0 = 0;  const SE_Y0 = 18; const SE_W = 10; const SE_H = 14
const SE_PERIM = (SE_W - 1 + SE_H - 1) * 2   // 44

// ── Trail buffers ────────────────────────────────────────────────────────────
// Each trail buffer holds the last N (x,y) pairs the dot visited.
// Every frame every slot is decayed so the pixel truly dies after N frames.
//
// Dot A (slow, 1-px trail): 2 slots, factor 30
//   Age-1 pixel: idiv(31×30,256) = 3  (just visible at brightness 40)
//   Age-2 pixel: idiv( 3×30,256) = 0  (gone)
//
// Dot B (fast, 3-px trail): 4 slots, factor 100
//   Age-1: idiv(31×100,256) = 12  Age-2: 4  Age-3: 1  Age-4: 0

const TRAIL_A_LEN = 2
const TRAIL_B_LEN = 4
const DECAY_A = 30
const DECAY_B = 100

// Dot C (green, 2 px/frame): 4 slots (2 frames of history), factor 30
const TRAIL_C_LEN = 4

// Dot E (orange, 4 px/frame): 8 slots (2 frames of history), factor 30
const TRAIL_E_LEN = 8
const DECAY_E = 30

// Flat arrays: trailA[i*2]=x, trailA[i*2+1]=y; sentinel (-1,-1) = not yet used
const trailA: number[] = [-1, -1, -1, -1]               // 2 slots × 2
const trailB: number[] = [-1, -1, -1, -1, -1, -1, -1, -1]  // 4 slots × 2

// Dot C: 4 slots × 2
const trailC: number[] = [-1, -1, -1, -1, -1, -1, -1, -1]
// Dot E: 8 slots × 2
const trailE: number[] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]

let stepC = 0   // step counter for dot C (green, 2 px/frame)
let stepE = 0   // step counter for dot E (orange, 4 px/frame)

// Rotate a trail buffer: push new (nx,ny) at front, drop oldest.
function trailPush(trail: number[], len: number, nx: number, ny: number): void {
    // Shift everything one slot toward the back
    for (let ti = len - 1; ti > 0; ti--) {
        trail[ti * 2]     = trail[(ti - 1) * 2]
        trail[ti * 2 + 1] = trail[(ti - 1) * 2 + 1]
    }
    trail[0] = nx
    trail[1] = ny
}

// Decay every valid slot in a trail buffer (1×1 region — for single-pixel dots).
function trailDecay(trail: number[], len: number, factor: number): void {
    for (let ti = 0; ti < len; ti++) {
        const tx = trail[ti * 2]
        const ty = trail[ti * 2 + 1]
        if (tx < 0) continue    // sentinel — not yet written
        matrixCore.decayRegion(tx, ty, 1, 1, 0, 0, 0, 0, factor)
    }
}

// Decay every valid slot in a trail buffer for an sw×sh sprite.
// Skips pixels that are already covered by the sprite's current position
// (curX, curY) so freshly drawn pixels are not pre-dimmed.
function trailDecaySprite(trail: number[], len: number, sw: number, sh: number,
                          curX: number, curY: number, factor: number): void {
    for (let ti = 0; ti < len; ti++) {
        const tx = trail[ti * 2]
        const ty = trail[ti * 2 + 1]
        if (tx < 0) continue    // sentinel — not yet written
        matrixCore.decayRegion(tx, ty, sw, sh, curX, curY, sw, sh, factor)
    }
}

// Advance a dot N steps along a square path, pushing each intermediate position
// into the trail buffer AND drawing each pixel. This prevents gaps that would
// appear if only the destination were drawn.
// Must be called while setBrightness is at the desired dot brightness.
// Returns the new step counter.
function sqAdvance(steps: number, step: number,
                   x0: number, y0: number, w: number, h: number,
                   perim: number, trail: number[], trailLen: number,
                   posOut: number[], r: number, g: number, b: number): number {
    let s = step
    for (let di = 0; di < steps; di++) {
        sqWalk(s, x0, y0, w, h, posOut)
        trailPush(trail, trailLen, posOut[0], posOut[1])
        matrixCore.setPixelXY(posOut[0], posOut[1], r, g, b)
        s = (s + 1) % perim
    }
    return s
}

const posA: number[] = [0, 0]
const posB: number[] = [0, 0]
const posC: number[] = [0, 0]
const posE: number[] = [0, 0]

// ── Test 12: Dot A alone, 3 laps ─────────────────────────────────────────────
// Cyan dot on Square A (20×15). Moves every 2nd frame (half speed).
// 1-pixel trail: one faint pixel behind, then gone.
matrixCore.clear()
matrixCore.updateDisplay()

let stepA = 0
let frameA = 0
sqWalk(stepA, SA_X0, SA_Y0, SA_W, SA_H, posA)

// 3 full laps × SA_PERIM steps, but dot moves every 2nd frame → 3×66×2 = 396 ticks
for (let i = 0; i < SA_PERIM * 3 * 2; i++) {
    trailDecay(trailA, TRAIL_A_LEN, DECAY_A)
    if (frameA % 2 === 0) {     // move only on even frames
        trailPush(trailA, TRAIL_A_LEN, posA[0], posA[1])
        stepA = (stepA + 1) % SA_PERIM
        sqWalk(stepA, SA_X0, SA_Y0, SA_W, SA_H, posA)
    }
    frameA++
    matrixCore.setPixelXY(posA[0], posA[1], 255, 0, 0)   // red
    matrixCore.updateDisplay()
    basic.pause(80)
}
basic.pause(600)
matrixCore.clear()
matrixCore.updateDisplay()

// ── Test 13: Dot B alone, 3 laps ─────────────────────────────────────────────
// Yellow dot on Square B (10×20). Moves every frame (full speed).
// 3-pixel trail: 3 faint pixels behind, then gone.
matrixCore.clear()
matrixCore.updateDisplay()

let stepB = 0
sqWalk(stepB, SB_X0, SB_Y0, SB_W, SB_H, posB)

// 3 full laps × SB_PERIM = 3×56 = 168 ticks
for (let i = 0; i < SB_PERIM * 3; i++) {
    trailDecay(trailB, TRAIL_B_LEN, DECAY_B)
    trailPush(trailB, TRAIL_B_LEN, posB[0], posB[1])
    stepB = (stepB + 1) % SB_PERIM
    sqWalk(stepB, SB_X0, SB_Y0, SB_W, SB_H, posB)
    matrixCore.setPixelXY(posB[0], posB[1], 255, 220, 0)   // yellow
    matrixCore.updateDisplay()
    basic.pause(80)
}
basic.pause(600)
matrixCore.clear()
matrixCore.updateDisplay()

// ── Test 14: Both dots together ───────────────────────────────────────────────
// A (cyan, slow, 1-px trail) on Square A.
// B (yellow, fast, 3-px trail) on Square B.
// They intersect along the right side of Square B / interior of Square A.
// Run until A completes 2 full laps (2×66×2 = 264 ticks).
matrixCore.clear()
matrixCore.updateDisplay()

// Reset trail buffers
for (let ti = 0; ti < TRAIL_A_LEN * 2; ti++) trailA[ti] = -1
for (let ti = 0; ti < TRAIL_B_LEN * 2; ti++) trailB[ti] = -1

stepA = 0; stepB = 0; frameA = 0
sqWalk(stepA, SA_X0, SA_Y0, SA_W, SA_H, posA)
sqWalk(stepB, SB_X0, SB_Y0, SB_W, SB_H, posB)

for (let i = 0; i < SA_PERIM * 2 * 2; i++) {
    trailDecay(trailA, TRAIL_A_LEN, DECAY_A)
    trailDecay(trailB, TRAIL_B_LEN, DECAY_B)
    // Dot A: move every 2nd frame
    if (frameA % 2 === 0) {
        trailPush(trailA, TRAIL_A_LEN, posA[0], posA[1])
        stepA = (stepA + 1) % SA_PERIM
        sqWalk(stepA, SA_X0, SA_Y0, SA_W, SA_H, posA)
    }
    // Dot B: move every frame
    trailPush(trailB, TRAIL_B_LEN, posB[0], posB[1])
    stepB = (stepB + 1) % SB_PERIM
    sqWalk(stepB, SB_X0, SB_Y0, SB_W, SB_H, posB)
    frameA++
    matrixCore.setPixelXY(posA[0], posA[1], 255, 0, 0)     // red
    matrixCore.setPixelXY(posB[0], posB[1], 255, 220, 0)   // yellow
    matrixCore.updateDisplay()
    basic.pause(80)
}
basic.pause(600)
matrixCore.clear()
matrixCore.updateDisplay()

// ── Test 15: 4 dots + 2 sprites (combined forever loop) ───────────────────────
// Dot A (slow, red):     Square A, 1 px/frame every 2nd frame, 1-px trail
// Dot B (fast, yellow):  Square B, 1 px/frame, 3-px trail
// Dot C (green):         Square C (top-right), 2 px/frame, 2-frame trail
// Dot E (orange):        Square E (bottom-left), 4 px/frame, 2-frame trail
// Disc C (blue):   bounces diagonally, 1-px trail (same decay as dot A)
// Disc D (violet): walks Square D 15×15 from (5,10), 3-px trail (same as dot B)
//
// Fast dots (C, E) draw EVERY pixel they pass through — no gaps.
// The trail decay makes the discrete frames look like a continuous streak.
//
// Sprites are blue/violet discs drawn at setBrightness(25) with color values
// halved in the hex data (80 = 128 dec) so intensity ≈ idiv(128*25/255) = 12
// raw per active channel — visibly dimmer than the full-color dots at brightness 40.

matrixCore.clear()
matrixCore.updateDisplay()
matrixCore.setBrightness(25)   // dim for sprites

// 5×5 disc: corners transparent (FF00FF), body colored.
// Color values are halved (80 = 128/255) so sprites appear less intense
// than the dots even though both share the same setBrightness(25).
const T = "FF00FF"   // transparent

// Disc C — blue
const discBlueHex = (
    T + "000080" + "000080" + "000080" + T +
    "000080" + "000080" + "000080" + "000080" + "000080" +
    "000080" + "000080" + "000080" + "000080" + "000080" +
    "000080" + "000080" + "000080" + "000080" + "000080" +
    T + "000080" + "000080" + "000080" + T
)
const discBlue = matrixSprites.createSprite(5, 5, discBlueHex)

// Disc D — violet (red + blue halved)
const discVioletHex = (
    T + "800080" + "800080" + "800080" + T +
    "800080" + "800080" + "800080" + "800080" + "800080" +
    "800080" + "800080" + "800080" + "800080" + "800080" +
    "800080" + "800080" + "800080" + "800080" + "800080" +
    T + "800080" + "800080" + "800080" + T
)
const discViolet = matrixSprites.createSprite(5, 5, discVioletHex)

// Disc C state — bouncing diagonally
let cX = 8; let cY = 4; let cVX = 1; let cVY = 1
const trailDiscC: number[] = [-1, -1, -1, -1]   // 2 slots, decay 30 → 1-px trail

// Disc D state — walking Square D: 15×15 from (5,10)
const SD_X0 = 5; const SD_Y0 = 10; const SD_W = 15; const SD_H = 15
const SD_PERIM = (SD_W - 1 + SD_H - 1) * 2   // 56
let stepD = 0
const posD: number[] = [0, 0]
sqWalk(stepD, SD_X0, SD_Y0, SD_W, SD_H, posD)
const trailDiscD: number[] = [-1, -1, -1, -1, -1, -1, -1, -1]  // 4 slots, decay 100 → 3-px trail

// Reset dot trail buffers and step counters for the forever loop
for (let ti = 0; ti < TRAIL_A_LEN * 2; ti++) trailA[ti] = -1
for (let ti = 0; ti < TRAIL_B_LEN * 2; ti++) trailB[ti] = -1
for (let ti = 0; ti < TRAIL_C_LEN * 2; ti++) trailC[ti] = -1
for (let ti = 0; ti < TRAIL_E_LEN * 2; ti++) trailE[ti] = -1
stepA = 0; stepB = 0; stepC = 0; stepE = 0; frameA = 0
sqWalk(stepA, SA_X0, SA_Y0, SA_W, SA_H, posA)
sqWalk(stepB, SB_X0, SB_Y0, SB_W, SB_H, posB)
sqWalk(stepC, SC_X0, SC_Y0, SC_W, SC_H, posC)
sqWalk(stepE, SE_X0, SE_Y0, SE_W, SE_H, posE)

let frameD = 0   // disc D moves every frame (same speed as dot B)

basic.forever(function () {
    // ── Decay all trails ──
    trailDecay(trailA, TRAIL_A_LEN, DECAY_A)
    trailDecay(trailB, TRAIL_B_LEN, DECAY_B)
    trailDecay(trailC, TRAIL_C_LEN, DECAY_A)
    trailDecay(trailE, TRAIL_E_LEN, DECAY_E)
    // Sprites: decay the full 5×5 footprint per trail slot, skipping current position
    trailDecaySprite(trailDiscC, TRAIL_A_LEN, 5, 5, cX, cY, DECAY_A)
    trailDecaySprite(trailDiscD, TRAIL_B_LEN, 5, 5, posD[0], posD[1], DECAY_B)

    // ── Advance dot A (slow — every 2nd frame) ──
    if (frameA % 2 === 0) {
        trailPush(trailA, TRAIL_A_LEN, posA[0], posA[1])
        stepA = (stepA + 1) % SA_PERIM
        sqWalk(stepA, SA_X0, SA_Y0, SA_W, SA_H, posA)
    }

    // ── Advance dot B (1 px/frame) ──
    trailPush(trailB, TRAIL_B_LEN, posB[0], posB[1])
    stepB = (stepB + 1) % SB_PERIM
    sqWalk(stepB, SB_X0, SB_Y0, SB_W, SB_H, posB)

    // ── Advance disc C (bounce) ──
    trailPush(trailDiscC, TRAIL_A_LEN, cX, cY)
    cX += cVX; cY += cVY
    if (cX < 0)         { cX = 0;  cVX = -cVX }
    else if (cX > 27)   { cX = 27; cVX = -cVX }   // 32-5=27: keep 5×5 disc inside
    if (cY < 0)         { cY = 0;  cVY = -cVY }
    else if (cY > 27)   { cY = 27; cVY = -cVY }

    // ── Advance disc D (square walk, every frame) ──
    trailPush(trailDiscD, TRAIL_B_LEN, posD[0], posD[1])
    stepD = (stepD + 1) % SD_PERIM
    sqWalk(stepD, SD_X0, SD_Y0, SD_W, SD_H, posD)

    frameA++

    // ── Draw ──
    // Sprites at dim brightness (already set to 25); colors baked into hex data
    matrixSprites.drawSprite(discBlue,   cX,       cY)
    matrixSprites.drawSprite(discViolet, posD[0],  posD[1])

    // Dots at higher brightness — temporarily boost, draw, restore
    matrixCore.setBrightness(40)
    // Slow dots (A, B): 1 px/frame, draw individually
    matrixCore.setPixelXY(posA[0], posA[1], 255, 0, 0)     // red dot A (slow)
    matrixCore.setPixelXY(posB[0], posB[1], 255, 220, 0)   // yellow dot B
    // Fast dots (C, E): walk and draw every pixel, no gaps
    stepC = sqAdvance(2, stepC, SC_X0, SC_Y0, SC_W, SC_H, SC_PERIM, trailC, TRAIL_C_LEN, posC, 0, 255, 0)
    stepE = sqAdvance(4, stepE, SE_X0, SE_Y0, SE_W, SE_H, SE_PERIM, trailE, TRAIL_E_LEN, posE, 255, 140, 0)
    matrixCore.setBrightness(25)   // back to sprite brightness for next decay cycle

    matrixCore.updateDisplay()
    basic.pause(80)
})
