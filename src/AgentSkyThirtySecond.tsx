import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Audio} from "@remotion/media";

const W = 1920;
const H = 1080;

/** Live agentsky.dev tokens. Blue is the only saturated colour in the film. */
const C = {
  canvas: "#f7f7f8",
  panel: "#ffffff",
  ink: "#0d0d0d",
  muted: "#5d5d5d",
  faint: "#a8adb4",
  line: "#e5e5e5",
  surface: "#f1f1f2",
  brand: "#1683f3",
  brandDeep: "#075eb8",
  loser: "#c9ced5",
};

const FONT = '"AgentSky Space Grotesk", "Space Grotesk", "Segoe UI", Arial, sans-serif';
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

/** 31.0s at 30fps, locked to public/vo-30s.m4a. */
export const SHOTS = {
  hook: {from: 0, duration: 192},
  reveal: {from: 192, duration: 144},
  race: {from: 336, duration: 168},
  api: {from: 504, duration: 270},
  cta: {from: 774, duration: 156},
} as const;

export const AGENT_SKY_30S_DURATION = SHOTS.cta.from + SHOTS.cta.duration;

const snap = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 15, stiffness: 220, mass: 0.6}});

const p = (
  frame: number,
  a: number,
  b: number,
  easing: (input: number) => number = Easing.bezier(0.16, 1, 0.3, 1),
) =>
  interpolate(frame, [a, b], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Fonts = () => (
  <style>{`
    @font-face {
      font-family: 'AgentSky Space Grotesk';
      src: url('${staticFile("SpaceGrotesk-Bold.ttf")}') format('truetype');
      font-style: normal; font-weight: 700; font-display: block;
    }
  `}</style>
);

/** Burned-in captions — the film has to read with the sound off. */
const CAPTIONS: {from: number; to: number; text: string}[] = [
  {from: 0, to: 192, text: "The biggest question in 2026 — is DeepSeek's new agent better than Claude Code?"},
  {from: 192, to: 336, text: "With Agent Playground, you can answer that question."},
  {from: 336, to: 504, text: "Benchmark those agents on time, cost, performance and more."},
  {from: 504, to: 774, text: "We are the OpenRouter for agents. One simple API, every popular agent in the cloud."},
  {from: 774, to: 930, text: "Go to agentsky.dev and access any agent you want."},
];

export const CaptionBar: React.FC = () => {
  const frame = useCurrentFrame();
  const line = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (!line) return null;
  const inP = p(frame, line.from, line.from + 8, Easing.out(Easing.quad));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 54,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 90,
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -0.4,
          lineHeight: 1.28,
          color: "#ffffff",
          background: "rgba(13,13,13,.86)",
          padding: "14px 28px",
          borderRadius: 10,
          opacity: inP,
          transform: `translateY(${(1 - inP) * 10}px)`,
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

/** Blue shutter that flies across on a cut. Sells the hard edit. */
export const Shutter: React.FC<{at: number; dir?: 1 | -1}> = ({at, dir = 1}) => {
  const frame = useCurrentFrame();
  const t = p(frame, at, at + 11, Easing.bezier(0.7, 0, 0.2, 1));
  if (t <= 0 || t >= 1) return null;
  const x = dir === 1 ? -W + t * 2 * W : W - t * 2 * W;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${x}px) skewX(-9deg)`,
        background: C.brand,
        zIndex: 80,
      }}
    />
  );
};

/** Procedural speed streaks — the "velocity" cue, no stock footage needed. */
export const Streaks: React.FC<{count?: number; opacity?: number}> = ({count = 26, opacity = 1}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: "hidden", opacity}}>
      {Array.from({length: count}, (_, i) => {
        const seed = i * 97;
        const y = ((seed * 37) % H) + ((i % 3) - 1) * 14;
        const speed = 34 + ((seed * 13) % 40);
        const len = 120 + ((seed * 7) % 420);
        const x = ((frame * speed + seed * 53) % (W + 900)) - 900;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: len,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${C.brand}, transparent)`,
              opacity: 0.16 + ((seed % 7) / 7) * 0.3,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

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

/** SHOT 1 — the fight. Something changes every ~20 frames. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const vsIn = snap(frame, fps, 4);
  const leftIn = snap(frame, fps, 10);
  const rightIn = snap(frame, fps, 16);
  const qIn = p(frame, 62, 82);
  const swap = p(frame, 118, 132);
  const pressure = 1 + p(frame, 150, 190, Easing.in(Easing.quad)) * 0.08;

  return (
    <AbsoluteFill style={{background: C.canvas, overflow: "hidden"}}>
      <Streaks opacity={0.5 + p(frame, 140, 190) * 0.5} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pressure})`,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 46}}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: leftIn,
              transform: `translateX(${(1 - leftIn) * -160}px)`,
            }}
          >
            <Img
              src={staticFile("icons/deepseek.svg")}
              style={{width: 108, height: 108, objectFit: "contain"}}
            />
            <div
              style={{
                fontFamily: FONT,
                fontSize: 62,
                fontWeight: 700,
                letterSpacing: -1.6,
                color: C.ink,
              }}
            >
              DeepSeek
            </div>
          </div>

          <div
            style={{
              fontFamily: FONT,
              fontSize: 84,
              fontWeight: 700,
              color: C.brand,
              transform: `scale(${vsIn}) rotate(${(1 - vsIn) * -24}deg)`,
            }}
          >
            VS
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: rightIn,
              transform: `translateX(${(1 - rightIn) * 160}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 62,
                fontWeight: 700,
                letterSpacing: -1.6,
                color: C.ink,
              }}
            >
              Claude Code
            </div>
            <Img
              src={staticFile("icons/claude-ai-symbol.svg")}
              style={{width: 108, height: 108, objectFit: "contain"}}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 54,
            fontFamily: FONT,
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -2.6,
            lineHeight: 1.04,
            textAlign: "center",
            color: C.ink,
            opacity: qIn,
            transform: `translateY(${(1 - qIn) * 30}px)`,
          }}
        >
          {swap < 0.5 ? (
            <>Everybody argues.</>
          ) : (
            <>
              Nobody <span style={{color: C.brand}}>ran it.</span>
            </>
          )}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 78,
          top: 66,
          fontFamily: MONO,
          fontSize: 21,
          letterSpacing: 5,
          color: C.muted,
          opacity: p(frame, 2, 18),
        }}
      >
        THE BIGGEST QUESTION IN 2026
      </div>

      <Shutter at={176} />
    </AbsoluteFill>
  );
};

const StepRow: React.FC<{
  label: string;
  at: number;
  frame: number;
  fps: number;
  children?: React.ReactNode;
}> = ({label, at, frame, fps, children}) => {
  const s = snap(frame, fps, at);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "22px 26px",
        borderRadius: 14,
        background: C.panel,
        border: `2px solid ${s > 0.5 ? C.brand : C.line}`,
        boxShadow: s > 0.5 ? `0 0 0 6px rgba(22,131,243,.10)` : "none",
        opacity: s,
        transform: `translateX(${(1 - s) * 110}px)`,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: C.brand,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
          transform: `scale(${s})`,
        }}
      >
        ✓
      </div>
      <div style={{fontFamily: FONT, fontSize: 32, fontWeight: 700, color: C.ink}}>{label}</div>
      {children}
    </div>
  );
};

/** SHOT 2 — the answer exists. Three snaps, one per second. */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shellIn = snap(frame, fps, 0);

  return (
    <AbsoluteFill style={{background: C.canvas, overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 196,
          width: W - 520,
          height: 560,
          borderRadius: 22,
          background: C.panel,
          border: `1px solid ${C.line}`,
          boxShadow: "0 40px 90px rgba(13,13,13,.13)",
          overflow: "hidden",
          opacity: shellIn,
          transform: `translateY(${(1 - shellIn) * 120}px) scale(${0.94 + shellIn * 0.06})`,
        }}
      >
        <div
          style={{
            height: 60,
            background: C.surface,
            borderBottom: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "0 24px",
            fontFamily: MONO,
            fontSize: 17,
            color: C.muted,
          }}
        >
          <span style={{width: 10, height: 10, borderRadius: "50%", background: C.faint}} />
          <span style={{width: 10, height: 10, borderRadius: "50%", background: C.faint}} />
          <span style={{width: 10, height: 10, borderRadius: "50%", background: C.faint}} />
          <span style={{marginLeft: 14}}>agentsky.dev/playground</span>
        </div>

        <div style={{padding: "40px 46px", display: "flex", flexDirection: "column", gap: 18}}>
          <StepRow label="DeepSeek Harness" at={18} frame={frame} fps={fps} />
          <StepRow label="Claude Code" at={38} frame={frame} fps={fps} />
          <StepRow label="agentsky/asteroids  #412" at={62} frame={frame} fps={fps}>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: MONO,
                fontSize: 19,
                letterSpacing: 2,
                color: C.brandDeep,
                background: "#e4f0fe",
                border: `1px solid ${C.brand}`,
                borderRadius: 999,
                padding: "8px 18px",
              }}
            >
              A REAL ISSUE
            </span>
          </StepRow>

          <div
            style={{
              marginTop: 16,
              alignSelf: "flex-start",
              padding: "20px 44px",
              borderRadius: 12,
              background: C.brand,
              color: "#fff",
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 700,
              transform: `scale(${snap(frame, fps, 92)})`,
              boxShadow: "0 18px 40px rgba(22,131,243,.34)",
            }}
          >
            Run both →
          </div>
        </div>
      </div>
      <Shutter at={128} dir={-1} />
    </AbsoluteFill>
  );
};

const LANES = [
  {
    name: "DeepSeek Harness",
    icon: "icons/deepseek.svg",
    finish: 96,
    seconds: 185,
    cost: 0.11,
  },
  {
    name: "Claude Code",
    icon: "icons/claude-ai-symbol.svg",
    finish: 116,
    seconds: 252,
    cost: 0.38,
  },
];

const clock = (total: number) => {
  const whole = Math.floor(total);
  return `${Math.floor(whole / 60)}:${(whole % 60).toString().padStart(2, "0")}`;
};

/** SHOT 3 — the race and the verdict, compressed into 5.6s. */
export const Race: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const board = p(frame, 118, 140);

  return (
    <AbsoluteFill
      style={{
        background: C.canvas,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Streaks count={16} opacity={0.35} />
      <div style={{width: 1500}}>
        {LANES.map((lane, index) => {
          const prog = Math.max(0, Math.min(1, (frame - 6) / (lane.finish - 6)));
          const done = frame >= lane.finish;
          const wins = index === 0;
          const rowIn = snap(frame, fps, index * 6);
          return (
            <div
              key={lane.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginBottom: 24,
                opacity: rowIn,
                transform: `translateX(${(1 - rowIn) * -80}px)`,
              }}
            >
              <Img
                src={staticFile(lane.icon)}
                style={{width: 62, height: 62, objectFit: "contain"}}
              />
              <div style={{width: 336, fontFamily: FONT, fontSize: 32, fontWeight: 700, color: C.ink}}>
                {lane.name}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 58,
                  borderRadius: 10,
                  background: C.surface,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${prog * 100}%`,
                    height: "100%",
                    background: done && wins ? C.brand : done ? C.loser : C.brand,
                    opacity: done && !wins ? 1 : 1,
                  }}
                />
              </div>
              <div
                style={{
                  width: 168,
                  fontFamily: MONO,
                  fontSize: 38,
                  fontWeight: 600,
                  color: done && wins ? C.brand : C.ink,
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                {clock(lane.seconds * prog)}
              </div>
              <div
                style={{
                  width: 132,
                  fontFamily: MONO,
                  fontSize: 30,
                  color: done && wins ? C.brand : C.muted,
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                ${(lane.cost * prog).toFixed(2)}
              </div>
            </div>
          );
        })}

        <div
          style={{
            marginTop: 34,
            fontFamily: FONT,
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: -1.4,
            color: C.ink,
            opacity: board,
            transform: `translateY(${(1 - board) * 22}px)`,
          }}
        >
          Time. Cost. Review score.{" "}
          <span style={{color: C.brand}}>All three, side by side.</span>
        </div>
      </div>
      <Shutter at={152} />
    </AbsoluteFill>
  );
};

/** SHOT 4 — why we can run it: one API, eight agents, rapid fire. */
export const Api: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const title = p(frame, 4, 24);
  const listStart = 40;
  const codeIn = p(frame, 196, 224);
  const shown = Math.min(AGENTS.length, Math.max(0, Math.floor((frame - listStart) / 17) + 1));
  const current = AGENTS[Math.max(0, Math.min(AGENTS.length - 1, shown - 1))];

  return (
    <AbsoluteFill style={{background: C.canvas, overflow: "hidden"}}>
      <Streaks count={20} opacity={0.4} />
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            letterSpacing: 6,
            color: C.muted,
            opacity: title,
          }}
        >
          THE OPENROUTER FOR AGENTS
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: FONT,
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: -2.8,
            color: C.ink,
            opacity: title,
            transform: `translateY(${(1 - title) * 26}px)`,
          }}
        >
          One API, <span style={{color: C.brand}}>any agent.</span>
        </div>

        <div
          style={{
            marginTop: 44,
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            justifyContent: "center",
            maxWidth: 1500,
          }}
        >
          {AGENTS.slice(0, shown).map((agent, index) => {
            const s = snap(frame, fps, listStart + index * 17);
            return (
              <div
                key={agent.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 26px",
                  borderRadius: 999,
                  background: C.panel,
                  border: `2px solid ${index === shown - 1 ? C.brand : C.line}`,
                  boxShadow:
                    index === shown - 1
                      ? "0 0 0 7px rgba(22,131,243,.11)"
                      : "0 8px 18px rgba(13,13,13,.05)",
                  fontFamily: FONT,
                  fontSize: 32,
                  fontWeight: 700,
                  color: C.ink,
                  transform: `scale(${s})`,
                }}
              >
                {agent.icon ? (
                  <Img
                    src={staticFile(agent.icon)}
                    style={{width: 34, height: 34, objectFit: "contain"}}
                  />
                ) : null}
                {agent.label}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 46,
            fontFamily: MONO,
            fontSize: 30,
            color: C.ink,
            background: C.panel,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: "20px 32px",
            boxShadow: "0 14px 34px rgba(13,13,13,.07)",
            opacity: codeIn,
            transform: `translateY(${(1 - codeIn) * 20}px)`,
          }}
        >
          {"{ "}&quot;agent&quot;:{" "}
          <span style={{color: C.brand}}>&quot;{current.label.toLowerCase().replace(/ /g, "-")}&quot;</span>
          {" }"}
        </div>
      </AbsoluteFill>
      <Shutter at={254} dir={-1} />
    </AbsoluteFill>
  );
};

/** SHOT 5 — hold on the domain. */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const markIn = snap(frame, fps, 2);
  const domain = "agentsky.dev";
  const typed = Math.floor(p(frame, 16, 62, Easing.linear) * domain.length);

  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Streaks count={22} opacity={0.5} />
      <Img
        src={staticFile("agentsky-mark.png")}
        style={{
          width: 128,
          height: 128,
          objectFit: "contain",
          transform: `scale(${markIn})`,
          filter: "brightness(0) invert(1)",
        }}
      />
      <div
        style={{
          marginTop: 34,
          fontFamily: FONT,
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: -2.4,
          color: "#ffffff",
        }}
      >
        {domain.slice(0, typed)}
        <span style={{color: C.brand}}>{frame % 20 < 12 ? "|" : " "}</span>
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: MONO,
          fontSize: 26,
          letterSpacing: 6,
          color: "rgba(255,255,255,.66)",
          opacity: p(frame, 74, 96),
        }}
      >
        PICK THE ONE YOUR TASK NEEDS
      </div>
    </AbsoluteFill>
  );
};

export const AgentSkyThirtySecond: React.FC = () => (
  <AbsoluteFill style={{background: C.canvas, fontFamily: FONT}}>
    <Fonts />
    <Audio src={staticFile("vo-30s.m4a")} />

    <Sequence from={SHOTS.hook.from} durationInFrames={SHOTS.hook.duration}>
      <Hook />
    </Sequence>
    <Sequence from={SHOTS.reveal.from} durationInFrames={SHOTS.reveal.duration}>
      <Reveal />
    </Sequence>
    <Sequence from={SHOTS.race.from} durationInFrames={SHOTS.race.duration}>
      <Race />
    </Sequence>
    <Sequence from={SHOTS.api.from} durationInFrames={SHOTS.api.duration}>
      <Api />
    </Sequence>
    <Sequence from={SHOTS.cta.from} durationInFrames={SHOTS.cta.duration}>
      <Cta />
    </Sequence>

    <CaptionBar />
  </AbsoluteFill>
);
