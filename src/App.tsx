import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import { ProductTable } from './components/ProductTable';
import ScenePanel from './components/ScenePanel';
import { useStore } from './store/useStore';

function App() {
  const [isProductPanelOpen, setIsProductPanelOpen] = React.useState(false);
  const [customBackgroundUrl, setCustomBackgroundUrl] = React.useState<string | null>(null);
  const [panelMediaById, setPanelMediaById] = React.useState<Record<string, { url: string; kind: 'image' | 'video' }>>({});
  const panelMediaByIdRef = React.useRef(panelMediaById);
  panelMediaByIdRef.current = panelMediaById;
  const activePanelId = useStore((state) => state.activePanelId);
  const panels = useStore((state) => state.panels);
  const panelMedia = panelMediaById[activePanelId] ?? null;
  const is3DMode = true;

  const onBackgroundSelected = (file: File) => {
    const nextUrl = URL.createObjectURL(file);
    setCustomBackgroundUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return nextUrl;
    });
  };

  React.useEffect(() => () => {
    if (customBackgroundUrl) URL.revokeObjectURL(customBackgroundUrl);
  }, [customBackgroundUrl]);

  React.useEffect(() => () => {
    Object.values(panelMediaByIdRef.current).forEach((media) => URL.revokeObjectURL(media.url));
  }, []);

  React.useEffect(() => {
    const panelIds = new Set(panels.map((panel) => panel.id));
    setPanelMediaById((mediaById) => {
      const nextMediaById = { ...mediaById };
      Object.keys(nextMediaById).forEach((panelId) => {
        if (!panelIds.has(panelId)) {
          URL.revokeObjectURL(nextMediaById[panelId].url);
          delete nextMediaById[panelId];
        }
      });
      return nextMediaById;
    });
  }, [panels]);

  const onPanelMediaSelected = (file: File) => {
    const kind: 'image' | 'video' | null = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : null;

    if (!kind) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPanelMediaById((mediaById) => {
      const previousMedia = mediaById[activePanelId];
      if (previousMedia) URL.revokeObjectURL(previousMedia.url);
      return { ...mediaById, [activePanelId]: { url: nextUrl, kind } };
    });
  };

  const clearPanelMedia = () => {
    setPanelMediaById((mediaById) => {
      const previousMedia = mediaById[activePanelId];
      if (previousMedia) URL.revokeObjectURL(previousMedia.url);
      const nextMediaById = { ...mediaById };
      delete nextMediaById[activePanelId];
      return nextMediaById;
    });
  };

  return (
    <div className="min-h-screen bg-background text-text overflow-hidden">
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <ScenePanel
            isProductPanelOpen={isProductPanelOpen}
            onToggleProductPanel={() => setIsProductPanelOpen((value) => !value)}
            is3DMode={is3DMode}
            customBackgroundUrl={customBackgroundUrl}
            panelMedia={panelMedia}
            panelMediaById={panelMediaById}
            onPanelMediaSelected={onPanelMediaSelected}
            onClearPanelMedia={clearPanelMedia}
          />
        </div>

        <Header
          onBackgroundSelected={onBackgroundSelected}
          isProductPanelOpen={isProductPanelOpen}
          onToggleProductPanel={() => setIsProductPanelOpen((value) => !value)}
        />

        <div className="pointer-events-none absolute inset-0 z-40">
          <motion.div
            initial={false}
            animate={isProductPanelOpen ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 ${
              isProductPanelOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            onClick={() => setIsProductPanelOpen(false)}
          >
            <motion.div
              initial={false}
              animate={isProductPanelOpen ? { y: 0, scale: 1 } : { y: 16, scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
              className="absolute inset-0 bg-black/62 backdrop-blur-[2px]"
            >
              <button
                type="button"
                onClick={() => setIsProductPanelOpen(false)}
                className="pointer-events-auto absolute bottom-4 left-4 z-50 w-[clamp(135px,12vw,190px)] rounded-xl border border-[#60a5fa]/70 bg-black/20 px-3 py-2 text-[11px] font-semibold text-blue-200/90 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30 sm:left-6 lg:left-8"
              >
                Kapat
              </button>

              <div className="h-full w-full p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
                <div className="h-full w-full rounded-3xl border border-white/10 bg-black/30 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                  <div className="h-full overflow-y-auto">
                    <ProductTable />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
