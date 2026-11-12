/** URI data: d'une illustration SVG (utilisable comme `HazardScene.image.src`). */
export const svgDataUri = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
