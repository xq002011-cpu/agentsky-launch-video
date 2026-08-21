import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const SPACING = 36;
const START_X = 0;
const START_Y = 0;
const COLUMNS = Math.ceil(WIDTH / SPACING) + 1;
const ROWS = Math.ceil(HEIGHT / SPACING) + 1;
const RING_SIZE = 108;
const SECTOR_COUNT = 12;

type DotDefinition = {
  x: number;
  y: number;
  ring: number;
  patch: number;
};

const dots: DotDefinition[] = Array.from({length: ROWS * COLUMNS}, (_, index) => {
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const x = START_X + column * SPACING;
  const y = START_Y + row * SPACING;
  const dx = x - WIDTH / 2;
  const dy = y - HEIGHT / 2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const normalizedAngle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
  const sector = Math.floor((normalizedAngle / (Math.PI * 2)) * SECTOR_COUNT);

  return {
    x,
    y,
    ring: Math.floor(distance / RING_SIZE),
    patch: Math.floor(sector / 2),
  };
});

export const AGENT_SKY_RED_DOT_RADIANCE_DURATION = 300;

export const AgentSkyRedDotRadianceScene = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: "transparent", overflow: "hidden"}}>
      {dots.map((dot, index) => {
        // Each annular-sector patch shares one phase. Increasing ring delay makes
        // the active patches travel from the center toward the outer edge.
        const phase = frame * 0.036 - dot.ring * 0.74 - dot.patch * 1.31 + Math.PI / 2;
        const sine = Math.sin(phase);
        const normalized = Math.max(0, Math.min(1, (sine + 0.55) / 1.55));
        const breath = normalized * normalized * (3 - 2 * normalized);
        const scale = 0.94 + breath * 0.52;
        const opacity = 0.72 + breath * 0.25;

        return (
          <span
            key={index}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: 4.8,
              height: 4.8,
              marginLeft: -2.4,
              marginTop: -2.4,
              borderRadius: "50%",
              background: "#ffffff",
              opacity,
              transform: `translateZ(0) scale(${scale})`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
