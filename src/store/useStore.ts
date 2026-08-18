import { create } from 'zustand';
import { LEDConfig, ProductItem, SummaryData } from '../types';
import { calculateProducts, defaultTopology, stockCards } from '../data/products';

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
  description: 'Mağaza ekranı için deneysel 3D kurulum.',
  application: 'Indoor commercial',
  unit: 'cm',
  wallWidthCm: 324,
  wallHeightCm: 180,
  environment: 'Mağaza',
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

const getModuleCard = (config: LEDConfig) => {
  const pitch = Number.parseFloat(config.pixelPitch.trim().toUpperCase().replace('P', '').replace(',', '.')) || 2.5;
  const location = config.type === 'Outdoor' ? 'outdoor' : 'indoor';
  return stockCards
    .filter((card) => card.type === 'Led Modülü' && card.location === location)
    .sort((left, right) => Math.abs((left.pixelPitchMm ?? 0) - pitch) - Math.abs((right.pixelPitchMm ?? 0) - pitch))[0];
};

const calculateSummary = (config: LEDConfig): SummaryData => {
  const pitchMeters = getPitchMeters(config.pixelPitch);
  const horizontalCabinets = Math.max(1, Math.floor(config.width / config.cabinetWidth));
  const verticalCabinets = Math.max(1, Math.floor(config.height / config.cabinetHeight));
  const screenWidth = horizontalCabinets * config.cabinetWidth;
  const screenHeight = verticalCabinets * config.cabinetHeight;
  const area = screenWidth * screenHeight;
  const totalPixels = Math.round((screenWidth / pitchMeters) * (screenHeight / pitchMeters));
  const totalCabinets = horizontalCabinets * verticalCabinets;
  const modulesPerCabinet = 1;
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
  const moduleCard = getModuleCard(config);
  const totalPower = (area * (moduleCard?.powerWPerM2 ?? 400)) / 1000;
  const avgPower = totalPower / totalCabinets;
  const maxPower = totalPower * 1.2;
  const weightPerCabinet = 12;
  const totalWeight = totalCabinets * weightPerCabinet;
  const energyUse = totalPower * 4;

  return {
    area,
    totalPixels,
    resolution: `${Math.round(screenWidth / pitchMeters)} x ${Math.round(screenHeight / pitchMeters)}`,
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

const getDerivedState = (config: LEDConfig) => {
  const summary = calculateSummary(config);
  return {
    config,
    summary,
    products: calculateProducts(config, summary),
  };
};

const initialDerivedState = getDerivedState(defaultConfig);

export const useStore = create<StudioState>((set) => ({
  config: initialDerivedState.config,
  products: initialDerivedState.products,
  topology: defaultTopology,
  summary: initialDerivedState.summary,
  selectedScene: 'billboard-large',
  setConfig: (partial) =>
    set((state) => {
      const nextConfig = { ...state.config, ...partial };
      return getDerivedState(nextConfig);
    }),
  setSelectedScene: (scene) => set(() => ({ selectedScene: scene })),
}));
