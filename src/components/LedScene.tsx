import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { Mesh, Vector3 } from 'three';

const CabinetMesh = ({ columns, rows, width, height }: { columns: number; rows: number; width: number; height: number }) => {
  const totalWidth = width;
  const totalHeight = height;
  const cabinetWidth = width / columns;
  const cabinetHeight = height / rows;

  const cells = useMemo(() => {
    const result = [];
    for (let x = 0; x < columns; x += 1) {
      for (let y = 0; y < rows; y += 1) {
        const key = `${x}-${y}`;
        const left = x * cabinetWidth - totalWidth / 2;
        const bottom = y * cabinetHeight - totalHeight / 2;
        result.push(
          <mesh key={key} position={[left + cabinetWidth / 2, bottom + cabinetHeight / 2, 0.01]}>
            <boxGeometry args={[cabinetWidth * 0.98, cabinetHeight * 0.98, 0.02]} />
            <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.2} emissive="#111111" />
          </mesh>,
        );
      }
    }
    return result;
  }, [columns, rows, cabinetWidth, cabinetHeight, totalWidth, totalHeight]);

  return <group>{cells}</group>;
};

const HumanSilhouette = () => {
  return (
    <mesh position={[0, -0.35, 1.15]}>
      <coneGeometry args={[0.15, 1.75, 24]} />
      <meshStandardMaterial color="#000000" emissive="#050505" />
    </mesh>
  );
};

export function LedScene() {
  const config = useStore((state) => state.config);

  const columns = Math.max(1, Math.round(config.width / config.cabinetWidth));
  const rows = Math.max(1, Math.round(config.height / config.cabinetHeight));

  return (
    <>
      <mesh position={[0, 1.2, 0]}>
        <planeGeometry args={[config.width, config.height]} />
        <meshStandardMaterial color="#050505" emissive="#181919" emissiveIntensity={0.8} opacity={0.98} transparent />
      </mesh>

      <group position={[0, 1.2, 0.02]}>
        <CabinetMesh columns={columns} rows={rows} width={config.width} height={config.height} />
      </group>

      <pointLight position={[2, 3, 4]} intensity={2.1} color="#FF7A00" castShadow />
      <pointLight position={[-3, 4, 2]} intensity={1.1} color="#92C9FF" />
      <spotLight position={[5, 7, 6]} angle={0.27} penumbra={0.1} intensity={1.5} castShadow />
    </>
  );
}
