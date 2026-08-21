/**
 * AgentSkyPlaygroundDemo
 *
 * Marketing sample video for Agent Playground — harness+model picker,
 * GitHub task connect, side-by-side race, and metric scoreboard.
 *
 * AUDIO SWAP:  change the import below to re-anchor every beat.
 * TIGHT TRACK: swap `183552-words.json` → `183552-tight-words.json`
 *              and `vo-183552-full.m4a` → `vo-183552-tight.m4a`.
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {Audio} from "@remotion/media";

// ── Word-timing data ─────────────────────────────────────────────────────────
// Swapping this import re-anchors every beat without touching the component code.
import wordsRaw from "../transcripts-words/183552-v3-words.json";

// ── Types ────────────────────────────────────────────────────────────────────

type WordEntry = {w: string; s: number; e: number};
const WORDS: WordEntry[] = wordsRaw as WordEntry[];

// ── Word-to-frame helpers ────────────────────────────────────────────────────

const FPS = 30;

/**
 * Return the start time (seconds) of the nth occurrence of a word.
 * Matching strips trailing punctuation for flexible lookups.
 */
function wt(target: string, occurrence = 0): number {
  const bare = target.replace(/[.,!?]$/, "").toLowerCase();
  let count = 0;
  for (const e of WORDS) {
    const ebare = e.w.replace(/[.,!?]$/, "").toLowerCase();
    if (e.w === target || ebare === bare) {
      if (count === occurrence) return e.s;
      count++;
    }
  }
  return 0;
}

/** Seconds → frames (rounded). */
const sf = (s: number) => Math.round(s * FPS);

/**
 * Beat map — every visual event derived from word timestamps.
 * Tight track (183552-tight-words.json) — cuts remove "The biggest question
 * in 2026 is," (0.86–3.22s) and "Well," (6.42–6.94s).
 *
 * Anchor table (tight take 183552-tight):
 * ┌─────────────────────────────────┬───────────┬────────┐
 * │ Word                            │ Time (s)  │ Frame  │
 * ├─────────────────────────────────┼───────────┼────────┤
 * │ "DeepSeek's" (occ 0)            │  0.36     │   11   │
 * │ "Cloud" (occ 0, …Code?)         │  2.24     │   67   │
 * │ "Agent" (occ 1, …Playground)    │  3.06     │   92   │
 * │ "Go" (to Playground)            │  7.12     │  214   │
 * │ "select" (occ 0)                │  8.26     │  248   │
 * │ "Agent" (occ 2, DeepSeek Agent) │  9.14     │  274   │
 * │ "Code," (occ 1)                 │  9.82     │  295   │
 * │ "connect"                       │ 10.42     │  313   │
 * │ "GitHub"                        │ 10.98     │  330   │
 * │ "real"                          │ 12.08     │  362   │
 * │ "on." (…work on.)               │ 13.86     │  416   │
 * │ "time,"                         │ 16.80     │  504   │
 * │ "cost,"                         │ 17.46     │  524   │
 * │ "performance,"                  │ 18.30     │  549   │
 * │ "always"                        │ 20.30     │  609   │
 * └─────────────────────────────────┴───────────┴────────┘
 *
 * NOTE: "agent" (occ 0 at 1.16s in question) and "Agent" (occ 1 at 3.06s
 * "With Agent Playground") share a bare match. Use explicit occurrence
 * params to avoid mismatches.
 */
const B = {
  question:     0,
  deepseekName: sf(wt("DeepSeek's")),     //  0.36s → 11
  cloudCode:    sf(wt("Cloud")),           //  2.24s → 67
  panelRise:    sf(wt("Agent", 1)),        //  3.06s → 92  (occ 1: "With Agent Playground")
  pickerIn:     sf(wt("Go")),              //  7.12s → 214
  selectWord:   sf(wt("select")),          //  8.26s → 248
  dshPicked:    sf(wt("Agent", 2)),        //  9.14s → 274 (occ 2: "DeepSeek Agent")
  ccPicked:     sf(wt("Code,", 1)),        //  9.82s → 295 (occ 1: "Cloud Code,")
  connectIn:    sf(wt("connect")),         // 10.42s → 313
  repoSnap:     sf(wt("GitHub")),          // 10.98s → 330
  taskSnap:     sf(wt("real")),            // 12.08s → 362
  race:         sf(wt("on.")) + 8,         // 13.86s+8f → 424
  score:        sf(wt("time,")),           // 16.80s → 504
  costReveal:   sf(wt("cost,")),           // 17.46s → 524
  tokensReveal: sf(wt("performance,")),    // 18.30s → 549
  cta:          sf(wt("always")),          // 20.30s → 609
} as const;

/** Total duration: 22.60s × 30fps = 678 frames */
export const AGENT_SKY_PLAYGROUND_DEMO_DURATION = sf(22.6);

// ── Brand tokens ─────────────────────────────────────────────────────────────

const C = {
  canvas:    "#f7f7f8",
  panel:     "#ffffff",
  ink:       "#0d0d0d",
  secondInk: "#3d3d3d",
  muted:     "#5d5d5d",
  faint:     "#7a7a7a",
  line:      "#ececec",
  surface:   "#f1f1f2",
  blue:      "#1683f3",
  blueSoft:  "#e4f0fe",
  blueDeep:  "#0d70d5",
  success:   "#12805c",   // winner green — one value per metric row only
} as const;

// Space Grotesk: marketing/word-slam text only (QuestionCard, big headlines)
const FONT = '"AgentSky Space Grotesk", "Space Grotesk", "Segoe UI", Arial, sans-serif';
// Plus Jakarta Sans: all in-product UI labels, harness names, step headers
const UI_FONT = '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';
// Geist Mono: model slugs, all numbers, terminal output, metrics
const MONO = '"Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// ── Word-slam data for opening question ───────────────────────────────────────
// 7 units, each snaps in at its VO timestamp. "Claude Code?" is blue.
// Frames auto-derive from the v3 JSON via wt() so they re-anchor on track swaps.
const QUESTION_SLAM = [
  {text: "Is",           frame: sf(wt("Is")),         blue: false},
  {text: "DeepSeek's",   frame: sf(wt("DeepSeek's")), blue: false},
  {text: "new",          frame: sf(wt("new")),         blue: false},
  {text: "agent",        frame: sf(wt("agent")),       blue: false},
  {text: "better",       frame: sf(wt("better")),      blue: false},
  {text: "than",         frame: sf(wt("than")),        blue: false},
  {text: "Claude Code?", frame: sf(wt("Cloud")),       blue: true},
] as const;

// ── Animation helpers ─────────────────────────────────────────────────────────

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Progress from 0→1 over [start, end].
 * NOTE: at frame === start, returns 0. To be visible at the anchor word,
 * shift start a few frames earlier than the target word frame.
 */
function anim(
  frame: number,
  start: number,
  end: number,
  ease: (t: number) => number = easeOut,
): number {
  return interpolate(frame, [start, end], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

const wobble = (seed: number, frame: number) =>
  Math.sin((frame + seed * 37) * 0.19 + seed) * 0.5 + 0.5;

// ── Lane & metric data ────────────────────────────────────────────────────────

type Lane = {
  id: string;
  harness: string;
  model: string;
  icon: string;
  finish: number;   // frame when task finishes during race
  timeSec: number;
  cost: number;
  tokens: number;   // thousands
  steps: string[];
};

/**
 * LANES order matches VO order: "select DeepSeek Agent, Cloud Code"
 * DSH (index 0) enters first and is picked first; CC (index 1) second.
 */
// Codex-style log entries: each has a type and content for styling
type LogEntry = {
  type: "tool" | "diff-add" | "diff-del" | "output" | "path";
  text: string;
};

const DSH_LOG: LogEntry[] = [
  {type: "path",     text: "app/page.tsx"},
  {type: "tool",     text: "Read(\"app/page.tsx\")"},
  {type: "diff-del", text: "- <HeroSection />"},
  {type: "diff-add", text: "+ <Globe3D autoRotate />"},
  {type: "path",     text: "components/Globe3D.tsx"},
  {type: "tool",     text: "Write(\"components/Globe3D.tsx\")"},
  {type: "diff-add", text: "+ useEffect(() => { renderer.render… })"},
  {type: "tool",     text: "Bash(\"pnpm add three @types/three\")"},
  {type: "output",   text: "added 2 packages in 4.1s"},
  {type: "tool",     text: "Bash(\"pnpm build\")"},
  {type: "output",   text: "✓ Compiled in 8.2s"},
];

const CC_LOG: LogEntry[] = [
  {type: "path",     text: "app/page.tsx"},
  {type: "tool",     text: "Read(\"app/page.tsx\")"},
  {type: "tool",     text: "Bash(\"grep -r 'HeroSection' .\")"},
  {type: "path",     text: "components/HeroSection.tsx"},
  {type: "tool",     text: "Read(\"components/HeroSection.tsx\")"},
  {type: "path",     text: "components/Globe3D.tsx"},
  {type: "tool",     text: "Write(\"components/Globe3D.tsx\")"},
  {type: "diff-add", text: "+ const scene = new THREE.Scene()"},
  {type: "diff-add", text: "+ const globe = new THREE.Mesh(geo, mat)"},
  {type: "tool",     text: "Edit(\"app/page.tsx\")"},
  {type: "diff-del", text: "- <HeroSection />"},
  {type: "diff-add", text: "+ <Globe3D />"},
  {type: "tool",     text: "Bash(\"pnpm add three @types/three\")"},
  {type: "output",   text: "added 2 packages in 4.1s"},
  {type: "tool",     text: "Bash(\"pnpm build\")"},
  {type: "output",   text: "✓ Compiled in 9.8s"},
];

const LANE_LOGS = [DSH_LOG, CC_LOG];

const LANES: Lane[] = [
  {
    id: "dsh",
    harness: "DeepSeek Harness",
    model: "DeepSeek V4 Flash",
    icon: "icons/deepseek.svg",
    finish: 429,  // B.race(393) + 36f → done 38f before score, visible hold
    timeSec: 185,
    cost: 0.11,
    tokens: 148,  // DSH wins tokens (148K vs CC 312K = -53%)
    steps: DSH_LOG.map(e => e.text),
  },
  {
    id: "claude-code",
    harness: "Claude Code",
    model: "Claude Fable 5",
    icon: "icons/claude-ai-symbol.svg",
    finish: 453,  // B.race(393) + 60f → done 14f before score
    timeSec: 252,
    cost: 0.38,
    tokens: 312,  // updated per final data (DSH 148K wins)
    steps: CC_LOG.map(e => e.text),
  },
];

type MetricDef = {
  key: "time" | "cost" | "tokens";
  label: string;
  winnerId: string; // lane with the lower (better) value
};

const METRICS: MetricDef[] = [
  {key: "time",   label: "Time",    winnerId: "dsh"},
  {key: "cost",   label: "Cost",    winnerId: "dsh"},
  {key: "tokens", label: "Tokens",  winnerId: "dsh"},
];

const METRIC_VALUES: Record<string, Record<string, {display: string; raw: number}>> = {
  time: {
    dsh:           {display: "3:05", raw: 185},
    "claude-code": {display: "4:12", raw: 252},
  },
  cost: {
    dsh:           {display: "$0.11", raw: 0.11},
    "claude-code": {display: "$0.38", raw: 0.38},
  },
  tokens: {
    dsh:           {display: "148K", raw: 148},
    "claude-code": {display: "312K", raw: 312},
  },
};

// Delta stickers for the verdict beat — DSH vs CC clear beatdown
const DELTA_STICKERS = [
  {text: "1:07 FASTER",   frame: 467, rotate: -3},  // B.score
  {text: "3.5× CHEAPER",  frame: 486, rotate:  2},  // B.costReveal
  {text: "−53% TOKENS",   frame: 510, rotate: -2},  // B.tokensReveal
];

// ── Black-square fill transition — mechanism reused from AgentSkyBlackSquareFillScene ──
// Precomputed at module level (same pattern as the source file).
const FILL_CELL_SIZE = 80;
const FILL_COLUMNS = Math.ceil(1920 / FILL_CELL_SIZE);
const FILL_ROWS = Math.ceil(1080 / FILL_CELL_SIZE);
const FILL_MAX_DIST = Math.hypot(1920 / 2, 1080 / 2);
import {random} from "remotion";
type FillCell = {column: number; row: number; threshold: number; permanentFrame: number; glitchStart: number; glitchCount: 1|2};
const FILL_CELLS: FillCell[] = Array.from({length: FILL_COLUMNS * FILL_ROWS}, (_, index) => {
  const column = index % FILL_COLUMNS;
  const row = Math.floor(index / FILL_COLUMNS);
  const centerX = column * FILL_CELL_SIZE + FILL_CELL_SIZE / 2;
  const centerY = row * FILL_CELL_SIZE + FILL_CELL_SIZE / 2;
  const distance = Math.hypot(centerX - 1920 / 2, centerY - 1080 / 2);
  const seed = `bsf-playground-${column}-${row}`;
  const timingJitter = (random(`${seed}-timing`) - 0.5) * 0.16;
  const isDistantFragment = random(`${seed}-frag-chance`) < 0.16;
  const fragmentAdvance = isDistantFragment ? 0.2 + random(`${seed}-frag-adv`) * 0.26 : 0;
  const threshold = Math.max(0, Math.min(1, Math.min(0.96, distance / FILL_MAX_DIST + timingJitter - fragmentAdvance)));
  const permanentFrame = Math.ceil(Math.pow(threshold, 1 / 2.25) * 29);
  const isGlitchCell = permanentFrame > 7 && random(`${seed}-glitch-chance`) < 0.075;
  const glitchLead = 4 + Math.floor(random(`${seed}-glitch-lead`) * 7);
  return {
    column, row, threshold, permanentFrame,
    glitchStart: isGlitchCell ? Math.max(1, permanentFrame - glitchLead) : -1,
    glitchCount: random(`${seed}-glitch-count`) < 0.45 ? 2 : 1,
  } as FillCell;
});

// ── Caption groups — clause-boundary pre-segmentation ────────────────────────
type CaptionGroup = {words: WordEntry[]; start: number; end: number};
function buildCaptionGroups(): CaptionGroup[] {
  const groups: CaptionGroup[] = [];
  let cur: WordEntry[] = [];
  for (let i = 0; i < WORDS.length; i++) {
    cur.push(WORDS[i]);
    const w = WORDS[i];
    const next = WORDS[i + 1];
    const hasPunct = /[.?!,;]$/.test(w.w);
    const hasPause = next ? (next.s - w.e) > 0.28 : false;
    const tooLong = cur.length >= 7;
    if (hasPunct || hasPause || tooLong || !next) {
      groups.push({words: [...cur], start: cur[0].s, end: w.e});
      cur = [];
    }
  }
  if (cur.length) groups.push({words: cur, start: cur[0].s, end: cur[cur.length - 1].e});
  return groups;
}
const CAPTION_GROUPS = buildCaptionGroups();
// First group whose text belongs to the post-slam narration ("With Agent Playground…").
// Groups before this index are VS question-slam words and must never appear in the pill.
const FIRST_CAPTION_GROUP_IDX = Math.max(0, CAPTION_GROUPS.findIndex(g => g.words[0].w === "With"));

function fixAsr(text: string): string {
  return text
    .replace(/\bCloud Code\b/g, "Claude Code")
    // ASR heard "GitHub as a real task" but speaker said "GitHub — give a real task".
    // Keep "GitHub" (it IS correct), fix only the mis-heard "as" → "— give".
    .replace(/\bGitHub\s+as\s+a\b/gi, "GitHub — give a");
}

// ── Traffic-light dots — mechanism reused from AgentSkyBrowserWindow ──────────
const TrafficLights: React.FC = () => (
  <div style={{display: "flex", gap: 8, alignItems: "center"}}>
    {(["#ff5f57", "#ffbd2e", "#28c941"] as const).map((color, i) => (
      <span key={i} style={{
        width: 13, height: 13, borderRadius: "50%", background: color,
        boxShadow: "inset 0 -1px 2px rgba(0,0,0,.20)",
        display: "block",
      }} />
    ))}
  </div>
);

// ── Font loader ───────────────────────────────────────────────────────────────

const Fonts: React.FC = () => (
  <style>{`
    @font-face {
      font-family: 'AgentSky Space Grotesk';
      src: url('${staticFile("SpaceGrotesk-Bold.ttf")}') format('truetype');
      font-style: normal; font-weight: 700; font-display: block;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('${staticFile("fonts/PlusJakartaSans-SemiBold.ttf")}') format('truetype');
      font-style: normal; font-weight: 600; font-display: block;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('${staticFile("fonts/PlusJakartaSans-Regular.ttf")}') format('truetype');
      font-style: normal; font-weight: 400; font-display: block;
    }
    @font-face {
      font-family: 'Geist Mono';
      src: url('${staticFile("fonts/GeistMono-Regular.ttf")}') format('truetype');
      font-style: normal; font-weight: 400; font-display: block;
    }
    @font-face {
      font-family: 'Geist Mono';
      src: url('${staticFile("fonts/GeistMono-SemiBold.ttf")}') format('truetype');
      font-style: normal; font-weight: 600; font-display: block;
    }
  `}</style>
);

// ── Fighting-game VS Screen (KOF style) ──────────────────────────────────────
// Dark arena: DeepSeek card slams in from left on "DeepSeek's" (f10),
// Claude Code from right on "Cloud Code?" (f62). VS punches in between them.
// Question captions appear word-by-word at bottom.

const VS_IMPACT = 36; // halfway between the two card arrivals

const SpeedLines: React.FC<{cx: number; cy: number; opacity: number}> = ({cx, cy, opacity}) => {
  const lines = Array.from({length: 24}, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return {x0: cx + Math.cos(a)*300, y0: cy + Math.sin(a)*300,
            x1: cx + Math.cos(a)*1500, y1: cy + Math.sin(a)*1500};
  });
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity}}>
      {lines.map((l,i) => (
        <line key={i} x1={l.x0} y1={l.y0} x2={l.x1} y2={l.y1}
          stroke={i%2===0?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.06)"}
          strokeWidth={i%3===0?2:1} />
      ))}
    </svg>
  );
};

const Shockwave: React.FC<{frame:number;impactFrame:number;cx:number;cy:number}> = ({frame,impactFrame,cx,cy}) => {
  const t = frame - impactFrame;
  if (t<0||t>22) return null;
  const r=t*28; const op=1-t/22;
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`rgba(255,255,255,${op*0.65})`} strokeWidth={4-t*0.12} />
      <circle cx={cx} cy={cy} r={r*0.55} fill="none" stroke={`rgba(255,255,255,${op*0.35})`} strokeWidth={2} />
    </svg>
  );
};

const VsScreen: React.FC<{frame:number}> = ({frame}) => {
  // Two separate alpha envelopes:
  // contentAlpha: text + zone-tints fade out over 6 frames starting at BSF_START.
  //   This ensures no VS text bleeds through BSF holes during the cascade.
  // baseAlpha: the solid dark background (#0b0b0e) holds until BSF is complete
  //   (BSF_START + BSF_FILL_DUR = B.panelRise - 5), then fades. This ensures
  //   BSF holes always see a calm dark field, never the canvas background.
  const BSF_COMPLETE = BSF_START + BSF_FILL_DUR; // frame when every cell is placed
  const contentAlpha = 1 - clamp01((frame - BSF_START) / 6);
  const baseAlpha    = 1 - clamp01((frame - BSF_COMPLETE) / 14);
  if (baseAlpha <= 0) return null;

  const dshIn = anim(frame, B.deepseekName-4, B.deepseekName+16, easeOut);
  const ccIn  = anim(frame, B.cloudCode-4,   B.cloudCode+16,    easeOut);

  const shake1 = (frame>=B.deepseekName&&frame<B.deepseekName+5)
    ? Math.sin((frame-B.deepseekName)*9)*9*(1-(frame-B.deepseekName)/5) : 0;
  const shake2 = (frame>=B.cloudCode&&frame<B.cloudCode+5)
    ? -Math.sin((frame-B.cloudCode)*9)*9*(1-(frame-B.cloudCode)/5) : 0;

  const flashAlpha = (frame===B.deepseekName||frame===B.cloudCode) ? 0.8 : 0;

  const vsIn = anim(frame, VS_IMPACT, VS_IMPACT+4, easeOut);
  const vsScale = frame<VS_IMPACT ? 0 : interpolate(
    frame, [VS_IMPACT,VS_IMPACT+4,VS_IMPACT+9,VS_IMPACT+15],
    [0, 1.55, 0.80, 1.0], {extrapolateLeft:"clamp",extrapolateRight:"clamp"},
  );

  const speedOp = Math.max(
    interpolate(frame,[B.deepseekName,B.deepseekName+18],[0.95,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}),
    interpolate(frame,[B.cloudCode,B.cloudCode+18],[0.95,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}),
  );

  const CX=960, CY=460;

  return (
    <AbsoluteFill style={{
      background:"#0b0b0e", opacity:baseAlpha, overflow:"hidden",
      transform:`translateX(${shake1+shake2}px)`,
    }}>
      {/* Zone tints — hidden once BSF starts (frame >= BSF_START) to eliminate hue strobe */}
      {frame < BSF_START && (
        <>
          <div style={{position:"absolute",left:0,top:0,width:"50%",height:"100%",
            background:"linear-gradient(to right, rgba(22,131,243,0.14), transparent)"}} />
          <div style={{position:"absolute",right:0,top:0,width:"50%",height:"100%",
            background:"linear-gradient(to left, rgba(220,80,40,0.11), transparent)"}} />
        </>
      )}

      {/* All VS content wrapped in contentAlpha — fades before any BSF holes appear */}
      <div style={{opacity: contentAlpha}}>
      <SpeedLines cx={CX} cy={CY} opacity={speedOp} />

      {/* Diagonal slash */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:Math.max(dshIn*2,0.3)}}>
        <defs>
          <filter id="slash-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <line x1={CX-22} y1={0} x2={CX+22} y2={1080}
          stroke="rgba(255,255,255,0.65)" strokeWidth={3} filter="url(#slash-glow)" />
      </svg>

      <Shockwave frame={frame} impactFrame={B.deepseekName} cx={400} cy={CY} />
      <Shockwave frame={frame} impactFrame={B.cloudCode} cx={1520} cy={CY} />

      {/* DeepSeek fighter — slides from left */}
      <div style={{
        position:"absolute",
        left:`${interpolate(dshIn,[0,1],[-760,60],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}px`,
        top:"50%", transform:"translateY(-55%)", width:720, textAlign:"center",
      }}>
        <Img src={staticFile("icons/deepseek.svg")} style={{width:88,height:88,objectFit:"contain",marginBottom:22,
          filter:"brightness(0) invert(1) drop-shadow(0 0 24px rgba(22,131,243,0.85))"}} />
        <div style={{fontFamily:FONT,fontSize:74,fontWeight:700,color:"#ffffff",letterSpacing:-2.5,lineHeight:0.92,
          textShadow:"0 0 60px rgba(22,131,243,0.45), 0 5px 0 rgba(0,0,0,0.7)"}}>
          DeepSeek<br/>Harness
        </div>
        <div style={{fontFamily:MONO,fontSize:15,color:"rgba(255,255,255,0.4)",marginTop:16,letterSpacing:"0.12em",textTransform:"uppercase"}}>
          DeepSeek V4 Flash
        </div>
      </div>

      {/* Claude Code fighter — slides from right */}
      <div style={{
        position:"absolute",
        right:`${interpolate(ccIn,[0,1],[-760,60],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}px`,
        top:"50%", transform:"translateY(-55%)", width:720, textAlign:"center",
      }}>
        <Img src={staticFile("icons/claude-ai-symbol.svg")} style={{width:88,height:88,objectFit:"contain",marginBottom:22,
          filter:"drop-shadow(0 0 24px rgba(220,100,60,0.6))"}} />
        <div style={{fontFamily:FONT,fontSize:74,fontWeight:700,color:"#ffffff",letterSpacing:-2.5,lineHeight:0.92,
          textShadow:"0 0 60px rgba(220,100,50,0.35), 0 5px 0 rgba(0,0,0,0.7)"}}>
          Claude<br/>Code
        </div>
        <div style={{fontFamily:MONO,fontSize:15,color:"rgba(255,255,255,0.4)",marginTop:16,letterSpacing:"0.12em",textTransform:"uppercase"}}>
          Claude Fable 5
        </div>
      </div>

      {/* VS text */}
      {vsIn>0 && (
        <div style={{
          position:"absolute",left:"50%",top:"50%",
          transform:`translate(-50%,-52%) scale(${vsScale})`,
          fontFamily:FONT,fontSize:188,fontWeight:700,color:"#ffffff",letterSpacing:-8,
          textShadow:"0 0 90px rgba(255,200,0,0.95), 0 0 40px rgba(255,150,0,0.7), 0 8px 0 rgba(0,0,0,0.9)",
          opacity:vsIn,lineHeight:1,whiteSpace:"nowrap",pointerEvents:"none",zIndex:5,
        }}>
          VS
        </div>
      )}

      {/* Impact flash */}
      {flashAlpha>0 && (
        <AbsoluteFill style={{background:"white",opacity:flashAlpha,pointerEvents:"none"}} />
      )}

      {/* Question captions — word slam at bottom */}
      <div style={{
        position:"absolute",bottom:64,left:0,right:0,
        display:"flex",flexWrap:"wrap",justifyContent:"center",
        columnGap:20,rowGap:6,padding:"0 80px",zIndex:6,
      }}>
        {QUESTION_SLAM.map(({text,frame:wf,blue}) => {
          const vis = frame>=wf;
          const ws = interpolate(frame,[wf,wf+4],[1.4,1.0],{easing:easeOut,extrapolateLeft:"clamp",extrapolateRight:"clamp"});
          return (
            <span key={text} style={{
              fontFamily:FONT,fontSize:58,fontWeight:700,
              color:blue?"#55c8ff":"#ffffff",
              opacity:vis?1:0,display:"inline-block",
              transform:`scale(${ws})`,transformOrigin:"50% 100%",
              letterSpacing:-1.5,
              textShadow:blue?"0 0 32px rgba(85,200,255,0.65)":"0 2px 10px rgba(0,0,0,0.6)",
              whiteSpace:"nowrap",
            }}>{text}</span>
          );
        })}
      </div>
      </div>{/* end contentAlpha wrapper */}
    </AbsoluteFill>
  );
};

// Bright flash bridging dark VS-screen → clean white playground
// BlackSquareFill — replaces WhipPanFlash. Mechanism from AgentSkyBlackSquareFillScene.
// Radial black-square cascade covers the VS arena, then fades as the browser panel rises.
const BSF_FILL_DUR = 30;
const BSF_START = B.panelRise - BSF_FILL_DUR - 5; // completes ~5 frames before panelRise

const BlackSquareFill: React.FC<{frame: number}> = ({frame}) => {
  const f = frame - BSF_START;
  if (f < 0) return null;

  // Fade out: start at panelRise, gone by panelRise+22
  const fadeOut = 1 - clamp01((frame - B.panelRise) / 22);
  if (fadeOut <= 0) return null;

  const timeline = clamp01(f / (BSF_FILL_DUR - 1));
  const radialFront = Math.pow(timeline, 2.25);

  return (
    <AbsoluteFill style={{zIndex: 25, overflow: "hidden", opacity: fadeOut, pointerEvents: "none"}}>
      {FILL_CELLS.map((cell) => {
        const perm = radialFront >= cell.threshold;
        const glitch = f < cell.permanentFrame &&
          (f === cell.glitchStart || (cell.glitchCount === 2 && f === cell.glitchStart + 2));
        if (!perm && !glitch) return null;
        return (
          <span key={`${cell.column}-${cell.row}`} style={{
            position: "absolute",
            left: cell.column * FILL_CELL_SIZE - 1,
            top: cell.row * FILL_CELL_SIZE - 1,
            width: FILL_CELL_SIZE + 2,
            height: FILL_CELL_SIZE + 2,
            background: "#000000",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ── Browser chrome ────────────────────────────────────────────────────────────

const PanelChrome: React.FC<{children: React.ReactNode; frame: number}> = ({
  children,
  frame,
}) => {
  const rise = anim(frame, B.panelRise, B.panelRise + 38);

  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        top: 100,
        width: 1720,
        height: 880,
        borderRadius: 18,
        background: C.panel,
        border: `1px solid ${C.line}`,
        boxShadow: "0 32px 80px rgba(20,25,20,.13)",
        overflow: "hidden",
        opacity: rise,
        transform: `translateY(${(1 - rise) * 52}px) scale(${0.96 + rise * 0.04})`,
      }}
    >
      <div
        style={{
          height: 52,
          borderBottom: `1px solid ${C.line}`,
          background: C.surface,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        <TrafficLights />
        <div style={{flex: 1, display: "flex", justifyContent: "center"}}>
          <div
            style={{
              padding: "5px 22px",
              borderRadius: 8,
              background: C.panel,
              border: `1px solid ${C.line}`,
              fontFamily: MONO,
              fontSize: 13,
              color: C.muted,
              letterSpacing: 0.3,
            }}
          >
            agentsky.dev/playground
          </div>
        </div>
        <div style={{width: 88}} />
      </div>
      {children}
    </div>
  );
};

const STAGE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  top: 52,
  padding: "26px 38px",
  overflow: "hidden",
};

// ── Welcome view — real Playground composer landing page ──────────────────────
// Shows "What do you want done?" heading + empty composer card.
// The same card persists into PickerStage (continuous, no scene change).

const WelcomeView: React.FC<{frame: number}> = ({frame}) => {
  const enter = anim(frame, B.panelRise - 4, B.panelRise + 22);
  const exit  = 1 - anim(frame, B.pickerIn - 6, B.pickerIn + 8);
  const alpha = enter * exit;
  if (frame < B.panelRise || alpha <= 0) return null;

  const sub = anim(frame, B.panelRise + 6, B.panelRise + 36);
  // Subtle ±0.8px vertical breathe — ramps in after panel rises, 3s period
  const breatheAmt = clamp01((frame - (B.panelRise + 30)) / 20);
  const breatheY = breatheAmt * Math.sin(frame * Math.PI * 2 / 90) * 0.8;
  // Hover glow on add-setup zone just before pickerIn (cursor approaching)
  const addGlow = anim(frame, B.pickerIn - 28, B.pickerIn - 10) * (1 - anim(frame, B.pickerIn - 10, B.pickerIn));

  return (
    <div style={{...STAGE, opacity: alpha}}>
      {/* Page heading — real Playground copy */}
      <div style={{
        fontFamily: UI_FONT, fontSize: 72, fontWeight: 700,
        color: C.ink, letterSpacing: -2, marginBottom: 10,
      }}>
        What do you want done?
      </div>
      <div style={{fontFamily: UI_FONT, fontSize: 26, color: C.muted, marginBottom: 36, opacity: sub}}>
        Your agent gets to work as soon as you send.
      </div>

      {/* Composer card — empty state, breathes ±0.8px */}
      <div style={{
        borderRadius: 24, border: `1.5px solid ${C.line}`,
        background: C.panel, boxShadow: "0 8px 40px rgba(0,0,0,.07)",
        overflow: "hidden", opacity: sub,
        transform: `translateY(${breatheY}px)`,
      }}>
        {/* Setup pills row */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{fontFamily: MONO, fontSize: 13, letterSpacing: "0.08em", color: C.faint, textTransform: "uppercase", marginRight: 4}}>
            COMPARISON · 1 SETUP
          </div>
          {/* Initial single CC pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 10,
            background: C.surface, border: `1px solid ${C.line}`,
          }}>

            <Img src={staticFile("icons/claude-ai-symbol.svg")} style={{width: 20, height: 20, objectFit: "contain"}} />
            <span style={{fontFamily: UI_FONT, fontSize: 18, fontWeight: 600, color: C.ink}}>Claude Code</span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>▾</span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.faint, margin: "0 3px"}}>·</span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>claude-fable-5</span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>▾</span>
          </div>
          {/* Ghost "+ Add setup" pill — appears as cursor hovers, foreshadows DeepSeek chip */}
          {addGlow > 0.02 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10,
              background: "transparent",
              border: `1px solid rgba(50,100,255,${addGlow * 0.40})`,
              opacity: addGlow * 0.42,
              fontFamily: UI_FONT, fontSize: 16, fontWeight: 600,
              color: C.blue, whiteSpace: "nowrap",
            }}>
              + Add setup
            </div>
          )}
        </div>

        {/* Task textarea */}
        <div style={{padding: "28px 28px 22px 28px"}}>
          <div style={{
            fontFamily: UI_FONT, fontSize: 28, color: C.faint,
            minHeight: 100, lineHeight: 1.6,
          }}>
            Describe the task…
          </div>
        </div>

        {/* Footer: GitHub chip + send */}
        <div style={{
          padding: "14px 22px", borderTop: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9,
            padding: "8px 16px", borderRadius: 999,
            border: `1px solid ${C.line}`, background: C.panel,
            fontFamily: UI_FONT, fontSize: 16, fontWeight: 500, color: C.muted,
          }}>
            <Img src={staticFile("icons/github.svg")} style={{width: 18, height: 18, objectFit: "contain"}} />
            Connect apps
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: C.ink,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 24, fontWeight: 700,
          }}>↑</div>
        </div>
      </div>
    </div>
  );
};

// ── Picker stage — PR29 real composer with pills, task text, GitHub connect ─────
// One continuous page view. No scene changes — just in-page state building.

const TASK_TEXT = "Add 3D animation to homepage";

const PickerStage: React.FC<{frame: number}> = ({frame}) => {
  const exitAt = B.race - 10;
  const show = 1 - anim(frame, exitAt, exitAt + 10);
  const fadeIn = anim(frame, B.pickerIn - 2, B.pickerIn + 12);
  if (frame < B.pickerIn || show <= 0) return null;

  // Pill transitions (same anchors as before)
  const dshPill = anim(frame, B.dshPicked - 2, B.dshPicked + 10);
  const ccActive = anim(frame, B.ccPicked - 2, B.ccPicked + 8);
  const setupCount = dshPill > 0.5 ? "2 SETUPS" : "1 SETUP";

  // ── DOCK gesture: GitHub chip flies in from left, snaps under task ──
  // connectIn: chip starts flying; repoSnap: snap + green ✓ pulse.
  const dockFly = anim(frame, B.connectIn - 2, B.connectIn + 18, easeOut);
  const dockSnap = anim(frame, B.repoSnap, B.repoSnap + 10, easeOut);
  const snapPulse = frame >= B.repoSnap && frame < B.repoSnap + 14
    ? Math.sin(((frame - B.repoSnap) / 14) * Math.PI)
    : 0;
  // Chip X: from -320 offscreen → 0, then snap overshoot
  const dockX = interpolate(dockFly, [0, 1], [-320, 0], {extrapolateLeft:"clamp", extrapolateRight:"clamp"});
  const snapBounce = interpolate(dockSnap, [0, 0.35, 0.65, 1], [0, -10, 4, 0], {extrapolateLeft:"clamp", extrapolateRight:"clamp"});

  // ── TYPE gesture: task text types big (≥40px), camera zoom ──
  const typeProgress = clamp01((frame - B.taskSnap) / 34);
  const typedChars = Math.floor(typeProgress * TASK_TEXT.length);
  const typedText = TASK_TEXT.slice(0, typedChars);
  const showCursor = frame >= B.taskSnap && frame < B.race - 3;
  const cursorOn = frame % 14 < 7;
  // Camera push in: slight scale + translateY as text is typed
  const taskZoom = 1 + typeProgress * 0.035;
  const taskLift = -typeProgress * 12;

  // ── LAUNCH gesture: card spring compress → release → exit ──
  const pressA = anim(frame, B.race - 6, B.race - 1); // compress
  const pressB = anim(frame, B.race - 1, B.race + 7); // spring release
  const cardScale =
    pressA > 0 ? interpolate(pressA, [0, 1], [1, 0.965], {extrapolateLeft:"clamp", extrapolateRight:"clamp"}) :
    pressB > 0 ? interpolate(pressB, [0, 0.4, 1], [0.965, 1.045, 1.0], {extrapolateLeft:"clamp", extrapolateRight:"clamp"}) :
    1;

  const pillStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 10px", borderRadius: 8,
    background: active ? C.blueSoft : C.surface,
    border: `1px solid ${active ? C.blue : C.line}`,
  });

  return (
    <div style={{...STAGE, opacity: fadeIn * show}}>
      {/* Heading — continuous with WelcomeView */}
      <div style={{fontFamily: UI_FONT, fontSize: 72, fontWeight: 700, color: C.ink, letterSpacing: -2, marginBottom: 10}}>
        What do you want done?
      </div>
      <div style={{fontFamily: UI_FONT, fontSize: 26, color: C.muted, marginBottom: 32}}>
        Your agent gets to work as soon as you send.
      </div>

      {/* Composer card — LAUNCH spring applies to whole card */}
      <div style={{
        borderRadius: 24, border: `1.5px solid ${C.line}`,
        background: C.panel, boxShadow: "0 8px 40px rgba(0,0,0,.07)",
        transform: `scale(${cardScale})`,
        transformOrigin: "50% 45%",
      }}>
        {/* Pills row */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        }}>
          <div style={{fontFamily: MONO, fontSize: 13, letterSpacing: "0.08em", color: C.faint, textTransform: "uppercase"}}>
            COMPARISON · {setupCount}
          </div>
          <div style={pillStyle(ccActive > 0.5)}>
            <Img src={staticFile("icons/claude-ai-symbol.svg")} style={{width: 20, height: 20, objectFit: "contain"}} />
            <span style={{fontFamily: UI_FONT, fontSize: 18, fontWeight: 600, color: C.ink}}>Claude Code</span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>▾</span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.faint, margin: "0 3px"}}>·</span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>claude-fable-5</span>
            <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>▾</span>
          </div>
          {dshPill > 0 && (
            <div style={{...pillStyle(dshPill > 0.5), opacity: dshPill, transform: `translateY(${(1-dshPill)*8}px) scale(${0.85 + dshPill * 0.15})`}}>
              <Img src={staticFile("icons/deepseek.svg")} style={{width: 20, height: 20, objectFit: "contain"}} />
              <span style={{fontFamily: UI_FONT, fontSize: 18, fontWeight: 600, color: C.ink}}>DeepSeek Harness</span>
              <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>▾</span>
              <span style={{fontFamily: MONO, fontSize: 14, color: C.faint, margin: "0 3px"}}>·</span>
              <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>deepseek-v4-flash</span>
              <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>▾</span>
            </div>
          )}
          {dshPill < 0.8 && frame >= B.selectWord && (
            <div style={{...pillStyle(false), color: C.blue, borderColor: C.blue, fontFamily: UI_FONT, fontSize: 18, fontWeight: 600}}>
              + Add setup
            </div>
          )}
        </div>

        {/* TYPE hero — large text with camera zoom */}
        <div style={{
          padding: "32px 32px 28px 32px", minHeight: 150,
          transform: `scale(${taskZoom}) translateY(${taskLift}px)`,
          transformOrigin: "0% 50%",
        }}>
          {typedText ? (
            <div style={{fontFamily: UI_FONT, fontSize: 50, fontWeight: 700, color: C.ink, lineHeight: 1.25}}>
              {typedText}
              {showCursor && (
                <span style={{
                  display: "inline-block", width: 4, height: "0.85em",
                  background: C.blue, marginLeft: 4, verticalAlign: "text-bottom",
                  opacity: cursorOn ? 1 : 0, borderRadius: 2,
                }} />
              )}
            </div>
          ) : (
            <div style={{fontFamily: UI_FONT, fontSize: 30, color: C.faint, lineHeight: 1.5}}>
              Describe the task…
            </div>
          )}
        </div>

        {/* Footer: DOCK chip snaps in from left + send ↑ */}
        <div style={{
          padding: "14px 22px", borderTop: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          overflow: "hidden",
        }}>
          {/* DOCK: chip flies in, snaps with green ✓ */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            opacity: dockFly,
            transform: `translateX(${dockX + snapBounce}px)`,
          }}>
            <Img src={staticFile("icons/github.svg")} style={{width: 20, height: 20, objectFit: "contain"}} />
            <span style={{fontFamily: UI_FONT, fontSize: 18, fontWeight: 600, color: C.ink}}>GitHub connected</span>
            <span style={{
              fontFamily: MONO, fontSize: 17, color: C.success, fontWeight: 700,
              opacity: dockSnap,
              transform: `scale(${1 + snapPulse * 0.18})`,
              display: "inline-block",
            }}>✓</span>
          </div>

          {/* Send button */}
          <div style={{
            width: 54, height: 54, borderRadius: "50%",
            background: typedText ? C.ink : "#c8c8c8",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 26, fontWeight: 700, flexShrink: 0,
          }}>↑</div>
        </div>
      </div>
    </div>
  );
};

// ── Race Stage — PR29 in-product run layout ───────────────────────────────────
// Same page after send. Left rail (236px) + two answer columns streaming tool logs.
// No dark split-screen — this is the real product UI in-place.

const formatClock = (totalSec: number) => {
  const w = Math.floor(totalSec);
  return `${Math.floor(w / 60)}:${(w % 60).toString().padStart(2, "0")}`;
};

const RaceStage: React.FC<{frame: number}> = ({frame}) => {
  const enter = anim(frame, B.race - 12, B.race + 10);
  const leave = 1 - anim(frame, B.score - 12, B.score + 4);
  const alpha = enter * leave;
  if (alpha <= 0) return null;

  return (
    <div style={{...STAGE, display: "flex", flexDirection: "column", opacity: alpha}}>
      {/* SAME PROMPT header */}
      <div style={{
        fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em",
        color: C.faint, textTransform: "uppercase", marginBottom: 10, flexShrink: 0,
      }}>
        SAME PROMPT · 2 CONFIGS
      </div>
      <div style={{
        fontFamily: UI_FONT, fontSize: 20, fontWeight: 600, color: C.ink,
        marginBottom: 16, flexShrink: 0,
      }}>
        Add 3D animation to homepage
      </div>

      {/* Main layout: left rail + columns */}
      <div style={{display: "flex", flex: 1, minHeight: 0, gap: 0, overflow: "hidden"}}>
        {/* Left rail — 310px, two agent rows */}
        <div style={{
          width: 310, flexShrink: 0,
          background: "rgba(241,241,242,0.35)", borderRight: `1px solid ${C.line}`,
          paddingTop: 10,
        }}>
          {LANES.map((lane, i) => {
            const runFrames = lane.finish - B.race;
            const prog = clamp01((frame - B.race) / runFrames);
            const done = frame >= lane.finish;
            const isActive = !done && prog > 0;
            const pulse = wobble(i + 1, frame);

            return (
              <div key={lane.id} style={{
                padding: "12px 14px",
                borderRadius: 10, margin: "0 8px 6px 8px",
                background: isActive ? C.surface : "transparent",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <Img src={staticFile(lane.icon)} style={{width: 22, height: 22, objectFit: "contain", flexShrink: 0}} />
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontFamily: UI_FONT, fontSize: 17, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                    {lane.harness}
                  </div>
                  <div style={{fontFamily: MONO, fontSize: 13, color: C.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                    {lane.model.toLowerCase().replace(/ /g, "-")}
                  </div>
                </div>
                <div style={{textAlign: "right", flexShrink: 0}}>
                  <div style={{fontFamily: MONO, fontSize: 16, color: done ? C.success : C.ink, fontVariantNumeric: "tabular-nums"}}>
                    {formatClock(lane.timeSec * prog)}
                  </div>
                  <div style={{fontFamily: MONO, fontSize: 13, color: C.faint, fontVariantNumeric: "tabular-nums"}}>
                    ${(lane.cost * prog).toFixed(2)}
                  </div>
                  {isActive && (
                    <div style={{width: 8, height: 8, borderRadius: "50%", background: C.blue, marginLeft: "auto", marginTop: 3, opacity: 0.35 + pulse * 0.65}} />
                  )}
                  {done && (
                    <div style={{width: 8, height: 8, borderRadius: "50%", background: C.success, marginLeft: "auto", marginTop: 3}} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Two answer columns — Codex-style realistic coding sessions */}
        <div style={{flex: 1, display: "flex", minWidth: 0}}>
          {LANES.map((lane, i) => {
            const log = LANE_LOGS[i];
            const runFrames = lane.finish - B.race;
            const prog = clamp01((frame - B.race) / runFrames);
            const done = frame >= lane.finish;
            const entriesDone = Math.min(log.length, Math.floor(prog * log.length) + 1);
            const pulse = wobble(i + 3, frame);
            const isCurr = (ei: number) => ei === entriesDone - 1 && !done;

            return (
              <div key={lane.id} style={{
                flex: 1, borderLeft: `1px solid ${C.line}`,
                display: "flex", flexDirection: "column", overflow: "hidden",
              }}>
                {/* Column header */}
                <div style={{
                  padding: "14px 22px", borderBottom: `1px solid ${C.line}`,
                  background: C.surface, display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
                }}>
                  <Img src={staticFile(lane.icon)} style={{width: 24, height: 24, objectFit: "contain"}} />
                  <span style={{fontFamily: UI_FONT, fontSize: 19, fontWeight: 600, color: C.ink}}>{lane.harness}</span>
                  <span style={{fontFamily: MONO, fontSize: 14, color: C.faint}}>{lane.model.toLowerCase().replace(/ /g, "-")}</span>
                  {/* Live rolling meters — always ticking */}
                  <div style={{marginLeft: "auto", display: "flex", alignItems: "center", gap: 20, flexShrink: 0}}>
                    <span style={{fontFamily: MONO, fontSize: 18, fontWeight: 700, color: done ? C.success : C.ink, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em"}}>
                      {formatClock(lane.timeSec * prog)}
                    </span>
                    <span style={{fontFamily: MONO, fontSize: 15, color: C.faint, fontVariantNumeric: "tabular-nums"}}>
                      ${(lane.cost * prog).toFixed(3)}
                    </span>
                    <span style={{fontFamily: MONO, fontSize: 15, color: C.faint, fontVariantNumeric: "tabular-nums"}}>
                      {(lane.tokens * prog).toFixed(0)}K tok
                    </span>
                  </div>
                </div>

                {/* Codex-style log stream */}
                <div style={{flex: 1, padding: "16px 22px", overflow: "hidden", background: C.panel}}>
                  {log.slice(0, entriesDone).map((entry, ei) => {
                    const curr = isCurr(ei);
                    // Type-on mechanism reused from AgentSkyCodeBuildScene:
                    // Animate character reveal for the currently-being-typed entry.
                    let displayText = entry.text;
                    if (curr) {
                      const entryStart = B.race + Math.round((ei / log.length) * runFrames);
                      const total = entry.text.length;
                      const typeEnd = entryStart + Math.max(4, Math.round(total * 0.15));
                      const visibleChars = Math.floor(interpolate(frame, [entryStart, typeEnd], [0, total], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
                      displayText = entry.text.slice(0, visibleChars);
                    }
                    let color: string = C.muted;
                    let bg = "transparent";
                    if (entry.type === "diff-add") { color = "#12805c"; }
                    else if (entry.type === "diff-del") { color = "#b42318"; }
                    else if (entry.type === "output") { color = C.faint; }
                    else if (entry.type === "path") {
                      color = C.blue; bg = C.blueSoft;
                    }
                    else if (entry.type === "tool") {
                      color = curr ? C.ink : C.secondInk;
                    }
                    return (
                      <div key={ei} style={{
                        fontFamily: MONO, fontSize: 20, lineHeight: 2.0,
                        color, background: bg ? bg : "transparent",
                        borderRadius: bg ? 6 : 0,
                        padding: bg ? "2px 8px" : "0",
                        marginBottom: bg ? 6 : 0,
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                        {(entry.type === "tool") && (
                          <span style={{
                            width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                            background: curr ? C.blue : C.faint,
                            opacity: curr ? 0.35 + pulse * 0.65 : 0.6,
                          }} />
                        )}
                        {displayText}
                      </div>
                    );
                  })}
                  {done && (
                    <div style={{
                      marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "7px 16px", borderRadius: 999,
                      background: "rgba(18,128,92,.08)", border: `1px solid ${C.success}`,
                      fontFamily: MONO, fontSize: 16, color: C.success, letterSpacing: 1,
                    }}>
                      ✓ Build passed · PR opened
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Scoreboard — aggressive verdict beat ──────────────────────────────────────
// DSH wins all 3. Winner punches up (scale 1.06, green glow). CC dims to 55%.
// Delta stickers slam in at each metric anchor. CTA closes the beat.

const VerdictCard: React.FC<{
  lane: Lane;
  isWinner: boolean;
  frame: number;
  enter: number;
}> = ({lane, isWinner, frame, enter}) => {
  const scale = isWinner ? 1.06 : 0.97;
  const opacity = isWinner ? 1 : 0.55;
  const borderColor = isWinner ? C.success : C.line;
  const boxShadow = isWinner
    ? `0 0 0 2px ${C.success}, 0 0 32px rgba(18,128,92,.18), 0 16px 48px rgba(0,0,0,.06)`
    : "0 4px 16px rgba(0,0,0,.04)";

  const metricRevealAt = [B.score - 3, B.costReveal - 3, B.tokensReveal - 3];

  return (
    <div
      style={{
        flex: 1,
        borderRadius: 10,
        border: `1.5px solid ${borderColor}`,
        background: C.panel,
        boxShadow,
        overflow: "hidden",
        opacity: enter * opacity,
        transform: `scale(${0.96 + enter * (scale - 0.96)})`,
        transformOrigin: "50% 40%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: `1px solid ${C.line}`,
          background: isWinner ? "rgba(18,128,92,.04)" : C.surface,
        }}
      >
        <Img src={staticFile(lane.icon)} style={{width: 28, height: 28, objectFit: "contain", flexShrink: 0}} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: UI_FONT, fontSize: 24, fontWeight: 700, color: C.ink}}>
            {lane.harness}
          </div>
          <div style={{fontFamily: MONO, fontSize: 14, color: C.faint, marginTop: 2}}>
            {lane.model}
          </div>
        </div>
        {isWinner && (
          <div style={{
            fontFamily: UI_FONT,
            fontSize: 16,
            fontWeight: 700,
            color: C.success,
            letterSpacing: "0.06em",
          }}>
            WINNER
          </div>
        )}
      </div>

      {/* Metric rows */}
      <div style={{padding: "10px 0"}}>
        {METRICS.map((metric, i) => {
          const cell = METRIC_VALUES[metric.key][lane.id];
          const wins = lane.id === metric.winnerId;
          const rowReveal = anim(frame, metricRevealAt[i], metricRevealAt[i] + 20);
          return (
            <div
              key={metric.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderTop: i > 0 ? `1px solid ${C.line}` : "none",
                opacity: rowReveal,
              }}
            >
              <span style={{fontFamily: UI_FONT, fontSize: 20, fontWeight: 600, color: C.faint}}>
                {metric.label}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 96,
                  fontWeight: wins ? 700 : 400,
                  color: wins ? C.success : C.muted,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {cell.display}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DeltaSticker: React.FC<{text: string; triggerFrame: number; rotate: number; frame: number}> = ({
  text, triggerFrame, rotate, frame,
}) => {
  const pop = anim(frame, triggerFrame, triggerFrame + 5);
  if (pop <= 0) return null;
  const scale = interpolate(frame, [triggerFrame, triggerFrame + 5, triggerFrame + 8], [1.5, 0.92, 1.0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const idx = DELTA_STICKERS.findIndex(s => s.text === text);
  return (
    <div style={{
      position: "absolute",
      right: "4%",           // right side = over CC (loser) column
      top: `${90 + idx * 168}px`,
      transform: `rotate(${rotate}deg) scale(${scale})`,
      transformOrigin: "100% 50%",
      background: C.ink,
      color: "#ffffff",
      fontFamily: MONO,
      fontSize: 64,
      fontWeight: 700,
      letterSpacing: "-0.03em",
      padding: "18px 48px",
      borderRadius: 10,
      whiteSpace: "nowrap",
      opacity: pop,
      boxShadow: "0 8px 40px rgba(0,0,0,.45)",
      zIndex: 10,
    }}>
      {text}
    </div>
  );
};

const Scoreboard: React.FC<{frame: number}> = ({frame}) => {
  const enter = anim(frame, B.score - 12, B.score + 14);
  if (enter <= 0) return null;

  const ctaAnim = anim(frame, B.cta - 2, B.cta + 20);

  return (
    <div style={{...STAGE}}>
      {/* Headline — VO-synced; before CTA shows meta, after CTA shows the spoken line big */}
      <div style={{opacity: enter}}>
        {ctaAnim > 0.3 ? (
          <div style={{
            fontFamily: FONT, fontSize: 56, fontWeight: 700, color: C.ink,
            letterSpacing: -1.4, transform: `translateY(${(1 - ctaAnim) * 14}px)`,
            opacity: ctaAnim, lineHeight: 1.15,
          }}>
            So you can always select the best agent for your use case.
          </div>
        ) : (
          <div style={{fontFamily: MONO, fontSize: 20, color: C.faint, letterSpacing: "0.02em"}}>
            Add 3D animation to homepage · 1 run each
          </div>
        )}
      </div>

      {/* Two verdict cards + sticker zone */}
      <div style={{marginTop: 22, position: "relative", paddingRight: 8}}>
        <div style={{display: "flex", gap: 16}}>
          {LANES.map((lane) => (
            <VerdictCard
              key={lane.id}
              lane={lane}
              isWinner={lane.id === "dsh"}
              frame={frame}
              enter={enter}
            />
          ))}
        </div>

        {/* Delta stickers */}
        {DELTA_STICKERS.map((s) => (
          <DeltaSticker
            key={s.text}
            text={s.text}
            triggerFrame={s.frame}
            rotate={s.rotate}
            frame={frame}
          />
        ))}
      </div>

      {/* CTA is now the promoted headline above — no duplicate here */}
    </div>
  );
};

// ── "ILLUSTRATIVE RUN" watermark ──────────────────────────────────────────────

const IllustrativeWatermark: React.FC<{frame: number}> = ({frame}) => {
  const show = anim(frame, B.score - 12, B.score + 6);
  if (show <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 18,
        right: 24,
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: 1.5,
        color: C.faint,
        opacity: show * 0.65,
      }}
    >
      ILLUSTRATIVE RUN
    </div>
  );
};

// ── Invisible-user cursor — composer stretch (panelRise → pickerIn+20) ───────
// Shows a mouse pointer that drifts purposefully to foreshadow each next action.
// Every motion has intent: hover CC chip → drift toward "add setup" → click ripple.
const CursorLayer_Composer: React.FC<{frame: number}> = ({frame}) => {
  const f0 = B.panelRise + 14;       // cursor enters after browser has risen (≈f99)
  const f1 = f0 + 20;               // arrives and settles at CC chip (≈f119)
  const f2 = B.pickerIn - 30;       // starts drifting toward add-setup zone (≈f184)
  const f3 = B.pickerIn - 5;        // arrives at add-setup zone, click (≈f209)
  const f4 = B.pickerIn + 22;       // cursor fades out (≈f236)

  if (frame < f0 || frame > f4) return null;

  const fadeIn  = clamp01((frame - f0) / 8);
  const fadeOut = 1 - clamp01((frame - (f3 + 6)) / 14);
  const opacity = fadeIn * fadeOut;
  if (opacity < 0.03) return null;

  // Composition-absolute positions — PanelChrome at (100,100), chrome bar 52px,
  // STAGE padding 26px top / 38px left. CC chip setup row y ≈ 390, CC chip x ≈ 440.
  const ccX = 440, addX = 698, rowY = 388;

  // X path: enters from right, hovers CC chip, drifts to add-setup zone
  let x: number;
  if (frame <= f1) {
    x = interpolate(frame, [f0, f1], [ccX + 200, ccX], {extrapolateLeft:"clamp", extrapolateRight:"clamp"});
  } else if (frame <= f2) {
    // Micro hover wobble — cursor breathes in place over CC chip
    x = ccX + Math.sin((frame - f1) * 0.055) * 5;
  } else {
    // Smooth eased drift to add-setup click target
    x = interpolate(frame, [f2, f3], [ccX, addX], {extrapolateLeft:"clamp", extrapolateRight:"clamp"});
  }

  // Y — very subtle ±1.5px organic drift
  const y = rowY + Math.sin(frame * 0.048) * 1.5;

  // Click ripple: ring expands outward at f3
  const rP = clamp01((frame - f3) / 16);
  const rAlpha = rP > 0 ? (1 - rP) * 0.65 : 0;

  return (
    <AbsoluteFill style={{zIndex: 36, pointerEvents: "none"}}>
      {/* Click ripple */}
      {rP > 0 && (
        <div style={{
          position: "absolute",
          left: addX - rP * 22,
          top: rowY - rP * 22,
          width: rP * 44,
          height: rP * 44,
          borderRadius: "50%",
          border: `1.5px solid rgba(50,110,255,${rAlpha})`,
        }} />
      )}
      {/* Cursor arrow — standard pointer shape */}
      <svg
        width={22} height={26}
        viewBox="0 0 22 26"
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity,
          filter: "drop-shadow(0 1px 4px rgba(0,0,0,.28))",
        }}
      >
        <path
          d="M2 2 L2 19 L6.5 14 L10 22 L13 21 L9.5 13 L15 13 Z"
          fill="white"
          stroke="#3a3a3a"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </AbsoluteFill>
  );
};

// ── Caption layer — full-video rolling subtitles ──────────────────────────────
// Shows the 4 most recently started words from the v3 transcript.
// White text on rgba(13,13,13,.86) pill, bottom-center, ≥34px.
// Visible in every scene (dark VS arena and bright browser alike).

const CaptionLayer: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / FPS;

  // Find which group is active now
  let groupIdx = -1;
  for (let i = 0; i < CAPTION_GROUPS.length; i++) {
    if (CAPTION_GROUPS[i].start <= t + 0.04) groupIdx = i; else break;
  }
  // Suppress if: no group found, or still in VS slam, or BSF not yet dissolved.
  // BSF dissolves at B.panelRise + 22 — captions must not ghost during the black hold.
  if (groupIdx < FIRST_CAPTION_GROUP_IDX || frame < B.panelRise + 22) return null;
  const group = CAPTION_GROUPS[groupIdx];

  // Hide if we're past this group's end + silence gap
  if (t > group.end + 0.75) return null;

  // Apply ASR corrections and build display text
  const rawText = group.words.map(w => w.w).join(" ");
  const text = fixAsr(rawText);
  if (!text) return null;

  const fadeIn = clamp01((t - group.start) * 14);
  const nextGroup = CAPTION_GROUPS[groupIdx + 1];
  const fadeOut = nextGroup && (nextGroup.start - group.end) > 0.4
    ? clamp01(1 - (t - group.end - 0.05) * 10)
    : 1;
  const opacity = fadeIn * fadeOut;
  if (opacity <= 0.02) return null;

  return (
    <div style={{
      position: "absolute",
      bottom: 44,
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(13,13,13,.86)",
      color: "#ffffff",
      fontFamily: UI_FONT,
      fontSize: 36,
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: "0.005em",
      padding: "10px 30px",
      borderRadius: 12,
      whiteSpace: "nowrap",
      maxWidth: "84%",
      textAlign: "center",
      zIndex: 40,
      opacity,
    }}>
      {text}
    </div>
  );
};

// ── SFX layer ─────────────────────────────────────────────────────────────────
// VO always dominates. All SFX volumes are set so no SFX masks a spoken word.

const SFXLayer: React.FC = () => (
  <>
    {/* Beat-drop: confident open at frame 0 — not a jump-scare */}
    <Sequence from={0} durationInFrames={9}>
      <Audio src={staticFile("sfx/beat-drop.m4a")} volume={0.22} />
    </Sequence>

    {/* Beat-drop: panel rise transition */}
    <Sequence from={B.panelRise} durationInFrames={9}>
      <Audio src={staticFile("sfx/beat-drop.m4a")} volume={0.18} />
    </Sequence>

    {/* Whoosh: picker stage enters */}
    <Sequence from={B.pickerIn - 4} durationInFrames={11}>
      <Audio src={staticFile("sfx/whoosh.m4a")} volume={0.15} />
    </Sequence>

    {/* Whoosh: race stage enters */}
    <Sequence from={B.race - 4} durationInFrames={11}>
      <Audio src={staticFile("sfx/whoosh.m4a")} volume={0.15} />
    </Sequence>

    {/* Whoosh: scoreboard enters */}
    <Sequence from={B.score - 4} durationInFrames={11}>
      <Audio src={staticFile("sfx/whoosh.m4a")} volume={0.14} />
    </Sequence>

    {/* Drone-tension bed — barely noticeable, ducked deep under VO */}
    <Sequence from={B.race} durationInFrames={B.score - B.race + 20}>
      <Audio src={staticFile("sfx/drone-tension.m4a")} volume={0.04} />
    </Sequence>

    {/* Typewriter: subtle ambient texture under race terminal log */}
    <Sequence from={B.race} durationInFrames={B.score - B.race}>
      <Audio src={staticFile("sfx/typewriter.m4a")} volume={0.06} />
    </Sequence>

    {/* Stamp: metric reveals — impact from picture, not loudness */}
    <Sequence from={B.score} durationInFrames={4}>
      <Audio src={staticFile("sfx/stamp.m4a")} volume={0.26} />
    </Sequence>
    <Sequence from={B.costReveal} durationInFrames={4}>
      <Audio src={staticFile("sfx/stamp.m4a")} volume={0.26} />
    </Sequence>
    <Sequence from={B.tokensReveal} durationInFrames={4}>
      <Audio src={staticFile("sfx/stamp.m4a")} volume={0.26} />
    </Sequence>

    {/* Ding-winner: gentle reward when DSH freezes */}
    <Sequence from={429} durationInFrames={12}>
      <Audio src={staticFile("sfx/ding-winner.m4a")} volume={0.22} />
    </Sequence>

    {/* ── MUSIC BED STEM (pending) ──────────────────────────────────────────────
      File: public/sfx2/music-bed-55s.m4a (section map TBD from assembly).
      When the file lands, wire it here at low gain (≈0.12) so assembly can
      bring it up in the final mix. The SFX stems above stay at their current
      gains — no adjustments needed for the music bed to sit under them.
      Suggested entry: from={B.panelRise} across the full browser-world stretch.
    ──────────────────────────────────────────────────────────────────────────── */}
  </>
);

// ── Root composition ──────────────────────────────────────────────────────────

export const AgentSkyPlaygroundDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: C.canvas, fontFamily: FONT}}>
      <Fonts />
      <Audio src={staticFile("vo3/183552-v3.m4a")} />
      <SFXLayer />

      <VsScreen frame={frame} />
      <BlackSquareFill frame={frame} />

      <PanelChrome frame={frame}>
        <WelcomeView frame={frame} />
        <PickerStage frame={frame} />
        <RaceStage frame={frame} />
        <Scoreboard frame={frame} />
      </PanelChrome>

      <CursorLayer_Composer frame={frame} />
      <CaptionLayer frame={frame} />
      <IllustrativeWatermark frame={frame} />
    </AbsoluteFill>
  );
};
