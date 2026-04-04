# pxt-matrix-sprites

Sprite bank and moving object system for NeoPixel matrix panels. Extends [pxt-matrix-core](https://github.com/rolandbachkiss/pxt-matrix-core) with a sprite rendering pipeline and a simple physics-bounce object system.

## Overview

- **Sprite bank** – store up to 16 RGB sprites encoded as hex strings
- **Object system** – attach sprites to moving objects with integer-pixel velocities and automatic boundary bouncing
- **Transparency** – one configurable transparent color (default: magenta `#FF00FF`) is skipped during rendering

---

## Sprite format

Sprites are defined as a **hex string** of RGB pixel data in row-major order.

Each pixel is encoded as 6 hex characters: `RRGGBB`.

For a 5×5 sprite the hex string is `5 × 5 × 6 = 150` characters long.

```
"FFD700FFD700FFD700..." // 25 yellow pixels
```

Pixels whose color exactly matches the current transparent color (default `FF00FF`) are not written to the display buffer — they let the background show through.

---

## API reference

### Sprites group

#### `createSprite(w, h, hexData)` → number
Parse a hex string and register a sprite in the bank. Returns a **sprite ID** (0-based) to use with the other functions.

```typescript
const smiley = matrixSprites.createSprite(5, 5, matrixSprites.SMILEY_HEX)
```

#### `drawSprite(id, x, y, flipX?, flipY?)`
Render sprite `id` at pixel position `(x, y)` on the back buffer. Optional `flipX` and `flipY` mirror the sprite horizontally or vertically before drawing.

```typescript
matrixSprites.drawSprite(smiley, 3, 2)
matrixSprites.drawSprite(ship,   10, 0, true, false)  // mirror horizontally
```

#### `setTransparentColor(r, g, b)`
Change the color that is treated as fully transparent during rendering.

```typescript
matrixSprites.setTransparentColor(255, 0, 255)  // default magenta
matrixSprites.setTransparentColor(0, 0, 0)      // treat black as transparent
```

---

### Objects group

Objects combine a sprite with a position and velocity. The object system updates all objects in one call and bounces them inside the matrix boundaries.

#### `addObject(spriteId, x, y, vx, vy)` → number
Create a moving object and return its **object ID**.

```typescript
const id = matrixSprites.addObject(smiley, 0, 0, 1, 1)
```

#### `updateObjects()`
Advance every visible object by its velocity. Boundaries are clamped to `[0, matrixWidth - spriteWidth]` and `[0, matrixHeight - spriteHeight]`. When an axis hits a boundary the velocity on that axis is negated (bounced). `flipX` is automatically set to `true` when `vx < 0`.

#### `drawObjects()`
Render all visible objects to the back buffer using their current positions and flip states.

#### `setVisible(id, v)`
Show (`true`) or hide (`false`) an object without deleting it.

#### `setPosition(id, x, y)`
Teleport an object to a specific pixel coordinate.

#### `setVelocity(id, vx, vy)`
Change an object's velocity. `flipX` is updated on the next `updateObjects()` call.

---

## Built-in demo sprites

Two ready-to-use sprite constants are exported for convenience:

| Constant | Size | Description |
|----------|------|-------------|
| `SMILEY_HEX` | 5×5 | Yellow smiley face, transparent corners |
| `SHIP_HEX` | 7×5 | Spaceship pointing right, transparent background |

Use `SMILEY_W` / `SMILEY_H` and `SHIP_W` / `SHIP_H` for the dimensions.

### Smiley pixel layout (5×5)

```
T  Y  Y  Y  T    row 0
Y  B  Y  B  Y    row 1  (eyes)
Y  Y  Y  Y  Y    row 2  (cheeks)
Y  B  Y  B  Y    row 3  (mouth)
T  Y  Y  Y  T    row 4

T = FF00FF (transparent)
Y = FFD700 (yellow)
B = 000000 (black)
```

### Ship pixel layout (7×5)

```
T   T   T   R   T   T   T    row 0
T   LB  LB  LB  R   R   T    row 1
R   LB  W   LB  LB  R   R    row 2  (cockpit)
T   LB  LB  LB  R   R   T    row 3
T   T   T   R   T   T   T    row 4

T  = FF00FF (transparent)
R  = FF0000 (red)
LB = 00AAFF (light blue)
W  = FFFFFF (white cockpit)
```

---

## Basic usage

```typescript
matrixCore.initNeoPixel(DigitalPin.P0, MatrixLayout.Grid2x2)

const smileyId = matrixSprites.createSprite(
    matrixSprites.SMILEY_W,
    matrixSprites.SMILEY_H,
    matrixSprites.SMILEY_HEX
)
matrixSprites.addObject(smileyId, 0, 0, 1, 1)

basic.forever(function () {
    matrixCore.clear()
    matrixSprites.updateObjects()
    matrixSprites.drawObjects()
    matrixCore.updateDisplay()
    basic.pause(70)
})
```

---

## Dependencies

- [pxt-matrix-core](https://github.com/rolandbachkiss/pxt-matrix-core) — pixel buffer, display update, layout abstraction
- [pxt-neopixel](https://github.com/microsoft/pxt-neopixel) v0.7.6

## License

MIT © Roland Bach Kiss
