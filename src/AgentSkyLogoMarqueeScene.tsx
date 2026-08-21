import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1280;
const ICON_SIZE = 82;
const SLOT = 136;
const ENTRANCE_END = 48;
const CRUISE_PX_PER_FRAME = 1.22;

const logos = [
  "01-DeepSeek.png",
  "02-ZAI.png",
  "03.1-Kimi.png",
  "04-Claude-Code.png",
  "05-Codex.png",
  "06-Hermes-Agent.png",
  "07-OpenClaw.png",
  "08-Gemini.png",
  "09-OpenAI.png",
  "10-Grok.png",
  "11-Qwen.png",
  "12-Cursor.png",
  "13-Manus.png",
  "14-Devin.png",
  "15-Perplexity.png",
] as const;

const laneOrders = [
  [0, 7, 12, 3, 14, 8, 5, 10, 1, 13, 6, 11, 4, 9, 2],
  [11, 2, 8, 14, 5, 0, 9, 4, 12, 7, 1, 10, 6, 13, 3],
  [6, 13, 1, 9, 4, 11, 0, 14, 7, 2, 10, 5, 12, 3, 8],
  [9, 3, 12, 0, 7, 14, 2, 11, 5, 13, 1, 8, 4, 10, 6],
] as const;

const laneY = [54, 186, 448, 580] as const;
const laneDirection = [1, -1, 1, -1] as const;
const lanePhase = [-72, -18, -104, -50] as const;

const wrap = (value: number, min: number, max: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

const LogoLane = ({ lane }: { lane: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const direction = laneDirection[lane];
  const order = laneOrders[lane];
  const count = 12;
  const minX = -176;
  const maxX = minX + count * SLOT;
  const laneOffset = wrap(lanePhase[lane], 0, SLOT);
  const rowStart = lane * 2;
  const rowEnd = rowStart + ENTRANCE_END;
  const entrance = interpolate(
    frame,
    [rowStart, rowEnd],
    [0, 1],
    {
      // The end slope matches CRUISE_PX_PER_FRAME, avoiding a stop/restart
      // when the entrance hands off to constant-speed movement.
      easing: Easing.bezier(0.12, 0.82, 0.2, 0.97),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const scaleSpring = spring({
    frame: frame - rowStart,
    fps,
    durationInFrames: ENTRANCE_END,
    config: {
      damping: 15,
      stiffness: 135,
      mass: 0.68,
    },
  });
  const iconScale = 0.91 + scaleSpring * 0.09;

  return (
    <div
      style={{
        position: "absolute",
        top: laneY[lane],
        left: 0,
        width: WIDTH,
        height: ICON_SIZE,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: count }, (_, index) => {
        const baseX = minX + laneOffset + index * SLOT;
        const offscreenX =
          baseX - direction * (WIDTH + 2 * SLOT);
        const cruiseFrames = Math.max(0, frame - rowEnd);
        const cruisingX = wrap(
          baseX + direction * cruiseFrames * CRUISE_PX_PER_FRAME,
          minX,
          maxX,
        );
        const x =
          frame < rowEnd
            ? offscreenX + (baseX - offscreenX) * entrance
            : cruisingX;
        const logoIndex = order[index % order.length];

        return (
          <div
            key={`${lane}-${index}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: ICON_SIZE,
              height: ICON_SIZE,
              display: "grid",
              placeItems: "center",
              transform: `translate3d(${x}px, 0, 0)`,
              willChange: "transform",
            }}
          >
            <Img
              src={staticFile(`ai-product-logos/${logos[logoIndex]}`)}
              style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              objectFit: "contain",
              display: "block",
              transform: `scale(${iconScale})`,
              transformOrigin: "50% 50%",
            }}
            />
          </div>
        );
      })}
    </div>
  );
};

export const AgentSkyLogoMarqueeScene = ({
  transparent = false,
}: {
  transparent?: boolean;
}) => (
  <AbsoluteFill
    style={{
      background: transparent ? "transparent" : "#ffffff",
      overflow: "hidden",
    }}
  >
    {[0, 1, 2, 3].map((lane) => (
      <LogoLane key={lane} lane={lane} />
    ))}
  </AbsoluteFill>
);

export const AgentSkyLogoMarqueeTransparent = () => (
  <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
    <div
      style={{
        position: "relative",
        width: 1280,
        height: 720,
        transform: "scale(1.5)",
        transformOrigin: "top left",
      }}
    >
      <AgentSkyLogoMarqueeScene transparent />
    </div>
  </AbsoluteFill>
);
