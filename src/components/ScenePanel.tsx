import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import type { SceneMeta } from '../types';
import { LedScene } from './LedScene';

type SceneMap = Record<string, SceneMeta>;
type PanelCorner = { x: number; y: number };
type PanelCorners = [PanelCorner, PanelCorner, PanelCorner, PanelCorner];

const META_BASE_WIDTH = 1200;
const META_BASE_HEIGHT = 700;
const HUMAN_HEIGHT_CM = 180;
const PEOPLE_BASE_HEIGHT_PX = 140;
const FRAME_ALLOWANCE_M = 0.04;
const SCENE_PANEL_HORIZONTAL_INSET = 0.03;
const PANEL_LAYER_BASE = 1;

type SourceReference = {
  sourceWidth: number;
  sourceHeight: number;
  placeholder: { x: number; y: number; width: number; height: number };
};

const CUSTOM_SOURCE_REFERENCES: Record<string, SourceReference> = {
  'billboard-large': { sourceWidth: 1536, sourceHeight: 1024, placeholder: { x: 177, y: 218, width: 1170, height: 565 } },
  billboard: { sourceWidth: 1536, sourceHeight: 1024, placeholder: { x: 177, y: 218, width: 1170, height: 565 } },
  'billboard-small': { sourceWidth: 1536, sourceHeight: 1024, placeholder: { x: 548, y: 111, width: 446, height: 752 } },
  store: { sourceWidth: 1536, sourceHeight: 1024, placeholder: { x: 188, y: 132, width: 1163, height: 190 } },
  mobilcar: { sourceWidth: 1536, sourceHeight: 1024, placeholder: { x: 407, y: 216, width: 983, height: 458 } },
  totem: { sourceWidth: 1536, sourceHeight: 1024, placeholder: { x: 407, y: 216, width: 983, height: 458 } },
};


interface ScenePanelProps {
  isProductPanelOpen: boolean;
  onToggleProductPanel: () => void;
  is3DMode: boolean;
  customBackgroundUrl: string | null;
  panelMedia: { url: string; kind: 'image' | 'video' } | null;
  panelMediaById: Record<string, { url: string; kind: 'image' | 'video' }>;
  onPanelMediaSelected: (file: File) => void;
  onClearPanelMedia: () => void;
}

export function ScenePanel({ isProductPanelOpen, is3DMode, customBackgroundUrl, panelMedia, panelMediaById, onPanelMediaSelected, onClearPanelMedia }: ScenePanelProps) {
  const scenes = import.meta.glob('../assets/scenes/*/scene.json', { eager: true, query: '?json' }) as SceneMap;
  const bgMap = import.meta.glob('../assets/scenes/*/background.svg', { eager: true, query: '?url' }) as Record<string, string>;
  const peopleImage = new URL('../../people-silhouette.png', import.meta.url).href;

  const selected = useStore((s) => s.selectedScene);
  const config = useStore((s) => s.config);
  const panels = useStore((s) => s.panels);
  const activePanelId = useStore((s) => s.activePanelId);
  const activePanel = panels.find((panel) => panel.id === activePanelId);
  const activePanelIndex = Math.max(0, panels.findIndex((panel) => panel.id === activePanelId));
  const selectPanel = useStore((s) => s.selectPanel);
  const clearPanelSelection = useStore((s) => s.clearPanelSelection);
  const panelSelectionVisible = useStore((s) => s.panelSelectionVisible);

  const [meta, setMeta] = useState<SceneMeta | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [frameSize, setFrameSize] = useState({ width: META_BASE_WIDTH, height: META_BASE_HEIGHT });
  const [peopleX, setPeopleX] = useState(META_BASE_WIDTH / 2);
  const [isPeopleDragging, setIsPeopleDragging] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const frameRef = useRef<HTMLDivElement | null>(null);
  const peopleDragRef = useRef<{ startClientX: number; startX: number } | null>(null);
  const [panelCornersById, setPanelCornersById] = useState<Record<string, PanelCorners>>({});
  const panelSceneByIdRef = useRef<Record<string, string | null>>({});
  const [cornerDragIndex, setCornerDragIndex] = useState<number | null>(null);
  const [cornersVisible, setCornersVisible] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const normalizePath = (path: string) => path.replace(/\\/g, '/');
  useEffect(() => {
    if (!selected) {
      setMeta(null);
      setBgUrl(null);
      return;
    }

    const metaSourceMap: Record<string, string> = { 'billboard-large': 'billboard', 'billboard-small': 'billboard', mobilcar: 'totem' };
    const metaSource = metaSourceMap[selected as string] ?? selected;
    const key = Object.keys(scenes).find((p) => normalizePath(p).includes(`/${metaSource}/`));
    const bgKey = Object.keys(bgMap).find((p) => normalizePath(p).includes(`/${metaSource}/`));
    setMeta(key ? (scenes as any)[key] as SceneMeta : null);
    const customBackgrounds: Record<string, string> = {
      'billboard-large': new URL('../../sahneler/bilboard-dev.jpeg', import.meta.url).href,
      'billboard-small': new URL('../../sahneler/bilboard-mobil.jpeg', import.meta.url).href,
      billboard: new URL('../../sahneler/bilboard-dev.jpeg', import.meta.url).href,
      store: new URL('../../sahneler/bilboard-shop.jpeg', import.meta.url).href,
      mobilcar: new URL('../../sahneler/mobilcar-screen.jpeg', import.meta.url).href,
      totem: new URL('../../sahneler/mobilcar-screen.jpeg', import.meta.url).href,
    };
    setBgUrl(customBackgroundUrl ?? customBackgrounds[selected as string] ?? (bgKey ? (bgMap as any)[bgKey] as string : null));
  }, [customBackgroundUrl, selected]);

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

  const onPeoplePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    event.preventDefault();
    peopleDragRef.current = { startClientX: event.clientX, startX: peopleX };
    setIsPeopleDragging(true);
  };

  const activeFrameWidth = frameSize.width;
  const activeFrameHeight = frameSize.height;

  const placeholderRef = CUSTOM_SOURCE_REFERENCES[selected ?? ''];
  const basePlaceholder = meta
    ? placeholderRef
      ? {
          x: placeholderRef.placeholder.x * (activeFrameWidth / placeholderRef.sourceWidth),
          y: placeholderRef.placeholder.y * (activeFrameHeight / placeholderRef.sourceHeight),
          width: placeholderRef.placeholder.width * (activeFrameWidth / placeholderRef.sourceWidth),
          height: placeholderRef.placeholder.height * (activeFrameHeight / placeholderRef.sourceHeight),
        }
      : {
          x: meta.placeholder.x * (activeFrameWidth / META_BASE_WIDTH),
          y: meta.placeholder.y * (activeFrameHeight / META_BASE_HEIGHT),
          width: meta.placeholder.width * (activeFrameWidth / META_BASE_WIDTH),
          height: meta.placeholder.height * (activeFrameHeight / META_BASE_HEIGHT),
        }
    : null;

  useEffect(() => {
    if (!basePlaceholder) {
      setCornersVisible(false);
      return;
    }

    const panelIndex = panels.findIndex((panel) => panel.id === activePanelId);
    const offset = activePanelId === 'panel-1' ? 0 : Math.max(1, panelIndex) * 0.08;
    const previousScene = panelSceneByIdRef.current[activePanelId];
    const sceneChanged = previousScene !== undefined && previousScene !== selected;
    panelSceneByIdRef.current[activePanelId] = selected ?? null;
    setPanelCornersById((cornersById) => ({
      ...cornersById,
      [activePanelId]: sceneChanged ? [
        { x: basePlaceholder.x / activeFrameWidth, y: basePlaceholder.y / activeFrameHeight },
        { x: (basePlaceholder.x + basePlaceholder.width) / activeFrameWidth, y: basePlaceholder.y / activeFrameHeight },
        { x: (basePlaceholder.x + basePlaceholder.width) / activeFrameWidth, y: (basePlaceholder.y + basePlaceholder.height) / activeFrameHeight },
        { x: basePlaceholder.x / activeFrameWidth, y: (basePlaceholder.y + basePlaceholder.height) / activeFrameHeight },
      ] : cornersById[activePanelId] ?? [
      { x: basePlaceholder.x / activeFrameWidth + offset, y: basePlaceholder.y / activeFrameHeight + offset },
      { x: (basePlaceholder.x + basePlaceholder.width) / activeFrameWidth + offset, y: basePlaceholder.y / activeFrameHeight + offset },
      { x: (basePlaceholder.x + basePlaceholder.width) / activeFrameWidth + offset, y: (basePlaceholder.y + basePlaceholder.height) / activeFrameHeight + offset },
      { x: basePlaceholder.x / activeFrameWidth + offset, y: (basePlaceholder.y + basePlaceholder.height) / activeFrameHeight + offset },
      ],
    }));
  }, [activeFrameHeight, activeFrameWidth, selected, bgUrl, activePanelId, panels]);

  useEffect(() => {
    if (cornerDragIndex === null) {
      return undefined;
    }

    const onPointerMove = (event: PointerEvent) => {
      const frame = frameRef.current;
      if (!frame) {
        return;
      }

      const rect = frame.getBoundingClientRect();
      const nextPoint = {
        x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
      };
      setPanelCornersById((cornersById) => {
        const corners = cornersById[activePanelId];
        if (!corners) {
          return cornersById;
        }
        return {
          ...cornersById,
          [activePanelId]: corners.map((corner, index) => index === cornerDragIndex ? nextPoint : corner) as PanelCorners,
        };
      });
    };

    const stopDragging = () => setCornerDragIndex(null);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [cornerDragIndex]);

  useEffect(() => {
    if (!panelSelectionVisible) {
      setCornersVisible(false);
    }
  }, [panelSelectionVisible]);

  useEffect(() => {
    if (!isPeopleDragging) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const drag = peopleDragRef.current;
      const frame = frameRef.current;
      if (!drag || !frame) {
        return;
      }

      const frameRect = frame.getBoundingClientRect();
      const scale = activeFrameWidth / Math.max(1, frameRect.width);
      setPeopleX(drag.startX + (event.clientX - drag.startClientX) * scale);
    };

    const stopDragging = () => {
      peopleDragRef.current = null;
      setIsPeopleDragging(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [activeFrameWidth, isPeopleDragging]);

  useEffect(() => {
    if (meta) {
      setPeopleX((meta.peoplePosition.x / META_BASE_WIDTH) * activeFrameWidth);
    }
  }, [activeFrameWidth, meta]);

  if (!meta || !bgUrl) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-white/40">Sahne seçilmedi.</div>
    );
  }

  const activeCorners = panelCornersById[activePanelId] ?? [
    { x: basePlaceholder!.x / activeFrameWidth, y: basePlaceholder!.y / activeFrameHeight },
    { x: (basePlaceholder!.x + basePlaceholder!.width) / activeFrameWidth, y: basePlaceholder!.y / activeFrameHeight },
    { x: (basePlaceholder!.x + basePlaceholder!.width) / activeFrameWidth, y: (basePlaceholder!.y + basePlaceholder!.height) / activeFrameHeight },
    { x: basePlaceholder!.x / activeFrameWidth, y: (basePlaceholder!.y + basePlaceholder!.height) / activeFrameHeight },
  ] as PanelCorners;
  const minCornerX = Math.min(...activeCorners.map((corner) => corner.x));
  const maxCornerX = Math.max(...activeCorners.map((corner) => corner.x));
  const minCornerY = Math.min(...activeCorners.map((corner) => corner.y));
  const maxCornerY = Math.max(...activeCorners.map((corner) => corner.y));
  const cornerPolygon = activeCorners
    .map((corner) => `${(((corner.x - minCornerX) / Math.max(0.001, maxCornerX - minCornerX)) * 100).toFixed(2)}% ${(((corner.y - minCornerY) / Math.max(0.001, maxCornerY - minCornerY)) * 100).toFixed(2)}%`)
    .join(', ');
  const handleOffsets = [
    { x: -8, y: -8 },
    { x: 8, y: -8 },
    { x: 8, y: 8 },
    { x: -8, y: 8 },
  ];
  const placeholder = {
    x: minCornerX * activeFrameWidth,
    y: minCornerY * activeFrameHeight,
    width: (maxCornerX - minCornerX) * activeFrameWidth,
    height: (maxCornerY - minCornerY) * activeFrameHeight,
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
  const sceneHeightScale = 184 / Math.max(1, config.wallHeightCm);
  const peopleHeightPx = renderedSurfaceHeightPx
    * (HUMAN_HEIGHT_CM / 184)
    * sceneHeightScale;


  return (
    <div className="relative h-full w-full overflow-hidden bg-black" onClick={clearPanelSelection}>
      <div
        ref={frameRef}
        className="absolute left-1/2 top-1/2"
        onClick={(event) => { event.stopPropagation(); clearPanelSelection(); }}
        style={{ width: `${fittedFrameWidth}px`, height: `${fittedFrameHeight}px`, transform: 'translate(-50%, -50%)' }}
      >
        <img src={bgUrl} alt={meta.name} className="absolute inset-0 z-0 h-full w-full object-contain" />

        {panels.map((panel, panelIndex) => {
          const panelCorners = panelCornersById[panel.id];
          if (!panelCorners) return null;
          const panelMinX = Math.min(...panelCorners.map((corner) => corner.x));
          const panelMaxX = Math.max(...panelCorners.map((corner) => corner.x));
          const panelMinY = Math.min(...panelCorners.map((corner) => corner.y));
          const panelMaxY = Math.max(...panelCorners.map((corner) => corner.y));

          return (
            <React.Fragment key={panel.id}>
              <div
                className="pointer-events-none absolute inset-0"
                style={{ zIndex: PANEL_LAYER_BASE + panelIndex }}
              >
                <Canvas
                  orthographic
                  camera={{
                    position: [0, 0, 7.5],
                    left: -frameAspectRatio,
                    right: frameAspectRatio,
                    top: 1,
                    bottom: -1,
                    near: 0.1,
                    far: 100,
                  }}
                  gl={{ alpha: true }}
                  style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                >
                  <ambientLight intensity={0.9} />
                  <directionalLight position={[3, 5, 2]} intensity={1.6} color="#dbeafe" />
                  <LedScene
                    screenCenterX={0.5}
                    screenCenterY={0.5}
                    frameAspectRatio={frameAspectRatio}
                    screenWidthRatio={1}
                    screenHeightRatio={1}
                    panelCorners={panelCorners}
                    panelMediaUrl={panelMediaById[panel.id]?.kind === 'image' ? panelMediaById[panel.id].url : undefined}
                    configOverride={panel.config}
                  />
                </Canvas>
              </div>
            </React.Fragment>
          );
        })}

        {activePanel ? (
          <span
            className="pointer-events-none absolute z-[45] rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-blue-100"
            style={{
              left: `${Math.min(...activeCorners.map((corner) => corner.x)) * 100 + 0.5}%`,
              top: `${Math.min(...activeCorners.map((corner) => corner.y)) * 100 + 0.5}%`,
            }}
          >
            {activePanel.name}
          </span>
        ) : null}

        {cornersVisible ? activeCorners.map((corner, index) => (
          <button
            key={`panel-corner-${index}`}
            type="button"
            aria-label={`${index + 1}. panel köşesini taşı`}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setCornerDragIndex(index);
            }}
              onClick={(event) => event.stopPropagation()}
            className="group absolute z-40 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border border-white/90 bg-[#60a5fa]/85 shadow-[0_3px_12px_rgba(0,0,0,0.45)] ring-2 ring-black/25 backdrop-blur-sm transition-transform duration-150 hover:scale-110 hover:bg-[#93c5fd] cursor-crosshair"
            style={{
              left: `calc(${corner.x * 100}% + ${handleOffsets[index].x}px)`,
              top: `calc(${corner.y * 100}% + ${handleOffsets[index].y}px)`,
            }}
          >
            <span className="h-2 w-2 rounded-full bg-white/90 shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-transform duration-150 group-hover:scale-125" />
          </button>
        )) : null}

        <div
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <div
              className="absolute inset-0 overflow-hidden bg-transparent opacity-0"
              style={{
                zIndex: PANEL_LAYER_BASE + activePanelIndex,
                pointerEvents: 'auto',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                boxSizing: 'border-box',
                contain: 'paint',
                padding: '0px',
                clipPath: 'none',
                border: '0px',
              }}
            >
              {is3DMode ? (
                <div className="relative z-10 h-full w-full overflow-hidden rounded-[2px] bg-transparent">
                  <Canvas
                    orthographic
                    camera={{
                      position: [0, 0, 7.5],
                      left: -frameAspectRatio,
                      right: frameAspectRatio,
                      top: 1,
                      bottom: -1,
                      near: 0.1,
                      far: 100,
                    }}
                    gl={{ alpha: true }}
                    className="relative z-30"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[3, 5, 2]} intensity={1.6} color="#dbeafe" />
                    <LedScene
                      key={activePanelId}
                      screenCenterX={(ledLeft + ledWidth / 2) / activeFrameWidth}
                      screenCenterY={(ledTop + ledHeight / 2) / activeFrameHeight}
                      frameAspectRatio={frameAspectRatio}
                      screenWidthRatio={ledWidth / activeFrameWidth}
                      screenHeightRatio={ledHeight / activeFrameHeight}
                      panelCorners={activeCorners}
                      onPanelInteract={() => setCornersVisible(true)}
                      onPanelDrag={(delta) => {
                        setPanelCornersById((cornersById) => {
                          const corners = cornersById[activePanelId];
                          return corners ? {
                            ...cornersById,
                            [activePanelId]: corners.map((corner) => ({
                              x: corner.x + delta.x,
                              y: corner.y + delta.y,
                            })) as PanelCorners,
                          } : cornersById;
                        });
                      }}
                      panelMediaUrl={panelMedia?.kind === 'image' ? panelMedia.url : undefined}
                      configOverride={activePanel?.config}
                    />
                  </Canvas>
                </div>
              ) : (
              <div
                  className={`relative h-full w-full overflow-hidden ${exceedsWall ? 'border border-red-300/80' : ''} ${panelMedia ? 'bg-transparent' : 'bg-[#0D0F12]'}`}
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
                        className="absolute inset-0 h-full w-full object-cover"
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img src={panelMedia.url} alt="panel-media" className="absolute inset-0 h-full w-full object-cover" />
                    )
                  ) : null}

                  <div className={`pointer-events-none absolute inset-0 ${panelMedia ? 'bg-black/10' : 'bg-gradient-to-b from-black/5 to-black/35'}`} />
              </div>
              )}
            </div>

          </div>
        </div>

        {panels.map((panel, panelIndex) => {
          if (panel.id === activePanelId) return null;
          const panelCorners = panelCornersById[panel.id];
          if (!panelCorners) return null;
          const panelMinX = Math.min(...panelCorners.map((corner) => corner.x));
          const panelMaxX = Math.max(...panelCorners.map((corner) => corner.x));
          const panelMinY = Math.min(...panelCorners.map((corner) => corner.y));
          const panelMaxY = Math.max(...panelCorners.map((corner) => corner.y));

          return (
            <button
              key={`select-${panel.id}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                selectPanel(panel.id);
                setCornersVisible(true);
              }}
              className="pointer-events-auto absolute bg-transparent text-left"
              style={{
                zIndex: 31 + panelIndex,
                left: `${panelMinX * 100}%`,
                top: `${panelMinY * 100}%`,
                width: `${(panelMaxX - panelMinX) * 100}%`,
                height: `${(panelMaxY - panelMinY) * 100}%`,
              }}
            >
              <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-blue-100">
                {panel.name}
              </span>
            </button>
          );
        })}

        <img
          src={peopleImage}
          alt="people"
          draggable={false}
          className="pointer-events-auto absolute z-20 cursor-ew-resize touch-none select-none"
          onPointerDown={onPeoplePointerDown}
          onDragStart={(event) => event.preventDefault()}
          style={{
            left: `${(peopleX / activeFrameWidth) * 100}%`,
            top: `${(meta.peoplePosition.y / META_BASE_HEIGHT) * 100}%`,
            height: `${peopleHeightPx}px`,
            width: 'auto',
            transform: 'translate(-50%, -100%)',
          }}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 text-[19px] font-normal leading-none text-white/65"
          style={{
            left: `${(peopleX / activeFrameWidth) * 100}%`,
            top: `${(meta.peoplePosition.y / META_BASE_HEIGHT) * 100}%`,
          }}
        >
          ↔
        </span>

      </div>

    </div>
  );
}

export default ScenePanel;
