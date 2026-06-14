/**
 * OrchestrAI — MissionDetailPage.jsx
 * Route: /missions/:id
 *
 * The Autonomous Operations Command Center.
 * Inherits exact design language from HomePage.jsx, Dashboard.jsx, MissionsPage.jsx.
 *
 * Palette, typography, theme system, spacing, and interaction patterns are identical.
 * Global theme persisted via localStorage ("orchestrai-theme").
 */

import React, {
  useRef, useState, useEffect, useCallback, useMemo, Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";
import { useParams, useNavigate } from "react-router-dom";

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

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
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
      petals = Array.from({ length: 14 }, () => ({
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
   MISSIONS DATA — identical to MissionsPage
═══════════════════════════════════════════════════════ */
const MISSIONS_DATA = [
  {
    id: "neet-2027",
    code: "OP-001",
    name: "NEET 2027",
    domain: "Examination Operations",
    status: "LIVE",
    priority: "CRITICAL",
    riskScore: 24,
    healthScore: 99,
    confidence: 96,
    activeAgents: 5,
    candidates: "2.3M",
    candidatesNum: 2300000,
    centers: 4820,
    regions: 28,
    capacity: "94%",
    resourceAllocation: "97%",
    alerts: 3,
    progress: 68,
    eta: "14d 6h",
    lastUpdate: "32s ago",
    color: "#C4002B",
    description: "National-scale medical entrance coordination across 4,820 examination centers. Three active disruption scenarios under autonomous resolution.",
    tags: ["Health", "National", "Critical"],
    agentStatus: ["ACTIVE", "ALERT", "ACTIVE", "PROCESSING", "READY"],
    agentConfidence: [94, 97, 91, 99, 88],
    agentActions: [
      "Remapping 3 centers to backup nodes",
      "Detected weather anomaly · 2hr window",
      "Sequencing 48 dependent tasks",
      "Generating optimal strategy",
      "12,400 alerts queued for dispatch",
    ],
  },
  {
    id: "cuet-ops",
    code: "OP-002",
    name: "CUET Operations",
    domain: "Examination Operations",
    status: "STAGING",
    priority: "HIGH",
    riskScore: 41,
    healthScore: 87,
    confidence: 91,
    activeAgents: 4,
    candidates: "890K",
    candidatesNum: 890000,
    centers: 1920,
    regions: 18,
    capacity: "82%",
    resourceAllocation: "88%",
    alerts: 7,
    progress: 34,
    eta: "31d 12h",
    lastUpdate: "4m ago",
    color: "#BF8C2C",
    description: "Central University Entrance Test logistics. Staging phase with 7 resource conflicts flagged for autonomous resolution.",
    tags: ["Education", "National", "Staging"],
    agentStatus: ["ACTIVE", "PROCESSING", "ACTIVE", "STANDBY", "READY"],
    agentConfidence: [89, 93, 87, 75, 82],
    agentActions: [
      "Optimizing 1,920 center assignments",
      "Analyzing 7 resource conflicts",
      "Validating staff deployment",
      "Building contingency models",
      "Preparing candidate communications",
    ],
  },
  {
    id: "ssc-recruitment",
    code: "OP-003",
    name: "SSC Recruitment Drive",
    domain: "Government Recruitment",
    status: "PLANNING",
    priority: "MEDIUM",
    riskScore: 12,
    healthScore: 100,
    confidence: 84,
    activeAgents: 3,
    candidates: "340K",
    candidatesNum: 340000,
    centers: 680,
    regions: 12,
    capacity: "71%",
    resourceAllocation: "64%",
    alerts: 0,
    progress: 12,
    eta: "68d",
    lastUpdate: "18m ago",
    color: "#2EBFB0",
    description: "Staff Selection Commission recruitment across 680 centers. Early planning phase with clean resource forecast.",
    tags: ["Government", "Recruitment", "Planning"],
    agentStatus: ["ACTIVE", "STANDBY", "ACTIVE", "STANDBY", "STANDBY"],
    agentConfidence: [84, 72, 81, 68, 74],
    agentActions: [
      "Mapping 680 center capacities",
      "Monitoring 0 active risks",
      "Pre-sequencing logistics",
      "Analyzing historical patterns",
      "Preparing stakeholder templates",
    ],
  },
  {
    id: "election-logistics",
    code: "OP-004",
    name: "Election Logistics 2025",
    domain: "Civic Operations",
    status: "COMPLETED",
    priority: "RESOLVED",
    riskScore: 8,
    healthScore: 97,
    confidence: 99,
    activeAgents: 0,
    candidates: "12.4M",
    candidatesNum: 12400000,
    centers: 18400,
    regions: 36,
    capacity: "99%",
    resourceAllocation: "100%",
    alerts: 0,
    progress: 100,
    eta: "Completed",
    lastUpdate: "3d ago",
    color: "#7C6FE8",
    description: "General election booth coordination across 18,400 polling stations. Zero incident rate achieved.",
    tags: ["Civic", "National", "Completed"],
    agentStatus: ["DONE", "DONE", "DONE", "DONE", "DONE"],
    agentConfidence: [99, 99, 99, 99, 99],
    agentActions: [
      "All centers confirmed · archived",
      "Zero incidents logged",
      "All tasks resolved",
      "Final report generated",
      "All notifications sent",
    ],
  },
  {
    id: "smart-city-deploy",
    code: "OP-005",
    name: "Smart City Deployment",
    domain: "Urban Infrastructure",
    status: "STAGING",
    priority: "HIGH",
    riskScore: 33,
    healthScore: 91,
    confidence: 88,
    activeAgents: 4,
    candidates: "—",
    candidatesNum: 0,
    centers: 2200,
    regions: 5,
    capacity: "77%",
    resourceAllocation: "81%",
    alerts: 4,
    progress: 22,
    eta: "45d",
    lastUpdate: "7m ago",
    color: "#E8A0B0",
    description: "Autonomous traffic, utilities, and emergency services coordination for Tier-1 metro deployment. Phase 1 of 3.",
    tags: ["Urban", "Infrastructure", "Multi-phase"],
    agentStatus: ["ACTIVE", "PROCESSING", "ACTIVE", "ACTIVE", "READY"],
    agentConfidence: [88, 91, 85, 87, 83],
    agentActions: [
      "Mapping 2,200 sensor nodes",
      "Analyzing grid load patterns",
      "Sequencing deployment phases",
      "Modeling urban flow patterns",
      "Preparing authority briefings",
    ],
  },
  {
    id: "supply-chain-op",
    code: "OP-006",
    name: "Supply Chain Surge",
    domain: "Logistics Networks",
    status: "LIVE",
    priority: "CRITICAL",
    riskScore: 52,
    healthScore: 78,
    confidence: 89,
    activeAgents: 5,
    candidates: "—",
    candidatesNum: 0,
    centers: 340,
    regions: 8,
    capacity: "88%",
    resourceAllocation: "92%",
    alerts: 11,
    progress: 55,
    eta: "8d",
    lastUpdate: "1m ago",
    color: "#BF8C2C",
    description: "Festival-season supply chain surge management across 340 distribution nodes. Elevated risk profile with 11 active rerouting operations.",
    tags: ["Logistics", "Commercial", "High-Risk"],
    agentStatus: ["ACTIVE", "ALERT", "ACTIVE", "PROCESSING", "ACTIVE"],
    agentConfidence: [89, 95, 88, 92, 86],
    agentActions: [
      "Reallocating 340 node assignments",
      "Monitoring 11 active disruptions",
      "Rerouting 8 supply chains",
      "Forecasting demand spikes",
      "Broadcasting 11 alerts",
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   AGENT DEFINITIONS
═══════════════════════════════════════════════════════ */
const AGENT_DEFS = [
  { id: "allocation", label: "Allocation", icon: "◈", color: "#C4002B", role: "Resource Allocation", x: 50, y: 12 },
  { id: "risk",       label: "Risk",       icon: "⬡", color: "#BF8C2C", role: "Threat Intelligence", x: 88, y: 42 },
  { id: "operations", label: "Operations", icon: "⟁", color: "#E8A0B0", role: "Orchestration",       x: 72, y: 82 },
  { id: "intelligence", label: "Intelligence", icon: "◬", color: "#7C6FE8", role: "Decision Engine", x: 28, y: 82 },
  { id: "communication", label: "Comm",    icon: "◫", color: "#2EBFB0", role: "Stakeholder Comms",   x: 12, y: 42 },
];

const AGENT_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],[4,0],
  [0,2],[1,3],[2,4],[3,0],[4,1],
];

/* ═══════════════════════════════════════════════════════
   3D: MISSION COMMAND CORE
═══════════════════════════════════════════════════════ */
function MissionCore({ missionColor }) {
  const outerRef = useRef();
  const midRef   = useRef();
  const innerRef = useRef();
  const ring1    = useRef();
  const ring2    = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) { outerRef.current.rotation.y = t * 0.08; outerRef.current.rotation.z = Math.sin(t * 0.2) * 0.04; }
    if (midRef.current)   { midRef.current.rotation.y = -t * 0.13; midRef.current.rotation.x = t * 0.07; }
    if (innerRef.current) { innerRef.current.rotation.y = t * 0.26; innerRef.current.rotation.z = -t * 0.11; const p = 1 + Math.sin(t * 2.3) * 0.07; innerRef.current.scale.setScalar(p); }
    if (ring1.current)    { ring1.current.rotation.z = t * 0.1; }
    if (ring2.current)    { ring2.current.rotation.x = t * 0.08; ring2.current.rotation.z = -t * 0.055; }
  });

  const col = missionColor || "#C4002B";

  return (
    <group>
      <group ref={outerRef}>
        <mesh>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.18} metalness={0.9} roughness={0.06} transparent opacity={0.07} wireframe />
        </mesh>
      </group>
      <group ref={midRef}>
        <mesh>
          <dodecahedronGeometry args={[0.78, 0]} />
          <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={0.14} metalness={0.85} roughness={0.07} transparent opacity={0.09} wireframe />
        </mesh>
      </group>
      <group ref={innerRef}>
        <mesh>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#F0EBE1" emissive="#BF8C2C" emissiveIntensity={1.4} metalness={1.0} roughness={0.0} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.8} metalness={0.9} roughness={0.0} />
        </mesh>
      </group>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.008, 8, 128]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} transparent opacity={0.35} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2 + 0.9, 0.4, 0]}>
        <torusGeometry args={[1.5, 0.005, 8, 128]} />
        <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={0.5} transparent opacity={0.22} />
      </mesh>
      <PulseShell col={col} />
      <Sparkles count={70} scale={4.2} size={0.4} speed={0.22} color="#BF8C2C" opacity={0.5} />
      <Sparkles count={40} scale={2.8} size={0.26} speed={0.3} color="#E8A0B0" opacity={0.38} />
      <pointLight position={[4, 3, 3]} color={col} intensity={5} distance={10} decay={2} />
      <pointLight position={[-4, -2, -3]} color="#BF8C2C" intensity={3.5} distance={10} decay={2} />
      <pointLight position={[0, 4, -4]} color="#E8A0B0" intensity={2.5} distance={10} decay={2} />
      <ambientLight intensity={0.18} color="#1a0a2e" />
    </group>
  );
}

function PulseShell({ col }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const beat = Math.max(0, Math.sin(t * 1.7));
    if (ref.current) { ref.current.scale.setScalar(1 + beat * 0.55); ref.current.material.opacity = beat * 0.12; }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.62, 16, 16]} />
      <meshStandardMaterial color={col || "#C4002B"} transparent opacity={0} side={THREE.BackSide} />
    </mesh>
  );
}

function CoreScene({ missionColor }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 5.2], fov: 38 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.22} floatIntensity={0.32}>
          <MissionCore missionColor={missionColor} />
        </Float>
      </Suspense>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════
   AGENT NETWORK — live connected mesh with data packets
═══════════════════════════════════════════════════════ */
function AgentNetworkViz({ theme, agents, agentStatus, agentConfidence, agentActions, onSelect, selected }) {
  const [packets, setPackets] = useState([]);

  useEffect(() => {
    const spawnPacket = () => {
      const conn = AGENT_CONNECTIONS[Math.floor(Math.random() * AGENT_CONNECTIONS.length)];
      const id = Date.now() + Math.random();
      setPackets(p => [...p.slice(-14), { id, from: conn[0], to: conn[1], progress: 0, color: agents[conn[0]].color }]);
    };
    const iv = setInterval(spawnPacket, 500);
    return () => clearInterval(iv);
  }, [agents]);

  useEffect(() => {
    let raf;
    const tick = () => {
      setPackets(prev => prev.map(p => ({ ...p, progress: p.progress + 0.013 })).filter(p => p.progress < 1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const lerp = (a, b, t) => a + (b - a) * t;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          {agents.map(a => (
            <radialGradient key={a.id} id={`mdp-glow-${a.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={a.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={a.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {AGENT_CONNECTIONS.map(([fi, ti], ci) => {
          const f = agents[fi]; const t = agents[ti];
          return <line key={ci} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={theme.textFaint} strokeWidth="0.3" strokeDasharray="1 2" />;
        })}

        {packets.map(p => {
          const from = agents[p.from]; const to = agents[p.to];
          const px = lerp(from.x, to.x, p.progress);
          const py = lerp(from.y, to.y, p.progress);
          return <circle key={p.id} cx={px} cy={py} r="0.7" fill={p.color} opacity={Math.sin(p.progress * Math.PI)} />;
        })}

        {agents.map((agent, i) => {
          const status = agentStatus[i] || "STANDBY";
          const isSelected = selected === i;
          const isActive = ["ACTIVE", "ALERT", "PROCESSING"].includes(status);

          return (
            <g key={agent.id} onClick={() => onSelect(isSelected ? null : i)} style={{ cursor: "pointer" }}>
              <circle cx={agent.x} cy={agent.y} r={isSelected ? 8 : 5.5} fill={`url(#mdp-glow-${agent.id})`} opacity={isSelected ? 1 : (isActive ? 0.6 : 0.25)}>
                <animate attributeName="r" values={isSelected ? "7;9;7" : (isActive ? "5;6.5;5" : "4.5;5.5;4.5")} dur="2.8s" repeatCount="indefinite" />
              </circle>
              <circle cx={agent.x} cy={agent.y} r={isSelected ? 4.2 : 3.4}
                fill={`rgba(${hex2rgb(agent.color)},${isSelected ? 0.22 : 0.1})`}
                stroke={agent.color} strokeWidth={isSelected ? 0.8 : 0.5}
                opacity={isActive ? 1 : 0.45}
              />
              {status === "ALERT" && (
                <circle cx={agent.x} cy={agent.y} r="3.4" fill="none" stroke={agent.color} strokeWidth="0.4" opacity="0.5">
                  <animate attributeName="r" values="3.4;6;3.4" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={agent.x} y={agent.y + 1.2} textAnchor="middle" dominantBaseline="middle" fontSize="3.8" fill={agent.color} style={{ fontFamily: "monospace", pointerEvents: "none" }}>
                {agent.icon}
              </text>
              <text x={agent.x} y={agent.y + (agent.y > 50 ? 8 : -6)} textAnchor="middle" fontSize="2.6" fill={theme.textMuted} style={{ fontFamily: "'Space Grotesk', sans-serif", pointerEvents: "none" }}>
                {agent.label}
              </text>
              {/* Confidence arc */}
              {agentConfidence && (
                <text x={agent.x} y={agent.y + (agent.y > 50 ? 11.5 : -9)} textAnchor="middle" fontSize="2.1" fill={agent.color} opacity="0.7" style={{ fontFamily: "'Space Grotesk', sans-serif", pointerEvents: "none" }}>
                  {agentConfidence[i]}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LIVE AGENT RESPONSE LOG — dynamic streaming feed
═══════════════════════════════════════════════════════ */
function AgentResponseLog({ theme, mission }) {
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    // Seed with initial logs for this mission
    const seed = AGENT_DEFS.map((a, i) => ({
      id: i,
      agentIdx: i,
      agent: a.label,
      color: a.color,
      icon: a.icon,
      msg: mission.agentActions[i],
      time: `00:0${i}`,
      level: mission.agentStatus[i] === "ALERT" ? "WARN" : mission.agentStatus[i] === "PROCESSING" ? "PROC" : "INFO",
    }));
    setLogs(seed);
  }, [mission]);

  useEffect(() => {
    const pool = [
      { agent: "Allocation", color: "#C4002B", icon: "◈", msg: `Reallocated ${Math.floor(Math.random()*200+50)} resources across ${Math.floor(Math.random()*10+5)} zones`, level: "INFO" },
      { agent: "Risk",       color: "#BF8C2C", icon: "⬡", msg: `Risk signal updated · probability ${Math.floor(Math.random()*30+60)}% · window narrowing`, level: "WARN" },
      { agent: "Intelligence", color: "#7C6FE8", icon: "◬", msg: `Strategy confidence elevated to ${Math.floor(Math.random()*4+95)}%`, level: "REC" },
      { agent: "Operations", color: "#E8A0B0", icon: "⟁", msg: `${Math.floor(Math.random()*20+10)} dependent tasks resolved and sequenced`, level: "INFO" },
      { agent: "Comm",       color: "#2EBFB0", icon: "◫", msg: `Batch dispatched · ${Math.floor(Math.random()*1000+500)} recipients · 99.1% delivery`, level: "INFO" },
    ];
    let idx = 0;
    const iv = setInterval(() => {
      const entry = pool[idx % pool.length];
      const now = new Date();
      const time = `${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      setLogs(prev => [...prev.slice(-24), { ...entry, id: Date.now() + Math.random(), time }]);
      idx++;
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const levelColor = { WARN: "#BF8C2C", INFO: theme.textMuted, REC: "#7C6FE8", PROC: "#E8A0B0" };

  return (
    <div ref={scrollRef} style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
      {logs.map((log, i) => (
        <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}
          style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", borderRadius: 6,
            background: i === logs.length - 1 ? `rgba(${hex2rgb(log.color)},0.05)` : "transparent",
            borderLeft: i === logs.length - 1 ? `2px solid ${log.color}` : "2px solid transparent",
          }}>
          <span style={{ fontSize: 11, color: log.color, flexShrink: 0, lineHeight: "18px" }}>{log.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, fontWeight: 600, color: log.color, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>{log.agent}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: levelColor[log.level] || theme.textFaint, background: `rgba(${hex2rgb(log.color)},0.08)`, padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>{log.level}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, marginLeft: "auto", flexShrink: 0 }}>{log.time}</span>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: theme.textMuted, fontWeight: 300, lineHeight: 1.5, margin: 0 }}>{log.msg}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   REUSABLE: PANEL, SECTION HEADER
═══════════════════════════════════════════════════════ */
function Panel({ children, style = {}, theme }) {
  return (
    <div style={{
      border: `1px solid ${theme.borderSubtle}`, borderRadius: 12,
      background: theme.surface,
      backdropFilter: "blur(24px) saturate(1.6)",
      WebkitBackdropFilter: "blur(24px) saturate(1.6)",
      padding: "24px", ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHeader({ eyebrow, eyebrowColor, title, theme }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <div style={{ width: 18, height: 1.5, background: eyebrowColor || theme.crimson }} />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.22em", color: eyebrowColor || theme.crimson, textTransform: "uppercase", fontWeight: 500 }}>{eyebrow}</span>
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: 0 }}>{title}</h2>
    </div>
  );
}

function HealthBar({ value, color, theme }) {
  return (
    <div style={{ height: 3, background: theme.textFaint, borderRadius: 2, overflow: "hidden" }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ height: "100%", background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 2 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 1: MISSION HEADER
═══════════════════════════════════════════════════════ */
function MissionHero({ mission, theme }) {
  const statusColor = { LIVE: theme.crimson, STAGING: theme.gold, PLANNING: "#2EBFB0", COMPLETED: theme.sakura };
  const priorityColor = { CRITICAL: theme.crimson, HIGH: theme.gold, MEDIUM: "#2EBFB0", RESOLVED: theme.sakura };
  const col = statusColor[mission.status] || theme.textMuted;
  const pcol = priorityColor[mission.priority] || theme.textMuted;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
      style={{
        paddingTop: "clamp(20px, 3vw, 32px)", paddingBottom: "clamp(20px, 2.5vw, 28px)",
        borderBottom: `1px solid ${theme.borderSubtle}`, marginBottom: "clamp(18px, 2vw, 26px)",
        position: "relative",
      }}>

      {/* Eyebrow breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 20, height: 1.5, background: mission.color }} />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.24em", color: mission.color, textTransform: "uppercase", fontWeight: 500 }}>
          {mission.domain} · {mission.code}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start", flexWrap: "wrap" }} className="mdp-hero-grid">
        <div>
          {/* Status + Priority badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            {mission.status === "LIVE" ? (
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: col }} />
            ) : (
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: col, opacity: 0.7 }} />
            )}
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: col, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>{mission.status}</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: pcol,
              background: `rgba(${hex2rgb(pcol)},0.12)`, padding: "2px 8px", borderRadius: 4,
              letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700,
            }}>
              {mission.priority} PRIORITY
            </span>
            {mission.alerts > 0 && (
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.crimson, background: `rgba(${hex2rgb(theme.crimson)},0.12)`, padding: "2px 8px", borderRadius: 4 }}>
                {mission.alerts} active alerts
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(36px, 4.5vw, 64px)", fontWeight: 400, lineHeight: 1.0, color: theme.text, margin: "0 0 10px" }}>
            {mission.name}
          </h1>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: theme.textMuted, fontWeight: 300, lineHeight: 1.65, margin: "0 0 20px", maxWidth: 560 }}>
            {mission.description}
          </p>

          {/* Meta row */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Last Updated", value: mission.lastUpdate },
              { label: "ETA", value: mission.eta },
              { label: "Active Agents", value: `${mission.activeAgents} / 5` },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, color: theme.text, lineHeight: 1, marginBottom: 3 }}>{m.value}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Mission health ring */}
        <div style={{ textAlign: "center", minWidth: 140 }} className="mdp-health-col">
          <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto 10px" }}>
            {/* Outer ring */}
            <svg width="110" height="110" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
              <circle cx="55" cy="55" r="48" fill="none" stroke={theme.textFaint} strokeWidth="4" />
              <motion.circle cx="55" cy="55" r="48" fill="none" stroke={mission.color} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 48}
                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - mission.healthScore / 100) }}
                transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 28, fontWeight: 700, color: theme.text, lineHeight: 1 }}>{mission.healthScore}%</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7, color: theme.textFaint, letterSpacing: "0.12em", textTransform: "uppercase" }}>Health</div>
            </div>
          </div>
          {/* Confidence */}
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: mission.color, lineHeight: 1, marginBottom: 2 }}>{mission.confidence}%</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Confidence</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.08em" }}>Mission Progress</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: mission.color, fontWeight: 700 }}>{mission.progress}%</span>
        </div>
        <div style={{ height: 4, background: theme.textFaint, borderRadius: 2, overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${mission.progress}%` }} transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ height: "100%", background: `linear-gradient(90deg, ${mission.color}, ${mission.color}99)`, borderRadius: 2 }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 2: MISSION OVERVIEW CARDS
═══════════════════════════════════════════════════════ */
function MissionOverview({ mission, theme }) {
  const overviewStats = [
    { label: "Candidates", value: mission.candidates, icon: "◈", color: theme.crimson },
    { label: "Centers", value: mission.centers.toLocaleString(), icon: "⬡", color: theme.gold },
    { label: "Regions", value: mission.regions, icon: "◬", color: theme.sakura },
    { label: "Capacity Used", value: mission.capacity, icon: "⟁", color: "#2EBFB0" },
    { label: "Resource Alloc.", value: mission.resourceAllocation, icon: "◫", color: theme.agentColors[3] },
  ];

  return (
    <Panel theme={theme}>
      <SectionHeader eyebrow="Mission Overview" eyebrowColor={theme.gold} title={<span>Operational <em style={{ color: theme.gold }}>Metrics</em></span>} theme={theme} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} className="mdp-overview-grid">
        {overviewStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 + i * 0.07 }}
            style={{
              padding: "16px 14px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8,
              background: theme.glass, backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
            }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, opacity: 0.5 }} />
            <div style={{ fontSize: 14, color: s.color, marginBottom: 8, fontFamily: "monospace" }}>{s.icon}</div>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(22px, 2.2vw, 30px)", fontWeight: 700, color: theme.text, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 3: AGENT COLLABORATION CENTER
═══════════════════════════════════════════════════════ */
function AgentCollaborationCenter({ mission, theme }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const agents = AGENT_DEFS.map((a, i) => ({
    ...a,
    color: theme.agentColors[i] || a.color,
    status: mission.agentStatus[i],
    confidence: mission.agentConfidence[i],
    action: mission.agentActions[i],
  }));

  const sel = selectedAgent !== null ? agents[selectedAgent] : null;

  return (
    <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 0 }}>
        <SectionHeader eyebrow="Agent Collaboration" eyebrowColor={theme.crimson}
          title={<span>Living Agent <em style={{ color: theme.crimson }}>Mesh</em></span>} theme={theme} />
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {agents.map((a, i) => (
            <div key={a.id} title={`${a.label} — ${a.status}`} style={{
              width: 8, height: 8, borderRadius: "50%", background: a.color,
              opacity: ["ACTIVE","ALERT","PROCESSING"].includes(a.status) ? 1 : 0.28,
              cursor: "pointer",
            }} onClick={() => setSelectedAgent(i === selectedAgent ? null : i)} />
          ))}
        </div>
      </div>

      {/* Network viz + 3D side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, flex: 1 }} className="mdp-agent-inner">
        {/* SVG mesh */}
        <div style={{ minHeight: 260, position: "relative" }}>
          <AgentNetworkViz theme={theme} agents={agents} agentStatus={mission.agentStatus}
            agentConfidence={mission.agentConfidence} agentActions={mission.agentActions}
            onSelect={setSelectedAgent} selected={selectedAgent} />
        </div>

        {/* 3D core */}
        <div style={{ height: 260 }}>
          <CoreScene missionColor={mission.color} />
        </div>
      </div>

      {/* Selected agent panel */}
      <AnimatePresence mode="wait">
        {sel ? (
          <motion.div key={sel.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
            style={{
              marginTop: 14, padding: "14px 16px",
              border: `1px solid ${sel.color}44`, borderRadius: 8,
              background: `rgba(${hex2rgb(sel.color)},0.06)`,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20, color: sel.color }}>{sel.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 700, color: sel.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{sel.label} Agent</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textMuted, letterSpacing: "0.06em" }}>{sel.role}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 24, fontWeight: 700, color: sel.color }}>{sel.confidence}%</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.08em" }}>Confidence</div>
              </div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 7, color: sel.color,
                background: `rgba(${hex2rgb(sel.color)},0.12)`, padding: "3px 7px", borderRadius: 4, fontWeight: 700,
                alignSelf: "flex-start", letterSpacing: "0.1em",
              }}>{sel.status}</div>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textMuted, fontWeight: 300, margin: 0, lineHeight: 1.55 }}>{sel.action}</p>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ marginTop: 14, padding: "10px 16px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, textAlign: "center" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em" }}>SELECT AN AGENT NODE TO INSPECT</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 4: AI OPERATIONS WORKSPACE
═══════════════════════════════════════════════════════ */
const CONSTRAINT_PRESETS = [
  { label: "Minimize travel distance", icon: "◈", color: "#C4002B" },
  { label: "Reduce overcrowding risk", icon: "⬡", color: "#BF8C2C" },
  { label: "Maximize center utilization", icon: "⟁", color: "#E8A0B0" },
  { label: "Prioritize accessibility", icon: "◬", color: "#7C6FE8" },
  { label: "Optimize staff deployment", icon: "◫", color: "#2EBFB0" },
];

function AIWorkspace({ theme, onSubmit, isProcessing }) {
  const [activeConstraints, setActiveConstraints] = useState([0, 2]);
  const [customInstruction, setCustomInstruction] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");

  const toggleConstraint = (i) => {
    setActiveConstraints(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleSubmit = () => {
    const constraints = activeConstraints.map(i => CONSTRAINT_PRESETS[i].label);
    onSubmit({ constraints, customInstruction, urgency });
  };

  return (
    <Panel theme={theme}>
      <SectionHeader eyebrow="Operations Workspace" eyebrowColor={theme.sakura}
        title={<span>Mission <em style={{ color: theme.sakura }}>Directives</em></span>} theme={theme} />

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: theme.textMuted, fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>
        Configure constraints for the autonomous agent mesh. The system will coordinate a response without further input.
      </p>

      {/* Constraint toggles */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
          Active Constraints
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {CONSTRAINT_PRESETS.map((c, i) => {
            const active = activeConstraints.includes(i);
            return (
              <motion.button key={i} onClick={() => toggleConstraint(i)} whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                  border: `1px solid ${active ? c.color + "44" : theme.borderSubtle}`,
                  borderRadius: 7, background: active ? `rgba(${hex2rgb(c.color)},0.07)` : "transparent",
                  cursor: "pointer", transition: "all 0.22s", textAlign: "left",
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${active ? c.color : theme.textFaint}`,
                  background: active ? `rgba(${hex2rgb(c.color)},0.18)` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.22s",
                }}>
                  {active && <span style={{ fontSize: 8, color: c.color }}>✓</span>}
                </div>
                <span style={{ fontSize: 9, color: c.color, fontFamily: "monospace" }}>{c.icon}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: active ? theme.text : theme.textMuted, fontWeight: active ? 500 : 400 }}>
                  {c.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom instruction */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
          Additional Directive
        </div>
        <textarea
          value={customInstruction}
          onChange={e => setCustomInstruction(e.target.value)}
          placeholder="Describe any special operational requirements, edge-case constraints, or mission-specific context…"
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

      {/* Urgency selector */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
          Urgency Level
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["NORMAL", "ELEVATED", "CRITICAL"].map(u => {
            const ucol = u === "CRITICAL" ? theme.crimson : u === "ELEVATED" ? theme.gold : "#2EBFB0";
            return (
              <button key={u} onClick={() => setUrgency(u)}
                style={{
                  flex: 1, padding: "8px 6px",
                  border: `1px solid ${urgency === u ? ucol + "55" : theme.borderSubtle}`,
                  borderRadius: 6, background: urgency === u ? `rgba(${hex2rgb(ucol)},0.1)` : "transparent",
                  color: urgency === u ? ucol : theme.textMuted,
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
                  fontWeight: urgency === u ? 700 : 400, letterSpacing: "0.08em",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                {u}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <motion.button
        whileHover={!isProcessing ? { scale: 1.03, boxShadow: `0 8px 32px ${theme.crimsonGlow}` } : {}}
        whileTap={!isProcessing ? { scale: 0.97 } : {}}
        onClick={handleSubmit}
        disabled={isProcessing}
        style={{
          width: "100%", padding: "13px 20px",
          background: isProcessing ? `rgba(${hex2rgb(theme.crimson)},0.3)` : theme.crimson,
          border: "none", borderRadius: 7, color: "#F0EBE1",
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          cursor: isProcessing ? "not-allowed" : "pointer", transition: "all 0.25s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
        {isProcessing ? (
          <>
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>⟳</motion.span>
            Dispatching to Agents…
          </>
        ) : (
          <><span>⚡</span> Dispatch to Agent Mesh</>
        )}
      </motion.button>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 5: AI RESPONSE CENTER
═══════════════════════════════════════════════════════ */
function AIResponseCenter({ mission, theme, responses }) {
  return (
    <Panel theme={theme} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 0 }}>
        <SectionHeader eyebrow="Agent Response Stream" eyebrowColor={theme.gold}
          title={<span>Decision <em style={{ color: theme.gold }}>Feed</em></span>} theme={theme} />
        <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.crimson, letterSpacing: "0.18em" }}>STREAMING</span>
        </motion.div>
      </div>

      <div style={{ flex: 1, minHeight: 320, overflow: "hidden" }}>
        <AgentResponseLog theme={theme} mission={mission} />
      </div>

      {/* Agent response cards for dispatched instructions */}
      <AnimatePresence>
        {responses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.borderSubtle}` }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
              Instruction Results
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {responses.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
                  style={{
                    padding: "12px 14px", border: `1px solid ${r.color}33`,
                    borderRadius: 7, background: `rgba(${hex2rgb(r.color)},0.05)`,
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                  <span style={{ fontSize: 13, color: r.color, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, fontWeight: 700, color: r.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{r.agent}</div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textMuted, fontWeight: 300, margin: 0, lineHeight: 1.5 }}>{r.output}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 6: AUTONOMOUS DECISION TIMELINE
═══════════════════════════════════════════════════════ */
const TIMELINE_STEPS = [
  { phase: "Detection",       icon: "⬡", color: "#BF8C2C", desc: "Anomaly flagged by Risk Agent · threshold exceeded" },
  { phase: "Analysis",        icon: "◬", color: "#7C6FE8", desc: "Impact assessed · scope defined · options generated" },
  { phase: "Coordination",    icon: "◈", color: "#C4002B", desc: "Resources remapped · conflicts resolved across 5 agents" },
  { phase: "Recommendation",  icon: "⟁", color: "#E8A0B0", desc: "Strategy synthesized · confidence verified · ready" },
  { phase: "Resolution",      icon: "◫", color: "#2EBFB0", desc: "Actions executed · stakeholders notified · incident closed" },
];

function DecisionTimeline({ theme, mission }) {
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    // Animate through steps on mount
    let i = 0;
    const run = () => {
      if (i > TIMELINE_STEPS.length) return;
      setActiveStep(i - 1);
      i++;
      setTimeout(run, 650);
    };
    const t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <Panel theme={theme}>
      <SectionHeader eyebrow="Decision Timeline" eyebrowColor="#7C6FE8"
        title={<span>Autonomous <em style={{ color: "#7C6FE8" }}>Resolution Flow</em></span>} theme={theme} />

      {/* Horizontal timeline */}
      <div style={{ position: "relative", marginTop: 8 }}>
        {/* Connecting bar */}
        <div style={{ position: "absolute", top: 24, left: "10%", right: "10%", height: 1, background: theme.textFaint, zIndex: 0 }} />
        <motion.div
          animate={{ width: activeStep >= 0 ? `${Math.min(activeStep / (TIMELINE_STEPS.length - 1), 1) * 80}%` : "0%" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ position: "absolute", top: 24, left: "10%", height: 1, background: `linear-gradient(90deg, ${theme.crimson}, #7C6FE8)`, zIndex: 1 }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, position: "relative", zIndex: 2 }} className="mdp-timeline-grid">
          {TIMELINE_STEPS.map((step, i) => {
            const done = activeStep >= i;
            return (
              <div key={step.phase} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <motion.div
                  animate={{ scale: done ? 1 : 0.85, boxShadow: done ? `0 0 0 1px ${step.color}44, 0 0 18px ${step.color}33` : "none" }}
                  transition={{ duration: 0.35 }}
                  style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: `1.5px solid ${done ? step.color : theme.borderSubtle}`,
                    background: done ? `rgba(${hex2rgb(step.color)},0.12)` : theme.glass,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: done ? step.color : theme.textFaint,
                    transition: "all 0.4s ease", backdropFilter: "blur(8px)",
                    cursor: "default",
                  }}>
                  {step.icon}
                </motion.div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 14, fontWeight: 500, color: done ? theme.text : theme.textMuted, marginBottom: 4, lineHeight: 1.2, transition: "color 0.4s" }}>{step.phase}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: theme.textMuted, fontWeight: 300, lineHeight: 1.45, opacity: done ? 1 : 0.35, transition: "opacity 0.4s" }}>{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolution summary */}
      <AnimatePresence>
        {activeStep >= TIMELINE_STEPS.length - 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginTop: 22, padding: "16px 20px",
              border: `1px solid ${theme.borderGold}`, borderRadius: 8,
              background: `rgba(${hex2rgb(theme.gold)},0.04)`,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
            }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: theme.gold, lineHeight: 1, marginBottom: 3 }}>
                Cycle Complete · 6.2s
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                5 agents · full coordination · resolution dispatched
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.08em", marginBottom: 3 }}>Human equivalent: 4–6 hours</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.gold, fontWeight: 700, letterSpacing: "0.08em" }}>OrchestrAI advantage: 10,000×</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 7: MISSION RESOLUTION SUMMARY
═══════════════════════════════════════════════════════ */
function ResolutionSummary({ mission, theme, responses }) {
  const metrics = [
    { label: "Candidates Protected", value: mission.candidates, color: theme.crimson },
    { label: "Centers Coordinated", value: mission.centers.toLocaleString(), color: theme.gold },
    { label: "Risk Reduction", value: "↓38%", color: "#2EBFB0" },
    { label: "Decision Confidence", value: `${mission.confidence}%`, color: theme.sakura },
  ];

  return (
    <Panel theme={theme}>
      <SectionHeader eyebrow="Mission Resolution" eyebrowColor="#2EBFB0"
        title={<span>Impact <em style={{ color: "#2EBFB0" }}>Summary</em></span>} theme={theme} />

      {/* Impact metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }} className="mdp-resolution-grid">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
            style={{
              padding: "16px 14px", border: `1px solid ${m.color}22`,
              borderRadius: 8, background: `rgba(${hex2rgb(m.color)},0.04)`,
              textAlign: "center",
            }}>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: 5 }}>{m.value}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Agent recommendation cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 18 }} className="mdp-agent-recs">
        {AGENT_DEFS.map((a, i) => {
          const col = theme.agentColors[i] || a.color;
          const conf = mission.agentConfidence[i];
          const isActive = ["ACTIVE","ALERT","PROCESSING"].includes(mission.agentStatus[i]);
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
              style={{
                padding: "12px 10px", border: `1px solid ${col}33`,
                borderRadius: 7, background: `rgba(${hex2rgb(col)},0.04)`,
                opacity: isActive ? 1 : 0.55,
              }}>
              <div style={{ fontSize: 14, color: col, marginBottom: 6, fontFamily: "monospace" }}>{a.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, fontWeight: 700, color: col, letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase" }}>{a.label}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: theme.textMuted, fontWeight: 300, lineHeight: 1.4, marginBottom: 8 }}>
                {mission.agentActions[i]}
              </div>
              <HealthBar value={conf} color={col} theme={theme} />
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: col, fontWeight: 700, marginTop: 4 }}>{conf}%</div>
            </motion.div>
          );
        })}
      </div>

      {/* Final recommendation banner */}
      <div style={{
        padding: "18px 22px", border: `1px solid ${mission.color}33`,
        borderRadius: 8, background: `rgba(${hex2rgb(mission.color)},0.04)`,
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 28, color: mission.color, fontFamily: "monospace" }}>◬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: mission.color, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Intelligence Agent · Final Recommendation</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.text, fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
            All constraints satisfied at {mission.confidence}% confidence. Execute current allocation strategy. Estimated risk reduction of 38%. Communication batch ready for dispatch to {mission.candidates} stakeholders.
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{
            padding: "10px 22px", background: mission.color, border: "none", borderRadius: 6,
            color: "#F0EBE1", fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            cursor: "pointer", flexShrink: 0,
          }}>
          Execute All →
        </motion.button>
      </div>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════ */
function Nav({ isDark, toggleTheme, theme, missionName, missionCode }) {
  const navigate = useNavigate();

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 58, display: "flex", alignItems: "center",
        padding: "0 clamp(16px, 4vw, 56px)", justifyContent: "space-between",
        background: isDark ? "rgba(3,2,8,0.92)" : "rgba(240,235,225,0.92)",
        backdropFilter: "blur(24px) saturate(1.8)",
        borderBottom: `1px solid ${theme.borderSubtle}`,
      }}>
      {/* Logo + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
            <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
            <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.85" />
            <circle cx="15" cy="15" r="2.5" fill="#F0EBE1" />
          </svg>
          <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 16, fontWeight: 600, color: theme.text }}>
            Orchestr<span style={{ color: theme.crimson, fontStyle: "italic" }}>AI</span>
          </span>
        </button>
        {/* Breadcrumb */}
        <span style={{ color: theme.textFaint, fontSize: 12 }}>·</span>
        <button onClick={() => navigate("/missions")}
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={e => e.target.style.color = theme.text} onMouseLeave={e => e.target.style.color = theme.textMuted}>
          Missions
        </button>
        <span style={{ color: theme.textFaint, fontSize: 12 }}>›</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.crimson, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
          {missionCode}
        </span>
      </div>

      {/* Right */}
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

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: `1px solid ${theme.borderSubtle}`,
            borderRadius: 5,
            padding: "4px 10px",
            cursor: "pointer",
            color: theme.textMuted,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.crimson; e.currentTarget.style.color = theme.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.borderSubtle; e.currentTarget.style.color = theme.textMuted; }}
        >
          Exit Platform
        </motion.button>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════
   MISSION DETAIL PAGE — ROOT
═══════════════════════════════════════════════════════ */
export default function MissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const mission = MISSIONS_DATA.find(m => m.id === id) || MISSIONS_DATA[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState([]);

  const handleWorkspaceSubmit = useCallback(({ constraints, customInstruction, urgency }) => {
    setIsProcessing(true);
    setResponses([]);

    // Simulate agents responding sequentially
    const outputs = [
      { agent: "Allocation",    icon: "◈", color: theme.agentColors[0], output: `Recommended ${Math.floor(Math.random()*15+5)} center reallocations based on ${constraints.length} active constraints. Optimal configuration computed at 99.4% utilization.` },
      { agent: "Risk",         icon: "⬡", color: theme.agentColors[1], output: `Risk profile updated. ${urgency === "CRITICAL" ? "Elevated urgency acknowledged — triggering Protocol Delta." : "No new threats within resolution window."} Confidence: 97%.` },
      { agent: "Operations",   icon: "⟁", color: theme.agentColors[2], output: `Execution sequence validated. ${Math.floor(Math.random()*20+30)} tasks queued with zero dependency conflicts detected.` },
      { agent: "Intelligence", icon: "◬", color: theme.agentColors[3], output: `${customInstruction ? `Directive incorporated: "${customInstruction.slice(0, 60)}${customInstruction.length > 60 ? '…' : ''}"` : "All constraints analyzed."} Strategy confidence: ${mission.confidence}%.` },
      { agent: "Comm",         icon: "◫", color: theme.agentColors[4], output: `Notification batch prepared for ${mission.candidates} stakeholders. Dispatch ready — awaiting authorization.` },
    ];

    outputs.forEach((r, i) => {
      setTimeout(() => {
        setResponses(prev => [...prev, r]);
        if (i === outputs.length - 1) setIsProcessing(false);
      }, 800 + i * 700);
    });
  }, [theme, mission]);

  if (!mission) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: THEMES.dark.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 32, color: THEMES.dark.text, marginBottom: 12 }}>Mission Not Found</div>
          <button onClick={() => navigate("/missions")} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: THEMES.dark.crimson, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase" }}>← Return to Missions</button>
        </div>
      </div>
    );
  }

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
        textarea::placeholder { color: ${theme.textFaint}; }

        @media (max-width: 1100px) {
          .mdp-main-cols { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 860px) {
          .mdp-overview-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .mdp-agent-inner { grid-template-columns: 1fr !important; }
          .mdp-hero-grid { grid-template-columns: 1fr !important; }
          .mdp-health-col { display: none !important; }
          .mdp-timeline-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .mdp-resolution-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .mdp-agent-recs { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .mdp-overview-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .mdp-timeline-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .mdp-resolution-grid { grid-template-columns: 1fr !important; }
          .mdp-agent-recs { grid-template-columns: repeat(2, 1fr) !important; }
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

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Nav isDark={isDark} toggleTheme={toggleTheme} theme={theme} missionName={mission.name} missionCode={mission.code} />

        <div style={{ paddingTop: 58, minHeight: "100vh", padding: "58px clamp(12px, 3vw, 40px) 60px" }}>

          {/* ── SECTION 1: Mission Header Hero ── */}
          <MissionHero mission={mission} theme={theme} />

          {/* ── SECTION 2: Overview Metrics ── */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}
            style={{ marginBottom: "clamp(14px, 1.8vw, 20px)" }}>
            <MissionOverview mission={mission} theme={theme} />
          </motion.div>

          {/* ── SECTION 3: Agent Collaboration Center (full width) ── */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            style={{ marginBottom: "clamp(14px, 1.8vw, 20px)" }}>
            <AgentCollaborationCenter mission={mission} theme={theme} />
          </motion.div>

          {/* ── SECTIONS 4 + 5: Workspace / Response side by side ── */}
          <div className="mdp-main-cols" style={{
            display: "grid", gridTemplateColumns: "1fr 1.4fr",
            gap: "clamp(14px, 1.8vw, 20px)",
            marginBottom: "clamp(14px, 1.8vw, 20px)",
            alignItems: "start",
          }}>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.28 }}>
              <AIWorkspace theme={theme} onSubmit={handleWorkspaceSubmit} isProcessing={isProcessing} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.34 }}
              style={{ height: "100%" }}>
              <AIResponseCenter mission={mission} theme={theme} responses={responses} />
            </motion.div>
          </div>

          {/* ── SECTION 6: Decision Timeline ── */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.42 }}
            style={{ marginBottom: "clamp(14px, 1.8vw, 20px)" }}>
            <DecisionTimeline theme={theme} mission={mission} />
          </motion.div>

          {/* ── SECTION 7: Resolution Summary ── */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.5 }}>
            <ResolutionSummary mission={mission} theme={theme} responses={responses} />
          </motion.div>

          {/* ── FOOTER ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${theme.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 30 30" fill="none">
                <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
                <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.8" />
              </svg>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint, letterSpacing: "0.1em" }}>OrchestrAI © 2025 · {mission.code} · Mission Command v2.4.1</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[["Agent Mesh", "HEALTHY", "#2EBFB0"], ["Data Pipeline", "STREAMING", theme.gold], ["Auth", "JWT SECURE", theme.crimson]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: c }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{l}: <span style={{ color: c }}>{v}</span></span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}