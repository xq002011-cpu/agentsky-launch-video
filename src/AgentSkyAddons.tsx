/**
 * AgentSkyAddons v3 — beat-grid re-choreograph
 *
 * Audio: public/vo3/183109-vo-first-sentence.m4a (4.7s first sentence only)
 * Camera: take-183109.mp4, Phase A only (OffthreadVideo, black-frame fix)
 * Beat bed: 90 BPM pulse using sfx2 assets on grid
 *
 * Phases:
 *   A  0–101     Camera on Xiaoyin, captions, punch-in
 *   B  101–300   White UI: ADD-ONS slam, beat-grid icon pops → socket snap
 *   C  300–360   Dark code scene, composer typing, ✓ done
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  Sequence,
} from "remotion";
import {Audio} from "@remotion/media";

// ─── Beat map — 90 BPM grid (20 frames/beat at 30fps) ────────────────────────
const FPS = 30;
const sf = (s: number) => Math.round(s * FPS);

const B = {
  addons:    101,  // 3.36s — "add-ons" word → cut to white UI
  browsers:  141,  // beat 2 after cut (2 beats setup for slam/card)
  images:    161,
  videos:    181,
  webSearch: 201,
  channels:  221,  // you-dot appears, 1-beat pause before channel pops
  imessage:  241,
  whatsapp:  261,
  slack:     281,
  access:    281,  // you-pulse fires as Slack snaps
  code:      301,  // cut to dark code scene
  highlight: 335,  // "addons" line highlights
} as const;

export const AGENT_SKY_ADDONS_DURATION = 360; // 12s × 30fps

// ─── Caption groups — ONLY the spoken sentence ───────────────────────────────
const CAPTIONS = [
  {s: 0.0,  e: 2.2, t: "We gave you agents with models built in,"},
  {s: 2.3,  e: 4.5, t: "but we also have add-ons."},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FONTS = `
@font-face{font-family:'Space Grotesk';src:url('${staticFile("SpaceGrotesk-Bold.ttf")}')format('truetype');font-weight:700}
@font-face{font-family:'Plus Jakarta Sans';src:url('${staticFile("fonts/PlusJakartaSans-SemiBold.ttf")}')format('truetype');font-weight:600}
@font-face{font-family:'Geist Mono';src:url('${staticFile("fonts/GeistMono-SemiBold.ttf")}')format('truetype');font-weight:600}
`;

function beatSpring(frame: number, bf: number, stiff = 400, damp = 22): number {
  if (frame < bf) return 0;
  return spring({frame: frame - bf, fps: FPS, config: {stiffness: stiff, damping: damp}});
}
function popSpring(frame: number, bf: number): number {
  if (frame < bf) return 0;
  return spring({frame: frame - bf, fps: FPS, config: {stiffness: 550, damping: 18}});
}
function lerpRGB(p: number, a: [number,number,number], b: [number,number,number]): string {
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*p)},${Math.round(a[1]+(b[1]-a[1])*p)},${Math.round(a[2]+(b[2]-a[2])*p)})`;
}
function shineClip(frame: number, startFrame: number): string | null {
  if (frame < startFrame || frame > startFrame + 16) return null;
  const t = (frame - startFrame) / 16;
  const x = -60 + t * 200;
  return `polygon(${x}% 0%, ${x+60}% 0%, ${x+20}% 100%, ${x-40}% 100%)`;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  canvas: "#f7f7f8", panel: "#ffffff", ink: "#0d0d0d",
  faint: "#7a7a7a", brand: "#1683f3", line: "#ececec",
  dCanvas: "#141414", dPanel: "#1b1b1b", dLine: "#2a2a2a",
};

// ─── Per-tile colors ──────────────────────────────────────────────────────────
const TOOL_COLORS = [
  {r:22,g:131,b:243}, {r:52,g:199,b:89}, {r:255,g:69,b:58}, {r:255,g:159,b:10},
];
const CHANNEL_COLORS = [
  {r:0,g:190,b:176}, {r:37,g:211,b:102}, {r:74,g:21,b:75},
];

// ─── STAGE + SOCKET constants — marketing scale ───────────────────────────────
const STAGE_CX = 960;
const STAGE_CY = 530;    // mid-frame stage
const STAGE_SIZE = 290;  // hero ≥ 280px ✓
const SOC_SIZE = 160;    // socket ≥ 120px ✓
const HOLD_FRAMES = 6;   // tight hold on beat grid

// 7 sockets centered at 960: 4 tools + sep + 3 channels → span 1340px ≥ 1100px ✓
const SOCKET_X = [370, 558, 746, 934, 1174, 1362, 1550];
const SOCKET_Y = 720;
const AGENT_CARD_CY = 295; // top 195, bottom 395
const SOCK_LABELS = ["browser","images","videos","web search","iMessage","WhatsApp","Slack"];

// ─── Squircle wrappers ────────────────────────────────────────────────────────
function SquircleTool({size, bg="#ffffff", children}: {size:number; bg?:string; children:React.ReactNode}) {
  return (
    <div style={{
      width:size, height:size, borderRadius:Math.round(size*0.22),
      background:bg, overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</div>
  );
}
function SquircleChannel({size, bg, children}: {size:number; bg:string; children:React.ReactNode}) {
  return (
    <div style={{
      width:size, height:size, borderRadius:Math.round(size*0.22),
      background:bg, overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</div>
  );
}

// ─── Glyphs (duotone) ─────────────────────────────────────────────────────────
function GlyphBrowser({s}: {s:number}) {
  const sc = s/90;
  return <svg width={90*sc} height={78*sc} viewBox="0 0 90 78" fill="none">
    <rect x="3" y="3" width="84" height="62" rx="9" stroke="#1a1a1a" strokeWidth="3"/>
    <line x1="3" y1="20" x2="87" y2="20" stroke="#1a1a1a" strokeWidth="2"/>
    <circle cx="45" cy="44" r="14" stroke={T.brand} strokeWidth="2.5"/>
    <ellipse cx="45" cy="44" rx="6" ry="14" stroke={T.brand} strokeWidth="1.8"/>
    <line x1="31" y1="44" x2="59" y2="44" stroke={T.brand} strokeWidth="1.8"/>
  </svg>;
}
function GlyphImages({s}: {s:number}) {
  const sc = s/90;
  return <svg width={90*sc} height={78*sc} viewBox="0 0 90 78" fill="none">
    <rect x="3" y="3" width="84" height="62" rx="9" stroke="#1a1a1a" strokeWidth="3"/>
    <polyline points="8,60 24,34 40,48 58,24 82,60" stroke={T.brand} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx="70" cy="20" r="7" stroke={T.brand} strokeWidth="2.5"/>
  </svg>;
}
function GlyphVideos({s}: {s:number}) {
  const sc = s/90;
  return <svg width={90*sc} height={78*sc} viewBox="0 0 90 78" fill="none">
    <rect x="3" y="3" width="84" height="62" rx="9" stroke="#1a1a1a" strokeWidth="3"/>
    <polygon points="32,20 32,58 70,39" fill={T.brand}/>
  </svg>;
}
function GlyphSearch({s}: {s:number}) {
  const sc = s/90;
  return <svg width={90*sc} height={90*sc} viewBox="0 0 90 90" fill="none">
    <circle cx="36" cy="36" r="24" stroke="#1a1a1a" strokeWidth="3"/>
    <line x1="54" y1="54" x2="82" y2="82" stroke={T.brand} strokeWidth="5" strokeLinecap="round"/>
    <line x1="36" y1="24" x2="36" y2="48" stroke={T.brand} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <line x1="24" y1="36" x2="48" y2="36" stroke={T.brand} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
  </svg>;
}
function LogoIMessage({s}: {s:number}) {
  return <svg width={s*0.72} height={s*0.72} viewBox="0 0 64 64" fill="none">
    <defs><linearGradient id="im" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop stopColor="#00C7BE"/><stop offset="1" stopColor="#5AC8FA"/>
    </linearGradient></defs>
    <path d="M32 4C16.5 4 4 16.5 4 32c0 8 3.8 15.2 9.8 20L11 52l8-3C22.4 51 27 52 32 52c15.5 0 28-12.5 28-28S47.5 4 32 4z" fill="url(#im)"/>
    <path d="M20 29h12M20 37h20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
  </svg>;
}
function LogoWhatsApp({s}: {s:number}) {
  return <svg width={s*0.72} height={s*0.72} viewBox="0 0 64 64" fill="none">
    <path d="M32 4C16.5 4 4 16.5 4 32c0 5.5 1.6 10.6 4.4 14.9L4 60l13.4-4.4C21.6 58.4 26.7 60 32 60c15.5 0 28-12.5 28-28S47.5 4 32 4z" fill="white"/>
    <path d="M42.4 38.4l-3.4-1.5c-.6-.3-1.2-.1-1.6.3l-.9 1.1c-.5.6-1.2.7-1.8.4-1.4-.7-4-2.8-5.6-4.5-1.6-1.9-2.7-4.4-3-5.9-.1-.6.2-1.3.7-1.5l1.1-.7c.5-.3.7-.9.5-1.4l-1.5-3.6c-.3-.7-1-.9-1.6-.6-1.1.6-2.2 1.4-2.8 2.7-1 2.2-.1 5.8 2.9 9.5 3.1 4 6.6 6.2 9 7 1.4.4 4.9.7 7-.4 1.3-.7 2-1.9 2.3-3 .3-.7-.1-1.3-1.3-1.9z" fill="#25D366"/>
  </svg>;
}
function LogoSlack({s}: {s:number}) {
  return <svg width={s*0.72} height={s*0.72} viewBox="0 0 64 64" fill="none">
    <rect x={13} y={26} width={18} height={12} rx={6} fill="#36C5F0"/>
    <rect x={26} y={13} width={12} height={18} rx={6} fill="#36C5F0"/>
    <rect x={33} y={26} width={18} height={12} rx={6} fill="#2EB67D"/>
    <rect x={26} y={33} width={12} height={18} rx={6} fill="#ECB22E"/>
    <rect x={13} y={20} width={18} height={12} rx={6} fill="#E01E5A"/>
    <rect x={20} y={13} width={12} height={18} rx={6} fill="#E01E5A"/>
    <rect x={33} y={20} width={18} height={12} rx={6} fill="#2EB67D"/>
    <rect x={40} y={13} width={12} height={18} rx={6} fill="#2EB67D"/>
    <rect x={20} y={33} width={12} height={18} rx={6} fill="#36C5F0"/>
    <rect x={13} y={33} width={18} height={12} rx={6} fill="#36C5F0"/>
    <rect x={40} y={33} width={12} height={18} rx={6} fill="#ECB22E"/>
    <rect x={33} y={33} width={18} height={12} rx={6} fill="#ECB22E"/>
  </svg>;
}

function renderIconForSlot(slot: number, size: number): React.ReactNode {
  const g = Math.round(size * 0.58);
  switch (slot) {
    case 0: return <SquircleTool size={size} bg="#f2f5ff"><GlyphBrowser s={g}/></SquircleTool>;
    case 1: return <SquircleTool size={size} bg="#f2faf3"><GlyphImages s={g}/></SquircleTool>;
    case 2: return <SquircleTool size={size} bg="#fff2f2"><GlyphVideos s={g}/></SquircleTool>;
    case 3: return <SquircleTool size={size} bg="#fffbf0"><GlyphSearch s={g}/></SquircleTool>;
    case 4: return <SquircleChannel size={size} bg="linear-gradient(145deg,#00C7BE,#5AC8FA)"><LogoIMessage s={size}/></SquircleChannel>;
    case 5: return <SquircleChannel size={size} bg="#25D366"><LogoWhatsApp s={size}/></SquircleChannel>;
    case 6: return <SquircleChannel size={size} bg="#4A154B"><LogoSlack s={size}/></SquircleChannel>;
    default: return null;
  }
}

// ─── WhiteUIScene ─────────────────────────────────────────────────────────────
function WhiteUIScene() {
  const frame = useCurrentFrame();

  const panelP = beatSpring(frame, B.addons, 260, 28);
  const stampP = beatSpring(frame, B.addons, 560, 14);
  const stampSc = interpolate(stampP, [0,1], [1.22, 1.0]);

  const BEATS = [
    {bf:B.browsers,  label:"browser",   slot:0, isChan:false},
    {bf:B.images,    label:"images",    slot:1, isChan:false},
    {bf:B.videos,    label:"videos",    slot:2, isChan:false},
    {bf:B.webSearch, label:"web search",slot:3, isChan:false},
    {bf:B.imessage,  label:"iMessage",  slot:4, isChan:true},
    {bf:B.whatsapp,  label:"WhatsApp",  slot:5, isChan:true},
    {bf:B.slack,     label:"Slack",     slot:6, isChan:true},
  ];

  const states = BEATS.map((b) => {
    const lit = frame >= b.bf;
    const stageP = lit ? Math.min(popSpring(frame, b.bf), 1.12) : 0;
    const glideStart = b.bf + HOLD_FRAMES;
    const glideP = frame >= glideStart ? beatSpring(frame, glideStart, 200, 26) : 0;
    const dstX = SOCKET_X[b.slot];
    const curX = interpolate(glideP, [0,1], [STAGE_CX, dstX]);
    const curY = interpolate(glideP, [0,1], [STAGE_CY, SOCKET_Y]);
    const curSz = interpolate(glideP, [0,1], [STAGE_SIZE, SOC_SIZE]);
    const onStage = lit && glideP < 0.80;
    const snapped = glideP >= 0.88;
    const snapFrame = glideStart + 18;
    const flashAge = snapped ? frame - snapFrame : -1;
    const flashP = flashAge >= 0 && flashAge < 12 ? (12-flashAge)/12 : 0;
    const settleT = frame - snapFrame;
    const settle = settleT >= 0 && settleT < 10 ? Math.sin(Math.PI*settleT/10)*0.14 : 0;
    const sockSc = snapped ? 1+settle : 1;
    return {...b, lit, stageP, glideP, curX, curY, curSz, onStage, snapped, flashP, sockSc};
  });

  const hero = states.filter(s => s.onStage).pop();
  const shine = hero ? shineClip(frame, hero.bf) : null;
  const litChans = states.filter(s => s.isChan && s.lit);
  const latestChan = litChans[litChans.length-1];
  const tint = latestChan ? CHANNEL_COLORS[latestChan.slot-4] : null;

  const pulse = (() => {
    const t = frame - B.access;
    return t >= 0 && t < 28 ? Math.sin(Math.PI*t/28)*0.03 : 0;
  })();

  const pulseAge = frame - B.access;
  const youPulseP = pulseAge >= 0 && pulseAge < 20 ? pulseAge/20 : pulseAge >= 20 ? 1 : 0;
  const agentPulseP = pulseAge >= 14 && pulseAge < 34 ? (pulseAge-14)/20 : pulseAge >= 34 ? 1 : 0;
  const showPulse = pulseAge >= 0 && pulseAge < 42;

  const YOU_X = 1690; const YOU_Y = SOCKET_Y;
  const pulseTargetX = SOCKET_X[4]; const pulseTargetY = SOCKET_Y;

  const shimmerOf = (slot: number) => {
    const t = frame - (B.access + slot*4);
    return t >= 0 && t < 14 ? Math.sin(Math.PI*t/14) : 0;
  };

  return (
    <AbsoluteFill style={{background:T.canvas}}>
      <style>{FONTS}</style>
      {/* Subtle dot grid — kills featureless white */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:`radial-gradient(circle, rgba(0,0,0,0.04) 1.5px, transparent 1.5px)`,
        backgroundSize:"44px 44px",
        pointerEvents:"none",
      }}/>

      {tint && (
        <div style={{position:"absolute",inset:0,
          background:`rgba(${tint.r},${tint.g},${tint.b},0.022)`,pointerEvents:"none"}}/>
      )}

      {/* ADD-ONS slam ≥120px ✓ */}
      <div style={{
        position:"absolute", left:80, top:48,
        fontFamily:"'Space Grotesk', sans-serif",
        fontSize:128, fontWeight:700, color:T.ink,
        letterSpacing:"-0.035em", lineHeight:1,
        opacity:stampP,
        transform:`scale(${stampSc})`,
        transformOrigin:"left center",
      }}>ADD-ONS</div>

      {/* "your agent" card — 1000×200 ≥640×150 ✓ */}
      <div style={{
        position:"absolute",
        left:960-500, top:AGENT_CARD_CY-100,
        width:1000, height:200,
        background:T.panel,
        border:`2px solid ${T.line}`,
        borderRadius:24,
        display:"flex", alignItems:"center",
        padding:"0 48px", gap:28,
        opacity:panelP,
        transform:`scale(${1+pulse}) translateY(${interpolate(panelP,[0,1],[20,0])}px)`,
        transformOrigin:"center center",
        boxShadow:"0 4px 28px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width:70, height:70, borderRadius:18, background:"#f2f2f5",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:34, flexShrink:0,
        }}>🤖</div>
        <div>
          <div style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:30, fontWeight:600, color:T.ink, lineHeight:1.25,
          }}>your agent</div>
          <div style={{
            fontFamily:"'Geist Mono', monospace",
            fontSize:18, color:T.faint, lineHeight:1.4,
          }}>claude-opus-4-5</div>
        </div>
        {states.filter(s=>s.snapped).length > 0 && (
          <div style={{
            marginLeft:"auto",
            fontFamily:"'Geist Mono', monospace",
            fontSize:16, color:T.brand, background:"rgba(22,131,243,0.08)",
            borderRadius:99, padding:"6px 18px",
          }}>
            {states.filter(s=>s.snapped).length} add-on{states.filter(s=>s.snapped).length>1?"s":""}
          </div>
        )}
      </div>

      {/* Bay labels + sockets */}
      {frame >= B.addons + 4 && (
        <>
          {/* TOOLS eyebrow ≥26px ✓ */}
          <div style={{
            position:"absolute", left:290, top:SOCKET_Y-SOC_SIZE/2-50,
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:28, fontWeight:600, color:T.faint,
            letterSpacing:"0.1em", textTransform:"uppercase" as const,
            opacity:panelP,
          }}>Tools</div>

          {/* CHANNELS eyebrow */}
          <div style={{
            position:"absolute", left:1094, top:SOCKET_Y-SOC_SIZE/2-50,
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:28, fontWeight:600, color:T.faint,
            letterSpacing:"0.1em", textTransform:"uppercase" as const,
            opacity:panelP,
          }}>Channels</div>

          {/* "you" avatar — appears at channels beat */}
          <div style={{
            position:"absolute",
            left:YOU_X-40, top:YOU_Y-40,
            width:80, height:80, borderRadius:"50%",
            background:"#f0f0f5",
            border:"2px solid rgba(0,0,0,0.06)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:16, fontWeight:600, color:T.faint,
            opacity:panelP*(frame>=B.channels?1:0),
          }}>you</div>

          {/* Ghost sockets */}
          {states.map((s,i) => {
            const shimmerP = shimmerOf(i);
            return (
              <div key={`sock-${i}`} style={{
                position:"absolute",
                left:SOCKET_X[i]-SOC_SIZE/2, top:SOCKET_Y-SOC_SIZE/2,
                width:SOC_SIZE, height:SOC_SIZE,
                borderRadius:Math.round(SOC_SIZE*0.22),
                border:s.snapped
                  ?`2px solid rgba(22,131,243,${0.3+shimmerP*0.45})`
                  :`2px dashed ${T.line}`,
                opacity:panelP,
                boxShadow:s.snapped && shimmerP>0
                  ?`0 0 ${18*shimmerP}px rgba(22,131,243,${0.3*shimmerP})`:"none",
              }}/>
            );
          })}

          {/* Socket labels */}
          {states.map((s,i) => (
            <div key={`lbl-${i}`} style={{
              position:"absolute",
              left:SOCKET_X[i]-70, top:SOCKET_Y+SOC_SIZE/2+12,
              width:140, textAlign:"center" as const,
              fontFamily:"'Plus Jakarta Sans', sans-serif",
              fontSize:20, fontWeight:600, color:T.faint,
              opacity:panelP*(s.snapped?1:0.28),
              letterSpacing:"-0.01em",
            }}>{SOCK_LABELS[i]}</div>
          ))}

          {/* Click-flash rings */}
          {states.map((s,i) => s.flashP>0 && (
            <div key={`flash-${i}`} style={{
              position:"absolute",
              left:SOCKET_X[i]-(SOC_SIZE/2+10*s.flashP),
              top:SOCKET_Y-(SOC_SIZE/2+10*s.flashP),
              width:SOC_SIZE+20*s.flashP,
              height:SOC_SIZE+20*s.flashP,
              borderRadius:"50%",
              border:`2.5px solid rgba(22,131,243,${0.55*s.flashP})`,
              pointerEvents:"none",
            }}/>
          ))}

          {/* Separator line (tools/channels) */}
          <div style={{
            position:"absolute",
            left:1054, top:SOCKET_Y-SOC_SIZE/2-14,
            width:1, height:SOC_SIZE+28,
            background:T.line,
            opacity:panelP*0.6,
          }}/>
        </>
      )}

      {/* Gliding/snapped icons */}
      {states.map((s,i) => {
        if (!s.lit || s.onStage) return null;
        const sz = Math.round(s.snapped?SOC_SIZE*s.sockSc:s.curSz);
        return (
          <div key={`icon-${i}`} style={{
            position:"absolute",
            left:s.snapped?SOCKET_X[i]-sz/2:s.curX-sz/2,
            top:s.snapped?SOCKET_Y-sz/2:s.curY-sz/2,
            width:sz, height:sz,
            opacity:s.glideP, pointerEvents:"none",
          }}>
            {renderIconForSlot(s.slot,sz)}
            {!s.snapped && s.glideP>0.06 && s.glideP<0.78 && (
              <div style={{
                position:"absolute", top:-8, right:-8,
                width:28, height:28, borderRadius:"50%",
                background:T.brand, color:"white",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, fontWeight:700, lineHeight:1,
                opacity:Math.min(1,(0.78-s.glideP)/0.5),
              }}>+</div>
            )}
          </div>
        );
      })}

      {/* Stage hero */}
      {hero && (() => {
        const sz = Math.round(STAGE_SIZE*Math.min(hero.stageP,1.12));
        const c = hero.isChan?CHANNEL_COLORS[hero.slot-4]:TOOL_COLORS[hero.slot];
        return <>
          <div style={{
            position:"absolute",
            left:STAGE_CX-190, top:STAGE_CY-190,
            width:380, height:380, borderRadius:"50%",
            background:`radial-gradient(circle,rgba(${c.r},${c.g},${c.b},0.22) 0%,rgba(${c.r},${c.g},${c.b},0) 70%)`,
            opacity:hero.stageP, pointerEvents:"none",
          }}/>
          <div style={{
            position:"absolute",
            left:STAGE_CX-sz/2, top:STAGE_CY-sz/2,
            width:sz, height:sz,
            pointerEvents:"none", overflow:"hidden",
          }}>
            {renderIconForSlot(hero.slot,sz)}
            {shine && (
              <div style={{
                position:"absolute", inset:0,
                background:"linear-gradient(135deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.38) 50%,rgba(255,255,255,0) 100%)",
                clipPath:shine,
                borderRadius:Math.round(sz*0.22),
              }}/>
            )}
          </div>
          <div style={{
            position:"absolute", left:0, right:0, top:STAGE_CY+STAGE_SIZE/2+20,
            textAlign:"center",
            fontFamily:"'Geist Mono', monospace",
            fontSize:22, color:T.faint,
            opacity:hero.stageP,
          }}>{hero.label}</div>
        </>;
      })()}

      {/* you→channel→agent pulse */}
      {showPulse && (
        <svg width={1920} height={1080} style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}>
          <line x1={YOU_X} y1={YOU_Y} x2={pulseTargetX} y2={pulseTargetY}
            stroke={T.brand} strokeWidth={2}
            strokeDasharray={YOU_X-pulseTargetX}
            strokeDashoffset={(YOU_X-pulseTargetX)*(1-youPulseP)}
            opacity={0.45}
          />
          <line x1={pulseTargetX} y1={pulseTargetY} x2={960} y2={AGENT_CARD_CY+100}
            stroke={T.brand} strokeWidth={2}
            strokeDasharray={Math.hypot(960-pulseTargetX,(AGENT_CARD_CY+100)-pulseTargetY)}
            strokeDashoffset={Math.hypot(960-pulseTargetX,(AGENT_CARD_CY+100)-pulseTargetY)*(1-agentPulseP)}
            opacity={0.45}
          />
        </svg>
      )}
    </AbsoluteFill>
  );
}

// ─── CodeScene ────────────────────────────────────────────────────────────────
function CodeScene() {
  const frame = useCurrentFrame();
  const entryP     = beatSpring(frame, B.code, 320, 24);
  const chatEntryP = beatSpring(frame, B.code+12, 280, 24);
  const highlightP = beatSpring(frame, B.highlight, 440, 18);

  const codelines = [
    {key:"ag", text:'  "agent":  "hermes",', hl:false},
    {key:"md", text:'  "model":  "v4-pro",', hl:false},
    {key:"ao", text:'  "addons": [ … ]',      hl:true},
  ];

  const TYPE_START = B.code + 8;
  const USER_MSG = 'add hermes agent via agentsky + API key';
  const typeLen = frame >= TYPE_START
    ? Math.min(USER_MSG.length, Math.floor((frame-TYPE_START)*4.5))
    : 0;
  const userVisible = USER_MSG.slice(0, typeLen);
  const replyFrame = TYPE_START + Math.ceil(USER_MSG.length/4.5) + 5;
  const replyP = beatSpring(frame, replyFrame, 380, 24);
  const typeDone = typeLen >= USER_MSG.length;
  const sendActivated = typeDone && replyP < 0.15;

  return (
    <AbsoluteFill style={{background:T.dCanvas, alignItems:"center", justifyContent:"center"}}>
      <style>{FONTS}</style>
      <div style={{display:"flex", gap:32, alignItems:"flex-start", width:1800, maxWidth:"calc(100% - 60px)"}}>

        {/* LEFT: API card ≥780px ✓ */}
        <div style={{
          flex:"0 0 900px",
          background:T.dPanel,
          border:`1px solid ${T.dLine}`,
          borderRadius:16,
          padding:"44px 56px",
          transform:`translateY(${interpolate(entryP,[0,1],[28,0])}px)`,
          opacity:entryP,
        }}>
          <div style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:14, fontWeight:600, color:"#555",
            letterSpacing:"0.09em", textTransform:"uppercase" as const,
            marginBottom:8,
          }}>Use the API</div>
          <div style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:14, color:T.brand,
            marginBottom:32,
          }}>One parameter in the API</div>
          {codelines.map(ln => (
            <div key={ln.key} style={{
              fontFamily:"'Geist Mono', monospace",
              fontSize:30,
              lineHeight:1.9,
              letterSpacing:"-0.02em",
              color:ln.hl ? lerpRGB(highlightP,[192,192,192],[22,131,243]) : "#c0c0c0",
              background:ln.hl && highlightP>0 ? `rgba(22,131,243,${0.15*highlightP})` : "transparent",
              borderRadius:ln.hl?6:0,
              padding:ln.hl?"2px 10px":"0",
              margin:ln.hl?"0 -10px":"0",
            }}>{ln.text}</div>
          ))}
        </div>

        {/* RIGHT: Composer card */}
        {(() => {
          return (
            <div style={{
              flex:"1 1 0",
              background:T.dPanel,
              border:`1px solid ${T.dLine}`,
              borderRadius:16,
              padding:"44px 48px",
              transform:`translateY(${interpolate(chatEntryP,[0,1],[28,0])}px)`,
              opacity:chatEntryP,
              minHeight:280,
              display:"flex",
              flexDirection:"column",
            }}>
              <div style={{
                fontFamily:"'Plus Jakarta Sans', sans-serif",
                fontSize:14, fontWeight:600, color:"#555",
                letterSpacing:"0.09em", textTransform:"uppercase" as const,
                marginBottom:32,
              }}>Ask your agent</div>

              <div style={{
                position:"relative",
                background:"rgba(255,255,255,0.06)",
                border:`1.5px solid ${sendActivated?T.brand:T.dLine}`,
                borderRadius:14,
                padding:"18px 60px 18px 20px",
                minHeight:86,
                boxShadow:sendActivated?`0 0 0 3px rgba(22,131,243,0.18)`:"none",
              }}>
                <span style={{
                  fontFamily:"'Plus Jakarta Sans', sans-serif",
                  fontSize:18, fontWeight:500, color:"#ddd",
                  lineHeight:1.6,
                }}>
                  {userVisible}
                  {!typeDone && (
                    <span style={{opacity:Math.floor(frame/5)%2===0?1:0,color:T.brand,fontWeight:300}}>|</span>
                  )}
                </span>
                <div style={{
                  position:"absolute", right:14, bottom:14,
                  width:34, height:34, borderRadius:"50%",
                  background:sendActivated?T.brand:typeDone?"rgba(22,131,243,0.55)":"rgba(255,255,255,0.10)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:sendActivated?`0 0 12px rgba(22,131,243,0.6)`:"none",
                }}>
                  <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                    <path d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div style={{
                marginTop:20,
                opacity:replyP,
                transform:`translateY(${interpolate(replyP,[0,1],[8,0])}px)`,
                display:"flex", alignItems:"center", gap:10,
              }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%",
                  background:"rgba(90,255,143,0.15)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{fontSize:14}}>✓</span>
                </div>
                <span style={{
                  fontFamily:"'Plus Jakarta Sans', sans-serif",
                  fontSize:18, color:"#5aff8f", fontWeight:600,
                }}>done</span>
              </div>
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
}

// ─── CaptionPill — spoken sentence only ──────────────────────────────────────
function CaptionPill() {
  const frame = useCurrentFrame();
  const secs = frame / FPS;
  const active = CAPTIONS.find(c => secs >= c.s && secs <= c.e);
  if (!active) return null;
  return (
    <AbsoluteFill style={{justifyContent:"flex-end", alignItems:"center", paddingBottom:56, pointerEvents:"none"}}>
      <div style={{
        background:"rgba(13,13,13,0.88)", borderRadius:10,
        padding:"14px 36px", maxWidth:1060, textAlign:"center",
        fontFamily:"'Plus Jakarta Sans', sans-serif",
        fontSize:34, color:"#fff", fontWeight:600, lineHeight:1.4,
      }}>{active.t}</div>
    </AbsoluteFill>
  );
}

// ─── AgentSkyAddons ───────────────────────────────────────────────────────────
export function AgentSkyAddons() {
  const frame = useCurrentFrame();

  const punchScale = interpolate(frame, [0, B.addons], [1.0, 1.06], {
    easing:Easing.inOut(Easing.ease),
    extrapolateRight:"clamp",
  });

  const SFX = (name: string) => staticFile(`sfx2/${name}`);

  // 90 BPM beat bed: quiet typewriter ticks every 20 frames from addons→code
  const BEAT_COUNT = Math.floor((B.code - B.addons) / 20);
  const beatTicks = Array.from({length:BEAT_COUNT}, (_,i) => B.addons + i*20);

  // Icon snap SFX (7 pops)
  const SNAP_BEATS = [B.browsers, B.images, B.videos, B.webSearch, B.imessage, B.whatsapp, B.slack];

  return (
    <AbsoluteFill style={{background:"#000"}}>
      <style>{FONTS}</style>

      {/* Full spoken VO — first sentence only */}
      <Audio src={staticFile("vo3/183109-vo-first-sentence.m4a")} />

      {/* Beat bed: quiet drone from addons */}
      <Sequence from={B.addons} durationInFrames={B.code - B.addons}>
        <Audio src={SFX("drone-tension.m4a")} volume={0.025} />
      </Sequence>

      {/* 90 BPM tick grid (beat bed) */}
      {beatTicks.map((f,i) => (
        <Sequence key={`bb-${i}`} from={f} durationInFrames={5}>
          <Audio src={SFX("typewriter.m4a")} volume={0.032}/>
        </Sequence>
      ))}

      {/* Phase A: camera */}
      {frame < B.addons && (
        <AbsoluteFill style={{overflow:"hidden"}}>
          <OffthreadVideo
            src={staticFile("take-183109.mp4")}
            muted
            style={{
              width:"100%", height:"100%", objectFit:"cover",
              transform:`scale(${punchScale})`, transformOrigin:"center center",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Phase B: White UI */}
      {frame >= B.addons && frame < B.code && <WhiteUIScene/>}

      {/* Phase C: Code */}
      {frame >= B.code && <CodeScene/>}

      {/* ADD-ONS cut: stamp */}
      <Sequence from={B.addons} durationInFrames={8}>
        <Audio src={SFX("stamp.m4a")} volume={0.09}/>
      </Sequence>

      {/* Icon snap ticks (7 beats) */}
      {SNAP_BEATS.map((f,i) => (
        <Sequence key={`snap-${i}`} from={f} durationInFrames={6}>
          <Audio src={SFX("typewriter.m4a")} volume={0.06+i*0.005}/>
        </Sequence>
      ))}

      {/* Code cut: whoosh */}
      <Sequence from={B.code} durationInFrames={12}>
        <Audio src={SFX("whoosh.m4a")} volume={0.08}/>
      </Sequence>

      {/* Final tick at ✓ done */}
      <Sequence from={B.highlight+18} durationInFrames={6}>
        <Audio src={SFX("ding-winner.m4a")} volume={0.07}/>
      </Sequence>

      <CaptionPill/>
    </AbsoluteFill>
  );
}
