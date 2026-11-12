import { forwardRef, type ReactNode } from 'react'
import type { HazardScene } from '@acculturator/contracts'

/**
 * Illustration d'une scène de chasse aux risques (`HazardScene.image`), dans un SVG dont le repère
 * est celui de l'image : les dangers, leurres et repères (`children`) s'y placent directement.
 */
export const SceneCanvas = forwardRef<
  SVGSVGElement,
  {
    scene: HazardScene
    children?: ReactNode
    onClick?: React.MouseEventHandler<SVGSVGElement>
  }
>(function SceneCanvas({ scene, children, onClick }, ref) {
  const { src, width, height } = scene.image
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full cursor-crosshair select-none"
      onClick={onClick}
      role="img"
      aria-label={`Illustration : ${scene.title}`}
    >
      <image href={src} width={width} height={height} preserveAspectRatio="xMidYMid meet" />
      {children}
    </svg>
  )
})
