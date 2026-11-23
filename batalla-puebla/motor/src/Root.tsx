import React from "react";
import { Composition } from "remotion";
import { AlexShort } from "./videos/alejandro/Alex";
import { TOTAL, FPS } from "./videos/alejandro/story";
import { PueblaShort } from "./videos/puebla/Alex";
import { TOTAL as TOTAL_PUEBLA } from "./videos/puebla/story";
// Registra cada short nuevo aquí, con su propio id.
export const Root: React.FC = () => (
  <>
    <Composition id="Alejandro" component={AlexShort} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="Puebla" component={PueblaShort} durationInFrames={TOTAL_PUEBLA} fps={FPS} width={1080} height={1920} />
  </>
);
