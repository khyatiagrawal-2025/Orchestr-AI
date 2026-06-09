/**
 * OrchestrAI — MissionsPage.jsx
 * Route: /missions
 *
 * Inherits exact design language from HomePage.jsx + Dashboard.jsx
 * Palette, typography, theme system, and interaction patterns are identical.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════
   THEME SYSTEM — identical to HomePage/Dashboard
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
   MISSIONS DATA
═══════════════════════════════════════════════════════ */
const MISSIONS_DATA = [
  {
    id: "neet-2027",
    code: "OP-001",
    name: "NEET 2027",
    domain: "Examination Operations",
    status: "LIVE",
    riskScore: 24,
    healthScore: 99,
    confidence: 96,
    activeAgents: 5,
    candidates: "2.3M",
    centers: 4820,
    alerts: 3,
    progress: 68,
    eta: "14d 6h",
    lastUpdate: "32s ago",
    color: "#C4002B",
    description: "National-scale medical entrance coordination across 4,820 examination centers. Three active disruption scenarios under autonomous resolution.",
    tags: ["Health", "National", "Critical"],
    agentStatus: ["ACTIVE", "ALERT", "ACTIVE", "PROCESSING", "READY"],
  },
  {
    id: "cuet-ops",
    code: "OP-002",
    name: "CUET Operations",
    domain: "Examination Operations",
    status: "STAGING",
    riskScore: 41,
    healthScore: 87,
    confidence: 91,
    activeAgents: 4,
    candidates: "890K",
    centers: 1920,
    alerts: 7,
    progress: 34,
    eta: "31d 12h",
    lastUpdate: "4m ago",
    color: "#BF8C2C",
    description: "Central University Entrance Test logistics. Staging phase with 7 resource conflicts flagged for autonomous resolution.",
    tags: ["Education", "National", "Staging"],
    agentStatus: ["ACTIVE", "PROCESSING", "ACTIVE", "STANDBY", "READY"],
  },
  {
    id: "ssc-recruitment",
    code: "OP-003",
    name: "SSC Recruitment Drive",
    domain: "Government Recruitment",
    status: "PLANNING",
    riskScore: 12,
    healthScore: 100,
    confidence: 84,
    activeAgents: 3,
    candidates: "340K",
    centers: 680,
    alerts: 0,
    progress: 12,
    eta: "68d",
    lastUpdate: "18m ago",
    color: "#2EBFB0",
    description: "Staff Selection Commission recruitment across 680 centers. Early planning phase with clean resource forecast.",
    tags: ["Government", "Recruitment", "Planning"],
    agentStatus: ["ACTIVE", "STANDBY", "ACTIVE", "STANDBY", "STANDBY"],
  },
  {
    id: "election-logistics",
    code: "OP-004",
    name: "Election Logistics 2025",
    domain: "Civic Operations",
    status: "COMPLETED",
    riskScore: 8,
    healthScore: 97,
    confidence: 99,
    activeAgents: 0,
    candidates: "12.4M",
    centers: 18400,
    alerts: 0,
    progress: 100,
    eta: "Completed",
    lastUpdate: "3d ago",
    color: "#7C6FE8",
    description: "General election booth coordination across 18,400 polling stations. Autonomous disruption handling achieved zero incident rate.",
    tags: ["Civic", "National", "Completed"],
    agentStatus: ["DONE", "DONE", "DONE", "DONE", "DONE"],
  },
  {
    id: "smart-city-deploy",
    code: "OP-005",
    name: "Smart City Deployment",
    domain: "Urban Infrastructure",
    status: "STAGING",
    riskScore: 33,
    healthScore: 91,
    confidence: 88,
    activeAgents: 4,
    candidates: "—",
    centers: 2200,
    alerts: 4,
    progress: 22,
    eta: "45d",
    lastUpdate: "7m ago",
    color: "#E8A0B0",
    description: "Autonomous traffic, utilities, and emergency services coordination for Tier-1 metro deployment. Phase 1 of 3.",
    tags: ["Urban", "Infrastructure", "Multi-phase"],
    agentStatus: ["ACTIVE", "PROCESSING", "ACTIVE", "ACTIVE", "READY"],
  },
  {
    id: "supply-chain-op",
    code: "OP-006",
    name: "Supply Chain Surge",
    domain: "Logistics Networks",
    status: "LIVE",
    riskScore: 52,
    healthScore: 78,
    confidence: 89,
    activeAgents: 5,
    candidates: "—",
    centers: 340,
    alerts: 11,
    progress: 55,
    eta: "8d",
    lastUpdate: "1m ago",
    color: "#BF8C2C",
    description: "Festival-season supply chain surge management across 340 distribution nodes. Elevated risk profile with 11 active rerouting operations.",
    tags: ["Logistics", "Commercial", "High-Risk"],
    agentStatus: ["ACTIVE", "ALERT", "ACTIVE", "PROCESSING", "ACTIVE"],
  },
];

const STATUS_CONFIG = {
  LIVE: { color: "#C4002B", label: "Live", pulse: true },
  STAGING: { color: "#BF8C2C", label: "Staging", pulse: false },
  PLANNING: { color: "#2EBFB0", label: "Planning", pulse: false },
  COMPLETED: { color: "rgba(240,235,225,0.3)", label: "Completed", pulse: false },
};

const AGENT_ICONS = ["◈", "⬡", "⟁", "◫", "◬"];
const AGENT_NAMES = ["Allocation", "Risk", "Operations", "Comm", "Intelligence"];

/* ═══════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════ */
function Nav({ isDark, toggleTheme, theme }) {
  const navigate = useNavigate();
  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Missions", path: "/missions" },
    { label: "Analytics", path: "/analytics" },
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
      <button
        onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}
      >
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

      <div style={{ display: "flex", gap: 2 }}>
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              padding: "6px 16px", background: item.path === "/missions" ? `rgba(${hex2rgb(theme.crimson)},0.12)` : "transparent",
              border: "none", borderRadius: 5,
              color: item.path === "/missions" ? theme.crimson : theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
              fontWeight: item.path === "/missions" ? 600 : 400,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >{item.label}</button>
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
   RISK SCORE GAUGE
═══════════════════════════════════════════════════════ */
function RiskGauge({ value, theme }) {
  const color = value > 50 ? theme.crimson : value > 30 ? theme.gold : "#2EBFB0";
  const width = Math.min(value, 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Risk</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 2, background: theme.textFaint, borderRadius: 1, overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 1 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MISSION CARD
═══════════════════════════════════════════════════════ */
function MissionCard({ mission, theme, delay, onOpen }) {
  const [hov, setHov] = useState(false);
  const statusCfg = STATUS_CONFIG[mission.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      onClick={() => onOpen(mission.id)}
      style={{
        position: "relative", overflow: "hidden",
        padding: "24px 24px 20px",
        border: `1px solid ${hov ? mission.color + "55" : theme.borderSubtle}`,
        borderRadius: 12,
        background: hov ? `rgba(${hex2rgb(mission.color)},0.045)` : theme.glass,
        backdropFilter: "blur(20px)",
        cursor: "pointer",
        transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
        boxShadow: hov ? `0 8px 48px rgba(${hex2rgb(mission.color)},0.12)` : "none",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${mission.color} 50%, transparent 100%)`,
        opacity: hov ? 1 : 0.35, transition: "opacity 0.3s",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
            {statusCfg.pulse ? (
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: statusCfg.color, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusCfg.color, opacity: 0.6, flexShrink: 0 }} />
            )}
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: statusCfg.color, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>{statusCfg.label}</span>
            {mission.alerts > 0 && (
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.crimson, background: `rgba(${hex2rgb(theme.crimson)},0.12)`, padding: "1px 7px", borderRadius: 3, letterSpacing: "0.05em", flexShrink: 0 }}>
                {mission.alerts} alerts
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 600, color: theme.text, margin: 0, lineHeight: 1.1 }}>{mission.name}</h3>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, marginTop: 3, letterSpacing: "0.1em" }}>{mission.domain} · {mission.code}</div>
        </div>
        {/* Health score */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 32, fontWeight: 700, color: theme.text, lineHeight: 1 }}>{mission.healthScore}<span style={{ fontSize: 14, color: theme.textMuted }}>%</span></div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Health</div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: theme.textMuted, fontWeight: 300, lineHeight: 1.6, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {mission.description}
      </p>

      {/* Risk gauge */}
      <div style={{ marginBottom: 14 }}>
        <RiskGauge value={mission.riskScore} theme={theme} />
      </div>

      {/* Active agents row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>Agents</span>
        <div style={{ display: "flex", gap: 3 }}>
          {AGENT_ICONS.map((icon, i) => {
            const isActive = mission.agentStatus[i] === "ACTIVE" || mission.agentStatus[i] === "ALERT" || mission.agentStatus[i] === "PROCESSING";
            return (
              <div key={i} title={AGENT_NAMES[i]} style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `1px solid ${isActive ? mission.color + "66" : theme.textFaint}`,
                background: isActive ? `rgba(${hex2rgb(mission.color)},0.1)` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8,
                color: isActive ? mission.color : theme.textFaint,
                transition: "all 0.2s",
              }}>{icon}</div>
            );
          })}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: mission.color, fontWeight: 700, marginLeft: 4 }}>
          {mission.activeAgents}/5 active
        </span>
      </div>

      {/* Stats footer */}
      <div style={{ display: "flex", gap: 14, paddingTop: 14, borderTop: `1px solid ${theme.borderSubtle}` }}>
        {[
          { label: "Candidates", value: mission.candidates },
          { label: "Centers", value: typeof mission.centers === "number" ? mission.centers.toLocaleString() : mission.centers },
          { label: "Confidence", value: `${mission.confidence}%`, color: mission.color },
          { label: "ETA", value: mission.eta },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, color: s.color || theme.text, lineHeight: 1, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.value}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hover CTA */}
      <AnimatePresence>
        {hov && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.18 }}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "10px 24px",
              background: `linear-gradient(to top, rgba(${hex2rgb(mission.color)},0.12) 0%, transparent 100%)`,
              display: "flex", justifyContent: "flex-end", alignItems: "center",
              pointerEvents: "none",
            }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: mission.color, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Open Mission →</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FILTER BAR
═══════════════════════════════════════════════════════ */
function FilterBar({ activeFilter, onFilter, theme, counts }) {
  const filters = [
    { key: "ALL", label: `All Missions`, count: counts.ALL },
    { key: "LIVE", label: "Live", count: counts.LIVE },
    { key: "STAGING", label: "Staging", count: counts.STAGING },
    { key: "PLANNING", label: "Planning", count: counts.PLANNING },
    { key: "COMPLETED", label: "Completed", count: counts.COMPLETED },
  ];

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {filters.map(f => (
        <button key={f.key} onClick={() => onFilter(f.key)}
          style={{
            padding: "7px 14px", borderRadius: 6,
            background: activeFilter === f.key ? `rgba(${hex2rgb(theme.crimson)},0.12)` : "transparent",
            border: `1px solid ${activeFilter === f.key ? theme.crimson + "44" : theme.borderSubtle}`,
            color: activeFilter === f.key ? theme.crimson : theme.textMuted,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
            fontWeight: activeFilter === f.key ? 600 : 400,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 7,
          }}>
          {f.label}
          <span style={{ background: activeFilter === f.key ? `rgba(${hex2rgb(theme.crimson)},0.15)` : theme.textFaint + "33", padding: "0px 5px", borderRadius: 3, fontSize: 8, fontWeight: 700 }}>{f.count}</span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MISSIONS PAGE
═══════════════════════════════════════════════════════ */
export default function MissionsPage() {
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

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("status");

  const filtered = MISSIONS_DATA.filter(m => activeFilter === "ALL" || m.status === activeFilter);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "risk") return b.riskScore - a.riskScore;
    if (sortBy === "health") return b.healthScore - a.healthScore;
    if (sortBy === "confidence") return b.confidence - a.confidence;
    // status: LIVE first
    const order = { LIVE: 0, STAGING: 1, PLANNING: 2, COMPLETED: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  const counts = {
    ALL: MISSIONS_DATA.length,
    LIVE: MISSIONS_DATA.filter(m => m.status === "LIVE").length,
    STAGING: MISSIONS_DATA.filter(m => m.status === "STAGING").length,
    PLANNING: MISSIONS_DATA.filter(m => m.status === "PLANNING").length,
    COMPLETED: MISSIONS_DATA.filter(m => m.status === "COMPLETED").length,
  };

  // System-wide stats
  const totalAlerts = MISSIONS_DATA.reduce((s, m) => s + m.alerts, 0);
  const liveCount = counts.LIVE;
  const avgConfidence = Math.round(MISSIONS_DATA.reduce((s, m) => s + m.confidence, 0) / MISSIONS_DATA.length);

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
        @media (max-width: 900px) {
          .missions-grid { grid-template-columns: 1fr !important; }
          .missions-stats-row { flex-wrap: wrap !important; }
          .missions-stats-row > div { min-width: calc(50% - 6px) !important; }
        }
        @media (max-width: 500px) {
          .missions-stats-row > div { min-width: 100% !important; }
        }
      `}</style>

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
                OrchestrAI · Mission Registry
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 400, lineHeight: 1.0, color: theme.text, margin: 0 }}>
                  Active <em style={{ color: theme.crimson }}>Missions</em>
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.textMuted, fontWeight: 300, marginTop: 6 }}>
                  Autonomous operations across all deployed domains · Real-time status
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 8px 32px ${theme.crimsonGlow}` }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "10px 24px", background: theme.crimson, border: "none", borderRadius: 6, color: "#F0EBE1", fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                + Deploy Mission
              </motion.button>
            </div>

            {/* System-wide stats */}
            <div className="missions-stats-row" style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Total Missions", value: MISSIONS_DATA.length, color: theme.text },
                { label: "Live Operations", value: liveCount, color: theme.crimson },
                { label: "Active Alerts", value: totalAlerts, color: totalAlerts > 5 ? theme.crimson : theme.gold },
                { label: "Avg. Confidence", value: `${avgConfidence}%`, color: theme.gold },
                { label: "Domains", value: "6", color: theme.sakura },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                  style={{ flex: 1, minWidth: 100, padding: "14px 18px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, background: theme.glass, backdropFilter: "blur(18px)" }}>
                  <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(24px, 2.5vw, 34px)", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ══════ FILTER + SORT ROW ══════ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <FilterBar activeFilter={activeFilter} onFilter={setActiveFilter} theme={theme} counts={counts} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sort:</span>
              {["status", "risk", "health", "confidence"].map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  style={{ padding: "5px 11px", background: sortBy === s ? `rgba(${hex2rgb(theme.gold)},0.1)` : "transparent", border: `1px solid ${sortBy === s ? theme.gold + "44" : theme.borderSubtle}`, borderRadius: 5, color: sortBy === s ? theme.gold : theme.textMuted, fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.07em", textTransform: "capitalize", cursor: "pointer", transition: "all 0.2s" }}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ══════ MISSIONS GRID ══════ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter + sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="missions-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "clamp(10px, 1.5vw, 16px)" }}
            >
              {sorted.map((mission, i) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  theme={theme}
                  delay={i * 0.06}
                  onOpen={(id) => navigate(`/missions/${id}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* ══════ FOOTER ══════ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${theme.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint, letterSpacing: "0.1em" }}>OrchestrAI © 2025 · Mission Registry v2.4.1</span>
            <div style={{ display: "flex", gap: 16 }}>
              {[["Data Pipeline", "STREAMING", theme.gold], ["Agent Mesh", "HEALTHY", "#2EBFB0"]].map(([l, v, c]) => (
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