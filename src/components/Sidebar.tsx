import { LEDConfig } from '../types';
import { useStore } from '../store/useStore';
import { Info, LayoutGrid, MapPin, Sparkles, Target } from 'lucide-react';
import { InputField } from './form/InputField';
import { SelectField } from './form/SelectField';
import SceneSelector from './SceneSelector';

const environmentOptions = [
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
] as const;

const mountOptions = ['Wall', 'Hanging', 'Truss', 'Ground Support', 'Totem', 'Billboard', 'Pole'] as const;

export function Sidebar() {
  const config = useStore((state) => state.config);
  const setConfig = useStore((state) => state.setConfig);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-[#111111]/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="mb-6 flex items-center gap-3 text-sm uppercase tracking-[0.32em] text-blue-200/40">
          <Sparkles className="h-5 w-5 text-blue-200/80" />
          <span>Proje Bilgileri</span>
        </div>
        <div className="space-y-4">
          <InputField label="Proje Adı" value={config.projectName} onChange={(value) => setConfig({ projectName: value })} icon={<LayoutGrid className="h-4 w-4" />} />
          <InputField label="Müşteri Adı" value={config.clientName} onChange={(value) => setConfig({ clientName: value })} icon={<MapPin className="h-4 w-4" />} />
          <InputField label="Açıklama" value={config.description} onChange={(value) => setConfig({ description: value })} icon={<Info className="h-4 w-4" />} />
        </div>
      </div>

      <div>
          <SceneSelector />
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#111111]/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="mb-6 flex items-center gap-3 text-sm uppercase tracking-[0.32em] text-blue-200/40">
          <Target className="h-5 w-5 text-blue-200/80" />
          <span>LED Bilgileri</span>
        </div>
        <div className="grid gap-4">
          <SelectField label="Indoor / Outdoor" value={config.type} options={[{ label: 'Indoor', value: 'Indoor' }, { label: 'Outdoor', value: 'Outdoor' }]} onChange={(value) => setConfig({ type: value as 'Indoor' | 'Outdoor' })} />
          <InputField label="Pixel Pitch" value={config.pixelPitch} onChange={(value) => setConfig({ pixelPitch: value })} />
          <InputField label="LED Serisi" value={config.series} onChange={(value) => setConfig({ series: value })} />
          <InputField label="Cabinet Modeli" value={config.cabinetModel} onChange={(value) => setConfig({ cabinetModel: value })} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Cabinet Genişliği (m)" type="number" value={config.cabinetWidth} onChange={(value) => setConfig({ cabinetWidth: Number(value) })} />
            <InputField label="Cabinet Yüksekliği (m)" type="number" value={config.cabinetHeight} onChange={(value) => setConfig({ cabinetHeight: Number(value) })} />
          </div>
          <SelectField label="Montaj Tipi" options={mountOptions.map((value) => ({ label: value, value }))} value={config.mountType} onChange={(value) => setConfig({ mountType: value as LEDConfig['mountType'] })} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Genişlik (m)" type="number" value={config.width} onChange={(value) => setConfig({ width: Number(value) })} />
            <InputField label="Yükseklik (m)" type="number" value={config.height} onChange={(value) => setConfig({ height: Number(value) })} />
          </div>
          <SelectField label="Yedek Oranı" options={[{ label: '%0', value: '0' }, { label: '%5', value: '0.05' }, { label: '%10', value: '0.1' }, { label: '%15', value: '0.15' }]} value={config.reserveRate.toString()} onChange={(value) => setConfig({ reserveRate: Number(value) })} />
          <SelectField label="Arka Plan" options={environmentOptions.map((value) => ({ label: value, value }))} value={config.environment} onChange={(value) => setConfig({ environment: value as LEDConfig['environment'] })} />
        </div>
      </div>
    </div>
  );
}
