import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import type { SceneMeta } from '../types';

type SceneMap = Record<string, SceneMeta>;

export function ScenePanel() {
  const scenes = import.meta.glob('../assets/scenes/*/scene.json', { eager: true, as: 'json' }) as SceneMap;
  const bgMap = import.meta.glob('../assets/scenes/*/background.svg', { eager: true, as: 'url' }) as Record<string, string>;

  const selected = useStore((s) => s.selectedScene);
  const config = useStore((s) => s.config);

  const [meta, setMeta] = useState<SceneMeta | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selected) {
      setMeta(null);
      setBgUrl(null);
      return;
    }
    const key = Object.keys(scenes).find((p) => p.includes(`/${selected}/`));
    const bgKey = Object.keys(bgMap).find((p) => p.includes(`/${selected}/`));
    if (key) setMeta((scenes as any)[key] as SceneMeta);
    if (bgKey) setBgUrl((bgMap as any)[bgKey] as string);
  }, [selected]);

  if (!meta || !bgUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white/40">Sahne seçilmedi.</div>
    );
  }

  const placeholder = meta.placeholder;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center p-6">
        <div className="relative w-full h-full max-w-[1100px] max-h-[680px] mx-auto">
          <img
            ref={imgRef}
            src={bgUrl}
            alt={meta.name}
            className="w-full h-full object-contain rounded-lg border border-white/5"
          />

          {/* Overlay LED placeholder */}
          <div
            className="absolute"
            style={{
              left: `${(placeholder.x / 1200) * 100}%`,
              top: `${(placeholder.y / 700) * 100}%`,
              width: `${(placeholder.width / 1200) * 100}%`,
              height: `${(placeholder.height / 700) * 100}%`,
              transform: 'translate(-0%, -0%)',
              pointerEvents: 'none',
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 border-2 border-accent/70 bg-black/30" />
              {/* LED rectangle scaled to config */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: 'auto' }}
              >
                <div
                  className="border border-white/30 bg-[#000000]/70"
                  style={{
                    width: `${Math.min(100, (config.width / (placeholder.width / 1000)) * 100)}%`,
                    height: `${Math.min(100, (config.height / (placeholder.height / 1000)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* People silhouette */}
          <img
            src="/src/assets/people/people-silhouette.png"
            alt="people"
            className="absolute"
            style={{ left: `${(meta.peoplePosition.x / 1200) * 100}%`, top: `${(meta.peoplePosition.y / 700) * 100}%`, width: `${meta.peoplePosition.scale ? meta.peoplePosition.scale * 100 : 100}px`, transform: 'translate(-50%, -100%)' }}
          />
        </div>
      </div>
    </div>
  );
}

export default ScenePanel;
