import { useStore } from '../store/useStore';

const summaryRows = [
  { label: 'Toplam Alan', key: 'area', suffix: 'm²' },
  { label: 'Toplam Piksel', key: 'totalPixels' },
  { label: 'Gerçek Çözünürlük', key: 'resolution' },
  { label: 'Yatay Cabinet', key: 'horizontalCabinets' },
  { label: 'Dikey Cabinet', key: 'verticalCabinets' },
  { label: 'Toplam Cabinet', key: 'totalCabinets' },
  { label: 'Toplam Module', key: 'totalModules' },
  { label: 'Receiving Card', key: 'receivingCards' },
  { label: 'Sending Card', key: 'sendingCards' },
  { label: 'Video Processor', key: 'videoProcessors' },
  { label: 'Power Supply', key: 'powerSupplies' },
  { label: 'HUB Board', key: 'hubBoards' },
  { label: 'Data Cable', key: 'dataCable', suffix: ' adet' },
  { label: 'Power Cable', key: 'powerCable', suffix: ' adet' },
  { label: 'Frame Profilleri', key: 'frameProfiles', suffix: ' adet' },
  { label: 'Lock Mekanizmaları', key: 'lockMechanisms', suffix: ' adet' },
  { label: 'Toplam Güç', key: 'totalPower', suffix: ' kW' },
  { label: 'Ortalama Güç', key: 'averagePower', suffix: ' kW' },
  { label: 'Maksimum Güç', key: 'maximumPower', suffix: ' kW' },
  { label: 'Toplam Ağırlık', key: 'totalWeight', suffix: ' kg' },
  { label: 'Elektrik Tüketimi', key: 'energyConsumption', suffix: ' kWh' },
];

export function SummaryPanel() {
  const summary = useStore((state) => state.summary);
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">Canlı Hesaplama</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Teknik Özet</h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {summaryRows.map((row) => (
          <div key={row.key} className="rounded-3xl border border-white/10 bg-[#0D0D0D]/95 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">{row.label}</p>
            <p className="mt-3 text-lg font-semibold text-white">
              {summary[row.key as keyof typeof summary]}
              {row.suffix ?? ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
