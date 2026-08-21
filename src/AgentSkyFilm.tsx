/**
 * AgentSkyFilm — Master assembly composition for the AgentSky launch film.
 *
 * Structure (locked):
 *   P     AgentSkyPlaygroundDemo   678f  (22.6s)
 *   T1    AgentSkyBlackSquareFillScene  14f
 *   I     AgentSkyIntroApi         581f  (19.4s)
 *   T2    AgentSkyBlackSquareFillScene  14f
 *   AD    AgentSkyAddons           360f  (12.0s)
 *   T3    AgentSkyBlackSquareFillScene  14f
 *   C     AgentSkyCta              150f  (5.0s)
 *
 *   Total = 1811 frames ≈ 60.4s
 *
 * Music bed: public/sfx2/music-bed-55s.m4a (55.0s, 90 BPM)
 *   gain 0.12, duck to 0.07 under VO segments
 *   dropout at verdict freeze ~frame 600-620 (P t=20.0-20.67s)
 *   S6 loop bridge [40-45.33s] repeated at film frame 1650 to fill 60.4s total
 *
 * Section alignment (90 BPM, 30fps):
 *   Music S4 peak+dropout  t=19-22s  → P verdict freeze  film f=570-660  ✓
 *   Music S5 mid-energy    t=23-38s  → Intro segment      film f=692-1272 ✓
 *   Music S6 groove        t=38-50s  → Add-ons            film f=1287-1647 ✓
 *   Music S7 final hit     t=54s     → CTA agentsky.dev   film f=1751     ✓ (via loop)
 */

import React from "react";
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from "remotion";
import {
  AGENT_SKY_PLAYGROUND_DEMO_DURATION,
  AgentSkyPlaygroundDemo,
} from "./AgentSkyPlaygroundDemo";
import {
  AGENT_SKY_INTRO_API_DURATION,
  AgentSkyIntroApi,
} from "./AgentSkyIntroApi";
import {
  AGENT_SKY_ADDONS_DURATION,
  AgentSkyAddons,
} from "./AgentSkyAddons";
import {AgentSkyBlackSquareFillScene} from "./AgentSkyBlackSquareFillScene";
import {AGENT_SKY_CTA_DURATION, AgentSkyCta} from "./AgentSkyCta";

const FPS = 30;
const TRANSITION_DUR = 14;

const P_DUR  = AGENT_SKY_PLAYGROUND_DEMO_DURATION;  // 678
const I_DUR  = AGENT_SKY_INTRO_API_DURATION;         // 581
const AD_DUR = AGENT_SKY_ADDONS_DURATION;            // 360
const C_DUR  = AGENT_SKY_CTA_DURATION;               // 150
const T_DUR  = TRANSITION_DUR;                       // 14

export const AGENT_SKY_FILM_DURATION =
  P_DUR + T_DUR + I_DUR + T_DUR + AD_DUR + T_DUR + C_DUR;
// = 678 + 14 + 581 + 14 + 360 + 14 + 150 = 1811

const T1_START  = P_DUR;                             // 678
const I_START   = T1_START + T_DUR;                  // 692
const T2_START  = I_START  + I_DUR;                  // 1273
const AD_START  = T2_START + T_DUR;                  // 1287
const T3_START  = AD_START + AD_DUR;                 // 1647
const CTA_START = T3_START + T_DUR;                  // 1661

// ── Music bed timing ─────────────────────────────────────────────────────────
// VO frame ranges (absolute film frames):
const VO_RANGES: [number, number][] = [
  [0,    678],   // Playground VO
  [692,  1272],  // Intro VO
  [1287, 1428],  // Add-ons first-sentence VO (4.7s = 141 frames)
  [1661, 1730],  // CTA VO (2.31s = ~69 frames)
];
// Verdict freeze dropout: frame 600–620 (P t=20.0–20.67s)
const DROPOUT_START = 600;
const DROPOUT_END   = 620;

const musicVolume = (frame: number): number => {
  if (frame >= DROPOUT_START && frame <= DROPOUT_END) return 0;
  for (const [a, b] of VO_RANGES) {
    if (frame >= a && frame <= b) return 0.07;
  }
  return 0.12;
};

// Loop bridge: S6 section 40–45.33s of music, played starting at film frame 1650
// to cover the 60.4s film vs 55s music gap (~5.4s gap = 162 frames)
const LOOP_FROM_FILM = 1650;                       // film frame where loop starts
const LOOP_DURATION  = AGENT_SKY_FILM_DURATION - LOOP_FROM_FILM; // 161 frames
const LOOP_MUSIC_START_S = 40;                     // seconds into music to loop from

export const AgentSkyFilm: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: "#000000"}}>
      {/* ── Music bed — main 55s ────────────────────────────────────────── */}
      <Audio
        src={staticFile("sfx2/music-bed-55s.m4a")}
        volume={musicVolume(frame)}
      />

      {/* ── Music bed — S6 loop bridge (fills remaining ~5.4s) ─────────── */}
      <Sequence from={LOOP_FROM_FILM} durationInFrames={LOOP_DURATION}>
        <Audio
          src={staticFile("sfx2/music-bed-55s.m4a")}
          startFrom={Math.round(LOOP_MUSIC_START_S * FPS)}
          volume={0.10}
        />
      </Sequence>

      {/* ── P — Playground ──────────────────────────────────────────────── */}
      <Sequence from={0} durationInFrames={P_DUR}>
        <AgentSkyPlaygroundDemo />
      </Sequence>

      {/* ── T1 — P→I transition ─────────────────────────────────────────── */}
      <Sequence from={T1_START} durationInFrames={T_DUR}>
        <AgentSkyBlackSquareFillScene />
      </Sequence>

      {/* ── I — Intro / One API ─────────────────────────────────────────── */}
      <Sequence from={I_START} durationInFrames={I_DUR}>
        <AgentSkyIntroApi />
      </Sequence>

      {/* ── T2 — I→AD transition ────────────────────────────────────────── */}
      <Sequence from={T2_START} durationInFrames={T_DUR}>
        <AgentSkyBlackSquareFillScene />
      </Sequence>

      {/* ── AD — Add-ons ────────────────────────────────────────────────── */}
      <Sequence from={AD_START} durationInFrames={AD_DUR}>
        <AgentSkyAddons />
      </Sequence>

      {/* ── T3 — AD→C transition ────────────────────────────────────────── */}
      <Sequence from={T3_START} durationInFrames={T_DUR}>
        <AgentSkyBlackSquareFillScene />
      </Sequence>

      {/* ── C — CTA ─────────────────────────────────────────────────────── */}
      <Sequence from={CTA_START} durationInFrames={C_DUR}>
        <AgentSkyCta />
      </Sequence>
    </AbsoluteFill>
  );
};
