import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { useStore } from '../store/useStore';
import type { SceneMeta } from '../types';
import { LedScene } from './LedScene';

type SceneMap = Record<string, SceneMeta>;

export function ScenePanel() {
  const scenes = import.meta.glob('../assets/scenes/*/scene.json', { eager: true, as: 'json' }) as SceneMap;
  const bgMap = import.meta.glob('../assets/scenes/*/background.svg', { eager: true, as: 'url' }) as Record<string, string>;

  const selected = useStore((s) => s.selectedScene);
  const config = useStore((s) => s.config);

  const [meta, setMeta] = useState<SceneMeta | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);

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
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div
          className="relative w-full max-w-[1100px] mx-auto overflow-hidden rounded-[28px] border border-white/5 bg-[#080808]/80"
          style={{ aspectRatio: '1200 / 700', maxHeight: '680px' }}
        >
          <img
            src={bgUrl}
            alt={meta.name}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div
            className="absolute"
            style={{
              left: `${(placeholder.x / 1200) * 100}%`,
              top: `${(placeholder.y / 700) * 100}%`,
              width: `${(placeholder.width / 1200) * 100}%`,
              height: `${(placeholder.height / 700) * 100}%`,
              transform: 'translate(0, 0)',
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/20 bg-black/10 shadow-inner">
              <Canvas
                shadows
                camera={{ position: [0, 1.8, 6], fov: 40 }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent' }}
              >
                <ambientLight intensity={0.55} />
                <directionalLight castShadow intensity={1.1} position={[5, 8, 6]} shadow-mapSize={[2048, 2048]} />
                <Environment preset="studio" />
                <PerspectiveCamera makeDefault position={[0, 1.8, 6]} fov={40} />
                <OrbitControls enablePan enableZoom enableRotate minDistance={2.8} maxDistance={15} />
                <LedScene />
              </Canvas>
              <div className="absolute inset-0 border-2 border-accent/70 pointer-events-none" />
            </div>
          </div>

          <img
            src="/src/assets/people/people-silhouette.png"
            alt="people"
            className="absolute"
            style={{
              left: `${(meta.peoplePosition.x / 1200) * 100}%`,
              top: `${(meta.peoplePosition.y / 700) * 100}%`,
              width: `${meta.peoplePosition.scale ?? 100}px`,
              transform: 'translate(-50%, -100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ScenePanel;
