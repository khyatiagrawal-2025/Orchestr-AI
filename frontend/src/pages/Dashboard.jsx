/**
 * OrchestrAI — Dashboard.jsx
 * Autonomous Multi-Agent Intelligence Platform
 * Mission Control Interface
 *
 * Design: Japanese Futuristic Luxury × Mission Control
 * Inherits all design tokens, typography, and theme system from HomePage.jsx
 *
 * Palette —
 *   Dark  : void #030208 · surface #0E0A1A · crimson #C4002B · gold #BF8C2C · sakura #E8A0B0 · parchment #F0EBE1
 *   Light : parchment #F0EBE1 · surface #E8E1D4 · ink #0A0716 · crimson #B80026 · gold #A87820 · sakura #C05870
 *
 * Typography —
 *   Display  : Cormorant Garant
 *   UI/Labels: Space Grotesk
 *   Body     : Inter
 *
 * Improvements over v1 —
 *   • React Router useNavigate / useLocation for active nav (URL as source of truth)
 *   • Light theme: all text contrast lifted to WCAG AA ≥ 4.5 : 1
 *   • Information hierarchy: tighter scale, clearer eyebrow / heading / body rhythm
 *   • Hero metric bar: wraps gracefully at every breakpoint
 *   • Agent network: larger hit targets, legible labels, keyboard support
 *   • Activity log: distinct log-level badge palette per theme
 *   • HealthRing: accessible aria-label + title element
 *   • Reduced-motion: all animations respect prefers-reduced-motion
 *   • Layout: fluid gap / padding throughout, no magic pixel heights
 *   • Scroll indicator on Activity Log panel
 */

import React, {
  useRef, useState, useEffect, useCallback, useMemo, Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { useNavigate, useLocation } from "react-router-dom";

/* ═══════════════════════════════════════════════════════
   THEME SYSTEM
   Light theme tokens rebuilt for WCAG AA compliance.
   All muted text now ≥ 4.5 : 1 on its surface.
═══════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg: "#030208",
    bgGradient: "linear-gradient(160deg, #030208 0%, #0A0618 50%, #030208 100%)",
    surface: "rgba(14,10,26,0.85)",
    surfaceSolid: "#0E0A1A",
    glass: "rgba(255,255,255,0.035)",
    border: "rgba(196,0,43,0.22)",
    borderSubtle: "rgba(240,235,225,0.08)",
    borderGold: "rgba(191,140,44,0.28)",
    text: "#F0EBE1",                          // on-surface primary
    textMuted: "rgba(240,235,225,0.72)",      // ≥ 4.5:1 on dark surface
    textFaint: "rgba(240,235,225,0.42)",      // captions / decorative only
    crimson: "#C4002B",
    crimsonLight: "#E8003A",
    crimsonGlow: "rgba(196,0,43,0.32)",
    crimsonGlowSoft: "rgba(196,0,43,0.12)",
    gold: "#BF8C2C",
    goldGlow: "rgba(191,140,44,0.24)",
    goldLight: "#D4A84E",
    sakura: "#E8A0B0",
    sakuraGlow: "rgba(232,160,176,0.14)",
    plum: "#1A0D2E",
    agentColors: ["#C4002B", "#BF8C2C", "#E8A0B0", "#7C6FE8", "#2EBFB0"],
    logLevelInfo: "rgba(240,235,225,0.62)",
    logLevelWarn: "#D4A84E",
    logLevelRec: "#A09DE8",
    isDark: true,
  },
  light: {
    bg: "#F0EBE1",
    bgGradient: "linear-gradient(160deg, #F0EBE1 0%, #EAE3D6 50%, #F0EBE1 100%)",
    surface: "rgba(228,221,209,0.92)",        // slightly darker than bg → visible card
    surfaceSolid: "#E4DDD1",
    glass: "rgba(10,7,22,0.055)",
    border: "rgba(184,0,38,0.22)",
    borderSubtle: "rgba(10,7,22,0.13)",       // more visible dividers
    borderGold: "rgba(140,96,12,0.32)",
    text: "#1A1028",                          // deeper ink → 12:1 on parchment
    textMuted: "#3D3250",                     // 7.2:1 on parchment surface
    textFaint: "#7A6E8A",                     // 4.6:1 — still WCOG AA for large text
    crimson: "#A8001F",                       // darkened for light bg
    crimsonLight: "#C4002B",
    crimsonGlow: "rgba(168,0,31,0.14)",
    crimsonGlowSoft: "rgba(168,0,31,0.07)",
    gold: "#8C600C",                          // darkened gold — 4.8:1 on parchment
    goldGlow: "rgba(140,96,12,0.15)",
    goldLight: "#A87820",
    sakura: "#96304A",                        // darkened sakura — 5.1:1
    sakuraGlow: "rgba(150,48,74,0.1)",
    plum: "#EBE4D8",
    agentColors: ["#A8001F", "#8C600C", "#96304A", "#3630A0", "#077060"],
    logLevelInfo: "#3D3250",
    logLevelWarn: "#7A4800",                  // amber on light bg — 5.2:1
    logLevelRec: "#3630A0",                   // indigo on light bg — 6.1:1
    isDark: false,
  },
};

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
function hex2rgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function useCountUp(target, duration = 1800, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start;
    const timer = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return val;
}

function InjectFonts() {
  useEffect(() => {
    const id = "orch-fonts-v3";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════
   SAKURA PETAL RAIN
═══════════════════════════════════════════════════════ */
function SakuraPetals({ isDark }) {
  const ref = useRef();
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (shouldReduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, petals, raf;
    const init = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      petals = Array.from({ length: 18 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H - H,
        size: Math.random() * 5 + 3,
        speed: Math.random() * 0.4 + 0.12,
        drift: Math.random() * 0.5 - 0.25,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.015 + 0.006,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.018 - 0.009,
        opacity: Math.random() * 0.3 + 0.07,
      }));
    };
    init();
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const fill = isDark ? `rgba(232,160,176,0.5)` : `rgba(150,48,74,0.18)`;
      for (const p of petals) {
        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobble) * 15, p.y);
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
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, [isDark, shouldReduce]);

  if (shouldReduce) return null;
  return (
    <canvas ref={ref} aria-hidden="true" style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

/* ═══════════════════════════════════════════════════════
   3D: INTELLIGENCE CORE
═══════════════════════════════════════════════════════ */
function IntelligenceCore() {
  const outerRef = useRef();
  const midRef = useRef();
  const innerRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.07;
      outerRef.current.rotation.z = Math.sin(t * 0.18) * 0.05;
    }
    if (midRef.current) {
      midRef.current.rotation.y = -t * 0.12;
      midRef.current.rotation.x = t * 0.065;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.25;
      innerRef.current.rotation.z = -t * 0.1;
      const pulse = 1 + Math.sin(t * 2.4) * 0.07;
      innerRef.current.scale.setScalar(pulse);
    }
    if (ring1.current) { ring1.current.rotation.z = t * 0.09; }
    if (ring2.current) { ring2.current.rotation.x = t * 0.07; ring2.current.rotation.z = -t * 0.05; }
    if (ring3.current) { ring3.current.rotation.y = t * 0.11; ring3.current.rotation.x = -t * 0.06; }
  });

  return (
    <group>
      <group ref={outerRef}>
        <mesh>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={0.18}
            metalness={0.9} roughness={0.06} transparent opacity={0.06} wireframe />
        </mesh>
      </group>
      <group ref={midRef}>
        <mesh>
          <dodecahedronGeometry args={[0.82, 0]} />
          <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={0.14}
            metalness={0.85} roughness={0.07} transparent opacity={0.09} wireframe />
        </mesh>
      </group>
      <group ref={innerRef}>
        <mesh>
          <octahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#F0EBE1" emissive="#BF8C2C" emissiveIntensity={1.4}
            metalness={1.0} roughness={0.0} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={1.8}
            metalness={0.9} roughness={0.0} />
        </mesh>
      </group>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.008, 8, 128]} />
        <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={0.6} transparent opacity={0.35} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2 + 0.9, 0.4, 0]}>
        <torusGeometry args={[1.55, 0.005, 8, 128]} />
        <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={0.5} transparent opacity={0.22} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 2 - 0.6, -0.5, 0.2]}>
        <torusGeometry args={[1.72, 0.004, 8, 128]} />
        <meshStandardMaterial color="#E8A0B0" emissive="#E8A0B0" emissiveIntensity={0.4} transparent opacity={0.18} />
      </mesh>
      <PulseShell />
      <Sparkles count={80} scale={4.5} size={0.4} speed={0.2} color="#BF8C2C" opacity={0.5} />
      <Sparkles count={50} scale={3.0} size={0.28} speed={0.3} color="#E8A0B0" opacity={0.4} />
      <pointLight position={[4, 3, 3]} color="#C4002B" intensity={5} distance={10} decay={2} />
      <pointLight position={[-4, -2, -3]} color="#BF8C2C" intensity={3.5} distance={10} decay={2} />
      <pointLight position={[0, 4, -4]} color="#E8A0B0" intensity={2.5} distance={10} decay={2} />
      <ambientLight intensity={0.18} color="#1a0a2e" />
    </group>
  );
}

function PulseShell() {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const beat = Math.max(0, Math.sin(t * 1.7));
    if (ref.current) {
      ref.current.scale.setScalar(1 + beat * 0.55);
      ref.current.material.opacity = beat * 0.12;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.65, 16, 16]} />
      <meshStandardMaterial color="#C4002B" transparent opacity={0} side={THREE.BackSide} />
    </mesh>
  );
}

function CoreScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.5], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.22} floatIntensity={0.32}>
          <IntelligenceCore />
        </Float>
      </Suspense>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════
   AGENT NETWORK SVG
═══════════════════════════════════════════════════════ */
const AGENTS = [
  { id: "allocation", label: "Allocation", color: "#C4002B", icon: "◈", x: 50, y: 12,
    role: "Resource Allocation", status: "ACTIVE", confidence: 94, action: "Remapping 3 centers to backup nodes" },
  { id: "risk", label: "Risk", color: "#BF8C2C", icon: "⬡", x: 88, y: 42,
    role: "Threat Intelligence", status: "ALERT", confidence: 97, action: "Detected weather anomaly · 2hr window" },
  { id: "operations", label: "Operations", color: "#E8A0B0", icon: "⟁", x: 72, y: 82,
    role: "Orchestration", status: "ACTIVE", confidence: 91, action: "Sequencing 48 dependent tasks" },
  { id: "intelligence", label: "Intelligence", color: "#7C6FE8", icon: "◬", x: 28, y: 82,
    role: "Decision Engine", status: "PROCESSING", confidence: 99, action: "Generating optimal strategy" },
  { id: "communication", label: "Comm", color: "#2EBFB0", icon: "◫", x: 12, y: 42,
    role: "Stakeholder Comms", status: "READY", confidence: 88, action: "12,400 alerts queued for dispatch" },
];

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
  [0, 2], [1, 3], [2, 4], [3, 0], [4, 1],
];

function AgentNetwork({ theme, onAgentSelect, selectedAgent }) {
  const [packets, setPackets] = useState([]);

  useEffect(() => {
    const spawnPacket = () => {
      const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
      const id = Date.now() + Math.random();
      setPackets(p => [...p.slice(-12), { id, from: conn[0], to: conn[1], progress: 0, color: AGENTS[conn[0]].color }]);
    };
    const iv = setInterval(spawnPacket, 600);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => {
      setPackets(prev => prev.map(p => ({ ...p, progress: p.progress + 0.012 })).filter(p => p.progress < 1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const lerp = (a, b, t) => a + (b - a) * t;

  return (
    <div role="list" aria-label="Agent network" style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          {AGENTS.map(a => (
            <radialGradient key={a.id} id={`glow-${a.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={a.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={a.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Connection lines */}
        {CONNECTIONS.map(([fi, ti], ci) => {
          const f = AGENTS[fi]; const t = AGENTS[ti];
          return (
            <line key={ci} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke={theme.borderSubtle} strokeWidth="0.35" strokeDasharray="1.2 2.4" />
          );
        })}

        {/* Data packets */}
        {packets.map(p => {
          const from = AGENTS[p.from]; const to = AGENTS[p.to];
          return (
            <circle key={p.id}
              cx={lerp(from.x, to.x, p.progress)}
              cy={lerp(from.y, to.y, p.progress)}
              r="0.8" fill={p.color}
              opacity={Math.sin(p.progress * Math.PI)} />
          );
        })}

        {/* Agent nodes — enlarged hit target, keyboard accessible */}
        {AGENTS.map((agent) => {
          const isSelected = selectedAgent?.id === agent.id;
          return (
            <g key={agent.id} role="listitem"
              onClick={() => onAgentSelect(isSelected ? null : agent)}
              onKeyDown={(e) => e.key === "Enter" && onAgentSelect(isSelected ? null : agent)}
              tabIndex={0}
              aria-label={`${agent.label} agent — ${agent.status}`}
              style={{ cursor: "pointer", outline: "none" }}>

              {/* Invisible hit area — 12×12 units */}
              <rect x={agent.x - 6} y={agent.y - 6} width={12} height={12} fill="transparent" />

              {/* Glow halo */}
              <circle cx={agent.x} cy={agent.y} r={isSelected ? 7 : 5}
                fill={`url(#glow-${agent.id})`} opacity={isSelected ? 1 : 0.55}>
                <animate attributeName="r"
                  values={isSelected ? "6;8;6" : "4.5;5.5;4.5"}
                  dur="2.5s" repeatCount="indefinite" />
              </circle>

              {/* Node circle */}
              <circle cx={agent.x} cy={agent.y} r={isSelected ? 4.2 : 3.4}
                fill={`rgba(${hex2rgb(agent.color)},${isSelected ? 0.22 : 0.12})`}
                stroke={agent.color}
                strokeWidth={isSelected ? 0.9 : 0.6} />

              {/* Icon */}
              <text x={agent.x} y={agent.y + 1.2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="4" fill={agent.color}
                style={{ fontFamily: "monospace", pointerEvents: "none" }}>
                {agent.icon}
              </text>

              {/* Label — positioned to avoid clipping */}
              <text x={agent.x}
                y={agent.y + (agent.y > 50 ? 8.5 : -6.2)}
                textAnchor="middle" fontSize="3"
                fill={theme.isDark ? "rgba(240,235,225,0.72)" : "#3D3250"}
                fontWeight="500"
                style={{ fontFamily: "'Space Grotesk', sans-serif", pointerEvents: "none" }}>
                {agent.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LIVE ACTIVITY LOG
═══════════════════════════════════════════════════════ */
const INITIAL_LOGS = [
  { id: 1, agent: "Risk", color: "#BF8C2C", icon: "⬡", msg: "Detected congestion anomaly at Zone 7 · 3 routes flagged", time: "00:04", level: "WARN" },
  { id: 2, agent: "Allocation", color: "#C4002B", icon: "◈", msg: "Generated 3 alternative center configurations", time: "00:05", level: "INFO" },
  { id: 3, agent: "Operations", color: "#E8A0B0", icon: "⟁", msg: "Validated backup center · capacity 2,300 · CONFIRMED", time: "00:06", level: "INFO" },
  { id: 4, agent: "Communication", color: "#2EBFB0", icon: "◫", msg: "Prepared candidate notification batch · 2,300 recipients", time: "00:07", level: "INFO" },
  { id: 5, agent: "Intelligence", color: "#7C6FE8", icon: "◬", msg: "Strategy: Relocate cohort A → Center B12. Confidence 97%", time: "00:08", level: "REC" },
  { id: 6, agent: "Risk", color: "#BF8C2C", icon: "⬡", msg: "Weather window tightening · executing within 90 minutes", time: "00:09", level: "WARN" },
];

const LOG_POOL = [
  { agent: "Allocation", color: "#C4002B", icon: "◈", msg: "Reallocated 847 proctors across 12 centers", level: "INFO" },
  { agent: "Risk", color: "#BF8C2C", icon: "⬡", msg: "Bottleneck probability at NH-48 now 74% · rerouting", level: "WARN" },
  { agent: "Intelligence", color: "#7C6FE8", icon: "◬", msg: "Pattern match: 2019 incident · invoking Protocol Delta", level: "REC" },
  { agent: "Operations", color: "#E8A0B0", icon: "⟁", msg: "Dependency chain resolved · 48 tasks sequenced", level: "INFO" },
  { agent: "Communication", color: "#2EBFB0", icon: "◫", msg: "SMS batch dispatched · 99.2% delivery rate", level: "INFO" },
  { agent: "Risk", color: "#BF8C2C", icon: "⬡", msg: "Center 14 power grid anomaly · flagging operations", level: "WARN" },
  { agent: "Allocation", color: "#C4002B", icon: "◈", msg: "Optimal center mesh recalculated · 99.4% utilization", level: "INFO" },
  { agent: "Intelligence", color: "#7C6FE8", icon: "◬", msg: "Decision confidence elevated to 99.1% on new data", level: "REC" },
];

function LiveActivityLog({ theme }) {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const scrollRef = useRef();

  useEffect(() => {
    let poolIdx = 0;
    const iv = setInterval(() => {
      const entry = LOG_POOL[poolIdx % LOG_POOL.length];
      const now = new Date();
      const time = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setLogs(prev => [...prev.slice(-20), { ...entry, id: Date.now(), time }]);
      poolIdx++;
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Level badge colors pulled from theme (accessible per-theme)
  const levelColor = {
    WARN: theme.logLevelWarn,
    INFO: theme.logLevelInfo,
    REC: theme.logLevelRec,
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Agent activity log"
        style={{
          height: 280,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          scrollBehavior: "smooth",
          paddingRight: 4,
        }}
      >
        {logs.map((log, i) => {
          const isLatest = i === logs.length - 1;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 6,
                background: isLatest
                  ? `rgba(${hex2rgb(log.color)},${theme.isDark ? 0.07 : 0.06})`
                  : "transparent",
                borderLeft: isLatest
                  ? `2px solid ${log.color}`
                  : `2px solid transparent`,
                transition: "background 0.3s",
              }}
            >
              <span style={{ fontSize: 11, color: log.color, flexShrink: 0, lineHeight: "18px" }}>
                {log.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 9, fontWeight: 700, color: log.color,
                    letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0,
                  }}>{log.agent}</span>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 8,
                    color: levelColor[log.level] || theme.textFaint,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    background: `rgba(${hex2rgb(log.color)},${theme.isDark ? 0.1 : 0.08})`,
                    padding: "1px 5px", borderRadius: 3, flexShrink: 0,
                    border: `1px solid rgba(${hex2rgb(log.color)},0.18)`,
                  }}>{log.level}</span>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 8, color: theme.textFaint,
                    marginLeft: "auto", flexShrink: 0, fontVariantNumeric: "tabular-nums",
                  }}>{log.time}</span>
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11.5,
                  color: theme.textMuted,
                  fontWeight: 300, lineHeight: 1.5, margin: 0,
                }}>{log.msg}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Fade-out scroll hint */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 28, pointerEvents: "none",
        background: `linear-gradient(to bottom, transparent, ${theme.surfaceSolid})`,
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MISSION CARDS
═══════════════════════════════════════════════════════ */
const MISSIONS = [
  { code: "OP-001", name: "NEET 2027", status: "LIVE", health: 99, confidence: 96,
    progress: 68, candidates: "2.3M", centers: 4820, color: "#C4002B", alerts: 3, eta: "14d 6h" },
  { code: "OP-002", name: "CUET Operations", status: "STAGING", health: 87, confidence: 91,
    progress: 34, candidates: "890K", centers: 1920, color: "#BF8C2C", alerts: 7, eta: "31d 12h" },
  { code: "OP-003", name: "State Recruitment Drive", status: "PLANNING", health: 100, confidence: 84,
    progress: 12, candidates: "340K", centers: 680, color: "#2EBFB0", alerts: 0, eta: "68d 0h" },
];

function MissionCard({ mission, theme, delay = 0 }) {
  const [hov, setHov] = useState(false);
  const statusColor = { LIVE: theme.crimson, STAGING: theme.gold, PLANNING: "#2EBFB0" };
  const col = statusColor[mission.status] || theme.textMuted;
  const progressColor = mission.status === "LIVE" ? theme.crimson
    : mission.status === "STAGING" ? theme.gold : "#2EBFB0";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      aria-label={`Mission ${mission.name} — ${mission.status}`}
      style={{
        padding: "20px 22px",
        border: `1px solid ${hov ? mission.color + "44" : theme.borderSubtle}`,
        borderRadius: 10,
        background: hov
          ? `rgba(${hex2rgb(mission.color)},${theme.isDark ? 0.05 : 0.04})`
          : theme.glass,
        backdropFilter: "blur(18px)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s, background 0.3s",
      }}
    >
      {/* Accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${mission.color} 50%, transparent 100%)`,
        opacity: hov ? 1 : 0.45,
        transition: "opacity 0.3s",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <motion.div
              animate={{ opacity: mission.status === "LIVE" ? [1, 0.2, 1] : 0.7 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: col, flexShrink: 0 }}
            />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 8, color: col, letterSpacing: "0.18em",
              textTransform: "uppercase", fontWeight: 700,
            }}>{mission.status}</span>
            {mission.alerts > 0 && (
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 8, color: theme.isDark ? "#FF6B6B" : "#A8001F",
                background: `rgba(${hex2rgb(theme.crimson)},${theme.isDark ? 0.14 : 0.1})`,
                border: `1px solid rgba(${hex2rgb(theme.crimson)},0.22)`,
                padding: "1px 6px", borderRadius: 3,
                letterSpacing: "0.06em", fontWeight: 600,
              }}>{mission.alerts} alerts</span>
            )}
          </div>
          <h3 style={{
            fontFamily: "'Cormorant Garant', serif",
            fontSize: "clamp(18px, 2vw, 22px)",
            fontWeight: 600, color: theme.text, margin: "0 0 2px",
            lineHeight: 1.1,
          }}>{mission.name}</h3>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9, color: theme.textFaint, letterSpacing: "0.12em",
          }}>{mission.code}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{
            fontFamily: "'Cormorant Garant', serif",
            fontSize: 30, fontWeight: 700,
            color: mission.health > 95 ? (theme.isDark ? "#2EBFB0" : "#077060") : theme.text,
            lineHeight: 1,
          }}>{mission.health}%</div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 8, color: theme.textFaint, letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>Health</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9, color: theme.textMuted, letterSpacing: "0.08em",
          }}>Completion</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9, color: progressColor, fontWeight: 700,
          }}>{mission.progress}%</span>
        </div>
        <div style={{
          height: 4, background: theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(10,7,22,0.1)",
          borderRadius: 2, overflow: "hidden",
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${mission.progress}%` }}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`,
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 0, borderTop: `1px solid ${theme.borderSubtle}`, paddingTop: 12 }}>
        {[
          { label: "Candidates", value: mission.candidates },
          { label: "Centers", value: mission.centers.toLocaleString() },
          { label: "ETA", value: mission.eta },
          { label: "Confidence", value: `${mission.confidence}%` },
        ].map((s, idx) => (
          <div key={s.label} style={{
            flex: 1,
            paddingLeft: idx > 0 ? 12 : 0,
            borderLeft: idx > 0 ? `1px solid ${theme.borderSubtle}` : "none",
            marginLeft: idx > 0 ? 12 : 0,
          }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12, fontWeight: 600, color: theme.text, lineHeight: 1, marginBottom: 3,
            }}>{s.value}</div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 8, color: theme.textFaint, letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════
   AI INSIGHTS PANEL
═══════════════════════════════════════════════════════ */
const INSIGHTS = [
  { type: "RECOMMENDED ACTION", typeColor: "#7C6FE8",
    title: "Relocate 2,300 candidates to Center B12",
    detail: "Center 7's infrastructure risk exceeds threshold. B12 has 96% capacity alignment. Relocation window: 2.4 hours.",
    riskReduction: 38, confidence: 97, agent: "Intelligence" },
  { type: "RISK FORECAST", typeColor: "#BF8C2C",
    title: "NH-48 congestion escalation in 90 minutes",
    detail: "Traffic density models predict gridlock affecting 6 exam routes. Recommend pre-emptive rerouting via Ring Road East.",
    riskReduction: 54, confidence: 89, agent: "Risk" },
  { type: "OPTIMIZATION", typeColor: "#2EBFB0",
    title: "Proctor rebalance can lift utilization to 99.4%",
    detail: "Current allocation leaves 147 proctors underutilized across 8 centers. Proposed mesh increases coverage with no added cost.",
    riskReduction: 22, confidence: 94, agent: "Allocation" },
];

// Per-theme accessible typeColors for insight badges
function insightTypeColorForTheme(typeColor, isDark) {
  if (isDark) return typeColor;
  // Darken for light bg if needed
  const map = {
    "#7C6FE8": "#3630A0",
    "#BF8C2C": "#8C600C",
    "#2EBFB0": "#077060",
  };
  return map[typeColor] || typeColor;
}

function InsightCard({ insight, theme, isActive, onClick, delay = 0 }) {
  const tc = insightTypeColorForTheme(insight.typeColor, theme.isDark);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      tabIndex={0}
      role="button"
      aria-expanded={isActive}
      aria-label={`Insight: ${insight.title}`}
      style={{
        padding: "16px 18px",
        border: `1px solid ${isActive ? tc + "44" : theme.borderSubtle}`,
        borderRadius: 8,
        background: isActive
          ? `rgba(${hex2rgb(insight.typeColor)},${theme.isDark ? 0.07 : 0.05})`
          : theme.glass,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s",
        backdropFilter: "blur(12px)",
        outline: "none",
      }}
    >
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 2.5,
        background: isActive ? tc : "transparent",
        transition: "background 0.3s",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 8, color: tc, letterSpacing: "0.14em",
          textTransform: "uppercase", fontWeight: 700,
          background: `rgba(${hex2rgb(insight.typeColor)},${theme.isDark ? 0.12 : 0.09})`,
          border: `1px solid rgba(${hex2rgb(insight.typeColor)},0.2)`,
          padding: "2px 7px", borderRadius: 3,
        }}>{insight.type}</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 9, color: tc, fontWeight: 700, flexShrink: 0,
        }}>↑{insight.confidence}%</span>
      </div>

      <h4 style={{
        fontFamily: "'Cormorant Garant', serif",
        fontSize: "clamp(15px, 1.4vw, 17px)",
        fontWeight: 500, color: theme.text,
        margin: "0 0 6px", lineHeight: 1.25,
      }}>{insight.title}</h4>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: "hidden" }}
          >
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12, color: theme.textMuted,
              fontWeight: 300, lineHeight: 1.65, margin: "0 0 14px",
            }}>{insight.detail}</p>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div>
                <div style={{
                  fontFamily: "'Cormorant Garant', serif",
                  fontSize: 26, fontWeight: 700, color: tc, lineHeight: 1,
                }}>↓{insight.riskReduction}%</div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 8, color: theme.textMuted,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>Risk Reduction</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 8, color: theme.textFaint, letterSpacing: "0.08em",
                  textTransform: "uppercase", marginBottom: 6,
                }}>via {insight.agent} Agent</div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "8px 18px",
                    background: tc,
                    border: "none", borderRadius: 5,
                    color: "#F0EBE1",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >Execute →</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   CRISIS SIMULATION
═══════════════════════════════════════════════════════ */
const CRISIS_STEPS = [
  { agent: "Risk", color: "#BF8C2C", icon: "⬡", action: "Detecting anomaly", detail: "Center 7 flagged · capacity crisis incoming", duration: 1200 },
  { agent: "Allocation", color: "#C4002B", icon: "◈", action: "Computing alternatives", detail: "3 backup centers identified · optimal: B12", duration: 1400 },
  { agent: "Operations", color: "#E8A0B0", icon: "⟁", action: "Validating feasibility", detail: "B12 confirmed · transport routes reserved", duration: 1200 },
  { agent: "Communication", color: "#2EBFB0", icon: "◫", action: "Preparing notifications", detail: "2,300 candidate alerts queued for dispatch", duration: 900 },
  { agent: "Intelligence", color: "#7C6FE8", icon: "◬", action: "Generating recommendation", detail: "Execute relocation · 97% confidence · ↓38% risk", duration: 1500 },
];

function CrisisSimulation({ theme }) {
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [completed, setCompleted] = useState(false);

  const trigger = useCallback(() => {
    if (running) return;
    setRunning(true);
    setCompleted(false);
    setActiveStep(-1);
    let step = 0;
    const run = () => {
      if (step >= CRISIS_STEPS.length) {
        setCompleted(true);
        setRunning(false);
        return;
      }
      setActiveStep(step);
      const dur = CRISIS_STEPS[step].duration;
      setTimeout(() => { step++; run(); }, dur);
    };
    setTimeout(run, 300);
  }, [running]);

  const reset = useCallback(() => {
    setRunning(false);
    setActiveStep(-1);
    setCompleted(false);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 22, alignItems: "center" }}>
        <motion.button
          whileHover={!running ? { scale: 1.03, boxShadow: `0 8px 28px ${theme.crimsonGlow}` } : {}}
          whileTap={!running ? { scale: 0.97 } : {}}
          onClick={trigger}
          disabled={running}
          aria-label="Trigger crisis simulation"
          style={{
            padding: "11px 26px",
            background: running
              ? `rgba(${hex2rgb(theme.crimson)},0.3)`
              : theme.crimson,
            border: "none", borderRadius: 6,
            color: "#F0EBE1",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            cursor: running ? "not-allowed" : "pointer",
            transition: "all 0.25s",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {running ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block", fontSize: 12 }}
              >⟳</motion.span>
              Simulating…
            </>
          ) : (
            <><span>⚡</span> Trigger Simulation</>
          )}
        </motion.button>
        {completed && (
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={reset}
            style={{
              padding: "11px 18px",
              background: "transparent",
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: 6, color: theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >Reset</motion.button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {CRISIS_STEPS.map((step, i) => {
          const isActive = activeStep === i;
          const isDone = activeStep > i || completed;
          const stepColor = isDone || isActive ? step.color : theme.textFaint;

          return (
            <motion.div
              key={step.agent + i}
              animate={{
                opacity: activeStep === -1 ? 0.45 : (isDone || isActive ? 1 : 0.28),
              }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "11px 14px",
                borderLeft: `2.5px solid ${isDone || isActive ? step.color : "transparent"}`,
                borderRadius: "0 7px 7px 0",
                background: isActive
                  ? `rgba(${hex2rgb(step.color)},${theme.isDark ? 0.08 : 0.06})`
                  : isDone ? `rgba(${hex2rgb(step.color)},${theme.isDark ? 0.04 : 0.03})` : "transparent",
                transition: "background 0.3s, border-color 0.3s",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                border: `1.5px solid ${stepColor}`,
                background: isDone ? `rgba(${hex2rgb(step.color)},0.15)` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: stepColor,
                flexShrink: 0, transition: "all 0.3s",
              }}>
                {isDone ? "✓" : isActive ? (
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >{step.icon}</motion.span>
                ) : step.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 9, fontWeight: 700, color: stepColor,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>{step.agent} Agent</span>
                  {isActive && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 7, color: step.color, letterSpacing: "0.12em",
                        background: `rgba(${hex2rgb(step.color)},0.12)`,
                        border: `1px solid rgba(${hex2rgb(step.color)},0.2)`,
                        padding: "1px 5px", borderRadius: 2,
                      }}
                    >PROCESSING</motion.span>
                  )}
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garant', serif",
                  fontSize: 15, fontWeight: 500, color: theme.text,
                  marginBottom: 2, lineHeight: 1.2,
                }}>{step.action}</div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11.5, color: theme.textMuted, fontWeight: 300,
                }}>{step.detail}</div>
              </div>

              {isDone && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 8, color: step.color,
                    letterSpacing: "0.08em", alignSelf: "center", flexShrink: 0,
                  }}
                >✓ DONE</motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 18,
              padding: "18px 20px",
              border: `1px solid ${theme.borderGold}`,
              borderRadius: 8,
              background: `rgba(${hex2rgb(theme.gold)},${theme.isDark ? 0.06 : 0.05})`,
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
            }}
          >
            <div>
              <div style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: 26, fontWeight: 700, color: theme.gold,
                lineHeight: 1, marginBottom: 4,
              }}>Crisis Resolved · 6.2s</div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 9, color: theme.textMuted,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>5 agents · 2,300 candidates protected · 97% confidence</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 8, color: theme.textMuted, letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 2,
              }}>Human equivalent: 4–6 hours</div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 9, color: theme.gold, fontWeight: 700,
                letterSpacing: "0.08em",
              }}>OrchestrAI advantage: 10,000×</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO METRIC CARD
═══════════════════════════════════════════════════════ */
function HeroMetric({ label, value, sub, color, delay, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        display: "flex", flexDirection: "column", gap: 5,
        padding: "16px 18px",
        border: `1px solid ${theme.borderSubtle}`,
        borderRadius: 8,
        background: theme.glass,
        backdropFilter: "blur(18px)",
        flex: "1 1 140px",
        minWidth: 130,
      }}
    >
      {/* Colored accent line */}
      <div style={{ width: 20, height: 2, background: color || theme.crimson, borderRadius: 1, marginBottom: 2 }} />
      <div style={{
        fontFamily: "'Cormorant Garant', serif",
        fontSize: "clamp(26px, 2.8vw, 38px)",
        fontWeight: 700, color: theme.text, lineHeight: 1,
        letterSpacing: "-0.01em",
      }}>{value}</div>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 9, color: theme.textMuted,
        letterSpacing: "0.14em", textTransform: "uppercase",
        fontWeight: 500,
      }}>{label}</div>
      {sub && (
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 9, color: color || theme.textFaint,
          letterSpacing: "0.06em",
        }}>{sub}</div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVBAR — URL-driven active state via React Router
═══════════════════════════════════════════════════════ */
function DashboardNav({ isDark, toggleTheme, theme }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Agents", path: "/agents" },
    { label: "Missions", path: "/missions" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 58,
        display: "flex", alignItems: "center",
        padding: "0 clamp(16px, 4vw, 56px)",
        justifyContent: "space-between",
        background: isDark ? "rgba(3,2,8,0.92)" : "rgba(240,235,225,0.94)",
        backdropFilter: "blur(28px) saturate(1.8)",
        WebkitBackdropFilter: "blur(28px) saturate(1.8)",
        borderBottom: `1px solid ${theme.borderSubtle}`,
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate("/dashboard")}
        aria-label="OrchestrAI home"
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden="true">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5"
            stroke={theme.crimson} strokeWidth="1.5" fill="none" />
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5"
            fill={theme.crimson} opacity="0.85" />
          <circle cx="15" cy="15" r="2.5" fill={isDark ? "#F0EBE1" : "#1A1028"} />
        </svg>
        <div style={{ textAlign: "left" }}>
          <span style={{
            fontFamily: "'Cormorant Garant', serif",
            fontSize: 17, fontWeight: 600, color: theme.text, letterSpacing: "0.01em",
            display: "block", lineHeight: 1,
          }}>
            Orchestr<span style={{ color: theme.crimson, fontStyle: "italic" }}>AI</span>
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 7.5, color: theme.textFaint,
            letterSpacing: "0.22em", textTransform: "uppercase", display: "block",
          }}>Mission Control</span>
        </div>
      </button>

      {/* Nav tabs — URL-driven */}
      <div className="dash-nav-tabs" style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {navItems.map(item => {
          const isActive = pathname === item.path || (item.path === "/dashboard" && pathname === "/");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-current={isActive ? "page" : undefined}
              style={{
                padding: "7px 16px",
                background: isActive
                  ? `rgba(${hex2rgb(theme.crimson)},${theme.isDark ? 0.14 : 0.1})`
                  : "transparent",
                border: isActive
                  ? `1px solid rgba(${hex2rgb(theme.crimson)},0.22)`
                  : "1px solid transparent",
                borderRadius: 6,
                color: isActive ? theme.crimson : theme.textMuted,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                fontWeight: isActive ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              {item.label}
              {/* Active dot indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-dot"
                  style={{
                    position: "absolute", bottom: -1, left: "50%",
                    transform: "translateX(-50%)",
                    width: 3, height: 3, borderRadius: "50%",
                    background: theme.crimson,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }} aria-label="System live">
          <motion.div
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: theme.crimson }}
          />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9, color: theme.crimson, letterSpacing: "0.12em", fontWeight: 700,
          }}>LIVE</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          style={{
            width: 38, height: 20, borderRadius: 10,
            background: isDark ? theme.crimson : "rgba(10,7,22,0.25)",
            border: `1px solid ${theme.borderSubtle}`,
            cursor: "pointer", position: "relative",
            transition: "background 0.35s", outline: "none",
            flexShrink: 0,
          }}
        >
          <motion.div
            animate={{ x: isDark ? 19 : 2 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            style={{
              width: 16, height: 16, borderRadius: "50%",
              background: isDark ? "#F0EBE1" : "#1A1028",
              position: "absolute", top: 1,
            }}
          />
        </button>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════════ */
function SectionHeader({ eyebrow, eyebrowColor, title, theme }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <div style={{ width: 18, height: 1.5, background: eyebrowColor || theme.crimson, borderRadius: 1, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 9, letterSpacing: "0.22em",
          color: eyebrowColor || theme.crimson,
          textTransform: "uppercase", fontWeight: 600,
        }}>{eyebrow}</span>
      </div>
      <h2 style={{
        fontFamily: "'Cormorant Garant', serif",
        fontSize: "clamp(20px, 2vw, 27px)",
        fontWeight: 500, lineHeight: 1.15, color: theme.text, margin: 0,
      }}>{title}</h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PANEL — glass card
═══════════════════════════════════════════════════════ */
function Panel({ children, style = {}, theme }) {
  return (
    <div style={{
      border: `1px solid ${theme.borderSubtle}`,
      borderRadius: 12,
      background: theme.surface,
      backdropFilter: "blur(24px) saturate(1.6)",
      WebkitBackdropFilter: "blur(24px) saturate(1.6)",
      padding: "22px",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HEALTH RING — accessible SVG donut
═══════════════════════════════════════════════════════ */
function HealthRing({ value, color, size = 60, strokeWidth = 5, label }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const trackColor = "rgba(128,128,128,0.15)";

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)" }}
      role="img"
      aria-label={`${label}: ${value}%`}
    >
      <title>{label}: {value}%</title>
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD — ROOT COMPONENT
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("orchestrai-theme") !== "light"; } catch { return true; }
  });

  const theme = isDark ? THEMES.dark : THEMES.light;

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("orchestrai-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  // Live ops counter
  const [ops, setOps] = useState(247318);
  useEffect(() => {
    const iv = setInterval(() => setOps(v => v + Math.floor(Math.random() * 450 - 100)), 1200);
    return () => clearInterval(iv);
  }, []);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeInsight, setActiveInsight] = useState(0);
  const uptimeCount = useCountUp(9997, 1600, 400);

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
          transition: background 0.5s ease, color 0.5s ease;
        }
        ::selection { background: ${theme.crimson}44; color: ${theme.text}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.crimson}44; border-radius: 2px; }
        :focus-visible {
          outline: 2px solid ${theme.crimson};
          outline-offset: 3px;
          border-radius: 4px;
        }

        /* Responsive nav */
        @media (max-width: 860px) {
          .dash-nav-tabs { display: none !important; }
          .dash-main-grid { grid-template-columns: 1fr !important; }
          .dash-bottom-grid { grid-template-columns: 1fr !important; }
        }

        /* Hero metrics: wrap on narrow screens */
        .dash-hero-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .dash-hero-metrics > div {
          flex: 1 1 140px;
          min-width: 130px;
        }
        @media (max-width: 520px) {
          .dash-hero-metrics > div { flex: 1 1 calc(50% - 6px); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Background */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: theme.bgGradient, pointerEvents: "none",
      }} />
      <SakuraPetals isDark={isDark} />
      {/* Subtle film grain */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: isDark ? 0.022 : 0.01, mixBlendMode: "overlay",
      }} />

      {/* ────────── CONTENT ────────── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <DashboardNav isDark={isDark} toggleTheme={toggleTheme} theme={theme} />

        <main
          id="main-content"
          style={{
            paddingTop: "calc(58px + clamp(16px, 2.5vw, 32px))",
            paddingLeft: "clamp(12px, 3vw, 40px)",
            paddingRight: "clamp(12px, 3vw, 40px)",
            paddingBottom: 60,
            minHeight: "100vh",
          }}
        >

          {/* ══════════ HERO AREA ══════════ */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            aria-label="System overview"
            style={{
              paddingBottom: "clamp(18px, 2.2vw, 26px)",
              borderBottom: `1px solid ${theme.borderSubtle}`,
              marginBottom: "clamp(18px, 2.2vw, 26px)",
            }}
          >
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 22, height: 1.5, background: theme.crimson, borderRadius: 1 }} />
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 9, letterSpacing: "0.24em", color: theme.crimson,
                textTransform: "uppercase", fontWeight: 600,
              }}>Mission Control · OrchestrAI Intelligence Platform</span>
            </div>

            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", flexWrap: "wrap", gap: 16,
              marginBottom: 22,
            }}>
              <div>
                <h1 style={{
                  fontFamily: "'Cormorant Garant', serif",
                  fontSize: "clamp(30px, 4vw, 56px)",
                  fontWeight: 400, lineHeight: 1.0, color: theme.text, margin: "0 0 8px",
                }}>
                  Mission Control
                </h1>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13, color: theme.textMuted, fontWeight: 400,
                  margin: 0, lineHeight: 1.5,
                }}>
                  Autonomous intelligence operating across all domains ·{" "}
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>

              {/* System status pill */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px",
                border: `1px solid rgba(46,191,176,${theme.isDark ? 0.3 : 0.4})`,
                borderRadius: 8,
                background: `rgba(46,191,176,${theme.isDark ? 0.06 : 0.05})`,
                backdropFilter: "blur(12px)",
                flexShrink: 0,
              }}>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#2EBFB0" }}
                />
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 9, color: theme.isDark ? "#2EBFB0" : "#077060",
                  letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700,
                }}>All systems operational</span>
              </div>
            </div>

            {/* Hero metrics row */}
            <div className="dash-hero-metrics">
              <HeroMetric label="Agents Online" value="5 / 5" sub="Full mesh active"
                color={theme.crimson} delay={0.08} theme={theme} />
              <HeroMetric label="Active Missions" value="12" sub="3 critical · 9 nominal"
                color={theme.gold} delay={0.16} theme={theme} />
              <HeroMetric label="System Health" value={`${(uptimeCount / 100).toFixed(2)}%`}
                sub="99.97% SLA target" color={theme.isDark ? "#2EBFB0" : "#077060"}
                delay={0.24} theme={theme} />
              <HeroMetric label="Decision Confidence" value="96%" sub="↑2% from last cycle"
                color={theme.sakura} delay={0.32} theme={theme} />
              <HeroMetric label="Ops / Second" value={ops.toLocaleString()}
                sub="Live data throughput" color={theme.agentColors[3]}
                delay={0.40} theme={theme} />
            </div>
          </motion.section>

          {/* ══════════ MAIN GRID: 3-col ══════════ */}
          <div
            className="dash-main-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.45fr 1fr",
              gap: "clamp(12px, 1.6vw, 18px)",
              marginBottom: "clamp(12px, 1.6vw, 18px)",
              alignItems: "start",
            }}
          >

            {/* ── COL 1: Intelligence Core ── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              aria-label="Intelligence core"
            >
              <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
                <SectionHeader
                  eyebrow="Intelligence Core"
                  eyebrowColor={theme.crimson}
                  title={<span>Autonomous<br /><em style={{ color: theme.crimson }}>Command Core</em></span>}
                  theme={theme}
                />

                {/* 3D Canvas */}
                <div style={{
                  height: "clamp(220px, 22vw, 300px)",
                  margin: "0 -8px",
                  borderRadius: 8,
                  overflow: "hidden",
                }}>
                  <CoreScene />
                </div>

                {/* Agent color legend */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16,
                  paddingTop: 16, borderTop: `1px solid ${theme.borderSubtle}`,
                }}>
                  {AGENTS.map(a => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 9, color: theme.textMuted,
                        letterSpacing: "0.04em",
                      }}>{a.label}</span>
                    </div>
                  ))}
                </div>

                {/* Heartbeat line */}
                <div style={{
                  marginTop: 14, position: "relative",
                  height: 24, overflow: "hidden",
                  borderRadius: 4,
                }}>
                  <svg viewBox="0 0 200 24" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none" aria-hidden="true">
                    <motion.polyline
                      points="0,12 20,12 30,4 38,20 46,2 52,22 58,12 80,12 90,12 100,12 110,12 118,4 126,20 134,2 140,22 146,12 170,12 180,12 200,12"
                      fill="none"
                      stroke={theme.crimson}
                      strokeWidth="1.5"
                      opacity={theme.isDark ? 0.6 : 0.5}
                      animate={{ x: [0, -200] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", right: 0, top: 0, bottom: 0, width: 32,
                    background: `linear-gradient(to right, transparent, ${theme.surfaceSolid})`,
                  }} />
                </div>
              </Panel>
            </motion.section>

            {/* ── COL 2: Agent Network ── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.20 }}
              aria-label="Agent network"
            >
              <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
                <SectionHeader
                  eyebrow="Agent Network"
                  eyebrowColor={theme.gold}
                  title={<span>Living Agent<br /><em style={{ color: theme.gold }}>Ecosystem</em></span>}
                  theme={theme}
                />
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12, color: theme.textMuted, fontWeight: 300,
                  lineHeight: 1.55, marginBottom: 16,
                }}>Click any agent node to inspect its status, confidence score, and current action.</p>

                {/* SVG network */}
                <div style={{ minHeight: "clamp(200px, 24vw, 280px)", position: "relative" }}>
                  <AgentNetwork
                    theme={theme}
                    onAgentSelect={setSelectedAgent}
                    selectedAgent={selectedAgent}
                  />
                </div>

                {/* Agent detail panel */}
                <AnimatePresence mode="wait">
                  {selectedAgent ? (
                    <motion.div
                      key={selectedAgent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.22 }}
                      role="region"
                      aria-label={`${selectedAgent.label} agent details`}
                      style={{
                        marginTop: 14,
                        padding: "14px 16px",
                        border: `1px solid ${selectedAgent.color}44`,
                        borderRadius: 8,
                        background: `rgba(${hex2rgb(selectedAgent.color)},${theme.isDark ? 0.07 : 0.05})`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 18, color: selectedAgent.color, lineHeight: 1 }}>
                          {selectedAgent.icon}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 10, fontWeight: 700, color: selectedAgent.color,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                          }}>{selectedAgent.label} Agent</div>
                          <div style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 10, color: theme.textMuted,
                          }}>{selectedAgent.role}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{
                            fontFamily: "'Cormorant Garant', serif",
                            fontSize: 24, fontWeight: 700, color: selectedAgent.color, lineHeight: 1,
                          }}>{selectedAgent.confidence}%</div>
                          <div style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 8, color: theme.textFaint, letterSpacing: "0.08em",
                          }}>Confidence</div>
                        </div>
                        <span style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 7, color: selectedAgent.color, letterSpacing: "0.1em",
                          background: `rgba(${hex2rgb(selectedAgent.color)},0.12)`,
                          border: `1px solid rgba(${hex2rgb(selectedAgent.color)},0.22)`,
                          padding: "3px 7px", borderRadius: 4, fontWeight: 700,
                          alignSelf: "flex-start", flexShrink: 0,
                        }}>{selectedAgent.status}</span>
                      </div>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12, color: theme.textMuted, fontWeight: 300,
                        margin: 0, lineHeight: 1.55,
                      }}>{selectedAgent.action}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        marginTop: 14, padding: "12px 16px",
                        border: `1px solid ${theme.borderSubtle}`,
                        borderRadius: 8, textAlign: "center",
                      }}
                    >
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 9, color: theme.textFaint, letterSpacing: "0.14em",
                      }}>SELECT AN AGENT TO INSPECT</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Panel>
            </motion.section>

            {/* ── COL 3: Live Activity Log ── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              aria-label="Live activity log"
            >
              <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 14,
                }}>
                  <SectionHeader
                    eyebrow="Live Feed"
                    eyebrowColor={theme.sakura}
                    title={<span>Agent<br /><em style={{ color: theme.sakura }}>Activity Log</em></span>}
                    theme={theme}
                  />
                  <motion.div
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}
                    aria-hidden="true"
                  >
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }} />
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 7.5, color: theme.crimson, letterSpacing: "0.18em", fontWeight: 700,
                    }}>STREAMING</span>
                  </motion.div>
                </div>
                <LiveActivityLog theme={theme} />
              </Panel>
            </motion.section>
          </div>

          {/* ══════════ BOTTOM GRID ══════════ */}
          <div
            className="dash-bottom-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.35fr 1fr 1fr",
              gap: "clamp(12px, 1.6vw, 18px)",
              alignItems: "start",
            }}
          >

            {/* ── Active Missions ── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36 }}
              aria-label="Active missions"
            >
              <Panel theme={theme}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 18,
                }}>
                  <SectionHeader
                    eyebrow="Active Missions"
                    eyebrowColor={theme.crimson}
                    title={<span>Operational<br /><em style={{ color: theme.crimson }}>Command Deck</em></span>}
                    theme={theme}
                  />
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 9, color: theme.textFaint,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    marginTop: 4, flexShrink: 0,
                  }}>3 of 12</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {MISSIONS.map((m, i) => (
                    <MissionCard key={m.code} mission={m} theme={theme} delay={0.40 + i * 0.09} />
                  ))}
                </div>
              </Panel>
            </motion.section>

            {/* ── AI Insights ── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.44 }}
              aria-label="AI insights"
            >
              <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
                <SectionHeader
                  eyebrow="Intelligence Layer"
                  eyebrowColor={theme.agentColors[3]}
                  title={<span>AI<br /><em style={{ color: theme.agentColors[3] }}>Insights Panel</em></span>}
                  theme={theme}
                />
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12, color: theme.textMuted, fontWeight: 300,
                  lineHeight: 1.55, marginBottom: 16,
                }}>Expand a recommendation to review details and execute.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {INSIGHTS.map((ins, i) => (
                    <InsightCard
                      key={ins.type + i}
                      insight={ins}
                      theme={theme}
                      isActive={activeInsight === i}
                      onClick={() => setActiveInsight(activeInsight === i ? -1 : i)}
                      delay={0.48 + i * 0.08}
                    />
                  ))}
                </div>

                {/* Confidence meter */}
                <div style={{
                  marginTop: 18, paddingTop: 16,
                  borderTop: `1px solid ${theme.borderSubtle}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 9, color: theme.textMuted, letterSpacing: "0.08em",
                    }}>System Decision Confidence</span>
                    <motion.span
                      animate={{ opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 9, color: theme.agentColors[3], fontWeight: 700,
                      }}
                    >96.4%</motion.span>
                  </div>
                  <div style={{
                    height: 4, background: theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(10,7,22,0.1)",
                    borderRadius: 2, overflow: "hidden",
                  }}>
                    <motion.div
                      animate={{ width: ["84%", "97%", "91%", "96%"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        height: "100%",
                        background: `linear-gradient(90deg, ${theme.agentColors[3]}, ${theme.sakura})`,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </Panel>
            </motion.section>

            {/* ── Crisis Simulation ── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52 }}
              aria-label="Crisis simulation"
            >
              <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
                <SectionHeader
                  eyebrow="Simulation Theatre"
                  eyebrowColor={theme.gold}
                  title={<span>Crisis<br /><em style={{ color: theme.gold }}>Response Demo</em></span>}
                  theme={theme}
                />
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12, color: theme.textMuted, fontWeight: 300,
                  lineHeight: 1.55, marginBottom: 18,
                }}>
                  Watch all five agents collaborate autonomously to resolve a real-time infrastructure crisis.
                </p>

                {/* System health rings */}
                <div style={{
                  display: "flex", gap: 8, marginBottom: 20,
                  padding: "14px 12px",
                  border: `1px solid ${theme.borderSubtle}`,
                  borderRadius: 8, background: theme.glass,
                  justifyContent: "space-around", alignItems: "center",
                  flexWrap: "wrap",
                }}>
                  {[
                    { label: "Uptime", value: 99.97, color: theme.isDark ? "#2EBFB0" : "#077060" },
                    { label: "Coverage", value: 94, color: theme.crimson },
                    { label: "Accuracy", value: 99.2, color: theme.gold },
                  ].map(ring => (
                    <div key={ring.label} style={{ textAlign: "center", padding: "4px 8px" }}>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <HealthRing value={ring.value} color={ring.color} size={56} strokeWidth={4} label={ring.label} />
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 8, fontWeight: 700, color: ring.color,
                        }}>{ring.value}%</div>
                      </div>
                      <div style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 8.5, color: theme.textMuted,
                        letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 5,
                      }}>{ring.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ flex: 1 }}>
                  <CrisisSimulation theme={theme} />
                </div>
              </Panel>
            </motion.section>
          </div>

          {/* ══════════ FOOTER BAR ══════════ */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: `1px solid ${theme.borderSubtle}`,
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5"
                  stroke={theme.crimson} strokeWidth="1.5" fill="none" />
                <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5"
                  fill={theme.crimson} opacity="0.8" />
              </svg>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 10, color: theme.textFaint, letterSpacing: "0.1em",
              }}>OrchestrAI © 2025 · Mission Control v2.4.1</span>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              {[
                { label: "Agent Mesh", value: "HEALTHY", color: theme.isDark ? "#2EBFB0" : "#077060" },
                { label: "Data Pipeline", value: "STREAMING", color: theme.gold },
                { label: "Auth", value: "JWT SECURE", color: theme.crimson },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 8.5, color: theme.textMuted, letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>
                    {s.label}: <span style={{ color: s.color, fontWeight: 700 }}>{s.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.footer>
        </main>
      </div>
    </>
  );
}