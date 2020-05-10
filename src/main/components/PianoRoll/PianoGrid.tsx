import React, { StatelessComponent } from "react"
import _ from "lodash"

import DrawCanvas from "components/DrawCanvas"
import Theme from "common/theme"
import { BeatWithX } from "helpers/mapBeats"

function drawBeatLines(
  ctx: CanvasRenderingContext2D,
  beats: BeatWithX[],
  height: number,
  theme: Theme
) {
  ctx.lineWidth = 1

  // 密過ぎる時は省略する
  const shouldOmit = beats.length > 1 && beats[1].x - beats[0].x <= 5

  beats.forEach(({ beat, x }) => {
    const isBold = beat === 0
    if (shouldOmit && !isBold) {
      return
    }
    ctx.beginPath()
    ctx.strokeStyle =
      isBold && !shouldOmit ? theme.secondaryTextColor : theme.dividerColor
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.closePath()
    ctx.stroke()
  })
}

export interface PianoGridProps {
  width: number
  height: number
  scrollLeft: number
  beats: BeatWithX[]
  theme: Theme
}

const PianoGrid: StatelessComponent<PianoGridProps> = ({
  width,
  height,
  scrollLeft,
  beats,
  theme,
}) => {
  function draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    drawBeatLines(ctx, beats, height, theme)
    ctx.restore()
  }

  return (
    <DrawCanvas
      draw={draw}
      className="PianoGrid"
      width={width}
      height={height}
    />
  )
}

function areEqual(props: PianoGridProps, nextProps: PianoGridProps) {
  return (
    _.isEqual(props.theme, nextProps.theme) &&
    props.width === nextProps.width &&
    props.height === nextProps.height &&
    props.scrollLeft === nextProps.scrollLeft &&
    _.isEqual(props.beats, nextProps.beats)
  )
}

export default React.memo(PianoGrid, areEqual)
