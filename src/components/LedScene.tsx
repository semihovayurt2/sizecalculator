import { useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { BufferGeometry, Float32BufferAttribute, Group, Plane, Vector3 } from 'three';

interface LedSceneProps {
  screenCenterX: number;
  screenCenterY: number;
  frameAspectRatio: number;
  screenWidthRatio: number;
  screenHeightRatio: number;
  panelCorners?: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
  onPanelDrag?: (delta: { x: number; y: number }) => void;
  panelMediaUrl?: string;
}

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const quadGeometry = (corners: [[number, number], [number, number], [number, number], [number, number]], z: number) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([
    corners[0][0], corners[0][1], z,
    corners[1][0], corners[1][1], z,
    corners[2][0], corners[2][1], z,
    corners[3][0], corners[3][1], z,
  ], 3));
  geometry.setAttribute('uv', new Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
  geometry.setIndex([0, 2, 1, 0, 3, 2]);
  geometry.computeVertexNormals();
  return geometry;
};

const CabinetMesh = ({ columns, rows, width, height }: { columns: number; rows: number; width: number; height: number }) => {
  const totalWidth = columns * width;
  const totalHeight = rows * height;
  const cells = useMemo(() => {
    const result = [];
    for (let x = 0; x < columns; x += 1) {
      for (let y = 0; y < rows; y += 1) {
        result.push(
          <mesh key={`${x}-${y}`} position={[x * width - totalWidth / 2 + width / 2, y * height - totalHeight / 2 + height / 2, 0.03]}>
            <boxGeometry args={[width * 0.96, height * 0.96, 0.04]} />
            <meshStandardMaterial
              color="#0D0F12"
              emissive="#0D0F12"
              emissiveIntensity={0.35}
              metalness={0.3}
              roughness={0.35}
            />
          </mesh>,
        );
      }
    }
    return result;
  }, [columns, rows, width, height, totalWidth, totalHeight]);

  return (
    <group>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[totalWidth + 0.08, totalHeight + 0.08, 0.05]} />
        <meshStandardMaterial color="#8a8f98" metalness={0.5} roughness={0.4} />
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
  panelCorners,
  onPanelDrag,
  panelMediaUrl,
}: LedSceneProps) {
  const config = useStore((state) => state.config);
  const panelTexture = useTexture(panelMediaUrl || TRANSPARENT_PIXEL);
  const panelGroupRef = useRef<Group>(null);
  const dragRef = useRef<{ start: Vector3; origin: Vector3; lastDelta: Vector3 } | null>(null);

  const columns = Math.max(1, Math.floor(config.width / config.cabinetWidth));
  const rows = Math.max(1, Math.floor(config.height / config.cabinetHeight));
  const visibleHeight = 2;
  const visibleWidth = visibleHeight * frameAspectRatio;
  const modelWidth = visibleWidth * screenWidthRatio;
  const modelHeight = visibleHeight * screenHeightRatio;
  const initialPosition: [number, number, number] = [
    (screenCenterX - 0.5) * visibleWidth,
    (0.5 - screenCenterY) * visibleHeight,
    0,
  ];
  const perspectiveCorners = panelCorners?.map((corner) => [
    (corner.x - 0.5) * visibleWidth,
    (0.5 - corner.y) * visibleHeight,
  ] as [number, number]) as [[number, number], [number, number], [number, number], [number, number]] | undefined;

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    if (!panelGroupRef.current) return;
    event.target.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      start: event.point.clone(),
      origin: panelGroupRef.current.position.clone(),
      lastDelta: new Vector3(),
    };
  };

  const handlePointerMove = (event: any) => {
    if (!dragRef.current || !panelGroupRef.current) return;

    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const dragPoint = new Vector3();
    const hit = event.ray.intersectPlane(plane, dragPoint);
    if (!hit) return;

    const delta = dragPoint.sub(dragRef.current.start);
    if (perspectiveCorners && onPanelDrag) {
      const incrementalDelta = delta.clone().sub(dragRef.current.lastDelta);
      dragRef.current.lastDelta.copy(delta);
      onPanelDrag({ x: incrementalDelta.x / visibleWidth, y: -incrementalDelta.y / visibleHeight });
      return;
    }

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
        scale={perspectiveCorners ? [1, 1, 1] : [modelWidth / (columns * config.cabinetWidth), modelHeight / (rows * config.cabinetHeight), 1]}
        position={perspectiveCorners ? [0, 0, 0] : initialPosition}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {perspectiveCorners ? (
          <mesh geometry={quadGeometry(perspectiveCorners, 0.03)}>
            <meshStandardMaterial color="#0D0F12" emissive="#0D0F12" emissiveIntensity={0.35} metalness={0.3} roughness={0.35} />
          </mesh>
        ) : (
          <CabinetMesh columns={columns} rows={rows} width={config.cabinetWidth} height={config.cabinetHeight} />
        )}
        {panelMediaUrl ? (
          <mesh geometry={perspectiveCorners ? quadGeometry(perspectiveCorners, 0.06) : undefined} position={perspectiveCorners ? undefined : [0, 0, 0.06]}>
            {perspectiveCorners ? null : <planeGeometry args={[columns * config.cabinetWidth, rows * config.cabinetHeight]} />}
            <meshBasicMaterial map={panelTexture} toneMapped={false} />
          </mesh>
        ) : null}
      </group>

      <pointLight position={[2, 3, 4]} intensity={1.4} color="#FFFFFF" castShadow />
      <pointLight position={[-3, 4, 2]} intensity={0.8} color="#FFFFFF" />
      <spotLight position={[5, 7, 6]} angle={0.27} penumbra={0.1} intensity={1.5} castShadow />
    </>
  );
}
