import { useStore } from '../store/useStore';

export function ProductTable() {
  const products = useStore((state) => state.products);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">Dinamik Ürün Listesi</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Malzeme & Kod</h2>
        </div>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#090909]/95">
        <table className="min-w-full border-collapse text-left text-sm text-white/80">
          <thead>
            <tr className="bg-[#111111]">
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-white/40">Ürün</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-white/40">Model</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-white/40">Kod</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-white/40">Adet</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-white/40">Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.code} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-5 py-4 font-medium text-white">{product.product}</td>
                <td className="px-5 py-4">{product.model}</td>
                <td className="px-5 py-4">{product.code}</td>
                <td className="px-5 py-4">{product.quantity}</td>
                <td className="px-5 py-4 text-white/70">{product.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
