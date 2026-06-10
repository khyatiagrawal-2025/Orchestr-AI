/**
 * OrchestrAI — AnalyticsPage.jsx
 * Route: /analytics
 *
 * "Operational Intelligence Report"
 * This is the evidence. The proof that autonomous agents improved operations.
 *
 * Design: Japanese Futuristic Luxury × Mission Control
 * Inherits exact theme system, typography, palette, motion, and spacing from
 * HomePage, Dashboard, MissionsPage, MissionDetailPage, AgentsPage, OrchestratePage.
 *
 * Global theme persisted via localStorage("orchestrai-theme").
 */

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════
   THEME SYSTEM — identical to all pages
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

function useCountUp(target, duration = 2000, delay = 0, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s;
    const timer = setTimeout(() => {
      const step = (ts) => {
        if (!s) s = ts;
        const progress = Math.min((ts - s) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay, start]);
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
        opacity: Math.random() * 0.22 + 0.05,
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
   REUSABLE PRIMITIVES
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
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ text, color, theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <div style={{ width: 18, height: 1.5, background: color || theme.crimson }} />
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 9, letterSpacing: "0.22em",
        color: color || theme.crimson,
        textTransform: "uppercase", fontWeight: 500,
      }}>{text}</span>
    </div>
  );
}

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
      }}>
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

      <div style={{ display: "flex", gap: 2 }} className="an-nav-tabs">
        {navItems.map(item => (
          <button key={item.label} onClick={() => navigate(item.path)}
            style={{
              padding: "6px 16px",
              background: item.path === "/analytics" ? `rgba(${hex2rgb(theme.crimson)},0.12)` : "transparent",
              border: "none", borderRadius: 5,
              color: item.path === "/analytics" ? theme.crimson : theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
              fontWeight: item.path === "/analytics" ? 600 : 400,
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
   SECTION 1: MISSION IMPACT HERO
   Large animated counters — premium entrance
═══════════════════════════════════════════════════════ */
function useInView(ref, threshold = 0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return inView;
}

function AnimatedCounter({ value, suffix = "", prefix = "", color, theme, label, sub, delay = 0 }) {
  const ref = useRef();
  const inView = useInView(ref);
  const count = useCountUp(value, 2200, delay, inView);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      style={{ flex: 1, minWidth: 150 }}
    >
      <div style={{
        fontFamily: "'Cormorant Garant', serif",
        fontSize: "clamp(44px, 5vw, 72px)",
        fontWeight: 700, lineHeight: 1, color: color || theme.text,
        letterSpacing: "-0.01em",
        fontVariantNumeric: "tabular-nums",
      }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11, color: theme.text,
        letterSpacing: "0.1em", textTransform: "uppercase",
        fontWeight: 600, marginTop: 6, marginBottom: 3,
      }}>{label}</div>
      {sub && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textMuted, fontWeight: 300 }}>{sub}</div>}
    </motion.div>
  );
}

function MissionImpactHero({ theme }) {
  return (
    <section style={{ padding: "clamp(60px, 8vw, 100px) 0 clamp(48px, 6vw, 72px)", borderBottom: `1px solid ${theme.borderSubtle}`, marginBottom: "clamp(28px, 3vw, 44px)", position: "relative" }}>
      {/* Radial glow */}
      <div style={{ position: "absolute", top: "30%", left: "60%", transform: "translate(-50%,-50%)", width: "60vw", height: "40vw", maxWidth: 700, maxHeight: 500, background: `radial-gradient(ellipse at center, ${theme.crimsonGlow} 0%, ${theme.goldGlow} 30%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 22, height: 1.5, background: theme.crimson }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.26em", color: theme.crimson, textTransform: "uppercase", fontWeight: 500 }}>
            OrchestrAI · Operational Intelligence Report
          </span>
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(38px, 5vw, 68px)", fontWeight: 400, lineHeight: 1.0, color: theme.text, margin: "0 0 12px" }}>
          What the agents<br />
          <em style={{
            background: `linear-gradient(128deg, ${theme.crimson} 0%, ${theme.gold} 55%, ${theme.sakura} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>actually accomplished.</em>
        </h1>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px, 1.4vw, 15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.75, maxWidth: 560, margin: "0 0 52px" }}>
          Every number below is a direct outcome of autonomous agent coordination.
          No human bottleneck. No delayed response. Pure operational intelligence — measured.
        </p>

        {/* Counter row */}
        <div style={{ display: "flex", gap: "clamp(28px, 5vw, 64px)", flexWrap: "wrap", paddingTop: 32, borderTop: `1px solid ${theme.borderSubtle}` }}>
          <AnimatedCounter value={12} label="Missions Executed" sub="Across 6 operational domains" color={theme.text} theme={theme} delay={0} />
          <AnimatedCounter value={28647} label="Decisions Generated" sub="Autonomous, no human sign-off" color={theme.crimson} theme={theme} delay={100} />
          <AnimatedCounter value={5} label="Active Agents" sub="Full mesh online · 99.97% uptime" color={theme.gold} theme={theme} delay={200} />
          <AnimatedCounter value={94} suffix="%" label="Optimization Score" sub="↑18% over baseline operations" color={theme.sakura} theme={theme} delay={300} />
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 2: IMPACT OVERVIEW
   Elegant arc/radial visualizations per metric
═══════════════════════════════════════════════════════ */
const IMPACT_METRICS = [
  { label: "Travel Burden Reduced",       before: 100, after: 73, unit: "%", improvement: "↓27%", color: "#C4002B",  icon: "◈", note: "Avg. candidate travel distance" },
  { label: "Center Utilization",          before: 72,  after: 94, unit: "%", improvement: "↑31%", color: "#BF8C2C",  icon: "⬡", note: "From 72% to 94% average load" },
  { label: "Risk Exposure Reduced",       before: 100, after: 62, unit: "%", improvement: "↓38%", color: "#7C6FE8",  icon: "◬", note: "Threats neutralized proactively" },
  { label: "Response Time",               before: 240, after: 0.006, unit: "min", improvement: "10,000×", color: "#E8A0B0", icon: "⟁", note: "From 4hrs to 6.2s resolution" },
  { label: "Resource Efficiency",         before: 81,  after: 99, unit: "%", improvement: "↑22%", color: "#2EBFB0",  icon: "◫", note: "Proctor & center utilization" },
];

function ArcGauge({ value, maxValue = 100, color, size = 100, theme }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  // Show the after-value as proportion of the circle
  const ratio = Math.min(value / maxValue, 1);
  const offset = circ - ratio * circ * 0.75; // 270° arc
  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`} style={{ overflow: "visible" }}>
      {/* Background arc */}
      <circle cx={size / 2} cy={size * 0.65} r={r}
        fill="none" stroke="rgba(255,255,255,0.06)"
        strokeWidth="5"
        strokeDasharray={`${circ * 0.75} ${circ}`}
        strokeLinecap="round"
        strokeDashoffset={circ * 0.125}
        transform={`rotate(135 ${size / 2} ${size * 0.65})`}
      />
      {/* Value arc */}
      <motion.circle
        cx={size / 2} cy={size * 0.65} r={r}
        fill="none" stroke={color}
        strokeWidth="5"
        strokeDasharray={`${circ * 0.75} ${circ}`}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circ * 0.75 + circ * 0.125 }}
        whileInView={{ strokeDashoffset: circ - (ratio * circ * 0.75) + circ * 0.125 - circ * 0.75 + circ * 0.75 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        transform={`rotate(135 ${size / 2} ${size * 0.65})`}
      />
    </svg>
  );
}

function ImpactCard({ metric, theme, delay = 0 }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        padding: "24px 22px",
        border: `1px solid ${hov ? metric.color + "55" : theme.borderSubtle}`,
        borderRadius: 12,
        background: hov ? `rgba(${hex2rgb(metric.color)},0.045)` : theme.glass,
        backdropFilter: "blur(20px)",
        position: "relative", overflow: "hidden",
        transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
        boxShadow: hov ? `0 8px 40px rgba(${hex2rgb(metric.color)},0.1)` : "none",
      }}>
      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)`, opacity: hov ? 1 : 0.3, transition: "opacity 0.3s" }} />

      {/* Icon + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: metric.color, fontFamily: "monospace" }}>{metric.icon}</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: metric.color, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>{metric.label}</span>
      </div>

      {/* Before vs After bars */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 10 }}>
          {/* Before bar */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>Before</div>
            <div style={{ height: 4, background: theme.textFaint, borderRadius: 2, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: "100%", background: `rgba(${hex2rgb(metric.color)},0.25)`, borderRadius: 2 }}
              />
            </div>
          </div>
          {/* After bar */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: metric.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>After</div>
            <div style={{ height: 4, background: theme.textFaint, borderRadius: 2, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: metric.label === "Response Time" ? "1%" : `${(metric.after / metric.before) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                style={{ height: "100%", background: metric.color, borderRadius: 2 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Improvement number */}
      <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 700, color: metric.color, lineHeight: 1, marginBottom: 4 }}>
        {metric.improvement}
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.5 }}>
        {metric.note}
      </div>
    </motion.div>
  );
}

function ImpactOverview({ theme }) {
  return (
    <section style={{ marginBottom: "clamp(28px, 3vw, 44px)" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 24 }}>
        <SectionLabel text="Impact Overview" color={theme.gold} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 10px" }}>
          Operations, <em style={{ color: theme.gold }}>measurably improved.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
          Every metric below compares baseline human-coordinated operations to the same scenario under autonomous agent control.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(210px,100%),1fr))", gap: "clamp(10px, 1.5vw, 14px)" }}>
        {IMPACT_METRICS.map((m, i) => <ImpactCard key={m.label} metric={m} theme={theme} delay={i * 0.07} />)}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 3: AGENT PERFORMANCE MATRIX
   Premium visualization — not simple cards
═══════════════════════════════════════════════════════ */
const AGENT_PERF = [
  {
    name: "Allocation", icon: "◈", color: "#C4002B",
    decisions: 8204, confidence: 94, successRate: 98.4, speed: "8ms",
    description: "Center & proctor resource mapping",
    topAction: "Remapped 4,820 centers across 28 regions",
    sparkline: [60, 72, 68, 85, 79, 91, 94, 88, 96, 94],
  },
  {
    name: "Risk", icon: "⬡", color: "#BF8C2C",
    decisions: 4127, confidence: 97, successRate: 99.1, speed: "6ms",
    description: "Threat detection & mitigation",
    topAction: "Neutralized 3 high-risk scenarios before escalation",
    sparkline: [70, 78, 82, 75, 88, 92, 95, 91, 97, 97],
  },
  {
    name: "Operations", icon: "⟁", color: "#E8A0B0",
    decisions: 11849, confidence: 91, successRate: 97.8, speed: "14ms",
    description: "Task sequencing & execution",
    topAction: "Resolved 48-task dependency chains without conflicts",
    sparkline: [55, 62, 70, 68, 79, 83, 87, 84, 91, 91],
  },
  {
    name: "Intelligence", icon: "◬", color: "#7C6FE8",
    decisions: 2467, confidence: 99, successRate: 99.7, speed: "12ms",
    description: "Strategic decision synthesis",
    topAction: "Generated 97% confidence recommendations in <1s",
    sparkline: [80, 85, 88, 91, 90, 95, 97, 96, 99, 99],
  },
  {
    name: "Communication", icon: "◫", color: "#2EBFB0",
    decisions: 18940, confidence: 88, successRate: 99.2, speed: "3ms",
    description: "Stakeholder dispatch & alerts",
    topAction: "Dispatched 50,400 alerts · 99.2% delivery rate",
    sparkline: [65, 70, 74, 72, 80, 83, 86, 85, 89, 88],
  },
];

function Sparkline({ data, color, width = 80, height = 28 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height * 0.85 - height * 0.075;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <polyline points={`0,${height} ${pts} ${width},${height}`}
        fill={`url(#sg-${color.replace('#','')})`} stroke="none" />
      {/* Line */}
      <motion.polyline
        points={pts}
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ strokeDashoffset: 200, strokeDasharray: 200 }}
        whileInView={{ strokeDashoffset: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {/* End dot */}
      <circle cx={width} cy={parseFloat(pts.split(" ").pop().split(",")[1])} r="2.5" fill={color} />
    </svg>
  );
}

function AgentMatrixRow({ agent, theme, index }) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.09 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr 80px 80px 80px 100px",
        gap: 0,
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: `1px solid ${theme.borderSubtle}`,
        background: hov ? `rgba(${hex2rgb(agent.color)},0.04)` : "transparent",
        borderLeft: `3px solid ${hov ? agent.color : "transparent"}`,
        transition: "all 0.25s",
        cursor: "default",
      }}
      className="an-matrix-row"
    >
      {/* Agent identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `1px solid ${agent.color}55`,
          background: `rgba(${hex2rgb(agent.color)},0.1)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: agent.color, flexShrink: 0,
        }}>{agent.icon}</div>
        <div>
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 18, fontWeight: 500, color: theme.text, lineHeight: 1 }}>{agent.name}</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.06em", marginTop: 2 }}>{agent.description}</div>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ padding: "0 16px" }}>
        <Sparkline data={agent.sparkline} color={agent.color} width={80} height={28} />
      </div>

      {/* Decisions */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 20, fontWeight: 700, color: agent.color, lineHeight: 1 }}>
          {agent.decisions.toLocaleString()}
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Decisions</div>
      </div>

      {/* Confidence */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 20, fontWeight: 700, color: theme.text, lineHeight: 1 }}>
          {agent.confidence}%
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Confidence</div>
      </div>

      {/* Success rate */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 20, fontWeight: 700, color: "#2EBFB0", lineHeight: 1 }}>
          {agent.successRate}%
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Success</div>
      </div>

      {/* Speed */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 20, fontWeight: 700, color: theme.gold, lineHeight: 1 }}>
          {agent.speed}
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Avg. Latency</div>
      </div>
    </motion.div>
  );
}

function AgentPerformanceMatrix({ theme }) {
  return (
    <section style={{ marginBottom: "clamp(28px, 3vw, 44px)" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 20 }}>
        <SectionLabel text="Agent Performance Matrix" color={theme.crimson} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 10px" }}>
          How each agent <em style={{ color: theme.crimson }}>performed.</em>
        </h2>
      </motion.div>

      <Panel theme={theme} style={{ padding: 0 }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 80px 80px 80px 100px",
          gap: 0,
          padding: "12px 20px",
          borderBottom: `1px solid ${theme.borderSubtle}`,
          background: `rgba(${hex2rgb(theme.gold)},0.03)`,
        }} className="an-matrix-row">
          {["Agent", "30-day Trend", "Decisions", "Confidence", "Success Rate", "Latency"].map((h, i) => (
            <div key={h} style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 8, color: theme.textFaint, letterSpacing: "0.12em",
              textTransform: "uppercase", fontWeight: 600,
              textAlign: i >= 2 ? "center" : "left",
              ...(i === 5 ? { textAlign: "right" } : {}),
            }}>{h}</div>
          ))}
        </div>

        {AGENT_PERF.map((agent, i) => (
          <AgentMatrixRow key={agent.name} agent={agent} theme={theme} index={i} />
        ))}

        {/* Footer summary */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 80px 80px 80px 100px",
          gap: 0,
          padding: "14px 20px",
          borderTop: `1px solid ${theme.borderGold}`,
          background: `rgba(${hex2rgb(theme.gold)},0.035)`,
        }} className="an-matrix-row">
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, gridColumn: "1/3" }}>
            All Agents · Combined
          </div>
          {[
            { val: "45,587", label: "Total" },
            { val: "93.8%", label: "Avg." },
            { val: "98.8%", label: "Avg." },
            { val: "8.6ms", label: "Avg." },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: i === 3 ? "right" : "center" }}>
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 17, fontWeight: 700, color: theme.gold }}>{s.val}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 4: OPERATIONAL TIMELINE
   Interactive — click phases to expand
═══════════════════════════════════════════════════════ */
const TIMELINE_EVENTS = [
  {
    phase: "Threat Detected",    time: "T+0ms",    agent: "Risk",          icon: "⬡", color: "#BF8C2C",
    detail: "Weather anomaly identified at Zone 7. 340+ infrastructure signals cross-referenced. 3 examination centers flagged with capacity risk threshold exceeded.",
    outcome: "Early warning issued · 2.4hr response window secured",
  },
  {
    phase: "Impact Assessed",    time: "T+240ms",  agent: "Intelligence",  icon: "◬", color: "#7C6FE8",
    detail: "12,400 candidates assessed as affected. Historical pattern match invoked Protocol Delta. 6 viable alternate centers identified with 96% capacity alignment.",
    outcome: "Decision confidence: 97% · Relocation window: viable",
  },
  {
    phase: "Resources Remapped", time: "T+890ms",  agent: "Allocation",    icon: "◈", color: "#C4002B",
    detail: "847 proctors redistributed across 12 centers. Transport routes reserved via API. Backup node B12 confirmed with 2,300-candidate capacity at 98.2% coverage.",
    outcome: "Optimal allocation computed · Zero resource conflicts",
  },
  {
    phase: "Execution Sequenced",time: "T+1.2s",   agent: "Operations",    icon: "⟁", color: "#E8A0B0",
    detail: "48 dependent task chains resolved with zero conflicts. Staff reassignment confirmed across 12 zones. SLA compliance validated at 99.4%.",
    outcome: "All logistics confirmed · Execution authorized",
  },
  {
    phase: "All Notified",       time: "T+1.8s",   agent: "Communication", icon: "◫", color: "#2EBFB0",
    detail: "12,400 candidate SMS notifications dispatched. 94 center coordinators briefed on secure channel. Media advisory issued. 99.1% delivery confirmation received.",
    outcome: "Mission resolved · Incident closed",
  },
];

function OperationalTimeline({ theme }) {
  const [activeIdx, setActiveIdx] = useState(null);

  return (
    <section style={{ marginBottom: "clamp(28px, 3vw, 44px)" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 24 }}>
        <SectionLabel text="Operational Timeline" color="#7C6FE8" theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 10px" }}>
          From threat to resolution in <em style={{ color: "#7C6FE8" }}>1.8 seconds.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.textMuted, fontWeight: 300, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
          Click any phase to see exactly what each agent did, and what it achieved.
        </p>
      </motion.div>

      {/* Vertical timeline */}
      <div style={{ position: "relative" }}>
        {/* Central spine */}
        <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 1.5, background: `linear-gradient(to bottom, ${theme.crimson}, ${theme.gold}, #2EBFB0)`, opacity: 0.3 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TIMELINE_EVENTS.map((event, i) => {
            const isOpen = activeIdx === i;
            return (
              <motion.div
                key={event.phase}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                {/* Header row */}
                <div
                  onClick={() => setActiveIdx(isOpen ? null : i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "14px 20px 14px 0",
                    cursor: "pointer",
                    borderRadius: 8,
                    background: isOpen ? `rgba(${hex2rgb(event.color)},0.04)` : "transparent",
                    transition: "background 0.25s",
                  }}
                >
                  {/* Node on spine */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    border: `1.5px solid ${isOpen ? event.color : theme.borderSubtle}`,
                    background: isOpen ? `rgba(${hex2rgb(event.color)},0.15)` : theme.glass,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, color: isOpen ? event.color : theme.textFaint,
                    transition: "all 0.3s",
                    backdropFilter: "blur(8px)",
                  }}>{event.icon}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 500, color: isOpen ? theme.text : theme.textMuted, margin: 0, transition: "color 0.3s" }}>
                        {event.phase}
                      </h3>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: event.color, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                        {event.time}
                      </span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        via {event.agent}
                      </span>
                    </div>
                    {!isOpen && (
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: theme.textFaint, fontWeight: 300, marginTop: 2 }}>
                        {event.outcome}
                      </div>
                    )}
                  </div>

                  {/* Expand chevron */}
                  <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}
                    style={{ fontSize: 10, color: theme.textFaint, flexShrink: 0 }}>›</motion.div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{
                        margin: "0 0 8px 56px",
                        padding: "16px 20px",
                        border: `1px solid ${event.color}33`,
                        borderRadius: "0 8px 8px 0",
                        borderLeft: `3px solid ${event.color}`,
                        background: `rgba(${hex2rgb(event.color)},0.04)`,
                      }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.textMuted, fontWeight: 300, lineHeight: 1.7, margin: "0 0 10px" }}>{event.detail}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 9, color: event.color }}>✓</span>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: event.color, fontWeight: 600, letterSpacing: "0.08em" }}>{event.outcome}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Summary bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 24, marginLeft: 56,
            padding: "18px 22px",
            border: `1px solid ${theme.borderGold}`,
            borderRadius: 8,
            background: `rgba(${hex2rgb(theme.gold)},0.04)`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 26, fontWeight: 700, color: theme.gold, lineHeight: 1, marginBottom: 3 }}>
              1.8 seconds
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Full autonomous resolution · 5 agents · 12,400 candidates protected
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.08em", marginBottom: 3 }}>Human equivalent: 4–6 hours</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.gold, fontWeight: 700, letterSpacing: "0.08em" }}>OrchestrAI: 10,000× faster</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 5: BEFORE vs AFTER
   Side-by-side comparison — visually powerful
═══════════════════════════════════════════════════════ */
const COMPARISON_DATA = [
  { metric: "Travel Distance",    before: "42km avg.",  after: "31km avg.",  delta: "↓27%", color: "#C4002B" },
  { metric: "Center Load Variance", before: "±34%",    after: "±8%",        delta: "↓76%", color: "#BF8C2C" },
  { metric: "Response Time",      before: "4–6 hours", after: "1.8 seconds",delta: "10,000×", color: "#7C6FE8" },
  { metric: "Resource Utilization", before: "72%",     after: "94%",        delta: "↑31%", color: "#E8A0B0" },
  { metric: "Candidate Experience", before: "NPS: 42", after: "NPS: 78",    delta: "↑86%", color: "#2EBFB0" },
];

function BeforeAfterSection({ theme }) {
  return (
    <section style={{ marginBottom: "clamp(28px, 3vw, 44px)" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 24 }}>
        <SectionLabel text="Before vs After" color={theme.sakura} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: 0 }}>
          The gap between<br />
          <em style={{ color: theme.sakura }}>manual and autonomous.</em>
        </h2>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(10px, 1.5vw, 16px)" }} className="an-before-after-grid">
        {/* Before column */}
        <Panel theme={theme} style={{ borderColor: theme.borderSubtle }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.textFaint }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Human-Coordinated</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COMPARISON_DATA.map((row, i) => (
              <motion.div key={row.metric}
                initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                style={{ padding: "12px 14px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 8, background: theme.glass }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{row.metric}</div>
                <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 600, color: theme.textMuted, lineHeight: 1 }}>{row.before}</div>
              </motion.div>
            ))}
          </div>
        </Panel>

        {/* After column */}
        <Panel theme={theme} style={{ borderColor: theme.crimson + "33" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: theme.crimson }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.crimson, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>OrchestrAI Autonomous</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COMPARISON_DATA.map((row, i) => (
              <motion.div key={row.metric}
                initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                style={{
                  padding: "12px 14px",
                  border: `1px solid ${row.color}33`,
                  borderRadius: 8,
                  background: `rgba(${hex2rgb(row.color)},0.05)`,
                  position: "relative", overflow: "hidden",
                }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: row.color, opacity: 0.6 }} />
                <div style={{ paddingLeft: 10 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: row.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{row.metric}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: theme.text, lineHeight: 1 }}>{row.after}</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: row.color, fontWeight: 700 }}>{row.delta}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 6: GEOGRAPHIC INTELLIGENCE
   Abstract operational regions map — NOT Google Maps
═══════════════════════════════════════════════════════ */
const GEO_REGIONS = [
  { name: "Northern",  x: 45, y: 15, size: 62, coverage: 94, capacity: 88, risk: 12, color: "#C4002B" },
  { name: "Eastern",   x: 72, y: 35, size: 55, coverage: 91, capacity: 94, risk: 18, color: "#BF8C2C" },
  { name: "Central",   x: 50, y: 48, size: 72, coverage: 97, capacity: 91, risk: 8,  color: "#7C6FE8" },
  { name: "Western",   x: 22, y: 42, size: 58, coverage: 89, capacity: 86, risk: 24, color: "#E8A0B0" },
  { name: "Southern",  x: 50, y: 76, size: 64, coverage: 93, capacity: 89, risk: 15, color: "#2EBFB0" },
  { name: "Coastal",   x: 78, y: 68, size: 44, coverage: 88, capacity: 82, risk: 31, color: "#BF8C2C" },
];

const GEO_CONNECTIONS_MAP = [
  [0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4], [1, 5], [4, 5],
];

function GeographicIntelligence({ theme }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const svgRef = useRef();
  const [dims, setDims] = useState({ w: 600, h: 320 });
  const [pulses, setPulses] = useState([]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(e => {
      const r = e[0].contentRect;
      setDims({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      const pair = GEO_CONNECTIONS_MAP[Math.floor(Math.random() * GEO_CONNECTIONS_MAP.length)];
      setPulses(p => [...p.slice(-8), { id: Date.now() + Math.random(), from: pair[0], to: pair[1], t: 0 }]);
    }, 700);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    let raf;
    const frame = () => {
      setPulses(prev => prev.map(p => ({ ...p, t: p.t + 0.018 })).filter(p => p.t < 1));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pt = (region) => ({ x: (region.x / 100) * dims.w, y: (region.y / 100) * dims.h });
  const lerp = (a, b, t) => a + (b - a) * t;

  const hov = hoveredRegion !== null ? GEO_REGIONS[hoveredRegion] : null;

  return (
    <section style={{ marginBottom: "clamp(28px, 3vw, 44px)" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 24 }}>
        <SectionLabel text="Geographic Intelligence" color={theme.gold} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 10px" }}>
          Coverage across <em style={{ color: theme.gold }}>all operational zones.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.textMuted, fontWeight: 300, lineHeight: 1.7, maxWidth: 540, margin: 0 }}>
          Six operational regions monitored simultaneously. Agents redistribute resources across zones in real time as demand and risk signals shift.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "clamp(12px, 2vw, 20px)", alignItems: "start" }} className="an-geo-grid">
        {/* Abstract map */}
        <Panel theme={theme} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            height: "clamp(280px, 38vh, 420px)",
            position: "relative",
            background: theme.isDark ? "rgba(6,3,14,0.7)" : "rgba(225,218,208,0.5)",
          }}>
            {/* Grid pattern */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `radial-gradient(circle, ${theme.textFaint} 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
              opacity: 0.4,
            }} />

            <svg ref={svgRef} viewBox={`0 0 ${dims.w} ${dims.h}`} style={{ width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="xMidYMid meet">
              <defs>
                {GEO_REGIONS.map(r => (
                  <radialGradient key={r.name} id={`geo-${r.name}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={r.color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={r.color} stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>

              {/* Connection threads */}
              {GEO_CONNECTIONS_MAP.map(([fi, ti], i) => {
                const f = GEO_REGIONS[fi], t = GEO_REGIONS[ti];
                const fp = pt(f), tp = pt(t);
                const isHovConn = hoveredRegion === fi || hoveredRegion === ti;
                return (
                  <line key={i} x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                    stroke={isHovConn ? f.color : theme.textFaint}
                    strokeWidth={isHovConn ? 1.5 : 0.4}
                    strokeDasharray={isHovConn ? "none" : "3 6"}
                    opacity={isHovConn ? 0.6 : 0.2}
                    style={{ transition: "all 0.35s" }}
                  />
                );
              })}

              {/* Pulses */}
              {pulses.map(pulse => {
                const f = GEO_REGIONS[pulse.from], t = GEO_REGIONS[pulse.to];
                const fp = pt(f), tp = pt(t);
                const x = lerp(fp.x, tp.x, pulse.t);
                const y = lerp(fp.y, tp.y, pulse.t);
                const op = Math.sin(pulse.t * Math.PI);
                return (
                  <g key={pulse.id}>
                    <circle cx={x} cy={y} r="3.5" fill={f.color} opacity={op * 0.9} />
                    <circle cx={x} cy={y} r="7" fill={f.color} opacity={op * 0.15} />
                  </g>
                );
              })}

              {/* Region nodes */}
              {GEO_REGIONS.map((region, i) => {
                const p = pt(region);
                const isHov = hoveredRegion === i;
                const r = (region.size / 100) * Math.min(dims.w, dims.h) * 0.12;
                const coverageR = r * 1.8;

                return (
                  <g key={region.name} onMouseEnter={() => setHoveredRegion(i)} onMouseLeave={() => setHoveredRegion(null)} style={{ cursor: "pointer" }}>
                    {/* Coverage zone */}
                    <circle cx={p.x} cy={p.y} r={coverageR}
                      fill={`url(#geo-${region.name})`}
                      opacity={isHov ? 1 : (hoveredRegion !== null ? 0.1 : 0.45)}
                      style={{ transition: "opacity 0.35s" }}
                    >
                      {isHov && <animate attributeName="r" values={`${coverageR};${coverageR * 1.15};${coverageR}`} dur="2s" repeatCount="indefinite" />}
                    </circle>

                    {/* Heat ring */}
                    <circle cx={p.x} cy={p.y} r={r * 1.4}
                      fill="none" stroke={region.color}
                      strokeWidth="0.6"
                      strokeDasharray={isHov ? "none" : "3 5"}
                      opacity={isHov ? 0.5 : (hoveredRegion !== null ? 0.05 : 0.2)}
                      style={{ transition: "all 0.35s" }}
                    />

                    {/* Node */}
                    <circle cx={p.x} cy={p.y} r={r}
                      fill={`rgba(${hex2rgb(region.color)},${isHov ? 0.28 : 0.12})`}
                      stroke={region.color}
                      strokeWidth={isHov ? 1.8 : 0.8}
                      opacity={hoveredRegion !== null && !isHov ? 0.25 : 1}
                      style={{ transition: "all 0.35s" }}
                    />

                    {/* Label */}
                    <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fontSize={isHov ? 10 : 8.5}
                      fill={region.color}
                      opacity={hoveredRegion !== null && !isHov ? 0.2 : 1}
                      style={{ fontFamily: "'Space Grotesk', sans-serif", pointerEvents: "none", transition: "all 0.35s", fontWeight: 600, letterSpacing: "0.03em" }}>
                      {region.name}
                    </text>

                    {/* Coverage % badge */}
                    {(isHov || hoveredRegion === null) && (
                      <text x={p.x} y={p.y + r + 16} textAnchor="middle" fontSize="8"
                        fill={region.color} opacity={isHov ? 0.9 : 0.4}
                        style={{ fontFamily: "'Space Grotesk', sans-serif", pointerEvents: "none", transition: "opacity 0.35s" }}>
                        {region.coverage}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Map label */}
            <div style={{ position: "absolute", top: 14, left: 14, fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              SYS.GEO · OPERATIONAL REGIONS
            </div>
            <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", alignItems: "center", gap: 5 }}>
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.crimson, letterSpacing: "0.14em" }}>LIVE</span>
            </div>
          </div>
        </Panel>

        {/* Region detail panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence mode="wait">
            {hov ? (
              <motion.div key={hov.name}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}>
                <Panel theme={theme} style={{ borderColor: hov.color + "44", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: hov.color }} />
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: hov.color, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>{hov.name} Region</span>
                  </div>
                  {[
                    { label: "Coverage",    value: `${hov.coverage}%`, color: hov.color },
                    { label: "Capacity",    value: `${hov.capacity}%`, color: theme.gold },
                    { label: "Risk Score",  value: hov.risk, color: hov.risk > 20 ? theme.crimson : "#2EBFB0" },
                  ].map(m => (
                    <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9.5, color: theme.textMuted, letterSpacing: "0.06em" }}>{m.label}</span>
                      <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</span>
                    </div>
                  ))}
                </Panel>
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ padding: "16px 18px", border: `1px solid ${theme.borderSubtle}`, borderRadius: 10, background: theme.glass, textAlign: "center", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Hover a region to inspect
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Region legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {GEO_REGIONS.map((r, i) => (
              <div key={r.name}
                onMouseEnter={() => setHoveredRegion(i)}
                onMouseLeave={() => setHoveredRegion(null)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px",
                  border: `1px solid ${hoveredRegion === i ? r.color + "55" : theme.borderSubtle}`,
                  borderRadius: 7,
                  background: hoveredRegion === i ? `rgba(${hex2rgb(r.color)},0.06)` : "transparent",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted }}>{r.name}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9.5, color: r.color, fontWeight: 600 }}>{r.coverage}%</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8.5, color: r.risk > 20 ? theme.crimson : "#2EBFB0" }}>
                    {r.risk > 20 ? "⚠" : "✓"} {r.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 7: MISSION INSIGHTS
   AI-generated insights panel — feels intelligent
═══════════════════════════════════════════════════════ */
const INSIGHTS_DATA = [
  {
    agent: "Intelligence", icon: "◬", color: "#7C6FE8",
    insight: "Travel burden reduced by 27% across all active missions through dynamic center reassignment.",
    metric: "↓27%", metricLabel: "Travel Burden", confidence: 97,
  },
  {
    agent: "Risk", icon: "⬡", color: "#BF8C2C",
    insight: "3 high-risk examination centers proactively mitigated before disruption threshold was crossed.",
    metric: "3", metricLabel: "Risks Neutralized", confidence: 99,
  },
  {
    agent: "Allocation", icon: "◈", color: "#C4002B",
    insight: "Resource utilization improved by 18% compared to historical baseline allocations.",
    metric: "↑18%", metricLabel: "Resource Efficiency", confidence: 94,
  },
  {
    agent: "Operations", icon: "⟁", color: "#E8A0B0",
    insight: "Zero dependency conflicts in 48-task execution chains across 6 concurrent operations.",
    metric: "0", metricLabel: "Task Conflicts", confidence: 98,
  },
  {
    agent: "Communication", icon: "◫", color: "#2EBFB0",
    insight: "50,400 stakeholders notified within 1.8 seconds of each disruption event — 99.2% delivery rate.",
    metric: "99.2%", metricLabel: "Alert Delivery", confidence: 99,
  },
  {
    agent: "Intelligence", icon: "◬", color: "#7C6FE8",
    insight: "Candidate experience NPS improved from 42 to 78 as a result of proactive communication and reduced disruption.",
    metric: "+36pts", metricLabel: "NPS Gain", confidence: 91,
  },
];

function InsightItem({ insight, theme, index }) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        padding: "16px 18px",
        border: `1px solid ${hov ? insight.color + "44" : theme.borderSubtle}`,
        borderRadius: 10,
        background: hov ? `rgba(${hex2rgb(insight.color)},0.05)` : theme.glass,
        backdropFilter: "blur(16px)",
        position: "relative", overflow: "hidden",
        transition: "all 0.25s",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: hov ? insight.color : "transparent", transition: "background 0.25s" }} />
      <div style={{ paddingLeft: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: insight.color, fontFamily: "monospace" }}>{insight.icon}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: insight.color, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>{insight.agent} Agent</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, marginLeft: "auto" }}>↑{insight.confidence}% conf.</span>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
              {insight.insight}
            </p>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0, minWidth: 64 }}>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: insight.color, lineHeight: 1 }}>{insight.metric}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7, color: theme.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{insight.metricLabel}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MissionInsights({ theme }) {
  return (
    <section style={{ marginBottom: "clamp(28px, 3vw, 44px)" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 24 }}>
        <SectionLabel text="Mission Insights" color={theme.crimson} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 10px" }}>
          Intelligence, <em style={{ color: theme.crimson }}>surfaced automatically.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: theme.textMuted, fontWeight: 300, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
          These insights were generated autonomously by the Intelligence Agent. No analyst required.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(360px,100%),1fr))", gap: "clamp(8px, 1.2vw, 12px)" }}>
        {INSIGHTS_DATA.map((ins, i) => <InsightItem key={ins.insight.slice(0, 20)} insight={ins} theme={theme} index={i} />)}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION 8: EXECUTIVE SUMMARY
   The final report — cinematic closing section
═══════════════════════════════════════════════════════ */
function ExecutiveSummary({ theme }) {
  const ref = useRef();
  const inView = useInView(ref);

  const autonomyScore = useCountUp(99, 1800, 0, inView);
  const efficiencyScore = useCountUp(94, 1800, 150, inView);
  const confidenceScore = useCountUp(97, 1800, 300, inView);

  return (
    <section ref={ref} style={{ marginBottom: "clamp(28px, 3vw, 44px)" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Panel theme={theme} style={{
          border: `1px solid ${theme.borderGold}`,
          background: `rgba(${hex2rgb(theme.gold)},0.03)`,
          padding: "clamp(28px, 4vw, 48px)",
          position: "relative",
        }}>
          {/* Radial glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "80%", height: "60%", background: `radial-gradient(ellipse at center, ${theme.goldGlow} 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Top accent bar */}
            <div style={{ position: "absolute", top: -48, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${theme.gold}, ${theme.crimson}, ${theme.sakura}, transparent)`, opacity: 0.6 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 22, height: 1.5, background: theme.gold }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.26em", color: theme.gold, textTransform: "uppercase", fontWeight: 500 }}>
                Executive Summary · Autonomous Operations
              </span>
            </div>

            <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(32px, 4.5vw, 58px)", fontWeight: 400, lineHeight: 1.05, color: theme.text, margin: "0 0 18px", maxWidth: 700 }}>
              The intelligence layer<br />
              <em style={{
                background: `linear-gradient(128deg, ${theme.crimson} 0%, ${theme.gold} 55%, ${theme.sakura} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>that operations have always needed.</em>
            </h2>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px, 1.4vw, 15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.8, maxWidth: 620, margin: "0 0 44px" }}>
              Across 12 missions, 28,647 decisions, and six operational domains, OrchestrAI's autonomous agent mesh delivered measurable, repeatable operational excellence — without a single human bottleneck in the critical path.
            </p>

            {/* Score trio */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(12px, 2vw, 24px)", marginBottom: 44 }} className="an-exec-scores">
              {[
                { label: "Autonomous Decision Score", value: autonomyScore, suffix: "%", color: theme.crimson, desc: "Decisions made without human intervention" },
                { label: "Operational Efficiency Score", value: efficiencyScore, suffix: "%", color: theme.gold, desc: "Resources utilized vs. baseline allocation" },
                { label: "System Confidence", value: confidenceScore, suffix: "%", color: theme.sakura, desc: "Average decision confidence across all agents" },
              ].map(s => (
                <div key={s.label} style={{
                  padding: "24px 20px",
                  border: `1px solid ${s.color}33`,
                  borderRadius: 10,
                  background: `rgba(${hex2rgb(s.color)},0.04)`,
                  textAlign: "center",
                }}>
                  <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(44px, 5vw, 64px)", fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 8 }}>
                    {s.value}{s.suffix}
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: s.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: theme.textMuted, fontWeight: 300, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Projected impact */}
            <div style={{
              padding: "20px 24px",
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: 8,
              background: theme.glass,
              display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 24, color: theme.gold, fontFamily: "monospace", flexShrink: 0, marginTop: 2 }}>◬</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.gold, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                  Intelligence Agent · Projected Future Impact
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: theme.text, fontWeight: 300, lineHeight: 1.7, margin: "0 0 14px" }}>
                  At current performance trajectory, OrchestrAI will reduce operational overhead by 40% by Q4, improve candidate experience NPS to above 85, and prevent an estimated 12+ critical disruption events across the next operational cycle — before any human coordinator identifies them.
                </p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { val: "↓40%", label: "Operational overhead, Q4" },
                    { val: "NPS 85+", label: "Candidate experience target" },
                    { val: "12+ events", label: "Disruptions pre-empted" },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: theme.gold, lineHeight: 1 }}>{m.val}</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ANALYTICS PAGE ROOT
═══════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
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
          .an-nav-tabs { display: none !important; }
          .an-matrix-row { grid-template-columns: 1fr 60px 60px !important; }
          .an-matrix-row > *:nth-child(2),
          .an-matrix-row > *:nth-child(3) { display: none !important; }
          .an-before-after-grid { grid-template-columns: 1fr !important; }
          .an-geo-grid { grid-template-columns: 1fr !important; }
          .an-exec-scores { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .an-matrix-row { grid-template-columns: 1fr 56px !important; }
          .an-matrix-row > *:nth-child(4),
          .an-matrix-row > *:nth-child(6) { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Backgrounds */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: theme.bgGradient, pointerEvents: "none" }} />
      <SakuraPetals isDark={isDark} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: isDark ? 0.02 : 0.012, mixBlendMode: "overlay",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Nav isDark={isDark} toggleTheme={toggleTheme} theme={theme} />

        <div style={{ paddingTop: 58, padding: "58px clamp(12px, 3vw, 40px) 60px" }}>

          {/* ── SECTION 1: Hero ── */}
          <MissionImpactHero theme={theme} />

          {/* ── SECTION 2: Impact Overview ── */}
          <ImpactOverview theme={theme} />

          {/* ── SECTION 3: Agent Performance Matrix ── */}
          <AgentPerformanceMatrix theme={theme} />

          {/* ── SECTION 4: Operational Timeline ── */}
          <OperationalTimeline theme={theme} />

          {/* ── SECTION 5: Before vs After ── */}
          <BeforeAfterSection theme={theme} />

          {/* ── SECTION 6: Geographic Intelligence ── */}
          <GeographicIntelligence theme={theme} />

          {/* ── SECTION 7: Mission Insights ── */}
          <MissionInsights theme={theme} />

          {/* ── SECTION 8: Executive Summary ── */}
          <ExecutiveSummary theme={theme} />

          {/* ── FOOTER ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{ paddingTop: 20, borderTop: `1px solid ${theme.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 30 30" fill="none">
                <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
                <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.8" />
              </svg>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint, letterSpacing: "0.1em" }}>OrchestrAI © 2025 · Intelligence Report v2.4.1</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[["Data Pipeline", "STREAMING", theme.gold], ["Agent Mesh", "HEALTHY", "#2EBFB0"], ["Report Engine", "LIVE", theme.crimson]].map(([l, v, c]) => (
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