import { ProductItem } from '../types';

export const defaultProducts: ProductItem[] = [
  { product: 'LED Cabinet', model: 'CAB-1000', code: 'LED-CAB-1000', quantity: 60, description: '1500mm x 500mm indoor cabinet with premium mounting.' },
  { product: 'LED Module', model: 'MOD-3.9', code: 'LED-MOD-3.9', quantity: 720, description: 'Dual-side SMD module for consistent brightness.' },
  { product: 'Power Supply', model: 'PSU-500W', code: 'PS-500', quantity: 8, description: 'Reliable LED power supply with active cooling.' },
  { product: 'Receiving Card', model: 'RC-8000', code: 'RC-8000', quantity: 15, description: 'High speed receiving card for seamless image delivery.' },
  { product: 'Sending Card', model: 'SC-3000', code: 'SC-3000', quantity: 2, description: 'Versatile sending card with HDMI/SDI input support.' },
  { product: 'Video Processor', model: 'VP-1X', code: 'VP-1X', quantity: 1, description: 'Ultra-wide source processing with scaling and edge blending.' },
  { product: 'Frame Profile', model: 'FP-30', code: 'FP-30', quantity: 72, description: 'Anodized aluminum frame profiles for secure installation.' },
  { product: 'Lock Mechanism', model: 'LM-12', code: 'LM-12', quantity: 72, description: 'Panel lock system for seamless cabinet alignment.' },
];

export const defaultTopology = [
  'Computer',
  'Video Processor',
  'Sending Card',
  'Receiving Card',
  'Cabinet',
  'Module',
];
