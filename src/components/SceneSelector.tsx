import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';

interface SceneSelectorProps {
  light?: boolean;
}

const OPTIONS = [
  { id: 'billboard-large', label: 'Büyük Billboard' },
  { id: 'billboard-small', label: 'Küçük Billboard' },
  { id: 'store', label: 'Mağaza' },
  { id: 'mobilcar', label: 'Mobil Araç' },
];

export function SceneSelector({ light = false }: SceneSelectorProps) {
  const selected = useStore((s) => s.selectedScene);
  const setSelected = useStore((s) => s.setSelectedScene!);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = OPTIONS.find((option) => option.id === selected)?.label ?? '-- Sahne seçin --';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative z-40">
      <label className="mb-2 block text-sm font-semibold text-blue-200/90">Sahne Seçimi</label>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-[#0b0b0b] px-3 text-blue-200/90 shadow-none outline-none transition hover:bg-[#141414]"
      >
        <span className="truncate text-left">{selectedLabel}</span>
        <span className="ml-3 text-blue-300/80">⌄</span>
      </button>

      <div
        className={`absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b] shadow-none transition-all duration-150 ${
          isOpen ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setIsOpen(false);
          }}
          className="block w-full px-3 py-3 text-left text-blue-200/90 transition hover:bg-white/10"
        >
          -- Sahne seçin --
        </button>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setSelected(option.id);
                setIsOpen(false);
              }}
              className={`mx-2 my-1 block w-[calc(100%-1rem)] rounded-md border px-3 py-3 text-left transition ${
                isSelected
                  ? 'border-[#2dd4bf]/25 bg-[#173c37] text-[#2dd4bf]'
                  : 'border-white/10 bg-[#111111] text-blue-200/90 hover:bg-[#181818]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SceneSelector;
