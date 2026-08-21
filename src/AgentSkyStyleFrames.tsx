import React from "react";
import {AbsoluteFill, Img, staticFile} from "remotion";

const BOARD_W = 2200;
const BOARD_H = 1560;

/** Live agentsky.dev tokens (ts/apps/asteroids/src/app/globals.css). */
const C = {
  canvas: "#f7f7f8",
  panel: "#ffffff",
  ink: "#0d0d0d",
  muted: "#5d5d5d",
  faint: "#7a7a7a",
  line: "#ececec",
  lineStrong: "#e5e5e5",
  surface: "#f1f1f2",
  brand: "#1683f3",
  brandDeep: "#075eb8",
};

const FONT = '"AgentSky Space Grotesk", "Space Grotesk", "Segoe UI", Arial, sans-serif';
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

type Frame = {
  no: string;
  tc: string;
  title: string;
  vo: string;
  note: string;
  image: string;
  /** How much of the source screenshot to show, and from where. */
  fit?: {scale: number; x: string; y: string};
  tag: "复用" | "改造" | "新建";
};

const FRAMES: Frame[] = [
  {
    no: "01",
    tc: "00:00 — 00:18",
    title: "One API, any agent.",
    vo: "“We are the OpenRouter for agents.”",
    note: "八个 agent 名逐个飞入排成一列，底部常驻 POST /api/v1/agents，agent 值跟着念到的名字换。",
    image: "shots/home.png",
    fit: {scale: 1.18, x: "2%", y: "26%"},
    tag: "改造",
  },
  {
    no: "02",
    tc: "00:18 — 00:36",
    title: "一个，或者一千个。",
    vo: "“One for yourself, or thousands for your software factory.”",
    note: "key → agent × model 两个旋钮 → “boom” 白闪实体化 → 一张卡复制成 1,000 张铺满画面。",
    image: "shots/software-factories.png",
    fit: {scale: 1.28, x: "58%", y: "34%"},
    tag: "改造",
  },
  {
    no: "03",
    tc: "00:36 — 00:57",
    title: "Add-ons 就是多几个参数。",
    vo: "“…by choosing additional parameters in the API.”",
    note: "主体是一段活的 JSON：tools / channels 数组随旁白逐行长出来，右侧同步浮出图标。",
    image: "shots/developers.png",
    fit: {scale: 1.22, x: "78%", y: "30%"},
    tag: "复用",
  },
  {
    no: "04",
    tc: "00:57 — 01:26",
    title: "Agent Playground",
    vo: "“Is DeepSeek's new agent better than Claude Code?”",
    note: "全片新核心，已渲染。同一条 issue 双泳道并跑，收在 time / cost / review score 三组对比上。",
    image: "frames/pg-855.png",
    tag: "新建",
  },
  {
    no: "05",
    tc: "01:26 — 01:33",
    title: "agentsky.dev",
    vo: "“Go to agentsky.dev and access any popular agent that you want.”",
    note: "记分牌收缩成方块 → 最窄一帧换成官方 mark → 展开 wordmark，域名逐字母落定。",
    image: "shots/home.png",
    fit: {scale: 1.9, x: "7%", y: "62%"},
    tag: "复用",
  },
];

const TAG_STYLE: Record<Frame["tag"], React.CSSProperties> = {
  复用: {color: C.brandDeep, background: "#e4f0fe", borderColor: C.brand},
  改造: {color: "#8a5a00", background: "#fdf1dc", borderColor: "#d9a334"},
  新建: {color: "#0d0d0d", background: "#e9e9ea", borderColor: "#b9b9bb"},
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

const BrowserFrame: React.FC<{frame: Frame}> = ({frame}) => (
  <div
    style={{
      height: 372,
      borderRadius: 12,
      border: `1px solid ${C.lineStrong}`,
      background: C.panel,
      overflow: "hidden",
      boxShadow: "0 14px 34px rgba(13,13,13,.09)",
    }}
  >
    <div
      style={{
        height: 34,
        background: C.surface,
        borderBottom: `1px solid ${C.line}`,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "0 14px",
      }}
    >
      {[0, 1, 2].map((dot) => (
        <div
          key={dot}
          style={{width: 8, height: 8, borderRadius: "50%", background: "#d3d3d5"}}
        />
      ))}
    </div>
    <div style={{position: "relative", height: 338, overflow: "hidden"}}>
      <Img
        src={staticFile(frame.image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: frame.fit ? `${frame.fit.x} ${frame.fit.y}` : "center top",
          transform: `scale(${frame.fit?.scale ?? 1})`,
        }}
      />
    </div>
  </div>
);

const FrameTile: React.FC<{frame: Frame}> = ({frame}) => (
  <div style={{display: "flex", flexDirection: "column", gap: 16}}>
    <BrowserFrame frame={frame} />
    <div style={{display: "flex", alignItems: "center", gap: 12}}>
      <span style={{fontFamily: MONO, fontSize: 15, letterSpacing: 2, color: C.brand}}>
        {frame.no}
      </span>
      <span style={{fontFamily: MONO, fontSize: 15, color: C.faint, letterSpacing: 1}}>
        {frame.tc}
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: 1.5,
          padding: "4px 11px",
          borderRadius: 999,
          border: "1px solid",
          ...TAG_STYLE[frame.tag],
        }}
      >
        {frame.tag}
      </span>
    </div>
    <div
      style={{
        fontFamily: FONT,
        fontSize: 31,
        fontWeight: 700,
        color: C.ink,
        letterSpacing: -0.6,
        lineHeight: 1.16,
      }}
    >
      {frame.title}
    </div>
    <div
      style={{
        fontSize: 18,
        lineHeight: 1.45,
        color: C.brandDeep,
        borderLeft: `2px solid ${C.brand}`,
        paddingLeft: 13,
      }}
    >
      {frame.vo}
    </div>
    <div style={{fontSize: 17.5, lineHeight: 1.55, color: C.muted}}>{frame.note}</div>
  </div>
);

const SwatchRow: React.FC<{items: {name: string; value: string}[]}> = ({items}) => (
  <div style={{display: "flex", gap: 10}}>
    {items.map((item) => (
      <div key={item.name} style={{flex: 1}}>
        <div
          style={{
            height: 52,
            borderRadius: 8,
            background: item.value,
            border: `1px solid ${C.lineStrong}`,
          }}
        />
        <div style={{fontFamily: MONO, fontSize: 12.5, color: C.faint, marginTop: 7}}>
          {item.value}
        </div>
      </div>
    ))}
  </div>
);

const SystemTile: React.FC = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 18,
      padding: 26,
      borderRadius: 12,
      background: C.panel,
      border: `1px solid ${C.lineStrong}`,
      boxShadow: "0 14px 34px rgba(13,13,13,.06)",
    }}
  >
    <div style={{fontFamily: MONO, fontSize: 14, letterSpacing: 3, color: C.faint}}>
      系统 &mdash; 取自线上 globals.css，不再自定义
    </div>

    <SwatchRow
      items={[
        {name: "brand", value: "#1683f3"},
        {name: "brand-deep", value: "#075eb8"},
        {name: "ink", value: "#0d0d0d"},
        {name: "surface", value: "#f1f1f2"},
        {name: "canvas", value: "#f7f7f8"},
      ]}
    />

    <div style={{borderTop: `1px solid ${C.line}`, paddingTop: 16}}>
      <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 700, color: C.ink, letterSpacing: -1}}>
        Display 76 / 40
      </div>
      <div style={{fontSize: 19, color: C.muted, marginTop: 6}}>Lede 19 &mdash; 正文与旁白字幕</div>
      <div style={{fontFamily: MONO, fontSize: 15, color: C.faint, marginTop: 6, letterSpacing: 2}}>
        MONO 15 &mdash; 时间码 / 步骤标签 / 代码
      </div>
    </div>

    <div style={{borderTop: `1px solid ${C.line}`, paddingTop: 16, display: "flex", gap: 14}}>
      {["icons/deepseek.svg", "icons/claude-ai-symbol.svg", "icons/codex-agent.svg", "icons/openclaw.svg", "harnesses/pi.svg", "harnesses/opencode.svg", "harnesses/kimi.svg", "icons/github.svg"].map(
        (icon) => (
          <Img
            key={icon}
            src={staticFile(icon)}
            style={{width: 38, height: 38, objectFit: "contain"}}
          />
        ),
      )}
    </div>
    <div style={{fontSize: 17, color: C.muted, lineHeight: 1.5}}>
      八个 agent 图标直接取自 asteroids 仓库的 <span style={{fontFamily: MONO, fontSize: 15}}>public/icons</span> 与{" "}
      <span style={{fontFamily: MONO, fontSize: 15}}>public/harnesses</span>，和线上完全同源。
    </div>
  </div>
);

export const AgentSkyStyleFrames: React.FC = () => (
  <AbsoluteFill style={{background: C.canvas, fontFamily: FONT, color: C.ink}}>
    <Fonts />
    <div style={{padding: "56px 80px 80px"}}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: `2px solid ${C.ink}`,
          paddingBottom: 22,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 20}}>
          <Img src={staticFile("agentsky-mark.png")} style={{width: 54, height: 54, objectFit: "contain"}} />
          <div>
            <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: 4, color: C.faint}}>
              AGENTSKY &middot; LAUNCH FILM V2 &middot; STYLE FRAMES
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 52,
                fontWeight: 700,
                letterSpacing: -1.4,
                marginTop: 6,
              }}
            >
              一条 API，所有 agent &mdash; 效果图
            </div>
          </div>
        </div>
        <div style={{textAlign: "right", fontFamily: MONO, fontSize: 16, color: C.muted, lineHeight: 1.9}}>
          <div>92.6s &middot; 1920×1080 &middot; 30fps</div>
          <div>素材 6 条，2026-08-20 录</div>
          <div style={{color: C.brand}}>产品截图取自 agentsky.dev 实时页面</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: 40,
          rowGap: 46,
        }}
      >
        {FRAMES.map((frame) => (
          <FrameTile key={frame.no} frame={frame} />
        ))}
        <SystemTile />
      </div>
    </div>
  </AbsoluteFill>
);

export const AGENT_SKY_STYLE_FRAMES_SIZE = {width: BOARD_W, height: BOARD_H};
