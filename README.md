# pxt-matrix-sprites

Sprite bank, moving objects, and trail effects for NeoPixel matrix panels.

Depends on [pxt-matrix-core](https://github.com/rolandbachkiss/pxt-matrix-core).

## Overview

- **Sprite bank** — store up to 16 RGB sprites encoded as hex strings
- **Object system** — attach sprites to moving objects with integer-pixel velocities and automatic boundary bouncing
- **Trail Dots** — single-pixel animated dots with configurable trails, speed control, and bouncing
- **Transparency** — one configurable transparent color (default: magenta `#FF00FF`) is skipped during rendering

---

## Quick start

### Bouncing sprite

```typescript
matrixCore.initNeoPixel(DigitalPin.P0, MatrixLayout.Grid2x2)

const smiley = matrixSprites.createSprite(5, 5, matrixSprites.SMILEY_HEX)
matrixSprites.addObject(smiley, 0, 0, 1, 1)

basic.forever(function () {
    matrixCore.clear()
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(70)
})
```

### Trail dot with fading trail

```typescript
matrixCore.initNeoPixel(DigitalPin.P0, MatrixLayout.Grid2x2)

const dot = matrixSprites.createTrailDot(0, 15, 1, 0, 2, 0, 255, 0, 4, 100)
matrixSprites.setTrailDotBounceWalls(dot, true)

basic.forever(function () {
    matrixSprites.updateTrailDots()
    matrixCore.updateDisplay()
    basic.pause(80)
})
```

---

## Concepts

### Sprites

A **sprite** is a bitmap stored in the sprite bank. Sprites are static — they don't move on their own.

```typescript
const id = matrixSprites.createSprite(width, height, hexString)
matrixSprites.drawSprite(id, x, y)
matrixSprites.drawSprite(id, x, y, flipX, flipY)  // with optional flipping
```

- Up to **16 sprites** in the bank
- Hex string format: 6 hex chars per pixel (`RRGGBB`), row-major order
- Magenta `FF00FF` is transparent by default — change with `setTransparentColor`

### Objects

An **object** is a sprite that moves automatically with position, velocity, bounce behaviour, and an optional **trail decay** effect.

```typescript
const obj = matrixSprites.addObject(spriteId, x, y, vx, vy, decay)
```

Game loop:

```typescript
basic.forever(function () {
    matrixCore.clear()
    matrixSprites.updateObjects()   // move + apply trail decay
    matrixSprites.drawObjects()     // draw all visible objects
    matrixCore.updateDisplay()
    basic.pause(80)
})
```

#### Trail decay

The `decay` parameter (0–255) controls how quickly old pixels fade:

| Value | Effect |
|-------|--------|
| `255` | No trail — old position is fully cleared |
| `200` | Short comet tail (~3–4 frames) |
| `100` | Medium fading trail (~5–6 frames) |
| `0`   | Instant clear behind the sprite |

```typescript
matrixSprites.setDecay(obj, 100)           // enable trail
matrixSprites.setPosition(obj, 10, 10)     // teleport (clears trail)
matrixSprites.setVelocity(obj, -1, 1)      // change direction
matrixSprites.setVisible(obj, false)       // hide
```

### Trail Dots

A **trail dot** is a single pixel that moves with a fading trail. All trail management is automatic — no manual buffer handling.

```typescript
const dot = matrixSprites.createTrailDot(
    0, 15,       // starting position
    1, 0,        // direction: right
    2,           // speed: 2 pixels per frame
    0, 255, 0,   // color: green
    4,           // trail length: 4 slots
    100          // decay factor
)
matrixSprites.setTrailDotBounceWalls(dot, true)

basic.forever(function () {
    matrixSprites.updateTrailDots()
    matrixCore.updateDisplay()
    basic.pause(80)
})
```

#### Speed control

Change speed at runtime for queueing, traffic lights, stop-and-go:

```typescript
matrixSprites.setTrailDotSpeed(dot, 0)   // stop
matrixSprites.setTrailDotSpeed(dot, 2)   // resume
```

#### Bouncing

Two independent modes:

```typescript
matrixSprites.setTrailDotBounceWalls(dot, true)   // reflect off screen edges
matrixSprites.setTrailDotBounceDots(dot, true)    // reflect off other trail dots
```

When `bounceFromDots` is enabled on two dots, they reflect off each other on collision.

#### Trail length

A pixel at slot `k` has been decayed `k` times. With `decay = 100` (factor 100/256 ≈ 39%):

| Slot | Brightness | Visibility |
|------|-----------|------------|
| 0 (current) | 100% | Full |
| 1 | 39% | Bright |
| 2 | 15% | Dim |
| 3 | 6% | Faint |
| 4+ | ~0% | Gone |

So `trailLength = 4` gives a 3-pixel visible trail.

#### Fast movement

When speed > 1, the dot draws every pixel it passes through with a brightness gradient — dim where it came from, bright at the current position. This creates a smooth streak with no gaps.

---

## API reference

### Sprites

| Block | Description |
|-------|-------------|
| `create sprite width w height h from hex hexData` | Create sprite, return ID |
| `draw sprite id at x x y y` | Draw sprite at position |
| `draw sprite id at x x y y flipX fx flipY fy` | Draw with optional flipping |
| `set transparent color red r green g blue b` | Change transparency color |

### Objects

| Block | Description |
|-------|-------------|
| `add object sprite spriteId at x x y y velocity vx vx vy vy` | Create moving object |
| `add object sprite spriteId at x x y y velocity vx vx vy vy decay decay` | With trail |
| `update objects` | Move all objects, apply trail decay |
| `draw all objects` | Draw all visible objects |
| `set object id visible v` | Show/hide |
| `set object id position x x y y` | Teleport |
| `set object id velocity vx vx vy vy` | Change speed/direction |
| `set object id trail decay decay` | Change trail length |

### Trail Dots

| Block | Description |
|-------|-------------|
| `create trail dot at x x y y dir vx vx vy vy speed speed color red r green g blue b trail trailLength decay decay` | Create, return ID |
| `update trail dots` | Decay trails, advance positions, bounce, draw |
| `set trail dot id speed speed` | Change speed (0 = stopped) |
| `set trail dot id direction vx vx vy vy` | Change direction |
| `set trail dot id bounce from walls on` | Enable wall bouncing |
| `set trail dot id bounce from other dots on` | Enable dot-to-dot bouncing |
| `set trail dot id position x x y y` | Teleport (clears trail) |
| `set trail dot id visible v` | Show/hide |

### Built-in sprites

| Constant | Size | Description |
|----------|------|-------------|
| `SMILEY_W`, `SMILEY_H`, `SMILEY_HEX` | 5×5 | Yellow smiley face |
| `SHIP_W`, `SHIP_H`, `SHIP_HEX` | 7×5 | Spaceship |

---

## Dependencies

- [pxt-matrix-core](https://github.com/rolandbachkiss/pxt-matrix-core) — pixel buffer, display update, layout abstraction

## License

MIT © Roland Bach Kiss
