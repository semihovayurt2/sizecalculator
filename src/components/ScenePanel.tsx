import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import type { SceneMeta } from '../types';
import { LedScene } from './LedScene';

type SceneMap = Record<string, SceneMeta>;

const META_BASE_WIDTH = 1200;
const META_BASE_HEIGHT = 700;
const HUMAN_HEIGHT_CM = 180;
const BILLBOARD_SURFACE_HEIGHT_CM = 184;
const PEOPLE_BASE_HEIGHT_PX = 140;
const FRAME_ALLOWANCE_M = 0.04;
const SCENE_PANEL_HORIZONTAL_INSET = 0.03;

type SourceReference = {
  sourceWidth: number;
  sourceHeight: number;
  placeholder: { x: number; y: number; width: number; height: number };
};

const CUSTOM_SOURCE_REFERENCES: Record<string, SourceReference> = {
  'billboard-large': {
    sourceWidth: 1536,
    sourceHeight: 1024,
      placeholder: { x: 177, y: 218, width: 1170, height: 565 },
  },
  billboard: {
    sourceWidth: 1536,
    sourceHeight: 1024,
      placeholder: { x: 177, y: 218, width: 1170, height: 565 },
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

interface ScenePanelProps {
  isProductPanelOpen: boolean;
  onToggleProductPanel: () => void;
  is3DMode: boolean;
}

export function ScenePanel({ isProductPanelOpen, onToggleProductPanel, is3DMode }: ScenePanelProps) {
  const scenes = import.meta.glob('../assets/scenes/*/scene.json', { eager: true, query: '?json' }) as SceneMap;
  const bgMap = import.meta.glob('../assets/scenes/*/background.svg', { eager: true, query: '?url' }) as Record<string, string>;
  const peopleImage = new URL('../../people-silhouette.png', import.meta.url).href;

  const selected = useStore((s) => s.selectedScene);
  const config = useStore((s) => s.config);
  const summary = useStore((s) => s.summary);

  const [meta, setMeta] = useState<SceneMeta | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [panelMedia, setPanelMedia] = useState<{ url: string; kind: 'image' | 'video' } | null>(null);
  const [frameSize, setFrameSize] = useState({ width: META_BASE_WIDTH, height: META_BASE_HEIGHT });
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const formatNumber = (value: number, fractionDigits = 0) =>
    new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);

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
  const columns = Math.max(1, Math.floor(config.width / config.cabinetWidth));
  const rows = Math.max(1, Math.floor(config.height / config.cabinetHeight));
  const screenWidthM = columns * config.cabinetWidth;
  const screenHeightM = rows * config.cabinetHeight;
  const occupiedWidthM = screenWidthM + FRAME_ALLOWANCE_M;
  const occupiedHeightM = screenHeightM + FRAME_ALLOWANCE_M;

  const widthRatio = occupiedWidthM / wallWidthM;
  const heightRatio = occupiedHeightM / wallHeightM;

  const exceedsWall = widthRatio > 1 || heightRatio > 1;
  const ledWidth = placeholder.width * (1 - SCENE_PANEL_HORIZONTAL_INSET * 2);
  const ledHeight = placeholder.height;
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
  const renderedSurfaceHeightPx = placeholder.height * (fittedFrameHeight / activeFrameHeight);
  const sceneHeightScale = BILLBOARD_SURFACE_HEIGHT_CM / Math.max(1, config.wallHeightCm);
  const peopleHeightPx = renderedSurfaceHeightPx
    * (HUMAN_HEIGHT_CM / BILLBOARD_SURFACE_HEIGHT_CM)
    * sceneHeightScale;


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
              className={`absolute overflow-hidden ${is3DMode ? 'inset-0 bg-transparent' : exceedsWall ? 'bg-red-400/80' : 'bg-[#8a8f98]'}`}
              style={{
                left: is3DMode ? 0 : `${(ledLeft / activeFrameWidth) * 100}%`,
                top: is3DMode ? 0 : `${(ledTop / activeFrameHeight) * 100}%`,
                width: is3DMode ? '100%' : `${(ledWidth / activeFrameWidth) * 100}%`,
                height: is3DMode ? '100%' : `${(ledHeight / activeFrameHeight) * 100}%`,
                maxWidth: '100%',
                maxHeight: '100%',
                boxSizing: 'border-box',
                contain: 'paint',
                padding: '0px',
                border: is3DMode ? '0px' : `4px solid ${exceedsWall ? 'rgba(248,113,113,0.8)' : '#8a8f98'}`,
              }}
            >
              {is3DMode ? (
                <div className="relative h-full w-full overflow-hidden rounded-[2px] bg-transparent">
                  <Canvas
                    camera={{ position: [0, 0, 7.5], fov: 38 }}
                    gl={{ alpha: true }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[3, 5, 2]} intensity={1.6} color="#dbeafe" />
                    <LedScene
                      screenCenterX={(ledLeft + ledWidth / 2) / activeFrameWidth}
                      screenCenterY={(ledTop + ledHeight / 2) / activeFrameHeight}
                      frameAspectRatio={frameAspectRatio}
                      screenWidthRatio={ledWidth / activeFrameWidth}
                      screenHeightRatio={ledHeight / activeFrameHeight}
                      panelMediaUrl={panelMedia?.kind === 'image' ? panelMedia.url : undefined}
                    />
                  </Canvas>
                </div>
              ) : (
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
              )}
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

      <div
        className={`fixed bottom-4 left-4 flex w-[clamp(135px,12vw,190px)] flex-col gap-2 sm:left-6 lg:left-8 ${
          isProductPanelOpen ? 'z-30 pointer-events-none' : 'z-50'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="pointer-events-auto flex h-8 flex-1 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/20 px-3 text-[11px] font-semibold text-blue-200/90 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30"
            aria-label="Panel medyası yükle"
            title="Resim veya video yükle"
            onClick={() => mediaInputRef.current?.click()}
          >
            Medya Yükle
          </button>

          <button
            type="button"
            className="pointer-events-auto flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 px-2 text-[11px] font-semibold text-blue-200/90 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Panel medyasını temizle"
            title="Yüklenen medyayı kaldır"
            onClick={clearPanelMedia}
            disabled={!panelMedia}
          >
            Sil
          </button>
        </div>

        <div className="pointer-events-none rounded-xl border border-white/10 bg-black/20 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[3px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Teknik Bilgi</p>
          <div className="mt-1.5 space-y-1 text-blue-200/90">
            <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
              <span className="text-blue-200/90">Ürün Çözünürlüğü</span>
              <span className="text-right font-semibold">{summary.resolution} px</span>
            </div>
            <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
              <span className="text-blue-200/90">Yatay Panel (Sütun)</span>
              <span className="text-right font-semibold">{summary.horizontalCabinets}</span>
            </div>
            <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
              <span className="text-blue-200/90">Dikey Panel (Satır)</span>
              <span className="text-right font-semibold">{summary.verticalCabinets}</span>
            </div>
            <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
              <span className="text-blue-200/90">Toplam Panel Sayısı</span>
              <span className="text-right font-semibold">{summary.totalCabinets}</span>
            </div>
            <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
              <span className="text-blue-200/90">Gerekli Elektrik Gücü</span>
              <span className="text-right font-semibold">{formatNumber(summary.maximumPower, 2)} kW</span>
            </div>
          </div>
        </div>

        {!isProductPanelOpen ? (
          <button
            type="button"
            onClick={onToggleProductPanel}
            className="pointer-events-auto w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-semibold text-blue-200/90 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30"
          >
            Ürün Listesi
          </button>
        ) : null}
      </div>

    </div>
  );
}

export default ScenePanel;
