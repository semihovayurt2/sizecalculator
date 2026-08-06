import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Sidebar } from './components/Sidebar';
import Header from './components/Header';
import { SummaryPanel } from './components/SummaryPanel';
import { ProductTable } from './components/ProductTable';
import { TopologyDiagram } from './components/TopologyDiagram';
import { PDFButton } from './components/PDFButton';
import { LedScene } from './components/LedScene';
import ScenePanel from './components/ScenePanel';

function App() {
  const [step, setStep] = React.useState(1);

  return (
    <div className="min-h-screen bg-background text-text">
      <Header step={step} setStep={setStep} />
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-6 px-5 py-6 xl:px-10">
        <aside className="w-[360px] flex-shrink-0 rounded-3xl border border-white/10 bg-[#111111]/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <Sidebar />
        </aside>

        <main className="flex-1 space-y-6">
          <section className="rounded-[40px] border border-border bg-card p-6 shadow-[0_40px_80px_rgba(2,6,23,0.04)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-text">LED Screen Experience Studio</p>
                <h1 className="mt-3 text-3xl font-semibold text-heading">Gerçek Zamanlı 3D LED Demo</h1>
              </div>
              <PDFButton />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
              <motion.div
                layout
                className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#090909]/95 p-6 shadow-glow"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#FF7A00]/20 to-transparent" />
                <div className="relative h-[720px] rounded-[28px] border border-white/5 bg-[#080808]/80">
                  <Canvas shadows camera={{ position: [0, 1.8, 6], fov: 40 }}>
                    <ambientLight intensity={0.55} />
                    <directionalLight castShadow intensity={1.1} position={[5, 8, 6]} shadow-mapSize={[2048, 2048]} />
                    <Environment preset="studio" />
                    <PerspectiveCamera makeDefault position={[0, 1.8, 6]} fov={40} />
                    <OrbitControls enablePan enableZoom enableRotate minDistance={2.8} maxDistance={15} />
                    <LedScene />
                  </Canvas>
                  <ScenePanel />
                </div>
              </motion.div>

              <div className="space-y-6">
                <SummaryPanel />
                <TopologyDiagram />
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.92fr_0.88fr]">
            <ProductTable />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
