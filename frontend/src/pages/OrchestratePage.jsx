/**
 * OrchestrAI — OrchestratePage.jsx  (Enhanced Hybrid v3)
 *
 * "The room where decisions happen."
 *
 * WHAT'S NEW vs both previous versions:
 *   ─ 3D OrchestrationCore from v2  (R3F canvas, tri-ring lattice, sparkles)
 *     placed CENTER as the visual heartbeat
 *   ─ Interactive SVG Agent Network from v2 with node-click detail panel
 *     ENHANCED: data packets + glow rings + agent inspect overlay
 *   ─ Premium Mission Builder from v1 — per-agent field labels + pulsing indicator dots
 *   ─ Section 4 launch panel from v1 — readiness checklist + cinematic CTA
 *   ─ Execution stream from v1 — phase timeline + live output scrollfeed
 *   ─ Decision Engine from v1 — three full recommendation cards
 *   ─ Final Resolution from v1 — full mission summary + 10 000× advantage callout
 *   ─ Orchestration Canvas overlay — animating SVG threads that light up
 *     as the builder fields are filled, erupts on Launch
 *   ─ Extra 3D: per-agent orbital spheres that pulse when that agent is active
 *   ─ Full dark/light theme parity, identical token system
 *   ─ Responsive breakpoints matching both source files
 */

import React, {
  useState, useEffect, useCallback, useRef, useMemo, Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════
   THEME SYSTEM
══════════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg: "#030208",
    bgGradient: "linear-gradient(160deg,#030208 0%,#0A0618 50%,#030208 100%)",
    surface: "rgba(14,10,26,0.82)",
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
    agentColors: ["#C4002B","#BF8C2C","#E8A0B0","#7C6FE8","#2EBFB0"],
    isDark: true,
  },
  light: {
    bg: "#F0EBE1",
    bgGradient: "linear-gradient(160deg,#F0EBE1 0%,#E8E2D6 50%,#F0EBE1 100%)",
    surface: "rgba(235,228,218,0.88)",
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
    agentColors: ["#B8002A","#A87820","#B85470","#4A40B8","#087870"],
    isDark: false,
  },
};

const h2r = (hex) => {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
};

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

/* ══════════════════════════════════════════════════════════
   SAKURA PETALS
══════════════════════════════════════════════════════════ */
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
        size: Math.random() * 5 + 3, speed: Math.random() * 0.4 + 0.1,
        wobble: Math.random() * Math.PI * 2, wobbleSpeed: Math.random() * 0.014 + 0.005,
        rotation: Math.random() * Math.PI * 2, rotSpeed: Math.random() * 0.016 - 0.008,
        opacity: Math.random() * 0.25 + 0.05,
      }));
    };
    init();
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const fill = isDark ? "rgba(232,160,176,0.5)" : "rgba(184,84,112,0.22)";
      for (const p of petals) {
        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobble)*15, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(0,-p.size);
        ctx.bezierCurveTo(p.size*.8,-p.size*.6, p.size*.8,p.size*.6, 0,p.size);
        ctx.bezierCurveTo(-p.size*.8,p.size*.6, -p.size*.8,-p.size*.6, 0,-p.size);
        ctx.fill();
        ctx.restore();
        p.y += p.speed; p.wobble += p.wobbleSpeed; p.rotation += p.rotSpeed;
        if (p.y > H+20) { p.y = -20; p.x = Math.random()*W; }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, [isDark]);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }} />;
}

/* ══════════════════════════════════════════════════════════
   3D — ORCHESTRATION CORE
   Beats when isActive.  Center-column signature piece.
══════════════════════════════════════════════════════════ */
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
      <sphereGeometry args={[0.65,16,16]} />
      <meshStandardMaterial color="#C4002B" transparent opacity={0} side={THREE.BackSide} />
    </mesh>
  );
}

function AgentOrb({ position, color, active }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const s = active ? 1 + Math.sin(t*4)*0.25 : 1 + Math.sin(t*1.4)*0.08;
    ref.current.scale.setScalar(s);
    ref.current.material.emissiveIntensity = active ? 2.2 + Math.sin(t*5)*0.6 : 0.4;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.18,12,12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.7} roughness={0.1} />
    </mesh>
  );
}

const AGENT_ORBS = [
  { color:"#C4002B", pos:[ 2.0,  0.5, 0.3] },
  { color:"#BF8C2C", pos:[ 0.6,  1.8, 0.8] },
  { color:"#E8A0B0", pos:[-1.8,  0.7, 0.5] },
  { color:"#7C6FE8", pos:[-0.5, -1.8, 0.6] },
  { color:"#2EBFB0", pos:[ 1.6, -1.4, 0.4] },
];

function OrchestrationCore({ isActive }) {
  const outerRef = useRef(), midRef = useRef(), innerRef = useRef();
  const r1 = useRef(), r2 = useRef(), r3 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = isActive ? 3.2 : 1.0;
    if (outerRef.current) { outerRef.current.rotation.y = t*.08*s; outerRef.current.rotation.z = Math.sin(t*.2)*.05; }
    if (midRef.current) { midRef.current.rotation.y = -t*.13*s; midRef.current.rotation.x = t*.07*s; }
    if (innerRef.current) {
      innerRef.current.rotation.y = t*.26*s; innerRef.current.rotation.z = -t*.11*s;
      const pulse = 1 + Math.sin(t*(isActive ? 5.5 : 2.3))*(isActive ? .18 : .07);
      innerRef.current.scale.setScalar(pulse);
    }
    if (r1.current) r1.current.rotation.z = t*.10*s;
    if (r2.current) { r2.current.rotation.x = t*.08*s; r2.current.rotation.z = -t*.055*s; }
    if (r3.current) { r3.current.rotation.y = t*.065*s; r3.current.rotation.x = -t*.045*s; }
  });

  return (
    <group>
      <group ref={outerRef}>
        <mesh><icosahedronGeometry args={[1.2,1]} /><meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive?.55:.18} metalness={.9} roughness={.06} transparent opacity={isActive?.14:.07} wireframe /></mesh>
      </group>
      <group ref={midRef}>
        <mesh><dodecahedronGeometry args={[.84,0]} /><meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={isActive?.45:.14} metalness={.85} roughness={.07} transparent opacity={isActive?.16:.09} wireframe /></mesh>
      </group>
      <group ref={innerRef}>
        <mesh><octahedronGeometry args={[.44,0]} /><meshStandardMaterial color="#F0EBE1" emissive="#BF8C2C" emissiveIntensity={isActive?2.8:1.4} metalness={1} roughness={0} /></mesh>
        <mesh><octahedronGeometry args={[.28,0]} /><meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive?3.2:1.8} metalness={.9} roughness={0} /></mesh>
      </group>
      {/* Three rings */}
      <mesh ref={r1} rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.38,.009,8,128]} /><meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive?1.2:.6} transparent opacity={isActive?.65:.35} /></mesh>
      <mesh ref={r2} rotation={[Math.PI/2+.9,.4,0]}><torusGeometry args={[1.58,.006,8,128]} /><meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={isActive?1.0:.5} transparent opacity={isActive?.42:.22} /></mesh>
      <mesh ref={r3} rotation={[Math.PI/2-.6,-.5,.2]}><torusGeometry args={[1.76,.005,8,128]} /><meshStandardMaterial color="#E8A0B0" emissive="#E8A0B0" emissiveIntensity={isActive?.9:.4} transparent opacity={isActive?.35:.18} /></mesh>
      {/* Agent orbs orbiting the core */}
      {AGENT_ORBS.map((o,i) => (
        <AgentOrb key={i} position={o.pos} color={o.color} active={isActive} />
      ))}
      <CorePulse isActive={isActive} />
      <Sparkles count={isActive?140:60} scale={4.8} size={.42} speed={isActive?.6:.22} color="#BF8C2C" opacity={isActive?.85:.45} />
      <Sparkles count={isActive?80:30} scale={3.2} size={.28} speed={isActive?.5:.3} color="#E8A0B0" opacity={isActive?.7:.32} />
      <Sparkles count={isActive?50:18} scale={2.0} size={.2} speed={isActive?.7:.4} color="#C4002B" opacity={isActive?.6:.24} />
      <pointLight position={[4,3,3]} color="#C4002B" intensity={isActive?10:5} distance={10} decay={2} />
      <pointLight position={[-4,-2,-3]} color="#BF8C2C" intensity={isActive?7:3.5} distance={10} decay={2} />
      <pointLight position={[0,4,-4]} color="#E8A0B0" intensity={isActive?5:2.5} distance={10} decay={2} />
      <ambientLight intensity={.18} color="#1a0a2e" />
    </group>
  );
}

function CoreScene3D({ isActive }) {
  return (
    <Canvas camera={{ position:[0,.5,5.5], fov:38 }} gl={{ antialias:true, alpha:true }} style={{ background:"transparent" }} dpr={[1,1.5]}>
      <Suspense fallback={null}>
        <Float speed={isActive?2.8:1.2} rotationIntensity={isActive?.55:.22} floatIntensity={isActive?.7:.32}>
          <OrchestrationCore isActive={isActive} />
        </Float>
      </Suspense>
    </Canvas>
  );
}

/* ══════════════════════════════════════════════════════════
   AGENT DEFINITIONS
══════════════════════════════════════════════════════════ */
const AGENTS = [
  { id:"allocation",    name:"Allocation",   icon:"◈", color:"#C4002B", nx:.50, ny:.12, field:"candidateCount",
    role:"Resource Allocation",  desc:"Maps every center, proctor, and asset against live demand." },
  { id:"risk",          name:"Risk",         icon:"⬡", color:"#BF8C2C", nx:.87, ny:.38, field:"regions",
    role:"Threat Intelligence",  desc:"Monitors 340+ disruption signals across infrastructure and weather." },
  { id:"operations",    name:"Operations",   icon:"⟁", color:"#E8A0B0", nx:.74, ny:.80, field:"centers",
    role:"Execution Spine",      desc:"Sequences every task chain without human intervention." },
  { id:"intelligence",  name:"Intelligence", icon:"◬", color:"#7C6FE8", nx:.26, ny:.80, field:"objectives",
    role:"Decision Engine",      desc:"Synthesizes agent data into high-confidence recommendations." },
  { id:"communication", name:"Comm",         icon:"◫", color:"#2EBFB0", nx:.13, ny:.38, field:"instructions",
    role:"Stakeholder Network",  desc:"Dispatches alerts to 50K+ stakeholders across all channels." },
];

const CONNECTIONS = [
  { from:"allocation",   to:"risk",           weight:.9 },
  { from:"allocation",   to:"operations",     weight:1.0 },
  { from:"allocation",   to:"intelligence",   weight:.7 },
  { from:"risk",         to:"intelligence",   weight:1.0 },
  { from:"risk",         to:"operations",     weight:.85 },
  { from:"risk",         to:"communication",  weight:.7 },
  { from:"operations",   to:"communication",  weight:.9 },
  { from:"operations",   to:"intelligence",   weight:.8 },
  { from:"intelligence", to:"communication",  weight:.75 },
  { from:"intelligence", to:"allocation",     weight:.85 },
];

/* ══════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════ */
function Nav({ isDark, toggleTheme, theme }) {
  const navigate = useNavigate();
  const items = [
    { label:"Overview",    path:"/dashboard" },
    { label:"Agents",      path:"/agents" },
    { label:"Missions",    path:"/missions" },
    { label:"Analytics",   path:"/analytics" },
    { label:"Orchestrate", path:"/orchestrate" },
  ];
  return (
    <motion.nav
      initial={{ y:-20, opacity:0 }} animate={{ y:0, opacity:1 }}
      transition={{ duration:.6, ease:[.22,1,.36,1] }}
      style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        height:58, display:"flex", alignItems:"center",
        padding:"0 clamp(16px,4vw,56px)", justifyContent:"space-between",
        background: isDark ? "rgba(3,2,8,0.94)" : "rgba(240,235,225,0.94)",
        backdropFilter:"blur(24px) saturate(1.8)",
        borderBottom:`1px solid ${theme.borderSubtle}`,
      }}>
      <button onClick={() => navigate("/dashboard")}
        style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer" }}>
        <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none"/>
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity=".85"/>
          <circle cx="15" cy="15" r="2.5" fill="#F0EBE1"/>
        </svg>
        <div>
          <span style={{ fontFamily:"'Cormorant Garant',serif", fontSize:17, fontWeight:600, color:theme.text }}>
            Orchestr<span style={{ color:theme.crimson, fontStyle:"italic" }}>AI</span>
          </span>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.textFaint, letterSpacing:"0.2em", textTransform:"uppercase", marginLeft:10 }}>
            Mission Control
          </span>
        </div>
      </button>

      <div style={{ display:"flex", gap:2 }} className="orch-nav-tabs">
        {items.map(item => (
          <button key={item.label} onClick={() => navigate(item.path)}
            style={{
              padding:"6px 16px",
              background: item.path==="/orchestrate" ? `rgba(${h2r(theme.crimson)},.12)` : "transparent",
              border:"none", borderRadius:5,
              color: item.path==="/orchestrate" ? theme.crimson : theme.textMuted,
              fontFamily:"'Space Grotesk',sans-serif",
              fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase",
              fontWeight: item.path==="/orchestrate" ? 600 : 400,
              cursor:"pointer", transition:"all 0.2s",
            }}>{item.label}</button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <motion.div animate={{ opacity:[1,.2,1] }} transition={{ duration:1.5, repeat:Infinity }}
            style={{ width:6, height:6, borderRadius:"50%", background:theme.crimson }} />
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:theme.crimson, letterSpacing:"0.12em", fontWeight:600 }}>LIVE</span>
        </div>
        <button onClick={toggleTheme}
          style={{ width:38, height:20, borderRadius:10, background:isDark?theme.crimson:theme.textFaint, border:"none", cursor:"pointer", position:"relative", transition:"background 0.35s", outline:"none" }}>
          <motion.div animate={{ x:isDark?19:2 }} transition={{ type:"spring", stiffness:340, damping:32 }}
            style={{ width:16, height:16, borderRadius:"50%", background:isDark?"#F0EBE1":"#0A0716", position:"absolute", top:2 }} />
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

/* ══════════════════════════════════════════════════════════
   SECTION 1 — MISSION COMMAND HEADER
══════════════════════════════════════════════════════════ */
function CommandHeader({ theme, missionConfig, isRunning, isDone }) {
  const impact = useMemo(() => {
    const c = parseInt((missionConfig.candidateCount||"").replace(/[^0-9]/g,"")) || 0;
    if (c > 1000000) return { label:"National Scale", color:theme.crimson };
    if (c > 100000)  return { label:"Regional Scale", color:theme.gold };
    return { label:"Local Scale", color:"#2EBFB0" };
  }, [missionConfig, theme]);

  const status = isDone ? "RESOLVED" : isRunning ? "EXECUTING" : missionConfig.name ? "CONFIGURED" : "CONFIGURING";
  const statusColor = isDone ? "#2EBFB0" : isRunning ? theme.crimson : theme.gold;

  const stats = [
    { label:"Mission Status",   value:status,          color:statusColor },
    { label:"Active Agents",    value:isRunning||isDone?"5 / 5":"0 / 5", color:theme.crimson },
    { label:"Estimated Impact", value:impact.label,    color:impact.color },
    { label:"Priority",         value:missionConfig.priority, color:missionConfig.priority==="CRITICAL"?theme.crimson:missionConfig.priority==="HIGH"?theme.gold:"#2EBFB0" },
  ];

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}
      style={{ paddingTop:"clamp(20px,3vw,36px)", paddingBottom:"clamp(20px,2.5vw,28px)", borderBottom:`1px solid ${theme.borderSubtle}`, marginBottom:"clamp(20px,2.5vw,28px)" }}>

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <div style={{ width:22, height:1.5, background:theme.crimson }} />
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, letterSpacing:"0.26em", color:theme.crimson, textTransform:"uppercase", fontWeight:500 }}>
          OrchestrAI · Operation Command
        </span>
      </div>

      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garant',serif", fontSize:"clamp(34px,4.2vw,60px)", fontWeight:400, lineHeight:1.0, color:theme.text, margin:0 }}>
            Orchestrate <em style={{ color:theme.crimson }}>Operation</em>
          </h1>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:theme.textMuted, fontWeight:300, marginTop:8, maxWidth:540, lineHeight:1.65 }}>
            Configure a mission and deploy autonomous agents. The system coordinates, decides, and executes — without human bottleneck.
          </p>
        </div>
        <div style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"12px 20px", border:`1px solid ${theme.borderGold}`, borderRadius:8,
          background:`rgba(${h2r(theme.gold)},.06)`, backdropFilter:"blur(16px)",
        }}>
          <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration:2, repeat:Infinity }}
            style={{ width:8, height:8, borderRadius:"50%", background:isRunning?theme.crimson:isDone?"#2EBFB0":"#2EBFB0" }} />
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:isRunning?theme.crimson:"#2EBFB0", letterSpacing:"0.14em", fontWeight:700 }}>
              {isRunning?"AGENTS EXECUTING":isDone?"MISSION RESOLVED":"AGENT MESH READY"}
            </div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.textFaint, letterSpacing:"0.08em" }}>
              5 agents standing by
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }} className="orch-stats-row">
        {stats.map((s,i) => (
          <motion.div key={s.label}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1+i*.07 }}
            style={{
              flex:1, minWidth:130, padding:"14px 18px",
              border:`1px solid ${theme.borderSubtle}`, borderRadius:8,
              background:theme.glass, backdropFilter:"blur(16px)",
            }}>
            <div style={{ fontFamily:"'Cormorant Garant',serif", fontSize:"clamp(20px,2vw,28px)", fontWeight:700, color:s.color, lineHeight:1, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.textFaint, letterSpacing:"0.12em", textTransform:"uppercase" }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 2 — AI MISSION BUILDER
══════════════════════════════════════════════════════════ */
const REGION_OPTIONS = [
  { value:"national", label:"National" },
  { value:"northern", label:"Northern" },
  { value:"southern", label:"Southern" },
  { value:"eastern",  label:"Eastern" },
  { value:"western",  label:"Western" },
];

const PRIORITY_OPTIONS = [
  { value:"NORMAL",   label:"Normal" },
  { value:"HIGH",     label:"High" },
  { value:"CRITICAL", label:"Critical" },
];

const CONSTRAINT_OPTS = [
  { label:"Minimize candidate travel distance",  icon:"◈", color:"#C4002B" },
  { label:"Reduce infrastructure risk exposure", icon:"⬡", color:"#BF8C2C" },
  { label:"Maximize center utilization",         icon:"⟁", color:"#E8A0B0" },
  { label:"Prioritize accessibility compliance", icon:"◬", color:"#7C6FE8" },
  { label:"Optimize proctor-to-center ratio",    icon:"◫", color:"#2EBFB0" },
];

function FieldLabel({ label, agentField, theme }) {
  const a = AGENTS.find(ag => ag.field === agentField);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
      {a && (
        <div style={{
          display:"flex", alignItems:"center", gap:4,
          padding:"2px 7px", borderRadius:3,
          background:`rgba(${h2r(a.color)},.10)`,
          border:`1px solid ${a.color}33`,
        }}>
          <span style={{ fontSize:9, color:a.color, fontFamily:"monospace" }}>{a.icon}</span>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:7.5, color:a.color, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700 }}>{a.name}</span>
        </div>
      )}
      <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8.5, color:theme.textFaint, letterSpacing:"0.14em", textTransform:"uppercase" }}>{label}</span>
    </div>
  );
}

function PremiumInput({ label, agentField, value, onChange, placeholder, theme, active, onFocusAgent }) {
  const a = AGENTS.find(ag => ag.field === agentField);
  const accent = a?.color || theme.crimson;
  return (
    <div>
      <FieldLabel label={label} agentField={agentField} theme={theme} />
      <div style={{ position:"relative" }}>
        <input
          type="text" value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => onFocusAgent?.(agentField)}
          style={{
            width:"100%", padding:"12px 36px 12px 14px",
            background: active ? `rgba(${h2r(accent)},.07)` : theme.glass,
            border:`1px solid ${active ? accent+"66" : theme.borderSubtle}`,
            borderRadius:7, color:theme.text, outline:"none",
            fontFamily:"'Space Grotesk',sans-serif", fontSize:13,
            transition:"border-color .25s, background .25s", boxSizing:"border-box",
          }}
          onBlur={e => { e.target.style.borderColor = active ? accent+"66" : theme.borderSubtle; e.target.style.background = active ? `rgba(${h2r(accent)},.07)` : theme.glass; }}
        />
        {active && (
          <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", width:6, height:6, borderRadius:"50%", background:accent }}>
            <motion.div animate={{ scale:[1,1.9,1], opacity:[1,0,1] }} transition={{ duration:1.6, repeat:Infinity }}
              style={{ position:"absolute", inset:0, borderRadius:"50%", background:accent }} />
          </div>
        )}
      </div>
    </div>
  );
}

function MissionBuilder({ theme, missionConfig, onConfigChange, setActiveField }) {
  const set = key => val => onConfigChange(key, val);

  const toggleConstraint = i => {
    const c = missionConfig.constraints;
    onConfigChange("constraints", c.includes(i) ? c.filter(x=>x!==i) : [...c,i]);
  };

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.55, delay:.15 }}
      style={{
        border:`1px solid ${theme.borderSubtle}`, borderRadius:14,
        background:theme.surface, backdropFilter:"blur(28px) saturate(1.6)",
        overflow:"hidden",
      }}>
      {/* Header */}
      <div style={{
        padding:"18px 24px", borderBottom:`1px solid ${theme.borderSubtle}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:`rgba(${h2r(theme.gold)},.03)`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:16, height:1.5, background:theme.gold }} />
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:theme.gold, letterSpacing:"0.22em", textTransform:"uppercase", fontWeight:500 }}>
            Mission Configuration
          </span>
        </div>
        <div style={{ display:"flex", gap:5 }}>
          {AGENTS.map(a => (
            <div key={a.id} style={{ width:6, height:6, borderRadius:"50%", background:a.color, opacity:missionConfig[a.field]?1:.15, transition:"opacity .3s" }} />
          ))}
        </div>
      </div>

      <div style={{ padding:24 }}>
        {/* Operation name */}
        <div style={{ marginBottom:20 }}>
          <FieldLabel label="Operation Name" theme={theme} />
          <input
            value={missionConfig.name}
            onChange={e => set("name")(e.target.value)}
            placeholder="e.g. NEET 2027 National Coordination"
            style={{
              width:"100%", padding:"14px 18px",
              background: missionConfig.name ? `rgba(${h2r(theme.crimson)},.05)` : theme.glass,
              border:`1px solid ${missionConfig.name ? theme.crimson+"44" : theme.borderSubtle}`,
              borderRadius:8, color:theme.text, outline:"none",
              fontFamily:"'Cormorant Garant',serif", fontSize:20, fontWeight:400,
              transition:"border-color .25s", boxSizing:"border-box",
            }}
          />
        </div>

        {/* 2-col core params */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }} className="orch-builder-grid">
          <PremiumInput label="Candidate Count" agentField="candidateCount"
            value={missionConfig.candidateCount}
            onChange={v => { set("candidateCount")(v); setActiveField("candidateCount"); }}
            placeholder="e.g. 2,300,000" theme={theme}
            active={!!missionConfig.candidateCount}
            onFocusAgent={setActiveField} />

          <PremiumInput label="Available Centers" agentField="centers"
            value={missionConfig.centers}
            onChange={v => { set("centers")(v); setActiveField("centers"); }}
            placeholder="e.g. 4,820" theme={theme}
            active={!!missionConfig.centers}
            onFocusAgent={setActiveField} />
        </div>

        {/* Region */}
        <div style={{ marginBottom:20 }}>
          <FieldLabel label="Operational Region" agentField="regions" theme={theme} />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {REGION_OPTIONS.map(opt => {
              const sel = missionConfig.regions === opt.value;
              return (
                <button key={opt.value} onClick={() => { set("regions")(opt.value); setActiveField("regions"); }}
                  style={{
                    flex:1, minWidth:70, padding:"9px 10px",
                    border:`1px solid ${sel ? "#BF8C2C55" : theme.borderSubtle}`,
                    borderRadius:6,
                    background: sel ? `rgba(${h2r(theme.gold)},.10)` : "transparent",
                    color: sel ? theme.gold : theme.textMuted,
                    fontFamily:"'Space Grotesk',sans-serif",
                    fontSize:9.5, letterSpacing:"0.05em", textTransform:"uppercase",
                    fontWeight: sel?700:400, cursor:"pointer", transition:"all .22s",
                  }}>{opt.label}</button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div style={{ marginBottom:20 }}>
          <FieldLabel label="Mission Priority" theme={theme} />
          <div style={{ display:"flex", gap:6 }}>
            {PRIORITY_OPTIONS.map(opt => {
              const sel = missionConfig.priority === opt.value;
              const c = opt.value==="CRITICAL"?theme.crimson:opt.value==="HIGH"?theme.gold:"#2EBFB0";
              return (
                <button key={opt.value} onClick={() => set("priority")(opt.value)}
                  style={{
                    flex:1, padding:"9px 10px",
                    border:`1px solid ${sel ? c+"55" : theme.borderSubtle}`,
                    borderRadius:6,
                    background: sel ? `rgba(${h2r(c)},.10)` : "transparent",
                    color: sel ? c : theme.textMuted,
                    fontFamily:"'Space Grotesk',sans-serif",
                    fontSize:9.5, letterSpacing:"0.05em", textTransform:"uppercase",
                    fontWeight:sel?700:400, cursor:"pointer", transition:"all .22s",
                  }}>{opt.label}</button>
              );
            })}
          </div>
        </div>

        {/* Objectives */}
        <div style={{ marginBottom:20 }}>
          <FieldLabel label="Optimization Objectives" agentField="objectives" theme={theme} />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {CONSTRAINT_OPTS.map((c,i) => {
              const active = missionConfig.constraints.includes(i);
              return (
                <motion.button key={i} whileTap={{ scale:.98 }}
                  onClick={() => { toggleConstraint(i); setActiveField("objectives"); }}
                  style={{
                    display:"flex", alignItems:"center", gap:10, padding:"9px 13px",
                    border:`1px solid ${active ? c.color+"44" : theme.borderSubtle}`,
                    borderRadius:7,
                    background: active ? `rgba(${h2r(c.color)},.07)` : "transparent",
                    cursor:"pointer", transition:"all .22s", textAlign:"left", width:"100%",
                  }}>
                  <div style={{
                    width:16, height:16, borderRadius:3, flexShrink:0,
                    border:`1.5px solid ${active ? c.color : theme.textFaint}`,
                    background: active ? `rgba(${h2r(c.color)},.2)` : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all .22s",
                  }}>
                    {active && <span style={{ fontSize:8, color:c.color }}>✓</span>}
                  </div>
                  <span style={{ fontSize:9.5, color:c.color, fontFamily:"monospace", flexShrink:0 }}>{c.icon}</span>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:11, color:active?theme.text:theme.textMuted, fontWeight:active?500:400 }}>
                    {c.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <FieldLabel label="Special Instructions" agentField="instructions" theme={theme} />
          <textarea
            value={missionConfig.instructions}
            onChange={e => { set("instructions")(e.target.value); setActiveField("instructions"); }}
            placeholder="Describe edge cases, constraints, or mission-specific context the agents should factor in…"
            rows={3}
            style={{
              width:"100%", padding:"12px 14px",
              background:theme.glass, border:`1px solid ${theme.borderSubtle}`,
              borderRadius:7, color:theme.text, resize:"none", outline:"none",
              fontFamily:"'Inter',sans-serif", fontSize:12.5, fontWeight:300,
              lineHeight:1.65, transition:"border-color .25s", boxSizing:"border-box",
            }}
            onFocus={e => { e.target.style.borderColor = "#2EBFB088"; }}
            onBlur={e => { e.target.style.borderColor = theme.borderSubtle; }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 3 — 3D CORE + LAUNCH (CENTER COLUMN)
══════════════════════════════════════════════════════════ */
function OrchestrateLaunchPanel({ theme, isDark, missionConfig, onLaunch, isRunning, isDone }) {
  const isConfigured = !!(missionConfig.name && missionConfig.candidateCount && missionConfig.centers);
  const [hov, setHov] = useState(false);

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.55, delay:.22 }}>

      {/* 3D Canvas */}
      <div style={{
        position:"relative",
        height:"clamp(280px,30vh,380px)",
        border:`1px solid ${isRunning?theme.crimson+"44":theme.borderSubtle}`,
        borderRadius:14, overflow:"hidden",
        background: isDark ? "rgba(8,4,18,0.7)" : "rgba(228,222,212,0.6)",
        backdropFilter:"blur(20px)",
        transition:"border-color .5s",
        marginBottom:"clamp(12px,1.8vw,18px)",
      }}>
        {/* radial bg */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background: isRunning
            ? `radial-gradient(ellipse at 50% 50%,rgba(${h2r(theme.crimson)},.18) 0%,transparent 65%)`
            : `radial-gradient(ellipse at 50% 50%,rgba(${h2r(theme.crimson)},.06) 0%,transparent 65%)`,
          transition:"background 1.2s",
        }} />
        <CoreScene3D isActive={isRunning} />
        {/* Status badge */}
        {isRunning && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{
              position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)",
              fontFamily:"'Space Grotesk',sans-serif", fontSize:9,
              color:theme.crimson, letterSpacing:"0.22em", textTransform:"uppercase",
              fontWeight:700, whiteSpace:"nowrap",
              background: isDark ? "rgba(3,2,8,.75)" : "rgba(240,235,225,.85)",
              backdropFilter:"blur(8px)",
              padding:"5px 14px", borderRadius:20,
              border:`1px solid ${theme.crimson}33`,
            }}>
            <motion.span animate={{ opacity:[1,.3,1] }} transition={{ duration:.9, repeat:Infinity }}>
              ● AGENTS EXECUTING
            </motion.span>
          </motion.div>
        )}
        {isDone && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{
              position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)",
              fontFamily:"'Space Grotesk',sans-serif", fontSize:9,
              color:"#2EBFB0", letterSpacing:"0.18em", textTransform:"uppercase",
              fontWeight:700, whiteSpace:"nowrap",
              background: isDark ? "rgba(3,2,8,.75)" : "rgba(240,235,225,.85)",
              backdropFilter:"blur(8px)",
              padding:"5px 14px", borderRadius:20,
              border:`1px solid #2EBFB033`,
            }}>
            ✓ ALL AGENTS RESOLVED
          </motion.div>
        )}
      </div>

      {/* Launch panel */}
      <motion.div
        style={{
          border:`1px solid ${isConfigured ? theme.crimson+"33" : theme.borderSubtle}`,
          borderRadius:14, overflow:"hidden",
          background:theme.surface, backdropFilter:"blur(24px)",
          position:"relative", transition:"border-color .4s",
        }}>
        {/* Top shimmer */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg,transparent,${theme.crimson},${theme.gold},transparent)`,
          opacity:isConfigured?.8:.15, transition:"opacity .4s",
        }} />

        <div style={{ padding:"22px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:16, height:1.5, background:theme.crimson }} />
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:theme.crimson, letterSpacing:"0.22em", textTransform:"uppercase", fontWeight:500 }}>
              Launch Control
            </span>
          </div>

          <h3 style={{ fontFamily:"'Cormorant Garant',serif", fontSize:"clamp(18px,1.8vw,24px)", fontWeight:500, color:theme.text, margin:"0 0 8px", lineHeight:1.2 }}>
            {isDone ? "Mission Resolved" : isRunning
              ? <span>Agents <em style={{ color:theme.gold }}>Executing…</em></span>
              : <span>Deploy to <em style={{ color:theme.crimson }}>Agent Mesh</em></span>
            }
          </h3>

          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:theme.textMuted, fontWeight:300, lineHeight:1.6, margin:"0 0 18px" }}>
            {isDone ? "All agents completed coordination. Resolution dispatched."
              : isRunning ? "5 agents are collaborating autonomously."
              : isConfigured ? "Mission configured. Launch to deploy all 5 agents."
              : "Complete mission configuration to enable launch."}
          </p>

          {/* Readiness checklist */}
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:18 }}>
            {[
              { label:"Operation name defined",    ok:!!missionConfig.name },
              { label:"Candidate count specified", ok:!!missionConfig.candidateCount },
              { label:"Centers configured",        ok:!!missionConfig.centers },
              { label:"Objectives set",            ok:missionConfig.constraints.length>0 },
            ].map(ch => (
              <div key={ch.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{
                  width:14, height:14, borderRadius:"50%", flexShrink:0,
                  border:`1px solid ${ch.ok?"#2EBFB0":theme.textFaint}`,
                  background:ch.ok?"rgba(46,191,176,.15)":"transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .3s",
                }}>
                  {ch.ok && <span style={{ fontSize:7, color:"#2EBFB0" }}>✓</span>}
                </div>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, color:ch.ok?theme.text:theme.textFaint, transition:"color .3s" }}>{ch.label}</span>
              </div>
            ))}
          </div>

          {/* THE BUTTON */}
          <motion.button
            onHoverStart={() => setHov(true)}
            onHoverEnd={() => setHov(false)}
            whileHover={isConfigured&&!isRunning?{ scale:1.03, boxShadow:`0 14px 48px ${theme.crimsonGlow}` }:{}}
            whileTap={isConfigured&&!isRunning?{ scale:.97 }:{}}
            onClick={isConfigured&&!isRunning ? onLaunch : undefined}
            style={{
              width:"100%", padding:"16px 24px",
              background: isDone
                ? `rgba(${h2r(theme.gold)},.15)`
                : isRunning
                  ? `rgba(${h2r(theme.crimson)},.35)`
                  : isConfigured ? theme.crimson
                  : `rgba(${h2r(theme.crimson)},.12)`,
              border:`1px solid ${isDone?theme.borderGold:isConfigured?"transparent":theme.borderSubtle}`,
              borderRadius:8, color:isDone?theme.gold:"#F0EBE1",
              fontFamily:isDone?"'Space Grotesk',sans-serif":"'Cormorant Garant',serif",
              fontSize:isDone?10:19, fontWeight:isDone?700:600,
              fontStyle:isDone?"normal":"italic",
              letterSpacing:isDone?"0.16em":"0.02em",
              textTransform:isDone?"uppercase":"none",
              cursor:isConfigured&&!isRunning?"pointer":"not-allowed",
              transition:"all .3s",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              position:"relative", overflow:"hidden",
            }}>
            {/* shimmer on hover */}
            {hov && isConfigured && !isRunning && (
              <motion.div
                initial={{ x:"-100%", opacity:0 }}
                animate={{ x:"200%", opacity:.25 }}
                transition={{ duration:.7, ease:"easeInOut" }}
                style={{ position:"absolute", top:0, bottom:0, width:"50%", background:"linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)", pointerEvents:"none" }}
              />
            )}
            {isDone ? (<><span>✓</span> Mission Complete — Reset</>)
              : isRunning ? (
                  <><motion.span animate={{ rotate:360 }} transition={{ duration:1.2, repeat:Infinity, ease:"linear" }} style={{ display:"inline-block", fontFamily:"monospace", fontSize:17 }}>⟳</motion.span> Agents Working…</>
                )
              : (<>⚡ Begin Orchestration</>)
            }
          </motion.button>

          {isConfigured && !isRunning && !isDone && (
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8.5, color:theme.textFaint, letterSpacing:"0.1em", textAlign:"center", marginTop:9 }}>
              All 5 agents activate simultaneously · ~6.2s resolution
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 3R — LIVE AGENT NETWORK SVG
   Interactive pentagonal mesh with data packets,
   click-to-inspect agent detail panel
══════════════════════════════════════════════════════════ */
function AgentNetworkPanel({ theme, isDark, activeField, isRunning, isDone, missionConfig, agentStatuses }) {
  const containerRef = useRef();
  const [dims, setDims] = useState({ w:560, h:340 });
  const [pulses, setPulses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(e => { const r = e[0].contentRect; setDims({ w:r.width, h:r.height }); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Spawn pulses
  useEffect(() => {
    const rate = isRunning ? 180 : 500;
    const iv = setInterval(() => {
      const conn = CONNECTIONS[Math.floor(Math.random()*CONNECTIONS.length)];
      setPulses(p => [...p.slice(-24), {
        id:`${Date.now()}-${Math.random()}`,
        from:conn.from, to:conn.to, t:0,
        color:AGENTS.find(a=>a.id===conn.from)?.color||"#fff",
        speed: isRunning ? .026 : .012,
      }]);
    }, rate);
    return () => clearInterval(iv);
  }, [isRunning]);

  // Animate pulses
  useEffect(() => {
    let raf;
    const frame = () => {
      setPulses(prev => prev.map(p=>({...p,t:p.t+(p.speed||.013)})).filter(p=>p.t<1));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const agentMap = useMemo(() => Object.fromEntries(AGENTS.map(a=>[a.id,a])), []);
  const pt = a => ({ x:a.nx*dims.w, y:a.ny*dims.h });

  const activeAgentId = useMemo(() => {
    if (!activeField) return null;
    return AGENTS.find(a=>a.field===activeField)?.id||null;
  }, [activeField]);

  const isNodeHighlit = id => {
    if (isRunning) return true;
    if (!activeAgentId) return false;
    if (id===activeAgentId) return true;
    return CONNECTIONS.some(c=>(c.from===activeAgentId&&c.to===id)||(c.to===activeAgentId&&c.from===id));
  };

  const isConnHighlit = c => {
    if (isRunning) return true;
    if (!activeAgentId) return false;
    return c.from===activeAgentId||c.to===activeAgentId;
  };

  const selectedAgent = selectedId ? AGENTS.find(a=>a.id===selectedId) : null;
  const selStatus = isRunning ? "ACTIVE" : isDone ? "RESOLVED" : "STANDBY";

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.55, delay:.3 }}
      style={{
        border:`1px solid ${isRunning?theme.crimson+"44":theme.borderSubtle}`,
        borderRadius:14, overflow:"hidden",
        background: isDark ? "rgba(8,4,18,0.65)" : "rgba(228,222,212,0.55)",
        backdropFilter:"blur(20px)", transition:"border-color .5s",
      }}>

      {/* Header */}
      <div style={{
        padding:"13px 20px", borderBottom:`1px solid ${theme.borderSubtle}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:14, height:1.5, background:theme.sakura }} />
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:theme.sakura, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:500 }}>
            Agent Network · Live
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {isRunning && (
            <motion.div animate={{ opacity:[1,.2,1] }} transition={{ duration:.9, repeat:Infinity }}
              style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:theme.crimson }} />
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.crimson, letterSpacing:"0.14em" }}>EXECUTING</span>
            </motion.div>
          )}
          {!isRunning && !isDone && (
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.textFaint, letterSpacing:"0.1em" }}>
              {activeAgentId ? `${AGENTS.find(a=>a.id===activeAgentId)?.name||""} Active` : "Standby"}
            </span>
          )}
          {isDone && <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:"#2EBFB0", letterSpacing:"0.1em" }}>RESOLVED ✓</span>}
        </div>
      </div>

      {/* SVG canvas */}
      <div ref={containerRef} style={{ height:"clamp(280px,32vh,400px)", position:"relative" }}>
        {/* Ambient radial */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background: isRunning
            ? `radial-gradient(ellipse at 50% 50%,rgba(${h2r(theme.crimson)},.10) 0%,transparent 65%)`
            : `radial-gradient(ellipse at 50% 50%,rgba(${h2r(theme.crimson)},.03) 0%,transparent 65%)`,
          transition:"background .8s",
        }} />

        <svg viewBox={`0 0 ${dims.w} ${dims.h}`} style={{ width:"100%", height:"100%", overflow:"visible" }} preserveAspectRatio="xMidYMid meet">
          <defs>
            {AGENTS.map(a => (
              <radialGradient key={a.id} id={`aglow-${a.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={a.color} stopOpacity=".55" />
                <stop offset="100%" stopColor={a.color} stopOpacity="0" />
              </radialGradient>
            ))}
            <filter id="anetglow"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
          </defs>

          {/* Central node */}
          <circle cx={dims.w*.5} cy={dims.h*.5} r={isRunning?18:10}
            fill="none" stroke={theme.crimson} strokeWidth={isRunning?1.4:.6} opacity={isRunning?.55:.18} style={{ transition:"r .5s" }}>
            {isRunning && <animate attributeName="r" values="12;20;12" dur="1.8s" repeatCount="indefinite"/>}
          </circle>
          <circle cx={dims.w*.5} cy={dims.h*.5} r={isRunning?7:4}
            fill={`rgba(${h2r(theme.crimson)},${isRunning?.35:.12})`} stroke={theme.crimson} strokeWidth=".7" style={{ transition:"all .5s" }}>
            {isRunning && <animate attributeName="r" values="5;9;5" dur="1.2s" repeatCount="indefinite"/>}
          </circle>

          {/* Spokes */}
          {AGENTS.map(a => {
            const p = pt(a);
            const hl = isConnHighlit({from:a.id,to:a.id});
            return (
              <line key={`sp-${a.id}`}
                x1={dims.w*.5} y1={dims.h*.5} x2={p.x} y2={p.y}
                stroke={hl?a.color:theme.textFaint}
                strokeWidth={hl?.7:.25}
                strokeDasharray={hl?"none":"2 7"}
                opacity={hl?.4:.08} style={{ transition:"all .4s" }}
              />
            );
          })}

          {/* Connection threads */}
          {CONNECTIONS.map((conn,i) => {
            const from = agentMap[conn.from], to = agentMap[conn.to];
            if (!from||!to) return null;
            const fp = pt(from), tp = pt(to);
            const hl = isConnHighlit(conn);
            const dimmed = activeAgentId && !hl && !isRunning;
            const mid = {
              x:(fp.x+tp.x)/2 + Math.sin(i*2.3)*dims.w*.035,
              y:(fp.y+tp.y)/2 + Math.cos(i*1.7)*dims.h*.05,
            };
            const d = `M${fp.x} ${fp.y} Q${mid.x} ${mid.y} ${tp.x} ${tp.y}`;
            return (
              <g key={`cn-${i}`}>
                <path d={d} fill="none"
                  stroke={hl?from.color:theme.textFaint}
                  strokeWidth={hl?conn.weight*1.8:conn.weight*.35}
                  strokeDasharray={hl?"none":"3 6"}
                  opacity={dimmed?.04:hl?.62:.14} style={{ transition:"all .4s" }}
                />
                {hl && <path d={d} fill="none" stroke={from.color} strokeWidth={conn.weight*5} opacity={.07} filter="url(#anetglow)" />}
              </g>
            );
          })}

          {/* Pulses */}
          {pulses.map(pulse => {
            const from = agentMap[pulse.from], to = agentMap[pulse.to];
            if (!from||!to) return null;
            const fp=pt(from), tp=pt(to);
            const ci = CONNECTIONS.findIndex(c=>c.from===pulse.from&&c.to===pulse.to);
            const mid = ci>=0 ? {
              x:(fp.x+tp.x)/2+Math.sin(ci*2.3)*dims.w*.035,
              y:(fp.y+tp.y)/2+Math.cos(ci*1.7)*dims.h*.05,
            } : {x:(fp.x+tp.x)/2,y:(fp.y+tp.y)/2};
            const t=pulse.t;
            const x=(1-t)*(1-t)*fp.x+2*(1-t)*t*mid.x+t*t*tp.x;
            const y=(1-t)*(1-t)*fp.y+2*(1-t)*t*mid.y+t*t*tp.y;
            const op = Math.sin(t*Math.PI)*(isRunning?.95:.62);
            const r = isRunning?4.5:3;
            return (
              <g key={pulse.id}>
                <circle cx={x} cy={y} r={r} fill={pulse.color} opacity={op} />
                {isRunning && <circle cx={x} cy={y} r={r*2.5} fill={pulse.color} opacity={op*.14} />}
              </g>
            );
          })}

          {/* Agent nodes */}
          {AGENTS.map(a => {
            const p = pt(a);
            const hl = isNodeHighlit(a.id);
            const isAct = a.id===activeAgentId;
            const dimmed = activeAgentId&&!hl&&!isRunning;
            const filled = !!missionConfig[a.field];
            const isSel = selectedId===a.id;
            const outerR = isRunning?42:isAct?34:hl?26:20;
            const innerR = isRunning?21:isAct?17:hl?12:9;

            return (
              <g key={a.id} onClick={() => setSelectedId(isSel?null:a.id)} style={{ cursor:"pointer" }}>
                {/* Glow halo */}
                <circle cx={p.x} cy={p.y} r={outerR*2} fill={`url(#aglow-${a.id})`}
                  opacity={dimmed?.03:isRunning?.78:isAct?.62:.18} style={{ transition:"all .5s" }}>
                  {(isRunning||isAct) && <animate attributeName="r" values={`${outerR*1.6};${outerR*2.5};${outerR*1.6}`} dur={`${2.2+Math.random()*.4}s`} repeatCount="indefinite"/>}
                </circle>
                {/* Orbit ring */}
                <circle cx={p.x} cy={p.y} r={outerR}
                  fill="none" stroke={a.color}
                  strokeWidth={isRunning?1.4:isAct?1.2:.45}
                  strokeDasharray={isRunning||isAct?"none":"4 8"}
                  opacity={dimmed?.05:isRunning?.58:isAct?.52:.22} style={{ transition:"all .5s" }}>
                  {(isRunning||isAct) && (
                    <animateTransform attributeName="transform" type="rotate"
                      from={`0 ${p.x} ${p.y}`} to={`360 ${p.x} ${p.y}`}
                      dur={isRunning?"4s":"8s"} repeatCount="indefinite"/>
                  )}
                </circle>
                {/* Selected ring */}
                {isSel && <circle cx={p.x} cy={p.y} r={outerR+8} fill="none" stroke={a.color} strokeWidth="1" opacity=".35" strokeDasharray="2 4"/>}
                {/* Node body */}
                <circle cx={p.x} cy={p.y} r={innerR}
                  fill={`rgba(${h2r(a.color)},${isRunning?.33:isAct?.26:filled?.13:.07})`}
                  stroke={a.color}
                  strokeWidth={isRunning?2.4:isAct?2:filled?1.4:.7}
                  opacity={dimmed?.12:1} style={{ transition:"all .4s" }}
                />
                {/* Icon */}
                <text x={p.x} y={p.y+1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={isRunning?14:isAct?13:10} fill={a.color} opacity={dimmed?.15:1}
                  style={{ fontFamily:"monospace", pointerEvents:"none", transition:"font-size .3s,opacity .4s" }}>
                  {a.icon}
                </text>
                {/* Label */}
                <text x={p.x} y={p.y+innerR+(isRunning?26:isAct?24:18)}
                  textAnchor="middle" fontSize={isRunning?11:isAct?11:9}
                  fill={dimmed?theme.textFaint:(isRunning||isAct)?a.color:theme.textMuted}
                  style={{ fontFamily:"'Space Grotesk',sans-serif", pointerEvents:"none", transition:"all .3s" }}>
                  {a.name}
                </text>
                {/* Filled dot */}
                {filled && !isRunning && (
                  <circle cx={p.x+innerR*.62} cy={p.y-innerR*.62} r={3} fill={a.color} opacity=".88">
                    <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite"/>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Idle hint */}
        <AnimatePresence>
          {!activeField && !isRunning && !selectedId && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ delay:1.5 }}
              style={{
                position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)",
                fontFamily:"'Space Grotesk',sans-serif", fontSize:8.5, color:theme.textFaint,
                letterSpacing:"0.18em", textTransform:"uppercase", whiteSpace:"nowrap", pointerEvents:"none",
              }}>
              Configure fields · click nodes to inspect
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Agent inspect panel */}
      <AnimatePresence>
        {selectedAgent ? (
          <motion.div key={selectedAgent.id}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
            transition={{ duration:.22 }}
            style={{
              borderTop:`1px solid ${theme.borderSubtle}`,
              padding:"14px 20px",
              background:`rgba(${h2r(selectedAgent.color)},.05)`,
            }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
              <span style={{ fontSize:20, color:selectedAgent.color, fontFamily:"monospace" }}>{selectedAgent.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, color:selectedAgent.color, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                  {selectedAgent.name} Agent
                </div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8.5, color:theme.textMuted }}>{selectedAgent.role}</div>
              </div>
              <span style={{
                fontFamily:"'Space Grotesk',sans-serif", fontSize:7.5,
                color:isRunning?"#2EBFB0":isDone?"#2EBFB0":theme.textFaint,
                background:`rgba(${h2r(isRunning?"#2EBFB0":"#888")},.1)`,
                padding:"3px 8px", borderRadius:4, fontWeight:700, letterSpacing:"0.1em",
              }}>{selStatus}</span>
            </div>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11.5, color:theme.textMuted, fontWeight:300, margin:0, lineHeight:1.5 }}>
              {selectedAgent.desc}
            </p>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ borderTop:`1px solid ${theme.borderSubtle}`, padding:"10px 20px", display:"flex", gap:10, flexWrap:"wrap" }}>
            {AGENTS.map(a => {
              const fa = a.field===activeField;
              const ff = !!missionConfig[a.field];
              return (
                <div key={a.id} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:a.color, opacity:isRunning?1:fa?1:ff?.72:.22, transition:"opacity .3s" }} />
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8.5, color:fa||isRunning?a.color:theme.textMuted, transition:"color .3s", letterSpacing:"0.04em" }}>
                    {a.name}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 5 — AGENT EXECUTION STREAM
══════════════════════════════════════════════════════════ */
const EXECUTION_STEPS = [
  {
    agent:"Risk", icon:"⬡", color:"#BF8C2C", phase:"Threat Detection",
    outputs:[
      "Scanning 340+ infrastructure signals across all regions",
      "Weather anomaly detected at Zone 7 · 2.4h window identified",
      "3 examination centers flagged · capacity risk threshold exceeded",
      "Escalating to Allocation and Intelligence agents",
    ],
    duration:1400,
  },
  {
    agent:"Intelligence", icon:"◬", color:"#7C6FE8", phase:"Impact Assessment",
    outputs:[
      "Ingesting Risk Agent telemetry · building decision model",
      "12,400 candidates affected · 6 viable alternate centers identified",
      "Historical pattern match: 2019 monsoon incident · Protocol Delta applicable",
      "Confidence: 97% · Recommending immediate reallocation",
    ],
    duration:1600,
  },
  {
    agent:"Allocation", icon:"◈", color:"#C4002B", phase:"Resource Optimization",
    outputs:[
      "Computing optimal center-candidate assignment matrix",
      "847 proctors redistributed across 12 centers",
      "Transport routes reserved via API · 98.2% coverage",
      "Backup node B12 confirmed · 2,300-candidate capacity",
    ],
    duration:1400,
  },
  {
    agent:"Operations", icon:"⟁", color:"#E8A0B0", phase:"Execution Sequencing",
    outputs:[
      "Dependency chain resolved · 48 tasks ordered with zero conflicts",
      "Staff reassignment confirmed across 12 zones",
      "Logistics chain validated · ETA within relocation window",
      "SLA compliance: 99.4% · Execution authorized",
    ],
    duration:1300,
  },
  {
    agent:"Communication", icon:"◫", color:"#2EBFB0", phase:"Stakeholder Dispatch",
    outputs:[
      "12,400 candidate SMS notifications queued",
      "94 center coordinators briefed via secure channel",
      "Media advisory drafted and dispatched",
      "Delivery rate: 99.1% · Incident closed",
    ],
    duration:1100,
  },
];

function ExecutionStream({ theme, runningStep, completedSteps, streamLines }) {
  const scrollRef = useRef();
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [streamLines]);

  if (runningStep<0 && completedSteps.length===0) return (
    <div style={{ minHeight:380, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:22, color:theme.textFaint, fontFamily:"monospace" }}>⟁</div>
      <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9.5, color:theme.textFaint, letterSpacing:"0.14em", textTransform:"uppercase", textAlign:"center" }}>
        Awaiting launch<br/>Stream activates on orchestration start
      </p>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Phase timeline */}
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {EXECUTION_STEPS.map((step,i) => {
          const isAct = runningStep===i;
          const isDone = completedSteps.includes(i);
          const pend = !isAct&&!isDone;
          return (
            <motion.div key={step.agent}
              animate={{ opacity:pend?.25:1 }}
              style={{
                display:"flex", alignItems:"flex-start", gap:10,
                padding:"10px 12px",
                borderLeft:`2.5px solid ${isDone||isAct?step.color:"transparent"}`,
                borderRadius:"0 6px 6px 0",
                background:isAct?`rgba(${h2r(step.color)},.07)`:isDone?`rgba(${h2r(step.color)},.03)`:"transparent",
                transition:"all .3s",
              }}>
              <div style={{
                width:24, height:24, borderRadius:"50%", flexShrink:0,
                border:`1.5px solid ${isDone||isAct?step.color:theme.textFaint}`,
                background:isDone?`rgba(${h2r(step.color)},.15)`:"transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, color:isDone||isAct?step.color:theme.textFaint,
                transition:"all .3s",
              }}>
                {isDone?"✓":isAct?(<motion.span animate={{ opacity:[1,.3,1] }} transition={{ duration:.8,repeat:Infinity }}>{step.icon}</motion.span>):step.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:2 }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, fontWeight:700, color:step.color, letterSpacing:"0.1em", textTransform:"uppercase" }}>{step.agent}</span>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.textFaint, letterSpacing:"0.06em" }}>{step.phase}</span>
                  {isAct && (
                    <motion.span animate={{ opacity:[0,1,0] }} transition={{ duration:1,repeat:Infinity }}
                      style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:7, color:step.color, background:`rgba(${h2r(step.color)},.10)`, padding:"1px 5px", borderRadius:3 }}>
                      PROCESSING
                    </motion.span>
                  )}
                  {isDone && <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:7, color:step.color }}>✓ DONE</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live output lines */}
      {streamLines.length>0 && (
        <div style={{ borderTop:`1px solid ${theme.borderSubtle}`, paddingTop:12 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.textFaint, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8 }}>Live Output</div>
          <div ref={scrollRef} style={{ maxHeight:160, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
            {streamLines.map((line,i) => (
              <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ duration:.22 }}
                style={{
                  display:"flex", gap:8, padding:"5px 8px", borderRadius:4,
                  background:i===streamLines.length-1?`rgba(${h2r(line.color)},.06)`:"transparent",
                  borderLeft:i===streamLines.length-1?`2px solid ${line.color}`:"2px solid transparent",
                }}>
                <span style={{ fontSize:9, color:line.color, flexShrink:0, fontFamily:"monospace", lineHeight:"16px" }}>{line.icon}</span>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:theme.textMuted, fontWeight:300, lineHeight:1.45 }}>{line.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 6 — DECISION ENGINE
══════════════════════════════════════════════════════════ */
function DecisionEngine({ theme, isDone, missionConfig }) {
  const recs = useMemo(() => [
    {
      type:"RECOMMENDED ACTION", typeColor:"#7C6FE8", agent:"Intelligence", icon:"◬",
      title:"Relocate candidates to Center B12",
      detail:`Center 7 infrastructure risk exceeds threshold. B12 has 96% capacity alignment with ${missionConfig.candidateCount||"target"} candidate volume. Relocation window: 2.4 hours.`,
      riskReduction:38, resourceSaving:22, confidence:97,
    },
    {
      type:"RISK MITIGATION", typeColor:"#BF8C2C", agent:"Risk", icon:"⬡",
      title:"Pre-emptive NH-48 corridor rerouting",
      detail:"Traffic density models predict gridlock affecting 6 examination routes within 90 minutes. Ring Road East alternative: 14% travel time reduction.",
      riskReduction:54, resourceSaving:8, confidence:89,
    },
    {
      type:"OPTIMIZATION", typeColor:"#2EBFB0", agent:"Allocation", icon:"◈",
      title:"Proctor mesh rebalance — lift to 99.4%",
      detail:"147 proctors currently underutilized across 8 centers. Redistribution increases coverage at zero additional cost.",
      riskReduction:22, resourceSaving:34, confidence:94,
    },
  ], [missionConfig]);

  if (!isDone) return (
    <div style={{ minHeight:380, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, padding:24 }}>
      <div style={{ fontSize:22, color:theme.textFaint, fontFamily:"monospace" }}>◬</div>
      <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:theme.textFaint, letterSpacing:"0.14em", textTransform:"uppercase", textAlign:"center" }}>
        Decision engine will activate<br/>after orchestration runs
      </p>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {recs.map((rec,i) => (
        <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.14 }}
          style={{
            padding:"18px 20px",
            border:`1px solid ${rec.typeColor}33`,
            borderRadius:10, background:`rgba(${h2r(rec.typeColor)},.04)`,
            position:"relative", overflow:"hidden",
          }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:2.5, background:rec.typeColor, opacity:.7 }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontFamily:"monospace", fontSize:14, color:rec.typeColor }}>{rec.icon}</span>
              <div>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:rec.typeColor, letterSpacing:"0.16em", textTransform:"uppercase", fontWeight:700, background:`rgba(${h2r(rec.typeColor)},.12)`, padding:"2px 7px", borderRadius:3 }}>
                  {rec.type}
                </span>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.textFaint, letterSpacing:"0.08em", marginTop:3 }}>via {rec.agent} Agent</div>
              </div>
            </div>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:rec.typeColor, fontWeight:700 }}>↑{rec.confidence}% conf.</span>
          </div>
          <h4 style={{ fontFamily:"'Cormorant Garant',serif", fontSize:18, fontWeight:500, color:theme.text, margin:"0 0 7px", lineHeight:1.2 }}>{rec.title}</h4>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:11.5, color:theme.textMuted, fontWeight:300, lineHeight:1.6, margin:"0 0 12px" }}>{rec.detail}</p>
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Cormorant Garant',serif", fontSize:22, fontWeight:700, color:rec.typeColor, lineHeight:1 }}>↓{rec.riskReduction}%</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:7.5, color:theme.textFaint, letterSpacing:"0.1em", textTransform:"uppercase" }}>Risk Reduction</div>
            </div>
            <div>
              <div style={{ fontFamily:"'Cormorant Garant',serif", fontSize:22, fontWeight:700, color:theme.gold, lineHeight:1 }}>↑{rec.resourceSaving}%</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:7.5, color:theme.textFaint, letterSpacing:"0.1em", textTransform:"uppercase" }}>Resource Efficiency</div>
            </div>
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:.97 }}
              style={{
                marginLeft:"auto", padding:"8px 16px", background:rec.typeColor,
                border:"none", borderRadius:5, color:"#F0EBE1",
                fontFamily:"'Space Grotesk',sans-serif", fontSize:9, fontWeight:700,
                letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer",
              }}>Execute →</motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 7 — FINAL RESOLUTION
══════════════════════════════════════════════════════════ */
function FinalResolution({ theme, isDone, missionConfig }) {
  if (!isDone) return null;
  const candidates = missionConfig.candidateCount||"2.3M";
  const centers = missionConfig.centers||"4,820";
  const name = missionConfig.name||"National Examination Operation";

  return (
    <motion.div initial={{ opacity:0, y:24, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:.55, ease:[.22,1,.36,1] }}
      style={{
        border:`1px solid ${theme.borderGold}`, borderRadius:14,
        background:`rgba(${h2r(theme.gold)},.04)`,
        backdropFilter:"blur(24px)", overflow:"hidden", position:"relative",
      }}>

      {/* Tri-color shimmer top */}
      <div style={{ height:3, background:`linear-gradient(90deg,transparent,${theme.gold},${theme.crimson},${theme.gold},transparent)` }} />

      <div style={{ padding:"32px 32px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{ width:20, height:1.5, background:theme.gold }} />
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:theme.gold, letterSpacing:"0.24em", textTransform:"uppercase", fontWeight:500 }}>
            Mission Resolved · Autonomous
          </span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:20, alignItems:"start", marginBottom:28 }} className="orch-res-top">
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garant',serif", fontSize:"clamp(24px,2.8vw,40px)", fontWeight:500, color:theme.text, margin:"0 0 8px", lineHeight:1.1 }}>
              {name}
            </h2>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:theme.textMuted, fontWeight:300, lineHeight:1.65, margin:0 }}>
              Five agents coordinated autonomously and produced a complete operational resolution in 6.2 seconds. All stakeholders notified. All resources allocated. Zero human bottleneck.
            </p>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontFamily:"'Cormorant Garant',serif", fontSize:"clamp(40px,4vw,60px)", fontWeight:700, color:theme.gold, lineHeight:1 }}>6.2s</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8.5, color:theme.textFaint, letterSpacing:"0.12em", textTransform:"uppercase", marginTop:4 }}>Resolution Time</div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }} className="orch-outcome-grid">
          {[
            { label:"Candidates Protected", value:candidates, color:theme.crimson },
            { label:"Centers Coordinated",  value:centers,    color:theme.gold },
            { label:"Risk Reduction",        value:"↓38%",    color:"#2EBFB0" },
            { label:"Autonomous Score",      value:"99.2%",   color:theme.sakura },
          ].map((m,i) => (
            <motion.div key={m.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1+i*.08 }}
              style={{
                padding:"16px 14px",
                border:`1px solid ${m.color}22`,
                borderRadius:8, background:`rgba(${h2r(m.color)},.05)`,
              }}>
              <div style={{ fontFamily:"'Cormorant Garant',serif", fontSize:"clamp(20px,2vw,28px)", fontWeight:700, color:m.color, lineHeight:1, marginBottom:5 }}>{m.value}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:7.5, color:theme.textFaint, letterSpacing:"0.1em", textTransform:"uppercase" }}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Agent completion badges */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:22 }}>
          {EXECUTION_STEPS.map((step,i) => (
            <motion.div key={step.agent} initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.2+i*.08 }}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"6px 12px", borderRadius:6,
                border:`1px solid ${step.color}33`,
                background:`rgba(${h2r(step.color)},.08)`,
              }}>
              <span style={{ fontFamily:"monospace", fontSize:11, color:step.color }}>{step.icon}</span>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:step.color, fontWeight:600, letterSpacing:"0.06em" }}>{step.agent}</span>
              <span style={{ fontSize:9, color:step.color }}>✓</span>
            </motion.div>
          ))}
        </div>

        {/* 10000× advantage callout */}
        <div style={{
          padding:"16px 20px", border:`1px solid ${theme.borderSubtle}`, borderRadius:8,
          background:theme.glass, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12,
        }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8.5, color:theme.textFaint, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:4 }}>Human equivalent response time</div>
            <div style={{ fontFamily:"'Cormorant Garant',serif", fontSize:20, color:theme.textMuted, fontWeight:400 }}>4–6 hours</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8.5, color:theme.gold, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>OrchestrAI advantage</div>
            <div style={{ fontFamily:"'Cormorant Garant',serif", fontSize:24, color:theme.gold, fontWeight:700 }}>10,000×</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   ORCHESTRATION HOOK
══════════════════════════════════════════════════════════ */
function useOrchestration() {
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [runningStep, setRunningStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [streamLines, setStreamLines] = useState([]);

  const launch = useCallback(() => {
    setIsRunning(true); setIsDone(false);
    setRunningStep(-1); setCompletedSteps([]); setStreamLines([]);
    let step = 0;
    const run = () => {
      if (step >= EXECUTION_STEPS.length) {
        setRunningStep(-1); setIsRunning(false); setIsDone(true); return;
      }
      const cur = EXECUTION_STEPS[step];
      setRunningStep(step);
      cur.outputs.forEach((out,oi) => {
        setTimeout(() => {
          setStreamLines(prev => [...prev.slice(-30), { text:out, color:cur.color, icon:cur.icon }]);
        }, oi*(cur.duration/cur.outputs.length));
      });
      setTimeout(() => { setCompletedSteps(p=>[...p,step]); step++; run(); }, cur.duration);
    };
    setTimeout(run, 300);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false); setIsDone(false);
    setRunningStep(-1); setCompletedSteps([]); setStreamLines([]);
  }, []);

  return { isRunning, isDone, runningStep, completedSteps, streamLines, launch, reset };
}

/* ══════════════════════════════════════════════════════════
   DEFAULT MISSION CONFIG
══════════════════════════════════════════════════════════ */
const DEFAULT_MISSION = {
  name:"", candidateCount:"", centers:"",
  regions:"national", priority:"HIGH",
  constraints:[0,2], instructions:"",
};

/* ══════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════ */
export default function OrchestratePage() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("orchestrai-theme") !== "light"; } catch { return true; }
  });
  const theme = isDark ? THEMES.dark : THEMES.light;

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("orchestrai-theme", next?"dark":"light"); } catch {}
      return next;
    });
  }, []);

  const [missionConfig, setMissionConfig] = useState({ ...DEFAULT_MISSION });
  const [activeField, setActiveField] = useState(null);

  const handleConfigChange = useCallback((key, val) => {
    setMissionConfig(prev => ({ ...prev, [key]:val }));
  }, []);

  const { isRunning, isDone, runningStep, completedSteps, streamLines, launch, reset } = useOrchestration();

  const handleLaunch = useCallback(() => { if (isDone) { reset(); setMissionConfig({...DEFAULT_MISSION}); setActiveField(null); } else { launch(); } }, [isDone, launch, reset]);

  return (
    <>
      <InjectFonts />
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:${theme.bg};color:${theme.text};overflow-x:hidden;transition:background .55s ease,color .55s ease}
        ::selection{background:${theme.crimson}50;color:${theme.text}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${theme.crimson}55;border-radius:2px}
        input,textarea,select{background:transparent}
        input::placeholder,textarea::placeholder{color:${theme.textFaint}}

        @media(max-width:1200px){.orch-tri-col{grid-template-columns:1fr 0.75fr!important}}
        @media(max-width:1000px){.orch-tri-col{grid-template-columns:1fr!important}.orch-launch-col{order:-1!important}}
        @media(max-width:880px){
          .orch-nav-tabs{display:none!important}
          .orch-builder-grid{grid-template-columns:1fr!important}
          .orch-stats-row>div{min-width:calc(50% - 6px)!important}
          .orch-bottom-cols{grid-template-columns:1fr!important}
        }
        @media(max-width:600px){
          .orch-stats-row>div{min-width:100%!important}
          .orch-outcome-grid{grid-template-columns:repeat(2,1fr)!important}
          .orch-res-top{grid-template-columns:1fr!important}
        }
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      {/* Backgrounds */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:theme.bgGradient, pointerEvents:"none" }} />
      <SakuraPetals isDark={isDark} />
      <div style={{
        position:"fixed", inset:0, zIndex:1, pointerEvents:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity:isDark?.02:.012, mixBlendMode:"overlay",
      }} />

      <div style={{ position:"relative", zIndex:2 }}>
        <Nav isDark={isDark} toggleTheme={toggleTheme} theme={theme} />

        <div style={{ paddingTop:58, padding:"58px clamp(12px,3vw,44px) 60px" }}>

          {/* ── SECTION 1: COMMAND HEADER ── */}
          <CommandHeader theme={theme} missionConfig={missionConfig} isRunning={isRunning} isDone={isDone} />

          {/* ── 3-COL MAIN: Builder | 3D+Launch | Network ── */}
          <div className="orch-tri-col"
            style={{
              display:"grid",
              gridTemplateColumns:"1fr 0.72fr 1fr",
              gap:"clamp(12px,1.8vw,22px)",
              marginBottom:"clamp(14px,1.8vw,22px)",
              alignItems:"start",
            }}>

            {/* LEFT: Mission Builder */}
            <MissionBuilder
              theme={theme}
              missionConfig={missionConfig}
              onConfigChange={handleConfigChange}
              setActiveField={setActiveField}
            />

            {/* CENTER: 3D Core + Launch */}
            <div className="orch-launch-col">
              <OrchestrateLaunchPanel
                theme={theme}
                isDark={isDark}
                missionConfig={missionConfig}
                onLaunch={handleLaunch}
                isRunning={isRunning}
                isDone={isDone}
              />
            </div>

            {/* RIGHT: Agent Network */}
            <AgentNetworkPanel
              theme={theme}
              isDark={isDark}
              activeField={activeField}
              isRunning={isRunning}
              isDone={isDone}
              missionConfig={missionConfig}
            />
          </div>

          {/* ── BOTTOM: Execution Stream + Decision Engine ── */}
          <div className="orch-bottom-cols"
            style={{
              display:"grid",
              gridTemplateColumns:"1fr 1fr",
              gap:"clamp(12px,1.8vw,22px)",
              marginBottom:"clamp(14px,1.8vw,22px)",
              alignItems:"start",
            }}>

            {/* Execution Stream */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.5 }}
              style={{
                border:`1px solid ${theme.borderSubtle}`, borderRadius:14,
                background:theme.surface, backdropFilter:"blur(24px)", overflow:"hidden",
              }}>
              <div style={{
                padding:"18px 24px", borderBottom:`1px solid ${theme.borderSubtle}`,
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:16, height:1.5, background:theme.agentColors[3] }} />
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:theme.agentColors[3], letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:500 }}>
                    Agent Execution Stream
                  </span>
                </div>
                {(isRunning||isDone) && (
                  <motion.div animate={{ opacity:isRunning?[1,.2,1]:1 }} transition={{ duration:1.3,repeat:isRunning?Infinity:0 }}
                    style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:isRunning?theme.crimson:"#2EBFB0" }} />
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:7.5, color:isRunning?theme.crimson:"#2EBFB0", letterSpacing:"0.14em" }}>
                      {isRunning?"STREAMING":"COMPLETE"}
                    </span>
                  </motion.div>
                )}
              </div>
              <div style={{ padding:"20px 24px" }}>
                <ExecutionStream theme={theme} runningStep={runningStep} completedSteps={completedSteps} streamLines={streamLines} />
              </div>
            </motion.div>

            {/* Decision Engine */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.58 }}
              style={{
                border:`1px solid ${isDone?"#7C6FE844":theme.borderSubtle}`, borderRadius:14,
                background:theme.surface, backdropFilter:"blur(24px)", overflow:"hidden",
                transition:"border-color .5s",
              }}>
              <div style={{
                padding:"18px 24px", borderBottom:`1px solid ${theme.borderSubtle}`,
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:16, height:1.5, background:"#7C6FE8" }} />
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, color:"#7C6FE8", letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:500 }}>
                    Decision Engine
                  </span>
                </div>
                {isDone && <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:"#7C6FE8", letterSpacing:"0.1em" }}>3 recommendations</span>}
              </div>
              <div style={{ padding:"20px 24px" }}>
                <DecisionEngine theme={theme} isDone={isDone} missionConfig={missionConfig} />
              </div>
            </motion.div>
          </div>

          {/* ── SECTION 7: FINAL RESOLUTION ── */}
          <AnimatePresence>
            {isDone && (
              <div style={{ marginBottom:"clamp(14px,1.8vw,22px)" }}>
                <FinalResolution theme={theme} isDone={isDone} missionConfig={missionConfig} />
              </div>
            )}
          </AnimatePresence>

          {/* ── FOOTER ── */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.8 }}
            style={{ paddingTop:20, borderTop:`1px solid ${theme.borderSubtle}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 30 30" fill="none">
                <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none"/>
                <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity=".8"/>
              </svg>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, color:theme.textFaint, letterSpacing:"0.1em" }}>
                OrchestrAI © 2025 · Orchestration Engine v3.0.0
              </span>
            </div>
            <div style={{ display:"flex", gap:16 }}>
              {[["Agent Mesh","READY","#2EBFB0"],["Decision Engine","ONLINE","#7C6FE8"],["Signal Bus","STREAMING",theme.gold]].map(([l,v,c]) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:4, height:4, borderRadius:"50%", background:c }} />
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:8, color:theme.textFaint, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                    {l}: <span style={{ color:c }}>{v}</span>
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