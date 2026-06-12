/**
 * OrchestrAI — MissionDossier.jsx
 * Flagship storytelling page · Autonomous Multi-Agent Intelligence Platform
 *
 * Design: Apple × Palantir × Linear × Mission Control
 * "A classified intelligence briefing. A futuristic operations center."
 *
 * Story flow:
 *  1. Hero — Autonomous Intelligence Network
 *  2. Why Autonomous Coordination Matters
 *  3. Operational Intelligence Problem
 *  4. Agent Network (network view)
 *  5. Digital Twin Visualization (CENTERPIECE)
 *  6. Autonomous Decision Lifecycle
 *  7. Examination Operations Use Case
 *  8. Expected Impact
 *  9. Future Vision
 * 10. Contributors
 *
 * Fully compatible with FAR AWAY design system.
 * Theme: dark / light via inherited THEMES pattern.
 */

import React, {
  useRef, useState, useEffect, useCallback, useMemo,
} from "react";
import {
  motion, useScroll, useTransform, useMotionValue, useSpring,
  AnimatePresence,
} from "framer-motion";

// React Router — graceful fallback
let useNavigate;
try {
  ({ useNavigate } = require("react-router-dom"));
} catch {
  useNavigate = () => (path) => { window.location.href = path; };
}

/* ═══════════════════════════════════════════════════════
   THEME SYSTEM — identical to HomePage
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

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
function hex2rgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ═══════════════════════════════════════════════════════
   FONT INJECTION
═══════════════════════════════════════════════════════ */
function InjectFonts() {
  useEffect(() => {
    const id = "orch-fonts-dossier";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
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
        backgroundImage: `
          linear-gradient(${theme.gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 100%, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 100%, black 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", right: "-10%", top: "5%",
        width: "55vw", height: "55vw", maxWidth: 700, maxHeight: 700,
        background: `radial-gradient(ellipse at 60% 40%, ${theme.crimsonGlow} 0%, transparent 60%)`,
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute", left: "-5%", top: "50%",
        width: "40vw", height: "40vw", maxWidth: 550,
        background: `radial-gradient(ellipse at 40% 50%, ${theme.goldGlow} 0%, transparent 65%)`,
        filter: "blur(48px)", opacity: 0.55,
      }} />
      <div style={{
        position: "absolute", left: "25%", bottom: "15%",
        width: "32vw", height: "22vw", maxWidth: 460,
        background: `radial-gradient(ellipse at 50% 50%, ${theme.sakuraGlow} 0%, transparent 70%)`,
        filter: "blur(60px)", opacity: 0.45,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: theme.isDark ? 0.022 : 0.014,
        mixBlendMode: "overlay",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CURSOR GLOW
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
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div
      style={{
        position: "fixed", left: springX, top: springY,
        translateX: "-50%", translateY: "-50%",
        width: 480, height: 480, borderRadius: "50%",
        background: `radial-gradient(circle, ${theme.crimsonGlowSoft} 0%, transparent 60%)`,
        pointerEvents: "none", zIndex: 1,
        opacity: visible ? 1 : 0, transition: "opacity 0.4s ease",
        mixBlendMode: theme.isDark ? "screen" : "multiply",
      }}
    />
  );
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
      petals = Array.from({ length: 18 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H - H,
        size: Math.random() * 5 + 3,
        speed: Math.random() * 0.4 + 0.14,
        drift: Math.random() * 0.5 - 0.25,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.014 + 0.006,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.016 - 0.008,
        opacity: Math.random() * 0.3 + 0.07,
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
    <canvas ref={ref} style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

/* ═══════════════════════════════════════════════════════
   MISSION STATUS BAR
═══════════════════════════════════════════════════════ */
function MissionStatusBar({ theme }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const items = [
    { label: "SYS", value: "ONLINE", color: theme.agentColors[2] },
    { label: "AGENTS", value: "5/5", color: theme.gold },
    { label: "UPTIME", value: "99.97%", color: theme.agentColors[4] },
    { label: "DOSSIER", value: "ACTIVE", color: theme.crimson },
  ];

  return (
    <motion.div
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 28, zIndex: 300,
        background: theme.isDark ? "rgba(3,2,8,0.95)" : "rgba(10,7,22,0.92)",
        borderBottom: `1px solid ${theme.borderSubtle}`,
        display: "flex", alignItems: "center",
        padding: "0 clamp(20px, 5vw, 80px)",
        gap: 28, backdropFilter: "blur(12px)",
      }}
    >
      {items.map((s, i) => (
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
   NAVBAR
═══════════════════════════════════════════════════════ */
function Navbar({ isDark, toggleTheme, theme, navigate }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 28, left: 0, right: 0, zIndex: 200,
        height: 62, display: "flex", alignItems: "center",
        padding: "0 clamp(20px, 5vw, 80px)",
        justifyContent: "space-between",
        background: scrolled
          ? (isDark ? "rgba(3,2,8,0.9)" : "rgba(240,235,225,0.9)")
          : "transparent",
        backdropFilter: scrolled ? "blur(28px) saturate(1.8)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(28px) saturate(1.8)" : "none",
        borderBottom: scrolled ? `1px solid ${theme.borderSubtle}` : "none",
        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Back + Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <motion.button
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: `1px solid ${theme.borderSubtle}`,
            borderRadius: 6, padding: "7px 14px", cursor: "pointer",
            color: theme.textMuted,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
            fontWeight: 500, transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.crimson; e.currentTarget.style.color = theme.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.borderSubtle; e.currentTarget.style.color = theme.textMuted; }}
        >
          <span style={{ fontSize: 12 }}>←</span> Return Home
        </motion.button>

        <div style={{ width: 1, height: 20, background: theme.borderSubtle }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
            <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
            <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.85" />
            <circle cx="15" cy="15" r="2.5" fill="#F0EBE1" />
          </svg>
          <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 17, fontWeight: 600, color: theme.text, letterSpacing: "0.01em" }}>
            Orchestr<span style={{ color: theme.crimson, fontStyle: "italic" }}>AI</span>
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
          letterSpacing: "0.2em", color: theme.textFaint, textTransform: "uppercase",
        }}>Mission Dossier</span>

        <div style={{ width: 1, height: 16, background: theme.borderSubtle }} />

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: 40, height: 22, borderRadius: 11,
            background: isDark ? theme.crimson : theme.textFaint,
            border: "none", cursor: "pointer", position: "relative",
            transition: "background 0.35s", outline: "none",
          }}
        >
          <motion.div
            animate={{ x: isDark ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            style={{ width: 18, height: 18, borderRadius: "50%", background: isDark ? "#F0EBE1" : "#0A0716", position: "absolute", top: 2 }}
          />
        </button>
      </div>
    </motion.nav>
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
   EYEBROW LABEL
═══════════════════════════════════════════════════════ */
function Eyebrow({ label, color, theme }) {
  const c = color || theme.crimson;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ width: 32, height: 1.5, background: c }} />
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: "0.24em", color: c, textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   1. HERO SECTION
═══════════════════════════════════════════════════════ */
function HeroSection({ theme, navigate }) {
  const heroRef = useRef();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Animated floating intelligence nodes
  const nodes = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: 15 + Math.random() * 70,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 3,
    color: ["#C4002B", "#BF8C2C", "#E8A0B0", "#7C6FE8", "#2EBFB0"][i % 5],
  })), []);

  return (
    <section
      ref={heroRef}
      style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "clamp(120px, 15vw, 160px) clamp(24px, 5.5vw, 88px) clamp(60px, 8vw, 100px)",
        position: "relative", overflow: "hidden", zIndex: 10,
      }}
    >
      {/* Floating intelligence nodes — ambient background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {nodes.map(n => (
          <motion.div
            key={n.id}
            animate={{ y: [0, -14, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: n.duration, delay: n.delay, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: `${n.x}%`, top: `${n.y}%`,
              width: n.size, height: n.size,
              borderRadius: "50%",
              background: n.color,
              boxShadow: `0 0 ${n.size * 3}px ${n.color}80`,
            }}
          />
        ))}

        {/* Connecting lines SVG */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }}>
          {nodes.slice(0, 8).map((n, i) => {
            const next = nodes[(i + 3) % nodes.length];
            return (
              <line
                key={i}
                x1={`${n.x}%`} y1={`${n.y}%`}
                x2={`${next.x}%`} y2={`${next.y}%`}
                stroke={theme.crimson} strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>

      <motion.div style={{ y, opacity }} className="dossier-hero-inner">
        {/* Classification badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 14px",
            border: `1px solid ${theme.crimson}55`,
            borderRadius: 4,
            background: `rgba(${hex2rgb(theme.crimson)},0.06)`,
          }}>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }}
            />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.crimson, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600 }}>
              Classification: Open · Dossier v2.1
            </span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: theme.textFaint, letterSpacing: "0.14em" }}>INTEL-2025-ORCH-001</span>
        </motion.div>

        {/* Main headline */}
        <div style={{ marginBottom: 32, maxWidth: 860 }}>
          <div style={{ overflow: "hidden", marginBottom: 6 }}>
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: "clamp(44px, 6.5vw, 96px)",
                fontWeight: 300, fontStyle: "italic",
                color: theme.textMuted, lineHeight: 1.0, margin: 0,
                letterSpacing: "0.01em",
              }}
            >
              Autonomous intelligence
            </motion.h1>
          </div>
          <div style={{ overflow: "hidden", marginBottom: 6 }}>
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: "clamp(44px, 6.5vw, 96px)",
                fontWeight: 600,
                color: theme.text, lineHeight: 1.0, margin: 0,
              }}
            >
              for operations at scale.
            </motion.h1>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: "clamp(44px, 6.5vw, 96px)",
                fontWeight: 700, fontStyle: "italic",
                background: `linear-gradient(128deg, ${theme.crimson} 0%, ${theme.gold} 55%, ${theme.sakura} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", lineHeight: 1.0, margin: 0,
              }}
            >
              This is OrchestrAI.
            </motion.h1>
          </div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.64, duration: 0.75 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(14px, 1.5vw, 17px)",
            fontWeight: 300, lineHeight: 1.82,
            color: theme.textMuted, margin: "0 0 48px", maxWidth: 560,
          }}
        >
          A multi-agent command center where specialized AI agents perceive, reason, and
          act in concert — turning complex, high-stakes operations into coordinated,
          autonomous execution with human-level oversight.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 60 }}
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 12px 52px ${theme.crimsonGlow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "14px 38px",
              background: theme.crimson, border: "none", borderRadius: 7,
              color: "#F0EBE1",
              fontFamily: "'Cormorant Garant', serif",
              fontSize: 17, fontWeight: 600, fontStyle: "italic",
              cursor: "pointer", position: "relative", overflow: "hidden",
            }}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)", pointerEvents: "none" }}
            />
            Enter Mission Control
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, borderColor: theme.gold, color: theme.gold }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            style={{
              padding: "14px 28px",
              background: "transparent", border: `1px solid ${theme.borderSubtle}`,
              borderRadius: 7, color: theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
              fontWeight: 500, cursor: "pointer", transition: "all 0.22s",
            }}
          >
            ← Return Home
          </motion.button>
        </motion.div>

        {/* Quick-stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          style={{
            display: "flex", gap: "clamp(20px, 4vw, 52px)",
            flexWrap: "wrap",
            paddingTop: 24,
            borderTop: `1px solid ${theme.textFaint}`,
          }}
        >
          {[
            { v: "5", l: "Autonomous Agents", c: theme.crimson },
            { v: "247K", l: "Ops / second", c: theme.gold },
            { v: "1.8s", l: "Crisis resolution", c: theme.sakura },
            { v: "99.97%", l: "System uptime", c: theme.agentColors[3] },
          ].map((m, i) => (
            <motion.div
              key={m.l}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.08 }}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8 + i * 0.3, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: m.c }}
                />
                <span style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: "clamp(18px, 2vw, 26px)",
                  fontWeight: 600, color: theme.text, lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}>{m.v}</span>
              </div>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
                color: theme.textMuted, letterSpacing: "0.14em", textTransform: "uppercase",
              }}>{m.l}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 7, zIndex: 10,
        }}
      >
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint, letterSpacing: "0.28em" }}>SCROLL</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 1, height: 30, background: `linear-gradient(to bottom, ${theme.crimson}, transparent)` }}
        />
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   2. WHY AUTONOMOUS COORDINATION MATTERS
═══════════════════════════════════════════════════════ */
const COORDINATION_PROBLEMS = [
  {
    icon: "◈",
    title: "Information Overload",
    desc: "Modern operations generate millions of data signals per hour. No human team can monitor, correlate, and act on all of them simultaneously.",
    color: "#C4002B",
  },
  {
    icon: "⬡",
    title: "Coordination Latency",
    desc: "Manual coordination chains introduce delays measured in hours. By the time a decision travels up and down the hierarchy, the window for effective action has closed.",
    color: "#BF8C2C",
  },
  {
    icon: "⟁",
    title: "Siloed Intelligence",
    desc: "Each department sees its own fragment of reality. No single team holds the full operational picture — and the gaps between silos are where failures occur.",
    color: "#E8A0B0",
  },
  {
    icon: "◬",
    title: "Human Cognitive Limits",
    desc: "Under pressure, human decision-makers face cognitive overload. Pattern recognition degrades, response quality falls, and critical signals get missed.",
    color: "#7C6FE8",
  },
];

function WhySection({ theme }) {
  return (
    <section style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64 }}>
        <Eyebrow label="The Coordination Problem" color={theme.crimson} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(30px,4vw,52px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 20px" }}>
          Modern operations outpace<br /><em style={{ color: theme.crimson }}>human coordination capacity.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px,1.4vw,15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.78, maxWidth: 580, margin: 0 }}>
          The systems we depend on — examinations, cities, supply chains, emergency services —
          now operate at a scale and speed that exceeds what any human team can coordinate alone.
          The answer is not more people. The answer is <em>autonomous coordination infrastructure.</em>
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px,100%),1fr))", gap: 14 }}>
        {COORDINATION_PROBLEMS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -4, borderColor: p.color }}
            style={{
              padding: "28px 24px",
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: 12,
              background: theme.glass,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              transition: "border-color 0.3s, transform 0.3s",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent 0%, ${p.color}66 50%, transparent 100%)` }} />
            <span style={{ fontSize: 22, color: p.color, display: "block", marginBottom: 16, fontFamily: "monospace" }}>{p.icon}</span>
            <h4 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 500, color: theme.text, margin: "0 0 10px", lineHeight: 1.1 }}>{p.title}</h4>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 300, lineHeight: 1.68, color: theme.textMuted, margin: 0 }}>{p.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Pull-quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: 48, padding: "32px 36px",
          border: `1px solid ${theme.borderGold}`,
          borderRadius: 12,
          background: `rgba(${hex2rgb(theme.gold)},0.04)`,
          display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
        }}
      >
        <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(32px,3.5vw,48px)", fontWeight: 700, color: theme.gold, lineHeight: 1, flexShrink: 0 }}>→</div>
        <div>
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(18px,2vw,26px)", fontWeight: 500, color: theme.text, lineHeight: 1.35, marginBottom: 8 }}>
            The solution is not adding more humans to the chain.<br />
            <em style={{ color: theme.gold }}>The solution is removing the bottleneck entirely.</em>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>OrchestrAI · Multi-Agent Coordination Thesis</div>
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   3. OPERATIONAL INTELLIGENCE PROBLEM
═══════════════════════════════════════════════════════ */
function IntelligenceProblemSection({ theme }) {
  const [activeProblem, setActiveProblem] = useState(0);

  const problems = [
    {
      id: "fragmented",
      label: "Fragmented Visibility",
      heading: "No one sees the full picture.",
      body: "Operational data exists in dozens of disconnected systems. Teams work from different fragments of reality. By the time information is assembled, it is already out of date.",
      metric: "48hrs",
      metricLabel: "Average time to assemble operational picture",
      color: theme.crimson,
    },
    {
      id: "reactive",
      label: "Reactive Decision-Making",
      heading: "Systems respond to failure, not to risk.",
      body: "Without continuous intelligence synthesis, teams react to problems that have already materialized. The window for proactive intervention closes before it is noticed.",
      metric: "73%",
      metricLabel: "Of operational failures are detectable 2+ hours in advance",
      color: theme.gold,
    },
    {
      id: "uncoordinated",
      label: "Uncoordinated Response",
      heading: "Multiple teams, conflicting actions.",
      body: "When a crisis hits, multiple departments mobilize independently. Without a coordination layer, they duplicate effort, conflict on resources, and miss interdependencies.",
      metric: "4-6hrs",
      metricLabel: "Typical manual crisis response cycle",
      color: theme.sakura,
    },
  ];

  useEffect(() => {
    const iv = setInterval(() => setActiveProblem(p => (p + 1) % problems.length), 4000);
    return () => clearInterval(iv);
  }, [problems.length]);

  const active = problems[activeProblem];

  return (
    <section style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,88px)", alignItems: "center" }} className="dossier-2col">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Eyebrow label="Operational Intelligence Gap" color={theme.gold} theme={theme} />
          <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(28px,3.6vw,48px)", fontWeight: 500, lineHeight: 1.12, color: theme.text, margin: "0 0 32px" }}>
            Why intelligence alone<br /><em style={{ color: theme.gold }}>is not enough.</em>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {problems.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => setActiveProblem(i)}
                animate={{ borderLeftColor: activeProblem === i ? p.color : theme.textFaint }}
                style={{
                  background: activeProblem === i ? `rgba(${hex2rgb(p.color)},0.06)` : "transparent",
                  border: "none",
                  borderLeft: `2.5px solid ${activeProblem === i ? p.color : theme.textFaint}`,
                  padding: "14px 18px",
                  cursor: "pointer",
                  textAlign: "left",
                  borderRadius: "0 6px 6px 0",
                  transition: "all 0.3s ease",
                }}
              >
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 500,
                  color: activeProblem === i ? p.color : theme.textMuted,
                  letterSpacing: "0.04em", transition: "color 0.3s",
                }}>{p.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.32 }}
              style={{
                padding: "36px 32px",
                border: `1px solid ${active.color}44`,
                borderRadius: 14,
                background: theme.surface,
                backdropFilter: "blur(28px)",
                boxShadow: `0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px ${active.color}22`,
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${active.color} 0%, transparent 100%)` }} />
              <div style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: "clamp(42px,5vw,72px)",
                fontWeight: 700, color: active.color,
                lineHeight: 1, marginBottom: 4,
              }}>{active.metric}</div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
                color: theme.textMuted, letterSpacing: "0.14em", textTransform: "uppercase",
                marginBottom: 24,
              }}>{active.metricLabel}</div>
              <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 24, fontWeight: 500, color: theme.text, margin: "0 0 12px", lineHeight: 1.2 }}>{active.heading}</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.72, color: theme.textMuted, margin: 0 }}>{active.body}</p>

              <div style={{ marginTop: 28, padding: "14px 16px", background: theme.glass, borderRadius: 8, border: `1px solid ${theme.borderSubtle}` }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: active.color, letterSpacing: "0.1em", fontWeight: 600 }}>OrchestrAI Resolves This →</span>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: theme.textMuted, fontWeight: 300, lineHeight: 1.6, margin: "6px 0 0" }}>
                  Continuous multi-agent intelligence synthesis replaces fragmented, reactive, and siloed operations with a unified autonomous coordination layer.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   4. AGENT NETWORK
═══════════════════════════════════════════════════════ */
const AGENTS = [
  {
    id: "allocation",
    icon: "📍",
    symbol: "◈",
    name: "Allocation Agent",
    color: "#C4002B",
    role: "Resource Intelligence",
    desc: "Continuously maps every resource — centers, personnel, equipment — against live demand. Rebalances automatically when disruptions hit.",
    stat: "94% utilization rate",
    angle: -90,
    dist: 160,
  },
  {
    id: "risk",
    icon: "📈",
    symbol: "⬡",
    name: "Risk Prediction Agent",
    color: "#BF8C2C",
    role: "Threat Intelligence",
    desc: "Monitors 340+ risk signals across infrastructure, weather, and historical patterns. Predicts disruptions before they escalate.",
    stat: "340 signals tracked",
    angle: -18,
    dist: 155,
  },
  {
    id: "center",
    icon: "⭐",
    symbol: "◬",
    name: "Center Intelligence Agent",
    color: "#E8A0B0",
    role: "Venue Analytics",
    desc: "Maintains a live digital model of every operational node — capacity, readiness, compliance status, and environmental conditions.",
    stat: "Real-time node state",
    angle: 54,
    dist: 160,
  },
  {
    id: "operations",
    icon: "🚨",
    symbol: "⟁",
    name: "Operations Agent",
    color: "#7C6FE8",
    role: "Execution Orchestration",
    desc: "The coordination spine. Routes tasks, resolves conflicts, sequences execution chains, and ensures dependent actions complete in order.",
    stat: "14ms coordination latency",
    angle: 126,
    dist: 158,
  },
  {
    id: "communication",
    icon: "📢",
    symbol: "◫",
    name: "Communication Agent",
    color: "#2EBFB0",
    role: "Stakeholder Broadcast",
    desc: "Automatically broadcasts alerts to 50K+ stakeholders across SMS, email, and push — tiered by urgency, role, and system status.",
    stat: "50K+ stakeholders",
    angle: 198,
    dist: 160,
  },
];

function AgentNetworkSection({ theme }) {
  const [activeAgent, setActiveAgent] = useState(null);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const svgRef = useRef();

  // Compute node positions from polar coords
  const nodePositions = useMemo(() =>
    AGENTS.map(a => {
      const rad = (a.angle * Math.PI) / 180;
      return {
        x: 240 + Math.cos(rad) * a.dist,
        y: 240 + Math.sin(rad) * a.dist,
      };
    }), []
  );

  const displayAgent = hoveredAgent ?? activeAgent;
  const activeInfo = AGENTS.find(a => a.id === (displayAgent));

  useEffect(() => {
    const iv = setInterval(() => {
      setActiveAgent(prev => {
        const ids = AGENTS.map(a => a.id);
        const idx = ids.indexOf(prev);
        return ids[(idx + 1) % ids.length];
      });
    }, 2600);
    return () => clearInterval(iv);
  }, []);

  return (
    <section style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 60 }}>
        <Eyebrow label="Autonomous Agent Network" color={theme.sakura} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(30px,4vw,52px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 16px" }}>
          Five specialized agents.<br /><em style={{ color: theme.sakura }}>One coordinated mind.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px,1.4vw,15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.75, maxWidth: 560, margin: 0 }}>
          Each agent owns a domain of expertise. Together they form a mesh intelligence network — continuously sharing observations, negotiating resource conflicts, and generating coordinated decisions.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "480px 1fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }} className="dossier-network-grid">

        {/* SVG Network Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
          style={{ position: "relative", width: 480, height: 480 }}
          className="dossier-svg-network"
        >
          <svg
            ref={svgRef}
            width="480" height="480"
            viewBox="0 0 480 480"
            style={{ overflow: "visible" }}
          >
            <defs>
              {AGENTS.map(a => (
                <radialGradient key={`grd-${a.id}`} id={`grd-${a.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={a.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={a.color} stopOpacity="0" />
                </radialGradient>
              ))}
              <filter id="glow-filter">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ring orbit */}
            <circle cx="240" cy="240" r="160" fill="none" stroke={theme.crimson} strokeWidth="0.5" strokeOpacity="0.15" />
            <circle cx="240" cy="240" r="180" fill="none" stroke={theme.gold} strokeWidth="0.4" strokeOpacity="0.08" strokeDasharray="4 8" />

            {/* Connection lines: center → each agent */}
            {AGENTS.map((a, i) => {
              const pos = nodePositions[i];
              const isActive = displayAgent === a.id;
              return (
                <motion.line
                  key={`line-center-${a.id}`}
                  x1="240" y1="240"
                  x2={pos.x} y2={pos.y}
                  stroke={a.color}
                  strokeWidth={isActive ? 1.5 : 0.8}
                  strokeOpacity={isActive ? 0.7 : 0.2}
                  animate={{ strokeOpacity: isActive ? [0.5, 0.9, 0.5] : 0.15 }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              );
            })}

            {/* Ring connections between adjacent agents */}
            {AGENTS.map((a, i) => {
              const pos1 = nodePositions[i];
              const pos2 = nodePositions[(i + 1) % AGENTS.length];
              return (
                <line
                  key={`ring-${i}`}
                  x1={pos1.x} y1={pos1.y}
                  x2={pos2.x} y2={pos2.y}
                  stroke={theme.textFaint}
                  strokeWidth="0.6"
                  strokeOpacity="0.25"
                  strokeDasharray="3 6"
                />
              );
            })}

            {/* Traveling data particles on active connection */}
            {displayAgent && (() => {
              const idx = AGENTS.findIndex(a => a.id === displayAgent);
              if (idx < 0) return null;
              const pos = nodePositions[idx];
              const agent = AGENTS[idx];
              return (
                <motion.circle
                  r="3"
                  fill={agent.color}
                  filter="url(#glow-filter)"
                  animate={{
                    cx: [240, pos.x, 240],
                    cy: [240, pos.y, 240],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              );
            })()}

            {/* Central Mission Control node */}
            <circle cx="240" cy="240" r="36" fill={theme.isDark ? "rgba(14,10,26,0.9)" : "rgba(228,220,208,0.9)"} stroke={theme.crimson} strokeWidth="1.5" />
            <circle cx="240" cy="240" r="28" fill="none" stroke={theme.gold} strokeWidth="0.8" strokeOpacity="0.5" />
            <motion.circle
              cx="240" cy="240" r="36"
              fill="none" stroke={theme.crimson} strokeWidth="1"
              animate={{ r: [36, 50, 36], strokeOpacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            />
            <text x="240" y="236" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7, fill: theme.crimson, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              MISSION
            </text>
            <text x="240" y="248" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7, fill: theme.crimson, letterSpacing: "0.12em" }}>
              CONTROL
            </text>

            {/* Agent nodes */}
            {AGENTS.map((a, i) => {
              const pos = nodePositions[i];
              const isActive = displayAgent === a.id;
              return (
                <g
                  key={a.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredAgent(a.id)}
                  onMouseLeave={() => setHoveredAgent(null)}
                >
                  {/* Glow backdrop */}
                  <circle cx={pos.x} cy={pos.y} r="26" fill={`url(#grd-${a.id})`} />
                  {/* Outer ring */}
                  <motion.circle
                    cx={pos.x} cy={pos.y} r="20"
                    fill="none" stroke={a.color}
                    strokeWidth={isActive ? 1.5 : 0.8}
                    animate={{ strokeOpacity: isActive ? [0.6, 1, 0.6] : 0.35 }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  {/* Fill */}
                  <circle
                    cx={pos.x} cy={pos.y} r="18"
                    fill={isActive
                      ? `rgba(${hex2rgb(a.color)},0.18)`
                      : (theme.isDark ? "rgba(14,10,26,0.8)" : "rgba(228,220,208,0.8)")}
                  />
                  {/* Status dot */}
                  <motion.circle
                    cx={pos.x + 14} cy={pos.y - 14} r="3"
                    fill={a.color}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
                  />
                  {/* Symbol */}
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: 13, fill: isActive ? a.color : theme.isDark ? "rgba(240,235,225,0.45)" : "rgba(10,7,22,0.45)", fontFamily: "monospace", transition: "fill 0.3s" }}>
                    {a.symbol}
                  </text>
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + (a.angle > 0 && a.angle < 180 ? 32 : -28)}
                    textAnchor="middle"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 7.5, fill: isActive ? a.color : theme.textMuted, letterSpacing: "0.06em", transition: "fill 0.3s" }}
                  >
                    {a.name.replace(" Agent", "")}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Agent detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {activeInfo ? (
              <motion.div
                key={activeInfo.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
                style={{
                  padding: "32px 28px",
                  border: `1px solid ${activeInfo.color}44`,
                  borderRadius: 14,
                  background: theme.surface,
                  backdropFilter: "blur(28px)",
                  boxShadow: `0 24px 60px rgba(0,0,0,0.18)`,
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${activeInfo.color} 0%, transparent 100%)` }} />

                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: `1.5px solid ${activeInfo.color}66`,
                    background: `rgba(${hex2rgb(activeInfo.color)},0.1)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: "monospace", color: activeInfo.color }}>{activeInfo.symbol}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 600, color: theme.text, lineHeight: 1.1, marginBottom: 4 }}>{activeInfo.name}</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: activeInfo.color, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>{activeInfo.role}</div>
                  </div>
                  <div style={{
                    marginLeft: "auto",
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
                    color: activeInfo.color, letterSpacing: "0.08em", textTransform: "uppercase",
                    background: `${activeInfo.color}18`, padding: "4px 10px", borderRadius: 4,
                    whiteSpace: "nowrap",
                  }}>{activeInfo.stat}</div>
                </div>

                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.72, color: theme.textMuted, margin: "0 0 24px" }}>{activeInfo.desc}</p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Perception", "Reasoning", "Action", "Coordination"].map(tag => (
                    <span key={tag} style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
                      color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
                      background: theme.glass, border: `1px solid ${theme.borderSubtle}`,
                      padding: "4px 10px", borderRadius: 4,
                    }}>{tag}</span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: "40px 28px", textAlign: "center", color: theme.textFaint, fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}
              >
                Hover an agent node to explore
              </motion.div>
            )}
          </AnimatePresence>

          {/* All agents list */}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {AGENTS.map(a => (
              <motion.div
                key={a.id}
                whileHover={{ x: 4 }}
                onClick={() => setActiveAgent(a.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px",
                  border: `1px solid ${displayAgent === a.id ? a.color + "44" : theme.borderSubtle}`,
                  borderRadius: 8,
                  background: displayAgent === a.id ? `rgba(${hex2rgb(a.color)},0.06)` : "transparent",
                  cursor: "pointer",
                  transition: "all 0.22s",
                }}
              >
                <motion.div
                  animate={{ opacity: displayAgent === a.id ? [0.5, 1, 0.5] : 0.35 }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }}
                />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: displayAgent === a.id ? a.color : theme.textMuted, letterSpacing: "0.06em", fontWeight: 500, transition: "color 0.2s" }}>{a.name}</span>
                <span style={{ marginLeft: "auto", fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.08em" }}>{a.role}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   5. DIGITAL TWIN VISUALIZATION — CENTERPIECE
═══════════════════════════════════════════════════════ */
function DigitalTwinSection({ theme }) {
  const [activeTier, setActiveTier] = useState(0);
  const [pulseState, setPulseState] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setPulseState(p => (p + 1) % 100), 80);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setActiveTier(t => (t + 1) % 4), 3200);
    return () => clearInterval(iv);
  }, []);

  const tiers = [
    {
      id: "mission",
      label: "Mission Control",
      sublabel: "Command Layer",
      color: theme.crimson,
      nodes: [{ x: 50, y: 50, label: "ORCH-CTRL" }],
      desc: "The central command node synthesizes all agent intelligence into a unified operational picture. Every decision flows through here.",
    },
    {
      id: "agents",
      label: "Agent Network",
      sublabel: "Intelligence Layer",
      color: theme.gold,
      nodes: [
        { x: 20, y: 50, label: "ALLOC" },
        { x: 35, y: 30, label: "RISK" },
        { x: 65, y: 30, label: "CENTER" },
        { x: 80, y: 50, label: "OPS" },
        { x: 50, y: 70, label: "COMM" },
      ],
      desc: "Five specialized agents continuously exchange typed messages, negotiate resource conflicts, and maintain synchronized state.",
    },
    {
      id: "nodes",
      label: "Operational Nodes",
      sublabel: "Physical Layer",
      color: theme.sakura,
      nodes: [
        { x: 15, y: 70, label: "NODE-01" },
        { x: 35, y: 80, label: "NODE-02" },
        { x: 50, y: 88, label: "NODE-03" },
        { x: 65, y: 80, label: "NODE-04" },
        { x: 85, y: 70, label: "NODE-05" },
        { x: 25, y: 92, label: "NODE-06" },
        { x: 75, y: 92, label: "NODE-07" },
      ],
      desc: "Physical and digital operational nodes — centers, infrastructure points, resource hubs — each mirrored as a live digital twin.",
    },
    {
      id: "decisions",
      label: "Decision Layer",
      sublabel: "Execution Layer",
      color: theme.agentColors[3],
      nodes: [
        { x: 10, y: 50, label: "ACT-A" },
        { x: 90, y: 50, label: "ACT-B" },
        { x: 50, y: 10, label: "ACT-C" },
        { x: 25, y: 20, label: "EXEC-1" },
        { x: 75, y: 20, label: "EXEC-2" },
        { x: 10, y: 80, label: "OUT-1" },
        { x: 90, y: 80, label: "OUT-2" },
        { x: 50, y: 95, label: "OUT-3" },
      ],
      desc: "Agent decisions are translated into concrete actions — API calls, notifications, resource bookings, and human escalations — executed in real time.",
    },
  ];

  const allTierNodes = [
    { x: 50, y: 50, color: theme.crimson, label: "MISSION CTL", size: 10, tier: 0 },
    { x: 20, y: 65, color: theme.gold, label: "ALLOC", size: 7, tier: 1 },
    { x: 35, y: 40, color: theme.gold, label: "RISK", size: 7, tier: 1 },
    { x: 65, y: 40, color: theme.gold, label: "CENTER", size: 7, tier: 1 },
    { x: 80, y: 65, color: theme.gold, label: "OPS", size: 7, tier: 1 },
    { x: 50, y: 78, color: theme.gold, label: "COMM", size: 7, tier: 1 },
    { x: 12, y: 82, color: theme.sakura, label: "NODE-A", size: 5, tier: 2 },
    { x: 30, y: 90, color: theme.sakura, label: "NODE-B", size: 5, tier: 2 },
    { x: 50, y: 94, color: theme.sakura, label: "NODE-C", size: 5, tier: 2 },
    { x: 70, y: 90, color: theme.sakura, label: "NODE-D", size: 5, tier: 2 },
    { x: 88, y: 82, color: theme.sakura, label: "NODE-E", size: 5, tier: 2 },
    { x: 8, y: 45, color: theme.agentColors[3], label: "ACT-1", size: 4, tier: 3 },
    { x: 92, y: 45, color: theme.agentColors[3], label: "ACT-2", size: 4, tier: 3 },
    { x: 50, y: 8, color: theme.agentColors[3], label: "EXEC", size: 4, tier: 3 },
    { x: 25, y: 20, color: theme.agentColors[3], label: "OUT-1", size: 4, tier: 3 },
    { x: 75, y: 20, color: theme.agentColors[3], label: "OUT-2", size: 4, tier: 3 },
  ];

  // Edges: pairs of node indices
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], // mission → agents
    [1, 6], [2, 7], [3, 8], [4, 9], [5, 10], // agents → nodes
    [0, 11], [0, 12], [0, 13], [0, 14], [0, 15], // mission → decisions
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], // agent ring
    [6, 7], [7, 8], [8, 9], [9, 10], // node ring
  ];

  return (
    <section style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10, background: theme.isDark ? "rgba(3,2,8,0.5)" : "rgba(240,235,225,0.3)", borderTop: `1px solid ${theme.borderSubtle}`, borderBottom: `1px solid ${theme.borderSubtle}` }}>

      {/* Section intro */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64, textAlign: "center" }}>
        <Eyebrow label="Digital Twin Mission Control" color={theme.crimson} theme={theme} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(34px,4.5vw,60px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 18px" }}>
              A living mirror of<br /><em style={{ color: theme.crimson }}>your entire operation.</em>
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px,1.4vw,16px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.78, maxWidth: 580, margin: "0 auto" }}>
              OrchestrAI maintains a real-time digital twin of every operational layer — physical nodes, agent states, decision pathways, and execution outcomes — unified in a single coherent intelligence model.
            </p>
          </div>
        </div>
      </motion.div>

      {/* MAIN VISUALIZATION */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "clamp(32px,4vw,56px)", alignItems: "start" }} className="dossier-twin-grid">

        {/* Left: The diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            position: "relative",
            border: `1px solid ${theme.borderSubtle}`,
            borderRadius: 16,
            overflow: "hidden",
            background: theme.isDark
              ? "rgba(6,4,14,0.85)"
              : "rgba(220,214,205,0.85)",
            backdropFilter: "blur(24px)",
            boxShadow: `0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px ${theme.crimson}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          {/* Header bar */}
          <div style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${theme.borderSubtle}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: theme.isDark ? "rgba(14,10,26,0.6)" : "rgba(210,204,194,0.6)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#C4002B", "#BF8C2C", "#2EBFB0"].map(c => (
                  <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />
                ))}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: theme.textMuted, letterSpacing: "0.14em" }}>ORCH-TWIN · LIVE VISUALIZATION</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }}
              />
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 8, color: theme.crimson, letterSpacing: "0.1em" }}>STREAMING</span>
            </div>
          </div>

          {/* Main SVG canvas */}
          <div style={{ position: "relative", padding: "24px", aspectRatio: "4/3" }}>
            <svg
              viewBox="0 0 500 375"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                {allTierNodes.map((n, i) => (
                  <radialGradient key={`ng-${i}`} id={`ng-${i}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={n.color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={n.color} stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>

              {/* Background radial */}
              <radialGradient id="bg-center" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={theme.crimson} stopOpacity="0.06" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <rect width="500" height="375" fill="url(#bg-center)" />

              {/* Grid overlay */}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`gh-${i}`}
                  x1="0" y1={i * 37.5} x2="500" y2={i * 37.5}
                  stroke={theme.isDark ? "rgba(240,235,225,0.04)" : "rgba(10,7,22,0.04)"}
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: 14 }, (_, i) => (
                <line key={`gv-${i}`}
                  x1={i * 38} y1="0" x2={i * 38} y2="375"
                  stroke={theme.isDark ? "rgba(240,235,225,0.04)" : "rgba(10,7,22,0.04)"}
                  strokeWidth="0.5"
                />
              ))}

              {/* Edges */}
              {edges.map(([ai, bi], ei) => {
                const a = allTierNodes[ai];
                const b = allTierNodes[bi];
                const isActivePair = activeTier === a.tier || activeTier === b.tier;
                const midX = (a.x + b.x) / 2 * 5;
                const midY = (a.y + b.y) / 2 * 3.75;
                return (
                  <g key={`edge-${ei}`}>
                    <path
                      d={`M ${a.x * 5} ${a.y * 3.75} Q ${midX + (Math.sin(ei) * 15)} ${midY - 10} ${b.x * 5} ${b.y * 3.75}`}
                      fill="none"
                      stroke={isActivePair ? a.color : theme.isDark ? "rgba(240,235,225,0.06)" : "rgba(10,7,22,0.06)"}
                      strokeWidth={isActivePair ? 0.8 : 0.4}
                      strokeOpacity={isActivePair ? 0.5 : 1}
                      strokeDasharray={a.tier === 3 || b.tier === 3 ? "3 5" : "none"}
                    />
                  </g>
                );
              })}

              {/* Animated data particles on active tier edges */}
              {edges.filter(([ai, bi]) => allTierNodes[ai].tier === activeTier || allTierNodes[bi].tier === activeTier).slice(0, 4).map(([ai, bi], pi) => {
                const a = allTierNodes[ai];
                const b = allTierNodes[bi];
                return (
                  <motion.circle
                    key={`particle-${pi}`}
                    r="2.5"
                    fill={a.color}
                    animate={{
                      cx: [a.x * 5, b.x * 5, a.x * 5],
                      cy: [a.y * 3.75, b.y * 3.75, a.y * 3.75],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.6,
                      delay: pi * 0.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}

              {/* Nodes */}
              {allTierNodes.map((n, i) => {
                const isActiveTierNode = n.tier === activeTier;
                const cx = n.x * 5;
                const cy = n.y * 3.75;
                return (
                  <g key={`node-${i}`}>
                    {/* Glow */}
                    <circle cx={cx} cy={cy} r={n.size * 4} fill={`url(#ng-${i})`} opacity={isActiveTierNode ? 1 : 0.3} />
                    {/* Pulse ring */}
                    {isActiveTierNode && n.tier === 0 && (
                      <motion.circle
                        cx={cx} cy={cy} r={n.size * 2}
                        fill="none" stroke={n.color}
                        strokeWidth="0.8"
                        animate={{ r: [n.size * 2, n.size * 4], strokeOpacity: [0.8, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    )}
                    {/* Main circle */}
                    <motion.circle
                      cx={cx} cy={cy} r={n.size}
                      fill={isActiveTierNode
                        ? `rgba(${hex2rgb(n.color)},0.2)`
                        : theme.isDark ? "rgba(14,10,26,0.7)" : "rgba(220,214,205,0.7)"}
                      stroke={n.color}
                      strokeWidth={isActiveTierNode ? 1.2 : 0.6}
                      animate={{ strokeOpacity: isActiveTierNode ? [0.5, 1, 0.5] : 0.25 }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                    />
                    {/* Label */}
                    <text
                      x={cx} y={cy + n.size + 7}
                      textAnchor="middle"
                      style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 5.5, fill: isActiveTierNode ? n.color : theme.textFaint, letterSpacing: "0.06em" }}
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}

              {/* Live metric overlays */}
              {[
                { x: 10, y: 8, label: "LATENCY", value: "14ms", color: theme.crimson },
                { x: 68, y: 8, label: "THROUGHPUT", value: "247K/s", color: theme.gold },
                { x: 10, y: 95, label: "AGENTS", value: "5 ACTIVE", color: theme.sakura },
                { x: 65, y: 95, label: "SYNC", value: "IN LOCK", color: theme.agentColors[3] },
              ].map((m, i) => (
                <g key={`metric-${i}`}>
                  <rect x={m.x * 5 - 4} y={m.y * 3.75 - 9} width="55" height="18" rx="3"
                    fill={theme.isDark ? "rgba(3,2,8,0.7)" : "rgba(240,235,225,0.7)"}
                    stroke={m.color} strokeWidth="0.6" strokeOpacity="0.4" />
                  <text x={m.x * 5 + 23.5} y={m.y * 3.75 - 3} textAnchor="middle"
                    style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 4.5, fill: theme.textFaint, letterSpacing: "0.1em" }}>{m.label}</text>
                  <text x={m.x * 5 + 23.5} y={m.y * 3.75 + 4} textAnchor="middle"
                    style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 5.5, fill: m.color, letterSpacing: "0.08em", fontWeight: 600 }}>{m.value}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Footer bar */}
          <div style={{
            padding: "10px 20px",
            borderTop: `1px solid ${theme.borderSubtle}`,
            display: "flex", alignItems: "center", gap: 24,
            background: theme.isDark ? "rgba(14,10,26,0.6)" : "rgba(210,204,194,0.6)",
          }}>
            {tiers.map((t, i) => (
              <div
                key={t.id}
                onClick={() => setActiveTier(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  opacity: activeTier === i ? 1 : 0.4, transition: "opacity 0.3s",
                }}
              >
                <motion.div
                  animate={{ opacity: activeTier === i ? [0.5, 1, 0.5] : 0.4 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: 4, height: 4, borderRadius: "50%", background: t.color }}
                />
                <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 8, color: activeTier === i ? t.color : theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Tier explanations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.18em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Architecture Layers</span>
            <div style={{ width: "100%", height: 1, background: theme.textFaint }} />
          </div>

          {tiers.map((t, i) => (
            <motion.div
              key={t.id}
              onClick={() => setActiveTier(i)}
              whileHover={{ x: 4 }}
              animate={{ borderLeftColor: activeTier === i ? t.color : theme.textFaint }}
              style={{
                padding: "18px 16px 18px 20px",
                borderLeft: `2.5px solid ${activeTier === i ? t.color : theme.textFaint}`,
                cursor: "pointer",
                background: activeTier === i ? `rgba(${hex2rgb(t.color)},0.05)` : "transparent",
                transition: "all 0.3s ease",
                borderRadius: "0 8px 8px 0",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: activeTier === i ? 8 : 0 }}>
                <motion.div
                  animate={{ opacity: activeTier === i ? [0.5, 1, 0.5] : 0.3 }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: t.color, flexShrink: 0 }}
                />
                <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 18, fontWeight: 500, color: activeTier === i ? theme.text : theme.textMuted, transition: "color 0.3s" }}>{t.label}</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: t.color, letterSpacing: "0.12em", textTransform: "uppercase", opacity: activeTier === i ? 1 : 0, transition: "opacity 0.3s" }}>{t.sublabel}</span>
              </div>
              <motion.p
                animate={{ maxHeight: activeTier === i ? 80 : 0, opacity: activeTier === i ? 1 : 0 }}
                transition={{ duration: 0.35 }}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.62, margin: "0 0 0 13px", overflow: "hidden" }}
              >
                {t.desc}
              </motion.p>
            </motion.div>
          ))}

          {/* Live flow indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              marginTop: 24, padding: "18px 16px",
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: 10,
              background: theme.glass,
            }}
          >
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Live Data Flow</div>
            {[
              { label: "Sensor ingest", pct: 0.82, color: theme.crimson },
              { label: "Agent processing", pct: 0.67, color: theme.gold },
              { label: "Decision throughput", pct: 0.91, color: theme.sakura },
              { label: "Execution SLA", pct: 0.997, color: theme.agentColors[4] },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9.5, color: theme.textMuted }}>{m.label}</span>
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: m.color, fontWeight: 600 }}
                  >
                    {Math.round(m.pct * 100)}%
                  </motion.span>
                </div>
                <div style={{ height: 2, background: theme.textFaint, borderRadius: 1, overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: [`${m.pct * 100 - 8}%`, `${m.pct * 100}%`, `${m.pct * 100 - 4}%`] }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ height: "100%", background: m.color, borderRadius: 1 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   6. AUTONOMOUS DECISION LIFECYCLE
═══════════════════════════════════════════════════════ */
const LIFECYCLE_STEPS = [
  { icon: "◉", label: "Data Collection", color: "#C4002B", desc: "Continuous ingestion from 340+ signal sources — sensors, APIs, historical patterns, and live event streams." },
  { icon: "⬡", label: "Agent Analysis", color: "#BF8C2C", desc: "Each specialized agent applies domain expertise to its signal subset. Risk patterns surface before materializing." },
  { icon: "⟁", label: "Risk Detection", color: "#E8A0B0", desc: "Cross-agent correlation identifies threats invisible to any single agent. Confidence scoring prioritizes response." },
  { icon: "◈", label: "Coordination", color: "#7C6FE8", desc: "Agents negotiate resource allocation, sequence interdependent actions, and resolve conflicts autonomously." },
  { icon: "◬", label: "Decision Generation", color: "#2EBFB0", desc: "Multi-agent consensus produces a ranked decision set with full reasoning trace and confidence intervals." },
  { icon: "◫", label: "Recommendations", color: "#BF8C2C", desc: "Structured recommendations surface to human operators with full context, alternatives, and projected outcomes." },
  { icon: "◉", label: "Human Oversight", color: "#C4002B", desc: "Operators review, override, or approve. Every action is auditable. Humans remain in the loop for consequential decisions." },
];

function DecisionLifecycleSection({ theme }) {
  const [activeStep, setActiveStep] = useState(-1);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });

  useEffect(() => {
    return scrollYProgress.on("change", v => {
      setActiveStep(Math.floor(v * (LIFECYCLE_STEPS.length + 1)) - 1);
    });
  }, [scrollYProgress]);

  return (
    <section ref={ref} style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64 }}>
        <Eyebrow label="Decision Lifecycle" color={theme.gold} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(30px,4vw,52px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 16px" }}>
          From signal to action —<br /><em style={{ color: theme.gold }}>fully autonomous.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px,1.4vw,15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.75, maxWidth: 520, margin: 0 }}>
          Every decision OrchestrAI makes follows a structured, auditable lifecycle — from raw signal ingestion to coordinated execution — with human oversight preserved at every critical junction.
        </p>
      </motion.div>

      {/* Vertical timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical spine */}
        <div style={{ position: "absolute", left: 27, top: 0, bottom: 0, width: 1, background: theme.textFaint, zIndex: 0 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {LIFECYCLE_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{ display: "flex", gap: 28, position: "relative", zIndex: 1, paddingBottom: i < LIFECYCLE_STEPS.length - 1 ? 0 : 0 }}
            >
              {/* Node */}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <motion.div
                  animate={{
                    background: activeStep >= i ? `rgba(${hex2rgb(step.color)},0.18)` : (theme.isDark ? "rgba(3,2,8,0.9)" : "rgba(240,235,225,0.9)"),
                    borderColor: activeStep >= i ? step.color : theme.textFaint,
                    boxShadow: activeStep >= i ? `0 0 20px ${step.color}44` : "none",
                  }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: 56, height: 56, borderRadius: "50%",
                    border: `1.5px solid ${theme.textFaint}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                    color: activeStep >= i ? step.color : theme.textFaint,
                    fontFamily: "monospace",
                    transition: "all 0.4s ease",
                    zIndex: 1,
                  }}
                >
                  {step.icon}
                </motion.div>
                {/* Connector line */}
                {i < LIFECYCLE_STEPS.length - 1 && (
                  <motion.div
                    animate={{ background: activeStep >= i ? step.color : theme.textFaint, opacity: activeStep >= i ? 0.6 : 0.2 }}
                    style={{ width: 1, flex: 1, minHeight: 32, transition: "all 0.4s ease" }}
                  />
                )}
              </div>

              {/* Content */}
              <motion.div
                style={{ paddingTop: 14, paddingBottom: i < LIFECYCLE_STEPS.length - 1 ? 32 : 0, flex: 1 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: activeStep >= i ? step.color : theme.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, transition: "color 0.4s" }}>
                    STEP {String(i + 1).padStart(2, "0")}
                  </span>
                  {activeStep >= i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: step.color, letterSpacing: "0.1em", textTransform: "uppercase", background: `${step.color}18`, padding: "2px 8px", borderRadius: 3 }}
                    >
                      ACTIVE
                    </motion.div>
                  )}
                </div>
                <h4 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 500, color: activeStep >= i ? theme.text : theme.textMuted, margin: "0 0 8px", lineHeight: 1.1, transition: "color 0.4s" }}>
                  {step.label}
                </h4>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: theme.textMuted, fontWeight: 300, lineHeight: 1.68, margin: 0, maxWidth: 560, opacity: activeStep >= i ? 1 : 0.5, transition: "opacity 0.4s" }}>
                  {step.desc}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   7. EXAMINATION OPERATIONS USE CASE
═══════════════════════════════════════════════════════ */
const USE_CASES = [
  { icon: "◈", title: "Examination Networks", desc: "The first live deployment. National-scale examination orchestration with real-time disruption response for millions of candidates.", tag: "Live · v1.0" },
  { icon: "⬡", title: "Smart Cities", desc: "Traffic, utilities, emergency services, and public infrastructure — autonomously coordinated as a single urban intelligence network.", tag: "Roadmap" },
  { icon: "⟁", title: "Emergency Response", desc: "Multi-agency incident command that routes resources, predicts escalation, and coordinates field teams without human bottlenecks.", tag: "Roadmap" },
  { icon: "◫", title: "Logistics Networks", desc: "End-to-end supply chain orchestration with predictive rerouting, dynamic inventory allocation, and disruption recovery.", tag: "Roadmap" },
  { icon: "◬", title: "National Infrastructure", desc: "Sovereign-scale decision support for power grids, water systems, and transit — predictive maintenance before failure.", tag: "Roadmap" },
];

function ExaminationSection({ theme }) {
  return (
    <section style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 56 }}>
        <Eyebrow label="First Deployment Domain" color={theme.crimson} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(30px,4vw,52px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 16px" }}>
          Examinations are where<br /><em style={{ color: theme.crimson }}>OrchestrAI begins.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px,1.4vw,15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.78, maxWidth: 600, margin: "0 0 10px" }}>
          OrchestrAI is not an examination management system. It is an autonomous multi-agent platform. Examination operations are the first real-world domain where we are deploying it — a proving ground at national scale.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px,1.4vw,15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.78, maxWidth: 600, margin: 0 }}>
          The same coordination architecture that manages 2M+ exam candidates will power smart cities, emergency response, and national infrastructure. The domain changes. The intelligence layer remains.
        </p>
      </motion.div>

      {/* Featured: examination use case */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          padding: "40px 36px",
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          background: theme.surface,
          backdropFilter: "blur(28px)",
          boxShadow: `0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px ${theme.crimson}22`,
          marginBottom: 24,
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${theme.crimson} 0%, ${theme.gold} 50%, transparent 100%)` }} />
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${theme.crimsonGlowSoft} 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, flexWrap: "wrap" }} className="dossier-exam-grid">
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.crimson, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson }} />
              Active Domain · v1.0
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(22px,2.5vw,30px)", fontWeight: 600, color: theme.text, margin: "0 0 12px", lineHeight: 1.15 }}>Examination Operations Network</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 300, lineHeight: 1.72, color: theme.textMuted, margin: 0 }}>
              End-to-end orchestration of large-scale national examinations — from center allocation and proctor coordination to real-time disruption response and stakeholder communication.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Candidates managed", value: "2M+", color: theme.crimson },
              { label: "Centers orchestrated", value: "15,000+", color: theme.gold },
              { label: "Response time", value: "1.8s", color: theme.sakura },
            ].map(m => (
              <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 14px", background: theme.glass, borderRadius: 7, border: `1px solid ${theme.borderSubtle}` }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: theme.textMuted }}>{m.label}</span>
                <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 24, fontWeight: 700, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Center allocation", "Proctor coordination", "Real-time logistics", "Risk monitoring", "Crisis response", "Stakeholder broadcast"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: theme.crimson, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, color: theme.textMuted }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Other domains */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px,100%),1fr))", gap: 12 }}>
        {USE_CASES.slice(1).map((u, i) => (
          <motion.div
            key={u.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3, borderColor: theme.gold }}
            style={{
              padding: "22px 18px",
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: 10,
              background: theme.glass,
              backdropFilter: "blur(16px)",
              transition: "border-color 0.3s, transform 0.3s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 18, color: theme.textFaint, fontFamily: "monospace" }}>{u.icon}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.gold, letterSpacing: "0.12em", textTransform: "uppercase", background: `rgba(${hex2rgb(theme.gold)},0.1)`, padding: "2px 7px", borderRadius: 3 }}>{u.tag}</span>
            </div>
            <h4 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 18, fontWeight: 500, color: theme.text, margin: "0 0 8px" }}>{u.title}</h4>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 300, lineHeight: 1.65, color: theme.textMuted, margin: 0 }}>{u.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   8. EXPECTED IMPACT
═══════════════════════════════════════════════════════ */
const IMPACTS = [
  { metric: "90%", label: "Reduction in coordination friction", icon: "◈", color: "#C4002B", desc: "Autonomous coordination eliminates the manual handoffs that account for 90% of operational delay." },
  { metric: "10,000×", label: "Faster than manual response", icon: "⬡", color: "#BF8C2C", desc: "1.8 seconds vs 4-6 hours. The difference between proactive resolution and reactive damage control." },
  { metric: "340+", label: "Risk signals monitored continuously", icon: "◬", color: "#E8A0B0", desc: "No human team can watch 340 simultaneous signal streams. OrchestrAI never blinks." },
  { metric: "99.97%", label: "System uptime SLA", icon: "⟁", color: "#7C6FE8", desc: "Mission-critical infrastructure requires mission-critical reliability. OrchestrAI is built for it." },
  { metric: "50K+", label: "Stakeholders reached per alert", icon: "◫", color: "#2EBFB0", desc: "Automated stakeholder communication at scale — tiered by role, urgency, and real-time status." },
  { metric: "2M+", label: "People protected per deployment", icon: "◈", color: "#C4002B", desc: "National-scale coordination with every individual accounted for in the operational model." },
];

function ImpactSection({ theme }) {
  return (
    <section style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10, background: theme.isDark ? "rgba(6,4,14,0.4)" : "rgba(240,235,225,0.2)", borderTop: `1px solid ${theme.borderSubtle}`, borderBottom: `1px solid ${theme.borderSubtle}` }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 60 }}>
        <Eyebrow label="Expected Impact" color={theme.gold} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(30px,4vw,52px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 16px" }}>
          The numbers tell<br /><em style={{ color: theme.gold }}>a different story.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px,1.4vw,15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.75, maxWidth: 520, margin: 0 }}>
          Autonomous coordination does not incrementally improve operations. It transforms them. These are the projected outcomes from deploying OrchestrAI at scale.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px,100%),1fr))", gap: 16 }}>
        {IMPACTS.map((m, i) => (
          <motion.div
            key={m.metric + m.label}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, borderColor: m.color }}
            style={{
              padding: "30px 26px",
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: 12,
              background: theme.glass,
              backdropFilter: "blur(20px)",
              transition: "border-color 0.3s, transform 0.3s",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, ${m.color}80, transparent)` }} />
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(36px,4vw,52px)", fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: 6 }}>{m.metric}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, lineHeight: 1.4 }}>{m.label}</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 300, lineHeight: 1.65, color: theme.textMuted, margin: 0 }}>{m.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   9. FUTURE VISION
═══════════════════════════════════════════════════════ */
function FutureVisionSection({ theme, navigate }) {
  return (
    <section style={{ padding: "clamp(80px,10vw,140px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10, textAlign: "center" }}>
      {/* Ambient bloom */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: `radial-gradient(ellipse, ${theme.crimsonGlow} 0%, ${theme.goldGlow} 30%, transparent 68%)`, filter: "blur(24px)", pointerEvents: "none", zIndex: -1 }} />

      <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Eyebrow label="Future Vision" color={theme.sakura} theme={theme} />

        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(34px,5vw,68px)", fontWeight: 500, lineHeight: 1.08, color: theme.text, margin: "0 0 24px", maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
          The future is not<br /><em style={{ color: theme.sakura }}>one AI.</em>
        </h2>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(14px,1.5vw,17px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.82, maxWidth: 580, margin: "0 auto 40px" }}>
          The future is networks of specialized agents — each sovereign in its domain, each aware of the whole — collaborating to govern systems too complex for any single intelligence.
        </p>

        {/* Vision statement cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, maxWidth: 900, margin: "0 auto 56px", textAlign: "left" }} className="dossier-vision-grid">
          {[
            { icon: "◉", title: "Specialized Agents", desc: "Every domain deserves an intelligence built for it — not a general model forced into a specific mold.", color: theme.crimson },
            { icon: "⬡", title: "Collaborative Networks", desc: "The emergent intelligence of coordinated agents exceeds the sum of its parts. This is where the real capability lives.", color: theme.gold },
            { icon: "◬", title: "Human Sovereignty", desc: "Autonomy amplifies human judgment. It never replaces it. The goal is speed and scale for human decision-making, not its elimination.", color: theme.sakura },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: "26px 22px",
                border: `1px solid ${theme.borderSubtle}`,
                borderRadius: 12,
                background: theme.glass,
                backdropFilter: "blur(18px)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, ${v.color}80, transparent)` }} />
              <span style={{ fontSize: 18, color: v.color, fontFamily: "monospace", display: "block", marginBottom: 14 }}>{v.icon}</span>
              <h4 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 21, fontWeight: 500, color: theme.text, margin: "0 0 10px" }}>{v.title}</h4>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 300, lineHeight: 1.65, color: theme.textMuted, margin: 0 }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Vision statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 720, margin: "0 auto 52px",
            padding: "32px 36px",
            border: `1px solid ${theme.borderGold}`,
            borderRadius: 14,
            background: `rgba(${hex2rgb(theme.gold)},0.04)`,
          }}
        >
          <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 500, color: theme.text, lineHeight: 1.4, marginBottom: 14 }}>
            "OrchestrAI is an exploration of what operational intelligence becomes when you stop asking <em style={{ color: theme.gold }}>how many people does it take</em> — and start asking <em style={{ color: theme.crimson }}>what architecture makes it autonomous.</em>"
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>OrchestrAI · Mission Statement</div>
        </motion.div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 20px 60px ${theme.crimsonGlow}` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "15px 46px",
              background: theme.crimson, border: "none", borderRadius: 7,
              color: "#F0EBE1",
              fontFamily: "'Cormorant Garant', serif",
              fontSize: 18, fontWeight: 600, fontStyle: "italic",
              cursor: "pointer", position: "relative", overflow: "hidden",
            }}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 4 }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)", pointerEvents: "none" }}
            />
            Enter Mission Control
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, borderColor: theme.gold, color: theme.gold }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            style={{
              padding: "15px 32px", background: "transparent",
              border: `1px solid ${theme.borderSubtle}`, borderRadius: 7, color: theme.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
              fontWeight: 500, cursor: "pointer", transition: "all 0.22s",
            }}
          >
            ← Return Home
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   10. CONTRIBUTORS
═══════════════════════════════════════════════════════ */
const CONTRIBUTORS = [
  {
    initials: "RR",
    name: "Ravi Ranjhan",
    role: "Product & AI Architecture",
    color: "#C4002B",
    areas: ["System Architecture", "AI Agent Design", "Product Strategy", "Technical Vision"],
    bio: "Leads overall product direction and the autonomous agent architecture. Defines how agents communicate, coordinate, and escalate across the platform.",
  },
  {
    initials: "KA",
    name: "Khyati Agrawal",
    role: "Frontend Engineering",
    color: "#BF8C2C",
    areas: ["React / Three.js", "UI/UX Design", "3D Rendering", "Motion Design"],
    bio: "Owns the entire frontend experience — from the 3D agent lattice to the Digital Twin visualization. Responsible for design language, motion system, and interactive storytelling.",
  },
  {
    initials: "MS",
    name: "Madhu Shankar Kumar",
    role: "QA, Testing & Documentation",
    color: "#E8A0B0",
    areas: ["Test Architecture", "Quality Engineering", "Technical Docs", "Integration Testing"],
    bio: "Ensures platform reliability across all agent interactions. Builds the testing infrastructure that validates autonomous decision chains and documents platform behavior.",
  },
  {
    initials: "UJ",
    name: "Ujjwal",
    role: "Research & Infrastructure",
    color: "#7C6FE8",
    areas: ["Infrastructure", "Research", "Backend Systems", "Deployment"],
    bio: "Grounds the platform in research-backed agent patterns and manages the infrastructure that makes real-time autonomous coordination possible at scale.",
  },
];

function ContributorsSection({ theme }) {
  const [hovered, setHovered] = useState(null);

  return (
    <section style={{ padding: "clamp(80px,10vw,130px) clamp(24px,5.5vw,88px)", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 60 }}>
        <Eyebrow label="The Team" color={theme.textMuted} theme={theme} />
        <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: "clamp(30px,4vw,52px)", fontWeight: 500, lineHeight: 1.1, color: theme.text, margin: "0 0 16px" }}>
          Built by people who believe<br /><em style={{ color: theme.crimson }}>coordination is an engineering problem.</em>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(13px,1.4vw,15.5px)", color: theme.textMuted, fontWeight: 300, lineHeight: 1.75, maxWidth: 520, margin: 0 }}>
          OrchestrAI is a collaborative exploration — a team combining frontend engineering, AI architecture, infrastructure, and quality engineering to build something genuinely new.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px,100%),1fr))", gap: 16 }}>
        {CONTRIBUTORS.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onHoverStart={() => setHovered(c.name)}
            onHoverEnd={() => setHovered(null)}
            style={{
              padding: "32px 28px",
              border: `1px solid ${hovered === c.name ? c.color + "55" : theme.borderSubtle}`,
              borderRadius: 14,
              background: theme.surface,
              backdropFilter: "blur(24px)",
              position: "relative", overflow: "hidden",
              transition: "border-color 0.3s",
              boxShadow: hovered === c.name ? `0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px ${c.color}22` : "0 2px 12px rgba(0,0,0,0.08)",
              transform: hovered === c.name ? "translateY(-4px)" : "translateY(0)",
            }}
          >
            {/* Top accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c.color} 0%, transparent 60%)`, opacity: hovered === c.name ? 1 : 0.4 }} />

            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: `1.5px solid ${c.color}55`,
                background: `rgba(${hex2rgb(c.color)},0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                position: "relative",
              }}>
                {/* Image placeholder — replace src with actual photo */}
                <span style={{
                  fontFamily: "'Cormorant Garant', serif",
                  fontSize: 18, fontWeight: 700,
                  color: c.color, letterSpacing: "0.04em",
                  userSelect: "none",
                }}>
                  {c.initials}
                </span>
                {/* Placeholder for future image:
                  <img src={c.imageUrl} alt={c.name}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    onError={e => e.target.style.display = "none"}
                  />
                */}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 600, color: theme.text, lineHeight: 1.1, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9.5, color: c.color, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>{c.role}</div>
              </div>
            </div>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 300, lineHeight: 1.68, color: theme.textMuted, margin: "0 0 20px" }}>{c.bio}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {c.areas.map(area => (
                <span key={area} style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 9,
                  color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
                  background: theme.glass, border: `1px solid ${theme.borderSubtle}`,
                  padding: "4px 10px", borderRadius: 4,
                }}>{area}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: 40, textAlign: "center" }}
      >
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: theme.textFaint, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          OrchestrAI · FAR AWAY Hackathon · 2025
        </div>
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
      padding: "28px clamp(24px,5.5vw,88px)",
      borderTop: `1px solid ${theme.borderSubtle}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: 16, position: "relative", zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 30 30" fill="none">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none" />
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.8" />
        </svg>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: theme.textMuted, letterSpacing: "0.06em" }}>OrchestrAI © 2025</span>
      </div>

      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.textFaint, letterSpacing: "0.18em", textTransform: "uppercase" }}>
        Mission Dossier · Autonomous Multi-Agent Intelligence
      </span>

      <motion.button
        whileHover={{ x: -3 }}
        onClick={() => navigate("/")}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 10,
          color: theme.textFaint, letterSpacing: "0.12em", textTransform: "uppercase",
          transition: "color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = theme.textMuted}
        onMouseLeave={e => e.currentTarget.style.color = theme.textFaint}
      >
        <span>←</span> Return Home
      </motion.button>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT — MissionDossier
═══════════════════════════════════════════════════════ */
export default function MissionDossier() {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? THEMES.dark : THEMES.light;
  const navigate = useNavigate();

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
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.crimson}55; border-radius: 2px; }

        @media (max-width: 860px) {
          .dossier-2col { grid-template-columns: 1fr !important; }
          .dossier-network-grid { grid-template-columns: 1fr !important; }
          .dossier-svg-network { width: 100% !important; height: auto !important; }
          .dossier-twin-grid { grid-template-columns: 1fr !important; }
          .dossier-vision-grid { grid-template-columns: 1fr !important; }
          .dossier-exam-grid { grid-template-columns: 1fr !important; }
          .dossier-hero-inner { padding: 0 !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Ambient bg */}
      <AtmosphericBg theme={theme} />

      {/* Sakura petals */}
      <SakuraPetals isDark={isDark} />

      {/* Cursor glow */}
      <CursorGlow theme={theme} />

      {/* Status bar */}
      <MissionStatusBar theme={theme} />

      {/* Navbar */}
      <Navbar isDark={isDark} toggleTheme={() => setIsDark(p => !p)} theme={theme} navigate={navigate} />

      {/* Page content */}
      <div style={{ position: "relative", zIndex: 2 }}>

        {/* 1. Hero */}
        <HeroSection theme={theme} navigate={navigate} />

        <SectionDivider theme={theme} accent="crimson" />

        {/* 2. Why Autonomous Coordination */}
        <WhySection theme={theme} />

        <SectionDivider theme={theme} accent="gold" />

        {/* 3. Intelligence Problem */}
        <IntelligenceProblemSection theme={theme} />

        <SectionDivider theme={theme} accent="sakura" />

        {/* 4. Agent Network */}
        <AgentNetworkSection theme={theme} />

        <SectionDivider theme={theme} accent="crimson" />

        {/* 5. Digital Twin CENTERPIECE */}
        <DigitalTwinSection theme={theme} />

        <SectionDivider theme={theme} accent="gold" />

        {/* 6. Decision Lifecycle */}
        <DecisionLifecycleSection theme={theme} />

        <SectionDivider theme={theme} accent="sakura" />

        {/* 7. Examination Use Case */}
        <ExaminationSection theme={theme} />

        <SectionDivider theme={theme} accent="crimson" />

        {/* 8. Expected Impact */}
        <ImpactSection theme={theme} />

        <SectionDivider theme={theme} accent="gold" />

        {/* 9. Future Vision */}
        <FutureVisionSection theme={theme} navigate={navigate} />

        <SectionDivider theme={theme} accent="sakura" />

        {/* 10. Contributors */}
        <ContributorsSection theme={theme} />

        {/* Footer */}
        <Footer theme={theme} navigate={navigate} />
      </div>
    </>
  );
}