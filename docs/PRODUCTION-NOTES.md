# AgentSky Launch Film — Production Notes (for the editor)

Everything an editor needs to understand, re-render, or re-cut this film.
Storyboards with per-shot cards: `docs/storyboard.html` (open in a browser; the
`storyboard-motion.html` variant animates the key shots).

## Film structure (order is LOCKED)

| # | Segment | Composition | Duration | Audio track |
|---|---------|-------------|----------|-------------|
| 1 | Playground duel | `AgentSkyPlaygroundDemo` | 22.6s | `public/vo3/183552-v3.m4a` |
| 2 | Intro / One API | `AgentSkyIntroApi` | 19.4s | `public/vo3/184040-v3.m4a` + `182749-sentence-v3.m4a` |
| 3 | Add-ons | `AgentSkyAddons` | 12.0s | `public/vo3/183109-vo-first-sentence.m4a` |
| 4 | CTA | `AgentSkyCta` | ~5s | `public/vo3/183644-cta-short.m4a` |
| — | Full assembly | `AgentSkyFilm` | 60.4s | music bed `public/sfx2/music-bed-55s.m4a` |

Hard rule: **Playground always comes before Add-ons** in any re-cut.

## VO editing record (what was cut and why)

- **Playground take (183552)**: cut "The biggest question in 2026 is," and
  "Well," (opens directly on the question). Pause-compressed + atempo 1.08.
  28.6s → 22.6s. The ASR transcript mishears two words — display text must
  always read "Claude Code" (not "Cloud Code") and "give a real task" (not
  "as a real task"). Audio is untouched; only caption text is corrected.
- **Intro take (184040)**: fully voiced, zero cuts (owner's decision — do not
  trim this take). atempo 1.05, four pause cuts only (see cutmap JSON).
- **Factory sentence**: "You can either have one for yourself, or thousands
  for your software factory." is spliced in from a different take
  (`182749-sentence-v3`, source span 12.68–16.16s). The picture during this
  sentence is full-screen animation, which hides the take change.
- **Add-ons take (183109)**: only the first sentence is voiced ("We give you
  agents with models built in, but we also have add-ons."). Everything after
  is intentionally silent — screen labels carry the words, pops land on a
  90 BPM beat grid (20 frames per beat at 30fps).
- **CTA take (183644)**: only "Go to agentsky.dev" is voiced (2.31s); the rest
  is animation.

## Word-anchor system

`transcripts-words/*.json` hold measured word timestamps `{w, s, e}` (seconds)
for every audio track, produced by Whisper large-v3-turbo and re-measured after
every edit. UI events are anchored to word times (e.g. the DeepSeek pill pops
on the word "DeepSeek"). If you re-cut audio, re-measure and update the JSON —
compositions read timings from these files, not hard-coded frames.
`*-cutmap.json` files map source-time → output-time for the spliced tracks.

## Key beats (Playground segment)

- 0–3s: fighting-game VS opening (dark arena, two fighter cards, screen shake,
  metallic VS). Captions are suppressed here — the slam type IS the caption.
- Black-square cascade transition into the white product world. During the
  cascade the VS text layer fades first (6 frames) so squares never shred live
  text; cascade cells are pure black (no hue tint) — this fixed a flicker bug.
- Continuous one-take product journey: composer ("What do you want done?") →
  "Add setup" pops the DeepSeek pill → task types: `Add 3D animation to
  homepage` → GitHub chip docks (octocat + "GitHub connected ✓", deliberately
  NO repo name) → ↑ send → same page becomes the run view.
- Run view: two Codex-style coding sessions (file-path chips, green/red diff
  lines, `pnpm build`), each column header has three LIVE meters — timer,
  rolling cost, climbing tokens. DeepSeek's meters climb slower on purpose.
- Verdict: real metrics table first (eyebrow `SAME PROMPT · 2 CONFIGS`, row
  order Billed cost → Tokens → Duration → Tool calls → Completed, winner cells
  in success green `#12805c`), then the marketing layer: loser side desaturates,
  winner pops, three delta stickers slam in ("1:07 FASTER / 3.5× CHEAPER /
  −53% TOKENS") positioned so the winner's numbers stay visible. Keep the
  `ILLUSTRATIVE RUN` tag until real benchmark numbers replace the placeholders.
- The closing VO line is the only allowed headline text ("So you can always
  select the best agent for your use case.") — on-screen big type may only
  repeat spoken words, never paraphrase.

## Key beats (Intro segment)

- Captions bottom-center for the whole film, white on `rgba(13,13,13,.86)`.
- One API diagram: ONE API card fans out to 4 combo rows — Claude Code+fable-5,
  Codex+gpt-5.6-sol, Hermes+deepseek-v4-pro, opencode+gpt-5.6-sol — each row
  lights on its spoken word; extra agents appear as small chips (pi included).
- AGENTSKY wordmark reveal is frame-anchored to the word "cloud." — the frame
  where her hands are fully spread (measured at 16.67s in the source take;
  recompute from the v3 JSON if audio changes).
- One→Thousands: single glowing agent card → exponential multiplication into a
  wall of tiles, each tile a DIFFERENT official agent logo with a one-word role
  label (testing / building / writing / reviewing / deploying …), switch-on
  cascade from center, counter rolls to "1,000+ agents · shipping".

## Key beats (Add-ons segment)

- Taxonomy must stay visible: ADD-ONS is the umbrella; TOOLS (4 sockets) and
  CHANNELS (3 sockets) are two separate bays under one bracket. Tools are
  capabilities the agent uses; channels are how YOU reach the agent (a small
  "you" avatar pulses toward the channels bay).
- Each item gets a center-stage hero pop (~290px squircle, spring + glow +
  shine) then snaps into its socket with a "+" badge.
- Final beat: split cards — left "API" (3 code lines, `"addons": [ … ]`
  highlights), right "Ask your agent": composer-style input types
  `add hermes agent via agentsky + API key` → ✓ done. The key is always masked.

## CTA segment

- Reuses the legacy multi-row logo-wall marquee scene. Center black text is
  "One API, every agent." then switches to display-size "agentsky.dev"
  (brand-blue `.dev` + underline sweep) and holds to the last frame.
- The last frame darkens toward black so X's autoloop seams back into the dark
  VS opening.

## Brand rules (violations = rework)

- Brand blue `#1683f3`. Product surfaces: canvas `#f7f7f8`, panel `#ffffff`,
  borders `#ececec`; success green `#12805c`.
- Product-UI typography: Plus Jakarta Sans (labels) + Geist Mono (slugs and all
  numbers). Space Grotesk is ONLY for big marketing type (slams, AGENTSKY, CTA).
- Claude is always the star symbol (`public/icons/claude-ai-symbol.svg`), never
  the Anthropic wordmark. Hermes has NO official logo — text chip only (do not
  substitute a drawn mark; `hermes-official.svg` was removed as an invalid
  file). No Grok marks anywhere (spoken/captioned mention is fine). The
  DeepSeek whale must be inverted/white on dark surfaces.
- Approved logo set (13): Claude Code, Codex, DeepSeek, Cline, Goose, Pi,
  opencode, Kimi Code, OpenClaw, CodeBuddy, Qwen Code, iFlow + Hermes text chip.
  No OpenAI rings or Gemini star on the CTA wall — the wall shows supported
  agents, not model vendors.

## Sound

- `public/sfx2/` is the current (gentler) SFX kit; `public/sfx/` is the louder
  v1, kept for reference. Music bed `music-bed-55s.m4a`: 90 BPM, section map in
  the storyboard; full dropout aligned to the verdict freeze; densest groove
  under the (voiceless) Add-ons section; final hit lands on the agentsky.dev
  end card. VO always dominates the mix.

## Footage

Camera takes are not in the repo (source-only decision). Compositions expect
them at `public/takes/184040.mp4`, `public/takes/182749.mp4`,
`public/take-183109.mp4` — ask Xiaoyin for the files (4K masters or 1080p
proxies both work; durations must match the timestamp JSONs).
