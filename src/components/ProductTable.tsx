import { useStore } from '../store/useStore';
import { PDFButton } from './PDFButton';

export function ProductTable() {
  const panels = useStore((state) => state.panels);

  const renderPanel = (panel: typeof panels[number]) => {
    const maxCurrentA = (panel.summary.maximumPower * 1000) / 220;

    const metrics = [
      { label: 'Toplam Çözünürlük', value: panel.summary.resolution },
      { label: 'Toplam Pixel', value: panel.summary.totalPixels.toLocaleString('tr-TR') },
      { label: 'Max Güç (kW)', value: panel.summary.maximumPower.toFixed(2) },
      { label: 'Ort. Güç (kW)', value: panel.summary.averagePower.toFixed(2) },
      { label: 'Akım (A)', value: maxCurrentA.toFixed(2) },
      { label: 'Toplam panel sayısı', value: panel.summary.totalCabinets.toString() },
    ];

    return (
    <section key={panel.id} className="rounded-3xl border border-white/10 bg-transparent p-6 shadow-none">
      <h2 className="mb-4 text-lg font-semibold text-blue-100">{panel.name}</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-[#60a5fa]/70 bg-black/35 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.16em] text-blue-200/50">{metric.label}</div>
            <div className="mt-1 text-sm font-semibold text-blue-200/90">{metric.value}</div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-3xl border border-[#60a5fa]/70 bg-black/65 backdrop-blur-sm">
        <table className="min-w-full border-collapse text-left text-sm text-blue-200/90">
          <thead>
            <tr className="bg-[#111111]">
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-blue-200/50">Ürün</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-blue-200/50">Model</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-blue-200/50">Kod</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-blue-200/50">Miktar</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-blue-200/50">
                <div className="flex items-center justify-between gap-4">
                  <span>Açıklama</span>
                  <PDFButton compact />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {panel.products.map((product) => (
              <tr key={product.code} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-5 py-4 font-medium text-blue-200/90">{product.product}</td>
                <td className="px-5 py-4">{product.model}</td>
                <td className="px-5 py-4">{product.code}</td>
                <td className="px-5 py-4">{product.quantity} {product.unit ?? 'ADET'}</td>
                <td className="px-5 py-4 text-blue-200/80">{product.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    );
  };

  return (
    <div className="space-y-5">
      {panels.map(renderPanel)}
    </div>
  );
}
