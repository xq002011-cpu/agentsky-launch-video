import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { AgentSkyLogoMarqueeScene } from "./AgentSkyLogoMarqueeScene";

const W = 1280;
const H = 720;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const enter = (frame: number, start: number, duration = 16) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const exit = (frame: number, start: number, duration = 14) =>
  interpolate(frame, [start, start + duration], [1, 0], {
    easing: Easing.bezier(0.7, 0, 0.84, 0),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const particles = Array.from({ length: 66 }, (_, index) => ({
  x: (index * 71) % W,
  y: (index * 127) % H,
  size: 1 + ((index * 13) % 3),
  phase: index * 0.63,
  drift: 2 + ((index * 11) % 7),
}));

const configuratorParticles = Array.from({ length: 76 }, (_, index) => ({
  x: 14 + ((index * 97) % (W - 28)),
  y: 12 + ((index * 151) % (H - 24)),
  size: 2 + ((index * 17) % 3),
  phase: index * 0.71,
  driftX: 3 + ((index * 7) % 8),
  driftY: 3 + ((index * 11) % 7),
  color: index % 3 === 0 ? "#8a76ff" : "#14beb8",
}));

const Ambient = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 56% 65% at 50% 42%, #202123 0%, #111214 47%, #050506 100%)",
        color: "#f5f5f5",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.55,
          backgroundImage:
            "radial-gradient(circle at 18% 36%, rgba(255,255,255,.06), transparent 24%), radial-gradient(circle at 76% 64%, rgba(255,255,255,.035), transparent 28%)",
        }}
      />
      {particles.map((particle, index) => {
        const y = particle.y + Math.sin(frame / 36 + particle.phase) * particle.drift;
        const opacity = 0.09 + (Math.sin(frame / 24 + particle.phase) + 1) * 0.055;
        return (
          <span
            key={index}
            style={{
              position: "absolute",
              left: particle.x,
              top: y,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              background: "#f7f7f7",
              opacity,
              boxShadow: "0 0 7px rgba(255,255,255,.25)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,.35), transparent 22%, transparent 78%, rgba(0,0,0,.35)), linear-gradient(0deg, rgba(0,0,0,.48), transparent 30%, transparent 73%, rgba(0,0,0,.26))",
        }}
      />
    </AbsoluteFill>
  );
};

const Wordmark = ({ large = false, color = "#f0f0f0" }: { large?: boolean; color?: string }) => (
  <div
    style={{
      color,
      fontSize: large ? 58 : 16,
      fontWeight: 700,
      letterSpacing: large ? -2.8 : -0.6,
      lineHeight: 1,
    }}
  >
    AgentSky
  </div>
);

const TopLogo = () => {
  const frame = useCurrentFrame();
  const isConfigurator = frame >= 30 && frame <= 493;
  return (
  <div style={{ position: "absolute", top: 24, left: 30, opacity: 0.9, zIndex: 30 }}>
    <Wordmark color={isConfigurator ? "#141414" : "#f0f0f0"} />
  </div>
  );
};

type Caption = { from: number; to: number; text: string };

const captions: Caption[] = [
  {
    from: 0,
    to: 180,
    text: "AgentSky helps developers launch on-demand, cloud-hosted agents with any harness and any model.",
  },
  { from: 181, to: 220, text: "Here's how it works." },
  { from: 221, to: 292, text: "Choose your harness," },
  { from: 293, to: 360, text: "choose your model," },
  { from: 361, to: 480, text: "pick pre-built channels like iMessage or Slack," },
  { from: 481, to: 550, text: "connect to over a thousand integrations," },
  { from: 551, to: 622, text: "add tools like image generation or browser use," },
  { from: 623, to: 676, text: "then click launch." },
  { from: 677, to: 734, text: "That's it. Your cloud agent is live and ready to chat." },
  { from: 735, to: 946, text: "You can also create, manage, and access your agents through our developer APIs or CLI." },
  { from: 947, to: 1204, text: "Every agent comes with infinite context and built-in memory, so it can handle long-horizon tasks without managing infrastructure." },
  { from: 1205, to: 1300, text: "You only pay for what you use, and we scale with you." },
  { from: 1301, to: 1385, text: "When an agent is idle, it costs nothing." },
  { from: 1386, to: 1605, text: "It automatically suspends and resumes in under a second whenever a new message arrives." },
  { from: 1606, to: 1751, text: "Visit agentsky.dev and launch your first cloud agent in seconds." },
];

const KaraokeCaption = () => {
  const frame = useCurrentFrame();
  const caption = captions.find((item) => frame >= item.from && frame <= item.to);
  if (!caption) return null;
  const isConfigurator = frame >= 213 && frame <= 676;

  const words = caption.text.split(" ");
  const progress = clamp((frame - caption.from) / Math.max(1, caption.to - caption.from));
  const active = Math.min(words.length - 1, Math.floor(progress * words.length));

  return (
    <div
      style={{
        position: "absolute",
        bottom: isConfigurator ? 58 : 26,
        left: isConfigurator ? 110 : 150,
        right: isConfigurator ? 805 : 150,
        display: "flex",
        justifyContent: isConfigurator ? "flex-start" : "center",
        flexWrap: "wrap",
        gap: "0 5px",
        textAlign: isConfigurator ? "left" : "center",
        fontSize: isConfigurator ? 15 : 17,
        lineHeight: 1.28,
        color: isConfigurator ? "rgba(17,19,19,.5)" : "rgba(255,255,255,.5)",
        fontWeight: 600,
        textShadow: isConfigurator ? "none" : "0 2px 8px rgba(0,0,0,.55)",
      }}
    >
      {words.map((word, index) => {
        const isActive = index === active;
        const isPassed = index < active;
        return (
          <span
            key={`${word}-${index}`}
            style={{
              background: isActive ? (isConfigurator ? "#111214" : "#f4f4f4") : "transparent",
              color: isActive ? (isConfigurator ? "#ffffff" : "#101113") : isPassed ? (isConfigurator ? "#202222" : "#f3f3f3") : (isConfigurator ? "rgba(17,19,19,.48)" : "rgba(255,255,255,.48)"),
              padding: isActive ? "0 3px" : 0,
              borderRadius: 3,
              transform: `translateY(${isActive ? -1 : 0}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const Intro = () => {
  const frame = useCurrentFrame();
  const inProgress = enter(frame, 8, 28);
  const outProgress = exit(frame, 154, 26);
  const opacity = inProgress * outProgress;
  const y = interpolate(inProgress, [0, 1], [18, 0]);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{ marginTop: -72, textAlign: "center" }}>
        <Wordmark large />
        <div
          style={{
            marginTop: 22,
            color: "rgba(255,255,255,.64)",
            fontSize: 16,
            letterSpacing: -0.25,
          }}
        >
          Cloud-hosted agents with any harness, any LLM
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Field = ({
  label,
  value,
  accent,
  active,
}: {
  label: string;
  value: string;
  accent?: string;
  active: boolean;
}) => (
  <div style={{ marginBottom: 11 }}>
    <div style={{ fontSize: 7, color: "rgba(255,255,255,.38)", marginBottom: 4 }}>{label}</div>
    <div
      style={{
        height: 30,
        borderRadius: 6,
        border: `1px solid ${active ? "rgba(255,255,255,.82)" : "rgba(255,255,255,.12)"}`,
        background: active ? "rgba(255,255,255,.11)" : "rgba(255,255,255,.035)",
        boxShadow: active ? "0 0 0 2px rgba(255,255,255,.08)" : "none",
        display: "flex",
        alignItems: "center",
        padding: "0 9px",
        color: "rgba(255,255,255,.88)",
        fontSize: 9,
        gap: 6,
      }}
    >
      <span
        style={{
          width: 11,
          height: 11,
          borderRadius: 3,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#070708",
          fontSize: 6,
          fontWeight: 800,
          background: accent ?? "#e8e8e8",
        }}
      >
        ✦
      </span>
      <span style={{ flex: 1 }}>{value}</span>
      <span style={{ color: "rgba(255,255,255,.4)" }}>⌄</span>
    </div>
  </div>
);

const Option = ({ label, color, active }: { label: string; color: string; active: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 5,
      color: active ? "#f1f1f1" : "rgba(255,255,255,.5)",
      fontSize: 8,
      padding: "3px 5px",
      background: active ? "rgba(255,255,255,.085)" : "transparent",
      borderRadius: 5,
    }}
  >
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 7px ${color}` }} />
    {label}
  </div>
);

const Configurator = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(enter(frame, 0, 28), [0, 1], [45, 0]);
  const opacity = enter(frame, 0, 20) * exit(frame, 414, 18);
  const activeStep = Math.min(5, Math.floor(interpolate(frame, [48, 344], [0, 5], { extrapolateRight: "clamp" })));
  const cardScale = 0.94 + enter(frame, 0, 22) * 0.06;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      <div
        style={{
          width: 345,
          padding: "17px 18px 16px",
          borderRadius: 14,
          background: "linear-gradient(145deg, rgba(31,32,35,.97), rgba(15,16,18,.97))",
          border: "1px solid rgba(255,255,255,.1)",
          boxShadow: "0 35px 80px rgba(0,0,0,.58), inset 0 1px rgba(255,255,255,.045)",
          transform: `perspective(900px) rotateX(4deg) rotateY(-4deg) translateY(${rise}px) scale(${cardScale})`,
        }}
      >
        <div style={{ color: "rgba(255,255,255,.83)", fontSize: 11, fontWeight: 700, marginBottom: 14 }}>Launch agent</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="HARNESS" value="Hermes" accent="#ffffff" active={activeStep === 0} />
          <Field label="MODEL" value="Claude Code" accent="#d8d5ff" active={activeStep === 1} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="MODEL" value="Kimi K3" accent="#d8e9ff" active={activeStep === 1} />
          <Field label="" value="DeepSeek V4 Pro" accent="#f1c6ff" active={false} />
        </div>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,.38)", margin: "2px 0 5px" }}>CHANNELS</div>
        <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
          <Option label="iMessage" color="#59d365" active={activeStep === 2} />
          <Option label="Slack" color="#e6ae45" active={activeStep === 2} />
          <Option label="+5 more" color="#777" active={false} />
        </div>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>INTEGRATIONS</div>
        <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
          <Option label="Gmail" color="#df795f" active={activeStep === 3} />
          <Option label="Notion" color="#eee" active={activeStep === 3} />
          <Option label="1000+ integrations" color="#777" active={activeStep === 3} />
        </div>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>TOOLS</div>
        <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
          <Option label="Image gen" color="#eee" active={activeStep === 4} />
          <Option label="Browser use" color="#ee8069" active={activeStep === 4} />
          <Option label="+4 more" color="#777" active={false} />
        </div>
        <button
          style={{
            height: 29,
            padding: "0 13px",
            border: 0,
            borderRadius: 6,
            background: activeStep === 5 ? "#f2f2f2" : "rgba(255,255,255,.78)",
            color: "#111214",
            fontSize: 9,
            fontWeight: 700,
            boxShadow: activeStep === 5 ? "0 0 0 3px rgba(255,255,255,.13)" : "none",
          }}
        >
          ↗ Launch
        </button>
      </div>
    </AbsoluteFill>
  );
};

// White website-style configurator. Its beats line up with the VO at frames
// 221, 293, 361, 481, 551 and 623 respectively.
type ConfiguratorLayer = "all" | "background" | "card";

const OfficialConfigurator = ({
  layer = "all",
  frameOffset = 0,
}: {
  layer?: ConfiguratorLayer;
  frameOffset?: number;
}) => {
  const frame = useCurrentFrame() + frameOffset;
  const showBackground = layer !== "card";
  const showCard = layer !== "background";
  const phase = (at: number, duration = 12) => interpolate(frame, [at, at + duration], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inP = phase(30, 10);
  const outP = exit(frame, 486, 10);
  const harness = phase(38);
  const model = phase(110);
  const channels = phase(178);
  const integrations = phase(298);
  const tools = phase(368);
  const launch = phase(440);
  const live = frame >= 451;
  const ui = (visible: number): React.CSSProperties => ({ opacity: visible, transform: `translateY(${(1 - visible) * 10}px)` });
  const icon = (kind: string) => {
    const base: React.CSSProperties = { width: 27, height: 27, display: "grid", placeItems: "center", flexShrink: 0 };
    if (kind === "agent") return <Img src={staticFile("ui-hermes.png")} style={{ ...base, objectFit: "contain" }} />;
    if (kind === "codex") return <Img src={staticFile("ui-codex.png")} style={{ ...base, objectFit: "contain", borderRadius: 7 }} />;
    if (kind === "openai") return <Img src={staticFile("ui-openai.png")} style={{ ...base, objectFit: "contain" }} />;
    if (kind === "glm") return <Img src={staticFile("ui-glm.png")} style={{ ...base, objectFit: "contain" }} />;
    if (kind === "message") return <Img src={staticFile("ui-imessage.png")} style={{ ...base, objectFit: "contain", borderRadius: 7 }} />;
    if (kind === "slack") return <Img src={staticFile("ui-slack.png")} style={{ ...base, objectFit: "contain" }} />;
    if (kind === "gmail") return <Img src={staticFile("integration-gmail.png")} style={{ ...base, objectFit: "contain" }} />;
    if (kind === "notion") return <Img src={staticFile("integration-notion.png")} style={{ ...base, objectFit: "contain" }} />;
    if (kind === "jira") return <Img src={staticFile("integration-jira.png")} style={{ ...base, objectFit: "contain" }} />;
    if (kind === "image") return <span style={{ ...base, borderRadius: 7, border: "1px solid #77deda", background: "#e4f0fe", color: "#099b96", fontSize: 16 }}>✦</span>;
    if (kind === "browser") return <span style={{ ...base, borderRadius: "50%", background: "conic-gradient(#ea4335 0 32%,#fbbc05 0 56%,#34a853 0 76%,#4285f4 0)", border: "5px solid #fff", boxSizing: "border-box" }} />;
    return <span style={{ ...base, borderRadius: 7, background: "#f3f3f3", fontSize: 15, fontWeight: 700 }}>◎</span>;
  };
  const choice = (label: string, selected: boolean, glyph: string, emphasis: number) => <div style={{ height: 62, borderRadius: 13, border: `1.5px solid ${selected ? "#58d9d6" : "#e5e7e7"}`, background: selected ? "#fbffff" : "#fff", display: "flex", alignItems: "center", padding: "0 14px", gap: 10, boxShadow: selected && emphasis > .3 ? "0 0 0 3px rgba(22,131,243,.08)" : "none", transform: `scale(${1 + Math.max(0, emphasis - .5) * .014})` }}>{icon(glyph)}<span style={{ flex: 1, color: "#212222", fontWeight: 650, fontSize: 16 }}>{label}</span>{selected && <span style={{ color: "#1683f3", fontWeight: 800, fontSize: 20, transform: `scale(${.45 + Math.min(1, emphasis * 1.6) * .55})` }}>✓</span>}</div>;
  const pill = (label: string, glyph: string, active: boolean) => <div style={{ height: 36, borderRadius: 19, border: `1.5px solid ${active ? "#91e4e1" : "#e6e8e8"}`, background: active ? "#e4f0fe" : "#fff", padding: "0 12px", display: "flex", alignItems: "center", gap: 7, color: "#222", fontSize: 13, fontWeight: 650 }}>{active && <span style={{ color: "#1683f3", fontWeight: 800 }}>✓</span>}{glyph && icon(glyph)}{label}</div>;
  const harnessChecked = frame >= 52;
  const modelChecked = frame >= 126;
  const harnessCheckP = phase(52);
  const modelCheckP = phase(126);
  const cardY = interpolate(frame, [38, 470], [0, -13], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardX = interpolate(frame, [38, 470], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardZ = interpolate(frame, [38, 470], [0, 2.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const harnessClick = interpolate(frame, [47, 52, 67], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const modelClick = interpolate(frame, [121, 126, 141], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickRipple = (progress: number) => progress > 0 ? <span style={{ position: "absolute", left: "50%", top: "50%", width: 18 + progress * 18, height: 18 + progress * 18, border: "2px solid #1683f3", borderRadius: "50%", opacity: progress, pointerEvents: "none", transform: "translate(-50%,-50%)", zIndex: 2 }} /> : null;

  return <AbsoluteFill style={{ opacity: inP * outP, overflow: "hidden", background: showBackground ? "#fdfdfc" : "transparent", color: "#171817" }}>
    {showBackground && <div style={{ position: "absolute", inset: 0, opacity: 1, overflow: "hidden" }}>
      {configuratorParticles.map((particle, index) => {
        const driftX = Math.sin(frame / 30 + particle.phase) * particle.driftX * 5;
        const driftY = Math.cos(frame / 38 + particle.phase * 0.83) * particle.driftY * 4.6;
        const breathe = 0.82 + (Math.sin(frame / 64 + particle.phase) + 1) * 0.09;
        const visibleSize = particle.size * 1.16;
        return <span key={index} style={{ position: "absolute", left: particle.x, top: particle.y, width: visibleSize, height: visibleSize, borderRadius: "50%", background: particle.color, opacity: (.38 + (index % 4) * .05) * breathe, boxShadow: `0 0 ${visibleSize * 2.35}px ${particle.color}40`, transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${breathe})`, willChange: "transform, opacity" }} />;
      })}
    </div>}
    {showBackground && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 58% 50%, rgba(226,255,253,.34), transparent 34%)" }} />}
    {showCard && <div style={{ position: "absolute", left: 545, top: 48, width: 595, minHeight: 570, padding: "28px 32px 25px", borderRadius: 25, border: "1px solid #e7e9e9", background: "rgba(255,255,255,.98)", transformOrigin: "50% 50%", transformStyle: "preserve-3d", willChange: "transform", boxShadow: "none", transform: `perspective(1500px) rotateY(${cardY}deg) rotateX(${cardX}deg) rotateZ(${cardZ}deg) translateY(${(1 - harness) * 24}px)`, opacity: harness }}>
      <div style={{ color: "#858989", fontSize: 14, letterSpacing: 2.15, fontWeight: 800, marginBottom: 21 }}>NEW AGENT</div>
      <div style={{ color: "#666a69", fontSize: 17, marginBottom: 9 }}>Harness</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}><div style={{ position: "relative" }}>{choice("Hermes", harnessChecked, "agent", harnessCheckP)}{clickRipple(harnessClick)}</div>{choice("Codex", false, "codex", 0)}</div>
      <div style={{ marginTop: 17, color: "#666a69", fontSize: 17, marginBottom: 9, ...ui(model) }}>Model</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, ...ui(model) }}><div style={{ position: "relative" }}>{choice("GPT-5.6 Sol", modelChecked, "openai", modelCheckP)}{clickRipple(modelClick)}</div>{choice("GLM-5.2", false, "glm", 0)}</div>
      <div style={{ marginTop: 15, ...ui(channels) }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "#666a69", fontSize: 17 }}>Channels</span><span style={{ color: "#1683f3", fontSize: 11, letterSpacing: 1, fontWeight: 800 }}>PRE-BUILT</span></div><div style={{ display: "flex", gap: 8 }}>{pill("iMessage", "message", true)}{pill("Slack", "slack", true)}{pill("+5 more", "", false)}</div></div>
      <div style={{ marginTop: 13, ...ui(integrations) }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "#666a69", fontSize: 17 }}>Integrations</span><span style={{ color: "#1683f3", fontSize: 13, fontWeight: 800 }}>1,000+</span></div><div style={{ display: "flex", alignItems: "center", gap: 9 }}>{["gmail", "notion", "jira"].map((name, index) => { const itemP = phase(298 + index * 7, 13); return <span key={name} style={{ width: 36, height: 36, border: "1px solid #e8e9e9", borderRadius: 10, display: "grid", placeItems: "center", opacity: itemP, transform: `translateX(${(1 - itemP) * 9}px) translateY(${(1 - itemP) * 5}px) scale(${0.94 + itemP * 0.06})` }}>{icon(name)}</span>; })}<span style={{ color: "#7c7f7e", fontSize: 12, fontWeight: 600, opacity: phase(329, 12), transform: `translateX(${(1 - phase(329, 12)) * 8}px)` }}>and 1000+ more</span></div></div>
      <div style={{ marginTop: 13, ...ui(tools) }}><div style={{ color: "#666a69", fontSize: 17, marginBottom: 8 }}>Capabilities</div><div style={{ display: "flex", gap: 8 }}>{pill("Generate image", "image", true)}{pill("Browser use", "browser", true)}</div></div>
      <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid #e9ebeb", display: "flex", justifyContent: "space-between", alignItems: "center", ...ui(launch) }}><div><div style={{ color: "#949797", fontSize: 13 }}>Persistent</div><div style={{ color: "#b6baba", fontSize: 12 }}>runs for months</div></div><div style={{ width: 193, height: 48, background: live ? "#1683f3" : "#151616", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, letterSpacing: 1, fontSize: 13, fontWeight: 800, boxShadow: live ? "0 0 0 4px rgba(22,131,243,.13)" : "none" }}><span style={{ fontSize: 20 }}>{live ? "✓" : "↗"}</span>{live ? "AGENT LIVE" : "LAUNCH AGENT"}</div></div>
    </div>}
  </AbsoluteFill>;
};

const CONFIGURATOR_EXPORT_FRAME_OFFSET = 220 - 183;

export const AgentSkyConfigBackgroundSequence = () => (
  <OfficialConfigurator layer="background" frameOffset={CONFIGURATOR_EXPORT_FRAME_OFFSET} />
);

export const AgentSkyConfigCardSequence = () => (
  <AbsoluteFill style={{ background: "transparent" }}>
    <div style={{ position: "absolute", left: 35, top: 0, width: 1280, height: 720, transform: "scale(1.5)", transformOrigin: "top left" }}>
      <OfficialConfigurator layer="card" frameOffset={CONFIGURATOR_EXPORT_FRAME_OFFSET} />
    </div>
  </AbsoluteFill>
);

const AgentReady = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, 0, 18) * exit(frame, 100, 16);
  const pulse = 1 + Math.sin(frame / 7) * 0.025;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: p }}>
      <div style={{ textAlign: "center", marginTop: -28 }}>
        <div
          style={{
            width: 82,
            height: 82,
            borderRadius: "50%",
            margin: "0 auto 13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${pulse})`,
            border: "1px solid rgba(255,255,255,.16)",
            background: "radial-gradient(circle at 42% 35%, #33363a, #111214 70%)",
            boxShadow: "0 0 45px rgba(255,255,255,.08), inset 0 1px rgba(255,255,255,.09)",
            fontSize: 32,
          }}
        >
          ✦
        </div>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11, color: "rgba(255,255,255,.72)" }}>
          AGENT eros-55c0
        </div>
        <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,.46)" }}>✓ live and ready to chat</div>
      </div>
    </AbsoluteFill>
  );
};

const Terminal = () => {
  const frame = useCurrentFrame();
  const progress = clamp((frame - 28) / 156);
  const body = `POST /api/v1/agents\n{ "harness": "hermes", "model": "kimi-k3" }\n→ 201 eros-55c0`;
  const typed = body.slice(0, Math.floor(body.length * progress));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 620, marginTop: -35 }}>
        <div style={{ textAlign: "center", fontSize: 22, color: "rgba(255,255,255,.88)", letterSpacing: -0.8 }}>
          Create, manage and access — from the API or CLI.
        </div>
        <div
          style={{
            margin: "34px auto 0",
            width: 468,
            minHeight: 130,
            borderRadius: 9,
            background: "rgba(17,18,20,.93)",
            border: "1px solid rgba(255,255,255,.13)",
            boxShadow: "0 25px 55px rgba(0,0,0,.3)",
            overflow: "hidden",
          }}
        >
          <div style={{ height: 27, padding: "0 12px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            {["#ef6b60", "#d8b84b", "#65c466"].map((color) => <span key={color} style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />)}
            <span style={{ marginLeft: 14, color: "rgba(255,255,255,.5)", fontSize: 8, fontFamily: "ui-monospace, monospace" }}>CLI</span>
            <span style={{ padding: "3px 7px", borderRadius: 4, background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.5)", fontSize: 8 }}>API</span>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0, padding: "16px 18px", minHeight: 72, color: "rgba(255,255,255,.83)", fontSize: 12, lineHeight: 1.65, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {typed}<span style={{ opacity: Math.sin(frame / 4) > 0 ? 1 : 0 }}>|</span>
          </pre>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Memory = () => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [12, 172], [0, 520], { extrapolateRight: "clamp" });
  const tickCount = Math.floor(interpolate(frame, [32, 190], [0, 22], { extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 27, left: 30, color: "rgba(255,255,255,.45)", fontSize: 8, letterSpacing: 1.2 }}>RESUMABLE</div>
      <div style={{ position: "absolute", top: 89, right: 202, width: 230 }}>
        <div style={{ fontSize: 25, lineHeight: 1.08, letterSpacing: -1.2, fontWeight: 600 }}>Infinite context.<br />Built-in memory.</div>
        <div style={{ marginTop: 24, display: "grid", gap: 9, color: "rgba(255,255,255,.58)", fontSize: 10 }}>
          <div>✦&nbsp; Infinite context</div>
          <div>✦&nbsp; Built-in memory</div>
          <div>✦&nbsp; Long-horizon tasks, no infrastructure to manage</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 205, top: 333, width: 560, height: 145 }}>
        <div style={{ position: "absolute", top: 70, left: 0, width, height: 1, background: "rgba(255,255,255,.7)", boxShadow: "0 0 9px rgba(255,255,255,.3)" }} />
        {Array.from({ length: tickCount }, (_, index) => {
          const x = 22 + index * 22;
          const high = index % 4 === 0 ? 51 : 19 + ((index * 17) % 26);
          return <div key={index} style={{ position: "absolute", left: x, top: 70 - high / 2, width: 1, height: high, background: "rgba(255,255,255,.5)" }} />;
        })}
        {[0, 1].map((index) => {
          const boxP = enter(frame, 36 + index * 68, 20);
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: index === 0 ? 6 : 44,
                left: index === 0 ? 25 : 280,
                width: 120,
                height: 95,
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,.18)",
                background: "rgba(255,255,255,.017)",
                opacity: boxP,
              }}
            >
              <span style={{ position: "absolute", top: -14, left: 5, color: "rgba(255,255,255,.34)", fontSize: 7, letterSpacing: 1 }}>SANDBOX</span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: width - 7, top: 62, width: 16, height: 16, opacity: width > 0 ? 1 : 0, borderRadius: "50%", background: "#26282b", border: "1px solid rgba(255,255,255,.25)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 9 }}>✦</div>
      </div>
    </AbsoluteFill>
  );
};

const Billing = () => {
  const frame = useCurrentFrame();
  const phase = frame < 116 ? "running" : frame < 208 ? "suspended" : "resuming";
  const values = ["$0.0049", "$0.0085", "$0.0117", "$0.0153", "$0.00"];
  const valueIndex = Math.min(4, Math.floor(interpolate(frame, [0, 138], [0, 4], { extrapolateRight: "clamp" })));
  const value = values[valueIndex];
  const lineWidth = phase === "suspended" ? 168 : phase === "resuming" ? 310 : 268;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 27, left: 30, color: "rgba(255,255,255,.45)", fontSize: 8, letterSpacing: 1.2 }}>BILLING</div>
      <div style={{ position: "absolute", top: 85, right: 224, width: 220 }}>
        <div style={{ fontSize: 25, lineHeight: 1.05, letterSpacing: -1.2, fontWeight: 600 }}>Pay for what<br />you use.</div>
        <div style={{ marginTop: 24, display: "grid", gap: 9, color: "rgba(255,255,255,.58)", fontSize: 10 }}>
          <div>✦&nbsp; Pay only for what you use</div>
          <div>✦&nbsp; Scales with you</div>
          <div>✦&nbsp; Idle agents cost nothing</div>
          <div>✦&nbsp; Suspends, and resumes in under a second</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 318, width: 370 }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 24, fontWeight: 700, letterSpacing: -1.4 }}>{value}</div>
        <div style={{ marginTop: 3, color: "rgba(255,255,255,.38)", fontSize: 8 }}>{phase === "suspended" ? "total while suspended" : "total used"}</div>
        <div style={{ position: "relative", marginTop: 19, width: 315, height: 1, background: "rgba(255,255,255,.12)" }}>
          <div style={{ width: lineWidth, height: 1, background: "rgba(255,255,255,.72)", transition: "none" }} />
          <div style={{ position: "absolute", left: lineWidth - 7, top: -7, width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#26282b", border: "1px solid rgba(255,255,255,.25)", fontSize: 8 }}>✦</div>
        </div>
        <div style={{ marginTop: 11, width: 315, display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,.35)", fontSize: 8, letterSpacing: 0.8 }}>
          <span>RUNNING</span><span style={{ color: phase === "suspended" ? "rgba(255,255,255,.86)" : "rgba(255,255,255,.35)" }}>SUSPENDED</span><span style={{ color: phase === "resuming" ? "rgba(255,255,255,.86)" : "rgba(255,255,255,.35)" }}>RUNNING</span>
        </div>
        {phase === "resuming" && <div style={{ position: "absolute", right: 36, top: 57, fontFamily: "ui-monospace, monospace", fontSize: 10, color: "rgba(255,255,255,.85)" }}>0.6s</div>}
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, 10, 22);
  const marks = [
    { x: 198, y: 120, text: "◌", color: "#eee" },
    { x: 438, y: 82, text: "K", color: "#eee" },
    { x: 655, y: 120, text: "◈", color: "#738bff" },
    { x: 110, y: 432, text: "◖", color: "#eee" },
    { x: 564, y: 500, text: "Z", color: "#eee" },
    { x: 880, y: 365, text: "AI", color: "#ef7953" },
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: p }}>
      {marks.map((mark, index) => <div key={index} style={{ position: "absolute", left: mark.x, top: mark.y, color: mark.color, fontSize: 26, fontWeight: 700, opacity: 0.88 }}>{mark.text}</div>)}
      <div style={{ textAlign: "center", marginTop: -28 }}>
        <Wordmark large />
        <div style={{ marginTop: 22, fontSize: 21, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 7 }}>agentsky.dev</div>
        <div style={{ marginTop: 20, color: "rgba(255,255,255,.52)", fontSize: 11 }}>Launch your first cloud agent in seconds</div>
      </div>
    </AbsoluteFill>
  );
};

export const AgentSkyLaunch = () => {
  const { fps } = useVideoConfig();
  if (fps !== 30) throw new Error("This replica is timed for 30fps source audio.");

  return (
    <AbsoluteFill>
      <Ambient />
      <Audio src={staticFile("reference-audio.m4a")} />
      <Sequence from={0} durationInFrames={183}><Intro /></Sequence>
      <Sequence from={183} durationInFrames={494}><OfficialConfigurator /></Sequence>
      <Sequence from={677} durationInFrames={58}><AgentReady /></Sequence>
      <Sequence from={735} durationInFrames={212}><Terminal /></Sequence>
      <Sequence from={947} durationInFrames={258}><Memory /></Sequence>
      <Sequence from={1205} durationInFrames={401}><Billing /></Sequence>
      <Sequence from={1606} durationInFrames={146}><Outro /></Sequence>
      <Sequence from={1752} durationInFrames={150}><AgentSkyLogoMarqueeScene /></Sequence>
    </AbsoluteFill>
  );
};
