/**
 * Sprite bank and moving object system for NeoPixel matrix panels.
 * Depends on matrixCore (pxt-matrix-core).
 */

//% color="#9400D3" weight=80 icon="\uf11b"
//% groups='["Sprites","Objects"]'
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
    let _objX: number[] = []
    let _objY: number[] = []
    let _objVX: number[] = []
    let _objVY: number[] = []
    let _objSpriteId: number[] = []
    let _objFlipX: boolean[] = []
    let _objFlipY: boolean[] = []
    let _objVisible: boolean[] = []
    let _objCount = 0

    // -----------------------------------------------------------------------
    // Built-in demo sprite constants
    // -----------------------------------------------------------------------

    /**
     * Width of the built-in smiley sprite.
     */
    export const SMILEY_W = 5

    /**
     * Height of the built-in smiley sprite.
     */
    export const SMILEY_H = 5

    /**
     * Hex data for a 5×5 yellow smiley face.
     * Transparent corners use magenta (FF00FF).
     * Layout (row-major, RRGGBB per pixel):
     *   Row 0: T  Y  Y  Y  T
     *   Row 1: Y  B  Y  B  Y   (eyes)
     *   Row 2: Y  Y  Y  Y  Y   (cheeks)
     *   Row 3: Y  B  Y  B  Y   (mouth corners)
     *   Row 4: T  Y  Y  Y  T
     * T=FF00FF, Y=FFD700, B=000000
     */
    export const SMILEY_HEX = "FF00FFFFD700FFD700FFD700FF00FFFFD700000000FFD700000000FFD700FFD700FFD700FFD700FFD700FFD700FFD700000000FFD700000000FFD700FF00FFFFD700FFD700FFD700FF00FF"

    /**
     * Width of the built-in spaceship sprite.
     */
    export const SHIP_W = 7

    /**
     * Height of the built-in spaceship sprite.
     */
    export const SHIP_H = 5

    /**
     * Hex data for a 7×5 spaceship pointing right.
     * Transparent pixels use magenta (FF00FF).
     * Layout (row-major, RRGGBB per pixel):
     *   Row 0: T   T   T   R   T   T   T
     *   Row 1: T   LB  LB  LB  R   R   T
     *   Row 2: R   LB  W   LB  LB  R   R   (cockpit)
     *   Row 3: T   LB  LB  LB  R   R   T
     *   Row 4: T   T   T   R   T   T   T
     * T=FF00FF, R=FF0000, LB=00AAFF, W=FFFFFF
     */
    export const SHIP_HEX = "FF00FFFF00FFFF00FFFF0000FF00FFFF00FFFF00FFFF00FF00AAFF00AAFF00AAFFFF0000FF0000FF00FFFF000000AAFFFFFFFF00AAFF00AAFFFF0000FF0000FF00FF00AAFF00AAFF00AAFFFF0000FF0000FF00FFFF00FFFF00FFFF00FFFF0000FF00FFFF00FFFF00FF"

    // -----------------------------------------------------------------------
    // Sprites
    // -----------------------------------------------------------------------

    /**
     * Create a sprite from hex-encoded RGB pixel data and add it to the sprite bank.
     * Returns the sprite ID (0-based index) for use with drawSprite and addObject.
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
        const buf = Buffer.fromHex(hexData)
        const id = _spriteCount
        _spriteData[id] = buf
        _spriteW[id] = w
        _spriteH[id] = h
        _spriteCount++
        return id
    }

    /**
     * Draw a sprite from the sprite bank onto the back buffer at position (x, y).
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
        const backBuf = matrixCore.getBackBuffer()

        for (let row = 0; row < sh; row++) {
            const srcRow = flipY ? sh - 1 - row : row
            for (let col = 0; col < sw; col++) {
                const srcCol = flipX ? sw - 1 - col : col
                const offset = (srcRow * sw + srcCol) * 3
                const r = buf[offset]
                const g = buf[offset + 1]
                const b = buf[offset + 2]
                // Skip transparent pixels
                if (r === _transpR && g === _transpG && b === _transpB) continue
                matrixCore.setPixelBuf(backBuf, x + col, y + row, r, g, b)
            }
        }
    }

    /**
     * Set the transparent color used when rendering sprites.
     * Pixels with exactly this RGB value are not drawn.
     * Default is magenta (255, 0, 255).
     * @param r red component 0-255
     * @param g green component 0-255
     * @param b blue component 0-255
     */
    //% blockId=matrix_sprites_transparent
    //% block="set transparent color red $r green $g blue $b"
    //% r.defl=255 g.defl=0 b.defl=255
    //% group="Sprites" weight=80
    export function setTransparentColor(r: number, g: number, b: number): void {
        _transpR = r
        _transpG = g
        _transpB = b
    }

    // -----------------------------------------------------------------------
    // Objects
    // -----------------------------------------------------------------------

    /**
     * Add a moving object to the scene using a sprite from the bank.
     * Returns the object ID (0-based index).
     * @param spriteId sprite ID from createSprite
     * @param x initial x position (pixels)
     * @param y initial y position (pixels)
     * @param vx horizontal velocity (pixels per update tick)
     * @param vy vertical velocity (pixels per update tick)
     */
    //% blockId=matrix_sprites_add_object
    //% block="add object sprite $spriteId at x $x y $y velocity vx $vx vy $vy"
    //% group="Objects" weight=100
    export function addObject(spriteId: number, x: number, y: number, vx: number, vy: number): number {
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
        _objCount++
        return id
    }

    /**
     * Update all visible objects: integrate positions by velocity and bounce
     * at the matrix boundaries. FlipX is automatically set based on
     * horizontal velocity direction (negative vx → flipped).
     */
    //% blockId=matrix_sprites_update
    //% block="update objects"
    //% group="Objects" weight=90
    export function updateObjects(): void {
        const W = matrixCore.width()
        const H = matrixCore.height()

        for (let i = 0; i < _objCount; i++) {
            if (!_objVisible[i]) continue

            const sid = _objSpriteId[i]
            const sw = _spriteW[sid]
            const sh = _spriteH[sid]

            let x = _objX[i] + _objVX[i]
            let y = _objY[i] + _objVY[i]
            let vx = _objVX[i]
            let vy = _objVY[i]

            // Horizontal bounce
            if (x < 0) {
                x = 0
                vx = -vx
            } else if (x > W - sw) {
                x = W - sw
                vx = -vx
            }

            // Vertical bounce
            if (y < 0) {
                y = 0
                vy = -vy
            } else if (y > H - sh) {
                y = H - sh
                vy = -vy
            }

            _objX[i] = x
            _objY[i] = y
            _objVX[i] = vx
            _objVY[i] = vy
            _objFlipX[i] = vx < 0
        }
    }

    /**
     * Draw all visible objects to the back buffer using their current
     * positions, sprite IDs, and flip states.
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
     * @param id object ID from addObject
     * @param v true to show, false to hide
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
     * @param id object ID from addObject
     * @param x new x position (pixels)
     * @param y new y position (pixels)
     */
    //% blockId=matrix_sprites_set_pos
    //% block="set object $id position x $x y $y"
    //% group="Objects" weight=79
    export function setPosition(id: number, x: number, y: number): void {
        if (id < 0 || id >= _objCount) return
        _objX[id] = x
        _objY[id] = y
    }

    /**
     * Change the velocity of an object.
     * FlipX will update on the next updateObjects call.
     * @param id object ID from addObject
     * @param vx new horizontal velocity (pixels per tick)
     * @param vy new vertical velocity (pixels per tick)
     */
    //% blockId=matrix_sprites_set_velocity
    //% block="set object $id velocity vx $vx vy $vy"
    //% group="Objects" weight=78
    export function setVelocity(id: number, vx: number, vy: number): void {
        if (id < 0 || id >= _objCount) return
        _objVX[id] = vx
        _objVY[id] = vy
    }

}
