import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const W = 1920;
const H = 1080;

/** Live agentsky.dev tokens (ts/apps/asteroids/src/app/globals.css). */
const C = {
  canvas: "#f7f7f8",
  panel: "#ffffff",
  ink: "#0d0d0d",
  muted: "#5d5d5d",
  faint: "#7a7a7a",
  line: "#ececec",
  surface: "#f1f1f2",
  teal: "#1683f3",
  tealSoft: "#e4f0fe",
  amber: "#b4820f",
  brandDeep: "#075eb8",
};

const FONT = '"AgentSky Space Grotesk", "Space Grotesk", "Segoe UI", Arial, sans-serif';
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** Total scene length, locked to take 183552 (28.63s at 30fps). */
export const AGENT_SKY_PLAYGROUND_DURATION = 859;

/** Beat boundaries, in frames. Every visual below reads from these. */
const B = {
  question: 0,
  reveal: 175,
  pickAgents: 300,
  connectRepo: 400,
  race: 540,
  score: 730,
} as const;

/** Every stage occupies the same box under the 62px window chrome. */
const STAGE: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 62,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

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

/** Deterministic jitter so lane activity looks alive without Math.random(). */
const wobble = (seed: number, frame: number) =>
  Math.sin((frame + seed * 37) * 0.19 + seed) * 0.5 + 0.5;

type Lane = {
  id: string;
  name: string;
  model: string;
  logo: string;
  /** Frame at which this lane's run completes. */
  finish: number;
  seconds: number;
  cost: number;
  score: number;
  steps: string[];
};

const LANES: Lane[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    model: "Claude Fable 5",
    logo: "ai-product-logos/04-Claude-Code.png",
    finish: 722,
    seconds: 252,
    cost: 0.38,
    score: 92,
    steps: [
      "read  src/auth/session.ts",
      "grep  refreshToken",
      "read  src/auth/refresh.ts",
      "edit  src/auth/session.ts",
      "bash  pnpm test auth",
      "edit  src/auth/refresh.ts",
      "bash  pnpm typecheck",
    ],
  },
  {
    id: "dsh",
    name: "DeepSeek Harness",
    model: "DeepSeek V4 Pro",
    logo: "ai-product-logos/01-DeepSeek.png",
    finish: 690,
    seconds: 185,
    cost: 0.11,
    score: 87,
    steps: [
      "ls    src/auth",
      "read  src/auth/session.ts",
      "edit  src/auth/session.ts",
      "bash  pnpm test auth",
      "bash  pnpm typecheck",
    ],
  },
];

const METRICS = [
  {key: "time", label: "Time to green", unit: "", winner: "dsh"},
  {key: "cost", label: "Cost per run", unit: "", winner: "dsh"},
  {key: "score", label: "Review score", unit: "/100", winner: "claude-code"},
] as const;

const formatClock = (totalSeconds: number) => {
  const whole = Math.floor(totalSeconds);
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

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

/** Beat 1 — the hook. The only full-screen type card in the film. */
const QuestionCard: React.FC<{frame: number}> = ({frame}) => {
  const exit = p(frame, B.reveal, B.reveal + 40, Easing.bezier(0.7, 0, 0.84, 0));
  if (exit >= 1) return null;

  const line1 = p(frame, 6, 34);
  const line2 = p(frame, 20, 50);
  const marks = p(frame, 44, 78);
  const query = p(frame, 74, 104);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        background: C.canvas,
        opacity: 1 - exit,
      }}
    >
      <div style={{width: 1360, textAlign: "center"}}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 20,
            letterSpacing: 4,
            color: C.muted,
            opacity: line1,
            transform: `translateY(${(1 - line1) * 14}px)`,
          }}
        >
          THE BIGGEST QUESTION IN 2026
        </div>

        <div
          style={{
            marginTop: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 54,
            opacity: marks,
          }}
        >
          <Img
            src={staticFile(LANES[1].logo)}
            style={{
              width: 116,
              height: 116,
              objectFit: "contain",
              transform: `translateX(${(1 - marks) * -70}px)`,
            }}
          />
          <div
            style={{
              fontFamily: FONT,
              fontSize: 104,
              fontWeight: 700,
              color: C.teal,
              transform: `scale(${0.7 + marks * 0.3})`,
            }}
          >
            ?
          </div>
          <Img
            src={staticFile(LANES[0].logo)}
            style={{
              width: 116,
              height: 116,
              objectFit: "contain",
              transform: `translateX(${(1 - marks) * 70}px)`,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 48,
            fontFamily: FONT,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -1.6,
            color: C.ink,
          }}
        >
          <div style={{opacity: line1, transform: `translateY(${(1 - line1) * 24}px)`}}>
            Is DeepSeek&rsquo;s new agent
          </div>
          <div style={{opacity: line2, transform: `translateY(${(1 - line2) * 24}px)`}}>
            better than Claude Code?
          </div>
        </div>

        <div
          style={{
            marginTop: 52,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "13px 24px",
            borderRadius: 999,
            background: C.tealSoft,
            border: `1px solid ${C.teal}`,
            opacity: query,
            transform: `translateY(${(1 - query) * 16}px)`,
          }}
        >
          <span style={{fontFamily: MONO, fontSize: 19, letterSpacing: 2, color: C.brandDeep}}>
            AGENT PLAYGROUND
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PanelChrome: React.FC<{children: React.ReactNode; frame: number}> = ({
  children,
  frame,
}) => {
  const rise = p(frame, B.reveal + 10, B.reveal + 55);

  return (
    <div
      style={{
        position: "absolute",
        left: 130,
        top: 132,
        width: W - 260,
        height: H - 264,
        borderRadius: 20,
        background: C.panel,
        border: `1px solid ${C.line}`,
        boxShadow: "0 28px 64px rgba(22,30,24,.10)",
        overflow: "hidden",
        opacity: rise,
        transform: `translateY(${(1 - rise) * 42}px) scale(${0.965 + rise * 0.035})`,
      }}
    >
      <div
        style={{
          height: 62,
          borderBottom: `1px solid ${C.line}`,
          background: C.surface,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 24px",
        }}
      >
        <div style={{display: "flex", gap: 8}}>
          {[C.faint, C.faint, C.faint].map((dot, index) => (
            <div
              key={index}
              style={{width: 11, height: 11, borderRadius: "50%", background: dot}}
            />
          ))}
        </div>
        <div
          style={{
            marginLeft: 12,
            fontFamily: MONO,
            fontSize: 16,
            color: C.muted,
            letterSpacing: 0.4,
          }}
        >
          agentsky.dev/playground
        </div>
      </div>
      {children}
    </div>
  );
};

/** Beats 2–4 — pick two agents, attach a real repo, pick a real issue. */
const SetupStage: React.FC<{frame: number}> = ({frame}) => {
  const fade = 1 - p(frame, B.race - 24, B.race);
  if (fade <= 0) return null;

  return (
    <div style={{...STAGE, padding: "38px 44px", opacity: fade}}>
      <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: 3, color: C.faint}}>
        STEP 01 &mdash; PICK THE AGENTS TO COMPARE
      </div>

      <div style={{display: "flex", gap: 20, marginTop: 20}}>
        {LANES.map((lane, index) => {
          const at = B.pickAgents + index * 34;
          const chosen = p(frame, at, at + 22);
          return (
            <div
              key={lane.id}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 24px",
                borderRadius: 14,
                background: C.panel,
                border: `${1 + chosen}px solid ${chosen > 0.5 ? C.teal : C.line}`,
                boxShadow:
                  chosen > 0.5
                    ? `0 0 0 ${6 * chosen}px rgba(22,131,243,.09)`
                    : "0 8px 20px rgba(20,25,20,.05)",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  border: `2px solid ${chosen > 0.4 ? C.teal : C.line}`,
                  background: chosen > 0.4 ? C.teal : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.panel,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {chosen > 0.6 ? "✓" : ""}
              </div>
              <Img
                src={staticFile(lane.logo)}
                style={{width: 46, height: 46, objectFit: "contain"}}
              />
              <div>
                <div style={{fontFamily: FONT, fontSize: 26, fontWeight: 700, color: C.ink}}>
                  {lane.name}
                </div>
                <div style={{fontFamily: MONO, fontSize: 16, color: C.muted, marginTop: 3}}>
                  {lane.model}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 3,
          color: C.faint,
          marginTop: 40,
          opacity: p(frame, B.connectRepo - 12, B.connectRepo + 8),
        }}
      >
        STEP 02 &mdash; CONNECT A REAL TASK YOU ACTUALLY WORK ON
      </div>

      <RepoCard frame={frame} />
      <IssueCard frame={frame} />
    </div>
  );
};

const RepoCard: React.FC<{frame: number}> = ({frame}) => {
  const snap = p(frame, B.connectRepo, B.connectRepo + 26);

  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "22px 26px",
        borderRadius: 14,
        background: C.surface,
        border: `1px solid ${snap > 0.6 ? C.teal : C.line}`,
        opacity: snap,
        transform: `translateX(${(1 - snap) * 90}px)`,
      }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill={C.ink} aria-hidden="true">
        <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
      </svg>
      <div style={{flex: 1}}>
        <div style={{fontFamily: FONT, fontSize: 25, fontWeight: 700, color: C.ink}}>
          agentsky/asteroids
        </div>
        <div style={{fontFamily: MONO, fontSize: 16, color: C.muted, marginTop: 3}}>
          connected via GitHub &middot; write access
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 14,
          letterSpacing: 2,
          color: C.brandDeep,
          background: C.tealSoft,
          border: `1px solid ${C.teal}`,
          borderRadius: 999,
          padding: "7px 16px",
          opacity: p(frame, B.connectRepo + 20, B.connectRepo + 40),
        }}
      >
        CONNECTED
      </div>
    </div>
  );
};

const IssueCard: React.FC<{frame: number}> = ({frame}) => {
  const at = B.connectRepo + 55;
  const show = p(frame, at, at + 26);

  return (
    <div
      style={{
        marginTop: 16,
        padding: "22px 26px",
        borderRadius: 14,
        background: C.panel,
        border: `2px solid ${show > 0.6 ? C.teal : C.line}`,
        boxShadow: show > 0.6 ? "0 0 0 6px rgba(22,131,243,.08)" : "none",
        opacity: show,
        transform: `translateY(${(1 - show) * 22}px)`,
      }}
    >
      <div style={{display: "flex", alignItems: "baseline", gap: 14}}>
        <span style={{fontFamily: MONO, fontSize: 20, color: C.teal, fontWeight: 600}}>
          #412
        </span>
        <span style={{fontFamily: FONT, fontSize: 27, fontWeight: 700, color: C.ink}}>
          Refresh token silently drops on reconnect
        </span>
      </div>
      <div style={{fontFamily: MONO, fontSize: 16, color: C.muted, marginTop: 8}}>
        opened 3 days ago &middot; src/auth &middot; 2 failing tests
      </div>
    </div>
  );
};

/** Beat 5 — both agents run the same task at the same time. One long shot. */
const RaceStage: React.FC<{frame: number}> = ({frame}) => {
  const enter = p(frame, B.race, B.race + 26);
  const leave = 1 - p(frame, B.score - 18, B.score + 6);
  const alpha = enter * leave;
  if (alpha <= 0) return null;

  return (
    <div style={{...STAGE, padding: "30px 44px", opacity: alpha}}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 3,
          color: C.faint,
          marginBottom: 18,
        }}
      >
        STEP 03 &mdash; SAME TASK, BOTH AGENTS, AT THE SAME TIME
      </div>
      <div style={{display: "flex", gap: 22}}>
        {LANES.map((lane, index) => (
          <LaneColumn key={lane.id} lane={lane} frame={frame} index={index} />
        ))}
      </div>
    </div>
  );
};

const LaneColumn: React.FC<{lane: Lane; frame: number; index: number}> = ({
  lane,
  frame,
  index,
}) => {
  const runFrames = lane.finish - B.race;
  const progress = clamp01((frame - B.race) / runFrames);
  const done = frame >= lane.finish;
  const stepsDone = Math.min(lane.steps.length, Math.floor(progress * lane.steps.length) + 1);
  const pulse = wobble(index + 1, frame);

  return (
    <div
      style={{
        flex: 1,
        borderRadius: 16,
        border: `1px solid ${done ? C.teal : C.line}`,
        background: C.panel,
        overflow: "hidden",
        boxShadow: done ? "0 0 0 6px rgba(22,131,243,.08)" : "0 10px 26px rgba(20,25,20,.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          borderBottom: `1px solid ${C.line}`,
          background: C.surface,
        }}
      >
        <Img src={staticFile(lane.logo)} style={{width: 34, height: 34, objectFit: "contain"}} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.ink}}>
            {lane.name}
          </div>
          <div style={{fontFamily: MONO, fontSize: 14, color: C.muted}}>{lane.model}</div>
        </div>
        <div style={{textAlign: "right"}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 26,
              fontWeight: 600,
              color: done ? C.teal : C.ink,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatClock(lane.seconds * progress)}
          </div>
          <div style={{fontFamily: MONO, fontSize: 15, color: C.muted, fontVariantNumeric: "tabular-nums"}}>
            ${(lane.cost * progress).toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{padding: "16px 20px", height: 344}}>
        {lane.steps.slice(0, stepsDone).map((step, stepIndex) => {
          const isCurrent = stepIndex === stepsDone - 1 && !done;
          return (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: MONO,
                fontSize: 18,
                lineHeight: 2.1,
                color: isCurrent ? C.ink : C.muted,
                whiteSpace: "pre",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  background: isCurrent ? C.teal : C.faint,
                  opacity: isCurrent ? 0.45 + pulse * 0.55 : 1,
                }}
              />
              {step}
            </div>
          );
        })}
        {done ? (
          <div
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 18px",
              borderRadius: 999,
              background: C.tealSoft,
              border: `1px solid ${C.teal}`,
              fontFamily: MONO,
              fontSize: 15,
              letterSpacing: 2,
              color: C.brandDeep,
            }}
          >
            TESTS GREEN &middot; PR OPENED
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** Beat 6 — the scoreboard the whole film is built to land on. */
const Scoreboard: React.FC<{frame: number}> = ({frame}) => {
  const enter = p(frame, B.score, B.score + 30);
  if (enter <= 0) return null;

  const values: Record<string, Record<string, {display: string; ratio: number}>> = {
    time: {
      "claude-code": {display: "4:12", ratio: 1},
      dsh: {display: "3:05", ratio: 185 / 252},
    },
    cost: {
      "claude-code": {display: "$0.38", ratio: 1},
      dsh: {display: "$0.11", ratio: 0.11 / 0.38},
    },
    score: {
      "claude-code": {display: "92", ratio: 0.92},
      dsh: {display: "87", ratio: 0.87},
    },
  };

  return (
    <div style={{...STAGE, padding: "34px 44px", opacity: enter}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: -0.8,
          transform: `translateY(${(1 - enter) * 18}px)`,
        }}
      >
        Benchmarked on the same issue
      </div>
      <div style={{fontFamily: MONO, fontSize: 16, color: C.muted, marginTop: 8}}>
        agentsky/asteroids #412 &middot; 1 run each &middot; identical repo state
      </div>

      <div style={{marginTop: 30, display: "flex", flexDirection: "column", gap: 24}}>
        {METRICS.map((metric, metricIndex) => {
          const at = B.score + 26 + metricIndex * 22;
          const grow = p(frame, at, at + 34);
          return (
            <div key={metric.key}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 15,
                  letterSpacing: 3,
                  color: C.faint,
                  marginBottom: 12,
                }}
              >
                {metric.label.toUpperCase()}
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: 11}}>
                {LANES.map((lane) => {
                  const cell = values[metric.key][lane.id];
                  const wins = metric.winner === lane.id;
                  return (
                    <div key={lane.id} style={{display: "flex", alignItems: "center", gap: 16}}>
                      <div
                        style={{
                          width: 232,
                          fontFamily: FONT,
                          fontSize: 21,
                          fontWeight: 700,
                          color: wins ? C.ink : C.muted,
                          textAlign: "right",
                        }}
                      >
                        {lane.name}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: 42,
                          borderRadius: 8,
                          background: C.surface,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${cell.ratio * grow * 100}%`,
                            height: "100%",
                            borderRadius: 8,
                            background: wins ? C.teal : "#c9cec6",
                            boxShadow: wins ? "0 0 0 3px rgba(22,131,243,.16)" : "none",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: 118,
                          fontFamily: MONO,
                          fontSize: 24,
                          fontWeight: 600,
                          color: wins ? C.teal : C.muted,
                          fontVariantNumeric: "tabular-nums",
                          opacity: grow,
                        }}
                      >
                        {cell.display}
                        <span style={{fontSize: 15, color: C.faint}}>{metric.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 30,
          fontFamily: FONT,
          fontSize: 25,
          fontWeight: 700,
          color: C.ink,
          opacity: p(frame, B.score + 100, B.score + 128),
        }}
      >
        Different winner per column &mdash;{" "}
        <span style={{color: C.teal}}>pick the one your use case needs.</span>
      </div>
    </div>
  );
};

export const AgentSkyPlaygroundScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: C.canvas, fontFamily: FONT}}>
      <Fonts />
      <PanelChrome frame={frame}>
        <SetupStage frame={frame} />
        <RaceStage frame={frame} />
        <Scoreboard frame={frame} />
      </PanelChrome>
      <QuestionCard frame={frame} />
    </AbsoluteFill>
  );
};
