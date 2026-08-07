import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import SceneSelector from './SceneSelector';
import { useStore } from '../store/useStore';
import { PDFButton } from './PDFButton';

interface HeaderProps {
  step: number;
  setStep: (n: number) => void;
}

const steps = [
  { id: 1, label: '01 Senaryo Seçimi' },
  { id: 2, label: '02 Ekran Yapılandırması' },
  { id: 3, label: '03 Çıkış Yapılandırması' },
];

const pixelPitchOptions = ['P1', 'P1.25', 'P1.5', 'P1.86', 'P2', 'P2.5', 'P3', 'P4', 'P5'];
const PANEL_WIDTH_CM = 32;
const PANEL_HEIGHT_CM = 16;
const selectFieldClassName = 'h-10 w-full rounded-md border border-white/10 bg-[#111111] px-3 text-accent outline-none transition focus:border-[#2dd4bf]';

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
      <label className="mb-2 block text-sm font-semibold text-accent">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateValue(value - step)}
          className="h-8 w-8 rounded-md border border-white/25 bg-transparent text-lg leading-none text-accent transition hover:border-[#2dd4bf] hover:text-[#2dd4bf]"
          aria-label={`${label} azalt`}
        >
          -
        </button>
        <div className="flex h-8 flex-1 items-center rounded-md border border-white/25 bg-transparent px-3">
          <input
            type="number"
            value={value}
            min={min}
            step={step}
            onChange={(e) => updateValue(Number(e.target.value))}
            className="w-full border-none bg-transparent text-center text-base text-accent outline-none placeholder:text-orange-300/50"
          />
          {suffix ? <span className="text-sm text-accent">{suffix}</span> : null}
        </div>
        <button
          type="button"
          onClick={() => updateValue(value + step)}
          className="h-8 w-8 rounded-md border border-white/25 bg-transparent text-lg leading-none text-accent transition hover:border-[#2dd4bf] hover:text-[#2dd4bf]"
          aria-label={`${label} artır`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function Header({ step, setStep }: HeaderProps) {
  const config = useStore((s) => s.config);
  const setConfig = useStore((s) => s.setConfig);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const columns = Math.max(1, Math.floor(config.wallWidthCm / PANEL_WIDTH_CM));
  const rows = Math.max(1, Math.floor(config.wallHeightCm / PANEL_HEIGHT_CM));
  const autoWidthM = Number(((columns * PANEL_WIDTH_CM) / 100).toFixed(2));
  const autoHeightM = Number(((rows * PANEL_HEIGHT_CM) / 100).toFixed(2));

  useEffect(() => {
    if (
      config.width !== autoWidthM ||
      config.height !== autoHeightM ||
      config.cabinetWidth !== 0.32 ||
      config.cabinetHeight !== 0.16
    ) {
      setConfig({
        cabinetWidth: 0.32,
        cabinetHeight: 0.16,
        width: autoWidthM,
        height: autoHeightM,
      });
    }
  }, [autoHeightM, autoWidthM, config.cabinetHeight, config.cabinetWidth, config.height, config.width, setConfig]);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
      <div className="mx-auto max-w-[1800px] px-4 pt-4 sm:px-6 lg:px-10">
        <div
          className="pointer-events-auto"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="flex items-center justify-between gap-4 bg-transparent px-5 py-3 shadow-none backdrop-blur-none">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-accent/90 shadow-sm" />
            <div>
              <div className="text-sm font-semibold text-accent">LED Screen Experience Studio</div>
              <div className="text-xs text-orange-200/90">Profesyonel sahne tabanlı LED konfigüratörü</div>
            </div>
          </div>

          <nav className="flex-1">
            <ul className="flex items-center justify-center gap-6">
              {steps.map((s) => (
                <li key={s.id} className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setStep(s.id)}
                    className={`px-3 py-2 text-sm font-semibold ${step === s.id ? 'text-[#2dd4bf]' : 'text-accent'}`}
                  >
                    {s.label}
                  </button>
                  {step === s.id ? (
                    <motion.div
                      layoutId="active-underline"
                      className="absolute left-0 right-0 mx-auto mt-0.5 h-1 w-10 rounded-full bg-[#2dd4bf]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
          </div>

          <div
            className={`pointer-events-auto mx-auto mt-2 w-[min(520px,calc(100vw-2rem))] overflow-visible rounded-2xl border border-white/10 bg-[#0b0b0b]/20 backdrop-blur-[2px] transition-all duration-100 ease-out sm:w-[min(580px,calc(100vw-3rem))] ${
              isExpanded ? 'max-h-[720px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-2.5 pt-3">
              {step === 1 ? (
                <>
                  <h3 className="mb-3 text-center text-[1.2rem] font-semibold text-accent">Senaryo Seçimi</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <SceneSelector light />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Unit</label>
                      <select
                        value={config.unit}
                        onChange={() => setConfig({ unit: 'cm' })}
                        className={selectFieldClassName}
                      >
                        <option value="cm">cm</option>
                      </select>
                    </div>
                    <StepperInput
                      label="Wall Width"
                      value={config.wallWidthCm}
                      min={10}
                      step={10}
                      suffix="cm"
                      onChange={(v) => setConfig({ wallWidthCm: v })}
                    />
                    <StepperInput
                      label="Wall Height"
                      value={config.wallHeightCm}
                      min={10}
                      step={10}
                      suffix="cm"
                      onChange={(v) => setConfig({ wallHeightCm: v })}
                    />
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <h3 className="mb-3 text-center text-[1.2rem] font-semibold text-accent">Display Configuration</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Select Product</label>
                      <select
                        value={config.pixelPitch}
                        onChange={(e) => setConfig({ pixelPitch: e.target.value })}
                        className={selectFieldClassName}
                      >
                        {pixelPitchOptions.map((pitch) => (
                          <option key={pitch} value={pitch}>
                            {pitch}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Sending Box</label>
                      <select className={selectFieldClassName}>
                        <option>VX400</option>
                        <option>VX600</option>
                        <option>MX30</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Voltage</label>
                      <select className={selectFieldClassName}>
                        <option>220V</option>
                        <option>110V</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Columns (Auto)</label>
                      <div className="flex h-10 items-center px-3 font-medium text-accent">{columns}</div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Rows (Auto)</label>
                      <div className="flex h-10 items-center px-3 font-medium text-accent">{rows}</div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Actual Size</label>
                      <div className="flex h-10 items-center px-3 font-medium text-accent">
                        {config.width.toFixed(2)} m x {config.height.toFixed(2)} m
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Power Cable Routing Mode</label>
                      <select
                        value={config.mountType}
                        onChange={(e) => setConfig({ mountType: e.target.value as typeof config.mountType })}
                        className={selectFieldClassName}
                      >
                        <option value="Wall">Vertical priority</option>
                        <option value="Hanging">Horizontal priority</option>
                        <option value="Truss">Balanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Network Cable Routing Mode</label>
                      <select className={selectFieldClassName}>
                        <option>Vertical priority</option>
                        <option>Horizontal priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">Starting Point</label>
                      <select className={selectFieldClassName}>
                        <option>Top-left</option>
                        <option>Top-right</option>
                        <option>Bottom-left</option>
                        <option>Bottom-right</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <h3 className="mb-3 text-center text-[1.2rem] font-semibold text-accent">Export to PDF</h3>
                  <div className="mx-auto max-w-4xl space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-accent">File Name</label>
                      <input
                        type="text"
                        defaultValue={config.projectName}
                        className="h-10 w-full rounded-md border border-white/20 bg-transparent px-3 text-accent outline-none focus:border-[#2dd4bf]"
                        placeholder="please enter"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-accent">
                      <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked /> Home Page</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked /> LED Wall Display</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked /> LED Wall information</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked /> Product Specification</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked /> Data Cable Layout Diagram</label>
                    </div>
                    <div className="pt-2 flex justify-center">
                      <PDFButton />
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
