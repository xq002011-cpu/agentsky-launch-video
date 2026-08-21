/**
 * AgentSkyIntroApi — Intro / One-API block of the AgentSky launch video.
 *
 * Audio: vo3/184040-v3.m4a (16.15s — 4 pause cuts + atempo 1.05)
 *        vo3/182749-sentence-v3.m4a (3.24s factory sentence)
 * Video: 184040.mp4 segmented at cutmap boundaries, playbackRate=1.05
 *        Jump-cut at frame 26 covered by wide→tight punch-in (scale 1.0→1.06)
 *
 * Timeline (30fps, 581 frames ≈ 19.4s):
 *   0–484f   : 184040 camera + v3 audio, segmented at cutmap
 *   175–452f : One API diagram cutaway (5.84–15.08s in v3 audio)
 *   452f     : AGENTSKY wordmark reveal ("cloud." e=15.08s, arms-wide anchor)
 *   484–581f : One→Thousands + 182749-sentence-v3 audio (factory)
 *
 * Word anchors from 184040-v3-words.json and 182749-sentence-v3-words.json.
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Audio} from "@remotion/media";

// ─── Frame constants (derived from v3 word JSON + cutmap) ─────────────────────

const FPS = 30;

// 184040-v3.m4a total = 16.147s → 484 frames
// "cloud." ends at 15.080s → REVEAL_F (arms-wide anchor)
const DIAGRAM_IN  = Math.round(5.840 * FPS);  // 175 — "With" (v3 words)
const REVEAL_F    = Math.round(15.080 * FPS); // 452 — "cloud." end / brand reveal
const DIAGRAM_OUT = REVEAL_F;                  // 452 — diagram exits as camera returns
const DIAGRAM_DUR = DIAGRAM_OUT - DIAGRAM_IN; // 277
const FACTORY_F   = Math.round(16.147 * FPS); // 484 — 184040-v3 ends
const FACTORY_DUR = Math.round(3.242 * FPS);  // 97  — 182749-sentence-v3 duration

export const AGENT_SKY_INTRO_API_DURATION = FACTORY_F + FACTORY_DUR; // 581

// Row/chip light-up — composition frames from 184040-v3-words.json
const RF = {
  claudeCode: Math.round(8.540  * FPS), // 256 — "cloud code"
  codex:      Math.round(9.220  * FPS), // 277 — "codex,"
  hermes:     Math.round(9.760  * FPS), // 293 — "Hermes,"
  dsHarness:  Math.round(10.420 * FPS), // 313 — "DeepSea"
  openCode:   Math.round(11.780 * FPS), // 354 — "OpenCode,"
  pi:         Math.round(12.360 * FPS), // 371 — "Pi,"
} as const;
const OPENCODE_ROW_F = Math.round(13.540 * FPS); // 406 — "OpenCode" row anchor (v3 source)

// Video cutmap segments — from 184040-v3-cutmap.json
// outF = comp frame start; durF = comp frame count; srcF = source frames to skip
// scale: seg 0 = wide (1.0), segs 1+ = tight (1.06) for punch-in cover
const VIDEO_SEGS = [
  { outF: 0,   durF: 26,  srcF: 0,   scale: 1.00 as const },
  { outF: 26,  durF: 146, srcF: 46,  scale: 1.06 as const },
  { outF: 172, durF: 37,  srcF: 207, scale: 1.06 as const },
  { outF: 210, durF: 123, srcF: 252, scale: 1.06 as const },
  { outF: 333, durF: 151, srcF: 387, scale: 1.06 as const },
];

// ─── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  canvas:    "#f7f7f8",
  panel:     "#ffffff",
  surface:   "#f1f1f2",
  ink:       "#0d0d0d",
  secondary: "#3d3d3d",
  muted:     "#5d5d5d",
  faint:     "#7a7a7a",
  brand:     "#1683f3",
  border:    "#ececec",
} as const;

const FONT_MKT  = '"AgentSky Space Grotesk", "Space Grotesk", Arial, sans-serif';
const FONT_UI   = '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
const FONT_MONO = '"Geist Mono", "SF Mono", Consolas, monospace';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const clamp01 = (
  frame: number,
  a: number,
  b: number,
  easing: (x: number) => number = easeOut,
): number =>
  interpolate(frame, [a, b], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ─── Font loader ──────────────────────────────────────────────────────────────

const Fonts: React.FC = () => (
  <style>{`
    @font-face {
      font-family: 'AgentSky Space Grotesk';
      src: url('${staticFile("SpaceGrotesk-Bold.ttf")}') format('truetype');
      font-weight: 700;
      font-display: block;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('${staticFile("fonts/PlusJakartaSans-SemiBold.ttf")}') format('truetype');
      font-weight: 600;
      font-display: block;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('${staticFile("fonts/PlusJakartaSans-Regular.ttf")}') format('truetype');
      font-weight: 400;
      font-display: block;
    }
    @font-face {
      font-family: 'Geist Mono';
      src: url('${staticFile("fonts/GeistMono-Regular.woff2")}') format('woff2');
      font-weight: 400;
      font-display: block;
    }
  `}</style>
);

// ─── Camera segments — jump-cut + punch-in (wide→tight at frame 26) ───────────

const CameraSegments: React.FC = () => (
  <>
    {VIDEO_SEGS.map((seg, i) => (
      <Sequence key={i} from={seg.outF} durationInFrames={seg.durF}>
        <OffthreadVideo
          muted
          src={staticFile("takes/184040.mp4")}
          startFrom={seg.srcF}
          playbackRate={1.05}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${seg.scale})`,
            transformOrigin: "center center",
          }}
        />
      </Sequence>
    ))}
  </>
);

// ─── Captions ─────────────────────────────────────────────────────────────────

interface Phrase { s: number; e: number; t: string; }

const CAPTIONS: Phrase[] = [
  {s:   0, e:  50, t: "Hi, this is Xiaoyin,"},
  {s:  55, e:  96, t: "founder of AgentSky."},
  {s: 104, e: 169, t: "We are the OpenRouter for agents."},
  {s: 175, e: 211, t: "With one simple API,"},
  {s: 211, e: 256, t: "you will instantly get access to"},
  {s: 256, e: 272, t: "Claude Code,"},
  {s: 277, e: 289, t: "Codex,"},
  {s: 293, e: 308, t: "Hermes,"},
  {s: 313, e: 331, t: "DeepSeek Harness,"},
  {s: 336, e: 348, t: "Grok,"},
  {s: 353, e: 368, t: "OpenCode,"},
  {s: 371, e: 376, t: "Pi,"},
  {s: 382, e: 418, t: "and all the popular agents"},
  {s: 418, e: 452, t: "in the cloud."},
  // Factory sentence (182749-sentence-v3, offset FACTORY_F=484)
  {s: 484, e: 524, t: "You can either have one for yourself"},
  {s: 524, e: 549, t: "or thousands"},
  {s: 549, e: 578, t: "for your software factory."},
];

const getCaption = (frame: number): string =>
  CAPTIONS.find((ph) => frame >= ph.s && frame < ph.e)?.t ?? "";

const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const text = getCaption(frame);
  if (!text) return null;
  return (
    <AbsoluteFill style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 72, pointerEvents: "none"}}>
      <div style={{
        background: "rgba(13,13,13,.86)", borderRadius: 999, padding: "16px 48px",
        maxWidth: "88%", textAlign: "center",
        fontFamily: FONT_MKT, fontSize: 40, fontWeight: 700, color: "#ffffff", lineHeight: 1.35,
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ─── One API Diagram ──────────────────────────────────────────────────────────

interface RowDef {
  agent: string; agentIcon: string | null;
  model: string; modelIcon: string;
  lightF: number; // LOCAL frame within DIAGRAM sequence
}
interface ChipDef { label: string; icon: string; lightF: number; }

const ROWS: RowDef[] = [
  { agent: "Claude Code", agentIcon: "icons/claude-ai-symbol.svg",
    model: "claude-fable-5",  modelIcon: "icons/claude-ai-symbol.svg",
    lightF: RF.claudeCode - DIAGRAM_IN },  // 81
  { agent: "Codex",       agentIcon: "icons/codex-agent.svg",
    model: "gpt-5.6-sol",     modelIcon: "icons/openai.svg",
    lightF: RF.codex - DIAGRAM_IN },       // 102
  { agent: "Hermes",      agentIcon: "hermes-official.svg",
    model: "deepseek-v4-pro", modelIcon: "icons/deepseek.svg",
    lightF: RF.hermes - DIAGRAM_IN },      // 118
  { agent: "opencode",    agentIcon: "harnesses/opencode.svg",
    model: "gpt-5.6-sol",     modelIcon: "icons/openai.svg",
    lightF: OPENCODE_ROW_F - DIAGRAM_IN }, // 231
];

const CHIPS: ChipDef[] = [
  { label: "DeepSeek Harness", icon: "icons/deepseek.svg",    lightF: RF.dsHarness - DIAGRAM_IN }, // 138
  { label: "pi",               icon: "harnesses/pi.svg",       lightF: RF.pi       - DIAGRAM_IN }, // 196
];

const IconImg: React.FC<{src: string; size?: number}> = ({src, size = 24}) => (
  <img src={staticFile(src)} alt=""
    style={{width: size, height: size, objectFit: "contain", flexShrink: 0, display: "block"}} />
);

const SVG_ROW_Y = [70, 170, 270, 370] as const;

const ApiDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn  = clamp01(frame, 0, 14);
  const fadeOut = clamp01(frame, DIAGRAM_DUR - 12, DIAGRAM_DUR);
  const opacity = fadeIn * (1 - fadeOut);

  const rowSpring = (lightF: number): number => {
    if (frame < lightF) return 0;
    return spring({frame: frame - lightF, fps, config: {stiffness: 380, damping: 26}});
  };

  return (
    <AbsoluteFill style={{background: C.panel, opacity, alignItems: "center", justifyContent: "center"}}>
      <div style={{display: "flex", alignItems: "center", width: 1800, gap: 0}}>

        {/* Left card */}
        <div style={{
          flexShrink: 0, width: 520, padding: "56px 52px",
          background: C.panel, border: `2.5px solid ${C.brand}`, borderRadius: 20,
          alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <div style={{fontFamily: FONT_MKT, fontSize: 96, fontWeight: 700, color: C.brand,
            letterSpacing: "-0.025em", lineHeight: 1}}>ONE API</div>
          <div style={{fontFamily: FONT_UI, fontSize: 24, fontWeight: 600, color: C.muted,
            marginTop: 20, lineHeight: 1.5}}>
            You pick the agent<br />+ the model.
          </div>
        </div>

        {/* SVG connectors */}
        <svg width={200} height={440} viewBox="0 0 200 440" style={{flexShrink: 0, overflow: "visible"}}>
          {ROWS.map((row, i) => {
            const isLit  = frame >= row.lightF;
            const connOp = isLit ? 1 : clamp01(frame, row.lightF - 12, row.lightF);
            return (
              <path key={i}
                d={`M 0 220 Q 100 220, 200 ${SVG_ROW_Y[i]}`}
                stroke={isLit ? C.brand : C.border}
                strokeWidth={4} fill="none" strokeDasharray="6 5"
                opacity={connOp * opacity} />
            );
          })}
        </svg>

        {/* Right panel: rows + chips */}
        <div style={{flex: 1, display: "flex", flexDirection: "column", gap: 20}}>
          {ROWS.map((row, i) => {
            const sp     = rowSpring(row.lightF);
            const baseOp = clamp01(frame, 4, 18) * 0.30; // pending rows faintly visible
            const rowOp  = Math.max(baseOp, sp);
            const isLit  = frame >= row.lightF;

            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, height: 80,
                padding: "0 24px", borderRadius: 12,
                background: isLit ? C.surface : C.canvas,
                border: `2px solid ${isLit ? C.brand : C.border}`,
                opacity: rowOp,
                transform: `translateX(${(1 - clamp01(frame, row.lightF - 8, row.lightF)) * 24}px)`,
                boxShadow: isLit ? "0 2px 12px rgba(22,131,243,.12)" : "none",
              }}>
                {row.agentIcon && <IconImg src={row.agentIcon} size={24} />}
                <span style={{fontFamily: FONT_UI, fontSize: 28, fontWeight: 600,
                  color: isLit ? C.ink : C.secondary, letterSpacing: "-0.01em", whiteSpace: "nowrap"}}>
                  {row.agent}
                </span>
                <span style={{fontFamily: FONT_UI, fontSize: 24, fontWeight: 400,
                  color: C.faint, margin: "0 4px"}}>+</span>
                <IconImg src={row.modelIcon} size={24} />
                <span style={{fontFamily: FONT_MONO, fontSize: 22, fontWeight: 400,
                  color: isLit ? C.secondary : C.faint, whiteSpace: "nowrap"}}>
                  {row.model}
                </span>
                {isLit && (
                  <div style={{marginLeft: "auto", width: 10, height: 10, borderRadius: 999,
                    background: C.brand, flexShrink: 0,
                    opacity: 0.75 + Math.sin(frame * 0.25) * 0.25}} />
                )}
              </div>
            );
          })}

          {/* Chips */}
          <div style={{display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 4}}>
            {CHIPS.map((chip) => {
              const sp    = rowSpring(chip.lightF);
              const isLit = frame >= chip.lightF;
              if (sp <= 0.01) return null;
              return (
                <div key={chip.label} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 22px",
                  borderRadius: 999, background: C.panel,
                  border: `2px solid ${isLit ? C.brand : C.border}`,
                  fontFamily: FONT_UI, fontSize: 22, fontWeight: 600,
                  color: isLit ? C.ink : C.muted,
                  opacity: sp, transform: `scale(${0.92 + sp * 0.08})`,
                  whiteSpace: "nowrap",
                }}>
                  <IconImg src={chip.icon} size={20} />
                  {chip.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── AGENTSKY reveal (frame 452 — "cloud." end, arms-wide anchor) ─────────────

const AgentSkyReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < REVEAL_F) return null;

  const sp = spring({
    frame: frame - REVEAL_F, fps,
    config: {stiffness: 420, damping: 28},
    durationInFrames: 20,
  });
  const holdFade = frame >= FACTORY_F ? clamp01(frame, FACTORY_F, FACTORY_F + 8) : 0;
  const alpha    = sp * (1 - holdFade);

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", pointerEvents: "none"}}>
      <div style={{
        display: "flex", alignItems: "center", gap: 28,
        transform: `scale(${sp})`, opacity: alpha,
        filter: "drop-shadow(0 8px 40px rgba(0,0,0,.65))",
      }}>
        <img src={staticFile("agentsky-mark.svg")} alt="" style={{width: 140, height: 140, flexShrink: 0}} />
        <span style={{
          fontFamily: FONT_MKT, fontSize: 200, fontWeight: 700,
          color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1,
          textShadow: "0 6px 36px rgba(0,0,0,.60)",
        }}>
          AGENT<span style={{color: C.brand}}>SKY</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Software Factory — 1 → 1,000 multiplier ─────────────────────────────────
// Local frame 0 = FACTORY_F (484 comp).
// Phrase 1 "one for yourself"                (local 0-40):  one glowing card, center
// Phrase 2 "or thousands … software factory" (local 40-97): card multiplies outward
//           → full-screen mosaic of logo tiles, each "switching on" like a light

const C_GREEN  = "#22c55e";
const CARD_CODE_LINES = [
  "const agent = AgentSky.create();",
  "await agent.run('refactor auth');",
];

// Agent logo pool — varied, no Grok, NO hermes-official.svg
interface TileDef { icon: string | null; label: string | null; role: string }
const TILE_POOL: TileDef[] = [
  { icon: staticFile("icons/claude-ai-symbol.svg"), label: null,  role: "testing"   },
  { icon: staticFile("icons/codex-agent.svg"),      label: null,  role: "building"  },
  { icon: null,                                      label: "HRM", role: "writing"   },
  { icon: staticFile("icons/deepseek.svg"),          label: null,  role: "reviewing" },
  { icon: staticFile("harnesses/opencode.svg"),      label: null,  role: "deploying" },
  { icon: staticFile("harnesses/kimi.svg"),          label: null,  role: "designing" },
  { icon: staticFile("harnesses/goose.svg"),         label: null,  role: "fixing"    },
  { icon: staticFile("harnesses/cline.svg"),         label: null,  role: "shipping"  },
  { icon: staticFile("harnesses/qwen.svg"),          label: null,  role: "reviewing" },
  { icon: staticFile("icons/openclaw.svg"),          label: null,  role: "testing"   },
  { icon: staticFile("icons/pi.svg"),                label: null,  role: "deploying" },
  { icon: staticFile("harnesses/codebuddy.svg"),     label: null,  role: "building"  },
  { icon: staticFile("harnesses/iflow.svg"),         label: null,  role: "shipping"  },
];

const TILE_COLS = 28;
const TILE_ROWS = 16;
const TILE_CX   = TILE_COLS / 2 - 0.5;
const TILE_CY   = TILE_ROWS / 2 - 0.5;
const TILE_W    = 1920 / TILE_COLS;
const TILE_H    = 1080 / TILE_ROWS;
const TILE_GAP  = 6;
const TI_W      = TILE_W - TILE_GAP;
const TI_H      = TILE_H - TILE_GAP;

// ── Phrase 1: single glowing agent card ──────────────────────────────────────
const SingleCard: React.FC<{frame: number}> = ({frame}) => {
  const isDone = frame >= 28;
  const shim   = 0.6 + 0.4 * Math.sin(frame * 0.45);
  const op     = 1 * (1 - clamp01(frame, 38, 48));
  if (op < 0.01) return null;
  return (
    <AbsoluteFill style={{display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center"}}>
      <div style={{width:620,opacity:op}}>
        <div style={{
          background:"#0f1117", borderRadius:16, padding:"22px 28px",
          border:`1.5px solid ${isDone ? C_GREEN : "rgba(22,131,243,0.50)"}`,
          boxShadow: isDone ? "0 0 52px rgba(34,197,94,0.32)" : "0 0 44px rgba(22,131,243,0.24)",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
            <img src={staticFile("icons/claude-ai-symbol.svg")} alt=""
              style={{width:20,height:20,flexShrink:0}} />
            <span style={{fontFamily:FONT_UI,fontSize:15,fontWeight:600,color:"#b8c4d0"}}>
              Claude Code
            </span>
            {isDone
              ? <span style={{marginLeft:"auto",fontFamily:FONT_MONO,fontSize:14,
                  fontWeight:700,color:C_GREEN}}>✓ done</span>
              : <span style={{marginLeft:"auto",fontFamily:FONT_MONO,fontSize:12,
                  color:C.brand,opacity:shim}}>working…</span>}
          </div>
          {CARD_CODE_LINES.map((line,i) => (
            <div key={i} style={{fontFamily:FONT_MONO,fontSize:13,lineHeight:1.85,
              color:i===0?"#7ec8e3":"#6baf6b",
              opacity:clamp01(frame,i*9+3,i*9+12),whiteSpace:"nowrap"}}>
              {line}
            </div>
          ))}
          {isDone && (
            <div style={{fontFamily:FONT_MONO,fontSize:13,lineHeight:1.85,color:C_GREEN,
              opacity:clamp01(frame,30,38)}}>
              {"// PR ready · 312 lines changed"}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Phrase 2: tiles pop outward like lights switching on ──────────────────────
const LogoWall: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const PHASE = 40;
  if (frame < PHASE) return null;
  const refF = frame - PHASE;

  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < TILE_ROWS; r++) {
    for (let c = 0; c < TILE_COLS; c++) {
      const dist  = Math.hypot(c - TILE_CX, r - TILE_CY);
      const delay = Math.round(dist * 0.38); // stagger by ring distance
      const lf    = refF - delay;
      if (lf < 0) continue;

      // "Switch on" brightness pop: spring overshoots then settles
      const sp = spring({frame:lf,fps,config:{stiffness:1600,damping:22},durationInFrames:7});
      if (sp < 0.01) continue;
      // Brightness flash: briefly 1.6× bright at turn-on, settles to 1.0
      const brightPop = 1 + Math.max(0, 0.6 - lf * 0.18);

      // Pick tile logo by position
      const tileIdx = ((c * 5 + r * 11) % TILE_POOL.length + TILE_POOL.length) % TILE_POOL.length;
      const tile = TILE_POOL[tileIdx];

      // Subtle shimmer after on
      const shim = lf > 3 ? (0.75 + 0.25 * Math.sin(frame*0.18 + c*0.9 + r*1.2)) : 1;
      // Occasional green ✓ flash
      const flash = Math.sin(frame*0.28 + c*5.3 + r*3.7) > 0.87;

      tiles.push(
        <div key={`${r}-${c}`} style={{
          position:"absolute",
          left: c * TILE_W + TILE_GAP/2,
          top:  r * TILE_H + TILE_GAP/2,
          width:TI_W, height:TI_H,
          borderRadius:8,
          background: flash ? "rgba(34,197,94,0.12)" : "#0f1117",
          border:`1px solid ${flash ? C_GREEN : "rgba(22,131,243,0.20)"}`,
          opacity: sp,
          filter: `brightness(${brightPop * (flash ? 1.3 : shim)})`,
          display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:3,
        }}>
          {flash ? (
            <>
              <div style={{fontFamily:FONT_MONO,fontSize:11,fontWeight:700,color:C_GREEN}}>✓</div>
              <div style={{fontFamily:FONT_MONO,fontSize:7,color:C_GREEN,opacity:0.8}}>
                {(c+r)%2===0?"PR merged":"deployed"}
              </div>
            </>
          ) : (
            <>
              {tile.icon
                ? <img src={tile.icon} alt="" style={{width:14,height:14,opacity:0.85}} />
                : <div style={{fontFamily:FONT_MONO,fontSize:9,fontWeight:700,color:"#6b7a8e"}}>{tile.label}</div>}
              <div style={{fontFamily:FONT_MONO,fontSize:7,color:"#4a7a8a",opacity:0.9,
                letterSpacing:"0.01em"}}>
                {tile.role}
              </div>
            </>
          )}
        </div>
      );
    }
  }

  // Counter
  const ctP  = clamp01(frame, PHASE + 1, PHASE + 24);
  const ctV  = Math.round(80 + ctP * 920);
  const ctLbl = ctV >= 1000 ? "1,000+" : String(ctV);
  const ctOp  = clamp01(frame, PHASE, PHASE + 10);

  return (
    <AbsoluteFill style={{pointerEvents:"none"}}>
      <div style={{position:"absolute",top:0,left:0,width:1920,height:1080}}>{tiles}</div>
      <AbsoluteFill style={{display:"flex",flexDirection:"column",
        alignItems:"flex-end",justifyContent:"flex-start",padding:"32px 52px",pointerEvents:"none"}}>
        <div style={{opacity:ctOp,textAlign:"right"}}>
          <div style={{fontFamily:FONT_MKT,fontSize:72,fontWeight:700,color:"#ffffff",
            letterSpacing:"-0.02em",lineHeight:1.1,textShadow:"0 2px 24px rgba(0,0,0,0.9)"}}>
            {ctLbl}
          </div>
          <div style={{fontFamily:FONT_UI,fontSize:22,fontWeight:600,color:C_GREEN,marginTop:4}}>
            agents · shipping
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const OneToThousands: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background:C.ink}}>
      <SingleCard frame={frame} />
      <LogoWall frame={frame} />
    </AbsoluteFill>
  );
};


// ─── Main composition ─────────────────────────────────────────────────────────

const STAMP_FRAMES = [RF.claudeCode, RF.codex, RF.hermes, RF.dsHarness, RF.openCode, RF.pi, OPENCODE_ROW_F];

export const AgentSkyIntroApi: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Fonts />

    {/* Camera picture — 5 jump-cut segments, playbackRate=1.05 */}
    <Sequence from={0} durationInFrames={FACTORY_F}>
      <CameraSegments />
    </Sequence>

    {/* Camera audio — v3 (pause cuts + atempo 1.05 already applied) */}
    <Sequence from={0} durationInFrames={FACTORY_F}>
      <Audio src={staticFile("vo3/184040-v3.m4a")} volume={1} />
    </Sequence>

    {/* Factory audio — pre-trimmed 182749-sentence-v3 */}
    <Sequence from={FACTORY_F} durationInFrames={FACTORY_DUR}>
      <Audio src={staticFile("vo3/182749-sentence-v3.m4a")} volume={1} />
    </Sequence>

    {/* One API diagram cutaway */}
    <Sequence from={DIAGRAM_IN} durationInFrames={DIAGRAM_DUR}>
      <ApiDiagram />
    </Sequence>

    {/* AGENTSKY brand reveal */}
    <AgentSkyReveal />

    {/* One→Thousands animation */}
    <Sequence from={FACTORY_F} durationInFrames={FACTORY_DUR}>
      <OneToThousands />
    </Sequence>

    {/* SFX */}
    <Sequence from={DIAGRAM_IN} durationInFrames={12}>
      <Audio src={staticFile("sfx/whoosh.m4a")} volume={0.65} />
    </Sequence>
    <Sequence from={DIAGRAM_OUT} durationInFrames={12}>
      <Audio src={staticFile("sfx/whoosh.m4a")} volume={0.65} />
    </Sequence>
    {STAMP_FRAMES.map((f) => (
      <Sequence key={f} from={f} durationInFrames={6}>
        <Audio src={staticFile("sfx/stamp.m4a")} volume={0.55} />
      </Sequence>
    ))}
    <Sequence from={REVEAL_F} durationInFrames={15}>
      <Audio src={staticFile("sfx/ding-winner.m4a")} volume={0.80} />
    </Sequence>
    <Sequence from={FACTORY_F} durationInFrames={12}>
      <Audio src={staticFile("sfx/beat-drop.m4a")} volume={0.85} />
    </Sequence>

    {/* Captions */}
    <CaptionLayer />
  </AbsoluteFill>
);
