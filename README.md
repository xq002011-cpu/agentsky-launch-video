# AgentSky Launch Film — Remotion Project

**Total runtime: ~60s (1811 frames at 30 fps)**
**Format: 1920 × 1080 @ 30 fps**

---

## Film Structure (locked order)

The four sections must appear in this exact order. Playground always comes before Add-ons.

| Section | Composition | Duration | VO file in `public/vo3/` |
|---------|-------------|----------|--------------------------|
| Playground | `AgentSkyPlaygroundDemo` | 678 frames (22.6 s) | `183552-v3.m4a` |
| Intro / One API | `AgentSkyIntroApi` | 581 frames (19.4 s) | `184040-v3.m4a` + `182749-sentence-v3.m4a` |
| Add-ons | `AgentSkyAddons` | 360 frames (12.0 s) | `183109-vo-first-sentence.m4a` |
| CTA | `AgentSkyCta` | 150 frames (5.0 s) | `183644-cta-short.m4a` |

Transitions between sections: black-square fill cascade (~14 frames each).

The master assembly composition `AgentSkyFilm` wraps all four sections in order.

---

## Source Files

| Composition | Source file |
|-------------|-------------|
| `AgentSkyPlaygroundDemo` | `src/AgentSkyPlaygroundDemo.tsx` |
| `AgentSkyIntroApi` | `src/AgentSkyIntroApi.tsx` |
| `AgentSkyAddons` | `src/AgentSkyAddons.tsx` |
| `AgentSkyCta` | `src/AgentSkyCta.tsx` |
| `AgentSkyFilm` (master) | `src/AgentSkyFilm.tsx` |
| All compositions registered | `src/Root.tsx` |

---

## Setup and Running

**Requirements:** Node 20+, pnpm 9.12.0+

```bash
pnpm install
```

**Open Remotion Studio (preview all compositions):**

```bash
npx remotion studio src/index.ts
```

Then open `http://localhost:3000` in your browser and select a composition from the left panel.

---

## Render Commands

Render individual sections (1920×1080, ProRes or H.264):

```bash
# Playground
npx remotion render src/index.ts AgentSkyPlaygroundDemo out/playground.mp4

# Intro / One API
npx remotion render src/index.ts AgentSkyIntroApi out/intro-api.mp4

# Add-ons
npx remotion render src/index.ts AgentSkyAddons out/addons.mp4

# CTA
npx remotion render src/index.ts AgentSkyCta out/cta.mp4

# Full assembled film
npx remotion render src/index.ts AgentSkyFilm out/agentsky-launch-film.mp4
```

Pre-rendered drafts for reference are in `renders/`.

---

## Word-Timestamp Anchor System

`transcripts-words/*.json` holds word-level timestamps used to sync captions and animation keyframes to the VO audio.

Each file is named `<take-id>-<version>-words.json` and contains an array of word objects:

```json
[
  { "word": "The", "start": 0.0, "end": 0.14 },
  ...
]
```

Cut maps (`*-cutmap.json`) mark which words are used vs. trimmed. The Remotion compositions read these files via `staticFile()` at runtime to drive caption timing. To adjust a caption, edit the corresponding JSON rather than hardcoding frame numbers in the component.

---

## VO Cut List

Sentences that are **intentionally not voiced** (silent sections):

| Section | Unvoiced content |
|---------|-----------------|
| Playground opener | "The biggest question…" and "Well," — these lines are silent |
| Add-ons | Everything after the first sentence is unvoiced |
| CTA | Audio ends after "Go to agentsky.dev" — tail is silent |
| Intro / One API | Fully voiced — no cuts |

---

## Brand Rules

| Rule | Detail |
|------|--------|
| Brand blue | `#1683f3` — used for primary highlights and AgentSky UI accents |
| Claude symbol | Star symbol only — no wordmark or logo lockup |
| Hermes | Text chip only — no logo or avatar |
| Grok marks | Do not use any Grok branding marks |
| DeepSeek logo | Inverts on dark backgrounds (white on dark, color on light) |
| Scoreboard label | "ILLUSTRATIVE RUN" must remain visible on the benchmark scoreboard until real benchmark data is confirmed |

---

## Audio Assets

**VO takes:** `public/vo3/` — used directly by the compositions (see table above)

**SFX:** `public/sfx/` and `public/sfx2/`
- `beat-drop.m4a` — section transitions
- `whoosh.m4a` — element entrances
- `stamp.m4a` — score reveals / data stamps
- `ding-winner.m4a` — winner reveal moment
- `drone-tension.m4a` — background tension under race sequence
- `typewriter.m4a` — text ticker / code build

**Word transcripts:** `transcripts-words/` (see anchor system above)

---

> Camera takes are 1080p proxies of the 4K originals; ask Xiaoyin for 4K masters if needed.

## AI Model Logos

`public/ai-product-logos/` — numbered PNG assets for the logo marquee and scoreboard:

`01-DeepSeek.png`, `02-ZAI.png`, `03.1-Kimi.png`, `04-Claude-Code.png`, `05-Codex.png`,
`06-Hermes-Agent.png`, `07-OpenClaw.png`, `08-Gemini.png`, `09-OpenAI.png`, `10-Grok.png`,
`11-Qwen.png`, `12-Cursor.png`, `13-Manus.png`, `14-Devin.png`, `15-Perplexity.png`


## Footage not included

Per request, this repo is **source code only** — no video files. Compositions that show on-camera segments reference footage at `public/takes/*.mp4` and `public/take-183109.mp4`; ask Xiaoyin for the camera takes and drop them at those paths before rendering those scenes. All audio tracks (`public/vo3/`), word-timestamp JSONs, SFX, music bed, logos and fonts are included, so UI-only compositions render as-is.
