import React from "react";
import {AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
import {Audio} from "@remotion/media";
import {AgentSkyConfigCardSequence} from "./AgentSkyLaunch";
import {AgentSkyCodeBuildScene} from "./AgentSkyCodeBuildScene";
import {AgentSkyLogoMarqueeScene} from "./AgentSkyLogoMarqueeScene";
import {AgentSkyPlaygroundScene} from "./AgentSkyPlaygroundScene";

const C = {
  canvas: "#f7f7f8",
  ink: "#0d0d0d",
  muted: "#5d5d5d",
  brand: "#1683f3",
  line: "#ececec",
};

const FONT = '"AgentSky Space Grotesk", "Space Grotesk", "Segoe UI", Arial, sans-serif';
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Each section is locked to one recorded take. Lengths are the takes' real
 * durations at 30fps, so the cut points fall on the natural pauses in the VO.
 */
export const SECTIONS = {
  s1: {from: 0, duration: 546},
  s2: {from: 546, duration: 523},
  s3: {from: 1069, duration: 654},
  s4: {from: 1723, duration: 859},
  s5: {from: 2582, duration: 198},
} as const;

export const AGENT_SKY_OPENROUTER_DURATION =
  SECTIONS.s5.from + SECTIONS.s5.duration;

const p = (
  frame: number,
  start: number,
  end: number,
  easing: (input: number) => number = easeOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Fonts = () => (
  <style>{`
    @font-face {
      font-family: 'AgentSky Space Grotesk';
      src: url('${staticFile("SpaceGrotesk-Bold.ttf")}') format('truetype');
      font-style: normal;
      font-weight: 700;
      font-display: block;
    }
  `}</style>
);

/**
 * The eight agent types the product actually exposes (@agent/spec AGENT_TYPES).
 * `hermes` intentionally carries no mark in the product, so it stays text-only
 * here rather than being given an invented logo.
 */
const AGENTS = [
  {label: "Claude Code", icon: "icons/claude-ai-symbol.svg"},
  {label: "Codex", icon: "icons/codex-agent.svg"},
  {label: "Hermes", icon: null},
  {label: "DeepSeek Harness", icon: "icons/deepseek.svg"},
  {label: "OpenClaw", icon: "icons/openclaw.svg"},
  {label: "pi", icon: "icons/pi.svg"},
  {label: "Kimi Code", icon: "harnesses/kimi.svg"},
  {label: "opencode", icon: "harnesses/opencode.svg"},
];

/** S01 — the OpenRouter claim, over the reused logo marquee. */
const SectionOne: React.FC = () => {
  const frame = useCurrentFrame();
  const claim = p(frame, 100, 150);
  const listStart = 210;

  return (
    <AbsoluteFill style={{background: C.canvas}}>
      <AbsoluteFill style={{opacity: 0.4 + p(frame, 300, 400) * 0.6}}>
        <AgentSkyLogoMarqueeScene />
      </AbsoluteFill>

      <AbsoluteFill style={{background: "rgba(247,247,248,.72)"}} />

      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        <div style={{width: 1400, textAlign: "center"}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 19,
              letterSpacing: 5,
              color: C.muted,
              opacity: p(frame, 20, 55),
            }}
          >
            THE OPENROUTER FOR AGENTS
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: -2.4,
              lineHeight: 1.06,
              color: C.ink,
              marginTop: 22,
              opacity: claim,
              transform: `translateY(${(1 - claim) * 26}px)`,
            }}
          >
            One API,{" "}
            <span style={{color: C.brand}}>any agent.</span>
          </div>

          <div
            style={{
              marginTop: 46,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}
          >
            {AGENTS.map((agent, index) => {
              const at = listStart + index * 34;
              const show = p(frame, at, at + 20);
              return (
                <div
                  key={agent.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 20px",
                    borderRadius: 999,
                    background: "#ffffff",
                    border: `1px solid ${C.line}`,
                    boxShadow: "0 6px 16px rgba(13,13,13,.06)",
                    fontFamily: FONT,
                    fontSize: 24,
                    fontWeight: 700,
                    color: C.ink,
                    opacity: show,
                    transform: `translateX(${(1 - show) * 40}px)`,
                  }}
                >
                  {agent.icon ? (
                    <img
                      src={staticFile(agent.icon)}
                      alt=""
                      style={{width: 26, height: 26, objectFit: "contain"}}
                    />
                  ) : null}
                  {agent.label}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 44,
              fontFamily: MONO,
              fontSize: 22,
              color: C.muted,
              opacity: p(frame, 470, 510),
            }}
          >
            POST /api/v1/agents &nbsp;{"{"} &quot;agent&quot;:{" "}
            <span style={{color: C.brand}}>&quot;claude-code&quot;</span> {"}"}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** S05 — reused outro shape: type the domain, then hold. */
const SectionFive: React.FC = () => {
  const frame = useCurrentFrame();
  const domain = "agentsky.dev";
  const typed = Math.floor(p(frame, 30, 110, Easing.linear) * domain.length);
  const caret = frame % 20 < 12 ? "|" : " ";

  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "26px 54px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.32)",
          fontFamily: FONT,
          fontSize: 62,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: -1,
          opacity: p(frame, 6, 26),
        }}
      >
        {domain.slice(0, typed)}
        <span style={{color: C.brand}}>{caret}</span>
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: 4,
          color: "rgba(255,255,255,.62)",
          opacity: p(frame, 118, 146),
        }}
      >
        ANY POPULAR AGENT. ONE KEY.
      </div>
    </AbsoluteFill>
  );
};

export const AgentSkyOpenRouterLaunch: React.FC = () => (
  <AbsoluteFill style={{background: C.canvas, fontFamily: FONT}}>
    <Fonts />
    <Audio src={staticFile("vo-v2.m4a")} />

    <Sequence from={SECTIONS.s1.from} durationInFrames={SECTIONS.s1.duration}>
      <SectionOne />
    </Sequence>

    <Sequence from={SECTIONS.s2.from} durationInFrames={SECTIONS.s2.duration}>
      <AbsoluteFill style={{background: C.canvas}}>
        <AgentSkyConfigCardSequence />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={SECTIONS.s3.from} durationInFrames={SECTIONS.s3.duration}>
      <AbsoluteFill style={{background: C.canvas}}>
        <AgentSkyCodeBuildScene immediateVisible />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={SECTIONS.s4.from} durationInFrames={SECTIONS.s4.duration}>
      <AgentSkyPlaygroundScene />
    </Sequence>

    <Sequence from={SECTIONS.s5.from} durationInFrames={SECTIONS.s5.duration}>
      <SectionFive />
    </Sequence>
  </AbsoluteFill>
);
