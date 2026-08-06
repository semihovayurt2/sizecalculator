import React from 'react';
import { motion } from 'framer-motion';
import SceneSelector from './SceneSelector';
import { InputField } from './form/InputField';
import { useStore } from '../store/useStore';

interface HeaderProps {
  step: number;
  setStep: (n: number) => void;
}

const steps = [
  { id: 1, label: '01 Senaryo Seçimi' },
  { id: 2, label: '02 Ekran Yapılandırması' },
  { id: 3, label: '03 Çıkış Yapılandırması' },
];

export function Header({ step, setStep }: HeaderProps) {
  const config = useStore((s) => s.config);
  const setConfig = useStore((s) => s.setConfig);

  return (
    <header className="w-full border-b border-border bg-background/50">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-6 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-full bg-accent/90 shadow-sm" />
          <div>
            <div className="text-sm font-semibold text-heading">LED Screen Experience Studio</div>
            <div className="text-xs text-text">Profesyonel sahne tabanlı LED konfigüratörü</div>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="flex items-center gap-6 justify-center">
            {steps.map((s) => (
              <li key={s.id} className="relative">
                <button
                  onClick={() => setStep(s.id)}
                  className={`px-3 py-2 text-sm font-medium ${step === s.id ? 'text-heading' : 'text-text'}`}
                >
                  {s.label}
                </button>
                {step === s.id ? (
                  <motion.div
                    layoutId="active-underline"
                    className="absolute left-0 right-0 mx-auto mt-0.5 h-1 w-10 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-4 flex w-[520px] items-center gap-4">
          <div className="w-44">
            <SceneSelector />
          </div>
          <div className="flex gap-3">
            <div className="w-28">
              <InputField label="Genişlik (m)" value={config.width} onChange={(v) => setConfig({ width: Number(v) })} type="number" />
            </div>
            <div className="w-28">
              <InputField label="Yükseklik (m)" value={config.height} onChange={(v) => setConfig({ height: Number(v) })} type="number" />
            </div>
            <div className="w-28">
              <InputField label="Pitch (mm)" value={config.pixelPitch} onChange={(v) => setConfig({ pixelPitch: v })} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
