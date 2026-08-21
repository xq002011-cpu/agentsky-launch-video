/**
 * AgentSkyCta — CTA segment (~5s, 150 frames, 1920×1080, 30fps)
 *
 * Logo wall: 13 approved harness marks (SVG icons + Hermes text chip)
 * using the same multi-row marquee loop algorithm as AgentSkyLogoMarqueeScene.
 *
 * Overlay text:
 *   0–89f   "One API, every agent."  (black, centered)
 *  90–149f  "agentsky.dev"  (display size; .dev = brand blue #1683f3 + underline sweep)
 *
 * Audio: vo3/183644-cta-short.m4a ("Go to agentsky.dev", 2.31s) at frame 0
 * Last 30 frames: background fades white→black (smooth X-loop seam)
 */

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
import {Audio} from "@remotion/media";

// ─── Constants ─────────────────────────────────────────────────────────────────
const WIDTH = 1920;
const ICON_SIZE = 88;
const SLOT = 148;
const ENTRANCE_END = 48;
const CRUISE_PX_PER_FRAME = 1.22;
const BRAND_BLUE = "#1683f3";

export const AGENT_SKY_CTA_DURATION = 150; // 5s @ 30fps

// Text switch frame: 3s in
const TEXT_SWITCH_FRAME = 90;
// Underline sweep over 20 frames after switch
const UNDERLINE_SWEEP_DUR = 20;
// Background darken: last 30 frames
const DARKEN_START = 70;

// ─── 13 approved harness marks ─────────────────────────────────────────────────
type Mark =
  | {type: "svg"; src: string}
  | {type: "text"; label: string};

const MARKS: Mark[] = [
  {type: "svg",  src: "icons/claude-ai-symbol.svg"},
  {type: "svg",  src: "icons/codex-agent.svg"},
  {type: "svg",  src: "icons/deepseek.svg"},
  {type: "svg",  src: "harnesses/cline.svg"},
  {type: "svg",  src: "harnesses/goose.svg"},
  {type: "svg",  src: "icons/pi.svg"},
  {type: "svg",  src: "harnesses/opencode.svg"},
  {type: "svg",  src: "harnesses/kimi.svg"},
  {type: "svg",  src: "icons/openclaw.svg"},
  {type: "svg",  src: "harnesses/codebuddy.svg"},
  {type: "svg",  src: "harnesses/qwen.svg"},
  {type: "svg",  src: "harnesses/iflow.svg"},
  {type: "text", label: "Hermes"},
];

const N_MARKS = MARKS.length; // 13

// Replicated to fill lanes (each lane cycles through all 13)
const laneOrders: readonly (readonly number[])[] = [
  [0, 7, 12, 3, 10, 5, 2, 8, 1, 11, 6, 4, 9],
  [11, 2, 8,  4, 6, 0, 9, 3, 12, 7, 1, 10, 5],
  [6,  9, 1,  5, 4, 11, 0, 10, 7, 2, 12, 3, 8],
  [9,  3, 12, 0, 7, 10, 2, 11, 5, 1,  4, 8, 6],
] as const;

const laneY   = [52, 242, 690, 900] as const;
const laneDir = [1, -1, 1, -1]       as const;
const lanePhase = [-72, -18, -104, -50] as const;

const wrap = (v: number, min: number, max: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

// ─── Tile renderer ─────────────────────────────────────────────────────────────
const MarkTile: React.FC<{mark: Mark; scale: number}> = ({mark, scale}) => {
  if (mark.type === "svg") {
    return (
      <Img
        src={staticFile(mark.src)}
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          objectFit: "contain",
          display: "block",
          transform: `scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      />
    );
  }
  // Hermes text-chip
  return (
    <div
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          background: "#0a0a14",
          color: "#ffffff",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 2,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 14,
          paddingRight: 14,
          borderRadius: 8,
          textTransform: "uppercase",
          border: "1.5px solid rgba(255,255,255,0.25)",
          width: 76,
          textAlign: "center",
        }}
      >
        {mark.label}
      </div>
    </div>
  );
};

// ─── A single scrolling lane ────────────────────────────────────────────────────
const LogoLane: React.FC<{lane: number}> = ({lane}) => {
  const frame = useCurrentFrame();
  const {fps}  = useVideoConfig();
  const direction = laneDir[lane];
  const order     = laneOrders[lane];
  const count     = 14; // slots per lane (>13 so the row always fills 1920px)
  const minX      = -176;
  const maxX      = minX + count * SLOT;
  const laneOffset = wrap(lanePhase[lane], 0, SLOT);
  const rowStart   = lane * 2;
  const rowEnd     = rowStart + ENTRANCE_END;

  const entrance = interpolate(frame, [rowStart, rowEnd], [0, 1], {
    easing: Easing.bezier(0.12, 0.82, 0.2, 0.97),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleSpring = spring({
    frame: frame - rowStart,
    fps,
    durationInFrames: ENTRANCE_END,
    config: {damping: 15, stiffness: 135, mass: 0.68},
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
      {Array.from({length: count}, (_, idx) => {
        const baseX       = minX + laneOffset + idx * SLOT;
        const offscreenX  = baseX - direction * (WIDTH + 2 * SLOT);
        const cruiseFrames = Math.max(0, frame - rowEnd);
        const cruisingX   = wrap(
          baseX + direction * cruiseFrames * CRUISE_PX_PER_FRAME,
          minX, maxX,
        );
        const x = frame < rowEnd
          ? offscreenX + (baseX - offscreenX) * entrance
          : cruisingX;
        const markIdx = order[idx % N_MARKS];

        return (
          <div
            key={`${lane}-${idx}`}
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
            <MarkTile mark={MARKS[markIdx]} scale={iconScale} />
          </div>
        );
      })}
    </div>
  );
};

// ─── Center text overlay ────────────────────────────────────────────────────────
const CenterText: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: "One API, every agent." — fades in quickly, holds
  const lineOneOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Phase 2: "agentsky.dev" — cross-fades in at TEXT_SWITCH_FRAME
  const lineTwoOpacity = interpolate(
    frame, [TEXT_SWITCH_FRAME, TEXT_SWITCH_FRAME + 12], [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const lineOneHide = interpolate(
    frame, [TEXT_SWITCH_FRAME - 4, TEXT_SWITCH_FRAME + 8], [1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  // Underline sweep (width 0%→100%) over UNDERLINE_SWEEP_DUR frames
  const underlineW = interpolate(
    frame,
    [TEXT_SWITCH_FRAME + 10, TEXT_SWITCH_FRAME + 10 + UNDERLINE_SWEEP_DUR],
    [0, 100],
    {
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const isPhaseTwo = frame >= TEXT_SWITCH_FRAME;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        pointerEvents: "none",
      }}
    >
      {/* Phase 1 text */}
      {!isPhaseTwo && (
        <div
          style={{
            opacity: lineOneOpacity,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 52,
            color: "#0a0a14",
            letterSpacing: -0.5,
            textAlign: "center",
            padding: "20px 40px",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 20,
            boxShadow: "0 2px 40px rgba(0,0,0,0.12)",
          }}
        >
          One API, every agent.
        </div>
      )}

      {/* Phase 2 text */}
      {isPhaseTwo && (
        <div
          style={{
            opacity: lineTwoOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 82,
              letterSpacing: -2,
              lineHeight: 1,
              color: "#ffffff",
              textShadow: "0 2px 32px rgba(0,0,0,0.45)",
            }}
          >
            <span style={{color: "#ffffff"}}>agentsky</span>
            <span style={{color: BRAND_BLUE}}>.dev</span>
          </div>
          {/* Underline sweep */}
          <div
            style={{
              marginTop: 6,
              height: 4,
              width: `${underlineW}%`,
              maxWidth: 520,
              background: BRAND_BLUE,
              borderRadius: 2,
              alignSelf: "center",
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Main export ────────────────────────────────────────────────────────────────
export const AgentSkyCta: React.FC = () => {
  const frame = useCurrentFrame();

  // Background: white → black in last 30 frames
  const bgDarken = interpolate(
    frame, [DARKEN_START, AGENT_SKY_CTA_DURATION - 1], [0, 1],
    {
      easing: Easing.bezier(0.4, 0, 0.8, 0.6),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const bg = `rgb(${Math.round((1 - bgDarken) * 255)},${Math.round((1 - bgDarken) * 255)},${Math.round((1 - bgDarken) * 255)})`;

  return (
    <AbsoluteFill style={{background: bg, overflow: "hidden"}}>
      {/* CTA audio */}
      <Audio src={staticFile("vo3/183644-cta-short.m4a")} />

      {/* Logo marquee */}
      {[0, 1, 2, 3].map((lane) => (
        <LogoLane key={lane} lane={lane} />
      ))}

      {/* Centered text overlay */}
      <CenterText />
    </AbsoluteFill>
  );
};
