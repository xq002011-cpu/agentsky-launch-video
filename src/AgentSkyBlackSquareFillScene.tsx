import React from "react";
import {AbsoluteFill, random, useCurrentFrame} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const CELL_SIZE = 80;
const COLUMNS = Math.ceil(WIDTH / CELL_SIZE);
const ROWS = Math.ceil(HEIGHT / CELL_SIZE);
const MAX_DISTANCE = Math.hypot(WIDTH / 2, HEIGHT / 2);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type Cell = {
  column: number;
  row: number;
  threshold: number;
  permanentFrame: number;
  glitchStart: number;
  glitchCount: 1 | 2;
};

const cells: Cell[] = Array.from({length: COLUMNS * ROWS}, (_, index) => {
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const centerX = column * CELL_SIZE + CELL_SIZE / 2;
  const centerY = row * CELL_SIZE + CELL_SIZE / 2;
  const distance = Math.hypot(centerX - WIDTH / 2, centerY - HEIGHT / 2);
  const seed = `black-square-${column}-${row}`;
  const timingJitter = (random(`${seed}-timing`) - 0.5) * 0.16;
  const isDistantFragment = random(`${seed}-fragment-chance`) < 0.16;
  const fragmentAdvance = isDistantFragment
    ? 0.2 + random(`${seed}-fragment-advance`) * 0.26
    : 0;

  const threshold = clamp(
    Math.min(0.96, distance / MAX_DISTANCE + timingJitter - fragmentAdvance),
  );
  const permanentFrame = Math.ceil(
    Math.pow(threshold, 1 / 2.25) * 29,
  );
  const isGlitchCell =
    permanentFrame > 7 && random(`${seed}-glitch-chance`) < 0.075;
  const glitchLead = 4 + Math.floor(random(`${seed}-glitch-lead`) * 7);

  return {
    column,
    row,
    threshold,
    permanentFrame,
    glitchStart: isGlitchCell ? Math.max(1, permanentFrame - glitchLead) : -1,
    glitchCount: random(`${seed}-glitch-count`) < 0.45 ? 2 : 1,
  };
});

const FILL_DURATION = 30;
const FULL_BLACK_HOLD_DURATION = 5;

export const AGENT_SKY_BLACK_SQUARE_FILL_DURATION =
  FILL_DURATION + FULL_BLACK_HOLD_DURATION;

export const AgentSkyBlackSquareFillScene = () => {
  const frame = useCurrentFrame();
  const timeline = clamp(frame / (FILL_DURATION - 1));
  // The radial front accelerates strongly: restrained in the center, fast at the edges.
  const radialFront = Math.pow(timeline, 2.25);

  return (
    <AbsoluteFill style={{background: "transparent", overflow: "hidden"}}>
      {cells.map((cell) => {
        const isPermanentlyVisible = radialFront >= cell.threshold;
        const isGlitchVisible =
          frame < cell.permanentFrame &&
          (frame === cell.glitchStart ||
            (cell.glitchCount === 2 && frame === cell.glitchStart + 2));
        const isVisible = isPermanentlyVisible || isGlitchVisible;

        return (
          <span
            key={`${cell.column}-${cell.row}`}
            style={{
              position: "absolute",
              left: cell.column * CELL_SIZE - 1,
              top: cell.row * CELL_SIZE - 1,
              width: CELL_SIZE + 2,
              height: CELL_SIZE + 2,
              background: "#000000",
              outline: "1px solid #000000",
              display: isVisible ? "block" : "none",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
