import { useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { Group, Plane, Vector3 } from 'three';

interface LedSceneProps {
  screenCenterX: number;
  screenCenterY: number;
  frameAspectRatio: number;
  screenWidthRatio: number;
  screenHeightRatio: number;
  panelMediaUrl?: string;
}

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const CabinetMesh = ({ columns, rows, width, height }: { columns: number; rows: number; width: number; height: number }) => {
  const totalWidth = columns * width;
  const totalHeight = rows * height;
  const cabinetWidth = width;
  const cabinetHeight = height;

  const cells = useMemo(() => {
    const result = [];
    for (let x = 0; x < columns; x += 1) {
      for (let y = 0; y < rows; y += 1) {
        const key = `${x}-${y}`;
        const left = x * cabinetWidth - totalWidth / 2;
        const bottom = y * cabinetHeight - totalHeight / 2;
        result.push(
          <mesh key={key} position={[left + cabinetWidth / 2, bottom + cabinetHeight / 2, 0.03]}>
            <boxGeometry args={[cabinetWidth * 0.96, cabinetHeight * 0.96, 0.04]} />
            <meshStandardMaterial
              color="#0d1117"
              emissive="#0f172a"
              emissiveIntensity={0.9}
              metalness={0.3}
              roughness={0.35}
            />
          </mesh>,
        );
      }
    }
    return result;
  }, [columns, rows, cabinetWidth, cabinetHeight, totalWidth, totalHeight]);

  return (
    <group>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[totalWidth + 0.08, totalHeight + 0.08, 0.05]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.4} />
      </mesh>
      {cells}
    </group>
  );
};

export function LedScene({
  screenCenterX,
  screenCenterY,
  frameAspectRatio,
  screenWidthRatio,
  screenHeightRatio,
  panelMediaUrl,
}: LedSceneProps) {
  const config = useStore((state) => state.config);
  const panelTexture = useTexture(panelMediaUrl || TRANSPARENT_PIXEL);
  const panelGroupRef = useRef<Group>(null);
  const dragRef = useRef<{ start: Vector3; origin: Vector3 } | null>(null);

  const columns = Math.max(1, Math.floor(config.width / config.cabinetWidth));
  const rows = Math.max(1, Math.floor(config.height / config.cabinetHeight));
  const totalWidth = columns * config.cabinetWidth;
  const totalHeight = rows * config.cabinetHeight;
  const cameraDistance = 7.5;
  const cameraFov = 38;
  const visibleHeight = 2 * cameraDistance * Math.tan((cameraFov / 2) * (Math.PI / 180));
  const visibleWidth = visibleHeight * frameAspectRatio;
  const modelWidth = visibleWidth * screenWidthRatio;
  const modelHeight = visibleHeight * screenHeightRatio;
  const initialPosition: [number, number, number] = [
    (screenCenterX - 0.5) * visibleWidth,
    (0.5 - screenCenterY) * visibleHeight,
    0,
  ];

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    if (!panelGroupRef.current) return;
    event.target.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      start: event.point.clone(),
      origin: panelGroupRef.current.position.clone(),
    };
  };

  const handlePointerMove = (event: any) => {
    if (!dragRef.current || !panelGroupRef.current) return;

    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const dragPoint = new Vector3();
    const hit = event.ray.intersectPlane(plane, dragPoint);
    if (!hit) return;

    const delta = dragPoint.sub(dragRef.current.start);
    panelGroupRef.current.position.set(
      dragRef.current.origin.x + delta.x,
      dragRef.current.origin.y + delta.y,
      dragRef.current.origin.z,
    );
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <>
      <group
        ref={panelGroupRef}
        scale={[modelWidth / totalWidth, modelHeight / totalHeight, 1]}
        position={initialPosition}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <CabinetMesh columns={columns} rows={rows} width={config.cabinetWidth} height={config.cabinetHeight} />
        {panelMediaUrl ? (
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[totalWidth, totalHeight]} />
            <meshBasicMaterial map={panelTexture} toneMapped={false} />
          </mesh>
        ) : null}
      </group>

      <pointLight position={[2, 3, 4]} intensity={2.1} color="#FF7A00" castShadow />
      <pointLight position={[-3, 4, 2]} intensity={1.1} color="#92C9FF" />
      <spotLight position={[5, 7, 6]} angle={0.27} penumbra={0.1} intensity={1.5} castShadow />
    </>
  );
}
