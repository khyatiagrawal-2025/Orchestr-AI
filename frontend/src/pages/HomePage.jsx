/**
 * OrchestrAI — HomePage.jsx  (Enhanced v2 — navigation wired)
 * Autonomous Multi-Agent Intelligence Platform
 *
 * Changes over v1:
 *  ✦ "Technical Documentation" CTA → navigates to /mission-dossier
 *  ✦ "Watch Demo" CTA → scrolls to #flow section (decision flow demo)
 *  ✦ Nav links (Platform/Agents/Architecture/Deploy) → scroll to real section IDs
 *  ✦ Navbar "Request Access" → /dashboard (already present, kept)
 *  ✦ All other design, theme, 3D scene, animations preserved unchanged
 */

import React, {
  useRef, useState, useEffect, useCallback, useMemo, Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Float } from "@react-three/drei";
import {
  motion, useScroll, useTransform, useMotionValue, useSpring,
  AnimatePresence, animate,
} from "framer-motion";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════
   THEME SYSTEM
═══════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg: "#030208",
    bgGradient: "linear-gradient(160deg, #030208 0%, #0A0618 50%, #030208 100%)",
    surface: "rgba(14,10,26,0.82)",
    surfaceSolid: "#0E0A1A",
    glass: "rgba(255,255,255,0.035)",
    glassDeep: "rgba(255,255,255,0.055)",
    border: "rgba(196,0,43,0.28)",
    borderSubtle: "rgba(240,235,225,0.08)",
    borderGold: "rgba(191,140,44,0.32)",
    text: "#F0EBE1",
    textMuted: "rgba(240,235,225,0.52)",
    textFaint: "rgba(240,235,225,0.15)",
    crimson: "#C4002B",
    crimsonLight: "#E8003A",
    crimsonGlow: "rgba(196,0,43,0.36)",
    crimsonGlowSoft: "rgba(196,0,43,0.14)",
    gold: "#BF8C2C",
    goldGlow: "rgba(191,140,44,0.26)",
    goldLight: "#D4A84E",
    sakura: "#E8A0B0",
    sakuraGlow: "rgba(232,160,176,0.16)",
    plum: "#1A0D2E",
    agentColors: ["#C4002B", "#BF8C2C", "#E8A0B0", "#7C6FE8", "#2EBFB0"],
    gridColor: "rgba(240,235,225,0.028)",
    isDark: true,
  },
  light: {
    bg: "#F0EBE1",
    bgGradient: "linear-gradient(160deg, #F0EBE1 0%, #E4DDD0 50%, #F0EBE1 100%)",
    surface: "rgba(228,220,208,0.88)",
    surfaceSolid: "#E8E1D4",
    glass: "rgba(10,7,22,0.05)",
    glassDeep: "rgba(10,7,22,0.08)",
    border: "rgba(184,0,38,0.22)",
    borderSubtle: "rgba(10,7,22,0.11)",
    borderGold: "rgba(168,120,32,0.34)",
    text: "#0A0716",
    textMuted: "rgba(10,7,22,0.55)",
    textFaint: "rgba(10,7,22,0.2)",
    crimson: "#B8002A",
    crimsonLight: "#D40030",
    crimsonGlow: "rgba(184,0,42,0.2)",
    crimsonGlowSoft: "rgba(184,0,42,0.08)",
    gold: "#A87820",
    goldGlow: "rgba(168,120,32,0.2)",
    goldLight: "#C4921A",
    sakura: "#B85470",
    sakuraGlow: "rgba(184,84,112,0.12)",
    plum: "#EBE4D8",
    agentColors: ["#B8002A", "#A87820", "#B85470", "#4A40B8", "#087870"],
    gridColor: "rgba(10,7,22,0.055)",
    isDark: false,
  },
};

function hex2rgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* Smooth scroll to a section id */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ═══════════════════════════════════════════════════════
   FONT INJECTION
═══════════════════════════════════════════════════════ */
function InjectFonts() {
  useEffect(() => {
    const id = "orch-fonts-v4";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════
   CINEMATIC INTRO GATE
═══════════════════════════════════════════════════════ */
function IntroGate({ onComplete, theme }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2600);
    const t4 = setTimeout(() => onComplete(), 3200);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          key="intro"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: theme.bg,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.6 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              position: "absolute", width: 500, height: 500, borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.crimsonGlow} 0%, ${theme.goldGlow} 30%, transparent 68%)`,
              pointerEvents: "none",
            }}
          />
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: phase >= 1 ? 1 : 0.4, opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", zIndex: 1, marginBottom: 24 }}
          >
            <motion.svg
              width="64" height="64" viewBox="0 0 30 30" fill="none"
              animate={{ rotate: phase >= 2 ? 360 : 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
              <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.85" />
              <circle cx="15" cy="15" r="2.5" fill={theme.text} />
            </motion.svg>
            <motion.div
              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
              transition={{ duration: 1.4, repeat: 2, ease: "easeOut" }}
              style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid ${theme.crimson}`, pointerEvents: "none" }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 16 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", zIndex: 1, textAlign: "center" }}
          >
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 36, fontWeight: 600, color: theme.text, letterSpacing: "0.02em", lineHeight: 1 }}>
              Orchestr<span style={{ color: theme.crimson, fontStyle: "italic" }}>AI</span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 6 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.32em", color: theme.textMuted, textTransform: "uppercase", marginTop: 10 }}
            >
              Autonomous · Multi-Agent · Intelligence
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ delay: 0.3 }}
            style={{ position: "absolute", bottom: 48, width: 160, height: 1, background: theme.textFaint, borderRadius: 1, overflow: "hidden" }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              style={{ height: "100%", background: `linear-gradient(to right, ${theme.crimson}, ${theme.gold})`, transformOrigin: "left", borderRadius: 1 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   AMBIENT CURSOR GLOW
═══════════════════════════════════════════════════════ */
function CursorGlow({ theme }) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 60, damping: 20 });
  const springY = useSpring(y, { stiffness: 60, damping: 20 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); setVisible(true); };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseleave", leave); };
  }, [x, y]);

  return (
    <motion.div
      style={{
        position: "fixed", left: springX, top: springY,
        translateX: "-50%", translateY: "-50%",
        width: 520, height: 520, borderRadius: "50%",
        background: `radial-gradient(circle, ${theme.crimsonGlowSoft} 0%, transparent 60%)`,
        pointerEvents: "none", zIndex: 1,
        opacity: visible ? 1 : 0, transition: "opacity 0.4s ease",
        mixBlendMode: theme.isDark ? "screen" : "multiply",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   ATMOSPHERIC BACKGROUND
═══════════════════════════════════════════════════════ */
function AtmosphericBg({ theme }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: theme.bgGradient }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 100%, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 100%, black 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", right: "-10%", top: "5%",
        width: "60vw", height: "60vw", maxWidth: 800, maxHeight: 800,
        background: `radial-gradient(ellipse at 60% 40%, ${theme.crimsonGlow} 0%, transparent 60%)`,
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute", left: "-5%", top: "55%",
        width: "40vw", height: "40vw", maxWidth: 600, maxHeight: 600,
        background: `radial-gradient(ellipse at 40% 50%, ${theme.goldGlow} 0%, transparent 65%)`,
        filter: "blur(48px)", opacity: 0.6,
      }} />
      <div style={{
        position: "absolute", left: "30%", bottom: "10%",
        width: "35vw", height: "25vw", maxWidth: 500,
        background: `radial-gradient(ellipse at 50% 50%, ${theme.sakuraGlow} 0%, transparent 70%)`,
        filter: "blur(60px)", opacity: 0.5,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: theme.isDark ? 0.024 : 0.016,
        mixBlendMode: "overlay",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MISSION STATUS BAR
═══════════════════════════════════════════════════════ */
function MissionStatusBar({ theme, visible }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const statusItems = [
    { label: "SYS", value: "ONLINE", color: theme.agentColors[2] },
    { label: "AGENTS", value: "5/5", color: theme.gold },
    { label: "UPTIME", value: "99.97%", color: theme.agentColors[4] },
    { label: "OPS", value: "LIVE", color: theme.crimson },
  ];

  return (
    <motion.div
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: visible ? 0 : -28, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 28, zIndex: 300,
        background: theme.isDark ? "rgba(3,2,8,0.95)" : "rgba(10,7,22,0.92)",
        borderBottom: `1px solid ${theme.borderSubtle}`,
        display: "flex", alignItems: "center",
        padding: "0 clamp(20px, 5vw, 80px)", gap: 28,
        backdropFilter: "blur(12px)",
      }}
    >
      {statusItems.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6 + i * 0.2, repeat: Infinity }}
            style={{ width: 4, height: 4, borderRadius: "50%", background: s.color }}
          />
          <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 8, color: "rgba(240,235,225,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.label}</span>
          <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 8, color: s.color, letterSpacing: "0.1em", fontWeight: 600 }}>{s.value}</span>
        </div>
      ))}
      <div style={{ marginLeft: "auto" }}>
        <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 8, color: "rgba(240,235,225,0.25)", letterSpacing: "0.12em" }}>
          {time.toISOString().replace("T", " ").slice(0, 19)} UTC
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   SAKURA PETAL RAIN
═══════════════════════════════════════════════════════ */
function SakuraPetals({ isDark }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W, H, petals, raf;

    const init = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      petals = Array.from({ length: 24 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H - H,
        size: Math.random() * 5.5 + 3.5,
        speed: Math.random() * 0.45 + 0.16,
        drift: Math.random() * 0.5 - 0.25,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.016 + 0.007,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.018 - 0.009,
        opacity: Math.random() * 0.35 + 0.08,
      }));
    };
    init();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const fill = isDark ? `rgba(232,160,176,0.5)` : `rgba(184,84,112,0.25)`;
      for (const p of petals) {
        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobble) * 16, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.6, p.size * 0.8, p.size * 0.6, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.6, -p.size * 0.8, -p.size * 0.6, 0, -p.size);
        ctx.fill();
        ctx.restore();
        p.y += p.speed;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotSpeed;
        if (p.y > H + 30) { p.y = -30; p.x = Math.random() * W; }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, [isDark]);

  return (
    <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
  );
}

/* ═══════════════════════════════════════════════════════
   3D SCENE — unchanged from v1
═══════════════════════════════════════════════════════ */
function AgentNode({ position, color, name, radius, speed, phase, onHover }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.08;
      const pulse = 1 + Math.sin(t * speed * 2 + phase) * 0.05;
      meshRef.current.scale.setScalar(hovered ? 1.3 : pulse);
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = hovered ? 0.35 : 0.1 + Math.sin(t * speed + phase) * 0.06;
    }
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 2.4, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(name); }}
        onPointerOut={() => { setHovered(false); onHover(null); }}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.4 : 0.6} metalness={0.7} roughness={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 0.45, 12, 12]} />
        <meshStandardMaterial color="#F0EBE1" emissive={color} emissiveIntensity={0.8} metalness={1.0} roughness={0.0} />
      </mesh>
    </group>
  );
}

function DataThread({ start, end, color, activity }) {
  const ref = useRef();
  const particleRef = useRef();
  const progress = useRef(Math.random());

  const curve = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3(
      (s.x + e.x) / 2 + (Math.random() - 0.5) * 0.5,
      (s.y + e.y) / 2 + 0.3,
      (s.z + e.z) / 2 + (Math.random() - 0.5) * 0.3
    );
    return new THREE.QuadraticBezierCurve3(s, mid, e);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(48), [curve]);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) ref.current.material.opacity = 0.12 + Math.sin(t * 1.4 + activity) * 0.1;
    if (particleRef.current) {
      progress.current = (progress.current + 0.004) % 1;
      const pt = curve.getPoint(progress.current);
      particleRef.current.position.copy(pt);
      particleRef.current.material.opacity = Math.sin(progress.current * Math.PI) * 0.9;
    }
  });

  return (
    <group>
      <line ref={ref} geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={0.2} linewidth={1} />
      </line>
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function SakuraCrystal() {
  const outerRef = useRef();
  const midRef = useRef();
  const innerRef = useRef();
  const petalRing = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) { outerRef.current.rotation.y = t * 0.08; outerRef.current.rotation.z = Math.sin(t * 0.2) * 0.04; }
    if (midRef.current) { midRef.current.rotation.y = -t * 0.14; midRef.current.rotation.x = t * 0.07; }
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.28; innerRef.current.rotation.z = -t * 0.12;
      innerRef.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);
    }
    if (petalRing.current) petalRing.current.rotation.z = t * 0.06;
  });

  const petalPositions = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      return [Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0];
    }), []
  );

  return (
    <group>
      <group ref={outerRef}>
        <mesh>
          <icosahedronGeometry args={[0.95, 1]} />
          <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={0.2} metalness={0.9} roughness={0.08} transparent opacity={0.08} wireframe />
        </mesh>
      </group>
      <group ref={midRef}>
        <mesh>
          <dodecahedronGeometry args={[0.68, 0]} />
          <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={0.15} metalness={0.85} roughness={0.06} transparent opacity={0.1} wireframe />
        </mesh>
      </group>
      <group ref={petalRing}>
        {petalPositions.map((pos, i) => (
          <mesh key={i} position={pos} rotation={[0, 0, (i / 5) * Math.PI * 2 + Math.PI / 2]}>
            <torusGeometry args={[0.18, 0.025, 8, 32, Math.PI * 1.2]} />
            <meshStandardMaterial color="#E8A0B0" emissive="#E8A0B0" emissiveIntensity={0.8} metalness={0.6} roughness={0.2} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
      <group ref={innerRef}>
        <mesh>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color="#F0EBE1" emissive="#BF8C2C" emissiveIntensity={1.2} metalness={1.0} roughness={0.0} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={1.5} metalness={0.9} roughness={0.02} />
        </mesh>
      </group>
      <PulseShell />
    </group>
  );
}

function PulseShell() {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const beat = Math.max(0, Math.sin(t * 1.6));
    if (ref.current) { ref.current.scale.setScalar(1 + beat * 0.5); ref.current.material.opacity = beat * 0.14; }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#C4002B" transparent opacity={0} side={THREE.BackSide} />
    </mesh>
  );
}

const AGENT_NODES = [
  { name: "Allocation",    color: "#C4002B", angle: -90,  dist: 2.1,  speed: 0.35, phase: 0 },
  { name: "Risk",          color: "#BF8C2C", angle: -18,  dist: 2.0,  speed: 0.28, phase: 1.2 },
  { name: "Operations",   color: "#E8A0B0", angle:  54,  dist: 2.15, speed: 0.32, phase: 2.4 },
  { name: "Intelligence", color: "#7C6FE8", angle: 126,  dist: 2.05, speed: 0.38, phase: 3.6 },
  { name: "Communication",color: "#2EBFB0", angle: 198,  dist: 2.1,  speed: 0.3,  phase: 0.8 },
];

function LatticeScene({ onAgentHover }) {
  const groupRef = useRef();
  useFrame(({ clock }) => { if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.06; });

  const nodePositions = useMemo(() =>
    AGENT_NODES.map(n => {
      const a = (n.angle * Math.PI) / 180;
      return [Math.cos(a) * n.dist, 0, Math.sin(a) * n.dist];
    }), []
  );

  const threads = useMemo(() => {
    const pairs = [];
    const center = [0, 0, 0];
    nodePositions.forEach((pos, i) => {
      pairs.push({ start: center, end: pos, color: AGENT_NODES[i].color, activity: i });
      const next = nodePositions[(i + 1) % nodePositions.length];
      pairs.push({ start: pos, end: next, color: "#F0EBE1", activity: i + 10 });
    });
    return pairs;
  }, [nodePositions]);

  return (
    <group ref={groupRef}>
      <SakuraCrystal />
      {AGENT_NODES.map((agent, i) => (
        <AgentNode key={agent.name} position={nodePositions[i]} color={agent.color} name={agent.name} radius={0.16} speed={agent.speed} phase={agent.phase} onHover={onAgentHover} />
      ))}
      {threads.map((t, i) => <DataThread key={i} {...t} />)}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.006, 8, 120]} />
        <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={0.5} transparent opacity={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2 + 0.3, 0.2, 0]}>
        <torusGeometry args={[2.4, 0.004, 8, 120]} />
        <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={0.4} transparent opacity={0.15} />
      </mesh>
      <Sparkles count={100} scale={5.5} size={0.45} speed={0.18} color="#BF8C2C" opacity={0.45} />
      <Sparkles count={60} scale={3.8} size={0.3} speed={0.28} color="#E8A0B0" opacity={0.35} />
      <Sparkles count={30} scale={2.0} size={0.2} speed={0.4} color="#C4002B" opacity={0.3} />
      <pointLight position={[5, 3, 4]} color="#C4002B" intensity={4} distance={12} decay={2} />
      <pointLight position={[-5, -2, -4]} color="#BF8C2C" intensity={3} distance={12} decay={2} />
      <pointLight position={[0, 5, -5]} color="#E8A0B0" intensity={2.5} distance={12} decay={2} />
      <pointLight position={[0, -4, 3]} color="#7C6FE8" intensity={1.8} distance={10} decay={2} />
      <ambientLight intensity={0.2} color="#1a0a2e" />
    </group>
  );
}

function Scene3D({ onAgentHover }) {
  return (
    <Canvas camera={{ position: [0, 1.2, 7.5], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }} dpr={[1, 1.6]}>
      <Suspense fallback={null}>
        <Float speed={1.0} rotationIntensity={0.18} floatIntensity={0.28}>
          <LatticeScene onAgentHover={onAgentHover} />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} maxPolarAngle={Math.PI * 0.68} minPolarAngle={Math.PI * 0.32} />
      </Suspense>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════
   AGENT TOOLTIP
═══════════════════════════════════════════════════════ */
const AGENT_INFO = {
  Allocation:    { icon: "◈", color: "#C4002B", role: "Resource Allocation",       desc: "Continuously maps every examination center, proctor, and logistical resource against live demand — then rebalances in real time when disruptions hit.", stat: "94% utilization" },
  Risk:          { icon: "⬡", color: "#BF8C2C", role: "Risk & Threat Intelligence", desc: "Monitors 340+ risk signals across infrastructure, weather, and historical patterns. Predicts disruptions before they escalate and pre-arms response protocols.", stat: "340 signals tracked" },
  Operations:   { icon: "⟁", color: "#E8A0B0", role: "Operations Orchestration",   desc: "The coordination spine. Routes tasks, resolves resource conflicts, sequences execution chains, and ensures every dependent action completes in the right order.", stat: "14ms coordination latency" },
  Intelligence: { icon: "◬", color: "#7C6FE8", role: "Decision Intelligence",       desc: "Synthesizes multi-agent observations into actionable recommendations. Surfaces anomalies, generates post-operation analysis, and improves strategy over each cycle.", stat: "99.2% decision accuracy" },
  Communication:{ icon: "◫", color: "#2EBFB0", role: "Stakeholder Communication",  desc: "Automatically broadcasts alerts to 50K+ stakeholders across SMS, email, and push channels — tiered by urgency, role, and real-time system status.", stat: "50K+ stakeholders reached" },
};

function AgentTooltip({ name, theme }) {
  const info = AGENT_INFO[name];
  if (!info) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={name}
        initial={{ opacity: 0, y: 14, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{
          position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
          width: "min(360px, 90vw)",
          background: theme.surface,
          backdropFilter: "blur(32px) saturate(1.8)", WebkitBackdropFilter: "blur(32px) saturate(1.8)",
          border: `1px solid ${info.color}55`, borderRadius: 10, padding: "20px 22px",
          zIndex: 40, pointerEvents: "none",
          boxShadow: `0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px ${info.color}22`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22, color: info.color, lineHeight: 1 }}>{info.icon}</span>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: info.color, letterSpacing: "0.01em" }}>{name} Agent</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{info.role}</div>
          </div>
          <div style={{ marginLeft: "auto", fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: info.color, letterSpacing: "0.08em", textTransform: "uppercase", background: `${info.color}18`, padding: "3px 8px", borderRadius: 4 }}>{info.stat}</div>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{info.desc}</p>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   TELEMETRY STRIP
═══════════════════════════════════════════════════════ */
function TelemetryStrip({ theme }) {
  const [ops, setOps] = useState(247318);
  const [latency, setLatency] = useState(14);

  useEffect(() => {
    const iv = setInterval(() => {
      setOps(v => Math.max(220000, v + Math.floor(Math.random() * 600 - 200)));
      setLatency(v => Math.max(10, Math.min(18, v + Math.floor(Math.random() * 3 - 1))));
    }, 1600);
    return () => clearInterval(iv);
  }, []);

  const metrics = [
    { label: "Ops / second",  value: ops.toLocaleString(), color: theme.crimson },
    { label: "Active agents", value: "5 / 5",              color: theme.gold },
    { label: "Agent latency", value: `${latency}ms`,       color: theme.sakura },
    { label: "System uptime", value: "99.97%",             color: theme.agentColors[3] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      style={{
        display: "flex", gap: "clamp(20px, 4vw, 44px)", flexWrap: "wrap",
        paddingTop: 24, borderTop: `1px solid ${theme.textFaint}`, marginTop: 44,
      }}
    >
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 + i * 0.08 }}
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8 + i * 0.3, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: m.color, flexShrink: 0 }}
            />
            <span style={{
              fontFamily: "'Space Grotesk', monospace",
              fontSize: "clamp(18px, 2vw, 26px)", fontWeight: 600, color: theme.text, lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}>{m.value}</span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>{m.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVBAR — nav links wired to section scroll + mission dossier
═══════════════════════════════════════════════════════ */
function Navbar({ isDark, toggleTheme, theme, showStatusBar, navigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Map nav label → section id (matches section id attributes below)
  const navItems = [
    { label: "Platform",     id: "platform" },
    { label: "Agents",       id: "hero" },       // 3D lattice is in hero
    { label: "Architecture", id: "architecture" },
    { label: "Deploy",       id: "deploy" },
  ];

  const topOffset = showStatusBar ? 28 : 0;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: topOffset, left: 0, right: 0, zIndex: 200,
        height: 62, display: "flex", alignItems: "center",
        padding: "0 clamp(20px, 5vw, 80px)", justifyContent: "space-between",
        background: scrolled
          ? (isDark ? "rgba(3,2,8,0.9)" : "rgba(240,235,225,0.9)")
          : "transparent",
        backdropFilter: scrolled ? "blur(28px) saturate(1.8)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(28px) saturate(1.8)" : "none",
        borderBottom: scrolled ? `1px solid ${theme.borderSubtle}` : "none",
        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollToSection("hero")}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.85" />
          <circle cx="15" cy="15" r="2.5" fill="#F0EBE1" />
        </svg>
        <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 19, fontWeight: 600, color: theme.text, letterSpacing: "0.01em" }}>
          Orchestr<span style={{ color: theme.crimson, fontStyle: "italic" }}>AI</span>
        </span>
      </div>

      {/* Links — scroll to sections */}
      <div className="orch-nav-links" style={{ display: "flex", gap: 40, alignItems: "center" }}>
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => { scrollToSection(item.id); setActiveLink(item.label); }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
              letterSpacing: "0.08em", color: activeLink === item.label ? theme.text : theme.textMuted,
              textTransform: "uppercase", fontWeight: 500,
              background: "transparent", border: "none", cursor: "pointer",
              padding: 0, transition: "color 0.2s",
              borderBottom: activeLink === item.label ? `1px solid ${theme.crimson}` : "1px solid transparent",
              paddingBottom: 2,
            }}
            onMouseEnter={e => e.currentTarget.style.color = theme.text}
            onMouseLeave={e => e.currentTarget.style.color = activeLink === item.label ? theme.text : theme.textMuted}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{ width: 40, height: 22, borderRadius: 11, background: isDark ? theme.crimson : theme.textFaint, border: "none", cursor: "pointer", position: "relative", transition: "background 0.35s", outline: "none" }}
        >
          <motion.div
            animate={{ x: isDark ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            style={{ width: 18, height: 18, borderRadius: "50%", background: isDark ? "#F0EBE1" : "#0A0716", position: "absolute", top: 2 }}
          />
        </button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "9px 22px",
            background: theme.crimson, border: "none", borderRadius: 6,
            color: "#F0EBE1",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
            fontWeight: 600, cursor: "pointer",
          }}
        >
          Enter Platform
        </motion.button>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════ */
function HeroSection({ theme, isDark, navigate, topOffset }) {
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 16 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 16 });
  const rotateY = useTransform(smoothX, [-600, 600], [-6, 6]);
  const rotateX = useTransform(smoothY, [-400, 400], [4, -4]);

  const handleMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left - r.width / 2);
    mouseY.set(e.clientY - r.top - r.height / 2);
  }, [mouseX, mouseY]);

  const navHeight = topOffset + 62;

  return (
    <section
      id="hero"
      onMouseMove={handleMove}
      style={{
        minHeight: "100vh",
        display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center",
        padding: `${navHeight + 20}px clamp(24px, 5.5vw, 88px) clamp(60px, 8vw, 100px)`,
        gap: "clamp(32px, 4vw, 80px)",
        position: "relative", overflow: "hidden",
      }}
      className="orch-hero-grid"
    >
      {/* LEFT: Headline block */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}
        >
          <div style={{ width: 22, height: 1.5, background: theme.crimson }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: "0.28em", color: theme.crimson, textTransform: "uppercase", fontWeight: 500 }}>
            Autonomous · Multi-Agent · Intelligence
          </span>
        </motion.div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ overflow: "hidden", marginBottom: 4 }}>
            <motion.h1
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.95, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(50px, 6.2vw, 90px)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.0, color: theme.textMuted, letterSpacing: "0.02em", margin: 0 }}
            >
              Five agents.
            </motion.h1>
          </div>
          <div style={{ overflow: "hidden", marginBottom: 4 }}>
            <motion.h1
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.95, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(50px, 6.2vw, 90px)", fontWeight: 500, lineHeight: 1.0, color: theme.text, margin: 0 }}
            >
              One command.
            </motion.h1>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.95, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(50px, 6.2vw, 90px)",
                fontWeight: 700, fontStyle: "italic", lineHeight: 1.0,
                backgroundImage: `linear-gradient(128deg, ${theme.crimson} 0%, ${theme.gold} 55%, ${theme.sakura} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", color: "transparent", margin: 0,
              }}
            >
              Total clarity.
            </motion.h1>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.64, duration: 0.7 }}
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(14px, 1.5vw, 16px)", fontWeight: 300, lineHeight: 1.82, color: theme.textMuted, margin: "0 0 44px 0", maxWidth: 440 }}
        >
          OrchestrAI deploys a coordinated mesh of specialized AI agents across
          critical operations — perceiving, deciding, and acting in real time
          at national scale, with no human bottleneck.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.6 }}
          style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}
        >
          {/* Primary CTA → /dashboard */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 12px 52px ${theme.crimsonGlow}, 0 2px 0 0 ${theme.crimsonLight}` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "15px 40px", background: theme.crimson, border: "none", borderRadius: 7,
              color: "#F0EBE1", fontFamily: "'Cormorant Garant', serif",
              fontSize: 18, fontWeight: 600, fontStyle: "italic", letterSpacing: "0.02em",
              cursor: "pointer", transition: "box-shadow 0.3s",
              position: "relative", overflow: "hidden",
            }}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)", pointerEvents: "none" }}
            />
            Enter Mission Control
          </motion.button>

          {/* Secondary CTA → scroll to decision flow demo */}
          <motion.button
            whileHover={{ scale: 1.02, borderColor: theme.gold, color: theme.gold }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToSection("flow")}
            style={{
              padding: "15px 28px", background: "transparent",
              border: `1px solid ${theme.borderSubtle}`, borderRadius: 7, color: theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
              fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.22s ease",
            }}
          >
            <span style={{ fontSize: 10 }}>▶</span> See It In Action
          </motion.button>
        </motion.div>

        <TelemetryStrip theme={theme} />
      </div>

      {/* RIGHT: 3D canvas */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          style={{
            width: "100%", aspectRatio: "1/1", maxWidth: 600,
            rotateX, rotateY, transformStyle: "preserve-3d", position: "relative",
          }}
          className="orch-canvas-3d"
        >
          <div style={{
            position: "absolute", inset: -16, borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.crimsonGlowSoft} 0%, transparent 70%)`,
            filter: "blur(24px)", pointerEvents: "none",
          }} />
          <Scene3D onAgentHover={setHoveredAgent} />
          <AnimatePresence>
            {!hoveredAgent && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 2.5 }}
                style={{
                  position: "absolute", bottom: 50, left: "50%", transform: "translateX(-50%)",
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint,
                  letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "center",
                  whiteSpace: "nowrap", pointerEvents: "none",
                }}
              >
                Hover agents to explore
              </motion.div>
            )}
          </AnimatePresence>
          {hoveredAgent && <AgentTooltip name={hoveredAgent} theme={theme} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}
        >
          {AGENT_NODES.map(a => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted, letterSpacing: "0.06em" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: a.color }} />
              {a.name}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.0 }}
        style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, zIndex: 10 }}
      >
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.28em" }}>SCROLL</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${theme.crimson}, transparent)` }}
        />
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION DIVIDER
═══════════════════════════════════════════════════════ */
function SectionDivider({ theme, accent = "crimson" }) {
  const color = theme[accent] || theme.crimson;
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "0 clamp(24px, 5.5vw, 88px)", gap: 16, opacity: 0.4 }}>
      <div style={{ flex: 1, height: 1, background: theme.borderSubtle }} />
      <div style={{ width: 6, height: 6, borderRadius: "50%", border: `1px solid ${color}`, opacity: 0.6 }} />
      <div style={{ flex: 1, height: 1, background: theme.borderSubtle }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DECISION FLOW SECTION
═══════════════════════════════════════════════════════ */
const FLOW_STEPS = [
  { agent: "Risk",          color: "#BF8C2C", icon: "⬡", event: "Disruption Detected",    detail: "3 exam centers flagged · severe weather incoming · 2.4hr window",                      time: "T+0ms" },
  { agent: "Intelligence", color: "#7C6FE8", icon: "◬", event: "Impact Assessed",          detail: "12,400 candidates affected · 6 viable alternate centers identified",                  time: "T+240ms" },
  { agent: "Allocation",   color: "#C4002B", icon: "◈", event: "Resources Reallocated",    detail: "Optimal center mapping computed · transport routes reserved",                         time: "T+890ms" },
  { agent: "Operations",  color: "#E8A0B0", icon: "⟁", event: "Execution Sequenced",      detail: "48 dependent tasks queued · staff reassigned · logistics confirmed",                  time: "T+1.2s" },
  { agent: "Communication",color:"#2EBFB0", icon: "◫", event: "All Parties Notified",      detail: "12,400 SMS dispatched · 94 coordinators briefed · media advisory issued",            time: "T+1.8s" },
];

function DecisionFlow({ theme }) {
  const [active, setActive] = useState(-1);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });

  useEffect(() => {
    return scrollYProgress.on("change", v => {
      setActive(Math.floor(v * (FLOW_STEPS.length + 1)) - 1);
    });
  }, [scrollYProgress]);

  return (
    <section ref={ref} id="flow" style={{ padding: "clamp(80px, 10vw, 130px) clamp(24px, 5.5vw, 88px)", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 72, maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 32, height: 1.5, background: theme.gold }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: "0.24em", color: theme.gold, textTransform: "uppercase", fontWeight: 500 }}>Autonomous Decision Flow</span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 18px" }}>
          Crisis resolved in<br /><em style={{ color: theme.crimson }}>under two seconds.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px, 1.4vw, 15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.72, margin: 0 }}>
          When disruption strikes, OrchestrAI's agents don't wait for instructions.
          They detect, decide, execute, and communicate — autonomously, in sequence,
          faster than any human chain of command.
        </p>
      </motion.div>

      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 28, left: 0, right: 0, height: 1, background: theme.textFaint, zIndex: 0 }} className="orch-flow-line" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, position: "relative", zIndex: 1 }} className="orch-flow-grid">
          {FLOW_STEPS.map((step, i) => (
            <motion.div
              key={step.event}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
            >
              <motion.div
                animate={{
                  scale: active >= i ? [1, 1.2, 1] : 1,
                  boxShadow: active >= i ? `0 0 0 1px ${step.color}44, 0 0 28px ${step.color}44` : "none",
                }}
                transition={{ duration: 0.4 }}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: `1.5px solid ${active >= i ? step.color : theme.borderSubtle}`,
                  background: active >= i ? `rgba(${hex2rgb(step.color)},0.12)` : theme.glass,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, color: active >= i ? step.color : theme.textFaint,
                  transition: "all 0.4s ease", backdropFilter: "blur(10px)", flexShrink: 0,
                }}
              >{step.icon}</motion.div>

              <div style={{ textAlign: "center", width: "100%" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.12em", color: active >= i ? step.color : theme.textFaint, textTransform: "uppercase", fontWeight: 600, marginBottom: 5, transition: "color 0.4s" }}>
                  {step.time} · {step.agent}
                </div>
                <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 17, fontWeight: 500, color: active >= i ? theme.text : theme.textMuted, marginBottom: 6, lineHeight: 1.2, transition: "color 0.4s" }}>{step.event}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.55, opacity: active >= i ? 1 : 0.4, transition: "opacity 0.4s" }}>{step.detail}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.6 }}
          style={{
            marginTop: 56, padding: "24px 32px",
            border: `1px solid ${theme.borderGold}`, borderRadius: 10,
            background: `rgba(${hex2rgb(theme.gold)},0.04)`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 28, fontWeight: 600, color: theme.gold, marginBottom: 4 }}>1.8 seconds</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Full autonomous resolution · 12,400 candidates protected</div>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "right" }}>
            Traditional manual response: 4–6 hours<br />
            <span style={{ color: theme.crimson, letterSpacing: "0.05em" }}>OrchestrAI advantage: 10,000×</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ARCHITECTURE SECTION
═══════════════════════════════════════════════════════ */
const LAYERS = [
  { num: "I",   title: "Perception Layer",  subtitle: "Sense",   desc: "Continuously ingests sensor feeds, IoT telemetry, third-party APIs, and event streams from physical and digital infrastructure. Zero latency blind spots.", color: "#C4002B", stat: "340+ signal sources" },
  { num: "II",  title: "Reasoning Core",    subtitle: "Think",   desc: "Multi-model ensemble that evaluates incoming data against objectives, plans response sequences, and routes decision tasks to the appropriate specialized agents.", color: "#BF8C2C", stat: "12ms decision latency" },
  { num: "III", title: "Agent Mesh",        subtitle: "Act",     desc: "Five specialized agents operating in concert, each owning its domain, communicating via structured typed messages, and escalating conflicts upward automatically.", color: "#E8A0B0", stat: "5 concurrent agents" },
  { num: "IV",  title: "Execution Fabric",  subtitle: "Deliver", desc: "Translates agent decisions into real-world outcomes through direct API integrations, automated messaging systems, and human escalation workflows when required.", color: "#7C6FE8", stat: "99.97% execution SLA" },
];

function ArchSection({ theme }) {
  const [activeLayer, setActiveLayer] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setActiveLayer(l => (l + 1) % LAYERS.length), 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <section id="architecture" style={{ padding: "clamp(80px, 10vw, 130px) clamp(24px, 5.5vw, 88px)", position: "relative", zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(48px, 7vw, 100px)", alignItems: "start" }} className="orch-arch-grid">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 32, height: 1.5, background: theme.sakura }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: "0.24em", color: theme.sakura, textTransform: "uppercase", fontWeight: 500 }}>Intelligence Stack</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(30px, 3.8vw, 50px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 20px" }}>
              Four layers.<br /><em style={{ color: theme.gold }}>One coherent mind.</em>
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.75, marginBottom: 44 }}>
              Every component is independently scalable, fully auditable, and
              swappable without disrupting the other layers — built for the
              resilience that national-scale operations demand.
            </p>
          </motion.div>

          {LAYERS.map((l, i) => (
            <motion.div
              key={l.num}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              onClick={() => setActiveLayer(i)}
              style={{
                display: "flex", gap: 20,
                padding: "18px 16px 18px 20px",
                borderLeft: `2.5px solid ${activeLayer === i ? l.color : theme.textFaint}`,
                cursor: "pointer",
                background: activeLayer === i ? `rgba(${hex2rgb(l.color)},0.05)` : "transparent",
                transition: "all 0.3s ease", borderRadius: "0 6px 6px 0",
              }}
            >
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: l.color, minWidth: 32, flexShrink: 0, lineHeight: 1, paddingTop: 2, opacity: activeLayer === i ? 1 : 0.4, transition: "opacity 0.3s" }}>{l.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
                  <h4 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 21, fontWeight: 500, color: theme.text, margin: 0 }}>{l.title}</h4>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: l.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, opacity: activeLayer === i ? 1 : 0, transition: "opacity 0.3s" }}>{l.stat}</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.textMuted, fontWeight: 300, lineHeight: 1.65, margin: 0, maxHeight: activeLayer === i ? 100 : 0, overflow: "hidden", opacity: activeLayer === i ? 1 : 0, transition: "all 0.35s ease" }}>{l.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sticky schematic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.75 }}
          style={{
            border: `1px solid ${theme.borderSubtle}`, borderRadius: 14,
            padding: "32px 28px", background: theme.surface, backdropFilter: "blur(28px)",
            boxShadow: `0 32px 80px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)`,
            position: "sticky", top: 104,
          }}
        >
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.2em", textTransform: "uppercase" }}>SYS.ARCH · LIVE</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.crimson, letterSpacing: "0.1em" }}>ONLINE</span>
            </div>
          </div>

          {LAYERS.map((l, i) => (
            <React.Fragment key={l.num}>
              <motion.div
                animate={{ borderLeftColor: activeLayer === i ? l.color : theme.textFaint, background: activeLayer === i ? `rgba(${hex2rgb(l.color)},0.06)` : "transparent" }}
                style={{ padding: "14px 16px", border: `1px solid ${theme.borderSubtle}`, borderLeft: `2.5px solid ${theme.textFaint}`, borderRadius: "0 6px 6px 0", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.35s ease" }}
              >
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: activeLayer === i ? l.color : theme.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3, fontWeight: 600, transition: "color 0.3s" }}>Layer {l.num} · {l.subtitle}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: theme.text, letterSpacing: "0.04em" }}>{l.title}</div>
                </div>
                <motion.div
                  animate={{ opacity: activeLayer === i ? [0.6, 1, 0.6] : 0.3 }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: l.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}
                >{activeLayer === i ? "ACTIVE ●" : "STANDBY"}</motion.div>
              </motion.div>
              {i < LAYERS.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
                  <motion.div
                    animate={{ opacity: activeLayer >= i ? [0.3, 1, 0.3] : 0.1 }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                    style={{ width: 1, height: 14, background: theme.crimson }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}

          <div style={{ marginTop: 22, padding: "16px 18px", background: theme.glass, borderRadius: 8, border: `1px solid ${theme.borderSubtle}` }}>
            {[
              { label: "Data throughput",    value: "247K ops/s", color: theme.crimson },
              { label: "Decision accuracy",  value: "99.2%",      color: theme.gold },
              { label: "Agent sync latency", value: "14ms",       color: theme.sakura },
            ].map(m => (
              <div key={m.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted, letterSpacing: "0.06em" }}>{m.label}</span>
                <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: m.color, fontWeight: 600, letterSpacing: "0.06em" }}>{m.value}</motion.span>
              </div>
            ))}
            <div style={{ height: 2, background: theme.textFaint, borderRadius: 1, marginTop: 14, overflow: "hidden" }}>
              <motion.div animate={{ width: ["18%", "82%", "44%", "91%", "33%"] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} style={{ height: "100%", background: theme.crimson, borderRadius: 1 }} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   DEPLOYMENT DOMAINS
═══════════════════════════════════════════════════════ */
const DOMAINS = [
  { icon: "⬡", tag: "Examination Ops",    title: "Examination Operations", desc: "End-to-end orchestration of large-scale examinations — center allocation, proctor coordination, logistics, and real-time disruption response for millions of candidates.", scale: "2M+ candidates" },
  { icon: "◈", tag: "Urban Intelligence", title: "Smart Cities",            desc: "Real-time coordination across traffic, utilities, emergency services, and public infrastructure. Autonomous response to urban events before they escalate.", scale: "10M+ data points/hr" },
  { icon: "⟁", tag: "Crisis Ops",         title: "Emergency Response",      desc: "Multi-agency incident command that routes resources, predicts escalation, and coordinates field teams without human bottlenecks — when seconds matter.", scale: "Sub-second response" },
  { icon: "◫", tag: "Supply Chain",       title: "Logistics Networks",      desc: "End-to-end supply chain orchestration: predictive rerouting, dynamic inventory allocation, and disruption recovery across distributed nodes globally.", scale: "Global scale" },
  { icon: "◬", tag: "Gov-Tech",           title: "National Infrastructure", desc: "Sovereign-scale decision support for power grids, water systems, and transit networks. Predictive maintenance and autonomous scheduling before failure.", scale: "National scale" },
];

function DomainCard({ d, theme, i }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.09 }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      style={{
        padding: "30px 26px",
        border: `1px solid ${hov ? theme.border : theme.borderSubtle}`,
        borderRadius: 12,
        background: hov ? (theme.isDark ? `rgba(${hex2rgb(theme.crimson)},0.06)` : `rgba(${hex2rgb(theme.crimson)},0.03)`) : theme.glass,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        cursor: "default", position: "relative", overflow: "hidden",
        transition: "border-color 0.3s, background 0.3s",
        boxShadow: hov ? `0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px ${theme.crimson}22` : `0 2px 12px rgba(0,0,0,0.08)`,
        transform: hov ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <AnimatePresence>
        {hov && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0, scaleX: 0 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent 0%, ${theme.crimson} 50%, transparent 100%)`, transformOrigin: "left" }}
          />
        )}
      </AnimatePresence>
      {hov && (
        <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${theme.crimsonGlowSoft} 0%, transparent 70%)`, pointerEvents: "none" }} />
      )}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 24, color: hov ? theme.crimson : theme.textMuted, fontFamily: "monospace", transition: "color 0.3s" }}>{d.icon}</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, background: `rgba(${hex2rgb(theme.gold)},0.1)`, padding: "3px 8px", borderRadius: 4 }}>{d.scale}</span>
      </div>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.18em", textTransform: "uppercase", display: "block", marginBottom: 10, fontWeight: 500 }}>{d.tag}</span>
      <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 500, color: theme.text, margin: "0 0 10px", lineHeight: 1.1 }}>{d.title}</h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 300, lineHeight: 1.7, color: theme.textMuted, margin: 0 }}>{d.desc}</p>
    </motion.div>
  );
}

function DomainsSection({ theme }) {
  return (
    <section id="platform" style={{ padding: "clamp(80px, 10vw, 130px) clamp(24px, 5.5vw, 88px)", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 32, height: 1.5, background: theme.crimson }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: "0.24em", color: theme.crimson, textTransform: "uppercase", fontWeight: 500 }}>Deployment Domains</span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 16px" }}>
          Anywhere autonomous decisions<br /><em style={{ color: theme.crimson }}>need to be made at scale.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px, 1.4vw, 15.5px)", color: theme.textMuted, fontWeight: 300, maxWidth: 540, lineHeight: 1.75, margin: 0 }}>
          OrchestrAI is not an application. It is infrastructure —
          a coordination layer that adapts to any operational domain
          where complexity exceeds human coordination capacity.
        </p>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(230px,100%),1fr))", gap: 14 }}>
        {DOMAINS.map((d, i) => <DomainCard key={d.title} d={d} theme={theme} i={i} />)}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CTA SECTION — "Technical Documentation" → /mission-dossier
═══════════════════════════════════════════════════════ */
function CTASection({ theme, navigate }) {
  return (
    <section id="deploy" style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 5.5vw, 88px)", textAlign: "center", position: "relative", zIndex: 10 }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: `radial-gradient(ellipse at center, ${theme.crimsonGlow} 0%, ${theme.goldGlow} 30%, transparent 68%)`, pointerEvents: "none", zIndex: -1, filter: "blur(20px)" }} />

      <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <motion.div animate={{ scaleX: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: 52, height: 1, background: `linear-gradient(to right, transparent, ${theme.crimson})` }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: "0.26em", color: theme.crimson, textTransform: "uppercase", fontWeight: 500 }}>Mission Briefing</span>
          <motion.div animate={{ scaleX: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} style={{ width: 52, height: 1, background: `linear-gradient(to left, transparent, ${theme.crimson})` }} />
        </div>

        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(38px, 5.5vw, 72px)", fontWeight: 500, lineHeight: 1.06, color: theme.text, margin: "0 0 24px" }}>
          The world is waiting<br /><em style={{ color: theme.gold }}>for its intelligence layer.</em>
        </h2>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px, 1.5vw, 16px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.82, maxWidth: 520, margin: "0 auto 52px" }}>
          OrchestrAI is not a product launch. It is a new category of infrastructure —
          autonomous operational intelligence, built to govern the systems that govern us.
          We are deploying the first instance for national examination operations.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {/* Primary: enter platform */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 20px 72px ${theme.crimsonGlow}, 0 4px 0 0 ${theme.crimsonLight}88` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "16px 52px", background: theme.crimson, border: "none", borderRadius: 8,
              color: "#F0EBE1", fontFamily: "'Cormorant Garant', serif",
              fontSize: 19, fontWeight: 600, fontStyle: "italic", letterSpacing: "0.02em",
              cursor: "pointer", transition: "box-shadow 0.35s", position: "relative", overflow: "hidden",
            }}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)", pointerEvents: "none" }}
            />
            Enter Mission Control
          </motion.button>

          {/* Secondary: Mission Dossier → /mission-dossier */}
          <motion.button
            whileHover={{ scale: 1.03, borderColor: theme.gold, color: theme.gold }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/mission-dossier")}
            style={{
              padding: "16px 40px", background: "transparent",
              border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, color: theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
              fontWeight: 600, cursor: "pointer", transition: "all 0.24s",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <span style={{ fontSize: 14, opacity: 0.7 }}>◈</span>
            Mission Dossier
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.4 }}
          style={{ marginTop: 64, display: "flex", justifyContent: "center", gap: "clamp(24px, 5vw, 64px)", flexWrap: "wrap" }}
        >
          {[
            { v: "247K", l: "Peak ops/second" },
            { v: "99.97%", l: "Uptime SLA" },
            { v: "5", l: "Specialized agents" },
            { v: "1.8s", l: "Crisis resolution" },
          ].map(m => (
            <div key={m.l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, color: theme.text, lineHeight: 1, marginBottom: 6 }}>{m.v}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>{m.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════ */
function Footer({ theme, navigate }) {
  return (
    <footer style={{
      padding: "28px clamp(24px, 5.5vw, 88px)",
      borderTop: `1px solid ${theme.borderSubtle}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: 16, position: "relative", zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="18" height="18" viewBox="0 0 30 30" fill="none">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.8" />
        </svg>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: theme.textMuted, letterSpacing: "0.06em" }}>OrchestrAI © 2025</span>
      </div>

      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.18em", textTransform: "uppercase" }}>Autonomous Multi-Agent Intelligence Platform</span>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Mission Dossier link in footer */}
        <button
          onClick={() => navigate("/mission-dossier")}
          style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint,
            letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase",
            fontWeight: 500, background: "none", border: "none", cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.target.style.color = theme.gold}
          onMouseLeave={e => e.target.style.color = theme.textFaint}
        >
          Mission Dossier
        </button>
        {["Privacy", "Security", "Terms"].map(l => (
          <a key={l} href="#"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint, letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase", fontWeight: 500, transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = theme.textMuted}
            onMouseLeave={e => e.target.style.color = theme.textFaint}
          >{l}</a>
        ))}
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("orchestrai-theme") !== "light"; } catch { return true; }
  });
  const [introComplete, setIntroComplete] = useState(false);
  const theme = isDark ? THEMES.dark : THEMES.light;
  const navigate = useNavigate();

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("orchestrai-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const STATUS_BAR_H = 28;

  return (
    <>
      <InjectFonts />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: ${theme.bg};
          color: ${theme.text};
          overflow-x: hidden;
          transition: background 0.55s ease, color 0.55s ease;
        }
        ::selection { background: ${theme.crimson}50; color: ${theme.text}; }
        a { color: inherit; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.crimson}55; border-radius: 2px; }

        @media (max-width: 860px) {
          .orch-nav-links { display: none !important; }
          .orch-hero-grid { grid-template-columns: 1fr !important; padding-top: 104px !important; gap: 40px !important; }
          .orch-canvas-3d { max-width: 340px !important; margin: 0 auto; }
        }
        @media (max-width: 1100px) {
          .orch-flow-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
          .orch-flow-line { display: none !important; }
        }
        @media (max-width: 600px) {
          .orch-flow-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .orch-arch-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <IntroGate onComplete={handleIntroComplete} theme={theme} />
      <AtmosphericBg theme={theme} />
      <SakuraPetals isDark={isDark} />
      <CursorGlow theme={theme} />
      <MissionStatusBar theme={theme} visible={introComplete} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: "relative", zIndex: 2 }}
      >
        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
          theme={theme}
          showStatusBar={true}
          navigate={navigate}
        />
        <HeroSection theme={theme} isDark={isDark} navigate={navigate} topOffset={STATUS_BAR_H} />
        <SectionDivider theme={theme} accent="gold" />
        <DecisionFlow theme={theme} />
        <SectionDivider theme={theme} accent="sakura" />
        <ArchSection theme={theme} />
        <SectionDivider theme={theme} accent="crimson" />
        <DomainsSection theme={theme} />
        <CTASection theme={theme} navigate={navigate} />
        <Footer theme={theme} navigate={navigate} />
      </motion.div>
    </>
  );
}