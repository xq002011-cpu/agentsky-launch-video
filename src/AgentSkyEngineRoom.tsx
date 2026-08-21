import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {Audio} from "@remotion/media";
import {Hook, Reveal, Race, Api, Cta} from "./AgentSkyThirtySecond";

const FONT = '"AgentSky Space Grotesk", "Space Grotesk", "Segoe UI", Arial, sans-serif';
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';
const BRAND = "#1683f3";

/**
 * Engine-room cut: AI b-roll (public/gen) hard-cut against the white UI
 * scenes. Sections are locked to the five recorded VO segments in public/vo.
 */
export const ER = {
  ignite: {from: 0, duration: 90},
  vs: {from: 90, duration: 192},
  gridline: {from: 282, duration: 60},
  playground: {from: 342, duration: 144},
  raceShot: {from: 486, duration: 60},
  scoreboard: {from: 546, duration: 168},
  hangar: {from: 714, duration: 60},
  oneApi: {from: 774, duration: 270},
  ember: {from: 1044, duration: 156},
} as const;

export const AGENT_SKY_ENGINE_ROOM_DURATION = ER.ember.from + ER.ember.duration;

/**
 * Per-clip trim offsets (frames into the source clip), chosen from motion
 * analysis so each cut lands mid-action rather than on a still frame.
 */
const TRIMS: Record<string, number> = {
  "gen/shot1-ignite.mp4": 60,
  "gen/shot2-gridline.mp4": 66,
  "gen/shot3-race.mp4": 1,
  "gen/shot4-hangar.mp4": 68,
  "gen/shot5-ember.mp4": 0,
};

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

/** Full-screen b-roll with a slow push-in and vignette; muted, VO carries. */
const Broll: React.FC<{src: string; label?: string; durationInFrames: number}> = ({
  src,
  label,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const zoom = 1.04 + (frame / durationInFrames) * 0.07;

  return (
    <AbsoluteFill style={{background: "#000", overflow: "hidden"}}>
      <OffthreadVideo
        muted
        src={staticFile(src)}
        trimBefore={TRIMS[src] ?? 0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,.42) 100%)",
        }}
      />
      {label ? (
        <div
          style={{
            position: "absolute",
            left: 78,
            bottom: 64,
            fontFamily: MONO,
            fontSize: 21,
            letterSpacing: 6,
            color: "rgba(255,255,255,.85)",
            opacity: p(frame, 8, 26),
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const CAPTIONS: {from: number; to: number; text: string}[] = [
  {from: 90, to: 282, text: "The biggest question in 2026 — is DeepSeek's new agent better than Claude Code?"},
  {from: 342, to: 486, text: "With Agent Playground, you can answer that question."},
  {from: 546, to: 714, text: "Benchmark those agents on time, cost, performance and more."},
  {from: 774, to: 1044, text: "We are the OpenRouter for agents. One simple API, every popular agent in the cloud."},
  {from: 1044, to: 1200, text: "Go to agentsky.dev and access any agent you want."},
];

const Captions: React.FC = () => {
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

export const AgentSkyEngineRoom: React.FC = () => (
  <AbsoluteFill style={{background: "#0d0d0d", fontFamily: FONT}}>
    <Sequence from={ER.ignite.from} durationInFrames={ER.ignite.duration}>
      <Broll src="gen/shot1-ignite.mp4" durationInFrames={ER.ignite.duration} />
    </Sequence>

    <Sequence from={ER.vs.from} durationInFrames={ER.vs.duration}>
      <Hook />
    </Sequence>

    <Sequence from={ER.gridline.from} durationInFrames={ER.gridline.duration}>
      <Broll
        src="gen/shot2-gridline.mp4"
        durationInFrames={ER.gridline.duration}
        label="SAME TASK. TWO ENGINES."
      />
    </Sequence>

    <Sequence from={ER.playground.from} durationInFrames={ER.playground.duration}>
      <Reveal />
    </Sequence>

    <Sequence from={ER.raceShot.from} durationInFrames={ER.raceShot.duration}>
      <Broll src="gen/shot3-race.mp4" durationInFrames={ER.raceShot.duration} />
    </Sequence>

    <Sequence from={ER.scoreboard.from} durationInFrames={ER.scoreboard.duration}>
      <Race />
    </Sequence>

    <Sequence from={ER.hangar.from} durationInFrames={ER.hangar.duration}>
      <Broll
        src="gen/shot4-hangar.mp4"
        durationInFrames={ER.hangar.duration}
        label="ONE. OR THOUSANDS."
      />
    </Sequence>

    <Sequence from={ER.oneApi.from} durationInFrames={ER.oneApi.duration}>
      <Api />
    </Sequence>

    <Sequence from={ER.ember.from} durationInFrames={ER.ember.duration}>
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: 0.5}}>
          <Broll src="gen/shot5-ember.mp4" durationInFrames={ER.ember.duration} />
        </AbsoluteFill>
        <Cta />
      </AbsoluteFill>
    </Sequence>

    {/* VO segments mounted at their beats */}
    <Sequence from={90}>
      <Audio src={staticFile("vo/f1.m4a")} />
    </Sequence>
    <Sequence from={342}>
      <Audio src={staticFile("vo/f2.m4a")} />
    </Sequence>
    <Sequence from={546}>
      <Audio src={staticFile("vo/f3.m4a")} />
    </Sequence>
    <Sequence from={774}>
      <Audio src={staticFile("vo/f4.m4a")} />
    </Sequence>
    <Sequence from={1044}>
      <Audio src={staticFile("vo/f5.m4a")} />
    </Sequence>

    <Captions />
  </AbsoluteFill>
);
