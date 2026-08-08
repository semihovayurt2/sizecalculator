import { z } from 'zod';

export const inputSchema = z.object({
  projectName: z.string().min(2),
  clientName: z.string().min(2),
  description: z.string().min(5),
  application: z.string().min(2),
  unit: z.literal('cm'),
  wallWidthCm: z.number().min(10),
  wallHeightCm: z.number().min(10),
  environment: z.enum([
    'Konser Sahnesi',
    'Tiyatro',
    'Konferans Salonu',
    'Fuar Alanı',
    'AVM',
    'Mağaza',
    'Dış Cephe',
    'Billboard',
    'Totem',
    'Boş Stüdyo',
  ]),
  type: z.enum(['Indoor', 'Outdoor']),
  pixelPitch: z.string(),
  series: z.string(),
  cabinetModel: z.string(),
  cabinetWidth: z.number().min(0.2),
  cabinetHeight: z.number().min(0.2),
  mountType: z.enum(['Wall', 'Hanging', 'Truss', 'Ground Support', 'Totem', 'Billboard', 'Pole']),
  width: z.number().min(1),
  height: z.number().min(0.5),
  reserveRate: z.number().min(0).max(0.25),
});

export type InputSchema = z.infer<typeof inputSchema>;
