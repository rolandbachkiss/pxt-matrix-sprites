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

---

## Concepts

### Sprites

A **sprite** is a bitmap stored in the sprite bank. Sprites are static — they don't move on their own. You draw them at any position with `drawSprite`.

```typescript
const id = matrixSprites.createSprite(width, height, hexString)
matrixSprites.drawSprite(id, x, y)
matrixSprites.drawSprite(id, x, y, flipX, flipY)  // with optional flipping
```

- Up to **16 sprites** in the bank
- Hex string format: 6 hex chars per pixel (`RRGGBB`), row-major order
- Magenta `FF00FF` is transparent by default — change with `setTransparentColor`

### Objects

An **object** is a sprite that moves automatically. Each object has position, velocity, bounce behaviour, and an optional **trail decay** effect.

```typescript
const obj = matrixSprites.addObject(spriteId, x, y, vx, vy, decay)
```

In your game loop:

```typescript
basic.forever(function () {
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
| `128` | Long fading trail (~8 frames) |
| `0`   | Instant clear behind the sprite |

The decay is applied to pixels the sprite *left behind*, not to pixels it currently covers. The sprite itself stays at full brightness.

```typescript
// Change trail mid-flight
matrixSprites.setDecay(obj, 128)   // enable long trail
matrixSprites.setDecay(obj, 255)   // disable trail

// Teleport without leaving a trail
matrixSprites.setPosition(obj, 10, 10)

// Change direction
matrixSprites.setVelocity(obj, -1, 1)

// Show / hide
matrixSprites.setVisible(obj, false)
```

### Trail Dots

A **trail dot** is a single pixel that moves with a fading trail. Unlike objects (which use bounding-box decay for sprites), trail dots manage per-pixel trails internally — no manual buffer management needed.

```typescript
const dot = matrixSprites.createTrailDot(
    0, 15,       // starting position
    1, 0,        // direction: right
    2,           // speed: 2 pixels per frame
    0, 255, 0,   // color: green
    4,           // trail length: 4 slots
    100          // decay factor
)

basic.forever(function () {
    matrixSprites.updateTrailDots()   // decay + advance + draw
    matrixCore.updateDisplay()
    basic.pause(80)
})
```

**Speed control** — change speed at runtime for queueing, traffic lights, stop-and-go:

```typescript
matrixSprites.setTrailDotSpeed(dot, 0)   // stop (red light, queue)
matrixSprites.setTrailDotSpeed(dot, 2)   // resume (green light)
```

**Bouncing** — two independent modes:

```typescript
matrixSprites.setTrailDotBounceWalls(dot, true)   // reflect off screen edges
matrixSprites.setTrailDotBounceDots(dot, true)    // reflect off other trail dots
```

When `bounceFromDots` is enabled on two dots, they reflect off each other on collision — useful for cannon-ball effects or simple physics.

**Direction changes** — for path following or AI-driven movement:

```typescript
matrixSprites.setTrailDotDirection(dot, 0, 1)   // turn downward
matrixSprites.setTrailDotDirection(dot, -1, 0)  // turn left
```

**Trail length formula**: a pixel at slot `k` has been decayed `k` times. With `decay = 100` (factor 100/256 ≈ 39%):

| Slot | Brightness | Visibility |
|------|-----------|------------|
| 0 (current) | 100% | Full |
| 1 | 39% | Bright |
| 2 | 15% | Dim |
| 3 | 6% | Faint |
| 4+ | ~0% | Gone |

So `trailLength = 4` gives a 3-pixel visible trail.

**Fast movement** (speed > 1): the dot draws every pixel it passes through with a brightness gradient — dim where it came from, bright at the current position. This creates a smooth streak with no gaps, even at 4 pixels per frame.

### Sprite trails

For sprites (multi-pixel), decay the full bounding box of each trail slot, skipping the sprite's current position:

```typescript
function decaySpriteTrail(trail: number[], len: number,
                          sw: number, sh: number,
                          curX: number, curY: number,
                          factor: number): void {
    for (let ti = 0; ti < len; ti++) {
        const tx = trail[ti * 2]
        const ty = trail[ti * 2 + 1]
        if (tx < 0) continue
        matrixCore.decayRegion(tx, ty, sw, sh, curX, curY, sw, sh, factor)
    }
}
```

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

### Built-in sprites

| Constant | Size | Description |
|----------|------|-------------|
| `SMILEY_W`, `SMILEY_H`, `SMILEY_HEX` | 5×5 | Yellow smiley face |
| `SHIP_W`, `SHIP_H`, `SHIP_HEX` | 7×5 | Spaceship |

### Trail Dots

| Block | Description |
|-------|-------------|
| `create trail dot at x x y y dir vx vx vy vy speed speed color red r green g blue b trail trailLength decay decay` | Create a trail dot, return ID |
| `update trail dots` | Decay trails, advance positions, bounce, draw |
| `set trail dot id speed speed` | Change speed (0 = stopped) |
| `set trail dot id direction vx vx vy vy` | Change direction |
| `set trail dot id bounce from walls on` | Enable wall bouncing |
| `set trail dot id bounce from other dots on` | Enable dot-to-dot bouncing |
| `set trail dot id position x x y y` | Teleport (clears trail) |
| `set trail dot id visible v` | Show/hide |

### Trail Dots

| Block | Description |
|-------|-------------|
| `create trail dot at x x y y dir vx vx vy vy speed speed color red r green g blue b trail trailLength decay decay` | Create a trail dot, return ID |
| `update trail dots` | Decay trails, advance positions, bounce, draw |
| `set trail dot id speed speed` | Change speed (0 = stopped) |
| `set trail dot id direction vx vx vy vy` | Change direction |
| `set trail dot id bounce from walls on` | Enable wall bouncing |
| `set trail dot id bounce from other dots on` | Enable dot-to-dot bouncing |
| `set trail dot id position x x y y` | Teleport (clears trail) |
| `set trail dot id visible v` | Show/hide |

---

## Design decisions

### Why no `number[]` for sprite data?

Sprite pixel data is stored as `Buffer` (one byte per channel) to avoid the memory overhead of boxed numbers. Trail position arrays use `number[]` because they're small (typically 4–16 slots) and need signed integers for the sentinel value `-1`.

### Why `decayRegion` uses factor/256 not factor/255?

`decayRegion` multiplies each byte by `factor` then divides by 256 (integer right-shift). This is the standard fixed-point convention and is faster than division by 255. The decay factor 0–255 maps to 0–99.6% retention per call.

### Why not use `matrixCore.clear()` with trails?

Calling `clear()` erases the trail. Trail effects work by *not* clearing — instead, old pixels are gradually dimmed via `decayRegion` until they reach black naturally.

---

## Dependencies

- [pxt-matrix-core](https://github.com/rolandbachkiss/pxt-matrix-core) — pixel buffer, display update, layout abstraction

## License

MIT © Roland Bach Kiss
