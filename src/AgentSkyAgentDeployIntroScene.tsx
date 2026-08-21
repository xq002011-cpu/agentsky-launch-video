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

const INK = "#151817";
const MUTED = "#737876";
const FAINT = "#a3a8a6";
const LINE = "#e7e9e7";
const SURFACE = "#f6f7f5";
const TEAL = "#0abab5";
const GREEN = "#22a86b";
const UI = "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const MONO = "'SFMono-Regular', Menlo, Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const crisp = Easing.bezier(0.16, 1, 0.3, 1);

const reveal = (frame: number, start: number, duration = 15) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: crisp,
  });

const Glyph = ({type}: {type: "agent" | "overview" | "runtime" | "tools" | "logs" | "settings" | "check" | "bolt"}) => {
  const paths: Record<string, React.ReactNode> = {
    agent: <><rect x="5" y="6" width="14" height="13" rx="4"/><path d="M9 6V4m6 2V4M8.5 11h.01M15.5 11h.01M9 15h6"/></>,
    overview: <><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></>,
    runtime: <><rect x="4" y="5" width="16" height="5" rx="2"/><rect x="4" y="14" width="16" height="5" rx="2"/><path d="M8 7.5h.01M8 16.5h.01M12 7.5h5M12 16.5h5"/></>,
    tools: <><path d="m14.7 6.3 3-3 3 3-3 3M9.3 17.7l-3 3-3-3 3-3M13 5l-8 14M19 5l-8 14"/></>,
    logs: <><path d="M5 5h14M5 10h10M5 15h14M5 20h8"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.08-1l2.02-1.57-2-3.46-2.48 1a7 7 0 0 0-1.73-1L14.35 3h-4.7l-.38 2.97a7 7 0 0 0-1.73 1l-2.48-1-2 3.46L5.08 11A7 7 0 0 0 5 12c0 .34.03.67.08 1l-2.02 1.57 2 3.46 2.48-1a7 7 0 0 0 1.73 1L9.65 21h4.7l.38-2.97a7 7 0 0 0 1.73-1l2.48 1 2-3.46L18.92 13c.05-.33.08-.66.08-1Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    bolt: <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/>,
  };

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[type]}
    </svg>
  );
};

const Sidebar = ({frame}: {frame: number}) => {
  const navItems: Array<{label: string; icon: Parameters<typeof Glyph>[0]["type"]; active?: boolean}> = [
    {label: "Overview", icon: "overview", active: true},
    {label: "Runtime", icon: "runtime"},
    {label: "Tools & access", icon: "tools"},
    {label: "Activity logs", icon: "logs"},
  ];

  return (
    <div style={{width: 226, flexShrink: 0, borderRight: `1px solid ${LINE}`, background: "#fbfcfa", padding: "22px 16px 18px", boxSizing: "border-box", display: "flex", flexDirection: "column"}}>
      <div style={{display: "flex", alignItems: "center", gap: 9, padding: "0 7px 25px"}}>
        <Img src={staticFile("agentsky-mark.png")} style={{width: 26, height: 26, objectFit: "contain"}} />
        <span style={{fontWeight: 720, fontSize: 16, letterSpacing: -0.35}}>AgentSky</span>
      </div>

      <div style={{fontSize: 10, color: FAINT, fontWeight: 650, letterSpacing: 1.25, padding: "0 10px 9px"}}>AGENT</div>
      <div style={{display: "grid", gap: 5}}>
        {navItems.map((item, index) => {
          const p = reveal(frame, 13 + index * 4, 13);
          return (
            <div key={item.label} style={{height: 42, padding: "0 11px", display: "flex", alignItems: "center", gap: 11, borderRadius: 10, background: item.active ? "#eef8f6" : "transparent", color: item.active ? "#167f79" : "#6c716f", fontSize: 13, fontWeight: item.active ? 650 : 520, opacity: p, transform: `translateX(${(1 - p) * -10}px)`}}>
              <Glyph type={item.icon} />
              {item.label}
            </div>
          );
        })}
      </div>

      <div style={{marginTop: "auto", height: 51, borderTop: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 10, padding: "12px 7px 0"}}>
        <div style={{width: 29, height: 29, borderRadius: 9, background: "#e9eeeb", display: "grid", placeItems: "center", color: "#59605d"}}><Glyph type="settings" /></div>
        <div>
          <div style={{fontSize: 11.5, fontWeight: 650}}>Workspace</div>
          <div style={{fontSize: 9.5, color: FAINT, marginTop: 2}}>Production</div>
        </div>
      </div>
    </div>
  );
};

const DataCard = ({frame, start, label, value, detail, mono = false}: {frame: number; start: number; label: string; value: string; detail: string; mono?: boolean}) => {
  const p = reveal(frame, start, 14);
  return (
    <div style={{height: 112, border: `1px solid ${LINE}`, borderRadius: 14, background: "#fff", padding: "17px 18px", boxSizing: "border-box", opacity: p, transform: `translateY(${(1 - p) * 14}px)`, boxShadow: "0 1px 0 rgba(13,22,18,.02)"}}>
      <div style={{fontSize: 10.5, color: FAINT, letterSpacing: 0.25}}>{label}</div>
      <div style={{fontSize: 16, fontWeight: 680, color: INK, marginTop: 12, fontFamily: mono ? MONO : UI, letterSpacing: mono ? -0.5 : -0.25}}>{value}</div>
      <div style={{fontSize: 10.5, color: MUTED, marginTop: 7}}>{detail}</div>
    </div>
  );
};

const MainPanel = ({frame}: {frame: number}) => {
  const header = reveal(frame, 10, 18);
  const checks = ["Runtime provisioned", "Secrets encrypted", "Health checks passed"];
  const progress = interpolate(frame, [42, 73], [0, 1], {...clamp, easing: Easing.bezier(0.33, 0, 0.25, 1)});

  return (
    <div style={{flex: 1, minWidth: 0, background: "#fff", position: "relative"}}>
      <div style={{height: 66, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 28px", boxSizing: "border-box"}}>
        <div style={{display: "flex", alignItems: "center", gap: 10, opacity: header, transform: `translateY(${(1 - header) * -7}px)`}}>
          <div style={{width: 30, height: 30, borderRadius: 10, background: INK, color: "#fff", display: "grid", placeItems: "center"}}><Glyph type="agent" /></div>
          <div>
            <div style={{fontSize: 14, fontWeight: 700, letterSpacing: -0.25}}>omnichannel-agent</div>
            <div style={{fontSize: 9.5, color: FAINT, fontFamily: MONO, marginTop: 2}}>sky_7f31c9a</div>
          </div>
        </div>
        <div style={{marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, color: MUTED, opacity: header}}>
          <span style={{width: 7, height: 7, borderRadius: "50%", background: TEAL, boxShadow: "0 0 0 4px rgba(10,186,181,.10)"}} />
          Preparing deployment
        </div>
      </div>

      <div style={{padding: "29px 32px 30px", boxSizing: "border-box"}}>
        <div style={{display: "flex", alignItems: "flex-start", opacity: header, transform: `translateY(${(1 - header) * 10}px)`}}>
          <div>
            <div style={{fontSize: 25, lineHeight: 1.1, fontWeight: 700, letterSpacing: -0.85}}>Agent overview</div>
            <div style={{fontSize: 11.5, color: MUTED, marginTop: 8}}>Managed runtime, tools, and deployment configuration.</div>
          </div>
          <div style={{marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, padding: "8px 11px", border: `1px solid ${LINE}`, borderRadius: 9, fontFamily: MONO, fontSize: 9.5, color: "#59605d", background: "#fbfcfb"}}>
            <span style={{color: FAINT}}>env</span> production
          </div>
        </div>

        <div style={{display: "grid", gridTemplateColumns: "1.05fr 1fr 1.15fr", gap: 12, marginTop: 24}}>
          <DataCard frame={frame} start={24} label="HARNESS & MODEL" value="Hermes · GPT-5.6 Sol" detail="Long-horizon reasoning" />
          <DataCard frame={frame} start={29} label="MANAGED RUNTIME" value="Cloud · us-east-1" detail="Auto-recovery enabled" />
          <DataCard frame={frame} start={34} label="AGENT ENDPOINT" value="api.agentsky.dev/v1" detail="TLS · scoped access token" mono />
        </div>

        <div style={{display: "grid", gridTemplateColumns: "1.22fr .78fr", gap: 13, marginTop: 13}}>
          <div style={{height: 212, border: `1px solid ${LINE}`, borderRadius: 15, padding: "18px 19px", boxSizing: "border-box", opacity: reveal(frame, 38, 16), transform: `translateY(${(1 - reveal(frame, 38, 16)) * 14}px)`}}>
            <div style={{display: "flex", alignItems: "center"}}>
              <div>
                <div style={{fontSize: 13, fontWeight: 680}}>Deployment checks</div>
                <div style={{fontSize: 10.5, color: MUTED, marginTop: 4}}>Validating the production environment.</div>
              </div>
              <div style={{marginLeft: "auto", fontFamily: MONO, fontSize: 10, color: TEAL}}>{Math.round(progress * 100)}%</div>
            </div>
            <div style={{height: 4, borderRadius: 999, background: "#edf0ed", marginTop: 16, overflow: "hidden"}}>
              <div style={{height: "100%", width: `${progress * 100}%`, borderRadius: 999, background: TEAL}} />
            </div>
            <div style={{display: "grid", gap: 9, marginTop: 16}}>
              {checks.map((check, index) => {
                const p = reveal(frame, 45 + index * 9, 10);
                const complete = frame >= 53 + index * 9;
                return (
                  <div key={check} style={{height: 30, display: "flex", alignItems: "center", borderRadius: 8, color: complete ? "#3d4944" : FAINT, fontSize: 10.5, opacity: p, transform: `translateX(${(1 - p) * 9}px)`}}>
                    <span style={{width: 20, height: 20, borderRadius: "50%", background: complete ? "#eaf8f1" : SURFACE, color: complete ? GREEN : FAINT, display: "grid", placeItems: "center", marginRight: 9}}><Glyph type="check" /></span>
                    {check}
                    <span style={{marginLeft: "auto", fontFamily: MONO, fontSize: 9, color: complete ? GREEN : FAINT}}>{complete ? "PASSED" : "CHECKING"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{height: 212, border: `1px solid ${LINE}`, borderRadius: 15, background: SURFACE, padding: "18px 18px", boxSizing: "border-box", opacity: reveal(frame, 45, 16), transform: `translateY(${(1 - reveal(frame, 45, 16)) * 14}px)`}}>
            <div style={{fontSize: 13, fontWeight: 680}}>Access</div>
            <div style={{fontSize: 10.5, color: MUTED, marginTop: 4}}>Scoped for production.</div>
            <div style={{display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16}}>
              {["Browser", "Slack", "iMessage", "Images"].map((tool, index) => {
                const p = reveal(frame, 53 + index * 5, 11);
                return <span key={tool} style={{padding: "7px 9px", borderRadius: 8, background: "#fff", border: `1px solid ${LINE}`, fontSize: 9.5, color: "#515754", opacity: p, transform: `scale(${0.92 + p * 0.08})`}}>{tool}</span>;
              })}
            </div>
            <div style={{marginTop: 19, paddingTop: 13, borderTop: `1px solid ${LINE}`, display: "flex", alignItems: "center", color: MUTED, fontSize: 10}}>
              <span style={{color: TEAL, marginRight: 7}}><Glyph type="bolt" /></span>
              Suspend when idle
              <span style={{marginLeft: "auto", color: INK, fontWeight: 650}}>On</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReadyDialog = ({frame}: {frame: number}) => {
  const {fps} = useVideoConfig();
  const local = Math.max(0, frame - 72);
  const pop = spring({frame: local, fps, config: {damping: 18, stiffness: 145, mass: 0.75}});
  const centerCompensation = -interpolate(frame, [0, 118], [0, 16], clamp);

  return (
    <div style={{position: "absolute", left: 340, top: 256, width: 600, height: 258, borderRadius: 24, border: "1px solid rgba(22,31,27,.10)", background: "rgba(255,255,255,.985)", boxShadow: "0 22px 52px rgba(30,48,40,.16), 0 4px 12px rgba(30,48,40,.07)", padding: "32px 34px", boxSizing: "border-box", visibility: frame < 72 ? "hidden" : "visible", transform: `translate3d(${centerCompensation}px, ${(1 - pop) * 34}px, ${175 + pop * 35}px) scale(${0.88 + pop * 0.12})`, transformStyle: "preserve-3d"}}>
      <div style={{display: "flex", alignItems: "flex-start"}}>
        <span style={{width: 48, height: 48, borderRadius: 15, background: "#e9f8f1", color: GREEN, display: "grid", placeItems: "center", flexShrink: 0}}><Glyph type="check" /></span>
        <div style={{marginLeft: 18}}>
          <div style={{fontSize: 23, fontWeight: 720, letterSpacing: -0.55}}>Agent ready to deploy</div>
          <div style={{fontSize: 13.5, lineHeight: 1.48, color: MUTED, marginTop: 8}}>All production checks passed. Your managed agent is ready to go live.</div>
        </div>
      </div>
      <div style={{height: 1, background: LINE, margin: "23px 0 18px"}} />
      <div style={{display: "flex", alignItems: "center"}}>
        <div style={{fontFamily: MONO, color: FAINT, fontSize: 11}}>sky_7f31c9a · production</div>
        <div style={{marginLeft: "auto", height: 42, padding: "0 20px", borderRadius: 12, background: INK, color: "#fff", display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, fontWeight: 650}}>Deploy agent <span style={{fontSize: 18, lineHeight: 0}}>→</span></div>
      </div>
    </div>
  );
};

const ActivationRipples = ({frame}: {frame: number}) => {
  const progress = interpolate(frame, [28, 72], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.18, 0.72, 0.28, 1),
  });
  const opacity = interpolate(frame, [28, 35, 55, 72], [0, 1, 0.58, 0], clamp);

  return (
    <div style={{position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 5}}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 230,
          height: 230,
          marginLeft: -115,
          marginTop: -115,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(10,186,181,0) 0%, rgba(10,186,181,0) 29%, rgba(10,186,181,.055) 36%, rgba(10,186,181,.22) 48%, rgba(10,186,181,.12) 59%, rgba(10,186,181,.035) 67%, rgba(10,186,181,0) 74%)",
          filter: "blur(11px)",
          opacity,
          transform: `scale(${0.34 + progress * 5.25})`,
        }}
      />
    </div>
  );
};

export const AGENT_DEPLOY_INTRO_DURATION = 135;
export const AGENT_DEPLOY_CODE_OVERLAP = 0;

export const AgentSkyAgentDeployIntroScene = () => {
  const frame = useCurrentFrame();
  const enter = reveal(frame, 0, 25);
  const rotateY = interpolate(frame, [0, 134], [0, 15.2], clamp);
  const rotateX = interpolate(frame, [0, 134], [0, 1.9], clamp);
  const rotateZ = interpolate(frame, [0, 134], [0, 0.32], clamp);
  const driftX = interpolate(frame, [0, 118], [0, 16], clamp);

  return (
    <AbsoluteFill style={{background: "transparent", fontFamily: UI, color: INK, overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, perspective: 2800, perspectiveOrigin: "50% 49%"}}>
        <div style={{position: "absolute", left: "50%", top: "50%", width: 1280, height: 770, marginLeft: -640, marginTop: -385, transformStyle: "preserve-3d", transform: `translate3d(${driftX}px, ${(1 - enter) * 20}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${0.96 + enter * 0.04})`, transformOrigin: "50% 50%"}}>
          <div style={{position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", background: "#fff", border: "1px solid rgba(22,28,25,.12)", boxShadow: "0 46px 110px rgba(24,38,32,.18), 0 5px 20px rgba(24,38,32,.06)", display: "flex", transform: "translateZ(0px)"}}>
            <Sidebar frame={frame} />
            <MainPanel frame={frame} />
            <ActivationRipples frame={frame} />
          </div>
          <ReadyDialog frame={frame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
