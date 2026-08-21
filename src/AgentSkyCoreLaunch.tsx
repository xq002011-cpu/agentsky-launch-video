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

const W = 1920;
const H = 1080;
const FPS = 30;

const C = {
  canvas: "#f8f8f5",
  panel: "#ffffff",
  ink: "#111210",
  muted: "#686b66",
  faint: "#a6aaa4",
  line: "#dedfd9",
  surface: "#f0f1ed",
  teal: "#0abab5",
  tealSoft: "#d8f4f2",
  purple: "#8d4eb5",
  purpleDark: "#4e275f",
  purpleSoft: "#eadcf1",
  green: "#42c96b",
};

const FONT = '"Space Grotesk", "Inter", "Segoe UI", Arial, sans-serif';
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

const clamp = (value: number) => Math.max(0, Math.min(1, value));
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

const enterY = (frame: number, start: number, distance = 34, duration = 20) => {
  const progress = p(frame, start, start + duration);
  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * distance}px)`,
  };
};

const BRAND_DOTS = Array.from({length: 72}, (_, index) => {
  const angle = -2.35 + index * 0.055;
  const radiusX = 505 + (index % 5) * 10;
  const radiusY = 318 + (index % 7) * 5;
  return {
    x: 1470 + Math.cos(angle) * radiusX,
    y: 470 + Math.sin(angle) * radiusY,
    size: 3 + (index % 3),
    color: [C.teal, "#98a8ef", "#e1a1c6", "#edd47b"][index % 4],
  };
});

const BrandCanvas = () => (
  <AbsoluteFill
    style={{
      background: C.canvas,
      color: C.ink,
      fontFamily: FONT,
      overflow: "hidden",
    }}
  >
    <AbsoluteFill
      style={{
        opacity: 0.22,
        backgroundImage:
          "linear-gradient(rgba(17,18,16,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17,18,16,.04) 1px, transparent 1px)",
        backgroundSize: "54px 54px",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 980,
        height: 980,
        right: -360,
        top: -340,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(10,186,181,.07), transparent 68%)",
      }}
    />
  </AbsoluteFill>
);

const BrandHeader = () => (
  <div
    style={{
      position: "absolute",
      left: 80,
      right: 80,
      top: 44,
      height: 54,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 60,
    }}
  >
    <div style={{display: "flex", alignItems: "center", gap: 8}}>
      <Img
        src={staticFile("agentsky-mark.png")}
        style={{width: 38, height: 38, objectFit: "contain"}}
      />
      <span style={{fontSize: 25, fontWeight: 750, letterSpacing: -0.8}}>
        AgentSky
      </span>
    </div>
    <div
      style={{
        fontSize: 16,
        letterSpacing: 1.7,
        textTransform: "uppercase",
        color: C.muted,
        fontWeight: 650,
      }}
    >
      Long-horizon agents, everywhere
    </div>
  </div>
);

type Caption = {from: number; to: number; text: string};

const captions: Caption[] = [
  {
    from: 0,
    to: 180,
    text: "AgentSky helps developers launch on-demand, cloud-hosted agents with any harness and any model.",
  },
  {from: 181, to: 220, text: "Here's how it works."},
  {from: 221, to: 292, text: "Choose your harness,"},
  {from: 293, to: 360, text: "choose your model,"},
  {
    from: 361,
    to: 480,
    text: "pick pre-built channels like iMessage or Slack,",
  },
  {
    from: 481,
    to: 550,
    text: "connect to over a thousand integrations,",
  },
  {
    from: 551,
    to: 622,
    text: "add tools like image generation or browser use,",
  },
  {from: 623, to: 676, text: "then click launch."},
  {
    from: 677,
    to: 734,
    text: "That's it. Your cloud agent is live and ready to chat.",
  },
  {
    from: 735,
    to: 946,
    text: "You can also create, manage, and access your agents through our developer APIs or CLI.",
  },
  {
    from: 947,
    to: 1204,
    text: "Every agent comes with infinite context and built-in memory, so it can handle long-horizon tasks without managing infrastructure.",
  },
  {
    from: 1205,
    to: 1300,
    text: "You only pay for what you use, and we scale with you.",
  },
  {from: 1301, to: 1385, text: "When an agent is idle, it costs nothing."},
  {
    from: 1386,
    to: 1605,
    text: "It automatically suspends and resumes in under a second whenever a new message arrives.",
  },
  {
    from: 1606,
    to: 1751,
    text: "Visit agentsky.dev and launch your first cloud agent in seconds.",
  },
];

const KaraokeCaption = () => {
  const frame = useCurrentFrame();
  const caption = captions.find((item) => frame >= item.from && frame <= item.to);
  if (!caption) return null;
  const words = caption.text.split(" ");
  const progress = clamp(
    (frame - caption.from) / Math.max(1, caption.to - caption.from),
  );
  const active = Math.min(words.length - 1, Math.floor(progress * words.length));

  return (
    <div
      style={{
        position: "absolute",
        left: 210,
        right: 210,
        bottom: 30,
        minHeight: 62,
        padding: "15px 28px",
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        background: "rgba(255,255,255,.94)",
        boxShadow: "0 12px 30px rgba(30,38,32,.09)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0 8px",
        fontSize: 26,
        lineHeight: 1.25,
        fontWeight: 620,
        zIndex: 100,
      }}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          style={{
            color:
              index < active ? C.ink : index === active ? C.ink : "#989b96",
            background: index === active ? C.tealSoft : "transparent",
            borderRadius: 7,
            padding: index === active ? "1px 5px" : "1px 0",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

const Pill = ({
  children,
  active = false,
  mono = false,
}: {
  children: React.ReactNode;
  active?: boolean;
  mono?: boolean;
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "11px 16px",
      borderRadius: 12,
      border: `1px solid ${active ? C.teal : C.line}`,
      background: active ? C.tealSoft : C.panel,
      boxShadow: active ? "0 7px 20px rgba(10,186,181,.11)" : "none",
      color: C.ink,
      fontSize: 21,
      fontWeight: 650,
      fontFamily: mono ? MONO : FONT,
      whiteSpace: "nowrap",
    }}
  >
    {active && (
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: C.teal,
        }}
      />
    )}
    {children}
  </div>
);

const SectionLabel = ({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  align?: "left" | "center";
}) => (
  <div style={{textAlign: align, pointerEvents: "none"}}>
    <div
      style={{
        fontSize: 18,
        textTransform: "uppercase",
        letterSpacing: 2.3,
        fontWeight: 750,
        color: C.teal,
        marginBottom: 16,
      }}
    >
      {eyebrow}
    </div>
    <div
      style={{
        fontSize: 64,
        lineHeight: 0.98,
        letterSpacing: -3,
        fontWeight: 760,
      }}
    >
      {title}
    </div>
  </div>
);

const coreCells = Array.from({length: 11 * 11}, (_, index) => {
  const x = index % 11;
  const y = Math.floor(index / 11);
  const dx = x - 5;
  const dy = y - 5;
  const inside = dx * dx + dy * dy <= 26;
  return {x, y, inside, tone: (x * 7 + y * 11) % 5};
}).filter((cell) => cell.inside);

type CoreState =
  | "draft"
  | "configured"
  | "live"
  | "working"
  | "parked"
  | "waking";

const CoreVisual = ({
  size,
  state,
  localFrame,
  label = true,
}: {
  size: number;
  state: CoreState;
  localFrame: number;
  label?: boolean;
}) => {
  const isParked = state === "parked";
  const isLive = state === "live" || state === "working" || state === "waking";
  const pixelSize = size / 13.5;
  const pulse =
    state === "waking"
      ? 1 + 0.07 * Math.sin(localFrame * 0.34)
      : isLive
        ? 1 + 0.012 * Math.sin(localFrame * 0.14)
        : 1;
  const saturation = isParked ? 0.08 : state === "draft" ? 0.5 : 1;
  const brightness = isParked ? 0.74 : 1;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `scale(${pulse})`,
        filter: `saturate(${saturation}) brightness(${brightness})`,
      }}
    >
      {(isLive || state === "configured") && (
        <div
          style={{
            position: "absolute",
            inset: -10,
            borderRadius: "50%",
            border: `3px solid ${state === "configured" ? C.purple : C.teal}`,
            boxShadow: isLive
              ? "0 0 0 8px rgba(10,186,181,.08), 0 18px 42px rgba(10,186,181,.15)"
              : "0 0 0 7px rgba(141,78,181,.07)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#161718",
          border: "5px solid #111210",
          boxShadow: "0 18px 40px rgba(19,20,18,.20)",
          overflow: "hidden",
        }}
      >
        {coreCells.map((cell, index) => {
          const motion =
            state === "working" || state === "waking"
              ? Math.sin(localFrame * 0.16 + index * 0.83) * 1.6
              : 0;
          const tones = ["#b874cf", "#9b59ba", "#7e3f9b", "#c48bd6", "#67347b"];
          return (
            <span
              key={`${cell.x}-${cell.y}`}
              style={{
                position: "absolute",
                left: size * 0.092 + cell.x * pixelSize,
                top: size * 0.092 + cell.y * pixelSize + motion,
                width: pixelSize + 0.4,
                height: pixelSize + 0.4,
                background: tones[cell.tone],
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: "50%",
            left: size * 0.31,
            top: size * 0.31,
            background: "rgba(255,255,255,.12)",
          }}
        />
      </div>
      {label && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: size + 15,
            transform: "translateX(-50%)",
            padding: "7px 12px",
            borderRadius: 999,
            background: C.panel,
            border: `1px solid ${C.line}`,
            boxShadow: "0 8px 20px rgba(20,25,20,.09)",
            fontFamily: MONO,
            fontSize: Math.max(14, size * 0.105),
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          Eros-55C0
        </div>
      )}
    </div>
  );
};

const corePlacement = (frame: number) => {
  let x = 1440;
  let y = 660;
  let size = 88;
  let state: CoreState = frame < 78 ? "draft" : "configured";

  if (frame >= 181 && frame <= 220) {
    const move = p(frame, 183, 211);
    x = interpolate(move, [0, 1], [1440, 960]);
    y = interpolate(move, [0, 1], [660, 492]);
    size = interpolate(move, [0, 1], [88, 174]);
  } else if (frame >= 221 && frame <= 622) {
    x = 960;
    y = 500;
    size = frame >= 361 ? 150 : 174;
    state = "configured";
  } else if (frame >= 623 && frame <= 734) {
    x = 960;
    y = 458;
    size = frame < 647 ? 170 : 188;
    state = frame < 647 ? "configured" : "live";
  } else if (frame >= 735 && frame <= 946) {
    const move = p(frame, 742, 775);
    x = interpolate(move, [0, 1], [960, 1440]);
    y = interpolate(move, [0, 1], [458, 512]);
    size = interpolate(move, [0, 1], [188, 122]);
    state = "working";
  } else if (frame >= 947 && frame <= 1204) {
    const settle = p(frame, 947, 976);
    x = interpolate(settle, [0, 1], [1440, 960]);
    y = interpolate(settle, [0, 1], [512, 628]);
    size = interpolate(settle, [0, 1], [122, 138]);
    state = "working";
  } else if (frame >= 1205 && frame <= 1300) {
    const move = p(frame, 1205, 1226);
    x = interpolate(move, [0, 1], [960, 700]);
    y = interpolate(move, [0, 1], [628, 515]);
    size = 138;
    state = "working";
  } else if (frame >= 1301 && frame <= 1385) {
    const move = p(frame, 1301, 1323);
    x = interpolate(move, [0, 1], [700, 960]);
    y = interpolate(move, [0, 1], [515, 515]);
    size = 150;
    state = "parked";
  } else if (frame >= 1386 && frame <= 1605) {
    x = 960;
    y = 515;
    size = 150;
    state = frame < 1494 ? "parked" : "waking";
  }

  return {x, y, size, state};
};

const PersistentCore = () => {
  const frame = useCurrentFrame();
  if (frame >= 1606) return null;
  const placement = corePlacement(frame);
  const launchPulse = p(frame, 646, 654, Easing.out(Easing.cubic));
  const launchFade = 1 - p(frame, 654, 669);
  const wakePulse = p(frame, 1492, 1502, Easing.out(Easing.cubic));
  const wakeFade = 1 - p(frame, 1502, 1522);
  const ring = Math.max(launchPulse * launchFade, wakePulse * wakeFade);

  return (
    <div style={{position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none"}}>
      {ring > 0 && (
        <div
          style={{
            position: "absolute",
            left: placement.x,
            top: placement.y,
            width: placement.size,
            height: placement.size,
            borderRadius: "50%",
            border: `4px solid ${C.teal}`,
            transform: `translate(-50%, -50%) scale(${1 + ring * 2.9})`,
            opacity: 1 - ring,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: placement.x,
          top: placement.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <CoreVisual
          size={placement.size}
          state={placement.state}
          localFrame={frame}
          label={frame >= 623}
        />
      </div>
    </div>
  );
};

const NewAgentCard = ({frame}: {frame: number}) => {
  const lift = p(frame, 94, 112, Easing.bezier(0.2, 1.18, 0.3, 1));
  const reseat = p(frame, 150, 172, Easing.inOut(Easing.cubic));
  const elevation = lift * (1 - reseat);
  const spotlightX = interpolate(frame, [22, 52, 78, 102], [18, 72, 38, 68], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const spotlightY = interpolate(frame, [22, 52, 78, 102], [22, 34, 68, 48], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 1180,
        top: 210,
        width: 540,
        height: 610,
        transform: `perspective(1400px) rotateY(-6deg) rotateX(3deg) translateY(${-18 * elevation}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 26,
          background: C.panel,
          border: `1px solid ${C.line}`,
          boxShadow: `0 ${28 + elevation * 26}px ${70 + elevation * 35}px rgba(25,34,29,${0.13 + elevation * 0.08})`,
          padding: "34px 36px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: 16,
            letterSpacing: 2.2,
            fontWeight: 750,
            color: C.muted,
          }}
        >
          NEW AGENT
        </div>
        <div style={{marginTop: 28, fontSize: 18, color: C.muted}}>Harness</div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10}}>
          <Pill active>Hermes</Pill>
          <Pill>Codex</Pill>
        </div>
        <div style={{marginTop: 24, fontSize: 18, color: C.muted}}>Model</div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10}}>
          <Pill active>GPT-5.6 Sol</Pill>
          <Pill>GLM-5.2</Pill>
        </div>
        <div style={{marginTop: 25, fontSize: 18, color: C.muted}}>Capabilities</div>
        <div style={{display: "flex", gap: 10, marginTop: 11, flexWrap: "wrap"}}>
          <Pill active>Scrape web</Pill>
          <Pill active>Generate image</Pill>
          <Pill>+6 more</Pill>
        </div>
        <div
          style={{
            position: "absolute",
            left: 34,
            right: 34,
            bottom: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{fontSize: 17, color: C.faint}}>Persistent runs for months</span>
          <div
            style={{
              background: C.ink,
              color: "#fff",
              borderRadius: 9,
              padding: "15px 20px",
              fontSize: 16,
              fontWeight: 750,
              letterSpacing: 0.8,
            }}
          >
            LAUNCH AGENT ↗
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: -18,
          borderRadius: 38,
          pointerEvents: "none",
          background: `radial-gradient(320px 280px at ${spotlightX}% ${spotlightY}%, rgba(10,186,181,.13), transparent 68%)`,
          boxShadow: elevation > 0.1 ? `inset 0 0 0 2px rgba(10,186,181,${0.32 * elevation})` : "none",
        }}
      />
    </div>
  );
};

const HeroScene = ({frame}: {frame: number}) => {
  const title1 = enterY(frame, 8, 50, 22);
  const title2 = enterY(frame, 22, 50, 22);
  const sub = enterY(frame, 44, 26, 20);
  return (
    <>
      {BRAND_DOTS.map((dot, index) => (
        <span
          key={index}
          style={{
            position: "absolute",
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: dot.color,
            opacity: 0.38,
          }}
        />
      ))}
      <div style={{position: "absolute", left: 120, top: 225, width: 830}}>
        <div
          style={{
            display: "inline-flex",
            padding: "9px 14px",
            borderRadius: 999,
            border: `1px solid ${C.line}`,
            background: C.panel,
            fontSize: 17,
            color: C.muted,
            gap: 10,
            alignItems: "center",
            ...enterY(frame, 0, 18, 16),
          }}
        >
          <span style={{width: 9, height: 9, borderRadius: "50%", background: C.teal}} />
          Long-horizon agents, everywhere
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 92,
            lineHeight: 0.94,
            letterSpacing: -5.2,
            fontWeight: 770,
          }}
        >
          <div style={title1}>Any harness, any LLM —</div>
          <div style={title2}>cloud-hosted agents on demand.</div>
        </div>
        <div
          style={{
            marginTop: 34,
            fontSize: 30,
            lineHeight: 1.35,
            color: C.muted,
            maxWidth: 690,
            ...sub,
          }}
        >
          No Mac mini, no setup. Launch a long-running cloud agent in one click.
        </div>
      </div>
      <NewAgentCard frame={frame} />
    </>
  );
};

const HowScene = ({frame}: {frame: number}) => {
  const line = p(frame, 184, 210);
  return (
    <>
      <div style={{position: "absolute", left: 150, top: 300, width: 560}}>
        <SectionLabel eyebrow="One agent" title={<>Here’s how<br />it works.</>} />
      </div>
      <svg width={W} height={H} style={{position: "absolute", inset: 0}}>
        <path
          d="M1440 515 C1290 420 1130 430 960 492"
          fill="none"
          stroke={C.teal}
          strokeWidth={4}
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - line}
          strokeLinecap="round"
        />
      </svg>
      {["Configure", "Connect", "Work", "Park", "Wake"].map((label, index) => {
        const show = p(frame, 188 + index * 5, 200 + index * 5);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: 1170 + index * 116,
              top: 718 - Math.abs(index - 2) * 18,
              opacity: show,
              transform: `translateY(${(1 - show) * 16}px)`,
              color: C.muted,
              fontSize: 17,
              fontWeight: 650,
            }}
          >
            {label}
          </div>
        );
      })}
    </>
  );
};

const ChoiceScene = ({
  frame,
  kind,
}: {
  frame: number;
  kind: "harness" | "model";
}) => {
  const harness = kind === "harness";
  const start = harness ? 221 : 293;
  const choices = harness
    ? ["Claude Code", "Codex", "Hermes", "OpenClaw"]
    : ["GPT-5.6 Sol", "GLM-5.2", "Gemini", "Kimi K3"];
  const selected = harness ? 1 : 0;
  return (
    <>
      <div style={{position: "absolute", left: 120, top: 245, width: 580}}>
        <SectionLabel
          eyebrow={harness ? "Step 01 — Harness" : "Step 02 — Model"}
          title={harness ? <>Choose your<br />harness.</> : <>Choose your<br />model.</>}
        />
        <div style={{marginTop: 32, color: C.muted, fontSize: 24, lineHeight: 1.45}}>
          No lock-in. Swap either later without losing the thread.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 135,
          top: 255,
          width: 520,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {choices.map((choice, index) => {
          const show = p(frame, start + 8 + index * 6, start + 26 + index * 6);
          const choose = p(frame, start + 38, start + 54);
          const active = index === selected && choose > 0.45;
          return (
            <div
              key={choice}
              style={{
                height: 128,
                borderRadius: 18,
                border: `2px solid ${active ? C.teal : C.line}`,
                background: active ? C.tealSoft : C.panel,
                boxShadow: active
                  ? "0 18px 34px rgba(10,186,181,.14)"
                  : "0 12px 25px rgba(23,30,25,.06)",
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                boxSizing: "border-box",
                opacity: show,
                transform: `translateY(${(1 - show) * 24}px)`,
                fontSize: 24,
                fontWeight: 680,
                gap: 14,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: active ? C.teal : C.surface,
                  color: active ? "#fff" : C.ink,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: MONO,
                  fontSize: 14,
                }}
              >
                {choice.slice(0, 1)}
              </span>
              {choice}
              {active && <span style={{marginLeft: "auto", color: C.teal}}>✓</span>}
            </div>
          );
        })}
      </div>
    </>
  );
};

const channelNodes = [
  {label: "iMessage", x: 700, y: 335, color: "#43c85a"},
  {label: "WhatsApp", x: 430, y: 650, color: "#35c66b"},
  {label: "Telegram", x: 710, y: 790, color: "#39a8e0"},
  {label: "Slack", x: 1440, y: 335, color: "#8c61dd"},
  {label: "Web", x: 1490, y: 650, color: "#303331"},
  {label: "CLI", x: 1210, y: 790, color: C.teal},
];

const ChannelScene = ({frame}: {frame: number}) => {
  const iconIn = p(frame, 378, 396, Easing.out(Easing.cubic));
  const pipeIn = p(frame, 403, 417, Easing.out(Easing.quad));
  return (
    <>
      <div style={{position: "absolute", left: 120, top: 170}}>
        <SectionLabel eyebrow="Omnichannel" title={<>One agent.<br />Every channel.</>} />
      </div>
      <svg width={W} height={H} style={{position: "absolute", inset: 0}}>
        {channelNodes.map((node, index) => {
          const path = `M ${node.x} ${node.y} Q ${(node.x + 960) / 2} ${500 + (index % 2 ? 45 : -45)} 960 500`;
          const flow = -((frame - 417) * 0.016 + index * 0.14);
          return (
            <g key={node.label}>
              <path
                d={path}
                fill="none"
                stroke={C.line}
                strokeWidth={4}
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - pipeIn}
              />
              {pipeIn >= 1 && (
                <path
                  d={path}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={6}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray=".05 .16"
                  strokeDashoffset={flow}
                  opacity={0.8}
                />
              )}
            </g>
          );
        })}
      </svg>
      {channelNodes.map((node) => (
        <div
          key={node.label}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            transform: `translate(-50%, -50%) scale(${0.85 + iconIn * 0.15})`,
            opacity: iconIn,
            width: 180,
            height: 74,
            borderRadius: 18,
            border: `1px solid ${C.line}`,
            background: C.panel,
            boxShadow: "0 12px 28px rgba(22,30,24,.09)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontSize: 20,
            fontWeight: 680,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: node.color,
            }}
          />
          {node.label}
        </div>
      ))}
    </>
  );
};

const IntegrationScene = ({frame}: {frame: number}) => {
  const items = ["Gmail", "Notion", "GitHub", "Google Drive", "Salesforce", "2,000+ more"];
  return (
    <>
      <div style={{position: "absolute", left: 120, top: 232, width: 630}}>
        <SectionLabel eyebrow="Built in" title={<>Connect to<br />2,000+ tools.</>} />
        <div style={{fontSize: 24, color: C.muted, marginTop: 28}}>
          Skip API wiring, tool hosting, and permissions glue.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 115,
          top: 220,
          width: 710,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {items.map((item, index) => {
          const inP = p(frame, 490 + index * 4, 506 + index * 4);
          return (
            <div
              key={item}
              style={{
                height: 132,
                borderRadius: 20,
                border: `1px solid ${index === items.length - 1 ? C.teal : C.line}`,
                background: index === items.length - 1 ? C.tealSoft : C.panel,
                boxShadow: "0 12px 26px rgba(20,28,22,.07)",
                display: "flex",
                alignItems: "center",
                padding: "0 26px",
                boxSizing: "border-box",
                opacity: inP,
                transform: `translateX(${(1 - inP) * 46}px)`,
                fontSize: 24,
                fontWeight: 680,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  marginRight: 17,
                  background:
                    index === items.length - 1
                      ? C.teal
                      : ["#ea4335", "#141514", "#25292e", "#4285f4", "#00a1e0"][index],
                }}
              />
              {item}
            </div>
          );
        })}
      </div>
    </>
  );
};

const ToolsScene = ({frame}: {frame: number}) => {
  const tools = [
    {label: "Scrape web", detail: "Exa"},
    {label: "Browser use", detail: "TinyFish"},
    {label: "Generate image", detail: "gpt-image"},
    {label: "Generate video", detail: "Seedance"},
  ];
  return (
    <>
      <div style={{position: "absolute", left: 120, top: 230, width: 630}}>
        <SectionLabel eyebrow="Capabilities" title={<>Ready for real work<br />on day one.</>} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 130,
          top: 245,
          width: 690,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
        }}
      >
        {tools.map((tool, index) => {
          const inP = p(frame, 556 + index * 9, 575 + index * 9);
          return (
            <div
              key={tool.label}
              style={{
                height: 194,
                borderRadius: 22,
                border: `1px solid ${C.line}`,
                background: C.panel,
                padding: 26,
                boxSizing: "border-box",
                boxShadow: "0 15px 30px rgba(20,28,22,.07)",
                opacity: inP,
                transform: `translateY(${(1 - inP) * 36}px)`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  background: index % 2 ? C.purple : C.teal,
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {tool.label.slice(0, 1)}
              </div>
              <div style={{fontSize: 25, fontWeight: 720, marginTop: 22}}>{tool.label}</div>
              <div style={{fontSize: 17, color: C.muted, marginTop: 8}}>{tool.detail}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const Cursor = ({
  x,
  y,
  pressed = false,
}: {
  x: number;
  y: number;
  pressed?: boolean;
}) => (
  <svg
    width={54}
    height={66}
    viewBox="0 0 54 66"
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${pressed ? 0.84 : 1})`,
      transformOrigin: "4px 4px",
      filter: "drop-shadow(0 5px 5px rgba(0,0,0,.18))",
    }}
  >
    <path
      d="M3 3 L3 47 L15 36 L24 59 L35 54 L25 32 L43 32 Z"
      fill="#fff"
      stroke={C.ink}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  </svg>
);

const LaunchScene = ({frame}: {frame: number}) => {
  const cursorP = p(frame, 628, 644);
  const pressed = frame >= 645 && frame <= 650;
  const buttonP = p(frame, 623, 638);
  const status = frame < 650 ? "READY TO LAUNCH" : "AGENT LIVE";
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 175,
          textAlign: "center",
        }}
      >
        <div style={{fontSize: 19, color: C.teal, fontWeight: 750, letterSpacing: 2}}>
          ONE-CLICK LAUNCH
        </div>
        <div style={{fontSize: 66, fontWeight: 760, letterSpacing: -3, marginTop: 14}}>
          Faster than ordering a burger.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 780,
          top: 690,
          width: 360,
          height: 72,
          borderRadius: 12,
          background: frame < 650 ? C.ink : C.teal,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 780,
          letterSpacing: 1.1,
          transform: `scale(${0.94 + buttonP * 0.06 - (pressed ? 0.035 : 0)})`,
          boxShadow: frame < 650 ? "0 15px 28px rgba(17,18,16,.18)" : "0 15px 32px rgba(10,186,181,.22)",
        }}
      >
        {status}
      </div>
      <Cursor
        x={interpolate(cursorP, [0, 1], [1320, 1110])}
        y={interpolate(cursorP, [0, 1], [850, 730])}
        pressed={pressed}
      />
    </>
  );
};

const ReadyScene = ({frame}: {frame: number}) => {
  const bubble1 = p(frame, 682, 696);
  const bubble2 = p(frame, 705, 721);
  return (
    <>
      <div style={{position: "absolute", left: 150, top: 270, width: 560}}>
        <SectionLabel eyebrow="Live" title={<>Your cloud agent<br />is ready to chat.</>} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 145,
          top: 255,
          width: 560,
          height: 430,
          borderRadius: 26,
          background: C.panel,
          border: `1px solid ${C.line}`,
          boxShadow: "0 24px 60px rgba(24,32,26,.10)",
          padding: 28,
          boxSizing: "border-box",
        }}
      >
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <div style={{fontFamily: MONO, fontSize: 18, fontWeight: 700}}>Eros-55C0</div>
          <div style={{color: C.green, fontSize: 16, fontWeight: 750}}>● LIVE</div>
        </div>
        <div
          style={{
            marginTop: 42,
            marginLeft: "auto",
            maxWidth: 360,
            padding: "16px 20px",
            borderRadius: "18px 18px 4px 18px",
            background: C.ink,
            color: "#fff",
            fontSize: 20,
            lineHeight: 1.35,
            opacity: bubble1,
            transform: `translateY(${(1 - bubble1) * 18}px)`,
          }}
        >
          Summarize today’s signups.
        </div>
        <div
          style={{
            marginTop: 18,
            maxWidth: 400,
            padding: "16px 20px",
            borderRadius: "18px 18px 18px 4px",
            background: C.tealSoft,
            fontSize: 20,
            lineHeight: 1.35,
            opacity: bubble2,
            transform: `translateY(${(1 - bubble2) * 18}px)`,
          }}
        >
          142 signups, up 18%. I’ve saved the report.
        </div>
      </div>
    </>
  );
};

const DeveloperScene = ({frame}: {frame: number}) => {
  const code =
    '$ sky launch\nLaunched eros-55c0 (codex · gpt-5.6-sol)\n\n$ sky agent message eros-55c0 "Summarize today\'s signups"\n142 signups, up 18%.';
  const typed = code.slice(
    0,
    Math.floor(
      interpolate(frame, [755, 905], [0, code.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  return (
    <>
      <div style={{position: "absolute", left: 120, top: 174, width: 700}}>
        <SectionLabel eyebrow="Developer-first" title={<>Your whole fleet,<br />one command away.</>} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 505,
          width: 1020,
          height: 365,
          borderRadius: 24,
          background: "#111310",
          color: "#edf5ee",
          boxShadow: "0 26px 60px rgba(20,25,20,.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 58,
            borderBottom: "1px solid rgba(255,255,255,.12)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 10,
          }}
        >
          {["#f36b62", "#e6bf4b", "#64c466"].map((color) => (
            <span key={color} style={{width: 12, height: 12, borderRadius: "50%", background: color}} />
          ))}
          <span style={{marginLeft: 18, fontFamily: MONO, color: "rgba(255,255,255,.58)"}}>
            agentsky — zsh
          </span>
        </div>
        <pre
          style={{
            margin: 0,
            padding: "28px 32px",
            fontFamily: MONO,
            fontSize: 21,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
          }}
        >
          {typed}
          <span style={{color: C.teal, opacity: Math.sin(frame * 0.32) > 0 ? 1 : 0}}>▋</span>
        </pre>
      </div>
      <div
        style={{
          position: "absolute",
          right: 122,
          top: 240,
          width: 460,
          padding: "22px 24px",
          borderRadius: 20,
          border: `1px solid ${C.line}`,
          background: C.panel,
          fontFamily: MONO,
          fontSize: 18,
          lineHeight: 1.55,
          boxShadow: "0 18px 36px rgba(20,28,22,.08)",
        }}
      >
        <span style={{color: C.teal}}>POST</span> /v1/agents/eros-55c0/messages
        <br />
        <span style={{color: C.muted}}>{`{ stream: true }`}</span>
      </div>
    </>
  );
};

const milestoneData = [
  {label: "Instructions", detail: "CLAUDE.md", x: 0},
  {label: "Files", detail: "Workspace", x: 820},
  {label: "Decisions", detail: "Full timeline", x: 1640},
  {label: "Snapshots", detail: "Managed recovery", x: 2460},
];

const DurableScene = ({frame}: {frame: number}) => {
  const t = p(frame, 962, 1134, Easing.inOut(Easing.quad));
  const travel = interpolate(t, [0, 0.15, 0.88, 1], [0, 0.055, 0.9, 1], {
    easing: Easing.inOut(Easing.quad),
  });
  const worldX = -travel * 2460;
  const restore = p(frame, 1110, 1148);
  const headlineRecovery = frame >= 1098;
  return (
    <>
      <div style={{position: "absolute", left: 120, top: 160, width: 940}}>
        <SectionLabel
          eyebrow={headlineRecovery ? "Managed recovery" : "Durable runtime"}
          title={
            headlineRecovery ? (
              <>Snapshots, backups,<br />and restore.</>
            ) : (
              <>Infinitely long<br />continuous history.</>
            )
          }
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 500,
          width: W,
          height: 380,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 0,
            width: 3600,
            height: 360,
            transform: `translateX(${worldX}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -220,
              top: 180,
              width: 3560,
              height: 4,
              background: C.line,
            }}
          />
          {Array.from({length: 30}, (_, index) => (
            <span
              key={index}
              style={{
                position: "absolute",
                left: index * 120,
                top: 172,
                width: index % 5 === 0 ? 5 : 3,
                height: index % 5 === 0 ? 22 : 12,
                background: index % 5 === 0 ? C.teal : "#bbbeb8",
              }}
            />
          ))}
          {milestoneData.map((item, index) => {
            const localIn = p(frame, 968 + index * 36, 990 + index * 36);
            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: item.x - 145,
                  top: 16,
                  width: 290,
                  height: 132,
                  borderRadius: 18,
                  border: `1px solid ${index === 3 ? C.teal : C.line}`,
                  background: index === 3 ? C.tealSoft : C.panel,
                  boxShadow: "0 15px 34px rgba(22,29,23,.08)",
                  padding: 22,
                  boxSizing: "border-box",
                  transform: `scaleY(${0.12 + localIn * 0.88})`,
                  transformOrigin: "50% 100%",
                }}
              >
                <div style={{fontSize: 23, fontWeight: 720}}>{item.label}</div>
                <div style={{fontSize: 17, color: C.muted, marginTop: 10}}>{item.detail}</div>
              </div>
            );
          })}
        </div>
      </div>
      {frame >= 1106 && (
        <div
          style={{
            position: "absolute",
            left: 1180,
            top: 255,
            width: 520,
            display: "grid",
            gap: 12,
          }}
        >
          {["Snapshot saved", "Worker restarted", "History restored"].map((text, index) => {
            const inP = p(frame, 1110 + index * 18, 1124 + index * 18);
            return (
              <div
                key={text}
                style={{
                  height: 72,
                  borderRadius: 15,
                  border: `1px solid ${index === 2 ? C.teal : C.line}`,
                  background: index === 2 ? C.tealSoft : C.panel,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 22px",
                  fontFamily: MONO,
                  fontSize: 18,
                  opacity: inP,
                  transform: `translateX(${(1 - inP) * 35}px)`,
                }}
              >
                <span style={{color: index === 2 ? C.teal : C.muted, marginRight: 14}}>
                  {index === 2 ? "✓" : "○"}
                </span>
                {text}
              </div>
            );
          })}
        </div>
      )}
      {restore > 0 && (
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 628,
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `3px solid ${C.teal}`,
            transform: `translate(-50%, -50%) scale(${0.7 + restore * 1.4})`,
            opacity: 1 - restore,
          }}
        />
      )}
    </>
  );
};

const ScaleScene = ({frame}: {frame: number}) => {
  const spreadStart = 1217;
  const mergeStart = 1264;
  const merge = p(frame, mergeStart, mergeStart + 15, Easing.in(Easing.cubic));
  const clones = Array.from({length: 7}, (_, index) => 7 - index);
  const usage = Math.floor(
    interpolate(frame, [1210, 1250], [1, 8], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return (
    <>
      <div style={{position: "absolute", right: 120, top: 190, width: 650}}>
        <SectionLabel eyebrow="Scale and park" title={<>Pay for what you use.<br />Scale when work grows.</>} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 235,
          width: 560,
          height: 510,
          perspective: 1500,
        }}
      >
        <div style={{position: "absolute", left: 220, top: 180, transformStyle: "preserve-3d", transform: "rotateY(16deg)"}}>
          {clones.map((idx) => {
            const spread = spring({
              frame: frame - spreadStart - (idx - 1) * 1.6,
              fps: FPS,
              config: {damping: 14, stiffness: 160, mass: 0.8},
              durationInFrames: 16,
            });
            const amount = spread * (1 - merge);
            const opacity = (1 - (idx / 7) * 0.8) * amount;
            if (opacity <= 0.005) return null;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: idx * 44 * amount,
                  top: -idx * 27 * amount,
                  transform: `translateZ(${-idx * 100 * amount}px)`,
                  opacity,
                  width: 250,
                  height: 154,
                  borderRadius: 20,
                  border: `1px solid ${C.line}`,
                  background: C.panel,
                  boxShadow: "0 14px 32px rgba(22,30,24,.10)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CoreVisual size={72} state="working" localFrame={frame + idx * 3} label={false} />
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 180,
          top: 560,
          width: 560,
          borderRadius: 22,
          border: `1px solid ${C.line}`,
          background: C.panel,
          padding: "24px 28px",
          boxSizing: "border-box",
          boxShadow: "0 16px 34px rgba(20,28,22,.07)",
        }}
      >
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end"}}>
          <div>
            <div style={{fontSize: 17, color: C.muted}}>ACTIVE AGENTS</div>
            <div style={{fontSize: 58, fontWeight: 780, marginTop: 4}}>{usage}</div>
          </div>
          <div style={{textAlign: "right"}}>
            <div style={{fontSize: 17, color: C.muted}}>USAGE-BASED</div>
            <div style={{fontSize: 27, fontWeight: 730, marginTop: 8}}>Only while running</div>
          </div>
        </div>
      </div>
    </>
  );
};

const IdleScene = ({frame}: {frame: number}) => {
  const park = p(frame, 1303, 1325);
  return (
    <>
      <div style={{position: "absolute", left: 130, top: 245, width: 650}}>
        <SectionLabel eyebrow="Parked" title={<>Idle agents<br />cost nothing.</>} />
        <div style={{fontSize: 24, color: C.muted, marginTop: 30}}>
          Keep the agent and its full history. Pay again only when work returns.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 170,
          top: 255,
          width: 560,
          height: 410,
          borderRadius: 28,
          border: `1px solid ${C.line}`,
          background: C.panel,
          boxShadow: "0 24px 58px rgba(22,30,24,.09)",
          padding: 38,
          boxSizing: "border-box",
        }}
      >
        <div style={{fontSize: 18, color: C.muted}}>CURRENT STATE</div>
        <div style={{fontSize: 50, fontWeight: 780, marginTop: 13, color: park > 0.55 ? C.muted : C.green}}>
          {park > 0.55 ? "PARKED" : "ACTIVE"}
        </div>
        <div style={{height: 1, background: C.line, margin: "32px 0"}} />
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end"}}>
          <span style={{fontSize: 18, color: C.muted}}>IDLE COST</span>
          <span style={{fontSize: 68, fontWeight: 790, letterSpacing: -4}}>$0</span>
        </div>
        <div style={{fontSize: 18, color: C.teal, fontWeight: 700, marginTop: 20}}>Parked agents are free.</div>
      </div>
    </>
  );
};

const WakeScene = ({frame}: {frame: number}) => {
  const message = p(frame, 1414, 1453);
  const delivered = p(frame, 1453, 1492, Easing.linear);
  const wake = p(frame, 1492, 1508, Easing.linear);
  const reply = p(frame, 1512, 1540);
  const scanX = interpolate(frame, [1470, 1528], [-260, W + 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const timer = interpolate(frame, [1492, 1515], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <div style={{position: "absolute", left: 120, top: 160}}>
        <SectionLabel eyebrow="Always ready" title={<>A message arrives.<br />The same agent wakes.</>} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: 430,
          height: 390,
          borderRadius: 28,
          border: `1px solid ${C.line}`,
          background: C.panel,
          boxShadow: "0 20px 50px rgba(22,30,24,.09)",
          overflow: "hidden",
          filter: frame < 1492 ? "saturate(.2)" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: scanX - 280,
            top: 0,
            width: 560,
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(10,186,181,.18), transparent)",
            filter: "blur(14px)",
            opacity: wake,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: scanX,
            top: 0,
            width: 4,
            height: "100%",
            background: C.teal,
            boxShadow: "0 0 18px 7px rgba(10,186,181,.34)",
            opacity: wake,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 50,
            top: 55,
            width: 450,
            padding: "18px 22px",
            borderRadius: 18,
            background: "#f2f3ef",
            border: `1px solid ${C.line}`,
            opacity: message * (1 - p(frame, 1472, 1494)),
            transform: `translateX(${(1 - message) * -80 + delivered * 620}px)`,
          }}
        >
          <div style={{fontSize: 17, color: C.muted}}>Slack · #growth</div>
          <div style={{fontSize: 22, fontWeight: 680, marginTop: 8}}>
            Summarize today’s signups.
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 54,
            top: 55,
            fontFamily: MONO,
            fontSize: 20,
            color: C.teal,
            fontWeight: 750,
            opacity: wake,
          }}
        >
          {timer.toFixed(1)}s · RUNNING
        </div>
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: 54,
            maxWidth: 640,
            padding: "18px 22px",
            borderRadius: "18px 18px 4px 18px",
            background: C.tealSoft,
            fontSize: 22,
            lineHeight: 1.35,
            opacity: reply,
            transform: `translateY(${(1 - reply) * 24}px)`,
          }}
        >
          142 signups, up 18%. The report is ready.
        </div>
      </div>
      <svg width={W} height={H} style={{position: "absolute", inset: 0}}>
        <path
          d="M 610 565 C 760 520 840 520 960 515"
          fill="none"
          stroke={C.teal}
          strokeWidth={5}
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - delivered}
          strokeLinecap="round"
        />
      </svg>
    </>
  );
};

const OutroScene = ({frame}: {frame: number}) => {
  const local = frame - 1606;
  const wobble = interpolate(
    local,
    [8, 15, 22, 29, 34],
    [0, -10, 13, -16, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    },
  );
  const flip = p(local, 34, 46, Easing.in(Easing.cubic));
  const scaleX = interpolate(flip, [0, 1], [1, 0.04]);
  const bloom = spring({
    frame: local - 46,
    fps: FPS,
    config: {damping: 11, stiffness: 130, mass: 0.9},
  });
  const shift = p(local, 62, 80, Easing.out(Easing.cubic));
  const markX = interpolate(shift, [0, 1], [960, 635]);
  const showCore = local < 46;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: markX,
          top: 425,
          transform: "translate(-50%, -50%)",
          zIndex: 20,
        }}
      >
        {showCore ? (
          <div
            style={{
              transform: `rotate(${wobble}deg) scaleX(${scaleX})`,
              transformOrigin: "50% 78%",
              filter: flip > 0.3 ? `blur(${flip * 5}px)` : "none",
            }}
          >
            <CoreVisual size={190} state="waking" localFrame={frame} label={false} />
          </div>
        ) : (
          <Img
            src={staticFile("agentsky-mark.png")}
            style={{
              width: 230,
              height: 230,
              objectFit: "contain",
              transform: `scaleX(${interpolate(bloom, [0, 1], [0.04, 1])}) scale(${0.84 + Math.min(1, bloom) * 0.16})`,
              translate: "25.2px 11.3px"
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 790,
          top: 330,
          display: "flex",
          fontSize: 122,
          fontWeight: 790,
          letterSpacing: -6,
        }}
      >
        {"AgentSky".split("").map((char, index) => {
          const charP = p(local, 68 + index * 4.2, 82 + index * 4.2);
          return (
            <span
              key={`${char}-${index}`}
              style={{
                display: "inline-block",
                opacity: charP,
                transform: `scale(${1.55 - charP * 0.55}) translateY(${(1 - charP) * -20}px)`,
                filter: `blur(${(1 - charP) * 13}px)`,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 790,
          top: 525,
          fontSize: 39,
          color: C.muted,
          opacity: p(local, 88, 106),
          transform: `translateY(${(1 - p(local, 88, 106)) * 18}px)`,
        }}
      >
        Launch your first cloud agent in seconds.
      </div>
      <div
        style={{
          position: "absolute",
          left: 790,
          top: 610,
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: p(local, 100, 118),
        }}
      >
        <div
          style={{
            padding: "18px 26px",
            borderRadius: 11,
            color: "#fff",
            background: C.ink,
            fontSize: 20,
            fontWeight: 760,
            letterSpacing: 0.8,
          }}
        >
          LAUNCH AN AGENT ↗
        </div>
        <div style={{fontSize: 33, fontWeight: 760, textDecoration: "underline", textUnderlineOffset: 8}}>
          agentsky.dev
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 790,
          top: 710,
          color: C.teal,
          fontSize: 19,
          fontWeight: 700,
          opacity: p(local, 112, 128),
        }}
      >
        Starts at $3/mo — parked agents are free.
      </div>
    </>
  );
};

const SceneContent = () => {
  const frame = useCurrentFrame();
  if (frame <= 180) return <HeroScene frame={frame} />;
  if (frame <= 220) return <HowScene frame={frame} />;
  if (frame <= 292) return <ChoiceScene frame={frame} kind="harness" />;
  if (frame <= 360) return <ChoiceScene frame={frame} kind="model" />;
  if (frame <= 480) return <ChannelScene frame={frame} />;
  if (frame <= 550) return <IntegrationScene frame={frame} />;
  if (frame <= 622) return <ToolsScene frame={frame} />;
  if (frame <= 676) return <LaunchScene frame={frame} />;
  if (frame <= 734) return <ReadyScene frame={frame} />;
  if (frame <= 946) return <DeveloperScene frame={frame} />;
  if (frame <= 1204) return <DurableScene frame={frame} />;
  if (frame <= 1300) return <ScaleScene frame={frame} />;
  if (frame <= 1385) return <IdleScene frame={frame} />;
  if (frame <= 1605) return <WakeScene frame={frame} />;
  return <OutroScene frame={frame} />;
};

export const AgentSkyCoreLaunch = () => {
  const {fps, width, height} = useVideoConfig();
  if (fps !== FPS || width !== W || height !== H) {
    throw new Error("AgentSkyCoreLaunch is designed for 1920×1080 at 30fps.");
  }

  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <BrandCanvas />
      <Audio src={staticFile("reference-audio.m4a")} />
      {frame < 1606 && <BrandHeader />}
      <SceneContent />
      <PersistentCore />
      <KaraokeCaption />
    </AbsoluteFill>
  );
};
