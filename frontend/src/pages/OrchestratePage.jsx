/**
 * OrchestrAI — OrchestratePage.jsx
 * Route: /orchestrate
 *
 * "The Room Where Decisions Happen"
 *
 * The flagship page. Where users instruct autonomous agents and watch
 * them execute in real time. Not a form. Not a dashboard. A command layer.
 *
 * Design: Japanese Futuristic Luxury × Mission Control
 * Inherits exact design language, theme system, typography, palette from all other pages.
 *
 * Global theme persisted via localStorage ("orchestrai-theme").
 */

import React, {
  useRef, useState, useEffect, useCallback, useMemo, Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════
   THEME SYSTEM — identical to all other pages
═══════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg: "#030208",
    bgGradient: "linear-gradient(160deg, #030208 0%, #0A0618 50%, #030208 100%)",
    surface: "rgba(14,10,26,0.8)",
    surfaceSolid: "#0E0A1A",
    glass: "rgba(255,255,255,0.035)",
    border: "rgba(196,0,43,0.22)",
    borderSubtle: "rgba(240,235,225,0.07)",
    borderGold: "rgba(191,140,44,0.28)",
    text: "#F0EBE1",
    textMuted: "rgba(240,235,225,0.48)",
    textFaint: "rgba(240,235,225,0.13)",
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
    isDark: true,
  },
  light: {
    bg: "#F0EBE1",
    bgGradient: "linear-gradient(160deg, #F0EBE1 0%, #E8E2D6 50%, #F0EBE1 100%)",
    surface: "rgba(235,228,218,0.85)",
    surfaceSolid: "#E8E1D4",
    glass: "rgba(10,7,22,0.04)",
    border: "rgba(184,0,38,0.18)",
    borderSubtle: "rgba(10,7,22,0.09)",
    borderGold: "rgba(168,120,32,0.3)",
    text: "#0A0716",
    textMuted: "rgba(10,7,22,0.5)",
    textFaint: "rgba(10,7,22,0.12)",
    crimson: "#B8002A",
    crimsonLight: "#D40030",
    crimsonGlow: "rgba(184,0,42,0.18)",
    crimsonGlowSoft: "rgba(184,0,42,0.06)",
    gold: "#A87820",
    goldGlow: "rgba(168,120,32,0.18)",
    goldLight: "#C4921A",
    sakura: "#B85470",
    sakuraGlow: "rgba(184,84,112,0.1)",
    plum: "#EBE4D8",
    agentColors: ["#B8002A", "#A87820", "#B85470", "#4A40B8", "#087870"],
    isDark: false,
  },
};

function hex2rgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
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
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W, H, petals, raf;
    const init = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      petals = Array.from({ length: 16 }, () => ({
        x: Math.random() * W, y: Math.random() * H - H,
        size: Math.random() * 5 + 3, speed: Math.random() * 0.4 + 0.12,
        wobble: Math.random() * Math.PI * 2, wobbleSpeed: Math.random() * 0.015 + 0.006,
        rotation: Math.random() * Math.PI * 2, rotSpeed: Math.random() * 0.018 - 0.009,
        opacity: Math.random() * 0.28 + 0.06,
      }));
    };
    init();
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const fill = isDark ? `rgba(232,160,176,0.5)` : `rgba(184,84,112,0.25)`;
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
        p.y += p.speed; p.wobble += p.wobbleSpeed; p.rotation += p.rotSpeed;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, [isDark]);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

/* ═══════════════════════════════════════════════════════
   3D: ORCHESTRATION CORE
   The beating intelligence lattice — central piece of the
   "Run Orchestration" button area. More dramatic than the
   Dashboard version — this is the flagship moment.
═══════════════════════════════════════════════════════ */
function OrchestrationCore({ isActive, agentCount = 5 }) {
  const outerRef = useRef();
  const midRef = useRef();
  const innerRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  const [pulseIntensity, setPulseIntensity] = useState(0.18);

  useEffect(() => {
    setPulseIntensity(isActive ? 1.4 : 0.18);
  }, [isActive]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speedMult = isActive ? 3.2 : 1.0;

    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.08 * speedMult;
      outerRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
    }
    if (midRef.current) {
      midRef.current.rotation.y = -t * 0.13 * speedMult;
      midRef.current.rotation.x = t * 0.07 * speedMult;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.26 * speedMult;
      innerRef.current.rotation.z = -t * 0.11 * speedMult;
      const pulse = 1 + Math.sin(t * (isActive ? 5.5 : 2.3)) * (isActive ? 0.18 : 0.07);
      innerRef.current.scale.setScalar(pulse);
    }
    if (ring1.current) { ring1.current.rotation.z = t * 0.1 * speedMult; }
    if (ring2.current) { ring2.current.rotation.x = t * 0.08 * speedMult; ring2.current.rotation.z = -t * 0.055 * speedMult; }
    if (ring3.current) { ring3.current.rotation.y = t * 0.065 * speedMult; ring3.current.rotation.x = -t * 0.045 * speedMult; }
  });

  return (
    <group>
      <group ref={outerRef}>
        <mesh>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive ? 0.55 : 0.18} metalness={0.9} roughness={0.06} transparent opacity={isActive ? 0.14 : 0.07} wireframe />
        </mesh>
      </group>
      <group ref={midRef}>
        <mesh>
          <dodecahedronGeometry args={[0.84, 0]} />
          <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={isActive ? 0.45 : 0.14} metalness={0.85} roughness={0.07} transparent opacity={isActive ? 0.16 : 0.09} wireframe />
        </mesh>
      </group>
      <group ref={innerRef}>
        <mesh>
          <octahedronGeometry args={[0.44, 0]} />
          <meshStandardMaterial color="#F0EBE1" emissive="#BF8C2C" emissiveIntensity={isActive ? 2.8 : 1.4} metalness={1.0} roughness={0.0} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive ? 3.2 : 1.8} metalness={0.9} roughness={0.0} />
        </mesh>
      </group>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.38, 0.009, 8, 128]} />
        <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive ? 1.2 : 0.6} transparent opacity={isActive ? 0.65 : 0.35} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2 + 0.9, 0.4, 0]}>
        <torusGeometry args={[1.58, 0.006, 8, 128]} />
        <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={isActive ? 1.0 : 0.5} transparent opacity={isActive ? 0.42 : 0.22} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 2 - 0.6, -0.5, 0.2]}>
        <torusGeometry args={[1.76, 0.005, 8, 128]} />
        <meshStandardMaterial color="#E8A0B0" emissive="#E8A0B0" emissiveIntensity={isActive ? 0.9 : 0.4} transparent opacity={isActive ? 0.35 : 0.18} />
      </mesh>
      <CorePulse isActive={isActive} />
      <Sparkles count={isActive ? 140 : 70} scale={4.8} size={0.42} speed={isActive ? 0.6 : 0.22} color="#BF8C2C" opacity={isActive ? 0.85 : 0.5} />
      <Sparkles count={isActive ? 80 : 40} scale={3.2} size={0.28} speed={isActive ? 0.5 : 0.3} color="#E8A0B0" opacity={isActive ? 0.7 : 0.38} />
      <Sparkles count={isActive ? 50 : 20} scale={2.0} size={0.2} speed={isActive ? 0.7 : 0.4} color="#C4002B" opacity={isActive ? 0.6 : 0.28} />
      <pointLight position={[4, 3, 3]} color="#C4002B" intensity={isActive ? 10 : 5} distance={10} decay={2} />
      <pointLight position={[-4, -2, -3]} color="#BF8C2C" intensity={isActive ? 7 : 3.5} distance={10} decay={2} />
      <pointLight position={[0, 4, -4]} color="#E8A0B0" intensity={isActive ? 5 : 2.5} distance={10} decay={2} />
      <ambientLight intensity={0.18} color="#1a0a2e" />
    </group>
  );
}

function CorePulse({ isActive }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const beat = Math.max(0, Math.sin(t * (isActive ? 3.5 : 1.7)));
    if (ref.current) {
      ref.current.scale.setScalar(1 + beat * (isActive ? 1.1 : 0.55));
      ref.current.material.opacity = beat * (isActive ? 0.28 : 0.12);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.65, 16, 16]} />
      <meshStandardMaterial color="#C4002B" transparent opacity={0} side={THREE.BackSide} />
    </mesh>
  );
}

function CoreScene3D({ isActive }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 5.5], fov: 38 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <Float speed={isActive ? 2.8 : 1.2} rotationIntensity={isActive ? 0.55 : 0.22} floatIntensity={isActive ? 0.7 : 0.32}>
          <OrchestrationCore isActive={isActive} />
        </Float>
      </Suspense>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════
   LIVE AGENT NETWORK SVG — interactive pentagonal mesh
═══════════════════════════════════════════════════════ */
const AGENT_DEFS = [
  { id: "allocation",    label: "Allocation",   icon: "◈", x: 50, y: 10,  role: "Resource Allocation",  color: "#C4002B" },
  { id: "risk",          label: "Risk",          icon: "⬡", x: 89, y: 40,  role: "Threat Intelligence",  color: "#BF8C2C" },
  { id: "operations",    label: "Operations",    icon: "⟁", x: 73, y: 82,  role: "Orchestration",        color: "#E8A0B0" },
  { id: "intelligence",  label: "Intelligence",  icon: "◬", x: 27, y: 82,  role: "Decision Engine",      color: "#7C6FE8" },
  { id: "communication", label: "Comm",          icon: "◫", x: 11, y: 40,  role: "Stakeholder Comms",    color: "#2EBFB0" },
];

const AGENT_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],[4,0],
  [0,2],[1,3],[2,4],[3,0],[4,1],
];

function LiveAgentNetwork({ theme, agentStatuses, isOrchestrating, onAgentSelect, selectedAgent }) {
  const [packets, setPackets] = useState([]);

  useEffect(() => {
    const rate = isOrchestrating ? 200 : 550;
    const iv = setInterval(() => {
      const conn = AGENT_CONNECTIONS[Math.floor(Math.random() * AGENT_CONNECTIONS.length)];
      setPackets(p => [...p.slice(-isOrchestrating ? 28 : 14), {
        id: Date.now() + Math.random(),
        from: conn[0], to: conn[1],
        progress: 0,
        color: AGENT_DEFS[conn[0]].color,
      }]);
    }, rate);
    return () => clearInterval(iv);
  }, [isOrchestrating]);

  useEffect(() => {
    let raf;
    const tick = () => {
      setPackets(prev => prev.map(p => ({ ...p, progress: p.progress + (isOrchestrating ? 0.022 : 0.013) })).filter(p => p.progress < 1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isOrchestrating]);

  const lerp = (a, b, t) => a + (b - a) * t;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          {AGENT_DEFS.map(a => (
            <radialGradient key={a.id} id={`orch-glow-${a.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={a.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={a.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Central orchestration ring */}
        <circle cx="50" cy="47" r="16" fill="none" stroke={theme.crimson} strokeWidth="0.2" strokeDasharray="1 3" opacity={isOrchestrating ? 0.55 : 0.2}>
          {isOrchestrating && (
            <animateTransform attributeName="transform" type="rotate" from="0 50 47" to="360 50 47" dur="6s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="50" cy="47" r="9" fill="none" stroke={theme.gold} strokeWidth="0.15" strokeDasharray="2 4" opacity={isOrchestrating ? 0.45 : 0.15}>
          {isOrchestrating && (
            <animateTransform attributeName="transform" type="rotate" from="360 50 47" to="0 50 47" dur="4s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Connection lines */}
        {AGENT_CONNECTIONS.map(([fi, ti], ci) => {
          const f = AGENT_DEFS[fi]; const t = AGENT_DEFS[ti];
          return (
            <line key={ci} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke={isOrchestrating ? f.color : theme.textFaint}
              strokeWidth={isOrchestrating ? "0.5" : "0.3"}
              strokeDasharray={isOrchestrating ? "none" : "1 2"}
              opacity={isOrchestrating ? 0.35 : 0.22}
              style={{ transition: "all 0.8s ease" }}
            />
          );
        })}

        {/* Data packets */}
        {packets.map(p => {
          const from = AGENT_DEFS[p.from]; const to = AGENT_DEFS[p.to];
          const px = lerp(from.x, to.x, p.progress);
          const py = lerp(from.y, to.y, p.progress);
          return (
            <circle key={p.id} cx={px} cy={py} r={isOrchestrating ? "1.1" : "0.75"}
              fill={p.color} opacity={Math.sin(p.progress * Math.PI) * (isOrchestrating ? 1 : 0.8)} />
          );
        })}

        {/* Orchestration core glow */}
        {isOrchestrating && (
          <circle cx="50" cy="47" r="5" fill="rgba(196,0,43,0.08)">
            <animate attributeName="r" values="4;7;4" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.25;0.1" dur="1.8s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Agent nodes */}
        {AGENT_DEFS.map((agent, i) => {
          const status = agentStatuses?.[i] || "STANDBY";
          const isSelected = selectedAgent === i;
          const isActive = ["ACTIVE", "ALERT", "PROCESSING"].includes(status);
          const nodeR = isSelected ? 5.5 : 3.8;
          const glowR = isSelected ? 11 : 7;

          return (
            <g key={agent.id} onClick={() => onAgentSelect(isSelected ? null : i)} style={{ cursor: "pointer" }}>
              <circle cx={agent.x} cy={agent.y} r={glowR} fill={`url(#orch-glow-${agent.id})`}
                opacity={isActive || isOrchestrating ? (isSelected ? 1 : 0.6) : 0.22}>
                {(isActive || isOrchestrating) && (
                  <animate attributeName="r" values={`${glowR * 0.9};${glowR * 1.25};${glowR * 0.9}`} dur={`${2.2 + i * 0.3}s`} repeatCount="indefinite" />
                )}
              </circle>

              <circle cx={agent.x} cy={agent.y} r={nodeR}
                fill={`rgba(${hex2rgb(agent.color)},${isSelected ? 0.28 : isActive ? 0.14 : 0.08})`}
                stroke={agent.color}
                strokeWidth={isSelected ? 1.0 : 0.6}
                opacity={isActive || isOrchestrating ? 1 : 0.45}
                style={{ transition: "all 0.4s ease" }}
              />

              {/* Alert ring for active agents during orchestration */}
              {isOrchestrating && isActive && (
                <circle cx={agent.x} cy={agent.y} r={nodeR} fill="none" stroke={agent.color} strokeWidth="0.5" opacity="0.4">
                  <animate attributeName="r" values={`${nodeR};${nodeR * 1.8};${nodeR}`} dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}

              <text x={agent.x} y={agent.y + 1.3} textAnchor="middle" dominantBaseline="middle"
                fontSize={isSelected ? "4.8" : "3.8"} fill={agent.color}
                style={{ fontFamily: "monospace", pointerEvents: "none", transition: "font-size 0.3s" }}>
                {agent.icon}
              </text>
              <text x={agent.x} y={agent.y + (agent.y > 50 ? 8.5 : -6.5)} textAnchor="middle"
                fontSize="2.6" fill={theme.textMuted}
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
   NAVBAR
═══════════════════════════════════════════════════════ */
function Nav({ isDark, toggleTheme, theme }) {
  const navigate = useNavigate();
  const navItems = [
    { label: "Overview",  path: "/dashboard" },
    { label: "Missions",  path: "/missions" },
    { label: "Agents",    path: "/agents" },
    { label: "Orchestrate", path: "/orchestrate" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 58, display: "flex", alignItems: "center",
        padding: "0 clamp(16px, 4vw, 56px)",
        justifyContent: "space-between",
        background: isDark ? "rgba(3,2,8,0.92)" : "rgba(240,235,225,0.92)",
        backdropFilter: "blur(24px) saturate(1.8)",
        borderBottom: `1px solid ${theme.borderSubtle}`,
      }}
    >
      <button onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
        <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.85" />
          <circle cx="15" cy="15" r="2.5" fill="#F0EBE1" />
        </svg>
        <div>
          <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 17, fontWeight: 600, color: theme.text }}>
            Orchestr<span style={{ color: theme.crimson, fontStyle: "italic" }}>AI</span>
          </span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.2em", textTransform: "uppercase", marginLeft: 10 }}>Mission Control</span>
        </div>
      </button>

      <div style={{ display: "flex", gap: 2 }} className="orch-nav-tabs">
        {navItems.map(item => (
          <button key={item.label} onClick={() => navigate(item.path)}
            style={{
              padding: "6px 16px",
              background: item.path === "/orchestrate" ? `rgba(${hex2rgb(theme.crimson)},0.12)` : "transparent",
              border: "none", borderRadius: 5,
              color: item.path === "/orchestrate" ? theme.crimson : theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
              fontWeight: item.path === "/orchestrate" ? 600 : 400,
              cursor: "pointer", transition: "all 0.2s",
            }}>{item.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: theme.crimson }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.crimson, letterSpacing: "0.12em", fontWeight: 600 }}>LIVE</span>
        </div>
        <button onClick={toggleTheme} aria-label="Toggle theme"
          style={{ width: 38, height: 20, borderRadius: 10, background: isDark ? theme.crimson : theme.textFaint, border: "none", cursor: "pointer", position: "relative", transition: "background 0.35s", outline: "none" }}>
          <motion.div animate={{ x: isDark ? 19 : 2 }} transition={{ type: "spring", stiffness: 340, damping: 32 }}
            style={{ width: 16, height: 16, borderRadius: "50%", background: isDark ? "#F0EBE1" : "#0A0716", position: "absolute", top: 2 }} />
        </button>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════
   REUSABLE: PANEL WRAPPER
═══════════════════════════════════════════════════════ */
function Panel({ children, style = {}, theme }) {
  return (
    <div style={{
      border: `1px solid ${theme.borderSubtle}`,
      borderRadius: 12,
      background: theme.surface,
      backdropFilter: "blur(24px) saturate(1.6)",
      WebkitBackdropFilter: "blur(24px) saturate(1.6)",
      padding: "24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ eyebrow, eyebrowColor, theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 18, height: 1.5, background: eyebrowColor || theme.crimson }} />
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.22em", color: eyebrowColor || theme.crimson, textTransform: "uppercase", fontWeight: 500 }}>
        {eyebrow}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 1: MISSION COMMAND HEADER
═══════════════════════════════════════════════════════ */
function MissionCommandHeader({ theme, missionStatus }) {
  const statusItems = [
    { label: "Mission Status",   value: missionStatus?.status || "CONFIGURING",   color: theme.crimson },
    { label: "Active Agents",    value: `${missionStatus?.activeAgents || 0} / 5`, color: theme.gold },
    { label: "Priority",         value: missionStatus?.priority || "STANDARD",     color: theme.sakura },
    { label: "Est. Impact",      value: missionStatus?.impact || "—",              color: "#2EBFB0" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      style={{
        paddingTop: "clamp(22px, 3vw, 38px)",
        paddingBottom: "clamp(22px, 2.5vw, 30px)",
        borderBottom: `1px solid ${theme.borderSubtle}`,
        marginBottom: "clamp(20px, 2.5vw, 28px)",
        position: "relative",
      }}
    >
      {/* Eyebrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 24, height: 1.5, background: theme.crimson }} />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.28em", color: theme.crimson, textTransform: "uppercase", fontWeight: 500 }}>
          OrchestrAI · Command Interface
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }} className="orch-hero-grid">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(36px, 5vw, 70px)", fontWeight: 400, lineHeight: 1.0, color: theme.text, margin: "0 0 6px" }}>
            Orchestrate
          </h1>
          <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(36px, 5vw, 70px)", fontWeight: 700, fontStyle: "italic", lineHeight: 1.0, color: theme.crimson, margin: "0 0 16px" }}>
            Operation
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: theme.textMuted, fontWeight: 300, lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
            Configure mission parameters and release the autonomous agent mesh. Five intelligences will coordinate, decide, and execute without further instruction.
          </p>
        </div>

        {/* Status grid — right column */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, minWidth: 280 }} className="orch-status-grid">
          {statusItems.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              style={{
                padding: "14px 16px",
                border: `1px solid ${theme.borderSubtle}`,
                borderRadius: 8,
                background: theme.glass,
                backdropFilter: "blur(14px)",
                position: "relative", overflow: "hidden",
              }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, opacity: 0.55 }} />
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 5 }}>{s.value}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 2: AI MISSION BUILDER
   NOT a form — an intelligent operation configurator
═══════════════════════════════════════════════════════ */
const REGION_OPTIONS = [
  "North India", "South India", "East India", "West India",
  "Central India", "Northeast", "All Regions",
];

const OBJECTIVE_PRESETS = [
  { icon: "◈", label: "Minimize candidate travel burden",       color: "#C4002B" },
  { icon: "⬡", label: "Maximize center utilization",           color: "#BF8C2C" },
  { icon: "⟁", label: "Reduce weather & infrastructure risk",  color: "#E8A0B0" },
  { icon: "◬", label: "Optimize proctor-to-candidate ratio",   color: "#7C6FE8" },
  { icon: "◫", label: "Ensure accessibility compliance",       color: "#2EBFB0" },
];

const CONSTRAINT_OPTIONS = [
  { label: "No center reuse within 48hr",   default: true },
  { label: "Maintain 15% buffer capacity",  default: true },
  { label: "Require backup node assignment", default: false },
  { label: "Prioritize urban centers",       default: false },
  { label: "Lock staffing assignments",      default: false },
];

function MissionBuilder({ theme, config, onChange }) {
  const [activeObjectives, setActiveObjectives] = useState([0, 2]);
  const [activeConstraints, setActiveConstraints] = useState([0, 1]);
  const [selectedRegions, setSelectedRegions] = useState(["All Regions"]);

  const toggleObjective = (i) => {
    setActiveObjectives(prev => {
      const next = prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i];
      onChange({ ...config, objectives: next.map(x => OBJECTIVE_PRESETS[x].label) });
      return next;
    });
  };

  const toggleConstraint = (i) => {
    setActiveConstraints(prev => {
      const next = prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i];
      onChange({ ...config, constraints: next.map(x => CONSTRAINT_OPTIONS[x].label) });
      return next;
    });
  };

  const toggleRegion = (r) => {
    setSelectedRegions(prev => {
      let next;
      if (r === "All Regions") {
        next = ["All Regions"];
      } else {
        const filtered = prev.filter(x => x !== "All Regions");
        next = filtered.includes(r) ? filtered.filter(x => x !== r) : [...filtered, r];
        if (next.length === 0) next = ["All Regions"];
      }
      onChange({ ...config, regions: next });
      return next;
    });
  };

  return (
    <Panel theme={theme} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <SectionLabel eyebrow="Mission Configuration" eyebrowColor={theme.gold} theme={theme} />
      <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 6px" }}>
        Define the <em style={{ color: theme.gold }}>Operation</em>
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: theme.textMuted, fontWeight: 300, lineHeight: 1.6, margin: "0 0 22px" }}>
        Set parameters once. The agent mesh handles execution autonomously.
      </p>

      {/* Mission identity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }} className="orch-builder-row">
        {[
          { label: "Mission Name",      key: "name",      placeholder: "e.g. NEET 2027 Main Operation", type: "text" },
          { label: "Candidate Count",   key: "candidates", placeholder: "e.g. 2,300,000",              type: "text" },
        ].map(field => (
          <div key={field.key}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 7 }}>
              {field.label}
            </div>
            <input
              type={field.type}
              value={config[field.key] || ""}
              onChange={e => onChange({ ...config, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              style={{
                width: "100%", padding: "11px 14px",
                background: theme.glass,
                border: `1px solid ${theme.borderSubtle}`,
                borderRadius: 7, color: theme.text,
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 300,
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = theme.gold + "66"}
              onBlur={e => e.target.style.borderColor = theme.borderSubtle}
            />
          </div>
        ))}
      </div>

      {/* Regions */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 9 }}>
          Deployment Regions
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {REGION_OPTIONS.map(r => {
            const active = selectedRegions.includes(r);
            return (
              <button key={r} onClick={() => toggleRegion(r)}
                style={{
                  padding: "7px 13px",
                  border: `1px solid ${active ? theme.gold + "55" : theme.borderSubtle}`,
                  borderRadius: 6,
                  background: active ? `rgba(${hex2rgb(theme.gold)},0.1)` : "transparent",
                  color: active ? theme.gold : theme.textMuted,
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
                  fontWeight: active ? 600 : 400, letterSpacing: "0.06em",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Centers */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 7 }}>
          Available Centers
        </div>
        <input
          type="text"
          value={config.centers || ""}
          onChange={e => onChange({ ...config, centers: e.target.value })}
          placeholder="e.g. 4820 (leave blank to auto-discover)"
          style={{
            width: "100%", padding: "11px 14px",
            background: theme.glass, border: `1px solid ${theme.borderSubtle}`,
            borderRadius: 7, color: theme.text,
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 300,
            outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = theme.gold + "66"}
          onBlur={e => e.target.style.borderColor = theme.borderSubtle}
        />
      </div>

      {/* Objectives */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 9 }}>
          Primary Objectives
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {OBJECTIVE_PRESETS.map((obj, i) => {
            const active = activeObjectives.includes(i);
            return (
              <motion.button key={i} onClick={() => toggleObjective(i)} whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  border: `1px solid ${active ? obj.color + "44" : theme.borderSubtle}`,
                  borderRadius: 7,
                  background: active ? `rgba(${hex2rgb(obj.color)},0.07)` : "transparent",
                  cursor: "pointer", transition: "all 0.22s", textAlign: "left",
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${active ? obj.color : theme.textFaint}`,
                  background: active ? `rgba(${hex2rgb(obj.color)},0.18)` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.22s",
                }}>
                  {active && <span style={{ fontSize: 8, color: obj.color }}>✓</span>}
                </div>
                <span style={{ fontSize: 9, color: obj.color, fontFamily: "monospace" }}>{obj.icon}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: active ? theme.text : theme.textMuted, fontWeight: active ? 500 : 400 }}>
                  {obj.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Constraints */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 9 }}>
          Operational Constraints
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {CONSTRAINT_OPTIONS.map((c, i) => {
            const active = activeConstraints.includes(i);
            return (
              <button key={i} onClick={() => toggleConstraint(i)}
                style={{
                  padding: "7px 13px",
                  border: `1px solid ${active ? theme.sakura + "55" : theme.borderSubtle}`,
                  borderRadius: 6,
                  background: active ? `rgba(${hex2rgb(theme.sakura)},0.08)` : "transparent",
                  color: active ? theme.sakura : theme.textMuted,
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
                  fontWeight: active ? 600 : 400, letterSpacing: "0.06em",
                  cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                }}>
                {active ? "✓ " : ""}{c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Special instructions */}
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 7 }}>
          Special Instructions
        </div>
        <textarea
          value={config.instructions || ""}
          onChange={e => onChange({ ...config, instructions: e.target.value })}
          placeholder="Describe any mission-specific requirements, edge cases, or context the agents should account for…"
          rows={3}
          style={{
            width: "100%", padding: "12px 14px",
            background: theme.glass, border: `1px solid ${theme.borderSubtle}`,
            borderRadius: 7, color: theme.text, resize: "none", outline: "none",
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 300,
            lineHeight: 1.6, transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = theme.crimson + "66"}
          onBlur={e => e.target.style.borderColor = theme.borderSubtle}
        />
      </div>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 3: LIVE AGENT NETWORK PANEL
═══════════════════════════════════════════════════════ */
function AgentNetworkPanel({ theme, isOrchestrating, agentStatuses, agentActions }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const selectedDef = selectedAgent !== null ? AGENT_DEFS[selectedAgent] : null;

  return (
    <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <SectionLabel eyebrow="Live Agent Network" eyebrowColor={theme.crimson} theme={theme} />
          <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 14px" }}>
            Intelligence <em style={{ color: theme.crimson }}>Mesh</em>
          </h2>
        </div>
        {isOrchestrating && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: `1px solid ${theme.crimson}44`, borderRadius: 6, background: `rgba(${hex2rgb(theme.crimson)},0.08)` }}>
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: theme.crimson }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.crimson, letterSpacing: "0.16em", fontWeight: 700 }}>ORCHESTRATING</span>
          </motion.div>
        )}
      </div>

      {/* Network visualization */}
      <div style={{ height: 280, margin: "0 -4px", position: "relative", flexShrink: 0 }}>
        <LiveAgentNetwork
          theme={theme}
          agentStatuses={agentStatuses}
          isOrchestrating={isOrchestrating}
          onAgentSelect={setSelectedAgent}
          selectedAgent={selectedAgent}
        />
        {/* Confidence indicators overlay */}
        {agentStatuses && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "0 4px" }}>
            {AGENT_DEFS.map((a, i) => {
              const conf = agentStatuses[i] === "ACTIVE" ? 94 + Math.floor(Math.random() * 6) : 72;
              return (
                <div key={a.id} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, fontWeight: 700, color: a.color, lineHeight: 1 }}>
                    {agentStatuses[i] === "ACTIVE" ? conf + "%" : agentStatuses[i] === "STANDBY" ? "—" : conf + "%"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent selector detail */}
      <AnimatePresence mode="wait">
        {selectedDef ? (
          <motion.div key={selectedDef.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              marginTop: 14, padding: "14px 16px",
              border: `1px solid ${selectedDef.color}44`,
              borderRadius: 8,
              background: `rgba(${hex2rgb(selectedDef.color)},0.06)`,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 20, color: selectedDef.color }}>{selectedDef.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 700, color: selectedDef.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{selectedDef.label} Agent</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textMuted }}>{selectedDef.role}</div>
              </div>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5,
                color: agentStatuses?.[selectedAgent] === "ACTIVE" ? "#2EBFB0" : theme.textFaint,
                background: `rgba(${hex2rgb(agentStatuses?.[selectedAgent] === "ACTIVE" ? "#2EBFB0" : theme.textFaint.replace("rgba(","").split(",")[0])},0.1)`,
                padding: "3px 8px", borderRadius: 4, fontWeight: 700, letterSpacing: "0.1em",
              }}>{agentStatuses?.[selectedAgent] || "STANDBY"}</span>
            </div>
            {agentActions?.[selectedAgent] && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textMuted, fontWeight: 300, margin: 0, lineHeight: 1.5 }}>
                {agentActions[selectedAgent]}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ marginTop: 14, padding: "10px 16px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, textAlign: "center" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em" }}>
              SELECT AN AGENT NODE TO INSPECT
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 4: RUN ORCHESTRATION — the centrepiece moment
═══════════════════════════════════════════════════════ */
function RunOrchestration({ theme, isOrchestrating, onRun, config }) {
  const [hovered, setHovered] = useState(false);
  const canRun = !isOrchestrating;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "clamp(28px, 4vw, 48px) clamp(16px, 3vw, 32px)",
      position: "relative",
    }}>
      {/* Background radial */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: isOrchestrating
          ? `radial-gradient(ellipse at 50% 50%, rgba(${hex2rgb(theme.crimson)},0.22) 0%, rgba(${hex2rgb(theme.gold)},0.1) 35%, transparent 65%)`
          : `radial-gradient(ellipse at 50% 50%, rgba(${hex2rgb(theme.crimson)},0.07) 0%, transparent 65%)`,
        transition: "all 1.2s ease",
      }} />

      {/* 3D core */}
      <div style={{ width: "min(340px, 100%)", height: "min(340px, 100vw)", marginBottom: 8, position: "relative", flexShrink: 0 }}>
        <CoreScene3D isActive={isOrchestrating} />

        {/* Status overlay on the 3D */}
        {isOrchestrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
              color: theme.crimson, letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: 700, textAlign: "center", whiteSpace: "nowrap",
              background: `rgba(${hex2rgb(theme.bg)},0.7)`,
              backdropFilter: "blur(8px)",
              padding: "5px 14px", borderRadius: 20,
              border: `1px solid ${theme.crimson}33`,
            }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
              ● AGENTS EXECUTING
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* The main action button */}
      <div style={{ position: "relative", marginBottom: 18, width: "100%", maxWidth: 340 }}>
        {/* Outer pulse ring when active */}
        {isOrchestrating && (
          <motion.div
            style={{
              position: "absolute", inset: -12, borderRadius: 16,
              border: `1px solid ${theme.crimson}`,
              pointerEvents: "none",
            }}
            animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <motion.button
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          whileHover={canRun ? { scale: 1.03, boxShadow: `0 16px 64px ${theme.crimsonGlow}, 0 4px 0 ${theme.crimsonLight}44` } : {}}
          whileTap={canRun ? { scale: 0.97 } : {}}
          onClick={canRun ? onRun : undefined}
          style={{
            width: "100%", padding: "18px 28px",
            background: isOrchestrating
              ? `linear-gradient(135deg, rgba(${hex2rgb(theme.crimson)},0.45), rgba(${hex2rgb(theme.gold)},0.3))`
              : hovered
                ? `linear-gradient(135deg, ${theme.crimson}, rgba(${hex2rgb(theme.crimson)},0.85))`
                : theme.crimson,
            border: isOrchestrating ? `1px solid ${theme.crimson}55` : "none",
            borderRadius: 10, color: "#F0EBE1",
            fontFamily: "'Cormorant Garant', serif",
            fontSize: 20, fontWeight: 700, fontStyle: "italic",
            letterSpacing: "0.04em",
            cursor: isOrchestrating ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Shimmer effect on hover */}
          {hovered && canRun && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "200%", opacity: 0.25 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              style={{
                position: "absolute", top: 0, bottom: 0, width: "50%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                pointerEvents: "none",
              }}
            />
          )}
          {isOrchestrating ? (
            <>
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block", fontSize: 18 }}>⟳</motion.span>
              Agents Executing…
            </>
          ) : (
            <>
              <span style={{ fontSize: 18, opacity: 0.9 }}>◈</span>
              Begin Orchestration
            </>
          )}
        </motion.button>
      </div>

      {/* Sub-action row */}
      {!isOrchestrating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ display: "flex", gap: 10, width: "100%", maxWidth: 340 }}>
          {["Dry Run", "Schedule"].map((label) => (
            <button key={label} style={{
              flex: 1, padding: "9px 12px",
              background: "transparent",
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: 7, color: theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
              fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.gold + "55"; e.currentTarget.style.color = theme.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.borderSubtle; e.currentTarget.style.color = theme.textMuted; }}>
              {label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Config summary */}
      {(config.name || config.candidates) && !isOrchestrating && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 18, padding: "14px 18px",
            border: `1px solid ${theme.borderGold}`,
            borderRadius: 8,
            background: `rgba(${hex2rgb(theme.gold)},0.04)`,
            width: "100%", maxWidth: 340,
          }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
            Mission Preview
          </div>
          {config.name && (
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 18, fontWeight: 600, color: theme.text, lineHeight: 1.1, marginBottom: 4 }}>
              {config.name}
            </div>
          )}
          {config.candidates && (
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted }}>
              {config.candidates} candidates · {config.regions?.join(", ") || "All Regions"}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 5: AGENT EXECUTION STREAM
   Operational feed — NOT a chat
═══════════════════════════════════════════════════════ */

const STREAM_POOL = [
  { agent: "Risk",         icon: "⬡", color: "#BF8C2C", msg: "Detected capacity pressure at Zone 7 · threshold exceeded · protocol armed", level: "WARN" },
  { agent: "Allocation",   icon: "◈", color: "#C4002B", msg: `Optimal center mesh computed · ${Math.floor(Math.random()*200+80)} resources reallocated across network`, level: "INFO" },
  { agent: "Intelligence", icon: "◬", color: "#7C6FE8", msg: "Strategy confidence elevated to 97.4% · executing primary recommendation", level: "REC" },
  { agent: "Operations",   icon: "⟁", color: "#E8A0B0", msg: `${Math.floor(Math.random()*30+20)} dependent tasks sequenced · zero conflicts detected in execution chain`, level: "INFO" },
  { agent: "Communication",icon: "◫", color: "#2EBFB0", msg: `Alert batch prepared · ${(Math.floor(Math.random()*5000+1000)).toLocaleString()} recipients · 99.2% expected delivery`, level: "INFO" },
  { agent: "Risk",         icon: "⬡", color: "#BF8C2C", msg: "NH-48 congestion probability rising to 78% · rerouting 6 transport corridors", level: "WARN" },
  { agent: "Intelligence", icon: "◬", color: "#7C6FE8", msg: "Historical pattern match: 2019 incident · Protocol Delta engaged autonomously", level: "REC" },
  { agent: "Allocation",   icon: "◈", color: "#C4002B", msg: "Center B12 reserved as backup node · capacity confirmed at 2,800", level: "INFO" },
  { agent: "Operations",   icon: "⟁", color: "#E8A0B0", msg: "Proctor mesh rebalanced · 147 reassignments executed · SLA maintained", level: "INFO" },
  { agent: "Communication",icon: "◫", color: "#2EBFB0", msg: "Coordinator briefing dispatched · 94 senior staff notified in 3 languages", level: "INFO" },
];

function AgentExecutionStream({ theme, isOrchestrating, streamEntries }) {
  const scrollRef = useRef();
  const [localEntries, setLocalEntries] = useState([]);
  const poolIdxRef = useRef(0);

  useEffect(() => {
    if (!isOrchestrating) return;
    const iv = setInterval(() => {
      const entry = STREAM_POOL[poolIdxRef.current % STREAM_POOL.length];
      const now = new Date();
      const time = `${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      setLocalEntries(prev => [...prev.slice(-30), { ...entry, id: Date.now() + Math.random(), time }]);
      poolIdxRef.current++;
    }, 900);
    return () => clearInterval(iv);
  }, [isOrchestrating]);

  useEffect(() => {
    if (!isOrchestrating) { setLocalEntries([]); poolIdxRef.current = 0; }
  }, [isOrchestrating]);

  const allEntries = [...(streamEntries || []), ...localEntries];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [allEntries.length]);

  const levelColor = { WARN: theme.gold, INFO: theme.textMuted, REC: "#7C6FE8" };

  return (
    <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <SectionLabel eyebrow="Agent Execution Stream" eyebrowColor={theme.sakura} theme={theme} />
          <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: 0 }}>
            Operational <em style={{ color: theme.sakura }}>Feed</em>
          </h2>
        </div>
        {isOrchestrating && (
          <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.crimson, letterSpacing: "0.18em" }}>STREAMING</span>
          </motion.div>
        )}
      </div>

      {/* Timeline feed */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 280, maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {allEntries.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.35 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: theme.textFaint, marginBottom: 10, fontFamily: "monospace" }}>◈</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Awaiting mission launch
              </div>
            </div>
          </div>
        ) : (
          allEntries.map((entry, i) => (
            <motion.div key={entry.id}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "9px 12px", borderRadius: 6,
                background: i === allEntries.length - 1 ? `rgba(${hex2rgb(entry.color)},0.06)` : "transparent",
                borderLeft: `2px solid ${i === allEntries.length - 1 ? entry.color : "transparent"}`,
                transition: "background 0.3s",
              }}>
              {/* Timeline dot */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${entry.color}`, background: i === allEntries.length - 1 ? entry.color : "transparent", flexShrink: 0 }} />
                {i < allEntries.length - 1 && <div style={{ width: 1, height: "calc(100% + 2px)", background: theme.textFaint, marginTop: 2, opacity: 0.3 }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: entry.color, lineHeight: "14px", flexShrink: 0, fontFamily: "monospace" }}>{entry.icon}</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, fontWeight: 600, color: entry.color, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>{entry.agent}</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: levelColor[entry.level] || theme.textFaint, background: `rgba(${hex2rgb(entry.color)},0.08)`, padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>{entry.level}</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, marginLeft: "auto", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{entry.time}</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.5, margin: 0 }}>{entry.msg}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 6: DECISION ENGINE
   Elegant visualizations of AI outputs
═══════════════════════════════════════════════════════ */
function DecisionEngine({ theme, isOrchestrating, decisionData }) {
  const metrics = [
    { label: "Recommendations", value: decisionData?.recommendations ?? "—",  color: theme.crimson,        icon: "◬" },
    { label: "Predicted Impact", value: decisionData?.impact ?? "—",          color: theme.gold,           icon: "⟁" },
    { label: "Risk Reduction",   value: decisionData?.riskReduction ?? "—",   color: "#2EBFB0",            icon: "⬡" },
    { label: "Resource Savings", value: decisionData?.resourceSavings ?? "—", color: theme.sakura,         icon: "◫" },
    { label: "Travel Burden ↓",  value: decisionData?.travelReduction ?? "—", color: theme.agentColors[3], icon: "◈" },
    { label: "Confidence Score", value: decisionData?.confidence ?? "—",      color: theme.gold,           icon: "◬" },
  ];

  return (
    <Panel theme={theme}>
      <SectionLabel eyebrow="Decision Engine" eyebrowColor={theme.agentColors[3]} theme={theme} />
      <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 18px" }}>
        Agent <em style={{ color: theme.agentColors[3] }}>Recommendations</em>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }} className="orch-decision-grid">
        {metrics.map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: isOrchestrating ? 1 : 0.35, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              padding: "16px 14px",
              border: `1px solid ${isOrchestrating ? m.color + "33" : theme.borderSubtle}`,
              borderRadius: 8,
              background: isOrchestrating ? `rgba(${hex2rgb(m.color)},0.05)` : theme.glass,
              transition: "all 0.6s ease",
              position: "relative", overflow: "hidden",
            }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${m.color}, transparent)`, opacity: isOrchestrating ? 0.65 : 0.2, transition: "opacity 0.6s" }} />
            <div style={{ fontFamily: "monospace", fontSize: 13, color: m.color, marginBottom: 7, opacity: isOrchestrating ? 1 : 0.35 }}>{m.icon}</div>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: 5 }}>
              {m.value}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Confidence bar */}
      {decisionData?.confidence && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.08em" }}>System-wide Decision Confidence</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.gold, fontWeight: 700 }}>{decisionData.confidence}</span>
          </div>
          <div style={{ height: 4, background: theme.textFaint, borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: decisionData.confidence }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${theme.crimson}, ${theme.gold})`, borderRadius: 2 }}
            />
          </div>
        </div>
      )}

      {!isOrchestrating && !decisionData?.confidence && (
        <div style={{ padding: "20px", border: `1px dashed ${theme.borderSubtle}`, borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Decision outputs appear here after orchestration begins
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 7: FINAL RESOLUTION SUMMARY
═══════════════════════════════════════════════════════ */
function FinalResolution({ theme, isComplete, decisionData, config }) {
  if (!isComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Panel theme={theme} style={{ position: "relative", overflow: "hidden" }}>
        {/* Ceremonial top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${theme.crimson}, ${theme.gold}, ${theme.sakura}, #7C6FE8, #2EBFB0)`,
        }} />

        <SectionLabel eyebrow="Mission Resolution" eyebrowColor="#2EBFB0" theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(24px, 2.8vw, 38px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 6px" }}>
          Autonomous <em style={{ color: "#2EBFB0" }}>Resolution Complete</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.textMuted, fontWeight: 300, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 600 }}>
          Five agents coordinated, decided, and executed without a single human bottleneck.
          The operation is now active.
        </p>

        {/* Impact grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }} className="orch-resolution-grid">
          {[
            { label: "Mission",           value: config?.name || "Operation Active", color: theme.crimson },
            { label: "Candidates Covered", value: config?.candidates || "—",          color: theme.gold },
            { label: "Risk Reduced",       value: decisionData?.riskReduction || "↓38%", color: "#2EBFB0" },
            { label: "Decision Score",     value: decisionData?.confidence || "97%",   color: theme.sakura },
          ].map((m, i) => (
            <motion.div key={m.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              style={{
                padding: "18px 16px", textAlign: "center",
                border: `1px solid ${m.color}22`, borderRadius: 10,
                background: `rgba(${hex2rgb(m.color)},0.04)`,
              }}>
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(18px, 2vw, 26px)", fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: 7 }}>{m.value}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Agent summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 24 }} className="orch-agent-summary">
          {AGENT_DEFS.map((a, i) => (
            <motion.div key={a.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              style={{
                padding: "12px 10px", textAlign: "center",
                border: `1px solid ${a.color}33`, borderRadius: 8,
                background: `rgba(${hex2rgb(a.color)},0.05)`,
              }}>
              <div style={{ fontSize: 16, color: a.color, marginBottom: 6, fontFamily: "monospace" }}>{a.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, fontWeight: 700, color: a.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{a.label}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: "#2EBFB0", letterSpacing: "0.08em" }}>✓ RESOLVED</div>
            </motion.div>
          ))}
        </div>

        {/* Autonomous decision score banner */}
        <div style={{
          padding: "20px 24px",
          border: `1px solid ${theme.borderGold}`,
          borderRadius: 10,
          background: `rgba(${hex2rgb(theme.gold)},0.04)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 32, fontWeight: 700, color: theme.gold, lineHeight: 1, marginBottom: 4 }}>
              Autonomous Decision Score: {decisionData?.confidence || "97%"}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              5 agents · zero human bottleneck · executed in under 2 seconds
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.08em", marginBottom: 4 }}>Human equivalent: 4–6 hours</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.crimson, fontWeight: 700, letterSpacing: "0.08em" }}>OrchestrAI advantage: 10,000×</div>
          </div>
        </div>
      </Panel>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT: ORCHESTRATE PAGE
═══════════════════════════════════════════════════════ */
export default function OrchestratePage() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("orchestrai-theme") !== "light"; } catch { return true; }
  });
  const theme = isDark ? THEMES.dark : THEMES.light;
  const navigate = useNavigate();

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("orchestrai-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  // Mission config state
  const [config, setConfig] = useState({ name: "", candidates: "", centers: "", regions: ["All Regions"], objectives: [], constraints: [], instructions: "" });

  // Orchestration state
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [streamEntries, setStreamEntries] = useState([]);
  const [decisionData, setDecisionData] = useState(null);
  const [agentStatuses, setAgentStatuses] = useState(["STANDBY", "STANDBY", "STANDBY", "STANDBY", "STANDBY"]);
  const [agentActions, setAgentActions] = useState([]);

  // Mission status derived from orchestration state
  const missionStatus = useMemo(() => ({
    status: isComplete ? "RESOLVED" : isOrchestrating ? "EXECUTING" : config.name ? "CONFIGURED" : "CONFIGURING",
    activeAgents: isOrchestrating || isComplete ? 5 : 0,
    priority: config.instructions?.toLowerCase().includes("critical") ? "CRITICAL" : config.objectives?.length > 3 ? "HIGH" : "STANDARD",
    impact: config.candidates ? `${config.candidates} candidates` : "—",
  }), [isOrchestrating, isComplete, config]);

  const handleRun = useCallback(() => {
    setIsOrchestrating(true);
    setIsComplete(false);
    setStreamEntries([]);
    setDecisionData(null);

    // Activate agents one by one with a cascade effect
    const statuses = ["STANDBY", "STANDBY", "STANDBY", "STANDBY", "STANDBY"];
    const agentActivationOrder = [1, 0, 3, 2, 4]; // Risk first, then Allocation, Intelligence, Operations, Comm
    const actions = [
      "Remapping center resources to optimal configuration",
      "Analyzing threat signals · 3 anomalies detected",
      "Sequencing 52 dependent execution tasks",
      "Synthesizing multi-agent observations into strategy",
      "Preparing stakeholder alert batch for dispatch",
    ];

    agentActivationOrder.forEach((idx, i) => {
      setTimeout(() => {
        statuses[idx] = i < 2 ? "ALERT" : i < 4 ? "PROCESSING" : "ACTIVE";
        const newStatuses = [...statuses];
        newStatuses[idx] = "ACTIVE";
        setAgentStatuses([...newStatuses]);
        setAgentActions([...actions]);
      }, 400 + i * 600);
    });

    // Seed initial stream entries with a delay cascade
    const initialEntries = [
      { agent: "Risk",         icon: "⬡", color: "#BF8C2C", msg: "Initial scan complete · threat assessment initiated", level: "INFO", time: "00:00" },
      { agent: "Allocation",   icon: "◈", color: "#C4002B", msg: "Center inventory loaded · optimization running", level: "INFO", time: "00:01" },
      { agent: "Intelligence", icon: "◬", color: "#7C6FE8", msg: "Multi-source data ingestion started · building model", level: "INFO", time: "00:02" },
    ];
    initialEntries.forEach((e, i) => {
      setTimeout(() => setStreamEntries(prev => [...prev, { ...e, id: Date.now() + i }]), 600 + i * 800);
    });

    // After 8 seconds, deliver decision data and complete
    setTimeout(() => {
      const conf = 95 + Math.floor(Math.random() * 4);
      setDecisionData({
        recommendations: "5",
        impact: config.candidates ? `${config.candidates} protected` : "2.3M protected",
        riskReduction: `↓${Math.floor(Math.random() * 10 + 32)}%`,
        resourceSavings: `+${Math.floor(Math.random() * 8 + 18)}%`,
        travelReduction: `↓${Math.floor(Math.random() * 15 + 22)}%`,
        confidence: `${conf}%`,
      });
    }, 8200);

    setTimeout(() => {
      setIsOrchestrating(false);
      setIsComplete(true);
      setAgentStatuses(["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE"]);
    }, 10500);
  }, [config]);

  return (
    <>
      <InjectFonts />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${theme.bg}; color: ${theme.text}; overflow-x: hidden; transition: background 0.55s ease, color 0.55s ease; }
        ::selection { background: ${theme.crimson}50; color: ${theme.text}; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.crimson}55; border-radius: 2px; }
        textarea::placeholder, input::placeholder { color: ${theme.textFaint}; }

        @media (max-width: 1100px) {
          .orch-main-grid { grid-template-columns: 1fr !important; }
          .orch-run-col { order: -1 !important; }
        }
        @media (max-width: 900px) {
          .orch-nav-tabs { display: none !important; }
          .orch-hero-grid { grid-template-columns: 1fr !important; }
          .orch-status-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .orch-builder-row { grid-template-columns: 1fr !important; }
          .orch-bottom-grid { grid-template-columns: 1fr !important; }
          .orch-decision-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .orch-resolution-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .orch-agent-summary { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .orch-status-grid { grid-template-columns: 1fr 1fr !important; }
          .orch-decision-grid { grid-template-columns: 1fr 1fr !important; }
          .orch-resolution-grid { grid-template-columns: 1fr !important; }
          .orch-agent-summary { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: theme.bgGradient, pointerEvents: "none" }} />
      <SakuraPetals isDark={isDark} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: isDark ? 0.02 : 0.012, mixBlendMode: "overlay",
      }} />

      {/* ── CONTENT ── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Nav isDark={isDark} toggleTheme={toggleTheme} theme={theme} />

        <div style={{ paddingTop: 58, minHeight: "100vh", padding: "58px clamp(12px, 3vw, 40px) 60px" }}>

          {/* ── SECTION 1: Mission Command Header ── */}
          <MissionCommandHeader theme={theme} missionStatus={missionStatus} />

          {/* ── MAIN 3-COL GRID: Builder | Run | Network ── */}
          <div className="orch-main-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 0.8fr 1fr",
            gap: "clamp(12px, 1.8vw, 20px)",
            marginBottom: "clamp(14px, 1.8vw, 20px)",
            alignItems: "start",
          }}>

            {/* LEFT: Mission Builder */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <MissionBuilder theme={theme} config={config} onChange={setConfig} />
            </motion.div>

            {/* CENTER: Run Orchestration */}
            <motion.div
              className="orch-run-col"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <RunOrchestration
                theme={theme}
                isOrchestrating={isOrchestrating}
                onRun={handleRun}
                config={config}
              />
            </motion.div>

            {/* RIGHT: Agent Network */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
            >
              <AgentNetworkPanel
                theme={theme}
                isOrchestrating={isOrchestrating}
                agentStatuses={agentStatuses}
                agentActions={agentActions}
              />
            </motion.div>
          </div>

          {/* ── BOTTOM GRID: Execution Stream | Decision Engine ── */}
          <div className="orch-bottom-grid" style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "clamp(12px, 1.8vw, 20px)",
            marginBottom: "clamp(14px, 1.8vw, 20px)",
            alignItems: "start",
          }}>
            {/* SECTION 5: Agent Execution Stream */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.38 }}
            >
              <AgentExecutionStream
                theme={theme}
                isOrchestrating={isOrchestrating}
                streamEntries={streamEntries}
              />
            </motion.div>

            {/* SECTION 6: Decision Engine */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.46 }}
            >
              <DecisionEngine
                theme={theme}
                isOrchestrating={isOrchestrating}
                decisionData={decisionData}
              />
            </motion.div>
          </div>

          {/* ── SECTION 7: Final Resolution ── */}
          <AnimatePresence>
            {isComplete && (
              <motion.div style={{ marginBottom: "clamp(14px, 1.8vw, 20px)" }}>
                <FinalResolution
                  theme={theme}
                  isComplete={isComplete}
                  decisionData={decisionData}
                  config={config}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── FOOTER ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ marginTop: 16, paddingTop: 20, borderTop: `1px solid ${theme.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 30 30" fill="none">
                <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
                <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.8" />
              </svg>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint, letterSpacing: "0.1em" }}>OrchestrAI © 2025 · Orchestrate Interface v2.4.1</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[["Agent Mesh", "HEALTHY", "#2EBFB0"], ["Command Bus", "READY", theme.gold], ["Auth", "JWT SECURE", theme.crimson]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: c }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {l}: <span style={{ color: c }}>{v}</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}