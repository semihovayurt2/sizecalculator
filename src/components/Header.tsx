import React, { useEffect } from 'react';
import SceneSelector from './SceneSelector';
import { useStore } from '../store/useStore';

interface HeaderProps {
  is3DMode: boolean;
  onToggle3D: () => void;
  onBackgroundSelected: (file: File) => void;
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

export function Header({ is3DMode, onToggle3D, onBackgroundSelected }: HeaderProps) {
  const backgroundInputRef = React.useRef<HTMLInputElement | null>(null);
  const config = useStore((s) => s.config);
  const summary = useStore((s) => s.summary);
  const setConfig = useStore((s) => s.setConfig);
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
    <header className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[clamp(185px,20vw,245px)]">
      <div className="pointer-events-auto flex h-full flex-col rounded-xl border border-white/10 bg-black/20 px-3 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[3px] sm:px-4">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="Dinamo logo" className="h-12 w-12 rounded-md object-contain" />
          </div>

          <button
            type="button"
            onClick={() => {
              onToggle3D();
              backgroundInputRef.current?.click();
            }}
            className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[11px] font-semibold text-blue-200/90 transition hover:bg-black/30"
          >
            Kendi Projeni Yap
          </button>
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

        <div className="mt-2 min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-transparent">
          <div className="space-y-3 p-2 pt-2">
              <section>
                  <div className="grid gap-2">
                    <div>
                      <SceneSelector light />
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

                <section className="border-t border-white/10 pt-3">
                  <h3 className="mb-2 text-center text-sm font-semibold text-blue-200/90">Display Configuration</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-blue-200/90">Select Product</label>
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
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-blue-200/90">Voltage</label>
                      <select className={`${selectFieldClassName} h-8 text-[11px]`}>
                        <option>220V</option>
                        <option>110V</option>
                      </select>
                    </div>
                    <div>
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

              <section className="border-t border-white/10 pt-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-[3px]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">Teknik Bilgi</p>
                  <div className="mt-1.5 space-y-1 text-blue-200/90">
                    <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
                      <span>İnsan Silüeti Boyu</span>
                      <span className="text-right font-semibold">1.80 m</span>
                    </div>
                    <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
                      <span>Ürün Çözünürlüğü</span>
                      <span className="text-right font-semibold">{summary.resolution} px</span>
                    </div>
                    <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
                      <span>Yatay Panel (Sütun)</span>
                      <span className="text-right font-semibold">{summary.horizontalCabinets}</span>
                    </div>
                    <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
                      <span>Dikey Panel (Satır)</span>
                      <span className="text-right font-semibold">{summary.verticalCabinets}</span>
                    </div>
                    <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
                      <span>Toplam Panel Sayısı</span>
                      <span className="text-right font-semibold">{summary.totalCabinets}</span>
                    </div>
                    <div className="flex items-start justify-between gap-1.5 text-[11px] leading-tight">
                      <span>Gerekli Elektrik Gücü</span>
                      <span className="text-right font-semibold">{formatNumber(summary.maximumPower, 2)} kW</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
      </div>
    </header>
  );
}

export default Header;
