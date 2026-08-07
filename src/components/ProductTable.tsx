import { useStore } from '../store/useStore';

export function ProductTable() {
  const products = useStore((state) => state.products);

  return (
    <div className="rounded-3xl border border-white/10 bg-transparent p-6 shadow-none">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent/80">Dinamik Ürün Listesi</p>
          <h2 className="mt-3 text-2xl font-semibold text-accent">Malzeme & Kod</h2>
        </div>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/65 backdrop-blur-sm">
        <table className="min-w-full border-collapse text-left text-sm text-accent/90">
          <thead>
            <tr className="bg-[#111111]">
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-accent/60">Ürün</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-accent/60">Model</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-accent/60">Kod</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-accent/60">Adet</th>
              <th className="px-5 py-4 uppercase tracking-[0.2em] text-accent/60">Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.code} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-5 py-4 font-medium text-accent">{product.product}</td>
                <td className="px-5 py-4">{product.model}</td>
                <td className="px-5 py-4">{product.code}</td>
                <td className="px-5 py-4">{product.quantity}</td>
                <td className="px-5 py-4 text-accent/75">{product.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
