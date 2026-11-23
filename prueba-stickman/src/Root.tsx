import React from 'react';
import {Composition} from 'remotion';
import {Video, DURACION, FPS} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id="Prueba" component={Video} durationInFrames={DURACION} fps={FPS} width={1080} height={1920} />
);
