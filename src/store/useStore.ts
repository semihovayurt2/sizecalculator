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
  panels: PanelState[];
  activePanelId: string;
  addPanel: () => void;
  selectPanel: (panelId: string) => void;
  renamePanel: (panelId: string, name: string) => void;
  removePanel: (panelId: string) => void;
  setPanelScene: (panelId: string, scene: string | null) => void;
  panelSelectionVisible: boolean;
  clearPanelSelection: () => void;
}

export interface PanelState {
  id: string;
  name: string;
  config: LEDConfig;
  products: ProductItem[];
  summary: SummaryData;
  selectedScene: string | null;
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
const initialPanel: PanelState = {
  id: 'panel-1',
  name: 'Ekran-1',
  config: initialDerivedState.config,
  products: initialDerivedState.products,
  summary: initialDerivedState.summary,
  selectedScene: 'billboard-large',
};

export const useStore = create<StudioState>((set) => ({
  config: initialDerivedState.config,
  products: initialDerivedState.products,
  topology: defaultTopology,
  summary: initialDerivedState.summary,
  selectedScene: 'billboard-large',
  panels: [initialPanel],
  activePanelId: initialPanel.id,
  panelSelectionVisible: false,
  setConfig: (partial) =>
    set((state) => {
      const activePanel = state.panels.find((panel) => panel.id === state.activePanelId) ?? initialPanel;
      const nextConfig = { ...activePanel.config, ...partial };
      const derived = getDerivedState(nextConfig);
      const panels = state.panels.map((panel) => panel.id === activePanel.id ? { ...panel, ...derived } : panel);
      return { ...derived, panels };
    }),
  setSelectedScene: (scene) => set((state) => ({
    selectedScene: scene,
    panels: state.panels.map((panel) => panel.id === state.activePanelId ? { ...panel, selectedScene: scene } : panel),
  })),
  setPanelScene: (panelId, scene) => set((state) => ({
    selectedScene: panelId === state.activePanelId ? scene : state.selectedScene,
    panels: state.panels.map((panel) => panel.id === panelId ? { ...panel, selectedScene: scene } : panel),
  })),
  addPanel: () => set((state) => {
    const nextNumber = state.panels.length + 1;
    const panel: PanelState = {
      id: `panel-${Date.now()}`,
      name: `Ekran-${nextNumber}`,
      config: { ...defaultConfig },
      products: initialDerivedState.products,
      summary: initialDerivedState.summary,
      selectedScene: state.selectedScene ?? 'billboard-large',
    };
    return {
      panels: [...state.panels, panel],
      activePanelId: panel.id,
      config: panel.config,
      products: panel.products,
      summary: panel.summary,
      selectedScene: panel.selectedScene,
    };
  }),
  selectPanel: (panelId) => set((state) => {
    const panel = state.panels.find((item) => item.id === panelId);
    if (!panel) return state;
    return {
      activePanelId: panel.id,
      config: panel.config,
      products: panel.products,
      summary: panel.summary,
      selectedScene: panel.selectedScene,
      panelSelectionVisible: true,
    };
  }),
  clearPanelSelection: () => set(() => ({ panelSelectionVisible: false })),
  renamePanel: (panelId, name) => set((state) => ({
    panels: state.panels.map((panel) => panel.id === panelId ? { ...panel, name: name.trim() || panel.name } : panel),
  })),
  removePanel: (panelId) => set((state) => {
    if (state.panels.length === 1) return state;
    const remainingPanels = state.panels.filter((panel) => panel.id !== panelId);
    const activePanel = remainingPanels.find((panel) => panel.id === state.activePanelId) ?? remainingPanels[remainingPanels.length - 1];
    return {
      panels: remainingPanels,
      activePanelId: activePanel.id,
      config: activePanel.config,
      products: activePanel.products,
      summary: activePanel.summary,
      selectedScene: activePanel.selectedScene,
    };
  }),
}));
