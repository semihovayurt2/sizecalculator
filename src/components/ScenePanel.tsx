import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import type { SceneMeta } from '../types';

type SceneMap = Record<string, SceneMeta>;

const META_BASE_WIDTH = 1200;
const META_BASE_HEIGHT = 700;
const HUMAN_HEIGHT_CM = 180;
const PEOPLE_BASE_HEIGHT_PX = 140;
const RATIO_SNAP_EPSILON = 0.01;
const FRAME_ALLOWANCE_M = 0.04;

type SourceReference = {
  sourceWidth: number;
  sourceHeight: number;
  placeholder: { x: number; y: number; width: number; height: number };
};

const CUSTOM_SOURCE_REFERENCES: Record<string, SourceReference> = {
  'billboard-large': {
    sourceWidth: 1536,
    sourceHeight: 1024,
      placeholder: { x: 182, y: 216, width: 1163, height: 554 },
  },
  billboard: {
    sourceWidth: 1536,
    sourceHeight: 1024,
      placeholder: { x: 182, y: 216, width: 1163, height: 554 },
  },
  'billboard-small': {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 548, y: 111, width: 446, height: 752 },
  },
  store: {
    sourceWidth: 1536,
    sourceHeight: 1024,
     placeholder: { x: 188, y: 132, width: 1163, height: 190 },
  },
  mobilcar: {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 407, y: 216, width: 983, height: 458 },
  },
  totem: {
    sourceWidth: 1536,
    sourceHeight: 1024,
    placeholder: { x: 407, y: 216, width: 983, height: 458 },
  },
};

export function ScenePanel() {
  const scenes = import.meta.glob('../assets/scenes/*/scene.json', { eager: true, query: '?json' }) as SceneMap;
  const bgMap = import.meta.glob('../assets/scenes/*/background.svg', { eager: true, query: '?url' }) as Record<string, string>;
  const peopleImage = new URL('../../people-silhouette.png', import.meta.url).href;

  const selected = useStore((s) => s.selectedScene);
  const config = useStore((s) => s.config);

  const [meta, setMeta] = useState<SceneMeta | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [panelMedia, setPanelMedia] = useState<{ url: string; kind: 'image' | 'video' } | null>(null);
  const [frameSize, setFrameSize] = useState({ width: META_BASE_WIDTH, height: META_BASE_HEIGHT });
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

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

    if (customBackgrounds[selected as string]) {
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

  useEffect(() => {
    return () => {
      if (panelMedia) {
        URL.revokeObjectURL(panelMedia.url);
      }
    };
  }, [panelMedia]);

  const onMediaSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const kind: 'image' | 'video' | null = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : null;

    if (!kind) {
      event.target.value = '';
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPanelMedia((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
      }
      return { url: nextUrl, kind };
    });
    event.target.value = '';
  };

  const clearPanelMedia = () => {
    setPanelMedia((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });

    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };

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
  const occupiedWidthM = config.width + FRAME_ALLOWANCE_M;
  const occupiedHeightM = config.height + FRAME_ALLOWANCE_M;

  const widthRatio = occupiedWidthM / wallWidthM;
  const heightRatio = occupiedHeightM / wallHeightM;

  const clampedWidthRatio = Math.min(Math.max(widthRatio, 0), 1);
  const clampedHeightRatio = Math.min(Math.max(heightRatio, 0), 1);
  const snappedWidthRatio = 1 - clampedWidthRatio <= RATIO_SNAP_EPSILON ? 1 : clampedWidthRatio;
  const snappedHeightRatio = 1 - clampedHeightRatio <= RATIO_SNAP_EPSILON ? 1 : clampedHeightRatio;
  const exceedsWall = widthRatio > 1 || heightRatio > 1;

  const ledWidth = placeholder.width * snappedWidthRatio;
  const ledHeight = placeholder.height * snappedHeightRatio;
  const ledLeft = placeholder.x + (placeholder.width - ledWidth) / 2;
  const ledTop = placeholder.y + (placeholder.height - ledHeight) / 2;
  const occupiedWidthCm = Math.max(1, occupiedWidthM * 100);
  const occupiedHeightCm = Math.max(1, occupiedHeightM * 100);
  const panelFrameThickness = Math.min(
    Math.max(1, Math.min((ledWidth / occupiedWidthCm) * 2, (ledHeight / occupiedHeightCm) * 2)),
    ledWidth / 2,
    ledHeight / 2,
  );
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
              className={`absolute ${exceedsWall ? 'bg-red-400/80' : 'bg-[#8a8f98]'}`}
              style={{
                left: `${(ledLeft / activeFrameWidth) * 100}%`,
                top: `${(ledTop / activeFrameHeight) * 100}%`,
                width: `${(ledWidth / activeFrameWidth) * 100}%`,
                height: `${(ledHeight / activeFrameHeight) * 100}%`,
                padding: `${panelFrameThickness}px`,
              }}
            >
              <div
                className={`relative h-full w-full overflow-hidden ${exceedsWall ? 'border border-red-300/80' : ''} bg-[#0D0F12]`}
                style={{
                  backgroundImage:
                    panelMedia
                      ? 'none'
                      : 'linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)',
                  backgroundSize: `${gridCellWidthPercent}% 100%, 100% ${gridCellHeightPercent}%`,
                  backgroundPosition: '0 0, 0 0',
                }}
              >
                {panelMedia ? (
                  panelMedia.kind === 'video' ? (
                    <video
                      src={panelMedia.url}
                      className="absolute inset-0 h-full w-full object-contain"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img src={panelMedia.url} alt="panel-media" className="absolute inset-0 h-full w-full object-contain" />
                  )
                ) : null}

                <div className={`pointer-events-none absolute inset-0 ${panelMedia ? 'bg-black/10' : 'bg-gradient-to-b from-black/5 to-black/35'}`} />
              </div>

            </div>

          </div>
        </div>

        <img
          src={peopleImage}
          alt="people"
          className="pointer-events-none absolute"
          style={{
            left: `${(meta.peoplePosition.x / META_BASE_WIDTH) * 100}%`,
            top: `${(meta.peoplePosition.y / META_BASE_HEIGHT) * 100}%`,
            height: `${peopleHeightPx}px`,
            width: 'auto',
            transform: 'translate(-50%, -100%)',
          }}
        />

        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onMediaSelected}
        />
      </div>

      <div className="fixed bottom-36 right-2 z-50 flex w-[clamp(135px,12vw,190px)] items-center gap-1.5 sm:right-4 md:right-6 lg:right-8">
        <button
          type="button"
          className="pointer-events-auto flex h-8 flex-1 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/20 px-3 text-[11px] font-semibold text-cyan-100 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30"
          aria-label="Panel medyası yükle"
          title="Resim veya video yükle"
          onClick={() => mediaInputRef.current?.click()}
        >
          Medya Yükle
        </button>

        <button
          type="button"
          className="pointer-events-auto flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 px-2 text-[11px] font-semibold text-cyan-100 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Panel medyasını temizle"
          title="Yüklenen medyayı kaldır"
          onClick={clearPanelMedia}
          disabled={!panelMedia}
        >
          Sil
        </button>
      </div>

    </div>
  );
}

export default ScenePanel;
