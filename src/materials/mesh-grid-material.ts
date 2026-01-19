import { Color, NodeMaterial, TSL, type Node } from 'three/webgpu'

const {
    clamp,
    color,
    dot,
    Fn,
    If,
    mix,
    normalWorld,
    positionLocal,
    positionWorld,
    smoothstep,
    step,
    uniform,
    uv,
    vec2,
    vec3,
    vec4
} = TSL as any

const toMask = Fn(([normal]: [any]) => {
    const vecX = vec3(1, 0, 0)
    const vecY = vec3(0, 1, 0)
    const vecZ = vec3(0, 0, 1)

    const dotX = dot(normal, vecX).abs()
    const dotY = dot(normal, vecY).abs()
    const dotZ = dot(normal, vecZ).abs()

    const mask = vecX

    If(dotZ.greaterThan(dotX), () => {
        mask.assign(vecZ)
    })
    If(dotY.greaterThan(dotX).and(dotY.greaterThan(dotZ)), () => {
        mask.assign(vecY)
    })

    return mask
})

const toTriplanarUv = Fn(([position, mask]: [any, any]) => {
    const uvX = position.yz
    const uvY = position.xz
    const uvZ = position.xy

    let uv = uvX

    uv = mix(uv, uvY, mask.y)
    uv = mix(uv, uvZ, mask.z)

    return uv
})

const toGrid = Fn(([uv, scale, thickness, offset, cross]: [any, any, any, any, any]) => {
    const referenceUv = uv.div(scale).add(offset)
    const crossGrid = step(referenceUv.fract().sub(0.5).abs(), cross.oneMinus().mul(0.5))
    const crossMask = mix(crossGrid.x, 1, crossGrid.y).oneMinus()
    const grid = step(referenceUv.sub(0.5).fract().sub(0.5).abs().mul(2), thickness).mul(crossMask)
    return mix(grid.x, 1, grid.y)
})

const toAntialiasedGrid = Fn(
    ([uv, scale, thickness, offset, cross, derivateMask]: [any, any, any, any, any, any]) => {
        // Based on https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8
        const lineWidth = thickness
        const referenceUv = uv.div(scale).add(offset)
        const uvDeriv = referenceUv.fwidth().mul(derivateMask)
        const drawWidth = clamp(lineWidth, uvDeriv, 1)
        const lineAA = uvDeriv.mul(1.5)

        const crossGrid = step(referenceUv.fract().sub(0.5).abs(), cross.oneMinus().mul(0.5))
        const crossMask = mix(crossGrid.x, 1, crossGrid.y).oneMinus()

        const gridUV = referenceUv.fract().mul(2).sub(1).abs().oneMinus()
        let grid2 = smoothstep(drawWidth.add(lineAA), drawWidth.sub(lineAA), gridUV)
        grid2 = grid2.mul(clamp(lineWidth.div(drawWidth), 0, 1)) as any
        grid2 = mix(grid2, lineWidth, clamp(uvDeriv.mul(2).sub(1), 0, 1)).mul(crossMask) as any
        return mix(grid2.x, 1, grid2.y)
    }
)

class MeshGridMaterialLine {
    color: any
    scale: any
    thickness: any
    cross: any
    offset: any

    constructor(
        _color: number = 0xffffff,
        scale: number = 1,
        thickness: number = 0.05,
        cross: number = 1,
        offset: any = vec2(0)
    ) {
        this.color = uniform(color(_color))
        this.scale = uniform(scale)
        this.thickness = uniform(thickness)
        this.cross = uniform(cross)
        this.offset = uniform(offset)
    }
}

class MeshGridMaterial extends NodeMaterial {
    declare normals: boolean
    declare isMeshGridMaterial: boolean
    declare testNode: Node | null
    declare scaleNode: any
    declare reference:
        | 'uv'
        | 'worldTriplanar'
        | 'worldX'
        | 'worldY'
        | 'worldZ'
        | 'localTriplanar'
        | 'localX'
        | 'localY'
        | 'localZ'
    declare antialiased: boolean
    declare color: Color
    declare lines: MeshGridMaterialLine[]

    constructor(parameters?: any) {
        super()

        this.normals = false
        this.lights = false
        this.isMeshGridMaterial = true
        this.testNode = null

        this.scaleNode = uniform(1)

        this.reference = 'uv' as
            | 'uv'
            | 'worldTriplanar'
            | 'worldX'
            | 'worldY'
            | 'worldZ'
            | 'localTriplanar'
            | 'localX'
            | 'localY'
            | 'localZ'
        this.antialiased = true
        this.color = new Color(0x000000)
        this.lines = [new MeshGridMaterialLine()]

        this.setValues(parameters)

        const mask = toMask(normalWorld)
        const maskDerivate = mask.fwidth().length().oneMinus().clamp(0, 1)

        let uvReference: any = uv()
        const ref = this.reference
        if (ref === 'worldTriplanar') uvReference = toTriplanarUv(positionWorld, mask)
        else if (ref === 'worldX') uvReference = positionWorld.yz
        else if (ref === 'worldY') uvReference = positionWorld.xz
        else if (ref === 'worldZ') uvReference = positionWorld.xy
        else if (ref === 'localTriplanar') uvReference = toTriplanarUv(positionLocal, mask)
        else if (ref === 'localX') uvReference = positionLocal.yz
        else if (ref === 'localY') uvReference = positionLocal.xz
        else if (ref === 'localZ') uvReference = positionLocal.xy

        let gridColor: any = uniform(this.color)

        for (const line of this.lines) {
            const grid = this.antialiased
                ? toAntialiasedGrid(
                      uvReference,
                      line.scale.mul(this.scaleNode),
                      line.thickness,
                      line.offset,
                      line.cross,
                      maskDerivate
                  )
                : toGrid(
                      uvReference,
                      line.scale.mul(this.scaleNode),
                      line.thickness,
                      line.offset,
                      line.cross
                  )

            gridColor = mix(gridColor, line.color, grid)
        }

        this.outputNode = vec4(gridColor, 1)
    }

    get scale() {
        return this.scaleNode.value
    }

    set scale(value) {
        this.scaleNode.value = value
    }
}

export default MeshGridMaterial
export { MeshGridMaterialLine, toAntialiasedGrid, toMask, toTriplanarUv }
