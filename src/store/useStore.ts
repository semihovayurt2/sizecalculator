import { create } from 'zustand';
import { LEDConfig, ProductItem, SummaryData } from '../types';
import { defaultProducts, defaultTopology } from '../data/products';

interface StudioState {
  config: LEDConfig;
  products: ProductItem[];
  topology: string[];
  summary: SummaryData;
  setConfig: (partial: Partial<LEDConfig>) => void;
  selectedScene?: string | null;
  setSelectedScene?: (scene: string | null) => void;
}

const getPitchMeters = (pixelPitch: string): number => {
  const sanitized = pixelPitch.trim().toUpperCase().replace('P', '').replace(',', '.');
  const pitchMm = Number.parseFloat(sanitized);
  if (!Number.isFinite(pitchMm) || pitchMm <= 0) {
    return 0.0026;
  }
  return pitchMm / 1000;
};

const defaultConfig: LEDConfig = {
  projectName: 'Premium LED Projesi',
  clientName: 'ABC Etkinlik',
  description: 'Sinema salonu ekranı için deneysel 3D kurulum.',
  application: 'Indoor commercial',
  unit: 'cm',
  wallWidthCm: 300,
  wallHeightCm: 200,
  environment: 'Sinema Salonu',
  type: 'Indoor',
  pixelPitch: 'P2.6',
  series: 'S-4000',
  cabinetModel: 'CAB-1000',
  cabinetWidth: 0.32,
  cabinetHeight: 0.16,
  mountType: 'Wall',
  width: 6,
  height: 3,
  reserveRate: 0.1,
};

const calculateSummary = (config: LEDConfig): SummaryData => {
  const pitchMeters = getPitchMeters(config.pixelPitch);
  const area = config.width * config.height;
  const totalPixels = Math.round((config.width / pitchMeters) * (config.height / pitchMeters));
  const horizontalCabinets = Math.max(1, Math.round(config.width / config.cabinetWidth));
  const verticalCabinets = Math.max(1, Math.round(config.height / config.cabinetHeight));
  const totalCabinets = horizontalCabinets * verticalCabinets;
  const modulesPerCabinet = 12;
  const totalModules = totalCabinets * modulesPerCabinet;
  const receivingCards = Math.ceil(totalCabinets / 4);
  const sendingCards = Math.ceil(totalCabinets / 16);
  const videoProcessors = 1;
  const powerSupply = Math.ceil(totalCabinets / 10);
  const hubBoard = Math.ceil(totalCabinets / 8);
  const dataCable = totalCabinets * 3;
  const powerCable = totalCabinets * 2;
  const frameProfiles = totalCabinets * 1.2;
  const lockMechanisms = totalCabinets * 1.1;
  const totalPower = totalCabinets * 0.45;
  const avgPower = totalPower / totalCabinets;
  const maxPower = totalPower * 1.2;
  const weightPerCabinet = 12;
  const totalWeight = totalCabinets * weightPerCabinet;
  const energyUse = totalPower * 4;

  return {
    area,
    totalPixels,
    resolution: `${Math.round(config.width / pitchMeters)} x ${Math.round(config.height / pitchMeters)}`,
    horizontalCabinets,
    verticalCabinets,
    totalCabinets,
    totalModules,
    receivingCards,
    sendingCards,
    videoProcessors,
    powerSupplies: powerSupply,
    hubBoards: hubBoard,
    dataCable,
    powerCable,
    frameProfiles,
    lockMechanisms,
    totalPower,
    averagePower: avgPower,
    maximumPower: maxPower,
    totalWeight,
    energyConsumption: energyUse,
  };
};

export const useStore = create<StudioState>((set) => ({
  config: defaultConfig,
  products: defaultProducts,
  topology: defaultTopology,
  summary: calculateSummary(defaultConfig),
  selectedScene: null,
  setConfig: (partial) =>
    set((state) => {
      const nextConfig = { ...state.config, ...partial };
      return {
        config: nextConfig,
        summary: calculateSummary(nextConfig),
      };
    }),
  setSelectedScene: (scene) => set(() => ({ selectedScene: scene })),
}));
