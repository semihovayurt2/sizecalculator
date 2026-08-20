import React, { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SceneSelectorProps {
  light?: boolean;
  onAddScene?: () => void;
  activePanelName?: string;
  onEditPanelName?: () => void;
}

const OPTIONS = [
  { id: 'billboard-large', label: 'Büyük Billboard' },
  { id: 'billboard-small', label: 'Küçük Billboard' },
  { id: 'store', label: 'Mağaza' },
  { id: 'mobilcar', label: 'Mobil Araç' },
];

export function SceneSelector({ light = false, onAddScene, activePanelName, onEditPanelName }: SceneSelectorProps) {
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
      <label className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-blue-200/90">
        <span>Sahne Seçimi</span>
        {activePanelName ? (
          <span className="flex min-w-0 items-center gap-1 text-[#60a5fa]">
            <span className="truncate text-[11px] font-normal">{activePanelName}</span>
            <button
              type="button"
              onClick={onEditPanelName}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-blue-200/60 transition hover:text-[#93c5fd]"
              aria-label={`${activePanelName} adını düzenle`}
              title="İsmi düzenle"
            >
              <Pencil className="h-2.5 w-2.5" />
            </button>
          </span>
        ) : null}
      </label>
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
            setIsOpen(false);
            onAddScene?.();
          }}
          className="mx-2 my-1 block w-[calc(100%-1rem)] rounded-md border border-dashed border-[#60a5fa]/60 px-3 py-3 text-left font-semibold text-[#93c5fd] transition hover:bg-[#172033]"
        >
          Sahne Ekle
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
