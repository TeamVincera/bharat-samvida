'use client';

import React, { CSSProperties, memo, useEffect, useRef, useState } from 'react';

import { useLocale } from './LocaleProvider';
import { translateText } from '@/lib/translate';

export type StoryChapter = 'school' | 'neighbourhood' | 'bridge';
interface ScrollStoryCanvasProps {
  chapter: StoryChapter;
  progress: number;
  cameraProgress?: number;
  reducedMotion?: boolean;
}
const descriptions: Record<StoryChapter, string> = {
  school: 'A weathered village school, carefully renovated into a bright, accessible place to learn.',
  neighbourhood: 'A neighbourhood progressively upgraded with homes, drainage, green space and safer streets.',
  bridge: 'An open river crossing, bridge supports under construction, and a completed connection between two banks.'
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));

// All photographic plates share a camera transform: architecture never stretches.
function reveal(progress: number, start: number, end: number, angle: number): CSSProperties {
  const t = clamp((progress - start) / (end - start));
  const edge = -24 + t * 148;
  const mask = `linear-gradient(${angle}deg, #000 ${edge - 22}%, transparent ${edge + 22}%)`;
  return { opacity: t === 0 ? 0 : 1, maskImage: mask, WebkitMaskImage: mask };
}

export const ScrollStoryCanvas = memo(function ScrollStoryCanvas({ chapter, progress, cameraProgress = progress, reducedMotion = false }: ScrollStoryCanvasProps) {
  const { locale } = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);
  const p = reducedMotion ? 1 : clamp(progress);

  useEffect(() => {
    const element = root.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '100% 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  const source = `/assets/scenes/${chapter}.png`;
  return (
    <div ref={root} className={`story-environment story-environment--${chapter}`} role="img" aria-label={translateText(locale, descriptions[chapter])}>
      {visible && <>
        <img className="story-preload" src={source} alt="" onError={() => setFailed(true)} fetchPriority={chapter === 'school' ? 'high' : 'low'} />
        {!failed ? <div className="story-camera" style={{ transform: reducedMotion ? 'none' : `scale(${1.2 + Math.sin(cameraProgress*Math.PI)*.09}) translate3d(${Math.cos(cameraProgress*Math.PI)*4}%,${-2+Math.sin(cameraProgress*Math.PI)*3}%,0) rotate(${1.3-Math.sin(cameraProgress*Math.PI)*2.6}deg)` }}>
          {[0, 1, 2].map(frame => (
            <div key={frame} className="story-plate" style={frame === 0 || reducedMotion ? undefined : reveal(p, frame === 1 ? .12 : .58, frame === 1 ? .43 : .9, chapter === 'bridge' ? 100 : 112)}>
              <svg viewBox="0 0 1536 864" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
                <image href={source} x="0" y={-864 * frame} width="1536" height="2592" preserveAspectRatio="none" />
              </svg>
            </div>
          ))}
        </div> : <div className="story-art-fallback" style={{ backgroundPosition: `100% ${chapter === 'school' ? 0 : chapter === 'neighbourhood' ? 50 : 100}%` }} />}
      </>}
      <div className="story-color-grade" />
    </div>
  );
});
