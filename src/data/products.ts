import { ProductItem, StockCard } from '../types';

export const stockCards: StockCard[] = [
  { code: 'CHM.İP186.320160.172.86', name: 'Charming P1.86 Led Modülü', type: 'Led Modülü', location: 'indoor', pixelPitchMm: 1.86, cabinetWidthMm: 320, cabinetHeightMm: 160, powerWPerM2: 400, description: 'İç mekan P1.86 LED modülü, 320 x 160 mm.' },
  { code: 'CHM.İP25.320160.128.64', name: 'Charming P2.5 Led Modülü', type: 'Led Modülü', location: 'indoor', pixelPitchMm: 2.5, cabinetWidthMm: 320, cabinetHeightMm: 160, powerWPerM2: 400, description: 'İç mekan P2.5 LED modülü, 320 x 160 mm.' },
  { code: 'CHM.İP3076.320160.104.52', name: 'Charming P3.076 Led Modülü', type: 'Led Modülü', location: 'indoor', pixelPitchMm: 3.076, cabinetWidthMm: 320, cabinetHeightMm: 160, powerWPerM2: 400, description: 'İç mekan P3.076 LED modülü, 320 x 160 mm.' },
  { code: 'CHM.İP4.320160.80.40', name: 'Charming P4.0 Led Modülü', type: 'Led Modülü', location: 'indoor', pixelPitchMm: 4, cabinetWidthMm: 320, cabinetHeightMm: 160, powerWPerM2: 400, description: 'İç mekan P4.0 LED modülü, 320 x 160 mm.' },
  { code: 'CHM.DP25.320160.128.64', name: 'Charming P2.5 Outdoor Led Modülü', type: 'Led Modülü', location: 'outdoor', pixelPitchMm: 2.5, cabinetWidthMm: 320, cabinetHeightMm: 160, powerWPerM2: 600, description: 'Dış mekan P2.5 LED modülü, 320 x 160 mm.' },
  { code: 'CHM.DP3076.320160.104.52', name: 'Charming P3.076 Outdoor Led Modülü', type: 'Led Modülü', location: 'outdoor', pixelPitchMm: 3.076, cabinetWidthMm: 320, cabinetHeightMm: 160, powerWPerM2: 600, description: 'Dış mekan P3.076 LED modülü, 320 x 160 mm.' },
  { code: 'CHM.DP4.320160.80.40', name: 'Charming P4.0 Outdoor Led Modülü', type: 'Led Modülü', location: 'outdoor', pixelPitchMm: 4, cabinetWidthMm: 320, cabinetHeightMm: 160, powerWPerM2: 600, description: 'Dış mekan P4.0 LED modülü, 320 x 160 mm.' },
  { code: 'CHM.DP5.320160.64.32', name: 'Charming P5.0 Outdoor Led Modülü', type: 'Led Modülü', location: 'outdoor', pixelPitchMm: 5, cabinetWidthMm: 320, cabinetHeightMm: 160, powerWPerM2: 600, description: 'Dış mekan P5.0 LED modülü, 320 x 160 mm.' },
  { code: 'DNM.PSU200W.3.40', name: 'Dinamo CM200A 5-02 PSU', type: 'Güç Kaynağı (PSU)', powerW: 200, description: 'Dinamo CM200A 5-02 güç kaynağı.' },
  { code: 'DNM.PSU300W.3.60', name: 'Dinamo MA300SH5F PSU', type: 'Güç Kaynağı (PSU)', powerW: 300, description: 'Dinamo MA300SH5F güç kaynağı.' },
  { code: 'CHM.SNDMP2.MP2.19201080', name: 'Charming MP2 Sender Card', type: 'Alıcı/Verici Kart', maxPixelCapacity: 1300000, description: 'LED ekran görsel aktarımı için sender kart.' },
  { code: 'CHM.RCV12A.262144.12', name: 'Charming R12-A Receiver', type: 'Processor', maxPixelCapacity: 262144, description: 'LED ekran receiver kartı.' },
  { code: 'CHM.CM4S.3840.1920.5', name: 'Charming CM4S Controller', type: 'Kontrol Kart', maxPixelCapacity: 2500000, description: 'LED ekran kontrolü için profesyonel kontrol cihazı.' },
];

export const calculateProducts = (config: { width: number; height: number; cabinetWidth: number; cabinetHeight: number; pixelPitch: string; type: 'Indoor' | 'Outdoor'; reserveRate: number }, summary: { totalCabinets: number; totalPixels: number; maximumPower: number }): ProductItem[] => {
  const targetPitch = Number.parseFloat(config.pixelPitch.replace(/[^0-9.,]/g, '').replace(',', '.')) || 2.5;
  const location = config.type === 'Outdoor' ? 'outdoor' : 'indoor';
  const modules = stockCards.filter((card) => card.type === 'Led Modülü' && card.location === location);
  const moduleCard = modules.sort((left, right) => Math.abs((left.pixelPitchMm ?? 0) - targetPitch) - Math.abs((right.pixelPitchMm ?? 0) - targetPitch))[0] ?? stockCards[1];
  const powerCard = stockCards.filter((card) => card.type === 'Güç Kaynağı (PSU)').sort((left, right) => (left.powerW ?? 0) - (right.powerW ?? 0)).find((card) => (card.powerW ?? 0) >= (summary.maximumPower * 1000) / Math.max(1, summary.totalCabinets)) ?? stockCards[9];
  const receiverCard = stockCards.find((card) => card.code === 'CHM.RCV12A.262144.12')!;
  const senderCard = stockCards.find((card) => card.code === 'CHM.SNDMP2.MP2.19201080')!;
  const controllerCard = stockCards.find((card) => card.code === 'CHM.CM4S.3840.1920.5')!;
  const withReserve = (quantity: number) => Math.ceil(quantity * (1 + config.reserveRate));
  const moduleCount = summary.totalCabinets;

  return [
    { product: 'LED Cabinet', model: 'Kullanıcı seçimi', code: config.cabinetWidth && config.cabinetHeight ? `${Math.round(config.cabinetWidth * 1000)}x${Math.round(config.cabinetHeight * 1000)}-CAB` : 'CABINET', quantity: summary.totalCabinets, unit: 'ADET', description: 'Girilen ekran ölçüsü ve kabinet ölçüsüne göre hesaplanan kabinet.' },
    { product: 'LED Module', model: moduleCard.name, code: moduleCard.code, quantity: moduleCount, unit: 'ADET', description: moduleCard.description },
    { product: 'Power Supply', model: powerCard.name, code: powerCard.code, quantity: withReserve(Math.ceil((summary.maximumPower * 1000) / (powerCard.powerW ?? 300))), unit: 'ADET', description: `${powerCard.description} (${powerCard.powerW} W).` },
    { product: 'Receiving Card', model: receiverCard.name, code: receiverCard.code, quantity: withReserve(Math.ceil(summary.totalPixels / (receiverCard.maxPixelCapacity ?? 262144))), unit: 'ADET', description: `${receiverCard.description} (${receiverCard.maxPixelCapacity?.toLocaleString('tr-TR')} px kapasite).` },
    { product: 'Sending Card', model: senderCard.name, code: senderCard.code, quantity: Math.ceil(summary.totalPixels / (senderCard.maxPixelCapacity ?? 1300000)), unit: 'ADET', description: `${senderCard.description} (${senderCard.maxPixelCapacity?.toLocaleString('tr-TR')} px kapasite).` },
    { product: 'Video Processor', model: controllerCard.name, code: controllerCard.code, quantity: 1, unit: 'ADET', description: `${controllerCard.description} (${controllerCard.maxPixelCapacity?.toLocaleString('tr-TR')} px kapasite).` },
  ];
};

export const defaultTopology = [
  'Computer',
  'Video Processor',
  'Sending Card',
  'Receiving Card',
  'Cabinet',
  'Module',
];
