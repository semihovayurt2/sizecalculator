import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls } from '@react-three/drei';
import { useStore } from '../store/useStore';
import type { SceneMeta } from '../types';
import { LedScene } from './LedScene';

type SceneMap = Record<string, SceneMeta>;

export function ScenePanel() {
  const scenes = import.meta.glob('../assets/scenes/*/scene.json', { eager: true, query: '?json' }) as SceneMap;
  const bgMap = import.meta.glob('../assets/scenes/*/background.svg', { eager: true, query: '?url' }) as Record<string, string>;
  const cinemaImage = new URL('../../Sinema-Salonu.png', import.meta.url).href;

  const selected = useStore((s) => s.selectedScene);
  const config = useStore((s) => s.config);

  const [meta, setMeta] = useState<SceneMeta | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const normalizePath = (path: string) => path.replace(/\\/g, '/');

  useEffect(() => {
    if (!selected) {
      setMeta(null);
      setBgUrl(null);
      return;
    }

    const metaSourceMap: Record<string, string> = {
      'billboard-large': 'billboard',
      'billboard-small': 'billboard',
      mobilcar: 'totem',
    };
    const metaSource = metaSourceMap[selected as string] ?? selected;
    const key = Object.keys(scenes).find((p) => normalizePath(p).includes(`/${metaSource}/`));
    const bgKey = Object.keys(bgMap).find((p) => normalizePath(p).includes(`/${metaSource}/`));
    if (key) {
      setMeta((scenes as any)[key] as SceneMeta);
    } else {
      setMeta(null);
    }

    // custom user-provided scene backgrounds (folder: sahneler)
    const customBackgrounds: Record<string, string> = {
      'billboard-large': new URL('../../sahneler/bilboard-dev.jpeg', import.meta.url).href,
      'billboard-small': new URL('../../sahneler/bilboard-mobil.jpeg', import.meta.url).href,
      billboard: new URL('../../sahneler/bilboard-dev.jpeg', import.meta.url).href,
      store: new URL('../../sahneler/bilboard-shop.jpeg', import.meta.url).href,
      mobilcar: new URL('../../sahneler/mobilcar-screen.jpeg', import.meta.url).href,
      totem: new URL('../../sahneler/mobilcar-screen.jpeg', import.meta.url).href,
    };

    if (selected === 'cinema') {
      setBgUrl(cinemaImage);
    } else if (customBackgrounds[selected as string]) {
      setBgUrl(customBackgrounds[selected as string]);
    } else if (bgKey) {
      setBgUrl((bgMap as any)[bgKey] as string);
    } else {
      setBgUrl(null);
    }
  }, [selected]);

  if (!meta || !bgUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white/40">Sahne seçilmedi.</div>
    );
  }

  const placeholder = meta.placeholder;

  const panelLeft = dragOffset.x;
  const panelTop = dragOffset.y;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-0">
      <div
        className="relative w-full h-full overflow-hidden rounded-[28px]"
        style={{ aspectRatio: '1200 / 700' }}
        ref={panelRef}
      >
        <img
          src={bgUrl}
          alt={meta.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          className="absolute cursor-grab"
          onMouseDown={(event) => {
            setIsDragging(true);
            dragStartRef.current = { x: event.clientX - panelLeft, y: event.clientY - panelTop };
          }}
          onMouseMove={(event) => {
            if (!isDragging || !dragStartRef.current) return;
            const nextX = event.clientX - dragStartRef.current.x;
            const nextY = event.clientY - dragStartRef.current.y;
            setDragOffset({ x: nextX, y: nextY });
          }}
          onMouseUp={() => {
            setIsDragging(false);
            dragStartRef.current = null;
          }}
          onMouseLeave={() => {
            setIsDragging(false);
            dragStartRef.current = null;
          }}
          style={{
            left: panelLeft,
            top: panelTop,
            width: `${(placeholder.width / 1200) * 100}%`,
            height: `${(placeholder.height / 700) * 100}%`,
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-inner">
            <Canvas
              shadows
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent' }}
            >
              <ambientLight intensity={0.55} />
              <directionalLight castShadow intensity={1.1} position={[5, 8, 6]} shadow-mapSize={[2048, 2048]} />
              <Environment preset="studio" />
              <OrthographicCamera makeDefault position={[0, 1.8, 6]} zoom={120} />
              <OrbitControls enableRotate={false} enablePan={false} enableZoom={true} zoomSpeed={0.6} />
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
  );
}

export default ScenePanel;
