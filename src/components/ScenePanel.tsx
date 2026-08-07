import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import type { SceneMeta } from '../types';
import { PDFButton } from './PDFButton';

type SceneMap = Record<string, SceneMeta>;

const META_BASE_WIDTH = 1200;
const META_BASE_HEIGHT = 700;
const HUMAN_HEIGHT_CM = 180;
const PEOPLE_BASE_HEIGHT_PX = 140;
const RATIO_SNAP_EPSILON = 0.01;

type SourceReference = {
  sourceWidth: number;
  sourceHeight: number;
  placeholder: { x: number; y: number; width: number; height: number };
};

const CUSTOM_SOURCE_REFERENCES: Record<string, SourceReference> = {
  'billboard-large': {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 182, y: 189, width: 1163, height: 588 },
  },
  billboard: {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 182, y: 189, width: 1163, height: 588 },
  },
  'billboard-small': {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 557, y: 43, width: 428, height: 812 },
  },
  store: {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 208, y: 129, width: 1123, height: 218 },
  },
  mobilcar: {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 419, y: 226, width: 916, height: 446 },
  },
  totem: {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 419, y: 226, width: 916, height: 446 },
  },
};

export function ScenePanel() {
  const scenes = import.meta.glob('../assets/scenes/*/scene.json', { eager: true, query: '?json' }) as SceneMap;
  const bgMap = import.meta.glob('../assets/scenes/*/background.svg', { eager: true, query: '?url' }) as Record<string, string>;
  const cinemaImage = new URL('../../sahneler/Sinema-Salonu.png', import.meta.url).href;
  const peopleImage = new URL('../../people-silhouette.png', import.meta.url).href;

  const selected = useStore((s) => s.selectedScene);
  const config = useStore((s) => s.config);

  const [meta, setMeta] = useState<SceneMeta | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [frameSize, setFrameSize] = useState({ width: META_BASE_WIDTH, height: META_BASE_HEIGHT });
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

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
      studio: new URL('../../sahneler/depo-screen.avif', import.meta.url).href,
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

  useEffect(() => {
    if (!bgUrl) {
      setFrameSize({ width: META_BASE_WIDTH, height: META_BASE_HEIGHT });
      return;
    }

    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || META_BASE_WIDTH;
      const height = image.naturalHeight || META_BASE_HEIGHT;
      setFrameSize({ width, height });
    };
    image.src = bgUrl;
  }, [bgUrl]);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);

    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  if (!meta || !bgUrl) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-white/40">Sahne seçilmedi.</div>
    );
  }

  const placeholderRef = CUSTOM_SOURCE_REFERENCES[selected ?? ''];
  const activeFrameWidth = frameSize.width;
  const activeFrameHeight = frameSize.height;

  const placeholder = placeholderRef
    ? placeholderRef.placeholder
    : {
        x: meta.placeholder.x * (activeFrameWidth / META_BASE_WIDTH),
        y: meta.placeholder.y * (activeFrameHeight / META_BASE_HEIGHT),
        width: meta.placeholder.width * (activeFrameWidth / META_BASE_WIDTH),
        height: meta.placeholder.height * (activeFrameHeight / META_BASE_HEIGHT),
      };

  const wallWidthM = Math.max(0.1, config.wallWidthCm / 100);
  const wallHeightM = Math.max(0.1, config.wallHeightCm / 100);
  const columns = Math.max(1, Math.round(config.width / config.cabinetWidth));
  const rows = Math.max(1, Math.round(config.height / config.cabinetHeight));

  const widthRatio = config.width / wallWidthM;
  const heightRatio = config.height / wallHeightM;

  const clampedWidthRatio = Math.min(Math.max(widthRatio, 0), 1);
  const clampedHeightRatio = Math.min(Math.max(heightRatio, 0), 1);
  const snappedWidthRatio = 1 - clampedWidthRatio <= RATIO_SNAP_EPSILON ? 1 : clampedWidthRatio;
  const snappedHeightRatio = 1 - clampedHeightRatio <= RATIO_SNAP_EPSILON ? 1 : clampedHeightRatio;
  const exceedsWall = widthRatio > 1 || heightRatio > 1;

  const ledWidth = placeholder.width * snappedWidthRatio;
  const ledHeight = placeholder.height * snappedHeightRatio;
  const ledLeft = placeholder.x + (placeholder.width - ledWidth) / 2;
  const ledTop = placeholder.y + (placeholder.height - ledHeight) / 2;
  const gridCellWidthPercent = 100 / columns;
  const gridCellHeightPercent = 100 / rows;
  const frameAspectRatio = activeFrameWidth / activeFrameHeight;
  const viewportAspectRatio = viewportSize.width / viewportSize.height;
  const fittedFrameWidth = viewportAspectRatio > frameAspectRatio
    ? viewportSize.height * frameAspectRatio
    : viewportSize.width;
  const fittedFrameHeight = viewportAspectRatio > frameAspectRatio
    ? viewportSize.height
    : viewportSize.width / frameAspectRatio;
  const peopleCalibrationPx = meta.peoplePosition.scale ?? HUMAN_HEIGHT_CM;
  const peopleHeightPx = Math.min(
    ledHeight,
    ledHeight * (peopleCalibrationPx / HUMAN_HEIGHT_CM) * (HUMAN_HEIGHT_CM / config.wallHeightCm),
  );


  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: `${fittedFrameWidth}px`, height: `${fittedFrameHeight}px`, transform: 'translate(-50%, -50%)' }}
      >
        <img src={bgUrl} alt={meta.name} className="absolute inset-0 h-full w-full object-contain" />

        <div
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <div
              className={`absolute border ${exceedsWall ? 'border-red-400' : 'border-white/30'} bg-[#0D0F12]`}
              style={{
                left: `${(ledLeft / activeFrameWidth) * 100}%`,
                top: `${(ledTop / activeFrameHeight) * 100}%`,
                width: `${(ledWidth / activeFrameWidth) * 100}%`,
                height: `${(ledHeight / activeFrameHeight) * 100}%`,
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)',
                backgroundSize: `${gridCellWidthPercent}% 100%, 100% ${gridCellHeightPercent}%`,
                backgroundPosition: '0 0, 0 0',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/35" />
            </div>

            <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2 space-y-2 text-left text-xs leading-tight text-orange-300">
              <div className="font-semibold text-orange-200">Duvar: {config.wallWidthCm}cm x {config.wallHeightCm}cm</div>
              <div>Ekran: {config.width.toFixed(2)}m x {config.height.toFixed(2)}m</div>
              <div>Kolon: {columns}</div>
              <div>Satır: {rows}</div>
              <div>Pixel Pitch: {config.pixelPitch}</div>
              {exceedsWall ? <div className="text-red-300">Ekran boyutu duvarı aşıyor.</div> : null}
            </div>

            <div className="absolute bottom-4 right-4 z-20">
              <PDFButton />
            </div>
          </div>
        </div>

        <img
          src={peopleImage}
          alt="people"
          className="absolute"
          style={{
            left: `${(meta.peoplePosition.x / META_BASE_WIDTH) * 100}%`,
            top: `${(meta.peoplePosition.y / META_BASE_HEIGHT) * 100}%`,
            height: `${peopleHeightPx}px`,
            width: 'auto',
            transform: 'translate(-50%, -100%)',
          }}
        />
      </div>
    </div>
  );
}

export default ScenePanel;
