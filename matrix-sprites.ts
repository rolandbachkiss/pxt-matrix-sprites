/**
 * Sprite bank and moving object system for NeoPixel matrix panels.
 * Depends on matrixCore (pxt-matrix-core).
 *
 * Trail effect:
 *   Each object has a decay factor (0–255). On each updateObjects() tick,
 *   the pixels that were in the sprite's PREVIOUS bounding box — but are NOT
 *   in the NEW bounding box — are multiplied by the decay factor in _stripBuf.
 *   This leaves a fading trail behind moving sprites without dimming the pixels
 *   under the new sprite position. The visual trail length is controlled solely
 *   by the decay factor (higher = longer trail).
 */

//% color="#9400D3" weight=80 icon="\uf11b"
//% groups='["Sprites","Objects","Trail Dots"]'
namespace matrixSprites {

    // -----------------------------------------------------------------------
    // Sprite bank — up to 16 sprites
    // -----------------------------------------------------------------------
    const MAX_SPRITES = 16
    let _spriteData: Buffer[] = []
    let _spriteW: number[] = []
    let _spriteH: number[] = []
    let _spriteCount = 0

    // Transparent color (default: pure magenta 0xFF00FF)
    let _transpR = 255
    let _transpG = 0
    let _transpB = 255

    // -----------------------------------------------------------------------
    // Object system — up to 16 objects
    // -----------------------------------------------------------------------
    const MAX_OBJECTS = 16
    const OBJ_TRAIL_LEN = 16   // trail buffer slots per object
    let _objX: number[] = []
    let _objY: number[] = []
    let _objVX: number[] = []
    let _objVY: number[] = []
    let _objSpriteId: number[] = []
    let _objFlipX: boolean[] = []
    let _objFlipY: boolean[] = []
    let _objVisible: boolean[] = []
    // Decay factor per object: 0 = instant clear, 255 = no trail.
    // Stored as a Buffer (1 byte each) to avoid boxed number[] overhead.
    const _objDecay = pins.createBuffer(MAX_OBJECTS)
    // Trail buffers: flat arrays of (x,y) pairs, sentinel -1 = empty
    let _objTrail: number[][] = []
    let _objCount = 0

    // -----------------------------------------------------------------------
    // Built-in demo sprite constants
    // -----------------------------------------------------------------------

    /** Width of the built-in smiley sprite. */
    export const SMILEY_W = 5
    /** Height of the built-in smiley sprite. */
    export const SMILEY_H = 5

    /**
     * Hex data for a 5×5 yellow smiley face.
     * Transparent pixels use magenta (FF00FF).
     * T=FF00FF, Y=FFD700, B=000000
     */
    export const SMILEY_HEX = "FF00FFFFD700FFD700FFD700FF00FFFFD700000000FFD700000000FFD700FFD700FFD700FFD700FFD700FFD700FFD700000000FFD700000000FFD700FF00FFFFD700FFD700FFD700FF00FF"

    /** Width of the built-in spaceship sprite. */
    export const SHIP_W = 7
    /** Height of the built-in spaceship sprite. */
    export const SHIP_H = 5

    /**
     * Hex data for a 7×5 spaceship pointing right.
     * Transparent pixels use magenta (FF00FF).
     * T=FF00FF, R=FF0000, LB=00AAFF, W=FFFFFF
     */
    export const SHIP_HEX = "FF00FFFF00FFFF00FFFF0000FF00FFFF00FFFF00FFFF00FF00AAFF00AAFF00AAFFFF0000FF0000FF00FFFF000000AAFFFFFFFF00AAFF00AAFFFF0000FF0000FF00FF00AAFF00AAFF00AAFFFF0000FF0000FF00FFFF00FFFF00FFFF00FFFF0000FF00FFFF00FFFF00FF"

    // -----------------------------------------------------------------------
    // Sprites
    // -----------------------------------------------------------------------

    /**
     * Create a sprite from hex-encoded RGB pixel data and add it to the sprite bank.
     * Returns the sprite ID (0-based) for use with drawSprite and addObject.
     * @param w sprite width in pixels
     * @param h sprite height in pixels
     * @param hexData hex string, 6 hex chars (RRGGBB) per pixel, row-major order
     */
    //% blockId=matrix_sprites_create
    //% block="create sprite width $w height $h from hex $hexData"
    //% w.defl=5 h.defl=5
    //% group="Sprites" weight=100
    export function createSprite(w: number, h: number, hexData: string): number {
        if (_spriteCount >= MAX_SPRITES) return -1
        const id = _spriteCount
        _spriteData[id] = Buffer.fromHex(hexData)
        _spriteW[id] = w
        _spriteH[id] = h
        _spriteCount++
        return id
    }

    /**
     * Draw a sprite from the sprite bank at position (x, y).
     * Pixels matching the transparent color are skipped.
     * @param id sprite ID returned by createSprite
     * @param x left pixel column on the matrix
     * @param y top pixel row on the matrix
     * @param fx flip horizontally (mirror left-right)
     * @param fy flip vertically (mirror top-bottom)
     */
    //% blockId=matrix_sprites_draw
    //% block="draw sprite $id at x $x y $y || flipX $fx flipY $fy"
    //% fx.defl=false fy.defl=false
    //% expandableArgumentMode="toggle"
    //% group="Sprites" weight=90
    export function drawSprite(id: number, x: number, y: number, fx?: boolean, fy?: boolean): void {
        if (id < 0 || id >= _spriteCount) return
        const buf = _spriteData[id]
        const sw = _spriteW[id]
        const sh = _spriteH[id]
        const flipX = fx === true
        const flipY = fy === true

        for (let row = 0; row < sh; row++) {
            const srcRow = flipY ? sh - 1 - row : row
            for (let col = 0; col < sw; col++) {
                const srcCol = flipX ? sw - 1 - col : col
                const offset = (srcRow * sw + srcCol) * 3
                const r = buf[offset]
                const g = buf[offset + 1]
                const b = buf[offset + 2]
                if (r === _transpR && g === _transpG && b === _transpB) continue
                matrixCore.setPixelXY(x + col, y + row, r, g, b)
            }
        }
    }

    /**
     * Set the transparent color used when rendering sprites.
     * Pixels with exactly this RGB value are not drawn.
     * Default is magenta (255, 0, 255).
     */
    //% blockId=matrix_sprites_transparent
    //% block="set transparent color red $r green $g blue $b"
    //% r.defl=255 g.defl=0 b.defl=255
    //% group="Sprites" weight=80
    export function setTransparentColor(r: number, g: number, b: number): void {
        _transpR = r; _transpG = g; _transpB = b
    }

    // -----------------------------------------------------------------------
    // Objects
    // -----------------------------------------------------------------------

    /**
     * Add a moving object to the scene.
     * Returns the object ID (0-based index).
     * @param spriteId sprite ID from createSprite
     * @param x initial x position (pixels)
     * @param y initial y position (pixels)
     * @param vx horizontal velocity (pixels per update tick)
     * @param vy vertical velocity (pixels per update tick)
     * @param decay trail decay factor 0–255 (255 = no trail, 200 = medium trail, 128 = long trail)
     */
    //% blockId=matrix_sprites_add_object
    //% block="add object sprite $spriteId at x $x y $y velocity vx $vx vy $vy || decay $decay"
    //% decay.defl=255 decay.min=0 decay.max=255
    //% expandableArgumentMode="toggle"
    //% group="Objects" weight=100
    export function addObject(spriteId: number, x: number, y: number, vx: number, vy: number, decay?: number): number {
        if (_objCount >= MAX_OBJECTS) return -1
        const id = _objCount
        _objX[id] = x
        _objY[id] = y
        _objVX[id] = vx
        _objVY[id] = vy
        _objSpriteId[id] = spriteId
        _objFlipX[id] = vx < 0
        _objFlipY[id] = false
        _objVisible[id] = true
        _objDecay[id] = (decay !== undefined) ? decay : 255
        // Pre-allocate trail buffer with sentinel values (-1 = empty)
        const trailBuf: number[] = []
        for (let ti = 0; ti < OBJ_TRAIL_LEN * 2; ti++) {
            trailBuf[ti] = -1
        }
        _objTrail[id] = trailBuf
        _objCount++
        return id
    }
        _objTrail[id] = trailBuf
        _objCount++
        return id
    }

    /**
     * Update all visible objects: integrate positions, bounce at screen edges,
     * and apply trail decay to the pixels the sprite just left.
     *
     * Trail decay: pixels in the old bounding box that are NOT covered by the
     * new bounding box are multiplied by the object's decay factor. The overlap
     * region (covered by both old and new position) is left untouched so the
     * freshly drawn sprite pixels are not pre-dimmed.
     */
    //% blockId=matrix_sprites_update
    //% block="update objects"
    //% group="Objects" weight=90
    export function updateObjects(): void {
        const W = matrixCore.width()
        const H = matrixCore.height()

        // Phase 1: decay trail buffer for all objects
        for (let i = 0; i < _objCount; i++) {
            if (!_objVisible[i]) continue
            const decay = _objDecay[i]
            if (decay >= 255) continue
            const tb = _objTrail[i]
            const sw = _spriteW[_objSpriteId[i]]
            const sh = _spriteH[_objSpriteId[i]]
            const nx = _objX[i]
            const ny = _objY[i]
            for (let ti = 0; ti < OBJ_TRAIL_LEN; ti++) {
                const tx = tb[ti * 2]
                const ty = tb[ti * 2 + 1]
                if (tx < 0) continue
                matrixCore.decayRegion(tx, ty, sw, sh, nx, ny, sw, sh, decay)
            }
        }

        // Phase 2: advance positions with bounce
        for (let i = 0; i < _objCount; i++) {
            if (!_objVisible[i]) continue

            const sid = _objSpriteId[i]
            const sw = _spriteW[sid]
            const sh = _spriteH[sid]

            // Compute new position (with bounce)
            let nx = _objX[i] + _objVX[i]
            let ny = _objY[i] + _objVY[i]
            let vx = _objVX[i]
            let vy = _objVY[i]

            if (nx < 0)        { nx = 0;        vx = -vx }
            else if (nx > W - sw) { nx = W - sw; vx = -vx }
            if (ny < 0)        { ny = 0;        vy = -vy }
            else if (ny > H - sh) { ny = H - sh; vy = -vy }

            // Push current position into trail buffer
            const tb = _objTrail[i]
            for (let ti = OBJ_TRAIL_LEN - 1; ti > 0; ti--) {
                tb[ti * 2]     = tb[(ti - 1) * 2]
                tb[ti * 2 + 1] = tb[(ti - 1) * 2 + 1]
            }
            tb[0] = _objX[i]
            tb[1] = _objY[i]

            _objX[i]  = nx; _objY[i]  = ny
            _objVX[i] = vx; _objVY[i] = vy
            _objFlipX[i] = vx < 0
        }
    }
        }

        // Phase 2: advance positions with bounce
        for (let i = 0; i < _objCount; i++) {
            if (!_objVisible[i]) continue

            const sid = _objSpriteId[i]
            const sw = _spriteW[sid]
            const sh = _spriteH[sid]

            // Compute new position (with bounce)
            let nx = _objX[i] + _objVX[i]
            let ny = _objY[i] + _objVY[i]
            let vx = _objVX[i]
            let vy = _objVY[i]

            if (nx < 0)        { nx = 0;        vx = -vx }
            else if (nx > W - sw) { nx = W - sw; vx = -vx }
            if (ny < 0)        { ny = 0;        vy = -vy }
            else if (ny > H - sh) { ny = H - sh; vy = -vy }

            // Push current position into trail buffer
            const tb = _objTrail[i]
            for (let ti = OBJ_TRAIL_LEN - 1; ti > 0; ti--) {
                tb[ti * 2]     = tb[(ti - 1) * 2]
                tb[ti * 2 + 1] = tb[(ti - 1) * 2 + 1]
            }
            tb[0] = _objX[i]
            tb[1] = _objY[i]

            _objX[i]  = nx; _objY[i]  = ny
            _objVX[i] = vx; _objVY[i] = vy
            _objFlipX[i] = vx < 0
        }
    }

    /**
     * Draw all visible objects to the matrix at their current positions.
     */
    //% blockId=matrix_sprites_draw_all
    //% block="draw all objects"
    //% group="Objects" weight=89
    export function drawObjects(): void {
        for (let i = 0; i < _objCount; i++) {
            if (!_objVisible[i]) continue
            drawSprite(_objSpriteId[i], _objX[i], _objY[i], _objFlipX[i], _objFlipY[i])
        }
    }

    /**
     * Show or hide an object without removing it from the scene.
     */
    //% blockId=matrix_sprites_set_visible
    //% block="set object $id visible $v"
    //% group="Objects" weight=80
    export function setVisible(id: number, v: boolean): void {
        if (id < 0 || id >= _objCount) return
        _objVisible[id] = v
    }

    /**
     * Teleport an object to a new position immediately.
     * Also resets the previous position so no stale trail is left.
     */
    //% blockId=matrix_sprites_set_pos
    //% block="set object $id position x $x y $y"
    //% group="Objects" weight=79
    export function setPosition(id: number, x: number, y: number): void {
        if (id < 0 || id >= _objCount) return
        _objX[id] = x; _objY[id] = y
        // Clear trail buffer so no stale trail is left
        const tb = _objTrail[id]
        if (tb) {
            for (let ti = 0; ti < tb.length; ti++) {
                tb[ti] = -1
            }
        }
    }
        }
    }

    /**
     * Change the velocity of an object.
     * FlipX updates on the next updateObjects() call.
     */
    //% blockId=matrix_sprites_set_velocity
    //% block="set object $id velocity vx $vx vy $vy"
    //% group="Objects" weight=78
    export function setVelocity(id: number, vx: number, vy: number): void {
        if (id < 0 || id >= _objCount) return
        _objVX[id] = vx; _objVY[id] = vy
    }

    /**
     * Set the trail decay factor for an object.
     * 255 = no trail (default), 200 = short trail, 128 = long trail, 0 = instant clear.
     */
    //% blockId=matrix_sprites_set_decay
    //% block="set object $id trail decay $decay"
    //% decay.min=0 decay.max=255 decay.defl=200
    //% group="Objects" weight=77
    export function setDecay(id: number, decay: number): void {
        if (id < 0 || id >= _objCount) return
        _objDecay[id] = decay
    }

    // -----------------------------------------------------------------------
    // Trail Dots — single-pixel animated dots with configurable trails
    // -----------------------------------------------------------------------

    const MAX_TRAIL_DOTS = 8
    const MAX_TRAIL_SLOTS = 16   // max trail length per dot

    // Per-dot state arrays
    let _dotX: number[] = []
    let _dotY: number[] = []
    let _dotVX: number[] = []            // direction: -1, 0, or 1
    let _dotVY: number[] = []
    let _dotSpeed: number[] = []         // pixels per frame (0 = stopped)
    let _dotR: number[] = []
    let _dotG: number[] = []
    let _dotB: number[] = []
    let _dotTrailLen: number[] = []
    let _dotDecay: number[] = []
    let _dotBounceWalls: boolean[] = []
    let _dotBounceDots: boolean[] = []
    let _dotVisible: boolean[] = []
    // Trail buffers: flat arrays of (x,y) pairs, sentinel -1 = empty
    // Pre-allocated to MAX_TRAIL_SLOTS × 2 per dot
    let _dotTrail: number[][] = []
    let _dotCount = 0

    /**
     * Create a trail dot — a single pixel that moves with a fading trail.
     * Returns the dot ID (0-based).
     * @param x starting x position
     * @param y starting y position
     * @param vx horizontal direction: -1 (left), 0 (still), 1 (right)
     * @param vy vertical direction: -1 (up), 0 (still), 1 (down)
     * @param speed pixels moved per update tick (0 = stopped, 1–4 recommended)
     * @param r red component (0–255)
     * @param g green component (0–255)
     * @param b blue component (0–255)
     * @param trailLength number of trail slots (2–16, more = longer visible trail)
     * @param decay decay factor 0–255 (30 = short trail, 100 = medium, 160 = long)
     */
    //% blockId=matrix_sprites_create_trail_dot
    //% block="create trail dot at x $x y $y dir vx $vx vy $vy speed $speed color red $r green $g blue $b trail $trailLength decay $decay"
    //% vx.min=-1 vx.max=1 vx.defl=1
    //% vy.min=-1 vy.max=1 vy.defl=0
    //% speed.min=0 speed.max=8 speed.defl=1
    //% r.min=0 r.max=255 r.defl=255
    //% g.min=0 g.max=255 g.defl=255
    //% b.min=0 b.max=255 b.defl=255
    //% trailLength.min=1 trailLength.max=16 trailLength.defl=4
    //% decay.min=0 decay.max=255 decay.defl=100
    //% group="Trail Dots" weight=100
    export function createTrailDot(
        x: number, y: number,
        vx: number, vy: number,
        speed: number,
        r: number, g: number, b: number,
        trailLength: number,
        decay: number
    ): number {
        if (_dotCount >= MAX_TRAIL_DOTS) return -1
        const id = _dotCount
        _dotX[id] = x
        _dotY[id] = y
        _dotVX[id] = vx
        _dotVY[id] = vy
        _dotSpeed[id] = speed
        _dotR[id] = r
        _dotG[id] = g
        _dotB[id] = b
        _dotTrailLen[id] = trailLength
        _dotDecay[id] = decay
        _dotBounceWalls[id] = false
        _dotBounceDots[id] = false
        _dotVisible[id] = true
        // Pre-allocate trail buffer with sentinel values (-1 = empty)
        const trailBuf: number[] = []
        for (let ti = 0; ti < trailLength * 2; ti++) {
            trailBuf[ti] = -1
        }
        _dotTrail[id] = trailBuf
        _dotCount++
        return id
    }

    /**
     * Enable or disable wall bouncing for a trail dot.
     * When enabled, the dot reflects off screen edges.
     */
    //% blockId=matrix_sprites_dot_bounce_walls
    //% block="set trail dot $id bounce from walls $on"
    //% group="Trail Dots" weight=90
    export function setTrailDotBounceWalls(id: number, on: boolean): void {
        if (id < 0 || id >= _dotCount) return
        _dotBounceWalls[id] = on
    }

    /**
     * Enable or disable dot-to-dot bouncing for a trail dot.
     * When enabled, the dot reflects off other trail dots on collision.
     */
    //% blockId=matrix_sprites_dot_bounce_dots
    //% block="set trail dot $id bounce from other dots $on"
    //% group="Trail Dots" weight=89
    export function setTrailDotBounceDots(id: number, on: boolean): void {
        if (id < 0 || id >= _dotCount) return
        _dotBounceDots[id] = on
    }

    /**
     * Set the speed of a trail dot (pixels per update tick).
     * 0 = stopped (for queueing, traffic lights, etc).
     * 1–4 = recommended range for smooth motion.
     */
    //% blockId=matrix_sprites_dot_speed
    //% block="set trail dot $id speed $speed"
    //% speed.min=0 speed.max=8 speed.defl=1
    //% group="Trail Dots" weight=88
    export function setTrailDotSpeed(id: number, speed: number): void {
        if (id < 0 || id >= _dotCount) return
        _dotSpeed[id] = speed
    }

    /**
     * Set the direction of a trail dot.
     * @param vx horizontal direction: -1 (left), 0, 1 (right)
     * @param vy vertical direction: -1 (up), 0, 1 (down)
     */
    //% blockId=matrix_sprites_dot_direction
    //% block="set trail dot $id direction vx $vx vy $vy"
    //% vx.min=-1 vx.max=1 vx.defl=1
    //% vy.min=-1 vy.max=1 vy.defl=0
    //% group="Trail Dots" weight=87
    export function setTrailDotDirection(id: number, vx: number, vy: number): void {
        if (id < 0 || id >= _dotCount) return
        _dotVX[id] = vx
        _dotVY[id] = vy
    }

    /**
     * Teleport a trail dot to a new position immediately.
     * Clears the trail buffer so no stale trail is left behind.
     */
    //% blockId=matrix_sprites_dot_position
    //% block="set trail dot $id position x $x y $y"
    //% group="Trail Dots" weight=86
    export function setTrailDotPosition(id: number, x: number, y: number): void {
        if (id < 0 || id >= _dotCount) return
        _dotX[id] = x
        _dotY[id] = y
        // Clear trail buffer
        const tb = _dotTrail[id]
        if (tb) {
            for (let ti = 0; ti < tb.length; ti++) {
                tb[ti] = -1
            }
        }
    }

    /**
     * Show or hide a trail dot without removing it.
     */
    //% blockId=matrix_sprites_dot_visible
    //% block="set trail dot $id visible $v"
    //% group="Trail Dots" weight=85
    export function setTrailDotVisible(id: number, v: boolean): void {
        if (id < 0 || id >= _dotCount) return
        _dotVisible[id] = v
    }

    /**
     * Update all visible trail dots: decay trails, advance positions,
     * handle bouncing, and draw every pixel with a brightness gradient.
     * Call this once per frame before updateDisplay().
     *
     * Fast dots (speed > 1) draw every pixel they pass through — no gaps.
     * A brightness gradient from dim (where the dot came from) to bright
     * (current position) creates a smooth streak effect.
     */
    //% blockId=matrix_sprites_update_trail_dots
    //% block="update trail dots"
    //% group="Trail Dots" weight=80
    export function updateTrailDots(): void {
        const W = matrixCore.width()
        const H = matrixCore.height()

        // Phase 1: decay all trail slots for all dots
        for (let i = 0; i < _dotCount; i++) {
            if (!_dotVisible[i]) continue
            const tb = _dotTrail[i]
            const tlen = _dotTrailLen[i]
            const decay = _dotDecay[i]
            for (let ti = 0; ti < tlen; ti++) {
                const tx = tb[ti * 2]
                const ty = tb[ti * 2 + 1]
                if (tx < 0) continue
                matrixCore.decayRegion(tx, ty, 1, 1, 0, 0, 0, 0, decay)
            }
        }

        // Phase 2: advance each dot, handle bouncing, draw
        for (let i = 0; i < _dotCount; i++) {
            if (!_dotVisible[i]) continue
            const spd = _dotSpeed[i]
            if (spd <= 0) continue  // stopped — trail still decays from phase 1

            let vx = _dotVX[i]
            let vy = _dotVY[i]
            const tb = _dotTrail[i]
            const tlen = _dotTrailLen[i]
            const r = _dotR[i]
            const g = _dotG[i]
            const b = _dotB[i]
            let cx = _dotX[i]
            let cy = _dotY[i]

            // Advance spd pixels, drawing each with gradient
            for (let di = 0; di < spd; di++) {
                // Push current position into trail
                for (let ti = tlen - 1; ti > 0; ti--) {
                    tb[ti * 2]     = tb[(ti - 1) * 2]
                    tb[ti * 2 + 1] = tb[(ti - 1) * 2 + 1]
                }
                tb[0] = cx
                tb[1] = cy
                cx += vx
                cy += vy

                // Wall bouncing
                if (_dotBounceWalls[i]) {
                    if (cx < 0)         { cx = 0;    vx = -vx }
                    else if (cx >= W)   { cx = W - 1; vx = -vx }
                    if (cy < 0)         { cy = 0;    vy = -vy }
                    else if (cy >= H)   { cy = H - 1; vy = -vy }
                }

                // Brightness gradient: first pixel dimmest, last pixel brightest
                const frac = di + 1
                const pr = Math.idiv(r * frac, spd)
                const pg = Math.idiv(g * frac, spd)
                const pb = Math.idiv(b * frac, spd)
                matrixCore.setPixelXY(cx, cy, pr, pg, pb)
            }

            _dotVX[i] = vx
            _dotVY[i] = vy

            // Dot-to-dot collision (check against all other dots)
            if (_dotBounceDots[i]) {
                for (let j = 0; j < _dotCount; j++) {
                    if (i === j || !_dotVisible[j] || !_dotBounceDots[j]) continue
                    if (cx === _dotX[j] && cy === _dotY[j]) {
                        // Collision — reflect both dots
                        _dotVX[i] = -_dotVX[i]
                        _dotVY[i] = -_dotVY[i]
                        _dotVX[j] = -_dotVX[j]
                        _dotVY[j] = -_dotVY[j]
                        // Step back to avoid overlap
                        cx -= vx
                        cy -= vy
                        break
                    }
                }
            }

            _dotX[i] = cx
            _dotY[i] = cy
        }
    }

} // namespace matrixSprites
