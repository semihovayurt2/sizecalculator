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

const defaultConfig: LEDConfig = {
  projectName: 'Premium LED Projesi',
  clientName: 'ABC Etkinlik',
  description: 'Sinema salonu ekranı için deneysel 3D kurulum.',
  environment: 'Sinema Salonu',
  type: 'Indoor',
  pixelPitch: 'P2.6',
  series: 'S-4000',
  cabinetModel: 'CAB-1000',
  cabinetWidth: 0.5,
  cabinetHeight: 0.5,
  mountType: 'Wall',
  width: 6,
  height: 3,
  reserveRate: 0.1,
};

const calculateSummary = (config: LEDConfig): SummaryData => {
  const area = config.width * config.height;
  const totalPixels = Math.round((config.width / 0.0026) * (config.height / 0.0026));
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
    resolution: `${Math.round(config.width / 0.0026)} x ${Math.round(config.height / 0.0026)}`,
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
