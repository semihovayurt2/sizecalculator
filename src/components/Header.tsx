import React, { useEffect } from 'react';
import { Home } from 'lucide-react';
import SceneSelector from './SceneSelector';
import { useStore } from '../store/useStore';

interface HeaderProps {
  onBackgroundSelected: (file: File) => void;
  onPanelMediaSelected: (file: File) => void;
  onClearPanelMedia: () => void;
  hasPanelMedia: boolean;
  isProductPanelOpen: boolean;
  onToggleProductPanel: () => void;
}

const pixelPitchOptions = ['P1', 'P1.25', 'P1.5', 'P1.86', 'P2', 'P2.5', 'P3', 'P4', 'P5'];
const FRAME_ALLOWANCE_CM = 4;
const selectFieldClassName = 'h-10 w-full rounded-md border border-white/10 bg-[#111111] px-3 text-blue-200/90 outline-none transition focus:border-[#60a5fa]';
const logoImage = new URL('../../dinamoledlogotransparent-cropped.png', import.meta.url).href;

const panelTypeOptions = [
  { label: '320mm x 160mm', widthCm: 32, heightCm: 16 },
  { label: '192mm x 192mm', widthCm: 19.2, heightCm: 19.2 },
  { label: '256mm x 128mm', widthCm: 25.6, heightCm: 12.8 },
  { label: '256mm x 256mm', widthCm: 25.6, heightCm: 25.6 },
] as const;

interface StepperInputProps {
  label: string;
  value: number;
  min: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function StepperInput({ label, value, min, step, suffix, onChange }: StepperInputProps) {
  const updateValue = (next: number) => onChange(Number.isFinite(next) ? Math.max(min, next) : min);

  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-blue-200/90">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateValue(value - step)}
          className="h-7 w-7 rounded-md border border-white/25 bg-transparent text-base leading-none text-blue-200/90 transition hover:border-[#60a5fa] hover:text-[#60a5fa]"
          aria-label={`${label} azalt`}
        >
          -
        </button>
          <div className="flex h-7 flex-1 items-center rounded-md border border-white/25 bg-transparent px-2">
          <input
            type="number"
            value={value}
            min={min}
            step={step}
            onChange={(e) => updateValue(Number(e.target.value))}
            className="w-full border-none bg-transparent text-center text-[11px] text-blue-200/90 outline-none placeholder:text-blue-200/35"
          />
          {suffix ? <span className="text-[11px] text-blue-200/90">{suffix}</span> : null}
        </div>
        <button
          type="button"
          onClick={() => updateValue(value + step)}
          className="h-7 w-7 rounded-md border border-white/25 bg-transparent text-base leading-none text-blue-200/90 transition hover:border-[#60a5fa] hover:text-[#60a5fa]"
          aria-label={`${label} artır`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function Header({
  onBackgroundSelected,
  onPanelMediaSelected,
  onClearPanelMedia,
  hasPanelMedia,
  isProductPanelOpen,
  onToggleProductPanel,
}: HeaderProps) {
  const backgroundInputRef = React.useRef<HTMLInputElement | null>(null);
  const mediaInputRef = React.useRef<HTMLInputElement | null>(null);
  const [panelAction, setPanelAction] = React.useState<'remove' | 'rename' | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const config = useStore((s) => s.config);
  const summary = useStore((s) => s.summary);
  const setConfig = useStore((s) => s.setConfig);
  const panels = useStore((s) => s.panels);
  const activePanelId = useStore((s) => s.activePanelId);
  const panelSelectionVisible = useStore((s) => s.panelSelectionVisible);
  const activePanel = panels.find((panel) => panel.id === activePanelId) ?? panels[0];
  const addPanel = useStore((s) => s.addPanel);
  const clearPanelSelection = useStore((s) => s.clearPanelSelection);
  const renamePanel = useStore((s) => s.renamePanel);
  const removePanel = useStore((s) => s.removePanel);
  const formatNumber = (value: number, fractionDigits = 0) =>
    new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);

  const panelWidthCm = Number((config.cabinetWidth * 100).toFixed(1));
  const panelHeightCm = Number((config.cabinetHeight * 100).toFixed(1));
  const selectedPanelValue = `${panelWidthCm}x${panelHeightCm}`;
  const minWallWidthCm = panelWidthCm + FRAME_ALLOWANCE_CM;
  const minWallHeightCm = panelHeightCm + FRAME_ALLOWANCE_CM;

  const usableWallWidthCm = Math.max(0, config.wallWidthCm - FRAME_ALLOWANCE_CM);
  const usableWallHeightCm = Math.max(0, config.wallHeightCm - FRAME_ALLOWANCE_CM);
  const columns = Math.max(1, Math.floor(usableWallWidthCm / panelWidthCm));
  const rows = Math.max(1, Math.floor(usableWallHeightCm / panelHeightCm));
  const autoWidthM = Number(((columns * panelWidthCm) / 100).toFixed(2));
  const autoHeightM = Number(((rows * panelHeightCm) / 100).toFixed(2));
  const occupiedWidthM = Number((autoWidthM + FRAME_ALLOWANCE_CM / 100).toFixed(2));
  const occupiedHeightM = Number((autoHeightM + FRAME_ALLOWANCE_CM / 100).toFixed(2));

  useEffect(() => {
    if (
      config.width !== autoWidthM ||
      config.height !== autoHeightM
    ) {
      setConfig({
        width: autoWidthM,
        height: autoHeightM,
      });
    }
  }, [autoHeightM, autoWidthM, config.height, config.width, setConfig]);

  return (
    <header className="pointer-events-none absolute left-0 top-1/2 z-30 w-[clamp(185px,20vw,245px)] -translate-y-1/2">
      <div className="pointer-events-auto flex h-[min(100dvh,66.6667vw)] max-h-[100dvh] w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/20 px-3 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[3px] sm:px-4">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="Dinamo logo" className="h-12 w-12 rounded-md object-contain" />
          </div>

          <div className="flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              onClick={clearPanelSelection}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-blue-200/80 transition hover:border-[#60a5fa] hover:text-[#93c5fd]"
              aria-label="Ana ekrana dön"
              title="Ana ekrana dön"
            >
              <Home className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={addPanel}
              className="whitespace-nowrap rounded-md border border-[#60a5fa]/60 bg-black/20 px-2 py-1.5 text-[10px] font-semibold text-blue-200/90 transition hover:bg-[#172033]"
            >
              + Ekran
            </button>
            <button
              type="button"
              onClick={() => setPanelAction('remove')}
              disabled={panels.length === 1}
              className="whitespace-nowrap rounded-md border border-red-300/40 bg-black/20 px-2 py-1.5 text-[10px] font-semibold text-red-200/90 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sil
            </button>
          </div>

          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onBackgroundSelected(file);
              event.target.value = '';
            }}
          />

        </div>

        <div className="hidden flex-wrap gap-1.5 border-b border-white/10 py-2">
          {panels.map((panel) => (
            <button
              key={panel.id}
              type="button"
              onClick={clearPanelSelection}
              className={`rounded-md border px-2 py-1 text-left text-[10px] ${panel.id === activePanelId ? 'border-[#60a5fa] text-[#93c5fd]' : 'border-white/10 text-blue-200/70'}`}
            >
              {panel.name}
            </button>
          ))}
        </div>

        <div className="mt-2 min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-transparent">
              <div className="origin-top-left flex min-w-0 flex-col gap-2 p-1.5 pt-2 pb-14 scale-[var(--menu-content-scale)]" style={{ '--menu-content-scale': 'clamp(0.72, calc(100dvh / 760px), 1)', width: 'calc(100% / var(--menu-content-scale))' } as React.CSSProperties}>
                <section className="min-w-0">
                  <div className="grid gap-2">
                    <div>
                      <SceneSelector
                        light
                        activePanelName={panelSelectionVisible ? activePanel?.name : undefined}
                        onEditPanelName={() => {
                          setRenameValue(activePanel?.name ?? '');
                          setPanelAction('rename');
                        }}
                        onAddScene={() => backgroundInputRef.current?.click()}
                      />
                    </div>
                    <StepperInput
                      label="Wall Width"
                      value={config.wallWidthCm}
                      min={minWallWidthCm}
                      step={panelWidthCm}
                      suffix="cm"
                      onChange={(v) => setConfig({ wallWidthCm: v })}
                    />
                    <StepperInput
                      label="Wall Height"
                      value={config.wallHeightCm}
                      min={minWallHeightCm}
                      step={panelHeightCm}
                      suffix="cm"
                      onChange={(v) => setConfig({ wallHeightCm: v })}
                    />
                  </div>
              </section>

                <section className="min-w-0 border-t border-white/10 pt-3">
                  <h3 className="mb-2 text-center text-sm font-semibold text-blue-200/90">Display Configuration</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-blue-200/90">Pixel Pitch</label>
                      <select
                        value={config.pixelPitch}
                        onChange={(e) => setConfig({ pixelPitch: e.target.value })}
                        className={`${selectFieldClassName} h-8 text-[11px]`}
                      >
                        {pixelPitchOptions.map((pitch) => (
                          <option key={pitch} value={pitch}>
                            {pitch}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-blue-200/90">Sending Box</label>
                      <select className={`${selectFieldClassName} h-8 text-[11px]`}>
                        <option>VX400</option>
                        <option>VX600</option>
                        <option>MX30</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold text-blue-200/90">Panel Type</label>
                      <select
                        value={selectedPanelValue}
                        onChange={(e) => {
                          const [nextWidth, nextHeight] = e.target.value.split('x').map(Number);
                          if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight)) {
                            return;
                          }

                          const adjustedWallWidth = Math.max(config.wallWidthCm, nextWidth + FRAME_ALLOWANCE_CM);
                          const adjustedWallHeight = Math.max(config.wallHeightCm, nextHeight + FRAME_ALLOWANCE_CM);

                          setConfig({
                            cabinetWidth: Number((nextWidth / 100).toFixed(3)),
                            cabinetHeight: Number((nextHeight / 100).toFixed(3)),
                            wallWidthCm: Number(adjustedWallWidth.toFixed(1)),
                            wallHeightCm: Number(adjustedWallHeight.toFixed(1)),
                          });
                        }}
                        className={`${selectFieldClassName} h-8 text-[11px]`}
                      >
                        {panelTypeOptions.map((panelType) => (
                          <option key={`${panelType.widthCm}x${panelType.heightCm}`} value={`${panelType.widthCm}x${panelType.heightCm}`}>
                            {panelType.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
              </section>

              <section className="min-w-0 border-t border-white/10 pt-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[3px]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Teknik Bilgi</p>
                  <div className="mt-1 space-y-0.5 text-blue-200/90">
                    <div className="flex items-start justify-between gap-1 text-[10px] leading-tight">
                      <span>İnsan Silüeti Boyu</span>
                      <span className="text-right font-semibold">1.80 m</span>
                    </div>
                    <div className="flex items-start justify-between gap-1 text-[10px] leading-tight">
                      <span>Ürün Çözünürlüğü</span>
                      <span className="text-right font-semibold">{summary.resolution} px</span>
                    </div>
                    <div className="flex items-start justify-between gap-1 text-[10px] leading-tight">
                      <span>Yatay Panel (Sütun)</span>
                      <span className="text-right font-semibold">{summary.horizontalCabinets}</span>
                    </div>
                    <div className="flex items-start justify-between gap-1 text-[10px] leading-tight">
                      <span>Dikey Panel (Satır)</span>
                      <span className="text-right font-semibold">{summary.verticalCabinets}</span>
                    </div>
                    <div className="flex items-start justify-between gap-1 text-[10px] leading-tight">
                      <span>Toplam Panel Sayısı</span>
                      <span className="text-right font-semibold">{summary.totalCabinets}</span>
                    </div>
                    <div className="flex items-start justify-between gap-1 text-[10px] leading-tight">
                      <span>Gerekli Elektrik Gücü</span>
                      <span className="text-right font-semibold">{formatNumber(summary.maximumPower, 2)} kW</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="min-w-0 border-t border-white/10 pt-3">
                {!isProductPanelOpen ? (
                  <button
                    type="button"
                    onClick={onToggleProductPanel}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-[10px] font-semibold text-blue-200/90 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30"
                  >
                    Ürün Listesi
                  </button>
                ) : null}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <input
                    ref={mediaInputRef}
                    id="panel-media-input"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onPanelMediaSelected(file);
                      event.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    className="flex h-7 min-w-0 flex-1 items-center justify-center rounded-lg border border-white/10 bg-black/20 px-2 text-[10px] font-semibold text-blue-200/90 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30"
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    Medya Yükle
                  </button>
                  <button
                    type="button"
                    className="flex h-7 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 px-2 text-[10px] font-semibold text-blue-200/90 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-[3px] transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={onClearPanelMedia}
                    disabled={!hasPanelMedia}
                  >
                    Sil
                  </button>
                </div>
              </section>

                </div>
            </div>
      </div>

      {panelAction ? (
        <div className="pointer-events-auto absolute inset-0 z-[60] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm">
          <div className="w-full max-w-[280px] rounded-xl border border-white/15 bg-[#0d0d0d] p-3 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-blue-100">{panelAction === 'remove' ? 'Ekran sil' : 'Ekran adını düzenle'}</h2>
              <button type="button" onClick={() => setPanelAction(null)} className="text-lg text-white/60">×</button>
            </div>
            {panelAction === 'remove' ? (
              <div className="space-y-1.5">
                {panels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => { removePanel(panel.id); setPanelAction(null); }}
                    className="block w-full rounded-md border border-white/10 px-3 py-2 text-left text-xs text-blue-100 hover:bg-red-950/30"
                  >
                    {panel.name}
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); renamePanel(activePanelId, renameValue); setPanelAction(null); }}>
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  className="h-9 w-full rounded-md border border-white/15 bg-black px-2 text-sm text-white outline-none focus:border-[#60a5fa]"
                />
                <button type="submit" className="mt-2 w-full rounded-md bg-[#60a5fa] px-3 py-2 text-xs font-semibold text-[#06101f]">Kaydet</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
