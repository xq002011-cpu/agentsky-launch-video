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
import {
  AGENT_DEPLOY_CODE_OVERLAP,
  AGENT_DEPLOY_INTRO_DURATION,
  AgentSkyAgentDeployIntroScene,
} from "./AgentSkyAgentDeployIntroScene";
import {
  AGENT_SKY_RED_DOT_RADIANCE_DURATION,
  AgentSkyRedDotRadianceScene,
} from "./AgentSkyRedDotRadianceScene";
import {
  AGENT_SKY_BLACK_SQUARE_FILL_DURATION,
  AgentSkyBlackSquareFillScene,
} from "./AgentSkyBlackSquareFillScene";
import {
  AGENT_SKY_RED_SQUARE_TEXTURE_DURATION,
  AGENT_SKY_RED_SQUARE_TEXTURE_GAP,
  AgentSkyRedSquareTextureScene,
} from "./AgentSkyRedSquareTextureScene";
import {
  AGENT_SKY_RED_DASHED_GRID_DURATION,
  AgentSkyRedDashedGridScene,
} from "./AgentSkyRedDashedGridScene";

const BG = "#f7f8f6";
const PANEL = "#202423";
const PANEL_2 = "#171a19";
const PANEL_3 = "#111413";
const LINE = "rgba(255,255,255,.09)";
const TEXT = "#eef1ef";
const MUTED = "#858d89";
const TEAL = "#17c6b8";
const GREEN = "#1683f3";
const MONO = "'SFMono-Regular', Menlo, Consolas, monospace";
const UI = "Inter, Arial, sans-serif";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

type Segment = {text: string; color?: string};
type CodeLine = {segments: Segment[]; start: number};

const codeLines: CodeLine[] = [
  {start: 101, segments: [{text: "import ", color: "#c792ea"}, {text: "{ AgentSky }", color: "#82aaff"}, {text: " from ", color: "#c792ea"}, {text: "'@agentsky/sdk'", color: "#c3e88d"}, {text: ";", color: "#89a0a7"}]},
  {start: 103, segments: [{text: "import ", color: "#c792ea"}, {text: "{ slack, iMessage }", color: "#82aaff"}, {text: " from ", color: "#c792ea"}, {text: "'@agentsky/channels'", color: "#c3e88d"}, {text: ";", color: "#89a0a7"}]},
  {start: 105, segments: [{text: "import ", color: "#c792ea"}, {text: "{ browser, imageGeneration }", color: "#82aaff"}, {text: " from ", color: "#c792ea"}, {text: "'@agentsky/tools'", color: "#c3e88d"}, {text: ";", color: "#89a0a7"}]},
  {start: 107, segments: []},
  {start: 108, segments: [{text: "const ", color: "#c792ea"}, {text: "agent", color: "#82aaff"}, {text: " = await ", color: "#c792ea"}, {text: "AgentSky", color: "#ffcb6b"}, {text: ".create({", color: "#89ddff"}]},
  {start: 110, segments: [{text: "  name", color: "#f78c6c"}, {text: ": ", color: "#89ddff"}, {text: "'omnichannel-agent'", color: "#c3e88d"}, {text: ",", color: "#89a0a7"}]},
  {start: 112, segments: [{text: "  harness", color: "#f78c6c"}, {text: ": ", color: "#89ddff"}, {text: "'hermes'", color: "#c3e88d"}, {text: ",", color: "#89a0a7"}]},
  {start: 114, segments: [{text: "  model", color: "#f78c6c"}, {text: ": ", color: "#89ddff"}, {text: "'gpt-5.6-sol'", color: "#c3e88d"}, {text: ",", color: "#89a0a7"}]},
  {start: 116, segments: [{text: "  memory", color: "#f78c6c"}, {text: ": { mode: ", color: "#89ddff"}, {text: "'infinite'", color: "#c3e88d"}, {text: " },", color: "#89a0a7"}]},
  {start: 118, segments: [{text: "  runtime", color: "#f78c6c"}, {text: ": ", color: "#89ddff"}, {text: "'cloud'", color: "#c3e88d"}, {text: ",", color: "#89a0a7"}]},
  {start: 120, segments: [{text: "  suspendWhenIdle", color: "#f78c6c"}, {text: ": ", color: "#89ddff"}, {text: "true", color: "#f07178"}, {text: ",", color: "#89a0a7"}]},
  {start: 122, segments: [{text: "});", color: "#89ddff"}]},
  {start: 123, segments: []},
  {start: 124, segments: [{text: "await ", color: "#c792ea"}, {text: "agent", color: "#82aaff"}, {text: ".connect([", color: "#89ddff"}]},
  {start: 126, segments: [{text: "  ", color: "#89a0a7"}, {text: "iMessage", color: "#ffcb6b"}, {text: "({ inbox: ", color: "#89ddff"}, {text: "'support'", color: "#c3e88d"}, {text: ", delivery: ", color: "#89ddff"}, {text: "'realtime'", color: "#c3e88d"}, {text: " }),", color: "#89a0a7"}]},
  {start: 128, segments: [{text: "  ", color: "#89a0a7"}, {text: "slack", color: "#ffcb6b"}, {text: "({ channel: ", color: "#89ddff"}, {text: "'#agents'", color: "#c3e88d"}, {text: " }),", color: "#89a0a7"}]},
  {start: 130, segments: [{text: "]);", color: "#89ddff"}]},
  {start: 131, segments: []},
  {start: 132, segments: [{text: "agent", color: "#82aaff"}, {text: ".addTools([", color: "#89ddff"}]},
  {start: 134, segments: [{text: "  ", color: "#89a0a7"}, {text: "browser", color: "#ffcb6b"}, {text: "({ secure: ", color: "#89ddff"}, {text: "true", color: "#f07178"}, {text: " }),", color: "#89a0a7"}]},
  {start: 136, segments: [{text: "  ", color: "#89a0a7"}, {text: "imageGeneration", color: "#ffcb6b"}, {text: "(),", color: "#89ddff"}]},
  {start: 138, segments: [{text: "]);", color: "#89ddff"}]},
  {start: 139, segments: []},
  {start: 140, segments: [{text: "agent", color: "#82aaff"}, {text: ".on(", color: "#89ddff"}, {text: "'message'", color: "#c3e88d"}, {text: ", async (message) => {", color: "#89ddff"}]},
  {start: 142, segments: [{text: "  const ", color: "#c792ea"}, {text: "result", color: "#82aaff"}, {text: " = await ", color: "#c792ea"}, {text: "agent", color: "#82aaff"}, {text: ".run(message, { remember: true, timeout: 120_000 });", color: "#89ddff"}]},
  {start: 144, segments: [{text: "  await ", color: "#c792ea"}, {text: "message", color: "#82aaff"}, {text: ".reply(result);", color: "#89ddff"}]},
  {start: 146, segments: [{text: "});", color: "#89ddff"}]},
  {start: 147, segments: []},
  {start: 148, segments: [{text: "const ", color: "#c792ea"}, {text: "deployment", color: "#82aaff"}, {text: " = await ", color: "#c792ea"}, {text: "agent", color: "#82aaff"}, {text: ".launch({", color: "#89ddff"}]},
  {start: 150, segments: [{text: "  region", color: "#f78c6c"}, {text: ": ", color: "#89ddff"}, {text: "'auto'", color: "#c3e88d"}, {text: ",", color: "#89a0a7"}]},
  {start: 152, segments: [{text: "  scale", color: "#f78c6c"}, {text: ": ", color: "#89ddff"}, {text: "'on-demand'", color: "#c3e88d"}, {text: ",", color: "#89a0a7"}]},
  {start: 154, segments: [{text: "});", color: "#89ddff"}]},
  {start: 155, segments: []},
  {start: 156, segments: [{text: "console", color: "#82aaff"}, {text: ".log(", color: "#89ddff"}, {text: "`Agent live: ${deployment.id} · persistent and ready everywhere`", color: "#c3e88d"}, {text: ");", color: "#89ddff"}]},
  {start: 158, segments: [{text: "// reachable everywhere — persistent by default.", color: "#607d78"}]},
];

const terminalLines = [
  {at: 18, text: "$ agentsky init omnichannel-agent", color: TEXT},
  {at: 34, text: "✓ workspace created", color: GREEN},
  {at: 47, text: "$ agentsky add hermes gpt-5.6-sol", color: TEXT},
  {at: 60, text: "✓ runtime and model provisioned", color: GREEN},
  {at: 72, text: "$ agentsky connect slack imessage", color: TEXT},
  {at: 83, text: "✓ secure channels connected", color: GREEN},
];

const tasks = [
  {at: 42, title: "Scaffold cloud runtime", meta: "agent.config.ts"},
  {at: 70, title: "Connect Slack and iMessage", meta: "channels.ts"},
  {at: 116, title: "Add browser and image tools", meta: "tools.ts"},
  {at: 166, title: "Launch persistent agent", meta: "deploy.ts"},
];

const TypeSegments = ({segments, start}: {segments: Segment[]; start: number}) => {
  const frame = useCurrentFrame();
  const total = segments.reduce((sum, segment) => sum + segment.text.length, 0);
  const visible = Math.floor(interpolate(frame, [start, start + Math.max(4, total * 0.14)], [0, total], clamp));
  let consumed = 0;

  return (
    <>
      {segments.map((segment, index) => {
        const amount = Math.max(0, Math.min(segment.text.length, visible - consumed));
        consumed += segment.text.length;
        return <span key={index} style={{color: segment.color ?? "#cdd6d2"}}>{segment.text.slice(0, amount)}</span>;
      })}
    </>
  );
};

const TrafficLights = () => (
  <div style={{display: "flex", gap: 9}}>
    {["#ff5f57", "#febc2e", "#28c840"].map((color) => <span key={color} style={{width: 12, height: 12, borderRadius: "50%", background: color}} />)}
  </div>
);

const AgentPanel = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{width: 555, height: "100%", background: PANEL, borderRight: `1px solid ${LINE}`, position: "relative", overflow: "hidden"}}>
      <div style={{height: 54, display: "flex", alignItems: "center", padding: "0 18px", borderBottom: `1px solid ${LINE}`}}>
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <span style={{width: 25, height: 25, borderRadius: 7, background: TEAL, display: "grid", placeItems: "center"}}>
            <Img src={staticFile("agentsky-mark.png")} style={{width: 17, height: 17, objectFit: "contain", filter: "brightness(0) invert(1)"}} />
          </span>
          <span style={{color: TEXT, fontSize: 14, fontWeight: 700}}>AgentSky Builder</span>
        </div>
        <span style={{marginLeft: "auto", color: MUTED, fontSize: 11, letterSpacing: 1}}>CLOUD AGENT</span>
      </div>

      <div style={{padding: "24px 24px 110px", fontFamily: UI}}>
        <div style={{fontSize: 12, color: MUTED, marginBottom: 9}}>Build request</div>
        <div style={{padding: "16px 17px", borderRadius: 10, background: "#2a2f2d", border: `1px solid ${LINE}`, color: "#dce2df", fontSize: 14, lineHeight: 1.5}}>
          Create an omnichannel agent with Hermes, GPT-5.6 Sol, infinite memory, Slack, iMessage and browser tools.
        </div>

        <div style={{display: "flex", alignItems: "center", gap: 10, marginTop: 22}}>
          <span style={{width: 22, height: 22, borderRadius: 6, background: "rgba(22,131,243,.14)", color: TEAL, display: "grid", placeItems: "center", fontSize: 13}}>✦</span>
          <span style={{color: "#f2f4f3", fontSize: 15, fontWeight: 650}}>Building your agent</span>
          <span style={{marginLeft: "auto", color: TEAL, fontSize: 11}}>LIVE</span>
        </div>
        <div style={{marginTop: 11, color: "#a7afab", fontSize: 13, lineHeight: 1.5}}>
          I’ll configure the runtime, connect channels, add tools, and launch it as one persistent Agent ID.
        </div>

        <div style={{marginTop: 24, display: "grid", gap: 10}}>
          {tasks.map((task, index) => {
            const p = interpolate(frame, [task.at, task.at + 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
            const complete = frame >= task.at + 18;
            return (
              <div key={task.title} style={{height: 58, padding: "0 13px", display: "flex", alignItems: "center", border: `1px solid ${LINE}`, background: "rgba(255,255,255,.025)", borderRadius: 9, opacity: p, transform: `translateY(${(1 - p) * 9}px)`}}>
                <span style={{width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", border: `1px solid ${complete ? TEAL : "#58605c"}`, color: complete ? TEAL : "#7c8581", fontSize: 12}}>{complete ? "✓" : index + 1}</span>
                <span style={{marginLeft: 11}}>
                  <span style={{display: "block", color: "#dce2df", fontSize: 13, fontWeight: 620}}>{task.title}</span>
                  <span style={{display: "block", color: MUTED, fontFamily: MONO, fontSize: 10, marginTop: 3}}>{task.meta}</span>
                </span>
                {complete && <span style={{marginLeft: "auto", color: GREEN, fontSize: 10}}>DONE</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 66, borderTop: `1px solid ${LINE}`, background: "rgba(20,23,22,.96)", display: "flex", alignItems: "center", padding: "0 20px"}}>
        <span style={{width: 8, height: 8, borderRadius: "50%", background: frame >= 176 ? GREEN : TEAL, boxShadow: `0 0 12px ${frame >= 176 ? GREEN : TEAL}`}} />
        <span style={{marginLeft: 9, color: "#b8c0bc", fontSize: 12}}>{frame >= 176 ? "Agent live · sky_7f31" : "AgentSky is building…"}</span>
        <span style={{marginLeft: "auto", color: MUTED, fontFamily: MONO, fontSize: 10}}>Auto</span>
      </div>
    </div>
  );
};

const TerminalPane = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [88, 98], [1, 0], clamp);
  return (
    <div style={{position: "absolute", inset: 0, background: PANEL_3, opacity, padding: "30px 34px", boxSizing: "border-box", fontFamily: MONO, fontSize: 14, lineHeight: 1.75}}>
      <div style={{color: "#65706b", marginBottom: 16}}>~/agentsky/omnichannel-agent <span style={{color: "#42534d"}}>main</span></div>
      {terminalLines.map((line) => {
        const p = interpolate(frame, [line.at, line.at + 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const typed = line.text.startsWith("$")
          ? line.text.slice(0, Math.floor(interpolate(frame, [line.at, line.at + 18], [0, line.text.length], clamp)))
          : line.text;
        return <div key={line.text} style={{color: line.color, opacity: p, transform: `translateY(${(1 - p) * 5}px)`, whiteSpace: "pre"}}>{typed}</div>;
      })}
      <div style={{display: "inline-block", width: 8, height: 17, marginTop: 3, background: "#dce5e1", opacity: frame % 12 < 6 ? 1 : 0}} />
    </div>
  );
};

const EditorPane = () => {
  const frame = useCurrentFrame();
  const editorP = interpolate(frame, [92, 103], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const washHeight = interpolate(frame, [92, 112], [0, 770], {...clamp, easing: Easing.out(Easing.cubic)});
  const typingFollow = interpolate(frame, [101, 163], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });
  const scrollY = -360 * typingFollow;

  return (
    <div style={{position: "absolute", inset: 0, display: "flex", background: PANEL_3, opacity: editorP}}>
      <div style={{width: 210, borderRight: `1px solid ${LINE}`, padding: "16px 12px", boxSizing: "border-box", color: "#9aa39f", fontFamily: UI, fontSize: 11}}>
        <div style={{fontSize: 10, letterSpacing: 1.4, color: "#66706b", margin: "2px 8px 14px"}}>EXPLORER</div>
        {["⌄ omnichannel-agent", "  ⌄ src", "    ◇ agent.config.ts", "    ◇ channels.ts", "    ◇ tools.ts", "    ◇ deploy.ts", "  ◇ package.json", "  ◇ README.md"].map((item, index) => {
          const p = interpolate(frame, [96 + index * 3, 103 + index * 3], [0, 1], clamp);
          const selected = item.includes("agent.config");
          return <div key={item} style={{height: 26, display: "flex", alignItems: "center", padding: "0 8px", borderRadius: 5, opacity: p, background: selected ? "rgba(22,131,243,.12)" : "transparent", color: selected ? "#cfe9e4" : "#8d9692", whiteSpace: "pre"}}>{item}</div>;
        })}
      </div>

      <div style={{flex: 1, position: "relative", overflow: "hidden"}}>
        <div style={{height: 40, display: "flex", alignItems: "center", borderBottom: `1px solid ${LINE}`, fontFamily: UI, fontSize: 11}}>
          <span style={{height: 40, padding: "0 18px", display: "flex", alignItems: "center", color: "#dce5e1", borderRight: `1px solid ${LINE}`, borderTop: `2px solid ${TEAL}`}}>agent.config.ts</span>
          <span style={{height: 40, padding: "0 18px", display: "flex", alignItems: "center", color: "#717a76", borderRight: `1px solid ${LINE}`}}>deploy.ts</span>
        </div>
        <div style={{position: "absolute", left: 0, top: 40, right: 0, height: washHeight, background: "rgba(10,139,99,.24)", borderTop: "1px solid rgba(22,131,243,.42)"}} />
        <div style={{position: "absolute", left: 0, top: 40, right: 0, bottom: 0, padding: "18px 0", boxSizing: "border-box", overflow: "hidden"}}>
          <div style={{transform: `translate3d(0, ${scrollY}px, 0)`, willChange: "transform"}}>
            {codeLines.map((line, index) => (
              <div key={index} style={{height: 27, display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 15.5, lineHeight: "27px", whiteSpace: "pre"}}>
                <span style={{width: 48, paddingRight: 13, boxSizing: "border-box", color: "#3f4a46", textAlign: "right", userSelect: "none"}}>{index + 1}</span>
                <span><TypeSegments segments={line.segments} start={line.start} /></span>
              </div>
            ))}
          </div>
          {frame < 166 && <span style={{position: "absolute", left: 57, top: 18 + Math.max(0, codeLines.reduce((active, line, index) => frame >= line.start ? index : active, 0)) * 27 + scrollY, width: 2, height: 18, background: "#e8f1ed", opacity: frame % 10 < 7 ? 1 : 0}} />}
        </div>
      </div>
    </div>
  );
};

const Workspace = () => {
  const frame = useCurrentFrame();
  const done = interpolate(frame, [176, 186], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{flex: 1, height: "100%", position: "relative", background: PANEL_3}}>
      <div style={{height: 54, display: "flex", alignItems: "center", padding: "0 18px", borderBottom: `1px solid ${LINE}`, background: PANEL_2, boxSizing: "border-box"}}>
        <span style={{color: "#909995", fontFamily: MONO, fontSize: 11}}>omnichannel-agent</span>
        <div style={{marginLeft: "auto", display: "flex", gap: 9}}>
          {["—", "□", "×"].map((item) => <span key={item} style={{color: "#65706b", width: 19, textAlign: "center", fontSize: 11}}>{item}</span>)}
        </div>
      </div>
      <div style={{position: "absolute", left: 0, top: 54, right: 0, bottom: 0}}>
        <TerminalPane />
        <EditorPane />
      </div>

      <div style={{position: "absolute", left: "50%", bottom: 24, transform: "translateX(-50%)", height: 44, minWidth: 365, padding: "0 9px", borderRadius: 12, background: "rgba(14,16,15,.95)", border: "1px solid rgba(255,255,255,.18)", display: "flex", alignItems: "center", color: "#cfd6d2", fontFamily: UI, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,.24)"}}>
        <span style={{width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center", background: "rgba(255,255,255,.06)", color: "#8c9691"}}>⌘</span>
        <span style={{marginLeft: 8, height: 28, padding: "0 12px", borderRadius: 7, background: "rgba(22,131,243,.16)", color: TEAL, display: "flex", alignItems: "center", gap: 6}}>✦ Flow</span>
        <span style={{width: 1, height: 22, background: LINE, margin: "0 10px"}} />
        <span style={{color: frame >= 176 ? GREEN : "#cdd5d1"}}>{frame < 92 ? "▣ Terminal" : frame >= 176 ? "✓ Agent live" : "▤ Editor"}</span>
        <span style={{marginLeft: 10, color: "#7d8782"}}>{frame >= 176 ? "ready everywhere" : "Agent is coding"}</span>
        <span style={{marginLeft: "auto", width: 16, height: 16, borderRadius: "50%", border: `2px solid ${frame >= 176 ? GREEN : "#64706a"}`, borderTopColor: frame >= 176 ? GREEN : TEAL, transform: `rotate(${frame * 9}deg)`, opacity: 1 - done * 0.2}} />
      </div>
    </div>
  );
};

export type AgentSkyCodeBuildSceneProps = {
  transparent?: boolean;
  immediateVisible?: boolean;
};

export const AgentSkyCodeBuildScene = ({transparent = false, immediateVisible = false}: AgentSkyCodeBuildSceneProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const settle = spring({frame, fps, config: {damping: 18, stiffness: 100, mass: 0.8}});
  const establish = interpolate(frame, [0, 12], [immediateVisible ? 1.08 : 1.48, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const driftScale = interpolate(frame, [24, 194], [1, 1.018], clamp);
  const y = interpolate(settle, [0, 1], [24, 0]);
  const opacity = immediateVisible ? 1 : interpolate(frame, [0, 6], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: transparent ? "transparent" : BG, fontFamily: UI, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 190, top: 92, width: 1540, height: 896, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(15,21,19,.18)", background: PANEL_3, boxShadow: "0 34px 90px rgba(20,34,29,.16)", opacity, transformOrigin: "220px 420px", transform: `translateY(${y}px) scale(${establish * driftScale})`}}>
        <div style={{height: 50, background: "#292d2b", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 18px", boxSizing: "border-box"}}>
          <TrafficLights />
          <span style={{marginLeft: 18, color: "#8c9591", fontSize: 11}}>AGENTSKY STUDIO</span>
          <span style={{position: "absolute", left: "50%", transform: "translateX(-50%)", color: "#707975", fontFamily: MONO, fontSize: 10}}>sky://omnichannel-agent</span>
        </div>
        <div style={{height: 846, display: "flex"}}>
          <AgentPanel />
          <Workspace />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const AGENT_SKY_CODE_BUILD_DURATION = 195;
const AGENT_SKY_CODE_BUILD_BASE_END =
  AGENT_DEPLOY_INTRO_DURATION +
  AGENT_SKY_CODE_BUILD_DURATION -
  AGENT_DEPLOY_CODE_OVERLAP +
  AGENT_SKY_RED_DOT_RADIANCE_DURATION +
  AGENT_SKY_BLACK_SQUARE_FILL_DURATION;

export const AGENT_SKY_CODE_BUILD_WITH_INTRO_DURATION =
  AGENT_SKY_CODE_BUILD_BASE_END +
  AGENT_SKY_RED_SQUARE_TEXTURE_GAP +
  AGENT_SKY_RED_SQUARE_TEXTURE_DURATION +
  AGENT_SKY_RED_DASHED_GRID_DURATION;

export const AgentSkyCodeBuildTransparent = () => (
  <AbsoluteFill style={{background: "transparent"}}>
    <Sequence
      from={AGENT_DEPLOY_INTRO_DURATION - AGENT_DEPLOY_CODE_OVERLAP}
      durationInFrames={AGENT_SKY_CODE_BUILD_DURATION}
      premountFor={30}
    >
      <AgentSkyCodeBuildScene transparent immediateVisible />
    </Sequence>
    <Sequence durationInFrames={AGENT_DEPLOY_INTRO_DURATION} premountFor={30}>
      <AgentSkyAgentDeployIntroScene />
    </Sequence>
    <Sequence
      from={AGENT_DEPLOY_INTRO_DURATION + AGENT_SKY_CODE_BUILD_DURATION - AGENT_DEPLOY_CODE_OVERLAP}
      durationInFrames={AGENT_SKY_RED_DOT_RADIANCE_DURATION}
      premountFor={30}
    >
      <AgentSkyRedDotRadianceScene />
    </Sequence>
    <Sequence
      from={
        AGENT_DEPLOY_INTRO_DURATION +
        AGENT_SKY_CODE_BUILD_DURATION -
        AGENT_DEPLOY_CODE_OVERLAP +
        AGENT_SKY_RED_DOT_RADIANCE_DURATION
      }
      durationInFrames={AGENT_SKY_BLACK_SQUARE_FILL_DURATION}
      premountFor={30}
    >
      <AgentSkyBlackSquareFillScene />
    </Sequence>
    <Sequence
      from={AGENT_SKY_CODE_BUILD_BASE_END + AGENT_SKY_RED_SQUARE_TEXTURE_GAP}
      durationInFrames={AGENT_SKY_RED_SQUARE_TEXTURE_DURATION}
      premountFor={30}
    >
      <AgentSkyRedSquareTextureScene />
    </Sequence>
    <Sequence
      from={
        AGENT_SKY_CODE_BUILD_BASE_END +
        AGENT_SKY_RED_SQUARE_TEXTURE_GAP +
        AGENT_SKY_RED_SQUARE_TEXTURE_DURATION
      }
      durationInFrames={AGENT_SKY_RED_DASHED_GRID_DURATION}
      premountFor={30}
    >
      <AgentSkyRedDashedGridScene />
    </Sequence>
  </AbsoluteFill>
);
