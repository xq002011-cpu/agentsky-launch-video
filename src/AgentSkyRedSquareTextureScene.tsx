import React from "react";
import {AbsoluteFill, random, useCurrentFrame} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const SPACING = 18;
const SQUARE_SIZE = 6.8;
const COLUMNS = Math.ceil(WIDTH / SPACING) + 1;
const ROWS = Math.ceil(HEIGHT / SPACING) + 1;
const HOLD_FRAMES = 5;
const EMPTY_CHANCE = 0.22;
const WHITE = "255, 255, 255";

type SquareDefinition = {
  x: number;
  y: number;
  localBias: number;
};

const squares: SquareDefinition[] = Array.from({length: COLUMNS * ROWS}, (_, index) => {
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const x = column * SPACING;
  const y = row * SPACING;

  return {
    x,
    y,
    localBias: random(`red-square-texture-bias-${column}-${row}`),
  };
});

const opacityForSquare = (stateIndex: number, squareIndex: number, bias: number) => {
  const current = random(`red-square-texture-${stateIndex}-${squareIndex}`);
  const previous = stateIndex === 0
    ? random(`red-square-texture-initial-${squareIndex}`)
    : random(`red-square-texture-${stateIndex - 1}-${squareIndex}`);
  const shouldDisappear =
    random(`red-square-texture-empty-${stateIndex}-${squareIndex}`) < EMPTY_CHANCE;

  if (shouldDisappear) {
    return 0;
  }

  // Blend with an inverted previous value so adjacent held states cannot feel
  // like the same still frame, while keeping a designed range of translucency.
  const changed = current * 0.72 + (1 - previous) * 0.28;
  const uneven = changed * 0.8 + bias * 0.2;

  return 0.08 + uneven * 0.66;
};

export const AGENT_SKY_RED_SQUARE_TEXTURE_DURATION = 300;
export const AGENT_SKY_RED_SQUARE_TEXTURE_GAP = 30;

export const AgentSkyRedSquareTextureScene = () => {
  const frame = useCurrentFrame();
  const stateIndex = Math.floor(frame / HOLD_FRAMES);

  return (
    <AbsoluteFill style={{background: "transparent", overflow: "hidden"}}>
      {squares.map((square, index) => {
        const opacity = opacityForSquare(stateIndex, index, square.localBias);

        return (
          <span
            key={index}
            style={{
              position: "absolute",
              left: square.x,
              top: square.y,
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
              marginLeft: -SQUARE_SIZE / 2,
              marginTop: -SQUARE_SIZE / 2,
              background: `rgba(${WHITE}, ${opacity})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
