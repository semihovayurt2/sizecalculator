export interface LEDConfig {
  projectName: string;
  clientName: string;
  description: string;
  application: string;
  unit: 'cm';
  wallWidthCm: number;
  wallHeightCm: number;
  environment:
    | 'Konser Sahnesi'
    | 'Tiyatro'
    | 'Konferans Salonu'
    | 'Fuar Alanı'
    | 'AVM'
    | 'Mağaza'
    | 'Dış Cephe'
    | 'Billboard'
    | 'Totem'
    | 'Boş Stüdyo';
  type: 'Indoor' | 'Outdoor';
  pixelPitch: string;
  series: string;
  cabinetModel: string;
  cabinetWidth: number;
  cabinetHeight: number;
  mountType: 'Wall' | 'Hanging' | 'Truss' | 'Ground Support' | 'Totem' | 'Billboard' | 'Pole';
  width: number;
  height: number;
  reserveRate: number;
}

export interface SummaryData {
  area: number;
  totalPixels: number;
  resolution: string;
  horizontalCabinets: number;
  verticalCabinets: number;
  totalCabinets: number;
  totalModules: number;
  receivingCards: number;
  sendingCards: number;
  videoProcessors: number;
  powerSupplies: number;
  hubBoards: number;
  dataCable: number;
  powerCable: number;
  frameProfiles: number;
  lockMechanisms: number;
  totalPower: number;
  averagePower: number;
  maximumPower: number;
  totalWeight: number;
  energyConsumption: number;
}

export interface ProductItem {
  product: string;
  model: string;
  code: string;
  quantity: number;
  unit?: string;
  description: string;
}

export interface StockCard {
  code: string;
  name: string;
  type: string;
  location?: 'indoor' | 'outdoor';
  pixelPitchMm?: number;
  cabinetWidthMm?: number;
  cabinetHeightMm?: number;
  powerWPerM2?: number;
  maxPixelCapacity?: number;
  powerW?: number;
  description: string;
}

export interface ScenePlaceholder {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PeoplePosition {
  x: number;
  y: number;
  scale?: number;
}

export interface SceneMeta {
  name: string;
  placeholder: ScenePlaceholder;
  peoplePosition: PeoplePosition;
}

