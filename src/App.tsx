import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import { ProductTable } from './components/ProductTable';
import ScenePanel from './components/ScenePanel';

function App() {
  const [step, setStep] = React.useState(1);
  const [isProductPanelOpen, setIsProductPanelOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-text overflow-hidden">
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <ScenePanel />
        </div>

        <Header step={step} setStep={setStep} />

        <div className="pointer-events-none absolute inset-0 z-20">
          <button
            type="button"
            onClick={() => setIsProductPanelOpen((value) => !value)}
            className="pointer-events-auto absolute bottom-4 left-4 z-30 rounded-full bg-[#111111]/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:bg-[#1a1a1a]"
          >
            {isProductPanelOpen ? 'Ürün Listesini Gizle' : 'Ürün Listesi'}
          </button>

          <motion.div
            initial={false}
            animate={isProductPanelOpen ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -28, y: 18, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className={`pointer-events-auto absolute bottom-4 left-4 w-[min(1200px,calc(100vw-2rem))] origin-bottom-left ${
              isProductPanelOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <motion.div
              layout
              className="border border-white/10 bg-transparent p-4 shadow-none backdrop-blur-none"
            >
              <ProductTable />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
