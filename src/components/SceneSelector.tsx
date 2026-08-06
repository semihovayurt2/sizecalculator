import React from 'react';
import { useStore } from '../store/useStore';

type SceneMap = Record<string, any>;

const normalizePath = (path: string) => path.replace(/\\/g, '/');

export function SceneSelector() {
  const scenes = import.meta.glob('../assets/scenes/*/scene.json', { eager: true, query: '?json' }) as SceneMap;
  const entries = Object.entries(scenes).map(([path, data]) => {
    const normalized = normalizePath(path);
    const parts = normalized.split('/');
    const folder = parts[parts.length - 2];
    return { id: folder, meta: data };
  });

  const selected = useStore((s) => s.selectedScene);
  const setSelected = useStore((s) => s.setSelectedScene!);

  return (
    <div className="mt-4">
      <label className="block mb-2 text-xs uppercase tracking-[0.24em] text-white/40">Sahne Seçimi</label>
      <div className="rounded-3xl border border-white/10 bg-[#0D0D0D] px-3 py-2">
        <select
          className="w-full bg-transparent text-sm text-white outline-none"
          value={selected ?? ''}
          onChange={(e) => setSelected(e.target.value || null)}
        >
          <option value="">-- Sahne seçin --</option>
          <option value="billboard-large" className="bg-[#0B0B0B] text-white">Büyük Billboard</option>
          <option value="billboard-small" className="bg-[#0B0B0B] text-white">Küçük Billboard</option>
          <option value="mobilcar" className="bg-[#0B0B0B] text-white">Mobil Araç</option>
          {entries.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#0B0B0B] text-white">
              {s.meta.name ?? s.id}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SceneSelector;
