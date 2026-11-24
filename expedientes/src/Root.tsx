import React from 'react';
import {Composition} from 'remotion';
import {Episodio, FPS, prepararEpisodio} from './motor';
import {EPISODIOS} from './episodios';
import VOCES from './voces.json';

export const RemotionRoot: React.FC = () => (
  <>
    {EPISODIOS.map((def) => {
      const ep = prepararEpisodio(def, (VOCES as any)[def.id]);
      return (
        <Composition key={def.id} id={def.id.toUpperCase()} component={() => <Episodio ep={ep} />}
          durationInFrames={ep.duracion} fps={FPS} width={1080} height={1920} />
      );
    })}
  </>
);
