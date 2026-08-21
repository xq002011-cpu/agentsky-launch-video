/**
 * AgentSkyFrameSync — 30s viral launch cut
 *
 * Structure (爆款节奏):
 *   0–3s   HOOK   — dark dual-terminal + "Is DeepSeek better than Claude Code?" word-slam
 *   3–6s   REVEAL — "With Agent Playground by AgentSky" brand reveal
 *   6–14s  DEMO   — select agents / connect GitHub, b-roll bg
 *   14–19s RACE   — benchmark bars racing side-by-side
 *   19–23s VERDICT— "best agent for your use case" + scoreboard
 *   23–30s CTA    — agentsky.dev logo + tagline
 *
 * Audio: vo-183552-tight.m4a (24.4s) covers 0–23s; CTA 23–30s is music-only.
 * All word anchors locked to 183552-tight-words.json timestamps.
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";

// ─── Constants ───────────────────────────────────────────────────────────────
const W = 1920;
const H = 1080;
const FPS = 30;

const C = {
  bg: "#0a0a0c",
  panel: "#111115",
  panelBorder: "#1e1e24",
  ink: "#f0f0f2",
  muted: "#8b8b9e",
  faint: "#3a3a48",
  brand: "#1683f3",
  brandGlow: "rgba(22,131,243,0.18)",
  amber: "#f5a623",
  win: "#22c55e",
  lose: "#3a3a48",
};

const FONT = '"AgentSky Space Grotesk","Space Grotesk","Segoe UI",Arial,sans-serif';
const MONO = '"SFMono-Regular",Consolas,"Liberation Mono",monospace';

// ─── Sections ─────────────────────────────────────────────────────────────────
export const FS = {
  hook:    { from: 0,   duration: 90  }, // 0–3s
  reveal:  { from: 90,  duration: 90  }, // 3–6s
  demo:    { from: 180, duration: 240 }, // 6–14s
  race:    { from: 420, duration: 150 }, // 14–19s
  verdict: { from: 570, duration: 120 }, // 19–23s
  cta:     { from: 690, duration: 210 }, // 23–30s
} as const;

export const AGENT_SKY_FRAME_SYNC_DURATION =
  FS.cta.from + FS.cta.duration; // 900

// ─── Word timestamps (183552-tight, seconds → frames) ────────────────────────
const W2F = (s: number) => Math.round(s * FPS);

// key anchors used for text reveals
const A = {
  is:           W2F(0.0),
  deepseeks:    W2F(0.36),
  new_:         W2F(0.98),
  agent:        W2F(1.16),
  better:       W2F(1.5),
  than:         W2F(1.94),
  claude:       W2F(2.24),
  code_q:       W2F(2.48),
  with_:        W2F(2.86),
  agent2:       W2F(3.06),
  playground:   W2F(3.44),
  by_:          W2F(4.10),
  agentsky:     W2F(4.34),
  youll:        W2F(4.94),
  answer:       W2F(5.72),
  question:     W2F(6.42),
  go:           W2F(7.12),
  to:           W2F(7.44),
  playground2:  W2F(7.56),
  select:       W2F(8.26),
  deepseek_a:   W2F(8.62),
  agent3:       W2F(9.14),
  claude2:      W2F(9.46),
  code2:        W2F(9.82),
  connect:      W2F(10.42),
  github:       W2F(10.98),
  real:         W2F(12.08),
  task:         W2F(12.4),
  youll2:       W2F(14.26),
  benchmark:    W2F(15.10),
  time_:        W2F(16.80),
  cost_:        W2F(17.46),
  perf:         W2F(18.30),
  so_:          W2F(19.78),
  always:       W2F(20.30),
  select2:      W2F(20.70),
  best:         W2F(21.18),
  agent4:       W2F(21.42),
  use_case:     W2F(22.84),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ease = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const snapIn = (frame: number, at: number, cfg = { stiffness: 340, damping: 20, mass: 0.6 }) =>
  spring({ frame: frame - at, fps: FPS, config: cfg });

// ─── Font face injection ──────────────────────────────────────────────────────
const Fonts: React.FC = () => (
  <style>{`
    @font-face {
      font-family: 'AgentSky Space Grotesk';
      src: url('${staticFile("SpaceGrotesk-Bold.ttf")}') format('truetype');
      font-weight: 700; font-display: block;
    }
  `}</style>
);

// ─── Blue shutter transition ──────────────────────────────────────────────────
const Shutter: React.FC<{ at: number; dir?: 1 | -1 }> = ({ at, dir = 1 }) => {
  const frame = useCurrentFrame();
  const t = ease(frame, at, at + 10);
  if (t <= 0 || t >= 1) return null;
  const x = dir === 1 ? -W + t * 2 * W : W - t * 2 * W;
  return (
    <div style={{
      position: "absolute", inset: 0,
      transform: `translateX(${x}px) skewX(-8deg)`,
      background: C.brand, zIndex: 80,
    }} />
  );
};

// ─── Word-slam text — each word snaps in at its exact audio frame ─────────────
interface WordToken { text: string; frame: number; highlight?: boolean }

const WordSlam: React.FC<{
  words: WordToken[];
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
  stagger?: number;
}> = ({ words, style, wordStyle, stagger = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0 12px", ...style }}>
      {words.map((w, i) => {
        const at = w.frame + i * stagger;
        const s = snapIn(frame, at);
        const visible = frame >= at - 2;
        return (
          <span
            key={i}
            style={{
              opacity: visible ? 1 : 0,
              transform: `scale(${0.3 + s * 0.7}) translateY(${(1 - s) * 18}px)`,
              display: "inline-block",
              color: w.highlight ? C.brand : C.ink,
              ...wordStyle,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ─── Section: HOOK (0–90f) ───────────────────────────────────────────────────
const Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // two fake terminal panels side by side
  const panels = [
    { label: "Claude Code (Fable 5)", lines: ["$ git clone task/fix-auth", "> Analyzing codebase...", "> Found 3 issues in auth.ts", "  → Patching middleware...", "  → Writing tests...", "  ✓ Tests passing (14/14)", "  → Opening PR #2847..."] },
    { label: "DeepSeek V4 Flash", lines: ["$ git clone task/fix-auth", "> Parsing repository...", "> Scanning auth.ts...", "  → Identifying root cause...", "  → Applying patch..."] },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <Fonts />

      {/* subtle grid bg */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(${C.faint} 1px, transparent 1px),
          linear-gradient(90deg, ${C.faint} 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        opacity: 0.25,
      }} />

      {/* two terminal panels */}
      {panels.map((p, pi) => {
        const panelIn = ease(frame, pi * 6, pi * 6 + 20);
        const lineCount = Math.floor(ease(frame, 0, 85) * p.lines.length);
        return (
          <div key={pi} style={{
            position: "absolute",
            top: 120, bottom: 230,
            left: pi === 0 ? 80 : W / 2 + 20,
            width: W / 2 - 120,
            background: C.panel,
            border: `1px solid ${C.panelBorder}`,
            borderRadius: 12,
            padding: "20px 28px",
            opacity: panelIn,
            transform: `translateY(${(1 - panelIn) * 20}px)`,
            overflow: "hidden",
          }}>
            {/* title bar */}
            <div style={{
              fontFamily: MONO, fontSize: 13, color: C.muted,
              marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: pi === 0 ? C.brand : C.amber }}>●</span>
              {p.label}
            </div>
            {/* streaming lines */}
            {p.lines.slice(0, lineCount + 1).map((line, li) => (
              <div key={li} style={{
                fontFamily: MONO, fontSize: 14, color: li === lineCount ? C.ink : C.muted,
                lineHeight: 1.7,
              }}>{line}</div>
            ))}
            {/* cursor blink */}
            <span style={{
              display: "inline-block",
              width: 8, height: 16,
              background: C.brand,
              opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
              marginLeft: 2,
              verticalAlign: "middle",
            }} />
          </div>
        );
      })}

      {/* BIG question word-slam */}
      <div style={{
        position: "absolute", left: 80, right: 80, bottom: 90,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {/* line 1: "Is DeepSeek's new agent" */}
        <WordSlam
          words={[
            { text: "Is", frame: A.is },
            { text: "DeepSeek's", frame: A.deepseeks, highlight: true },
            { text: "new", frame: A.new_ },
            { text: "agent", frame: A.agent },
          ]}
          style={{ justifyContent: "center" }}
          wordStyle={{ fontFamily: FONT, fontSize: 80, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}
        />
        {/* line 2: "better than Claude Code?" */}
        <WordSlam
          words={[
            { text: "better", frame: A.better },
            { text: "than", frame: A.than },
            { text: "Claude Code?", frame: A.claude, highlight: true },
          ]}
          style={{ justifyContent: "center" }}
          wordStyle={{ fontFamily: FONT, fontSize: 80, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── Section: REVEAL (90–180f, 3–6s) ─────────────────────────────────────────
const Reveal: React.FC = () => {
  const frame = useCurrentFrame();

  // word anchors relative to section start (frame 90)
  const secFrame = frame; // already within Sequence context

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {/* dim b-roll bg */}
      <OffthreadVideo
        muted
        src={staticFile("gen/shot1-ignite.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }}
      />
      <AbsoluteFill style={{ background: "rgba(10,10,12,0.6)" }} />

      {/* "With Agent Playground by AgentSky" */}
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <div style={{ fontFamily: FONT, fontSize: 34, color: C.muted, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          {ease(frame, A.with_ - 90, A.with_ - 75) > 0 ? "Introducing" : ""}
        </div>

        <WordSlam
          words={[
            { text: "Agent", frame: A.agent2 - 90 },
            { text: "Playground", frame: A.playground - 90, highlight: true },
          ]}
          style={{ justifyContent: "center" }}
          wordStyle={{ fontFamily: FONT, fontSize: 112, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}
        />

        <div style={{
          fontFamily: FONT, fontSize: 36, color: C.muted, fontWeight: 700,
          opacity: ease(frame, A.by_ - 90, A.agentsky - 90),
        }}>
          by{" "}
          <span style={{ color: C.brand }}>AgentSky</span>
        </div>

        <div style={{
          fontFamily: FONT, fontSize: 26, color: C.muted,
          opacity: ease(frame, A.youll - 90, A.answer - 90),
          marginTop: 8,
        }}>
          You'll be able to answer that question.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Section: DEMO (180–420f, 6–14s) ─────────────────────────────────────────
const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  // frame 0 in this Sequence = absolute frame 180

  const steps = [
    { at: A.go - 180,       icon: "↗", text: "Go to Playground",        detail: "agentsky.dev/playground" },
    { at: A.select - 180,   icon: "⊞", text: "Select your agents",      detail: "DeepSeek V4 Flash  ×  Claude Code (Fable 5)" },
    { at: A.connect - 180,  icon: "⬡", text: "Connect a real GitHub task", detail: "github.com/yourorg/fix-auth-bug" },
    { at: A.youll2 - 180,   icon: "▶", text: "Run the benchmark",       detail: "Side-by-side · real code · real results" },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {/* b-roll bg cycles */}
      {[
        { src: "gen/shot3b-streams.mp4", from: 0 },
        { src: "gen/shot3-race.mp4", from: 120 },
      ].map(({ src, from }) => (
        frame >= from && frame < from + 120 ? (
          <OffthreadVideo
            key={src}
            muted
            src={staticFile(src)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22 }}
          />
        ) : null
      ))}
      <AbsoluteFill style={{ background: "rgba(10,10,12,0.72)" }} />

      {/* step cards */}
      <div style={{
        position: "absolute", left: 160, right: 160, top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100, margin: "0 auto",
        alignSelf: "center",
      }}>
        {steps.map((step, i) => {
          const s = snapIn(frame, step.at);
          const visible = frame >= step.at - 4;
          const active = i < steps.filter((st) => frame >= st.at).length;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 28,
              opacity: visible ? 1 : 0,
              transform: `translateX(${(1 - s) * -40}px)`,
            }}>
              <div style={{
                width: 56, height: 56,
                background: active ? C.brand : C.faint,
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, color: "#fff", flexShrink: 0,
                boxShadow: active ? `0 0 24px ${C.brandGlow}` : "none",
                transition: "background 0.3s",
              }}>
                {step.icon}
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 700, color: C.ink, letterSpacing: -1, lineHeight: 1.1 }}>
                  {step.text}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 18, color: C.muted, marginTop: 4 }}>
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Section: RACE (420–570f, 14–19s) ────────────────────────────────────────
const Race: React.FC = () => {
  const frame = useCurrentFrame();
  // frame 0 in Sequence = absolute 420

  const AGENTS = [
    { name: "DeepSeek V4 Flash", color: C.amber, finalMs: 47000, finalCost: 0.08, winner: true },
    { name: "Claude Code (Fable 5)", color: C.brand, finalMs: 133000, finalCost: 0.31, winner: false },
  ];

  // Both bars race to 100%. Winner (DeepSeek) fills at frame 60.
  // Loser (Claude) at 133/47 = 2.83x longer → done at frame ~170 (outside section).
  const winnerFillAt = 60;
  const MAX_BAR = W - 240;
  const winProgress = interpolate(frame, [0, winnerFillAt], [0, 1], {
    easing: Easing.bezier(0.25, 0, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const loseProgress = interpolate(frame, [0, 170], [0, 1], {
    easing: Easing.bezier(0.25, 0, 0.3, 1),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const metricsAt = A.time_ - 420;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <OffthreadVideo
        muted
        src={staticFile("gen/shot4-hangar.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }}
      />
      <AbsoluteFill style={{ background: "rgba(10,10,12,0.8)" }} />

      {/* heading */}
      <div style={{
        position: "absolute", left: 120, right: 120, top: 100,
        fontFamily: FONT, fontSize: 52, fontWeight: 700, color: C.ink,
        opacity: ease(frame, 0, 16),
        letterSpacing: -1.5,
      }}>
        Same GitHub task. Who finishes first?
      </div>

      {/* race bars */}
      <div style={{
        position: "absolute", left: 120, right: 120, top: 220,
        display: "flex", flexDirection: "column", gap: 60,
      }}>
        {AGENTS.map((agent, i) => {
          const progress = agent.winner ? winProgress : loseProgress;
          const barW = progress * MAX_BAR;
          const isFrozen = frame >= winnerFillAt && agent.winner;

          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: agent.color, letterSpacing: -0.5 }}>
                  {agent.name}
                </div>
                {isFrozen && (
                  <div style={{
                    fontFamily: FONT, fontSize: 24, fontWeight: 700,
                    color: C.amber, background: "rgba(245,166,35,0.12)",
                    border: `1px solid ${C.amber}44`,
                    padding: "6px 20px", borderRadius: 8,
                    opacity: snapIn(frame, winnerFillAt),
                    transform: `scale(${0.8 + snapIn(frame, winnerFillAt) * 0.2})`,
                  }}>
                    ✓ 0:47 — WINNER
                  </div>
                )}
                {!agent.winner && frame >= winnerFillAt && (
                  <div style={{ fontFamily: MONO, fontSize: 16, color: C.muted }}>
                    still running… {Math.round(loseProgress * 133)}s
                  </div>
                )}
              </div>
              <div style={{ position: "relative", height: 24, background: C.faint, borderRadius: 12, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: barW,
                  background: agent.color, borderRadius: 12,
                  boxShadow: isFrozen ? `0 0 24px ${agent.color}88` : "none",
                }} />
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 3, background: "rgba(255,255,255,0.25)" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* metric labels appear as VO says them */}
      <div style={{
        position: "absolute", left: 120, right: 120, bottom: 160,
        display: "flex", gap: 60,
      }}>
        {[
          { label: "TIME", at: metricsAt, val: "0:47 vs 2:13" },
          { label: "COST", at: metricsAt + (A.cost_ - A.time_), val: "$0.08 vs $0.31" },
          { label: "QUALITY", at: metricsAt + (A.perf - A.time_), val: "ILLUSTRATIVE RUN" },
        ].map((m, i) => {
          const s = snapIn(frame, m.at);
          return (
            <div key={i} style={{
              opacity: frame >= m.at ? 1 : 0,
              transform: `translateY(${(1 - s) * 14}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 13, color: C.muted, letterSpacing: 3, marginBottom: 6 }}>
                {m.label}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: C.ink }}>
                {m.val}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Section: VERDICT (570–690f, 19–23s) ─────────────────────────────────────
const Verdict: React.FC = () => {
  const frame = useCurrentFrame();

  const rows = [
    { metric: "Time to complete", winner: "DeepSeek V4 Flash", loser: "Claude (Fable 5)", wVal: "0:47", lVal: "2:13" },
    { metric: "Cost", winner: "DeepSeek V4 Flash", loser: "Claude (Fable 5)", wVal: "$0.08", lVal: "$0.31" },
    { metric: "Tests passing", winner: "Claude (Fable 5)", loser: "DeepSeek V4 Flash", wVal: "14/14", lVal: "11/14" },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
        {/* headline */}
        <div style={{
          fontFamily: FONT, fontSize: 44, fontWeight: 700, color: C.ink,
          letterSpacing: -1.5, textAlign: "center",
          opacity: ease(frame, 0, 18),
        }}>
          So you can always select the{" "}
          <span style={{ color: C.brand }}>best agent</span>
          {" "}for your use case.
        </div>

        {/* comparison table */}
        <div style={{
          width: 1400,
          background: C.panel,
          border: `1px solid ${C.panelBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          opacity: ease(frame, 10, 28),
        }}>
          {/* header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr",
            padding: "14px 28px",
            background: "rgba(22,131,243,0.06)",
            borderBottom: `1px solid ${C.panelBorder}`,
            fontFamily: MONO, fontSize: 13, color: C.muted, letterSpacing: 2,
          }}>
            <div>METRIC</div>
            <div style={{ textAlign: "center", color: C.amber }}>WINNER</div>
            <div style={{ textAlign: "center" }}>RUNNER-UP</div>
          </div>

          {rows.map((row, i) => {
            const s = snapIn(frame, 20 + i * 16);
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr",
                padding: "18px 28px",
                borderBottom: i < rows.length - 1 ? `1px solid ${C.panelBorder}` : "none",
                opacity: s,
                transform: `translateY(${(1 - s) * 10}px)`,
              }}>
                <div style={{ fontFamily: FONT, fontSize: 20, color: C.muted, fontWeight: 700 }}>{row.metric}</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.amber }}>{row.wVal}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted, marginTop: 2 }}>{row.winner.split(" ")[0]}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.muted }}>{row.lVal}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, marginTop: 2 }}>{row.loser.split(" ")[0]}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* disclaimer */}
        <div style={{
          fontFamily: MONO, fontSize: 13, color: C.faint,
          opacity: ease(frame, 60, 80),
        }}>
          ILLUSTRATIVE RUN · agentsky.dev/playground for live results
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Section: CTA (690–900f, 23–30s) ─────────────────────────────────────────
const CTA: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <OffthreadVideo
        muted
        src={staticFile("gen/shot5-ember.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }}
      />
      <AbsoluteFill style={{ background: "rgba(10,10,12,0.78)" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
        {/* logo */}
        <Img
          src={staticFile("agentsky-logo.png")}
          style={{
            width: 200,
            opacity: snapIn(frame, 10),
            transform: `scale(${0.6 + snapIn(frame, 10) * 0.4})`,
          }}
        />

        {/* "agentsky.dev" big */}
        <div style={{
          fontFamily: FONT, fontSize: 96, fontWeight: 700, color: C.ink,
          letterSpacing: -3, lineHeight: 1,
          opacity: snapIn(frame, 22),
          transform: `translateY(${(1 - snapIn(frame, 22)) * 20}px)`,
        }}>
          agentsky<span style={{ color: C.brand }}>.dev</span>
        </div>

        {/* tagline */}
        <div style={{
          fontFamily: FONT, fontSize: 32, fontWeight: 700,
          color: C.muted, letterSpacing: -0.5,
          opacity: ease(frame, 38, 56),
        }}>
          The OpenRouter for Agents
        </div>

        {/* CTA button feel */}
        <div style={{
          fontFamily: FONT, fontSize: 22, fontWeight: 700,
          color: "#fff", background: C.brand,
          padding: "16px 48px", borderRadius: 50,
          boxShadow: `0 0 40px ${C.brandGlow}`,
          opacity: ease(frame, 56, 74),
          transform: `scale(${0.85 + ease(frame, 56, 74) * 0.15})`,
        }}>
          Start Benchmarking Free
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Root Composition ─────────────────────────────────────────────────────────
export const AgentSkyFrameSync: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Primary VO — 24.4s covers all action sections */}
      <Audio src={staticFile("vo-183552-tight.m4a")} volume={1.0} />

      {/* Sections */}
      <Sequence from={FS.hook.from} durationInFrames={FS.hook.duration} name="Hook">
        <Hook />
      </Sequence>

      <Sequence from={FS.reveal.from} durationInFrames={FS.reveal.duration} name="Reveal">
        <Reveal />
      </Sequence>

      <Sequence from={FS.demo.from} durationInFrames={FS.demo.duration} name="Demo">
        <Demo />
      </Sequence>

      <Sequence from={FS.race.from} durationInFrames={FS.race.duration} name="Race">
        <Race />
      </Sequence>

      <Sequence from={FS.verdict.from} durationInFrames={FS.verdict.duration} name="Verdict">
        <Verdict />
      </Sequence>

      <Sequence from={FS.cta.from} durationInFrames={FS.cta.duration} name="CTA">
        <CTA />
      </Sequence>

      {/* Shutter transitions on section cuts */}
      <Shutter at={FS.reveal.from} />
      <Shutter at={FS.demo.from} dir={-1} />
      <Shutter at={FS.race.from} />
      <Shutter at={FS.verdict.from} dir={-1} />
      <Shutter at={FS.cta.from} />
    </AbsoluteFill>
  );
};
