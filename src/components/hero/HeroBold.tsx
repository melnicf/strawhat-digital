"use client";

import { useFrame, Canvas, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import {
  Float,
  PerspectiveCamera,
  MeshDistortMaterial,
  Points,
  PointMaterial,
} from "@react-three/drei";

// --- Shader for Glowing Lines ---
const LineShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColor: { value: new THREE.Color("#e11d48") }, // Balanced Rose Red
    uOpacity: { value: 0.15 },
  },
  vertexShader: `
    uniform vec2 uMouse;
    varying float vGlow;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vec4 projected = projectionMatrix * mvPosition;
      vec2 screenPos = projected.xy / projected.w;
      
      float dist = distance(screenPos, uMouse);
      vGlow = smoothstep(0.4, 0.0, dist);
      
      gl_Position = projected;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vGlow;
    void main() {
      float finalOpacity = uOpacity + (vGlow * 0.4);
      vec3 finalColor = mix(uColor, vec3(1.0, 0.6, 0.7), vGlow * 0.4); // Mix with a light pink highlight
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `,
};

// --- Shader for Glowing Points ---
const PointShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColor: { value: new THREE.Color("#e11d48") },
    uSize: { value: 0.07 },
  },
  vertexShader: `
    uniform vec2 uMouse;
    uniform float uSize;
    varying float vGlow;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vec4 projected = projectionMatrix * mvPosition;
      vec2 screenPos = projected.xy / projected.w;
      
      float dist = distance(screenPos, uMouse);
      vGlow = smoothstep(0.4, 0.0, dist);
      
      gl_PointSize = uSize * (1000.0 / -mvPosition.z) * (1.0 + vGlow * 1.5);
      gl_Position = projected;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vGlow;
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = smoothstep(0.5, 0.3, dist);
      vec3 finalColor = mix(uColor, vec3(1.0, 0.7, 0.8), vGlow * 0.6); // Modern pinkish-white glow
      gl_FragColor = vec4(finalColor, alpha * (0.6 + vGlow * 0.4));
    }
  `,
};

// --- Components ---

/**
 * A pulsating digital core that reflects the "energy" of the company.
 */
function DigitalCore({
  isDark,
  mouse,
  isMobile,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<THREE.Vector2>;
  isMobile: boolean;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Vibrant Rose/Crimson for both modes
  const color = isDark ? "#dc2626" : "#e11d48";
  const glowColor = isDark ? "#ef4444" : "#fb7185";

  // Position adjusted for mobile - more centered and scaled down
  const baseX = isMobile ? 1.5 : 3.5;
  const baseScale = isMobile ? 0.6 : 1;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.5;
      coreRef.current.rotation.z = time * 0.3;
      const scale = (1 + Math.sin(time * 2) * 0.1) * baseScale;
      coreRef.current.scale.set(scale, scale, scale);

      // Subtle mouse follow
      coreRef.current.position.x =
        baseX + (isMobile ? 0 : mouse.current.x * 0.2);
      coreRef.current.position.y = isMobile ? 0 : mouse.current.y * 0.2;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = -time * 0.2;
      outerRef.current.rotation.x = time * 0.15;
      outerRef.current.position.x =
        baseX + (isMobile ? 0 : mouse.current.x * 0.15);
      outerRef.current.position.y = isMobile ? 0 : mouse.current.y * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2;
      ringRef.current.rotation.y = time * 0.8;
      ringRef.current.position.x =
        baseX + (isMobile ? 0 : mouse.current.x * 0.1);
      ringRef.current.position.y = isMobile ? 0 : mouse.current.y * 0.1;
    }
  });

  const coreSize = isMobile ? 0.5 : 0.8;
  const outerSize = isMobile ? 0.8 : 1.2;
  const ringSize = isMobile ? 1.0 : 1.5;

  return (
    <group>
      {/* Inner pulsing core */}
      <mesh ref={coreRef} position={[baseX, 0, -1]}>
        <icosahedronGeometry args={[coreSize, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={2}
          wireframe
        />
      </mesh>

      {/* Outer distorted shell */}
      <mesh ref={outerRef} position={[baseX, 0, -1]}>
        <sphereGeometry args={[outerSize, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.4}
          radius={1}
          transparent
          opacity={0.2}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Orbital Ring */}
      <mesh ref={ringRef} position={[baseX, 0, -1]}>
        <torusGeometry args={[ringSize, 0.02, 16, 100]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={1}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Light coming from the core */}
      <pointLight
        position={[baseX, 0, -1]}
        color={glowColor}
        intensity={isMobile ? 1.5 : 2}
        distance={5}
      />
    </group>
  );
}

/**
 * A neural network field of interconnected nodes.
 */
function NeuralField({
  isDark,
  mouse,
  isMobile,
}: {
  isDark: boolean;
  mouse: React.MutableRefObject<THREE.Vector2>;
  isMobile: boolean;
}) {
  const nodesRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const lineShaderRef = useRef<THREE.ShaderMaterial>(null);
  const pointShaderRef = useRef<THREE.ShaderMaterial>(null);

  // Vibrant Rose/Pinkish-Red for Light Mode, Crimson for Dark Mode
  const color = isDark ? "#dc2626" : "#e11d48";

  const particleCount = isMobile ? 60 : 100; // Fewer particles on mobile
  const { positions } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Adjust X range for mobile - more centered
      const xRange = isMobile ? 4 : 6;
      const xOffset = isMobile ? 0 : 2;
      pos[i * 3] = xOffset + (Math.random() - 0.2) * xRange; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15; // Y (Increased vertical range)
      pos[i * 3 + 2] = -2 + (Math.random() - 0.5) * 4; // Z
    }
    return { positions: pos };
  }, [isMobile, particleCount]);

  useFrame((state) => {
    if (!nodesRef.current || !linesRef.current) return;

    const time = state.clock.getElapsedTime();
    const posAttr = nodesRef.current.geometry.attributes.position;
    const linePosAttr = linesRef.current.geometry.attributes.position;
    const positionsArray = posAttr.array as Float32Array;

    // Update uniforms
    if (lineShaderRef.current) {
      lineShaderRef.current.uniforms.uTime.value = time;
      lineShaderRef.current.uniforms.uMouse.value.copy(mouse.current);
      lineShaderRef.current.uniforms.uColor.value.set(color);
    }
    if (pointShaderRef.current) {
      pointShaderRef.current.uniforms.uTime.value = time;
      pointShaderRef.current.uniforms.uMouse.value.copy(mouse.current);
      pointShaderRef.current.uniforms.uColor.value.set(color);
    }

    // Update node positions
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Normal floating
      positionsArray[i3] += Math.sin(time * 0.3 + i) * 0.001;
      positionsArray[i3 + 1] += Math.cos(time * 0.2 + i) * 0.001;
    }
    posAttr.needsUpdate = true;

    // Update lines (connect nearby nodes)
    let lineIdx = 0;
    const linePositions = linePosAttr.array as Float32Array;
    const maxDistance = 1.8;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positionsArray[i * 3] - positionsArray[j * 3];
        const dy = positionsArray[i * 3 + 1] - positionsArray[j * 3 + 1];
        const dz = positionsArray[i * 3 + 2] - positionsArray[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistance * maxDistance) {
          if (lineIdx < linePositions.length - 6) {
            linePositions[lineIdx++] = positionsArray[i * 3];
            linePositions[lineIdx++] = positionsArray[i * 3 + 1];
            linePositions[lineIdx++] = positionsArray[i * 3 + 2];
            linePositions[lineIdx++] = positionsArray[j * 3];
            linePositions[lineIdx++] = positionsArray[j * 3 + 1];
            linePositions[lineIdx++] = positionsArray[j * 3 + 2];
          }
        }
      }
    }

    // Reset remaining line positions to 0
    for (let i = lineIdx; i < linePositions.length; i++) {
      linePositions[i] = 0;
    }
    linePosAttr.needsUpdate = true;
  });

  return (
    <group>
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={particleCount}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={pointShaderRef}
          {...PointShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(500 * 3 * 2), 3]}
            count={500 * 2}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={lineShaderRef}
          {...LineShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/**
 * Floating digital fragments.
 */
function DataPackets({
  isDark,
  isMobile,
}: {
  isDark: boolean;
  isMobile: boolean;
}) {
  const count = isMobile ? 12 : 20; // Fewer packets on mobile
  const color = isDark ? "#ef4444" : "#fb7185"; // Vibrant Rose-Pink for data packets in light mode

  const packets = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const xRange = isMobile ? 4 : 6;
      const xOffset = isMobile ? 0 : 2;
      return {
        position: [
          xOffset + Math.random() * xRange,
          (Math.random() - 0.5) * 15, // Increased vertical range
          -1 + (Math.random() - 0.5) * 4,
        ] as [number, number, number],
        speed: 0.2 + Math.random() * 0.5,
        size: 0.03 + Math.random() * 0.07,
      };
    });
  }, [isMobile, count]);

  return (
    <>
      {packets.map((p, i) => (
        <Float
          key={i}
          speed={p.speed * 4}
          rotationIntensity={1.5}
          floatIntensity={1.5}
          position={p.position}
        >
          <mesh>
            <boxGeometry args={[p.size, p.size, p.size]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/**
 * Main Scene container.
 */
function Scene() {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const scrollY = useRef(0);
  const { viewport } = useThree();

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      }
    };

    const handleScroll = () => {
      scrollY.current =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const updateTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme === "dark");
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
      observer.disconnect();
    };
  }, [isMobile]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      // Gentle parallax scroll effect (less on mobile)
      groupRef.current.position.y = scrollY.current * (isMobile ? 2 : 4);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={60} />
      <ambientLight intensity={0.4} />
      <pointLight
        position={[-5, 5, 5]}
        intensity={1}
        color={isDark ? "#ef4444" : "#e11d48"}
      />

      <group ref={groupRef}>
        <DigitalCore isDark={isDark} mouse={mouse} isMobile={isMobile} />
        <NeuralField isDark={isDark} mouse={mouse} isMobile={isMobile} />
        <DataPackets isDark={isDark} isMobile={isMobile} />
      </group>

      {/* Background stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from(
                  { length: isMobile ? 400 : 600 },
                  () => (Math.random() - 0.5) * 20
                )
              ),
              3,
            ]}
            count={isMobile ? 133 : 200}
          />
        </bufferGeometry>
        <pointsMaterial
          transparent
          color={isDark ? "#991b1b" : "#e11d48"}
          size={0.03}
          sizeAttenuation={true}
          opacity={0.08}
        />
      </points>
    </>
  );
}

export default function HeroBold() {
  return (
    <div className="bg-strawhat-bg fixed inset-0 -z-10 overflow-hidden transition-colors duration-700">
      <Canvas
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>

      {/* Digital Overlay Gradients - Strengthened for legibility across page */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,transparent_0%,var(--color-strawhat-bg)_90%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--color-strawhat-bg)_15%,var(--color-strawhat-bg)_85%,transparent_100%)] opacity-20" />

      {/* Blueprint Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(225,29,72,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(225,29,72,0.05)_1px,transparent_1px)] bg-size-[60px_60px] opacity-[0.03] dark:opacity-[0.05]" />

      {/* Scanline Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_50%)] bg-size-[100%_4px] opacity-[0.01]" />
    </div>
  );
}
