"use client";

import { useFrame, Canvas } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo, memo, useCallback } from "react";
import * as THREE from "three";
import {
  Float,
  PerspectiveCamera,
  MeshDistortMaterial,
} from "@react-three/drei";

// Check if running in browser
const isBrowser = typeof window !== "undefined";
const getIsMobile = () => isBrowser && window.innerWidth < 768;

/**
 * Simple scroll target ref - lerping happens in useFrame for perfect sync.
 * No separate RAF loop = no jank from competing animation frames.
 */
function useScrollTarget() {
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);

  const updateTarget = useCallback((newTarget: number) => {
    targetScrollY.current = newTarget;
  }, []);

  return {
    targetScrollY,
    currentScrollY,
    updateTarget,
  };
}

// Shared lerp function at module level (no recreations)
const lerp = (current: number, target: number, factor: number) => {
  const diff = target - current;
  if (Math.abs(diff) < 0.0001) return target;
  return current + diff * factor;
};

// --- Shader for Glowing Lines (memoized at module level) ---
const LineShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColor: { value: new THREE.Color("#e11d48") },
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
      vec3 finalColor = mix(uColor, vec3(1.0, 0.6, 0.7), vGlow * 0.4);
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `,
};

// --- Shader for Glowing Points (memoized at module level) ---
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
      vec3 finalColor = mix(uColor, vec3(1.0, 0.7, 0.8), vGlow * 0.6);
      gl_FragColor = vec4(finalColor, alpha * (0.6 + vGlow * 0.4));
    }
  `,
};

// Note: We intentionally DON'T skip frames - that causes stutter!
// Instead, we reduce complexity on mobile (fewer particles, slower animations).

// --- Components ---

/**
 * A pulsating digital core that reflects the "energy" of the company.
 * Memoized to prevent unnecessary re-renders.
 */
const DigitalCore = memo(function DigitalCore({
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

  // Memoize colors to prevent recalculation
  const { color, glowColor } = useMemo(
    () => ({
      color: isDark ? "#dc2626" : "#e11d48",
      glowColor: isDark ? "#ef4444" : "#fb7185",
    }),
    [isDark]
  );

  // Memoize position/scale values
  const { baseX, baseScale, coreSize, outerSize, ringSize } = useMemo(
    () => ({
      baseX: isMobile ? 1.5 : 3.5,
      baseScale: isMobile ? 0.6 : 1,
      coreSize: isMobile ? 0.5 : 0.8,
      outerSize: isMobile ? 0.8 : 1.2,
      ringSize: isMobile ? 1.0 : 1.5,
    }),
    [isMobile]
  );

  useFrame((state) => {
    // NO frame skipping - causes stutter! Rotations are cheap.
    const time = state.clock.getElapsedTime();

    // Slower animation speeds on mobile = less visual complexity, same smoothness
    const speedMultiplier = isMobile ? 0.5 : 1;

    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.5 * speedMultiplier;
      coreRef.current.rotation.z = time * 0.3 * speedMultiplier;
      const scale =
        (1 + Math.sin(time * 2 * speedMultiplier) * 0.1) * baseScale;
      coreRef.current.scale.setScalar(scale);

      // Subtle mouse follow (skip on mobile)
      if (!isMobile) {
        coreRef.current.position.x = baseX + mouse.current.x * 0.2;
        coreRef.current.position.y = mouse.current.y * 0.2;
      }
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = -time * 0.2 * speedMultiplier;
      outerRef.current.rotation.x = time * 0.15 * speedMultiplier;
      if (!isMobile) {
        outerRef.current.position.x = baseX + mouse.current.x * 0.15;
        outerRef.current.position.y = mouse.current.y * 0.15;
      }
    }
    if (ringRef.current) {
      ringRef.current.rotation.x =
        Math.PI / 2 + Math.sin(time * 0.5 * speedMultiplier) * 0.2;
      ringRef.current.rotation.y = time * 0.8 * speedMultiplier;
      if (!isMobile) {
        ringRef.current.position.x = baseX + mouse.current.x * 0.1;
        ringRef.current.position.y = mouse.current.y * 0.1;
      }
    }
  });

  // Memoize geometries to prevent recreation
  const coreGeometry = useMemo(
    () => <icosahedronGeometry args={[coreSize, 2]} />,
    [coreSize]
  );
  const outerGeometry = useMemo(
    () => (
      <sphereGeometry
        args={[outerSize, isMobile ? 16 : 32, isMobile ? 16 : 32]}
      />
    ),
    [outerSize, isMobile]
  );
  const ringGeometry = useMemo(
    () => <torusGeometry args={[ringSize, 0.02, 16, isMobile ? 50 : 100]} />,
    [ringSize, isMobile]
  );

  return (
    <group>
      {/* Inner pulsing core */}
      <mesh ref={coreRef} position={[baseX, 0, -1]}>
        {coreGeometry}
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={2}
          wireframe
        />
      </mesh>

      {/* Outer distorted shell */}
      <mesh ref={outerRef} position={[baseX, 0, -1]}>
        {outerGeometry}
        <MeshDistortMaterial
          color={color}
          speed={isMobile ? 1 : 2}
          distort={isMobile ? 0.2 : 0.4}
          radius={1}
          transparent
          opacity={0.2}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Orbital Ring */}
      <mesh ref={ringRef} position={[baseX, 0, -1]}>
        {ringGeometry}
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
});

/**
 * A neural network field of interconnected nodes.
 * Optimized with frame skipping, reduced particle counts, and spatial hashing.
 */
const NeuralField = memo(function NeuralField({
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

  // Memoize color
  const color = useMemo(() => (isDark ? "#dc2626" : "#e11d48"), [isDark]);

  // Significantly reduced particle count on mobile for performance
  const particleCount = isMobile ? 40 : 80;
  const maxLineCount = isMobile ? 200 : 400;

  const { positions, linePositionsBuffer } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const xRange = isMobile ? 4 : 6;
    const xOffset = isMobile ? 0 : 2;

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = xOffset + (Math.random() - 0.2) * xRange;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = -2 + (Math.random() - 0.5) * 4;
    }
    return {
      positions: pos,
      linePositionsBuffer: new Float32Array(maxLineCount * 3 * 2),
    };
  }, [isMobile, particleCount, maxLineCount]);

  // Pre-compute max distance squared to avoid sqrt in loop
  const maxDistanceSq = useMemo(() => {
    const maxDistance = isMobile ? 2.2 : 1.8;
    return maxDistance * maxDistance;
  }, [isMobile]);

  useFrame((state) => {
    if (!nodesRef.current || !linesRef.current) return;

    // NO frame skipping - causes stutter! Instead we use reduced particle counts on mobile.
    const time = state.clock.getElapsedTime();
    const posAttr = nodesRef.current.geometry.attributes.position;
    const linePosAttr = linesRef.current.geometry.attributes.position;
    const positionsArray = posAttr.array as Float32Array;

    // Update uniforms
    if (lineShaderRef.current) {
      lineShaderRef.current.uniforms.uTime.value = time;
      if (!isMobile) {
        lineShaderRef.current.uniforms.uMouse.value.copy(mouse.current);
      }
      lineShaderRef.current.uniforms.uColor.value.set(color);
    }
    if (pointShaderRef.current) {
      pointShaderRef.current.uniforms.uTime.value = time;
      if (!isMobile) {
        pointShaderRef.current.uniforms.uMouse.value.copy(mouse.current);
      }
      pointShaderRef.current.uniforms.uColor.value.set(color);
    }

    // Update node positions - very simple, cheap operations
    // Slower speed on mobile for reduced visual complexity
    const speedMultiplier = isMobile ? 0.15 : 0.3;
    const movementScale = isMobile ? 0.0003 : 0.001;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positionsArray[i3] +=
        Math.sin(time * speedMultiplier + i) * movementScale;
      positionsArray[i3 + 1] +=
        Math.cos(time * speedMultiplier * 0.67 + i) * movementScale;
    }
    posAttr.needsUpdate = true;

    // Update lines (connect nearby nodes) - optimized loop
    let lineIdx = 0;
    const linePositions = linePosAttr.array as Float32Array;
    const maxLines = maxLineCount * 6;

    // Optimized nested loop with early break
    outer: for (let i = 0; i < particleCount; i++) {
      const ix = positionsArray[i * 3];
      const iy = positionsArray[i * 3 + 1];
      const iz = positionsArray[i * 3 + 2];

      for (let j = i + 1; j < particleCount; j++) {
        const dx = ix - positionsArray[j * 3];
        const dy = iy - positionsArray[j * 3 + 1];
        const dz = iz - positionsArray[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistanceSq) {
          if (lineIdx >= maxLines - 6) break outer;

          linePositions[lineIdx++] = ix;
          linePositions[lineIdx++] = iy;
          linePositions[lineIdx++] = iz;
          linePositions[lineIdx++] = positionsArray[j * 3];
          linePositions[lineIdx++] = positionsArray[j * 3 + 1];
          linePositions[lineIdx++] = positionsArray[j * 3 + 2];
        }
      }
    }

    // Reset remaining line positions (only if we have remaining space)
    if (lineIdx < linePositions.length) {
      linePositions.fill(0, lineIdx);
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
            args={[linePositionsBuffer, 3]}
            count={maxLineCount * 2}
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
});

/**
 * Floating digital fragments.
 * Optimized with reduced count on mobile and memoized geometry.
 */
const DataPackets = memo(function DataPackets({
  isDark,
  isMobile,
}: {
  isDark: boolean;
  isMobile: boolean;
}) {
  const count = isMobile ? 8 : 16; // Further reduced for performance
  const color = useMemo(() => (isDark ? "#ef4444" : "#fb7185"), [isDark]);

  const packets = useMemo(() => {
    const xRange = isMobile ? 4 : 6;
    const xOffset = isMobile ? 0 : 2;

    return Array.from({ length: count }, () => ({
      position: [
        xOffset + Math.random() * xRange,
        (Math.random() - 0.5) * 15,
        -1 + (Math.random() - 0.5) * 4,
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.5,
      size: 0.03 + Math.random() * 0.07,
    }));
  }, [isMobile, count]);

  // Memoize the material config
  const materialConfig = useMemo(
    () => ({
      color,
      emissive: color,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.6,
    }),
    [color]
  );

  // Reduced animation intensity on mobile
  const floatConfig = useMemo(
    () => ({
      rotationIntensity: isMobile ? 0.8 : 1.5,
      floatIntensity: isMobile ? 0.8 : 1.5,
    }),
    [isMobile]
  );

  return (
    <>
      {packets.map((p, i) => (
        <Float
          key={i}
          speed={p.speed * (isMobile ? 2 : 4)}
          rotationIntensity={floatConfig.rotationIntensity}
          floatIntensity={floatConfig.floatIntensity}
          position={p.position}
        >
          <mesh>
            <boxGeometry args={[p.size, p.size, p.size]} />
            <meshStandardMaterial {...materialConfig} />
          </mesh>
        </Float>
      ))}
    </>
  );
});

/**
 * Background stars - separated and memoized for performance.
 */
const BackgroundStars = memo(function BackgroundStars({
  isDark,
  isMobile,
}: {
  isDark: boolean;
  isMobile: boolean;
}) {
  const starCount = isMobile ? 80 : 150;

  const positions = useMemo(() => {
    return new Float32Array(
      Array.from({ length: starCount * 3 }, () => (Math.random() - 0.5) * 20)
    );
  }, [starCount]);

  const color = useMemo(() => (isDark ? "#991b1b" : "#e11d48"), [isDark]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={starCount}
        />
      </bufferGeometry>
      <pointsMaterial
        transparent
        color={color}
        size={0.03}
        sizeAttenuation={true}
        opacity={0.08}
      />
    </points>
  );
});

/**
 * Main Scene container.
 * Optimized for butter-smooth scrolling - no frame skipping, lerping in useFrame.
 */
const Scene = memo(function Scene() {
  const [isDark, setIsDark] = useState(false);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const groupRef = useRef<THREE.Group>(null);

  // Use ref for mobile to avoid re-renders
  const isMobileRef = useRef(getIsMobile());
  const [isMobileState, setIsMobileState] = useState(getIsMobile());

  // Scroll target - lerping happens in useFrame for perfect sync with render loop
  const { targetScrollY, currentScrollY, updateTarget } = useScrollTarget();

  // Mouse target for smooth following
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMobileRef.current) return;
    mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  // Scroll handler just updates the target - no heavy work here
  const handleScroll = useCallback(() => {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      updateTarget(window.scrollY / docHeight);
    }
  }, [updateTarget]);

  useEffect(() => {
    // Debounced resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const checkMobile = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newIsMobile = getIsMobile();
        if (newIsMobile !== isMobileRef.current) {
          isMobileRef.current = newIsMobile;
          setIsMobileState(newIsMobile);
        }
      }, 150);
    };

    window.addEventListener("resize", checkMobile, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Theme observer
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
      clearTimeout(resizeTimeout);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
      observer.disconnect();
    };
  }, [handleMouseMove, handleScroll]);

  useFrame(() => {
    // NO frame skipping - that causes stutter! Instead, do minimal work every frame.

    // Smooth scroll lerping - happens every frame for butter-smooth motion
    // Higher factor = more responsive, lower = smoother
    const scrollLerpFactor = isMobileRef.current ? 0.12 : 0.15;
    currentScrollY.current = lerp(
      currentScrollY.current,
      targetScrollY.current,
      scrollLerpFactor
    );

    // Smooth mouse following using lerp (only on desktop)
    if (!isMobileRef.current) {
      mouse.current.x = lerp(mouse.current.x, mouseTarget.current.x, 0.1);
      mouse.current.y = lerp(mouse.current.y, mouseTarget.current.y, 0.1);
    }

    if (groupRef.current) {
      // Use smoothed scroll value for butter-smooth parallax
      const parallaxAmount = isMobileRef.current ? 2 : 4;
      groupRef.current.position.y = currentScrollY.current * parallaxAmount;
    }
  });

  // Memoize light color
  const lightColor = useMemo(() => (isDark ? "#ef4444" : "#e11d48"), [isDark]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={60} />
      <ambientLight intensity={0.4} />
      <pointLight position={[-5, 5, 5]} intensity={1} color={lightColor} />

      <group ref={groupRef}>
        <DigitalCore isDark={isDark} mouse={mouse} isMobile={isMobileState} />
        <NeuralField isDark={isDark} mouse={mouse} isMobile={isMobileState} />
        <DataPackets isDark={isDark} isMobile={isMobileState} />
      </group>

      <BackgroundStars isDark={isDark} isMobile={isMobileState} />
    </>
  );
});

/**
 * Main HeroBold component - optimized Canvas with performance settings.
 */
function HeroBold() {
  const containerRef = useRef<HTMLDivElement>(null);
  const maxHeightRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

  // Memoize initial mobile check for DPR setting
  const isMobile = useMemo(() => getIsMobile(), []);

  // Debounced height update
  const updateHeight = useCallback(() => {
    if (!containerRef.current) return;

    const currentHeight = window.visualViewport?.height || window.innerHeight;
    maxHeightRef.current = Math.max(maxHeightRef.current, currentHeight);
    containerRef.current.style.height = `${maxHeightRef.current}px`;
  }, []);

  useEffect(() => {
    // Delay canvas initialization slightly for better initial load
    const readyTimeout = setTimeout(() => setIsReady(true), 100);

    updateHeight();

    // Throttled resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateHeight, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    // Reset on orientation change
    const handleOrientationChange = () => {
      maxHeightRef.current = 0;
      setTimeout(updateHeight, 100);
    };

    window.addEventListener("orientationchange", handleOrientationChange, {
      passive: true,
    });

    return () => {
      clearTimeout(readyTimeout);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [updateHeight]);

  // Memoize Canvas GL config
  const glConfig = useMemo(
    () => ({
      antialias: !isMobile, // Disable antialiasing on mobile for performance
      powerPreference: "high-performance" as const,
      alpha: true,
      stencil: false, // Disable stencil buffer if not needed
      depth: true,
    }),
    [isMobile]
  );

  // Lower DPR on mobile for better performance
  const dpr = useMemo<[number, number]>(
    () => (isMobile ? [1, 1.5] : [1, 2]),
    [isMobile]
  );

  // Container styles - memoized
  const containerStyle = useMemo(
    () => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      contain: "layout style paint" as const,
    }),
    []
  );

  return (
    <div
      ref={containerRef}
      className="bg-strawhat-bg fixed inset-0 -z-10 overflow-hidden transition-colors duration-700"
      style={containerStyle}
    >
      {/* CSS-only placeholder - shows instantly while 3D loads */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${isReady ? "pointer-events-none opacity-0" : "opacity-100"}`}
        style={{ contain: "strict" }}
      >
        {/* Animated gradient core - mimics the 3D digital core */}
        <div
          className="absolute animate-pulse"
          style={{
            right: isMobile ? "20%" : "15%",
            top: "50%",
            transform: "translateY(-50%)",
            width: isMobile ? "150px" : "250px",
            height: isMobile ? "150px" : "250px",
            background:
              "radial-gradient(circle, rgba(225,29,72,0.3) 0%, rgba(225,29,72,0.1) 40%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(20px)",
          }}
        />

        {/* Secondary glow - offset for depth */}
        <div
          className="absolute animate-pulse"
          style={{
            right: isMobile ? "18%" : "13%",
            top: "48%",
            transform: "translateY(-50%)",
            width: isMobile ? "100px" : "180px",
            height: isMobile ? "100px" : "180px",
            background:
              "radial-gradient(circle, rgba(251,113,133,0.4) 0%, rgba(225,29,72,0.2) 50%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(15px)",
            animationDelay: "150ms",
          }}
        />

        {/* Floating dots placeholder - simulates neural network nodes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isMobile ? 8 : 15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse rounded-full"
              style={{
                right: `${10 + ((i * 5) % 40)}%`,
                top: `${15 + ((i * 13) % 70)}%`,
                width: `${3 + (i % 3) * 2}px`,
                height: `${3 + (i % 3) * 2}px`,
                background: "rgba(225,29,72,0.3)",
                boxShadow: "0 0 8px rgba(225,29,72,0.4)",
                animationDelay: `${i * 100}ms`,
                animationDuration: `${2 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D Canvas - fades in when ready */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${isReady ? "opacity-100" : "opacity-0"}`}
      >
        {isReady && (
          <Canvas gl={glConfig} dpr={dpr} performance={{ min: 0.5 }}>
            <Scene />
          </Canvas>
        )}
      </div>

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

export default memo(HeroBold);
