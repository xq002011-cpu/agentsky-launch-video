import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const GRID_SPACING = 92;
const DRAW_DURATION = 35;
const LINE_WIDTH = 3.2;
const DASH_PATTERN = "14 13";
const VERTICAL_LENGTH = HEIGHT + 120;
const HORIZONTAL_LENGTH = WIDTH + 120;
const WHITE = "255, 255, 255";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const verticalLines = Array.from(
  {length: Math.ceil(WIDTH / GRID_SPACING) + 3},
  (_, index) => index * GRID_SPACING - GRID_SPACING,
);

const horizontalLines = Array.from(
  {length: Math.ceil(HEIGHT / GRID_SPACING) + 3},
  (_, index) => index * GRID_SPACING - GRID_SPACING,
);

export const AGENT_SKY_RED_DASHED_GRID_DURATION = 300;

export const AgentSkyRedDashedGridScene = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, DRAW_DURATION], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const dashSlide = frame * 0.65;

  return (
    <AbsoluteFill style={{background: "transparent", overflow: "hidden"}}>
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          {verticalLines.map((x, index) => {
            const order = index / Math.max(1, verticalLines.length - 1);
            const localProgress = Math.max(0, Math.min(1, (draw - order * 0.7) / 0.3));

            return (
              <clipPath key={`clip-v-${index}`} id={`red-grid-v-grow-${index}`}>
                <rect x={x - 8} y={-60} width={16} height={VERTICAL_LENGTH * localProgress} />
              </clipPath>
            );
          })}
          {horizontalLines.map((y, index) => {
            const bottomToTopIndex = horizontalLines.length - 1 - index;
            const order = bottomToTopIndex / Math.max(1, horizontalLines.length - 1);
            const localProgress = Math.max(0, Math.min(1, (draw - order * 0.7) / 0.3));

            return (
              <clipPath key={`clip-h-${index}`} id={`red-grid-h-grow-${index}`}>
                <rect x={-60} y={y - 8} width={HORIZONTAL_LENGTH * localProgress} height={16} />
              </clipPath>
            );
          })}
        </defs>

        <g>
          {verticalLines.map((x, index) => {
            const direction = index % 2 === 0 ? 1 : -1;

            return (
            <line
              key={`v-${index}`}
              clipPath={`url(#red-grid-v-grow-${index})`}
              x1={x}
              x2={x}
              y1={-60}
              y2={HEIGHT + 60}
              stroke={`rgba(${WHITE}, 0.58)`}
              strokeWidth={LINE_WIDTH}
              strokeDasharray={DASH_PATTERN}
              strokeDashoffset={direction * dashSlide}
              strokeLinecap="butt"
            />
            );
          })}
        </g>

        <g>
          {horizontalLines.map((y, index) => {
            const direction = index % 2 === 0 ? -1 : 1;

            return (
            <line
              key={`h-${index}`}
              clipPath={`url(#red-grid-h-grow-${index})`}
              x1={-60}
              x2={WIDTH + 60}
              y1={y}
              y2={y}
              stroke={`rgba(${WHITE}, 0.48)`}
              strokeWidth={LINE_WIDTH}
              strokeDasharray={DASH_PATTERN}
              strokeDashoffset={direction * dashSlide}
              strokeLinecap="butt"
            />
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
