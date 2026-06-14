/**
 * OrchestrAI — AgentsPage.jsx
 * Route: /agents
 *
 * "The AI Command Network"
 * Judges should feel: these agents are alive, they communicate, they decide.
 *
 * Signature element: The Synaptic Web — a full-width SVG canvas where
 * agents live as intelligent nodes, signal pulses travel along connection
 * threads, and each node breathes with its own rhythm. Hovering an agent
 * causes the entire network to respond: its connections illuminate, its
 * partners highlight, and a rich detail panel expands below.
 *
 * Design: Japanese Futuristic Luxury × Mission Control
 * Inherits theme system, typography, and palette from HomePage/Dashboard/MissionsPage
 */

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
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
   SAKURA PETALS
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
      petals = Array.from({ length: 12 }, () => ({
        x: Math.random() * W, y: Math.random() * H - H,
        size: Math.random() * 5 + 3, speed: Math.random() * 0.35 + 0.1,
        wobble: Math.random() * Math.PI * 2, wobbleSpeed: Math.random() * 0.014 + 0.005,
        rotation: Math.random() * Math.PI * 2, rotSpeed: Math.random() * 0.016 - 0.008,
        opacity: Math.random() * 0.25 + 0.05,
      }));
    };
    init();
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const fill = isDark ? `rgba(232,160,176,0.5)` : `rgba(184,84,112,0.22)`;
      for (const p of petals) {
        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobble) * 14, p.y);
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
   AGENT DATA
═══════════════════════════════════════════════════════ */
const AGENTS = [
  {
    id: "allocation",
    name: "Allocation",
    fullName: "Allocation Agent",
    icon: "◈",
    color: "#C4002B",
    role: "Resource Orchestration",
    confidence: 94,
    status: "ACTIVE",
    load: 87,
    decisionsToday: 2847,
    latency: "8ms",
    description: "Continuously maps every examination center, proctor, and logistical asset against live demand curves. When disruptions hit, it rebalances the entire resource mesh in milliseconds — before a human coordinator even sees the alert.",
    capabilities: [
      "Center capacity optimization",
      "Real-time proctor redistribution",
      "Transport route reservation",
      "Backup node activation",
    ],
    signals: ["Sends allocation directives", "Receives risk flags", "Reads demand forecasts"],
    // Position in the synaptic web (normalized 0–1)
    nx: 0.5, ny: 0.18,
  },
  {
    id: "risk",
    name: "Risk",
    fullName: "Risk Agent",
    icon: "⬡",
    color: "#BF8C2C",
    role: "Threat Intelligence",
    confidence: 97,
    status: "ALERT",
    load: 94,
    decisionsToday: 1204,
    latency: "6ms",
    description: "Monitors 340+ risk signals across infrastructure, weather patterns, and historical incident databases. Predicts disruptions before they materialize and pre-arms response protocols across the entire agent mesh.",
    capabilities: [
      "Multi-signal anomaly detection",
      "Weather & infrastructure monitoring",
      "Cascade risk modeling",
      "Escalation threshold management",
    ],
    signals: ["Broadcasts risk alerts", "Feeds intelligence layer", "Triggers protocol chains"],
    nx: 0.87, ny: 0.38,
  },
  {
    id: "operations",
    name: "Operations",
    fullName: "Operations Agent",
    icon: "⟁",
    color: "#E8A0B0",
    role: "Execution Spine",
    confidence: 91,
    status: "ACTIVE",
    load: 78,
    decisionsToday: 4312,
    latency: "14ms",
    description: "The coordination backbone that sequences every dependent action across the network. Routes tasks, resolves resource conflicts, and ensures that 48-task chains complete in the correct order — autonomously, without a project manager.",
    capabilities: [
      "Dependency chain resolution",
      "Cross-agent task sequencing",
      "Conflict arbitration",
      "Execution SLA enforcement",
    ],
    signals: ["Receives directives from all agents", "Issues execution orders", "Reports completion states"],
    nx: 0.74, ny: 0.78,
  },
  {
    id: "intelligence",
    name: "Intelligence",
    fullName: "Intelligence Agent",
    icon: "◬",
    color: "#7C6FE8",
    role: "Decision Engine",
    confidence: 99,
    status: "PROCESSING",
    load: 91,
    decisionsToday: 683,
    latency: "12ms",
    description: "Synthesizes observations from all four peer agents into high-confidence decisions. Surfaces anomalies human analysts would miss, generates post-operation analysis, and continuously improves strategy through each operational cycle.",
    capabilities: [
      "Multi-agent data synthesis",
      "Anomaly surfacing",
      "Strategic recommendation generation",
      "Confidence-weighted decision scoring",
    ],
    signals: ["Ingests all agent telemetry", "Issues strategic recommendations", "Drives learning loops"],
    nx: 0.26, ny: 0.78,
  },
  {
    id: "communication",
    name: "Communication",
    fullName: "Communication Agent",
    icon: "◫",
    color: "#2EBFB0",
    role: "Stakeholder Network",
    confidence: 88,
    status: "READY",
    load: 62,
    decisionsToday: 18940,
    latency: "3ms",
    description: "Automatically broadcasts alerts and updates to 50,000+ stakeholders across SMS, email, and push channels — tiered by urgency, role, and real-time system status. No human communication manager required.",
    capabilities: [
      "Multi-channel alert dispatch",
      "Role-based tiered notifications",
      "Candidate & coordinator briefings",
      "Media advisory generation",
    ],
    signals: ["Receives trigger events from all agents", "Dispatches outbound alerts", "Confirms delivery receipts"],
    nx: 0.13, ny: 0.38,
  },
];

// Every meaningful collaboration link
const CONNECTIONS = [
  { from: "allocation", to: "risk",           weight: 0.9 },
  { from: "allocation", to: "operations",     weight: 1.0 },
  { from: "allocation", to: "intelligence",   weight: 0.7 },
  { from: "risk",       to: "intelligence",   weight: 1.0 },
  { from: "risk",       to: "operations",     weight: 0.85 },
  { from: "risk",       to: "communication",  weight: 0.7 },
  { from: "operations", to: "communication",  weight: 0.9 },
  { from: "operations", to: "intelligence",   weight: 0.8 },
  { from: "intelligence", to: "communication",weight: 0.75 },
  { from: "intelligence", to: "allocation",   weight: 0.85 },
];

const STATUS_CONFIG = {
  ACTIVE:     { color: "#2EBFB0", label: "Active",     pulse: true },
  ALERT:      { color: "#BF8C2C", label: "Alert",      pulse: true },
  PROCESSING: { color: "#7C6FE8", label: "Processing", pulse: true },
  READY:      { color: "#E8A0B0", label: "Ready",      pulse: false },
};

/* ═══════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════ */
function Nav({ isDark, toggleTheme, theme }) {
  const navigate = useNavigate();
  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Agents",   path: "/agents" },
    { label: "Missions", path: "/missions" },
    { label: "Analytics",path: "/analytics" },
    {label:"Orchestrate",path:"/orchestrate"},
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

      <div style={{ display: "flex", gap: 2 }} className="agents-nav-tabs">
        {navItems.map(item => (
          <button key={item.label} onClick={() => navigate(item.path)}
            style={{
              padding: "6px 16px",
              background: item.path === "/agents" ? `rgba(${hex2rgb(theme.crimson)},0.12)` : "transparent",
              border: "none", borderRadius: 5,
              color: item.path === "/agents" ? theme.crimson : theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
              fontWeight: item.path === "/agents" ? 600 : 400,
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
   SYNAPTIC WEB — the signature visual
   A full-width SVG canvas where agents breathe, pulses
   travel along connection threads, and the whole network
   reacts when you hover an agent.
═══════════════════════════════════════════════════════ */

function SynapticWeb({ theme, activeAgent, onAgentHover, onAgentClick, selectedAgent }) {
  const svgRef = useRef();
  const [dims, setDims] = useState({ w: 900, h: 480 });
  const [pulses, setPulses] = useState([]);
  const [tick, setTick] = useState(0);

  // Observe container size
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const e = entries[0];
      setDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Breathing tick for node pulse animation
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(iv);
  }, []);

  // Periodic signal pulses along random connections
  useEffect(() => {
    const spawn = () => {
      const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
      const id = `${Date.now()}-${Math.random()}`;
      setPulses(p => [...p.slice(-18), { id, from: conn.from, to: conn.to, t: 0, color: AGENTS.find(a => a.id === conn.from)?.color || "#fff" }]);
    };
    const iv = setInterval(spawn, 420);
    return () => clearInterval(iv);
  }, []);

  // Advance pulse progress
  useEffect(() => {
    let raf;
    const frame = () => {
      setPulses(prev => prev.map(p => ({ ...p, t: p.t + 0.016 })).filter(p => p.t < 1));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pt = useCallback((agent) => ({
    x: agent.nx * dims.w,
    y: agent.ny * dims.h,
  }), [dims]);

  const lerp = (a, b, t) => a + (b - a) * t;

  const agentMap = useMemo(() => Object.fromEntries(AGENTS.map(a => [a.id, a])), []);

  // Whether a connection should be highlighted
  const isConnHighlighted = useCallback((conn) => {
    if (!activeAgent) return false;
    return conn.from === activeAgent || conn.to === activeAgent;
  }, [activeAgent]);

  const isNodeHighlighted = useCallback((agentId) => {
    if (!activeAgent) return false;
    if (agentId === activeAgent) return true;
    return CONNECTIONS.some(c =>
      (c.from === activeAgent && c.to === agentId) ||
      (c.to === activeAgent && c.from === agentId)
    );
  }, [activeAgent]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      style={{ width: "100%", height: "100%", overflow: "visible" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {AGENTS.map(a => (
          <radialGradient key={`grad-${a.id}`} id={`webglow-${a.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={a.color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={a.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="blur-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Connection threads */}
      {CONNECTIONS.map((conn, i) => {
        const from = agentMap[conn.from];
        const to = agentMap[conn.to];
        if (!from || !to) return null;
        const fp = pt(from);
        const tp = pt(to);
        const highlighted = isConnHighlighted(conn);
        const dimmed = activeAgent && !highlighted;
        const mid = {
          x: (fp.x + tp.x) / 2 + (Math.sin(i * 2.3) * dims.w * 0.04),
          y: (fp.y + tp.y) / 2 + (Math.cos(i * 1.7) * dims.h * 0.06),
        };
        const d = `M ${fp.x} ${fp.y} Q ${mid.x} ${mid.y} ${tp.x} ${tp.y}`;
        return (
          <g key={`conn-${i}`}>
            {/* Background thread */}
            <path
              d={d}
              fill="none"
              stroke={highlighted ? from.color : theme.textFaint}
              strokeWidth={highlighted ? conn.weight * 1.6 : conn.weight * 0.5}
              strokeDasharray={highlighted ? "none" : "3 6"}
              opacity={dimmed ? 0.06 : highlighted ? 0.7 : 0.22}
              style={{ transition: "opacity 0.4s, stroke 0.4s, stroke-width 0.4s" }}
            />
            {/* Glow thread */}
            {highlighted && (
              <path
                d={d}
                fill="none"
                stroke={from.color}
                strokeWidth={conn.weight * 4}
                opacity={0.1}
                filter="url(#blur-glow)"
              />
            )}
          </g>
        );
      })}

      {/* Signal pulses */}
      {pulses.map(pulse => {
        const from = agentMap[pulse.from];
        const to = agentMap[pulse.to];
        if (!from || !to) return null;
        const fp = pt(from);
        const tp = pt(to);
        const connIdx = CONNECTIONS.findIndex(c => c.from === pulse.from && c.to === pulse.to);
        const mid = connIdx >= 0 ? {
          x: (fp.x + tp.x) / 2 + (Math.sin(connIdx * 2.3) * dims.w * 0.04),
          y: (fp.y + tp.y) / 2 + (Math.cos(connIdx * 1.7) * dims.h * 0.06),
        } : { x: (fp.x + tp.x) / 2, y: (fp.y + tp.y) / 2 };

        // Quadratic bezier evaluation
        const t = pulse.t;
        const x = (1 - t) * (1 - t) * fp.x + 2 * (1 - t) * t * mid.x + t * t * tp.x;
        const y = (1 - t) * (1 - t) * fp.y + 2 * (1 - t) * t * mid.y + t * t * tp.y;
        const opacity = Math.sin(t * Math.PI) * (activeAgent ? (pulse.from === activeAgent || pulse.to === activeAgent ? 1 : 0.15) : 0.75);

        return (
          <g key={pulse.id}>
            <circle cx={x} cy={y} r={3.5} fill={pulse.color} opacity={opacity} />
            <circle cx={x} cy={y} r={7} fill={pulse.color} opacity={opacity * 0.2} />
          </g>
        );
      })}

      {/* Agent nodes */}
      {AGENTS.map((agent) => {
        const p = pt(agent);
        const highlighted = isNodeHighlighted(agent.id);
        const isActive = agent.id === activeAgent;
        const isSelected = agent.id === selectedAgent;
        const dimmed = activeAgent && !highlighted;

        const outerR = isActive ? 36 : (highlighted ? 28 : 22);
        const innerR = isActive ? 18 : (highlighted ? 14 : 11);

        return (
          <g
            key={agent.id}
            style={{ cursor: "pointer" }}
            onClick={() => onAgentClick(agent.id)}
            onMouseEnter={() => onAgentHover(agent.id)}
            onMouseLeave={() => onAgentHover(null)}
          >
            {/* Outer glow */}
            <circle
              cx={p.x} cy={p.y}
              r={outerR * 2.2}
              fill={`url(#webglow-${agent.id})`}
              opacity={dimmed ? 0.04 : isActive ? 0.7 : 0.22}
              style={{ transition: "r 0.4s, opacity 0.4s" }}
            />

            {/* Orbit ring — breathes */}
            <circle
              cx={p.x} cy={p.y}
              r={outerR}
              fill="none"
              stroke={agent.color}
              strokeWidth={isActive ? 1.2 : 0.6}
              strokeDasharray={isActive ? "none" : "4 8"}
              opacity={dimmed ? 0.06 : isActive ? 0.55 : 0.3}
              style={{ transition: "r 0.4s, opacity 0.4s, stroke-width 0.4s" }}
            >
              {isActive && (
                <animateTransform attributeName="transform" type="rotate"
                  from={`0 ${p.x} ${p.y}`} to={`360 ${p.x} ${p.y}`}
                  dur="8s" repeatCount="indefinite" />
              )}
            </circle>

            {/* Node body */}
            <circle
              cx={p.x} cy={p.y}
              r={innerR}
              fill={`rgba(${hex2rgb(agent.color)},${isActive ? 0.28 : highlighted ? 0.16 : 0.1})`}
              stroke={agent.color}
              strokeWidth={isActive ? 2 : 1.2}
              opacity={dimmed ? 0.15 : 1}
              style={{ transition: "r 0.35s, opacity 0.4s, fill 0.4s" }}
            />

            {/* Glow filter on active */}
            {isActive && (
              <circle
                cx={p.x} cy={p.y}
                r={innerR}
                fill="none"
                stroke={agent.color}
                strokeWidth={8}
                opacity={0.15}
                filter="url(#node-glow)"
              />
            )}

            {/* Icon */}
            <text
              x={p.x} y={p.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isActive ? 13 : 10}
              fill={agent.color}
              opacity={dimmed ? 0.2 : 1}
              style={{ fontFamily: "monospace", pointerEvents: "none", transition: "font-size 0.3s, opacity 0.4s" }}
            >
              {agent.icon}
            </text>

            {/* Label */}
            <text
              x={p.x}
              y={p.y + innerR + (isActive ? 24 : 18)}
              textAnchor="middle"
              fontSize={isActive ? 11 : 9}
              fill={dimmed ? theme.textFaint : isActive ? agent.color : theme.textMuted}
              style={{ fontFamily: "'Space Grotesk', sans-serif", pointerEvents: "none", transition: "all 0.3s" }}
            >{agent.name}</text>

            {/* Status pulse dot */}
            {!dimmed && (
              <circle cx={p.x + innerR * 0.7} cy={p.y - innerR * 0.7} r={3}
                fill={STATUS_CONFIG[agent.status]?.color || agent.color}
                opacity={0.9}
              >
                {STATUS_CONFIG[agent.status]?.pulse && (
                  <animate attributeName="r" values="3;5;3" dur="1.8s" repeatCount="indefinite" />
                )}
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   AGENT DETAIL PANEL
═══════════════════════════════════════════════════════ */
function AgentDetailPanel({ agent, theme, onClose }) {
  if (!agent) return null;
  const statusCfg = STATUS_CONFIG[agent.status] || {};

  return (
    <AnimatePresence>
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          border: `1px solid ${agent.color}44`,
          borderRadius: 14,
          background: theme.surface,
          backdropFilter: "blur(28px) saturate(1.8)",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${agent.color} 50%, transparent 100%)`,
        }} />

        {/* Left color stripe */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
          background: `linear-gradient(to bottom, ${agent.color}, transparent)`,
          opacity: 0.6,
        }} />

        <div style={{ padding: "28px 28px 28px 34px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                border: `1.5px solid ${agent.color}66`,
                background: `rgba(${hex2rgb(agent.color)},0.12)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, color: agent.color, flexShrink: 0,
              }}>{agent.icon}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 28, fontWeight: 600, color: theme.text, margin: 0, lineHeight: 1 }}>
                    {agent.fullName}
                  </h3>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, fontWeight: 700,
                    color: statusCfg.color, letterSpacing: "0.14em", textTransform: "uppercase",
                    background: `rgba(${hex2rgb(statusCfg.color || agent.color)},0.12)`,
                    padding: "3px 8px", borderRadius: 4,
                  }}>{agent.status}</span>
                </div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: agent.color, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
                  {agent.role}
                </div>
              </div>
            </div>

            <button onClick={onClose}
              style={{ background: "none", border: `1px solid ${theme.borderSubtle}`, borderRadius: 6, padding: "6px 12px", color: theme.textFaint, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.1em" }}>
              ESC
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(16px, 2.5vw, 32px)" }} className="agent-detail-grid">
            {/* Left: Description + Capabilities */}
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.72, margin: "0 0 22px" }}>
                {agent.description}
              </p>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
                  Core Capabilities
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {agent.capabilities.map((cap, i) => (
                    <motion.div key={cap}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: agent.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: theme.textMuted, fontWeight: 300 }}>{cap}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
                  Signal Flow
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {agent.signals.map((sig, i) => (
                    <div key={sig} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 9, color: agent.color, flexShrink: 0 }}>
                        {i === 0 ? "↑" : i === 1 ? "↓" : "↔"}
                      </span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: theme.textMuted, fontWeight: 300 }}>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Metrics */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Confidence meter */}
              <div style={{ padding: "18px 20px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 10, background: theme.glass }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Decision Confidence</span>
                  <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 26, fontWeight: 700, color: agent.color, lineHeight: 1 }}>{agent.confidence}%</span>
                </div>
                <div style={{ height: 3, background: theme.textFaint, borderRadius: 2, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${agent.confidence}%` }} transition={{ duration: 1.1, ease: "easeOut" }}
                    style={{ height: "100%", background: `linear-gradient(90deg, ${agent.color}, ${agent.color}88)`, borderRadius: 2 }} />
                </div>
              </div>

              {/* Agent load */}
              <div style={{ padding: "18px 20px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 10, background: theme.glass }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Agent Load</span>
                  <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 26, fontWeight: 700, color: agent.load > 85 ? theme.crimson : theme.gold, lineHeight: 1 }}>{agent.load}%</span>
                </div>
                <div style={{ height: 3, background: theme.textFaint, borderRadius: 2, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${agent.load}%` }} transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
                    style={{ height: "100%", background: agent.load > 85 ? `linear-gradient(90deg, ${theme.crimson}, ${theme.gold})` : `linear-gradient(90deg, ${theme.gold}, ${theme.gold}88)`, borderRadius: 2 }} />
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Decisions Today", value: agent.decisionsToday.toLocaleString(), color: agent.color },
                  { label: "Avg. Latency", value: agent.latency, color: theme.gold },
                ].map(s => (
                  <div key={s.label} style={{ padding: "14px 16px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, background: theme.glass }}>
                    <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 5 }}>{s.value}</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Connected agents */}
              <div style={{ padding: "14px 16px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, background: theme.glass }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Connected Agents</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {AGENTS.filter(a => a.id !== agent.id && CONNECTIONS.some(c =>
                    (c.from === agent.id && c.to === a.id) || (c.from === a.id && c.to === agent.id)
                  )).map(peer => (
                    <div key={peer.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 4, background: `rgba(${hex2rgb(peer.color)},0.1)`, border: `1px solid ${peer.color}33` }}>
                      <span style={{ fontSize: 9, color: peer.color }}>{peer.icon}</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: peer.color, letterSpacing: "0.06em" }}>{peer.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   AGENT ROSTER — compact cards below the web for mobile
═══════════════════════════════════════════════════════ */
function AgentRosterCard({ agent, theme, isActive, onHover, onClick }) {
  const statusCfg = STATUS_CONFIG[agent.status] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(agent.id)}
      onMouseEnter={() => onHover(agent.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        padding: "16px 18px",
        border: `1px solid ${isActive ? agent.color + "55" : theme.borderSubtle}`,
        borderRadius: 10,
        background: isActive ? `rgba(${hex2rgb(agent.color)},0.07)` : theme.glass,
        backdropFilter: "blur(16px)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
        boxShadow: isActive ? `0 4px 32px rgba(${hex2rgb(agent.color)},0.14)` : "none",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`, opacity: isActive ? 1 : 0.25, transition: "opacity 0.3s" }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          border: `1px solid ${agent.color}55`,
          background: `rgba(${hex2rgb(agent.color)},0.1)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, color: agent.color,
        }}>{agent.icon}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
            {statusCfg.pulse ? (
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: statusCfg.color, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusCfg.color, opacity: 0.6, flexShrink: 0 }} />
            )}
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: statusCfg.color, letterSpacing: "0.16em", fontWeight: 700, textTransform: "uppercase" }}>{agent.status}</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 18, fontWeight: 600, color: theme.text, lineHeight: 1, marginBottom: 2 }}>{agent.fullName}</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: agent.color, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{agent.role}</div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 24, fontWeight: 700, color: theme.text, lineHeight: 1 }}>{agent.confidence}%</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>Confidence</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   LIVE COLLABORATION FEED
   Shows real-time inter-agent message events
═══════════════════════════════════════════════════════ */
const COLLAB_POOL = [
  { from: "Risk", to: "Allocation", icon: "⬡→◈", msg: "Zone 7 capacity threshold breached · 340 candidates flagged" },
  { from: "Intelligence", to: "Allocation", icon: "◬→◈", msg: "Recommend preemptive center rebalance · confidence 97%" },
  { from: "Allocation", to: "Operations", icon: "◈→⟁", msg: "Center B12 reserved · deploy proctor mesh" },
  { from: "Operations", to: "Communication", icon: "⟁→◫", msg: "Relocation confirmed · trigger stakeholder alert batch" },
  { from: "Risk", to: "Intelligence", icon: "⬡→◬", msg: "NH-48 congestion probability 74% · escalating" },
  { from: "Intelligence", to: "Operations", icon: "◬→⟁", msg: "Protocol Delta engaged · 48 tasks queued" },
  { from: "Operations", to: "Allocation", icon: "⟁→◈", msg: "Transport routes secured · update capacity model" },
  { from: "Communication", to: "Intelligence", icon: "◫→◬", msg: "99.2% SMS delivery rate · log resolution event" },
];

function CollaborationFeed({ theme }) {
  const [items, setItems] = useState(COLLAB_POOL.slice(0, 4).map((m, i) => ({ ...m, id: i, ts: `${String(Math.floor(Math.random() * 9)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}` })));
  const scrollRef = useRef();
  const poolIdx = useRef(4);

  useEffect(() => {
    const iv = setInterval(() => {
      const entry = COLLAB_POOL[poolIdx.current % COLLAB_POOL.length];
      const now = new Date();
      const ts = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setItems(prev => [...prev.slice(-12), { ...entry, id: Date.now(), ts }]);
      poolIdx.current++;
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [items]);

  const agentColor = (name) => AGENTS.find(a => a.name === name)?.color || theme.textMuted;

  return (
    <div ref={scrollRef} style={{ height: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
      {items.map((item, i) => (
        <motion.div key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28 }}
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "9px 12px",
            borderRadius: 6,
            background: i === items.length - 1 ? `rgba(${hex2rgb(agentColor(item.from))},0.05)` : "transparent",
            borderLeft: i === items.length - 1 ? `2px solid ${agentColor(item.from)}` : "2px solid transparent",
          }}>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: agentColor(item.from), lineHeight: "18px", flexShrink: 0 }}>{item.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, fontWeight: 700, color: agentColor(item.from), letterSpacing: "0.1em" }}>{item.from}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint }}>→</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, fontWeight: 600, color: agentColor(item.to), letterSpacing: "0.1em" }}>{item.to}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, marginLeft: "auto" }}>{item.ts}</span>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: theme.textMuted, fontWeight: 300, lineHeight: 1.5, margin: 0 }}>{item.msg}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SYSTEM HEARTBEAT — ambient live metrics strip
═══════════════════════════════════════════════════════ */
function SystemHeartbeat({ theme }) {
  const [metrics, setMetrics] = useState({
    msgs: 4200,
    decisions: 9347,
    latency: 10,
    uptime: 99.97,
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setMetrics(m => ({
        msgs: m.msgs + Math.floor(Math.random() * 120 - 20),
        decisions: m.decisions + Math.floor(Math.random() * 60),
        latency: Math.max(7, Math.min(16, m.latency + Math.floor(Math.random() * 3 - 1))),
        uptime: 99.97,
      }));
    }, 1800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {[
        { label: "Inter-agent Messages / hr", value: metrics.msgs.toLocaleString(), color: theme.crimson },
        { label: "Decisions Today", value: metrics.decisions.toLocaleString(), color: theme.gold },
        { label: "Mesh Latency", value: `${metrics.latency}ms`, color: theme.sakura },
        { label: "Network Uptime", value: `${metrics.uptime}%`, color: "#2EBFB0" },
        { label: "Active Connections", value: CONNECTIONS.length.toString(), color: theme.agentColors[3] },
      ].map((m, i) => (
        <motion.div key={m.label}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          style={{ flex: 1, minWidth: 130, padding: "14px 18px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, background: theme.glass, backdropFilter: "blur(16px)" }}>
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(22px, 2.2vw, 30px)", fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{m.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AGENTS PAGE ROOT
═══════════════════════════════════════════════════════ */
export default function AgentsPage() {
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

  const [activeAgent, setActiveAgent] = useState(null);   // hovered in web
  const [selectedAgent, setSelectedAgent] = useState(null); // clicked → detail panel

  const handleAgentHover = useCallback((id) => setActiveAgent(id), []);
  const handleAgentClick = useCallback((id) => {
    setSelectedAgent(prev => prev === id ? null : id);
  }, []);

  const selectedAgentData = useMemo(() => AGENTS.find(a => a.id === selectedAgent) || null, [selectedAgent]);

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

        @media (max-width: 860px) {
          .agents-nav-tabs { display: none !important; }
          .agents-web-container { height: 340px !important; }
          .agents-bottom-grid { grid-template-columns: 1fr !important; }
          .agent-detail-grid { grid-template-columns: 1fr !important; }
          .agents-heartbeat { flex-wrap: wrap !important; }
          .agents-heartbeat > div { min-width: calc(50% - 6px) !important; }
        }
        @media (max-width: 520px) {
          .agents-heartbeat > div { min-width: 100% !important; }
          .agents-web-container { height: 260px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: theme.bgGradient, pointerEvents: "none" }} />
      <SakuraPetals isDark={isDark} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: isDark ? 0.02 : 0.012, mixBlendMode: "overlay" }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        <Nav isDark={isDark} toggleTheme={toggleTheme} theme={theme} />

        <div style={{ paddingTop: 58, minHeight: "100vh", padding: "58px clamp(12px, 3vw, 40px) 60px" }}>

          {/* ══════ HERO HEADER ══════ */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ paddingTop: "clamp(20px, 3vw, 36px)", paddingBottom: "clamp(20px, 2.5vw, 28px)", borderBottom: `1px solid ${theme.borderSubtle}`, marginBottom: "clamp(20px, 2.5vw, 28px)" }}>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 22, height: 1.5, background: theme.crimson }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.26em", color: theme.crimson, textTransform: "uppercase", fontWeight: 500 }}>
                OrchestrAI · Intelligence Command Network
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 400, lineHeight: 1.0, color: theme.text, margin: 0 }}>
                  The <em style={{ color: theme.crimson }}>Five Minds</em>
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.textMuted, fontWeight: 300, marginTop: 6 }}>
                  Five specialized agents. One coherent intelligence. Real-time collaboration at national scale.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, background: theme.glass, backdropFilter: "blur(12px)" }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#2EBFB0" }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: "#2EBFB0", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Agent mesh online</span>
              </div>
            </div>

            {/* Live metrics */}
            <div className="agents-heartbeat">
              <SystemHeartbeat theme={theme} />
            </div>
          </motion.div>

          {/* ══════ SYNAPTIC WEB ══════ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.8 }}
            style={{ marginBottom: "clamp(16px, 2.5vw, 28px)" }}>

            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 1.5, background: theme.gold }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.gold, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>Synaptic Web · Live</span>
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.1em" }}>
                {selectedAgent ? `${AGENTS.find(a => a.id === selectedAgent)?.fullName} selected` : "Hover to illuminate connections · Click to inspect"}
              </span>
            </div>

            {/* The network canvas */}
            <div
              className="agents-web-container"
              style={{
                height: "clamp(340px, 42vh, 560px)",
                border: `1px solid ${theme.borderSubtle}`,
                borderRadius: 14,
                background: isDark ? "rgba(8,4,18,0.6)" : "rgba(230,224,214,0.5)",
                backdropFilter: "blur(20px)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Radial glow behind the web */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: isDark ? "radial-gradient(ellipse at 50% 50%, rgba(196,0,43,0.05) 0%, transparent 65%)" : "radial-gradient(ellipse at 50% 50%, rgba(184,0,42,0.04) 0%, transparent 65%)" }} />

              <SynapticWeb
                theme={theme}
                activeAgent={activeAgent}
                onAgentHover={handleAgentHover}
                onAgentClick={handleAgentClick}
                selectedAgent={selectedAgent}
              />

              {/* Hint overlay when nothing is hovered */}
              <AnimatePresence>
                {!activeAgent && !selectedAgent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.5, duration: 0.5 }}
                    style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.2em", textTransform: "uppercase", pointerEvents: "none", whiteSpace: "nowrap" }}>
                    Hover any agent node to see signal flow
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ══════ AGENT DETAIL PANEL ══════ */}
          <AnimatePresence mode="wait">
            {selectedAgentData && (
              <motion.div
                key={selectedAgentData.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: "clamp(16px, 2.5vw, 28px)", overflow: "hidden" }}
              >
                <AgentDetailPanel
                  agent={selectedAgentData}
                  theme={theme}
                  onClose={() => setSelectedAgent(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════ AGENT ROSTER + COLLAB FEED ══════ */}
          <div className="agents-bottom-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(12px, 1.8vw, 20px)", marginBottom: "clamp(16px, 2.5vw, 28px)" }}>

            {/* Agent roster */}
            <div>
              <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 1.5, background: theme.sakura }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.sakura, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>Agent Registry</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {AGENTS.map((agent, i) => (
                  <motion.div key={agent.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}>
                    <AgentRosterCard
                      agent={agent}
                      theme={theme}
                      isActive={selectedAgent === agent.id || activeAgent === agent.id}
                      onHover={handleAgentHover}
                      onClick={handleAgentClick}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Collaboration feed */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 1.5, background: theme.gold }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.gold, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>Agent Collaboration Feed</span>
                </div>
                <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.crimson, letterSpacing: "0.16em" }}>LIVE</span>
                </motion.div>
              </div>

              <div style={{ border: `1px solid ${theme.borderSubtle}`, borderRadius: 12, background: theme.surface, backdropFilter: "blur(22px)", padding: "20px", height: "calc(100% - 42px)" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.55, marginBottom: 16 }}>
                  Inter-agent signals flowing in real time across the intelligence mesh.
                </p>
                <CollaborationFeed theme={theme} />

                {/* Network stats footer */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${theme.borderSubtle}`, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Active Links", value: `${CONNECTIONS.length}`, color: theme.crimson },
                    { label: "Agents Online", value: "5 / 5", color: "#2EBFB0" },
                    { label: "Mesh Health", value: "OPTIMAL", color: theme.gold },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, color: s.color, marginBottom: 2 }}>{s.value}</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ══════ INTELLIGENCE PRINCIPLES ══════ */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ marginBottom: "clamp(16px, 2.5vw, 28px)" }}>
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 1.5, background: theme.agentColors[3] }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.agentColors[3], letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>Design Principles</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px,100%),1fr))", gap: 12 }}>
              {[
                { icon: "⟳", title: "Continuous Adaptation", desc: "Every agent updates its model with each event. The network never stops learning.", color: theme.crimson },
                { icon: "⬡", title: "Distributed Judgment", desc: "No single agent holds all authority. Consensus emerges from collaboration.", color: theme.gold },
                { icon: "◈", title: "Zero Human Bottleneck", desc: "Decisions propagate at machine speed. Human approval is optional, never required.", color: theme.sakura },
                { icon: "◬", title: "Explainable by Design", desc: "Every recommendation comes with confidence score, rationale, and provenance.", color: theme.agentColors[3] },
                { icon: "◫", title: "Graceful Escalation", desc: "When confidence drops below threshold, the network surfaces humans at precisely the right moment.", color: "#2EBFB0" },
              ].map((p, i) => (
                <motion.div key={p.title}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 + i * 0.07 }}
                  style={{ padding: "20px 18px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 10, background: theme.glass, backdropFilter: "blur(14px)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`, opacity: 0.4 }} />
                  <div style={{ fontSize: 18, color: p.color, marginBottom: 10, fontFamily: "monospace" }}>{p.icon}</div>
                  <h4 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 18, fontWeight: 500, color: theme.text, margin: "0 0 8px", lineHeight: 1.1 }}>{p.title}</h4>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: theme.textMuted, fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ══════ FOOTER ══════ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{ paddingTop: 20, borderTop: `1px solid ${theme.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint, letterSpacing: "0.1em" }}>OrchestrAI © 2025 · Intelligence Mesh v2.4.1</span>
            <div style={{ display: "flex", gap: 16 }}>
              {[["Agent Mesh", "HEALTHY", "#2EBFB0"], ["Signal Bus", "STREAMING", theme.gold]].map(([l, v, c]) => (
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