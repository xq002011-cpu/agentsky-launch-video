import { Composition } from "remotion";
import {
  AgentSkyConfigBackgroundSequence,
  AgentSkyConfigCardSequence,
  AgentSkyLaunch,
} from "./AgentSkyLaunch";
import { AgentSkyCoreLaunch } from "./AgentSkyCoreLaunch";
import { AgentSkyBrowserWindow } from "./AgentSkyBrowserWindow";
import {
  AGENT_SKY_CODE_BUILD_WITH_INTRO_DURATION,
  AgentSkyCodeBuildTransparent,
} from "./AgentSkyCodeBuildScene";
import { AgentSkyInfiniteContextTransparent } from "./AgentSkyInfiniteContextScene";
import {
  AgentSkyLogoMarqueeScene,
  AgentSkyLogoMarqueeTransparent,
} from "./AgentSkyLogoMarqueeScene";
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
  AgentSkyRedSquareTextureScene,
} from "./AgentSkyRedSquareTextureScene";
import {
  AGENT_SKY_RED_DASHED_GRID_DURATION,
  AgentSkyRedDashedGridScene,
} from "./AgentSkyRedDashedGridScene";
import {AgentSkyStyleFrames} from "./AgentSkyStyleFrames";
import {
  AGENT_SKY_ENGINE_ROOM_DURATION,
  AgentSkyEngineRoom,
} from "./AgentSkyEngineRoom";
import {
  AGENT_SKY_30S_DURATION,
  AgentSkyThirtySecond,
} from "./AgentSkyThirtySecond";
import {
  AGENT_SKY_OPENROUTER_DURATION,
  AgentSkyOpenRouterLaunch,
} from "./AgentSkyOpenRouterLaunch";
import {
  AGENT_SKY_PLAYGROUND_DURATION,
  AgentSkyPlaygroundScene,
} from "./AgentSkyPlaygroundScene";
import {
  AGENT_SKY_PLAYGROUND_DEMO_DURATION,
  AgentSkyPlaygroundDemo,
} from "./AgentSkyPlaygroundDemo";
import {
  AGENT_SKY_FRAME_SYNC_DURATION,
  AgentSkyFrameSync,
} from "./AgentSkyFrameSync";
import {
  AGENT_SKY_ADDONS_DURATION,
  AgentSkyAddons,
} from "./AgentSkyAddons";
import {
  AGENT_SKY_INTRO_API_DURATION,
  AgentSkyIntroApi,
} from "./AgentSkyIntroApi";
import {AGENT_SKY_CTA_DURATION, AgentSkyCta} from "./AgentSkyCta";
import {
  AGENT_SKY_FILM_DURATION,
  AgentSkyFilm,
} from "./AgentSkyFilm";

export const RemotionRoot = () => (
  <>
    <Composition
      id="AgentSkyLaunch"
      component={AgentSkyLaunch}
      durationInFrames={1902}
      fps={30}
      width={1280}
      height={720}
    />
    <Composition
      id="AgentSkyEngineRoom"
      component={AgentSkyEngineRoom}
      durationInFrames={AGENT_SKY_ENGINE_ROOM_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyThirtySecond"
      component={AgentSkyThirtySecond}
      durationInFrames={AGENT_SKY_30S_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyOpenRouterLaunch"
      component={AgentSkyOpenRouterLaunch}
      durationInFrames={AGENT_SKY_OPENROUTER_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyStyleFrames"
      component={AgentSkyStyleFrames}
      durationInFrames={1}
      fps={30}
      width={2200}
      height={1560}
    />
    <Composition
      id="AgentSkyPlayground"
      component={AgentSkyPlaygroundScene}
      durationInFrames={AGENT_SKY_PLAYGROUND_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyPlaygroundDemo"
      component={AgentSkyPlaygroundDemo}
      durationInFrames={AGENT_SKY_PLAYGROUND_DEMO_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyFrameSync"
      component={AgentSkyFrameSync}
      durationInFrames={AGENT_SKY_FRAME_SYNC_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyLogoMarquee"
      component={AgentSkyLogoMarqueeScene}
      durationInFrames={150}
      fps={30}
      width={1280}
      height={720}
    />
    <Composition
      id="AgentSkyLogoMarqueeTransparent"
      component={AgentSkyLogoMarqueeTransparent}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyConfigBackgroundSequence"
      component={AgentSkyConfigBackgroundSequence}
      durationInFrames={456}
      fps={30}
      width={1280}
      height={720}
    />
    <Composition
      id="AgentSkyConfigCardSequence"
      component={AgentSkyConfigCardSequence}
      durationInFrames={456}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyCoreLaunch"
      component={AgentSkyCoreLaunch}
      durationInFrames={1752}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyBrowserWindow"
      component={AgentSkyBrowserWindow}
      durationInFrames={707}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyCodeBuildTransparent"
      component={AgentSkyCodeBuildTransparent}
      durationInFrames={AGENT_SKY_CODE_BUILD_WITH_INTRO_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyWhiteDotRadianceTransparent"
      component={AgentSkyRedDotRadianceScene}
      durationInFrames={AGENT_SKY_RED_DOT_RADIANCE_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyBlackSquareFillTransparent"
      component={AgentSkyBlackSquareFillScene}
      durationInFrames={AGENT_SKY_BLACK_SQUARE_FILL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyRedSquareTextureTransparent"
      component={AgentSkyRedSquareTextureScene}
      durationInFrames={AGENT_SKY_RED_SQUARE_TEXTURE_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyRedDashedGridTransparent"
      component={AgentSkyRedDashedGridScene}
      durationInFrames={AGENT_SKY_RED_DASHED_GRID_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyInfiniteContextTransparent"
      component={AgentSkyInfiniteContextTransparent}
      durationInFrames={362}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyAddons"
      component={AgentSkyAddons}
      durationInFrames={AGENT_SKY_ADDONS_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyIntroApi"
      component={AgentSkyIntroApi}
      durationInFrames={AGENT_SKY_INTRO_API_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyCta"
      component={AgentSkyCta}
      durationInFrames={AGENT_SKY_CTA_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AgentSkyFilm"
      component={AgentSkyFilm}
      durationInFrames={AGENT_SKY_FILM_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
