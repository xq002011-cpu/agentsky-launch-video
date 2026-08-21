import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {gsap} from "gsap";

const W = 1920;
const H = 1080;
const FPS = 30;
const DURATION_SECONDS = 362 / FPS;
const CARD_HEIGHT = 350;
const clamp = gsap.utils.clamp;

type ConversationCard = {
  id: string;
  question: string;
  answer: string;
  processed: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  entryIndex?: number;
};

type Camera = {
  x: number;
  y: number;
  z: number;
  focusDistance: number;
};

const cards: ConversationCard[] = [
  {id: "ai-onboarding", question: "How can we improve activation for our AI writing app?", answer: "Segment first-time users by intent, shorten the first workflow, and trigger a useful result before asking them to configure advanced tools.", processed: "1.6s", x: -1120, y: 170, z: 1320, width: 390, height: 270},
  {id: "demo-followup", question: "Draft a follow-up after today’s enterprise AI demo.", answer: "I prepared a concise recap with the security questions, API requirements, stakeholders, and the agreed next step.", processed: "1.2s", x: -920, y: 810, z: 2050, width: 410, height: 278},
  {id: "prompt-library", question: "Which prompts are customers saving most often?", answer: "Research summaries, campaign briefs, support replies, and structured meeting follow-ups lead this week’s usage.", processed: "0.9s", x: -520, y: 460, z: 980, width: 360, height: 245},
  {id: "seo-cluster", question: "Build an SEO cluster for an AI customer-support product.", answer: "Start with AI ticket automation, multilingual support, knowledge-base workflows, and comparison pages for high-intent buyers.", processed: "2.1s", x: -160, y: 70, z: 2240, width: 440, height: 292},
  {id: "crm-leads", question: "Which leads should sales contact first?", answer: "Prioritize teams that used the API, invited three or more collaborators, and returned within forty-eight hours.", processed: "1.4s", x: 180, y: 840, z: 1580, width: 365, height: 250},
  {id: "launch-recap", question: "What did we decide for the beta launch?", answer: "Keep the invite list small, lead with continuous agent memory, and use the first ten teams to validate long-horizon workflows.", processed: "1.1s", x: 500, y: 380, z: 920, width: 400, height: 270},
  {id: "conversion-copy", question: "Rewrite the pricing page for higher conversion.", answer: "Lead with the outcome, clarify usage-based pricing, and move infrastructure details below the first product proof.", processed: "1.7s", x: 700, y: -120, z: 2380, width: 430, height: 282},
  {id: "creator-shortlist", question: "Shortlist creators for our AI productivity campaign.", answer: "I grouped twenty-four creators by audience fit, average view quality, prior sponsorships, and estimated collaboration cost.", processed: "2.8s", x: 940, y: 910, z: 1900, width: 450, height: 295},
  {id: "support-themes", question: "What are the top support themes this month?", answer: "Model selection, connector permissions, billing visibility, and resuming tasks after a long pause.", processed: "0.8s", x: 1080, y: 560, z: 2480, width: 350, height: 235},
  {id: "campaign", question: "Create the launch strategy for our new AI agent product.", answer: "Position it around persistent memory and long-horizon work. Start with a proof-led launch film, then retarget technical viewers with API demos and customer workflows…", processed: "1.8s", x: 1480, y: 320, z: 1260, width: 490, height: 330},
  {id: "audience-signal", question: "Which audience reacted best to the teaser?", answer: "AI builders and operations leads showed the highest completion rate, while founders generated the most qualified replies.", processed: "1.3s", x: 1640, y: -170, z: 2050, width: 400, height: 270},
  {id: "brand-voice", question: "Does this campaign match our brand voice?", answer: "Mostly. The hook is confident, but the final paragraph should be simpler and more product-specific.", processed: "0.7s", x: 1860, y: 360, z: 1040, width: 355, height: 238},
  {id: "solo-operator", question: "Plan next week for my one-person company.", answer: "I grouped the week into client delivery, lead follow-up, two content blocks, bookkeeping, and one automation sprint—without overloading any day…", processed: "2.4s", x: 2220, y: 650, z: 1450, width: 520, height: 350},
  {id: "customer-voice", question: "Summarize customer feedback from this week.", answer: "Clients value the faster turnaround and clear updates. The most common request is a simpler way to review and approve deliverables.", processed: "1.9s", x: 2480, y: 90, z: 2220, width: 460, height: 304},
  {id: "founder-newsletter", question: "Draft this week’s founder newsletter.", answer: "The draft connects a customer lesson to a practical AI workflow, includes one proof point, and ends with a soft consultation call-to-action.", processed: "1.5s", x: 2700, y: 900, z: 1980, width: 420, height: 280},
  {id: "ad-budget", question: "How should we split this month’s media budget?", answer: "Keep search focused on high-intent queries, shift short-form spend toward the winning creative, and reserve fifteen percent for retargeting.", processed: "1.6s", x: 2940, y: 390, z: 1280, width: 430, height: 286},
  {id: "revenue-report", question: "Create my monthly business review.", answer: "Revenue, recurring clients, delivery time, lead sources, expenses, and next month’s capacity are summarized in one operating view.", processed: "2.0s", x: 3220, y: -80, z: 2540, width: 385, height: 260},
  {id: "retention", question: "Why did weekly retention improve?", answer: "Teams returned to continue existing tasks instead of starting over, especially when the same agent stayed connected across channels.", processed: "1.1s", x: 3420, y: 820, z: 2140, width: 420, height: 284},
  {id: "release-risk", question: "What could delay the AI feature release?", answer: "The remaining risks are connector review, rate-limit testing, and final approval of the data-retention copy.", processed: "1.0s", x: 3700, y: 360, z: 1680, width: 390, height: 258},
  {id: "content-channels", question: "Which content channel should I prioritize?", answer: "Focus on the newsletter for conversion, repurpose each issue into short posts, and use search content for durable inbound demand.", processed: "1.4s", x: 3980, y: 960, z: 2440, width: 410, height: 276},
  {id: "competitors", question: "Track competitor messaging in the AI agent category.", answer: "Most competitors emphasize speed and tools. Persistent context and operational continuity remain the clearest open position.", processed: "2.2s", x: 4260, y: 90, z: 2760, width: 440, height: 290},
  {id: "community", question: "Turn community feedback into a campaign brief.", answer: "The brief centers on reliable memory, simple deployment, and showing one agent completing a real task across several days.", processed: "1.8s", x: 4580, y: 660, z: 2320, width: 430, height: 284},
  {id: "solo-crm", question: "Build a simple CRM for my one-person company.", answer: "I organized warm leads, active proposals, current clients, follow-up dates, and the next best action for every relationship.", processed: "1.7s", x: 1900, y: 940, z: 2700, width: 410, height: 270},
  {id: "proposal", question: "Turn these discovery notes into a client proposal.", answer: "The scope, outcome, milestones, boundaries, timeline, and payment schedule are ready for your final review.", processed: "1.3s", x: 1320, y: 80, z: 2620, width: 430, height: 278},
  {id: "automation", question: "What should I automate in the business first?", answer: "Start with lead capture, meeting follow-ups, invoice reminders, and recurring client status updates—the tasks with clear triggers and repeatable outputs.", processed: "1.9s", x: 820, y: 720, z: 2480, width: 455, height: 300},
  {id: "lead-magnet", question: "Create a lead magnet for AI service buyers.", answer: "Use a practical workflow audit that helps prospects identify one expensive manual process and estimate its automation value.", processed: "1.5s", x: 350, y: 210, z: 2780, width: 405, height: 268},
  {id: "cashflow", question: "Forecast cash flow for the next eight weeks.", answer: "The forecast combines signed work, likely renewals, expected payment dates, recurring expenses, and a conservative sales scenario.", processed: "2.2s", x: -260, y: 900, z: 2550, width: 425, height: 286},
];

type CardLayout = Pick<ConversationCard, "x" | "y" | "z" | "width" | "height">;

// A loose constellation: irregular horizontal and vertical spacing, with enough depth
// variation to read as a field rather than two stacked rows.
const layoutOverrides: Record<string, CardLayout> = {
  "ai-onboarding": {x: -1900, y: -120, z: 1500, width: 820, height: CARD_HEIGHT},
  "demo-followup": {x: 300, y: 125, z: 1750, width: 560, height: CARD_HEIGHT},
  "prompt-library": {x: -2480, y: 145, z: 1800, width: 650, height: CARD_HEIGHT},
  "seo-cluster": {x: -440, y: -275, z: 1800, width: 900, height: CARD_HEIGHT},
  "crm-leads": {x: -1500, y: 950, z: 2400, width: 580, height: CARD_HEIGHT},
  "launch-recap": {x: -2270, y: 1120, z: 1800, width: 840, height: CARD_HEIGHT},
  "conversion-copy": {x: -500, y: 885, z: 1450, width: 760, height: CARD_HEIGHT},
  "creator-shortlist": {x: 650, y: 1310, z: 1920, width: 920, height: CARD_HEIGHT},
  "support-themes": {x: 940, y: 360, z: 2080, width: 560, height: CARD_HEIGHT},
  "campaign": {x: 1550, y: 330, z: 1220, width: 820, height: CARD_HEIGHT},
  "audience-signal": {x: 3100, y: 1080, z: 2160, width: 690, height: CARD_HEIGHT},
  "brand-voice": {x: 1920, y: -430, z: 1380, width: 680, height: CARD_HEIGHT},
  "solo-operator": {x: 2250, y: 650, z: 1420, width: 880, height: CARD_HEIGHT},
  "customer-voice": {x: 2700, y: -190, z: 2100, width: 760, height: CARD_HEIGHT},
  "founder-newsletter": {x: 3300, y: 1160, z: 1860, width: 650, height: CARD_HEIGHT},
  "ad-budget": {x: 3700, y: 390, z: 1580, width: 920, height: CARD_HEIGHT},
  "revenue-report": {x: 4050, y: -560, z: 2260, width: 560, height: CARD_HEIGHT},
  "retention": {x: 4380, y: 1020, z: 2050, width: 760, height: CARD_HEIGHT},
  "release-risk": {x: 4700, y: 130, z: 1680, width: 840, height: CARD_HEIGHT},
  "content-channels": {x: 5020, y: 1340, z: 2300, width: 590, height: CARD_HEIGHT},
  "competitors": {x: 5360, y: -350, z: 2420, width: 920, height: CARD_HEIGHT},
  "community": {x: 5700, y: 810, z: 1960, width: 760, height: CARD_HEIGHT},
  "solo-crm": {x: 4520, y: -80, z: 2380, width: 580, height: CARD_HEIGHT},
  "proposal": {x: 4920, y: 850, z: 2320, width: 800, height: CARD_HEIGHT},
  "automation": {x: -3000, y: 820, z: 2400, width: 920, height: CARD_HEIGHT},
  "lead-magnet": {x: -2600, y: -500, z: 2440, width: 580, height: CARD_HEIGHT},
  "cashflow": {x: -1100, y: 1370, z: 2260, width: 740, height: CARD_HEIGHT},
};

const processingTimes: Record<string, string> = {
  "ai-onboarding": "48s", "demo-followup": "1m 34s", "prompt-library": "42s", "seo-cluster": "3m 12s",
  "crm-leads": "1m 08s", "launch-recap": "54s", "conversion-copy": "1m 46s", "creator-shortlist": "3m 28s",
  "support-themes": "39s", campaign: "2m 18s", "audience-signal": "1m 27s", "brand-voice": "44s",
  "solo-operator": "3m 06s", "customer-voice": "2m 42s", "founder-newsletter": "2m 14s", "ad-budget": "1m 52s",
  "revenue-report": "3m 38s", retention: "1m 19s", "release-risk": "58s", "content-channels": "1m 41s",
  competitors: "3m 54s", community: "2m 09s", "solo-crm": "2m 31s", proposal: "1m 36s",
  automation: "2m 47s", "lead-magnet": "1m 24s", cashflow: "3m 18s",
};

const stagedCards = cards.filter((card) => card.id !== "cashflow").map((card, entryIndex) => ({
  ...card,
  ...layoutOverrides[card.id],
  processed: processingTimes[card.id] ?? "1m 18s",
  entryIndex,
}));

const cameraState: Camera = {
  x: -980,
  y: 430,
  z: 0,
  focusDistance: 1450,
};

const exitState = {progress: 0};

// One deterministic GSAP camera timeline: a longer pan, two decisive pushes with true holds,
// then one uninterrupted slow-to-fast dolly-through. The exit uses a single progress tween so
// there is no ease reset or visible hitch at the former midpoint.
const cameraTimeline = gsap.timeline({paused: true, defaults: {overwrite: false}})
  .addLabel("introHold", 0)
  .to(cameraState, {x: -980, y: 430, z: 0, focusDistance: 1450, duration: 92 / FPS, ease: "none"}, "introHold")
  .addLabel("pan", 92 / FPS)
  .to(cameraState, {x: 1180, y: 430, z: 80, focusDistance: 1450, duration: 98 / FPS, ease: "power3.inOut"}, "pan")
  .addLabel("focusOne", 190 / FPS)
  .to(cameraState, {x: 1550, y: 330, z: 370, focusDistance: 850, duration: 37 / FPS, ease: "power2.out"}, "focusOne")
  .to(cameraState, {x: 1550, y: 330, z: 370, focusDistance: 850, duration: 20 / FPS, ease: "none"})
  .addLabel("focusTwo", 247 / FPS)
  .to(cameraState, {x: 2250, y: 650, z: 560, focusDistance: 860, duration: 37 / FPS, ease: "power2.out"}, "focusTwo")
  .to(cameraState, {x: 2250, y: 650, z: 560, focusDistance: 860, duration: 17 / FPS, ease: "none"})
  .addLabel("gapPush", 301 / FPS)
  .to(exitState, {progress: 1, duration: 61 / FPS, ease: "power3.in"}, "gapPush");

const quadraticBezier = (start: number, control: number, end: number, progress: number) => {
  const inverse = 1 - progress;
  return inverse * inverse * start + 2 * inverse * progress * control + progress * progress * end;
};

const sampleCamera = (frame: number): Camera => {
  cameraTimeline.time(clamp(0, DURATION_SECONDS, frame / FPS), true);
  if (exitState.progress <= 0) return {...cameraState};

  return {
    x: quadraticBezier(2250, 300, 0, exitState.progress),
    y: quadraticBezier(650, 540, 540, exitState.progress),
    z: quadraticBezier(560, 1400, 2600, exitState.progress),
    focusDistance: quadraticBezier(860, 560, 520, exitState.progress),
  };
};

const easedProgress = (frame: number, start: number, end: number, easeName = "power3.inOut") => {
  const progress = clamp(0, 1, (frame - start) / (end - start));
  return gsap.parseEase(easeName)(progress);
};

const getCardMetrics = (card: ConversationCard) => {
  return {
    height: CARD_HEIGHT,
    answerLines: card.width < 640 ? 4 : 3,
  };
};

// Irregular offsets keep the cards asynchronous while the earliest card starts at
// local frame 10, which is composition frame 355 (the scene begins at frame 345).
const cardEntryOffsets = [0, 4, 8, 13, 6, 16, 11, 2, 15, 9, 18, 5, 12, 1, 14, 7, 17, 3, 10];

const Conversation = ({card, camera, frame}: {card: ConversationCard; camera: Camera; frame: number}) => {
  const metrics = getCardMetrics(card);
  const entryIndex = card.entryIndex ?? 0;
  const flipStart = 10 + cardEntryOffsets[entryIndex % cardEntryOffsets.length];
  const flipDuration = 18 + (entryIndex % 4) * 2;
  const cardEntrance = easedProgress(frame, flipStart, flipStart + flipDuration, "power3.out");
  const visibleCardEntrance = 0.025 + cardEntrance * 0.975;
  const flipDirection = entryIndex % 2 === 0 ? 1 : -1;
  const rotationY = flipDirection * (1 - visibleCardEntrance) * 90;
  const relativeZ = card.z - camera.z;
  const projectionDistance = Math.max(relativeZ, 120);
  const scale = 1200 / projectionDistance;
  const screenX = W / 2 + (card.x - camera.x) * scale;
  const screenY = H / 2 + (card.y - camera.y) * scale;
  const isOffCamera = screenX < -card.width * scale || screenX > W + card.width * scale || screenY < -metrics.height * scale || screenY > H + metrics.height * scale;
  const questionStart = flipStart + 3;
  const questionDuration = 10 + (entryIndex % 4) * 4;
  const questionProgress = easedProgress(frame, questionStart, questionStart + questionDuration, "power3.out");
  const statusStart = questionStart + questionDuration - 2;
  const statusProgress = easedProgress(frame, statusStart, statusStart + 12, "power3.out");
  const answerStart = questionStart + Math.max(8, questionDuration - 4);
  const answerDuration = 24 + ((entryIndex * 17) % 42);
  const answerProgress = easedProgress(frame, answerStart, answerStart + answerDuration, "power2.out");
  const answerText = card.answer.slice(0, Math.ceil(card.answer.length * answerProgress));
  const showAnswerCursor = answerProgress < 1 && frame % 10 < 6;
  const focusIn = easedProgress(frame, 190, 204, "power2.out");
  const focusOut = 1 - easedProgress(frame, 296, 304, "power2.in");
  const focusStrength = focusIn * focusOut;
  const focusTargetMix = easedProgress(frame, 247, 259, "power2.inOut");
  const sharpWeight = card.id === "campaign" ? 1 - focusTargetMix : card.id === "solo-operator" ? focusTargetMix : 0;
  const depthDelta = Math.abs(relativeZ - camera.focusDistance);
  const focusBlur = clamp(0, 8, 2.8 + depthDelta / 160) * focusStrength * (1 - sharpWeight);
  const exitBlurProgress = easedProgress(frame, 304, 362, "power2.in");
  const nearBlur = exitBlurProgress > 0 ? clamp(0, 8, (760 - relativeZ) / 85) * exitBlurProgress : 0;
  const appliedBlur = Math.max(focusBlur, nearBlur);

  if (frame < flipStart || relativeZ <= 105 || isOffCamera) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: card.width,
        height: metrics.height,
        padding: "30px 31px 28px",
        boxSizing: "border-box",
        borderRadius: 27,
        color: "#111315",
        background: "linear-gradient(145deg, #ffffff 0%, #f7f7f5 100%)",
        border: "1px solid rgba(255,255,255,.88)",
        boxShadow: "0 22px 58px rgba(0,0,0,.34), inset 0 0 0 1px rgba(15,18,20,.045)",
        transformOrigin: "center center",
        transform: `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${scale}) perspective(1600px) rotateY(${rotationY}deg)`,
        transformStyle: "preserve-3d",
        filter: appliedBlur > 0.05 ? `blur(${appliedBlur}px)` : undefined,
        overflow: "hidden",
        backfaceVisibility: "hidden",
      }}
    >
      <div style={{display: "flex", justifyContent: "flex-end", alignItems: "flex-start"}}>
        <div
          style={{
            maxWidth: "84%",
            minHeight: 54,
            padding: "13px 18px 14px",
            borderRadius: "20px 20px 6px 20px",
            background: "#f0f2f3",
            border: "1px solid rgba(17,19,21,.075)",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 24,
            lineHeight: 1.3,
            fontWeight: 650,
            letterSpacing: -0.45,
            opacity: questionProgress,
            transform: `translate3d(0, ${(1 - questionProgress) * 18}px, 0)`,
          }}
        >
          {card.question}
        </div>
      </div>

      <div style={{marginTop: 25, paddingTop: 20, borderTop: "1px solid rgba(17,19,21,.09)"}}>
        <div style={{display: "flex", alignItems: "center", gap: 9, fontFamily: "Inter, Arial, sans-serif", opacity: statusProgress, transform: `translate3d(0, ${(1 - statusProgress) * 16}px, 0)`}}>
          <span style={{fontSize: 18, fontWeight: 760, color: "#17191b"}}>Processed</span>
          <span style={{fontSize: 17, color: "#8f9395"}}>· {card.processed}</span>
        </div>
        <div
          style={{
            marginTop: 16,
            minHeight: 104,
            padding: "0 8px 10px 0",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 20,
            lineHeight: 1.42,
            letterSpacing: -0.18,
            color: "#5b5f62",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: metrics.answerLines,
            overflow: "hidden",
          }}
        >
          {answerText}<span style={{opacity: showAnswerCursor ? 1 : 0, color: "#12bdb7"}}>│</span>
        </div>
      </div>
    </div>
  );
};

const statement = "Infinite context and\nbuilt-in memory.";
const statementWorld = {x: -980, y: 430, z: 1450, width: 1600, height: 280};

const WorldStatement = ({frame, camera}: {frame: number; camera: Camera}) => {
  const characters = Array.from(statement);
  const characterDuration = 10;
  const characterStagger = (30 - characterDuration) / Math.max(1, characters.length - 1);
  const relativeZ = statementWorld.z - camera.z;
  const scale = 1200 / Math.max(relativeZ, 120);
  const screenX = W / 2 + (statementWorld.x - camera.x) * scale;
  const screenY = H / 2 + (statementWorld.y - camera.y) * scale;
  const isOffCamera = screenX < -statementWorld.width * scale || screenX > W + statementWorld.width * scale || screenY < -statementWorld.height * scale || screenY > H + statementWorld.height * scale;

  if (relativeZ <= 105 || isOffCamera) return null;

  return (
    <div style={{position: "absolute", left: 0, top: 0, width: statementWorld.width, height: statementWorld.height, display: "grid", placeItems: "center", pointerEvents: "none", zIndex: 1, transformOrigin: "center center", transform: `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${scale})`, backfaceVisibility: "hidden"}}>
      <div style={{whiteSpace: "pre-wrap", textAlign: "center", fontFamily: "Inter, Arial, sans-serif", fontSize: 112, lineHeight: 1.02, fontWeight: 600, letterSpacing: -4.2, color: "#ffffff", textShadow: "0 7px 36px rgba(0,0,0,.72)"}}>
        {characters.map((character, index) => {
          const progress = easedProgress(frame, index * characterStagger, index * characterStagger + characterDuration, "power2.out");
          if (character === "\n") return <br key={`break-${index}`} />;
          return (
            <span key={`${character}-${index}`} style={{display: "inline-block", minWidth: character === " " ? ".28em" : undefined, opacity: progress, transform: `translate3d(0, ${(1 - progress) * 16}px, 0)`}}>
              {character === " " ? "\u00a0" : character}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const AgentSkyInfiniteContextBase = ({transparent = false}: {transparent?: boolean}) => {
  const frame = useCurrentFrame();
  const camera = sampleCamera(frame);
  const projectedCards = stagedCards
    .map((card) => ({card, relativeZ: card.z - camera.z}))
    .sort((a, b) => b.relativeZ - a.relativeZ);

  return (
    <AbsoluteFill style={{background: transparent ? "transparent" : "#030405", overflow: "hidden"}}>
      {!transparent && <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 48% 46%, rgba(35,43,48,.52), transparent 43%), radial-gradient(circle at 82% 18%, rgba(73,92,94,.12), transparent 28%)"}} />}
      <WorldStatement frame={frame} camera={camera} />
      <div style={{position: "absolute", inset: 0, overflow: "hidden", zIndex: 2}}>
        {projectedCards.map(({card}) => (
          <Conversation
            key={card.id}
            card={card}
            camera={camera}
            frame={frame}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const AgentSkyInfiniteContextScene = () => <AgentSkyInfiniteContextBase />;

export const AgentSkyInfiniteContextTransparent = () => <AgentSkyInfiniteContextBase transparent />;
