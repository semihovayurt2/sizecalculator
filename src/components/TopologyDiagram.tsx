import { useStore } from '../store/useStore';

export function TopologyDiagram() {
  const topology = useStore((state) => state.topology);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-white/40">Sistem Topolojisi</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Bağlantı Akışı</h2>
      </div>
      <div className="grid gap-5">
        {topology.map((step, index) => (
          <div key={step} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0D0D0D]/95 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-black">{index + 1}</div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/40">{step}</p>
              <div className="mt-2 h-0.5 w-full bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
