'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

function WireframeCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const { pointer, viewport } = useThree();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth follow of cursor
      const targetX = pointer.y * 0.4;
      const targetY = pointer.x * 0.6;
      meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.05;
      meshRef.current.rotation.z += delta * 0.05;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.15;
      innerRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshBasicMaterial
          color="#f5a524"
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial
          color="#f5f1e8"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f5f1e8"
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  );
}

function FloatingRings() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      group.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.2, 0.005, 8, 100]} />
        <meshBasicMaterial color="#f5a524" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[3.6, 0.004, 8, 100]} />
        <meshBasicMaterial color="#f5f1e8" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export default function ThreeScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <ParticleField />
          <WireframeCore />
          <FloatingRings />
        </Suspense>
      </Canvas>
    </div>
  );
}
