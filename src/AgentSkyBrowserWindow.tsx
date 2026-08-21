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
import {AgentSkyCodeBuildScene} from "./AgentSkyCodeBuildScene";
import {AgentSkyInfiniteContextScene} from "./AgentSkyInfiniteContextScene";

const W = 1920;
const H = 1080;
const INK = "#111212";
const MUTED = "#686b6a";
const LINE = "#e8e9e7";
const TEAL = "#08bdb8";
const TEAL_SOFT = "#e9fbfa";
const FONT = "Inter, Arial, sans-serif";
const LOGO_FONT = "'AgentSky Space Grotesk', Arial, sans-serif";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const DotField = () => {
  const frame = useCurrentFrame();
  const dots = Array.from({length: 118}, (_, index) => {
    const theta = (index / 118) * Math.PI * 2 + Math.sin(index * 1.91) * 0.11;
    const radius = 370 + ((index * 41) % 210);
    return {
      x: 1060 + Math.cos(theta) * radius,
      y: 414 + Math.sin(theta) * radius * 0.74,
      size: 3 + ((index * 7) % 8),
      color: index % 3 === 0 ? "#ab91ff" : "#61d7d2",
      delay: (index * 3) % 32,
    };
  });

  return (
    <div style={{position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none"}}>
      <div
        style={{
          position: "absolute",
          left: 610,
          top: 104,
          width: 1020,
          height: 780,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(236,250,249,.96) 0%, rgba(255,255,255,.30) 44%, transparent 71%)",
          opacity: 0.82,
        }}
      />
      {dots.map((dot, index) => {
        const drift = Math.sin((frame + dot.delay) / 18) * 6;
        const opacity = 0.26 + 0.45 * (0.5 + 0.5 * Math.sin((frame + index * 5) / 23));
        return (
          <span
            key={index}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y + drift,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: dot.color,
              opacity,
              filter: "blur(.15px)",
            }}
          />
        );
      })}
    </div>
  );
};

const TrafficLights = () => (
  <div style={{display: "flex", gap: 11, alignItems: "center"}}>
    {[
      {color: "#ff5f57", label: "Close"},
      {color: "#febc2e", label: "Minimize"},
      {color: "#28c840", label: "Maximize"},
    ].map((light) => (
      <span
        aria-label={light.label}
        key={light.label}
        style={{
          width: 15,
          height: 15,
          borderRadius: "50%",
          background: light.color,
          boxShadow: "inset 0 -1px 2px rgba(0,0,0,.18)",
        }}
      />
    ))}
  </div>
);

const NavLink = ({children}: {children: string}) => (
  <span style={{fontSize: 19, color: "#555857", whiteSpace: "nowrap"}}>{children}</span>
);

const Check = () => (
  <span style={{color: "#049d99", fontSize: 24, lineHeight: 1, fontWeight: 800}}>✓</span>
);

const Choice = ({
  children,
  selected = false,
  compact = false,
}: {
  children: React.ReactNode;
  selected?: boolean;
  compact?: boolean;
}) => (
  <div
    style={{
      minHeight: compact ? 43 : 62,
      borderRadius: compact ? 18 : 15,
      border: `1.5px solid ${selected ? "#6adbd7" : "#eceeec"}`,
      background: selected ? "#fcffff" : "#fff",
      display: "flex",
      alignItems: "center",
      gap: compact ? 10 : 14,
      padding: compact ? "0 15px" : "0 17px",
      boxSizing: "border-box",
      fontSize: compact ? 17 : 20,
      fontWeight: 620,
      color: INK,
      boxShadow: selected ? "0 5px 14px rgba(8,189,184,.08)" : "none",
    }}
  >
    {children}
    {selected && <span style={{marginLeft: "auto"}}><Check /></span>}
  </div>
);

const AgentCard = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const settle = spring({
    frame: frame - 14,
    fps,
    config: {damping: 16, stiffness: 105, mass: 0.8},
  });
  const float = Math.sin(frame / 28) * 4;
  const scale = interpolate(settle, [0, 1], [0.94, 1]);
  const y = interpolate(settle, [0, 1], [24, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 896,
        top: 180,
        width: 545,
        height: 520,
        transform: `translateY(${y + float}px) scale(${scale})`,
        transformOrigin: "center center",
        borderRadius: 27,
        background: "rgba(255,255,255,.96)",
        border: "1px solid #ebedec",
        boxShadow: "none",
        padding: "38px 34px 30px",
        boxSizing: "border-box",
      }}
    >
      <div style={{fontSize: 16, fontWeight: 800, letterSpacing: 3, color: "#808381"}}>NEW AGENT</div>

      <div style={{marginTop: 28, fontSize: 18, color: MUTED}}>Harness</div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 11}}>
        <Choice selected><span style={{fontSize: 22}}>♞</span> Hermes</Choice>
        <Choice><span style={{fontSize: 20, borderRadius: 8, padding: "3px 7px", background: "#f2f3f2"}}>◎</span> Codex</Choice>
      </div>

      <div style={{marginTop: 24, fontSize: 18, color: MUTED}}>Model</div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 11}}>
        <Choice selected><span style={{fontSize: 20, borderRadius: 8, padding: "3px 7px", background: "#f2f3f2"}}>◎</span> GPT-5.6 Sol</Choice>
        <Choice><span style={{fontSize: 19, borderRadius: 8, padding: "3px 8px", background: "#f2f3f2"}}>Z</span> GLM-5.2</Choice>
      </div>

      <div style={{marginTop: 25, fontSize: 18, color: MUTED}}>Capabilities</div>
      <div style={{display: "flex", gap: 9, marginTop: 12}}>
        <Choice compact selected>Scrape web</Choice>
        <Choice compact selected>Generate image</Choice>
        <Choice compact>+6 more</Choice>
      </div>

      <div style={{position: "absolute", left: 34, right: 34, bottom: 27, height: 1, background: "#eeeeed"}} />
      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          bottom: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{fontSize: 15, lineHeight: 1.23, color: "#969997"}}>Persistent<br />runs for months</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            background: INK,
            color: "#fff",
            borderRadius: 4,
            fontSize: 16,
            fontWeight: 720,
            letterSpacing: 0.8,
          }}
        >
          <span style={{fontSize: 19}}>↗</span> LAUNCH AGENT
        </span>
      </div>
    </div>
  );
};

const AgentSkyWebsiteScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: {damping: 17, stiffness: 90, mass: 0.9},
  });
  const scale = interpolate(enter, [0, 1], [0.92, 1]);
  const y = interpolate(enter, [0, 1], [30, 0]);
  const reveal = interpolate(frame, [8, 28], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  return (
    <AbsoluteFill style={{backgroundColor: "transparent", fontFamily: FONT}}>
      <style>{`
        @font-face {
          font-family: 'AgentSky Space Grotesk';
          src: url('${staticFile("SpaceGrotesk-Bold.ttf")}') format('truetype');
          font-style: normal;
          font-weight: 700;
          font-display: block;
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1600,
          height: 1000,
          transform: `translate(-50%, -50%) translateY(${y}px) scale(${scale})`,
          borderRadius: 32,
          overflow: "hidden",
          background: "#fff",
          border: "1px solid rgba(22,27,26,.15)",
          boxShadow: "none",
          opacity: reveal,
        }}
      >
        <div
          style={{
            height: 62,
            display: "flex",
            alignItems: "center",
            padding: "0 26px",
            background: "#f6f6f5",
            borderBottom: "1px solid #e5e6e4",
            boxSizing: "border-box",
          }}
        >
          <TrafficLights />
          <div style={{position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 16, color: "#858886"}}>agentsky.dev</div>
        </div>

        <div style={{height: 83, padding: "0 58px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box"}}>
          <div style={{display: "flex", alignItems: "center", gap: 14}}>
            <Img src={staticFile("agentsky-mark.png")} style={{width: 29, height: 29, objectFit: "contain"}} />
            <span style={{fontFamily: LOGO_FONT, fontSize: 27, fontWeight: 700, letterSpacing: -1.35, color: INK}}>AgentSky</span>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 38}}>
            <NavLink>Use cases⌄</NavLink>
            <NavLink>Pricing</NavLink>
            <NavLink>Compare</NavLink>
            <NavLink>Tutorials</NavLink>
            <NavLink>Docs</NavLink>
            <NavLink>FAQ</NavLink>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 25}}>
            <NavLink>Book a demo</NavLink>
            <NavLink>Log in</NavLink>
            <span style={{background: INK, color: "#fff", padding: "15px 25px", fontSize: 16, letterSpacing: 1.4}}>SIGN UP</span>
          </div>
        </div>

        <div style={{height: 59, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, display: "flex", justifyContent: "center", alignItems: "center", gap: 12}}>
          <span style={{fontSize: 23, color: INK}}>◕</span>
          <span style={{fontSize: 19, fontWeight: 760}}>New: Kimi K3 is live</span>
          <span style={{fontSize: 19, color: MUTED}}>— Moonshot's 1M-context flagship, on Claude Code, Hermes &amp; OpenClaw</span>
          <span style={{fontSize: 19, fontWeight: 720, color: TEAL}}>Launch one →</span>
        </div>

        <div style={{position: "relative", height: 796, overflow: "hidden"}}>
          <DotField />
          <div style={{position: "absolute", left: 72, top: 130, width: 430}}>
            <div style={{display: "inline-flex", alignItems: "center", gap: 12, padding: "13px 20px", border: `1px solid ${LINE}`, borderRadius: 999, background: "rgba(255,255,255,.88)", fontSize: 20, color: "#5d605f"}}>
              <span style={{width: 10, height: 10, borderRadius: "50%", background: TEAL}} />
              Long-horizon agents, everywhere
            </div>
            <div
              data-effect-slot="hero-title"
              style={{width: 640, height: 274}}
            />
            <div style={{width: 410, marginTop: 30, fontSize: 23, lineHeight: 1.42, color: MUTED}}>
              No Mac mini, no setup. Create a cloud agent that keeps working wherever your team needs it.
            </div>
            <div style={{display: "inline-flex", alignItems: "center", gap: 15, marginTop: 24, padding: "17px 23px", background: INK, color: "#fff", fontSize: 16, letterSpacing: 1, fontWeight: 700}}>
              LAUNCH AN AGENT <span style={{fontSize: 24, lineHeight: 0}}>→</span>
            </div>
            <div style={{marginTop: 25, fontSize: 18, color: "#686b6a"}}>
              Starts at <span style={{fontWeight: 800, color: INK}}>$3/mo</span> — parked agents are free.
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 10, marginTop: 20, fontSize: 17, color: "#777a79"}}>
              <span style={{display: "grid", placeItems: "center", width: 18, height: 18, borderRadius: 6, border: "1px solid #a9acab", fontSize: 12, color: "#737675"}}>✓</span>
              Zero Data Retention (ZDR) supported
            </div>
          </div>
          <AgentCard />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const AgentSkyBrowserWindow = () => (
  <AbsoluteFill style={{backgroundColor: "transparent"}}>
    <Sequence from={0} durationInFrames={150}>
      <AgentSkyWebsiteScene />
    </Sequence>
    <Sequence from={150} durationInFrames={195}>
      <AgentSkyCodeBuildScene />
    </Sequence>
    <Sequence from={345} durationInFrames={362}>
      <AgentSkyInfiniteContextScene />
    </Sequence>
  </AbsoluteFill>
);
