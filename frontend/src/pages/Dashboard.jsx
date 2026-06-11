/**
 * OrchestrAI — Dashboard.jsx  v3.1  "Digital Twin"
 * Autonomous Multi-Agent Intelligence Platform
 *
 * Changes from v3.0:
 *   • Navbar unified with AgentsPage (same logo size, spacing, tab structure, toggle position)
 *   • Intelligence Core left panel filled with Core Telemetry stats strip — no empty whitespace
 *   • Grid proportions rebalanced for visual symmetry
 *   • All other sections, components, theme, routing preserved exactly
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
   THEME — identical tokens to v2/v3 (no drift)
═══════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg: "#030208",
    bgGradient: "linear-gradient(160deg,#030208 0%,#0A0618 50%,#030208 100%)",
    surface: "rgba(14,10,26,0.85)",
    surfaceSolid: "#0E0A1A",
    glass: "rgba(255,255,255,0.035)",
    border: "rgba(196,0,43,0.22)",
    borderSubtle: "rgba(240,235,225,0.08)",
    borderGold: "rgba(191,140,44,0.28)",
    text: "#F0EBE1",
    textMuted: "rgba(240,235,225,0.72)",
    textFaint: "rgba(240,235,225,0.42)",
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
    logLevelInfo: "rgba(240,235,225,0.62)",
    logLevelWarn: "#D4A84E",
    logLevelRec: "#A09DE8",
    isDark: true,
  },
  light: {
    bg: "#F0EBE1",
    bgGradient: "linear-gradient(160deg,#F0EBE1 0%,#EAE3D6 50%,#F0EBE1 100%)",
    surface: "rgba(228,221,209,0.92)",
    surfaceSolid: "#E4DDD1",
    glass: "rgba(10,7,22,0.055)",
    border: "rgba(184,0,38,0.22)",
    borderSubtle: "rgba(10,7,22,0.13)",
    borderGold: "rgba(140,96,12,0.32)",
    text: "#1A1028",
    textMuted: "#3D3250",
    textFaint: "#7A6E8A",
    crimson: "#A8001F",
    crimsonLight: "#C4002B",
    crimsonGlow: "rgba(168,0,31,0.14)",
    crimsonGlowSoft: "rgba(168,0,31,0.07)",
    gold: "#8C600C",
    goldGlow: "rgba(140,96,12,0.15)",
    goldLight: "#A87820",
    sakura: "#96304A",
    sakuraGlow: "rgba(150,48,74,0.1)",
    plum: "#EBE4D8",
    agentColors: ["#A8001F","#8C600C","#96304A","#3630A0","#077060"],
    logLevelInfo: "#3D3250",
    logLevelWarn: "#7A4800",
    logLevelRec: "#3630A0",
    isDark: false,
  },
};

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
function hex2rgb(hex) {
  if (!hex || hex[0] !== "#") return "128,128,128";
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function useCountUp(target, duration=1800, delay=0) {
  const [val,setVal] = useState(0);
  useEffect(()=>{
    let start;
    const timer = setTimeout(()=>{
      const step=(ts)=>{
        if(!start) start=ts;
        const progress=Math.min((ts-start)/duration,1);
        const eased=1-Math.pow(1-progress,3);
        setVal(Math.floor(eased*target));
        if(progress<1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },delay);
    return ()=>clearTimeout(timer);
  },[target,duration,delay]);
  return val;
}

function InjectFonts() {
  useEffect(()=>{
    const id="orch-fonts-v3";
    if(document.getElementById(id)) return;
    const l=document.createElement("link");
    l.id=id; l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap";
    document.head.appendChild(l);
  },[]);
  return null;
}

/* ═══════════════════════════════════════════════════════
   SAKURA PETAL RAIN (unchanged)
═══════════════════════════════════════════════════════ */
function SakuraPetals({isDark}) {
  const ref=useRef();
  const shouldReduce=useReducedMotion();
  useEffect(()=>{
    if(shouldReduce) return;
    const canvas=ref.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    let W,H,petals,raf;
    const init=()=>{
      W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight;
      petals=Array.from({length:18},()=>({
        x:Math.random()*W, y:Math.random()*H-H,
        size:Math.random()*5+3, speed:Math.random()*0.4+0.12,
        drift:Math.random()*0.5-0.25, wobble:Math.random()*Math.PI*2,
        wobbleSpeed:Math.random()*0.015+0.006,
        rotation:Math.random()*Math.PI*2, rotSpeed:Math.random()*0.018-0.009,
        opacity:Math.random()*0.3+0.07,
      }));
    };
    init();
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      const fill=isDark?`rgba(232,160,176,0.5)`:`rgba(150,48,74,0.18)`;
      for(const p of petals){
        ctx.save();
        ctx.translate(p.x+Math.sin(p.wobble)*15,p.y);
        ctx.rotate(p.rotation); ctx.globalAlpha=p.opacity; ctx.fillStyle=fill;
        ctx.beginPath();
        ctx.moveTo(0,-p.size);
        ctx.bezierCurveTo(p.size*0.8,-p.size*0.6,p.size*0.8,p.size*0.6,0,p.size);
        ctx.bezierCurveTo(-p.size*0.8,p.size*0.6,-p.size*0.8,-p.size*0.6,0,-p.size);
        ctx.fill(); ctx.restore();
        p.y+=p.speed; p.wobble+=p.wobbleSpeed; p.rotation+=p.rotSpeed;
        if(p.y>H+20){p.y=-20; p.x=Math.random()*W;}
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize",init);
    return ()=>{cancelAnimationFrame(raf); window.removeEventListener("resize",init);};
  },[isDark,shouldReduce]);
  if(shouldReduce) return null;
  return(
    <canvas ref={ref} aria-hidden="true" style={{
      position:"fixed",inset:0,width:"100%",height:"100%",
      pointerEvents:"none",zIndex:0,
    }}/>
  );
}

/* ═══════════════════════════════════════════════════════
   3D: INTELLIGENCE CORE (unchanged)
═══════════════════════════════════════════════════════ */
function IntelligenceCore() {
  const outerRef=useRef(); const midRef=useRef(); const innerRef=useRef();
  const ring1=useRef(); const ring2=useRef(); const ring3=useRef();
  useFrame(({clock})=>{
    const t=clock.getElapsedTime();
    if(outerRef.current){outerRef.current.rotation.y=t*0.07; outerRef.current.rotation.z=Math.sin(t*0.18)*0.05;}
    if(midRef.current){midRef.current.rotation.y=-t*0.12; midRef.current.rotation.x=t*0.065;}
    if(innerRef.current){
      innerRef.current.rotation.y=t*0.25; innerRef.current.rotation.z=-t*0.1;
      const pulse=1+Math.sin(t*2.4)*0.07;
      innerRef.current.scale.setScalar(pulse);
    }
    if(ring1.current){ring1.current.rotation.z=t*0.09;}
    if(ring2.current){ring2.current.rotation.x=t*0.07; ring2.current.rotation.z=-t*0.05;}
    if(ring3.current){ring3.current.rotation.y=t*0.11; ring3.current.rotation.x=-t*0.06;}
  });
  return(
    <group>
      <group ref={outerRef}>
        <mesh><icosahedronGeometry args={[1.15,1]}/>
          <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={0.18} metalness={0.9} roughness={0.06} transparent opacity={0.06} wireframe/>
        </mesh>
      </group>
      <group ref={midRef}>
        <mesh><dodecahedronGeometry args={[0.82,0]}/>
          <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={0.14} metalness={0.85} roughness={0.07} transparent opacity={0.09} wireframe/>
        </mesh>
      </group>
      <group ref={innerRef}>
        <mesh><octahedronGeometry args={[0.42,0]}/>
          <meshStandardMaterial color="#F0EBE1" emissive="#BF8C2C" emissiveIntensity={1.4} metalness={1.0} roughness={0.0}/>
        </mesh>
        <mesh><octahedronGeometry args={[0.28,0]}/>
          <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={1.8} metalness={0.9} roughness={0.0}/>
        </mesh>
      </group>
      <mesh ref={ring1} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[1.35,0.008,8,128]}/>
        <meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={0.6} transparent opacity={0.35}/>
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI/2+0.9,0.4,0]}>
        <torusGeometry args={[1.55,0.005,8,128]}/>
        <meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={0.5} transparent opacity={0.22}/>
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI/2-0.6,-0.5,0.2]}>
        <torusGeometry args={[1.72,0.004,8,128]}/>
        <meshStandardMaterial color="#E8A0B0" emissive="#E8A0B0" emissiveIntensity={0.4} transparent opacity={0.18}/>
      </mesh>
      <PulseShell/>
      <Sparkles count={80} scale={4.5} size={0.4} speed={0.2} color="#BF8C2C" opacity={0.5}/>
      <Sparkles count={50} scale={3.0} size={0.28} speed={0.3} color="#E8A0B0" opacity={0.4}/>
      <pointLight position={[4,3,3]} color="#C4002B" intensity={5} distance={10} decay={2}/>
      <pointLight position={[-4,-2,-3]} color="#BF8C2C" intensity={3.5} distance={10} decay={2}/>
      <pointLight position={[0,4,-4]} color="#E8A0B0" intensity={2.5} distance={10} decay={2}/>
      <ambientLight intensity={0.18} color="#1a0a2e"/>
    </group>
  );
}
function PulseShell() {
  const ref=useRef();
  useFrame(({clock})=>{
    const t=clock.getElapsedTime();
    const beat=Math.max(0,Math.sin(t*1.7));
    if(ref.current){ref.current.scale.setScalar(1+beat*0.55); ref.current.material.opacity=beat*0.12;}
  });
  return(<mesh ref={ref}><sphereGeometry args={[0.65,16,16]}/>
    <meshStandardMaterial color="#C4002B" transparent opacity={0} side={THREE.BackSide}/>
  </mesh>);
}
function CoreScene() {
  return(
    <Canvas camera={{position:[0,0.5,5.5],fov:38}} gl={{antialias:true,alpha:true}}
      style={{background:"transparent"}} dpr={[1,1.5]}>
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.22} floatIntensity={0.32}>
          <IntelligenceCore/>
        </Float>
      </Suspense>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════
   DIGITAL TWIN — OPERATIONAL MAP CENTERPIECE (unchanged)
═══════════════════════════════════════════════════════ */
const REGIONS = [
  { id:"R1", label:"North",    cx:300, cy:99, fill:"#C4002B", risk:0.28, load:0.82 },
  { id:"R2", label:"East",     cx:620, cy:200, fill:"#BF8C2C", risk:0.12, load:0.71 },
  { id:"R3", label:"South",    cx:480, cy:360, fill:"#2EBFB0", risk:0.08, load:0.94 },
  { id:"R4", label:"West",     cx:160, cy:300, fill:"#7C6FE8", risk:0.42, load:0.65 },
  { id:"R5", label:"Central",  cx:350, cy:246, fill:"#E8A0B0", risk:0.18, load:0.88 },
  { id:"R6", label:"NE",       cx:550, cy:90,  fill:"#BF8C2C", risk:0.06, load:0.60 },
  { id:"R7", label:"SW",       cx:170, cy:420, fill:"#7C6FE8", risk:0.33, load:0.77 },
];

const CENTERS = [
  { id:"C01", x:280, y:80,  region:"R1", cap:0.92, risk:true,  label:"Center 01", candidates:4200 },
  { id:"C02", x:340, y:140, region:"R1", cap:0.74, risk:false, label:"Center 02", candidates:3800 },
  { id:"C03", x:570, y:160, region:"R2", cap:0.68, risk:false, label:"Center 03", candidates:2900 },
  { id:"C04", x:600, y:210, region:"R2", cap:0.81, risk:false, label:"Center 04", candidates:3100 },
  { id:"C05", x:520, y:340, region:"R3", cap:0.96, risk:true,  label:"Center 05", candidates:5200 },
  { id:"C06", x:450, y:390, region:"R3", cap:0.88, risk:false, label:"Center 06", candidates:4800 },
  { id:"C07", x:110, y:260, region:"R4", cap:0.58, risk:true,  label:"Center 07", candidates:2100 },
  { id:"C08", x:155, y:330, region:"R4", cap:0.72, risk:false, label:"Center 08", candidates:3300 },
  { id:"C09", x:300, y:220, region:"R5", cap:0.91, risk:false, label:"Center 09", candidates:4600 },
  { id:"C10", x:360, y:280, region:"R5", cap:0.85, risk:false, label:"Center 10", candidates:4100 },
  { id:"C11", x:555, y:70,  region:"R6", cap:0.62, risk:false, label:"Center 11", candidates:2600 },
  { id:"C12", x:600, y:115, region:"R6", cap:0.55, risk:false, label:"Center 12", candidates:2400 },
  { id:"C13", x:150, y:400, region:"R7", cap:0.78, risk:false, label:"Center 13", candidates:3600 },
  { id:"C14", x:195, y:445, region:"R7", cap:0.70, risk:true,  label:"Center 14", candidates:3000 },
  { id:"C15", x:420, y:160, region:"R5", cap:0.83, risk:false, label:"Center 15", candidates:3900 },
  { id:"C16", x:240, y:180, region:"R1", cap:0.69, risk:false, label:"Center 16", candidates:3200 },
  { id:"C17", x:490, y:280, region:"R3", cap:0.95, risk:true,  label:"Center 17", candidates:5100 },
  { id:"C18", x:210, y:360, region:"R4", cap:0.65, risk:false, label:"Center 18", candidates:2800 },
];

const FLOWS = [
  ["C09","C01"], ["C09","C05"], ["C09","C07"], ["C09","C11"],
  ["C05","C06"], ["C01","C02"], ["C03","C04"],
  ["C07","C08"], ["C13","C14"], ["C15","C09"],
  ["C17","C05"], ["C10","C06"], ["C16","C01"],
];

const AGENT_ZONES = [
  { cx:300, cy:190, rx:160, ry:100, color:"#C4002B", label:"Allocation Zone", rotation:-8 },
  { cx:490, cy:260, rx:140, ry:110, color:"#BF8C2C", label:"Risk Zone",       rotation:12 },
  { cx:310, cy:360, rx:180, ry:90,  color:"#2EBFB0", label:"Ops Zone",        rotation:-5 },
];

function capacityColor(cap, isDark) {
  if (cap > 0.9) return isDark ? "#FF4444" : "#C4002B";
  if (cap > 0.75) return isDark ? "#D4A84E" : "#8C600C";
  return isDark ? "#2EBFB0" : "#077060";
}

function OperationalTwin({ theme }) {
  const [tooltip, setTooltip] = useState(null);
  const [tick, setTick] = useState(0);
  const [flowPackets, setFlowPackets] = useState([]);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (shouldReduce) return;
    const spawn = () => {
      const flow = FLOWS[Math.floor(Math.random() * FLOWS.length)];
      const from = CENTERS.find(c => c.id === flow[0]);
      const to   = CENTERS.find(c => c.id === flow[1]);
      if (!from || !to) return;
      const id = Date.now() + Math.random();
      setFlowPackets(p => [...p.slice(-20), { id, from, to, t: 0 }]);
    };
    const iv = setInterval(spawn, 450);
    return () => clearInterval(iv);
  }, [shouldReduce]);

  useEffect(() => {
    if (shouldReduce) return;
    let raf;
    const tick = () => {
      setFlowPackets(prev =>
        prev.map(p => ({ ...p, t: p.t + 0.016 })).filter(p => p.t < 1)
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldReduce]);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(iv);
  }, []);

  const pulseMult = (Math.sin(tick * 0.14) * 0.5 + 0.5);
  const isDark = theme.isDark;

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 10 }}>
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
        backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(${isDark?"240,235,225":"10,7,22"},0.012) 3px,rgba(${isDark?"240,235,225":"10,7,22"},0.012) 4px)`,
        borderRadius: 10,
      }} />

      {[
        { top:0,    left:0,    borderTop:"1.5px solid", borderLeft:"1.5px solid"  },
        { top:0,    right:0,   borderTop:"1.5px solid", borderRight:"1.5px solid" },
        { bottom:0, left:0,    borderBottom:"1.5px solid", borderLeft:"1.5px solid" },
        { bottom:0, right:0,   borderBottom:"1.5px solid", borderRight:"1.5px solid" },
      ].map((s,i) => (
        <div key={i} aria-hidden="true" style={{
          position:"absolute", width:18, height:18, zIndex:4,
          borderColor: theme.crimson, ...s,
        }}/>
      ))}

      <div style={{
        position:"absolute", top:0, left:0, right:0, zIndex:4,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"6px 16px",
        background: isDark ? "rgba(3,2,8,0.72)" : "rgba(240,235,225,0.82)",
        borderBottom:`1px solid ${theme.borderSubtle}`,
        backdropFilter:"blur(8px)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <motion.div animate={{opacity:[1,0.2,1]}} transition={{duration:1.4,repeat:Infinity}}
            style={{width:5,height:5,borderRadius:"50%",background:theme.crimson}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
            color:theme.crimson,letterSpacing:"0.2em",fontWeight:700}}>
            OPERATIONAL TWIN · LIVE FEED
          </span>
        </div>
        <div style={{display:"flex",gap:14}}>
          {[
            {label:"CENTERS", value:"18 / 18"},
            {label:"CAPACITY", value:"81.4%"},
            {label:"RISK NODES", value:"4"},
            {label:"FLOWS", value:"ACTIVE"},
          ].map(m=>(
            <div key={m.label} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                color:theme.text,fontWeight:700,letterSpacing:"0.05em"}}>{m.value}</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:6,
                color:theme.textFaint,letterSpacing:"0.12em"}}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 720 520" style={{ width:"100%", height:"auto", display:"block" }}
        aria-label="Operational twin map" role="img">
        <defs>
          <pattern id="twin-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none"
              stroke={isDark?"rgba(240,235,225,0.04)":"rgba(10,7,22,0.04)"} strokeWidth="0.5"/>
          </pattern>
          <pattern id="twin-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6"
              fill={isDark?"rgba(240,235,225,0.07)":"rgba(10,7,22,0.07)"}/>
          </pattern>
          {REGIONS.map(r=>(
            <radialGradient key={r.id} id={`rgr-${r.id}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={r.fill} stopOpacity={isDark?"0.10":"0.07"}/>
              <stop offset="100%" stopColor={r.fill} stopOpacity="0"/>
            </radialGradient>
          ))}
          {CENTERS.map(c=>(
            <radialGradient key={c.id} id={`cgr-${c.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={capacityColor(c.cap,isDark)} stopOpacity="0.5"/>
              <stop offset="100%" stopColor={capacityColor(c.cap,isDark)} stopOpacity="0"/>
            </radialGradient>
          ))}
          {AGENT_ZONES.map((z,i)=>(
            <radialGradient key={i} id={`azgr-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={z.color} stopOpacity={isDark?"0.10":"0.07"}/>
              <stop offset="100%" stopColor={z.color} stopOpacity="0"/>
            </radialGradient>
          ))}
          <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="risk-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="twin-clip">
            <rect x="0" y="0" width="720" height="520"/>
          </clipPath>
        </defs>

        <g clipPath="url(#twin-clip)">
          <rect width="720" height="520" fill={isDark ? "#030208" : "#F0EBE1"}/>
          <rect width="720" height="520" fill="url(#twin-grid)"/>
          <rect width="720" height="520" fill="url(#twin-dots)" opacity="0.6"/>

          {[120,240,360,480,600].map(x=>(
            <line key={x} x1={x} y1="0" x2={x} y2="520"
              stroke={isDark?"rgba(240,235,225,0.025)":"rgba(10,7,22,0.03)"}
              strokeWidth="0.5" strokeDasharray="4 8"/>
          ))}
          {[104,208,312,416].map(y=>(
            <line key={y} x1="0" y1={y} x2="720" y2={y}
              stroke={isDark?"rgba(240,235,225,0.025)":"rgba(10,7,22,0.03)"}
              strokeWidth="0.5" strokeDasharray="4 8"/>
          ))}

          {REGIONS.map(r=>(
            <ellipse key={r.id} cx={r.cx} cy={r.cy} rx={90} ry={70} fill={`url(#rgr-${r.id})`}/>
          ))}

          {AGENT_ZONES.map((z,i)=>(
            <g key={i} transform={`rotate(${z.rotation},${z.cx},${z.cy})`}>
              <ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} fill={`url(#azgr-${i})`}/>
              <ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} fill="none"
                stroke={z.color} strokeWidth="0.6" strokeDasharray="6 10"
                opacity={isDark?0.22:0.18}/>
            </g>
          ))}

          {FLOWS.map(([fid,tid],i)=>{
            const f=CENTERS.find(c=>c.id===fid);
            const t=CENTERS.find(c=>c.id===tid);
            if(!f||!t) return null;
            const mx=(f.x+t.x)/2; const my=(f.y+t.y)/2 - 20;
            const d=`M ${f.x} ${f.y} Q ${mx} ${my} ${t.x} ${t.y}`;
            return(
              <path key={i} d={d} fill="none"
                stroke={isDark?"rgba(191,140,44,0.18)":"rgba(140,96,12,0.15)"}
                strokeWidth="0.8" strokeDasharray="4 6">
                <animate attributeName="stroke-dashoffset"
                  from="0" to="-100" dur={`${3+i*0.3}s`} repeatCount="indefinite"/>
              </path>
            );
          })}

          {flowPackets.map(p=>{
            const mx=(p.from.x+p.to.x)/2; const my=(p.from.y+p.to.y)/2-20;
            const t=p.t;
            const x=(1-t)*(1-t)*p.from.x+2*(1-t)*t*mx+t*t*p.to.x;
            const y=(1-t)*(1-t)*p.from.y+2*(1-t)*t*my+t*t*p.to.y;
            return(
              <circle key={p.id} cx={x} cy={y} r={2.2}
                fill={isDark?"#BF8C2C":"#8C600C"}
                opacity={Math.sin(p.t*Math.PI)*0.9}
                filter="url(#glow-filter)"/>
            );
          })}

          {REGIONS.map(r=>(
            <g key={r.id}>
              <text x={r.cx} y={r.cy-38} textAnchor="middle"
                fontFamily="'Space Grotesk',sans-serif" fontSize="7" fontWeight="600"
                fill={r.fill} opacity={isDark?0.55:0.45} letterSpacing="0.2em">
                {r.label.toUpperCase()} REGION
              </text>
              <line x1={r.cx-16} y1={r.cy-32} x2={r.cx+16} y2={r.cy-32}
                stroke={r.fill} strokeWidth="0.5" opacity={isDark?0.3:0.22}/>
            </g>
          ))}

          {CENTERS.map(c=>{
            const col = capacityColor(c.cap, isDark);
            const r = 10;
            const circ = 2 * Math.PI * r;
            const dash = circ * c.cap;
            const gap  = circ * (1 - c.cap);
            return(
              <g key={c.id}
                onMouseEnter={(e)=>setTooltip({...c, col, ex:e.clientX, ey:e.clientY})}
                onMouseLeave={()=>setTooltip(null)}
                style={{cursor:"pointer"}}>
                {c.risk && (
                  <circle cx={c.x} cy={c.y} r={14 + pulseMult * 7}
                    fill={isDark?"rgba(196,0,43,0.10)":"rgba(168,0,31,0.08)"}
                    stroke={isDark?"rgba(196,0,43,0.35)":"rgba(168,0,31,0.30)"}
                    strokeWidth="0.7" filter="url(#risk-glow)"/>
                )}
                <circle cx={c.x} cy={c.y} r={16} fill={`url(#cgr-${c.id})`}/>
                <circle cx={c.x} cy={c.y} r={r} fill="none"
                  stroke={isDark?"rgba(255,255,255,0.07)":"rgba(10,7,22,0.08)"} strokeWidth="2.5"/>
                <circle cx={c.x} cy={c.y} r={r} fill="none"
                  stroke={col} strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={`${dash} ${gap}`}
                  transform={`rotate(-90 ${c.x} ${c.y})`} opacity={0.85}/>
                <circle cx={c.x} cy={c.y} r={3.5}
                  fill={col} opacity={0.9} filter="url(#glow-filter)"/>
                <text x={c.x} y={c.y+20} textAnchor="middle"
                  fontFamily="'Space Grotesk',sans-serif" fontSize="5.5" fontWeight="600"
                  fill={isDark?"rgba(240,235,225,0.45)":"rgba(10,7,22,0.40)"} letterSpacing="0.05em">
                  {c.id}
                </text>
              </g>
            );
          })}

          <g transform="translate(335,255)">
            <circle cx="0" cy="0" r="26" fill="none"
              stroke={isDark?"rgba(196,0,43,0.25)":"rgba(168,0,31,0.20)"}
              strokeWidth="0.8" strokeDasharray="3 5">
              <animateTransform attributeName="transform" type="rotate"
                from="0" to="360" dur="18s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="0" r="19" fill="none"
              stroke={isDark?"rgba(191,140,44,0.30)":"rgba(140,96,12,0.25)"}
              strokeWidth="0.8" strokeDasharray="2 4">
              <animateTransform attributeName="transform" type="rotate"
                from="360" to="0" dur="12s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="0" r="13"
              fill={isDark?"rgba(196,0,43,0.12)":"rgba(168,0,31,0.09)"}
              stroke={isDark?"#C4002B":"#A8001F"} strokeWidth="1.2"/>
            <circle cx="0" cy="0" r="6" fill={isDark?"#C4002B":"#A8001F"} filter="url(#glow-filter)">
              <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <text x="27" y="-32" textAnchor="middle" fontFamily="'Space Grotesk',sans-serif"
              fontSize="7" fontWeight="700" fill={isDark?"#C4002B":"#A8001F"} letterSpacing="0.18em">
              ORCHESTRATION CORE
            </text>
          </g>

          <g transform="translate(580,440)">
            <rect x="-8" y="-8" width="138" height="74" rx="4"
              fill={isDark?"rgba(3,2,8,0.72)":"rgba(240,235,225,0.82)"}
              stroke={isDark?"rgba(240,235,225,0.08)":"rgba(10,7,22,0.10)"} strokeWidth="0.5"/>
            <text x="0" y="8" fontFamily="'Space Grotesk',sans-serif" fontSize="7"
              fontWeight="700" fill={isDark?"rgba(240,235,225,0.55)":"rgba(10,7,22,0.45)"}
              letterSpacing="0.18em">LEGEND</text>
            {[
              {col:"#2EBFB0", label:"Low load  < 75%"},
              {col:"#BF8C2C", label:"Moderate  75–90%"},
              {col:"#C4002B", label:"Critical  > 90%"},
            ].map((item,i)=>(
              <g key={i} transform={`translate(0,${22+i*16})`}>
                <circle cx="5" cy="0" r="4" fill={item.col} opacity="0.85"/>
                <text x="16" y="4" fontFamily="'Space Grotesk',sans-serif" fontSize="7"
                  fill={isDark?"rgba(240,235,225,0.50)":"rgba(10,7,22,0.45)"}>{item.label}</text>
              </g>
            ))}
            <g transform="translate(0,74)">
              <circle cx="5" cy="0" r="5" fill="none"
                stroke={isDark?"#C4002B":"#A8001F"} strokeWidth="0.8"
                strokeDasharray="2 2" opacity="0.7"/>
              <text x="16" y="4" fontFamily="'Space Grotesk',sans-serif" fontSize="7"
                fill={isDark?"rgba(240,235,225,0.50)":"rgba(10,7,22,0.45)"}>Risk node</text>
            </g>
          </g>
        </g>
      </svg>

      <AnimatePresence>
        {tooltip && (
          <motion.div key={tooltip.id}
            initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}}
            exit={{opacity:0,scale:0.92}} transition={{duration:0.15}}
            style={{
              position:"fixed", top:tooltip.ey-120, left:tooltip.ex+14, zIndex:9999,
              padding:"12px 14px",
              background: theme.isDark?"rgba(14,10,26,0.97)":"rgba(228,221,209,0.97)",
              border:`1px solid ${tooltip.col}44`, borderRadius:8,
              backdropFilter:"blur(18px)", minWidth:160, pointerEvents:"none",
            }}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:tooltip.col}}/>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
                fontWeight:700,color:tooltip.col,letterSpacing:"0.12em"}}>{tooltip.label}</span>
              {tooltip.risk && (
                <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,
                  color:theme.crimson,background:`rgba(${hex2rgb(theme.crimson)},0.12)`,
                  border:`1px solid rgba(${hex2rgb(theme.crimson)},0.22)`,
                  padding:"1px 5px",borderRadius:3,fontWeight:700,letterSpacing:"0.1em"}}>RISK</span>
              )}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 14px"}}>
              {[
                {label:"Capacity",value:`${Math.round(tooltip.cap*100)}%`},
                {label:"Candidates",value:tooltip.candidates.toLocaleString()},
                {label:"Region",value:tooltip.region},
                {label:"Status",value:tooltip.risk?"FLAGGED":"NOMINAL"},
              ].map(s=>(
                <div key={s.label}>
                  <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:14,
                    fontWeight:700,color:theme.text,lineHeight:1}}>{s.value}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,
                    color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MISSION CONTROL HEADER (unchanged)
═══════════════════════════════════════════════════════ */
function MissionControlHeader({ theme, ops }) {
  const uptimeCount = useCountUp(9997, 1600, 400);
  const statusItems = [
    { label:"Agent Network",  value:"5 / 5",            col:theme.isDark?"#2EBFB0":"#077060", pulse:true  },
    { label:"Active Ops",     value:"12",               col:theme.gold,   pulse:false },
    { label:"System Health",  value:`${(uptimeCount/100).toFixed(2)}%`, col:theme.isDark?"#2EBFB0":"#077060", pulse:false },
    { label:"Confidence",     value:"96%",              col:theme.sakura, pulse:false },
    { label:"Ops / sec",      value:ops.toLocaleString(),col:theme.agentColors[3], pulse:true  },
    { label:"Risk Exposure",  value:"MODERATE",         col:theme.gold,   pulse:false },
  ];

  return (
    <motion.section initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      transition={{duration:0.65}} aria-label="Command status header"
      style={{marginBottom:"clamp(14px,1.8vw,22px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{width:22,height:1.5,background:theme.crimson,borderRadius:1}}/>
        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
          letterSpacing:"0.24em",color:theme.crimson,textTransform:"uppercase",fontWeight:600}}>
          Mission Control · OrchestrAI Intelligence Platform
        </span>
      </div>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
        flexWrap:"wrap",gap:16,marginBottom:20}}>
        <div>
          <h1 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(30px,4vw,56px)",
            fontWeight:400,lineHeight:1.0,color:theme.text,margin:"0 0 8px"}}>
            Mission Control
          </h1>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:theme.textMuted,
            fontWeight:400,margin:0,lineHeight:1.5}}>
            Autonomous intelligence operating across all domains ·{" "}
            {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
          border:`1px solid rgba(46,191,176,${theme.isDark?0.3:0.4})`,borderRadius:8,
          background:`rgba(46,191,176,${theme.isDark?0.06:0.05})`,
          backdropFilter:"blur(12px)",flexShrink:0}}>
          <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1.6,repeat:Infinity}}
            style={{width:7,height:7,borderRadius:"50%",background:"#2EBFB0"}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
            color:theme.isDark?"#2EBFB0":"#077060",letterSpacing:"0.14em",
            textTransform:"uppercase",fontWeight:700}}>All systems operational</span>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
        gap:1,border:`1px solid ${theme.borderSubtle}`,borderRadius:8,overflow:"hidden",
        background:theme.isDark?"rgba(3,2,8,0.5)":"rgba(240,235,225,0.5)",
        backdropFilter:"blur(18px)"}}>
        {statusItems.map((s,i)=>(
          <div key={s.label} style={{padding:"14px 16px",
            borderRight:i<statusItems.length-1?`1px solid ${theme.borderSubtle}`:"none",
            position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1.5,
              background:`linear-gradient(90deg,transparent,${s.col},transparent)`,opacity:0.6}}/>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              {s.pulse && (
                <motion.div animate={{opacity:[1,0.2,1]}} transition={{duration:1.4,repeat:Infinity}}
                  style={{width:4,height:4,borderRadius:"50%",background:s.col,flexShrink:0}}/>
              )}
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                color:theme.textFaint,letterSpacing:"0.14em",textTransform:"uppercase"}}>{s.label}</span>
            </div>
            <div style={{fontFamily:"'Cormorant Garant',serif",
              fontSize:"clamp(18px,2vw,26px)",fontWeight:700,color:s.col,lineHeight:1,letterSpacing:"-0.01em"}}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════
   MISSION TIMELINE (unchanged)
═══════════════════════════════════════════════════════ */
const TIMELINE_EVENTS = [
  { t:"T+00:00", agent:"Risk",      color:"#BF8C2C", icon:"⬡", event:"Anomaly Detected",        detail:"Center 7 capacity threshold exceeded",       type:"RISK"    },
  { t:"T+00:04", agent:"Allocation",color:"#C4002B", icon:"◈", event:"Reallocation Triggered",   detail:"3 backup centers identified · mesh updated",  type:"ACTION"  },
  { t:"T+00:06", agent:"Operations",color:"#E8A0B0", icon:"⟁", event:"Routes Reserved",          detail:"Transport paths locked for relocation",        type:"ACTION"  },
  { t:"T+00:09", agent:"Comm",      color:"#2EBFB0", icon:"◫", event:"Notifications Dispatched", detail:"2,300 candidates alerted via SMS + app",       type:"INFO"    },
  { t:"T+00:14", agent:"Intelligence",color:"#7C6FE8",icon:"◬",event:"Strategy Confirmed",       detail:"97% confidence · Execute Protocol Delta",      type:"DECISION"},
  { t:"T+00:18", agent:"Risk",      color:"#BF8C2C", icon:"⬡", event:"Risk Resolved",            detail:"Center 7 offline · B12 activated · stable",    type:"RESOLVED"},
];

function MissionTimeline({ theme }) {
  const [visible, setVisible] = useState(2);

  useEffect(() => {
    if (visible >= TIMELINE_EVENTS.length) return;
    const iv = setInterval(() => {
      setVisible(v => Math.min(v + 1, TIMELINE_EVENTS.length));
    }, 1400);
    return () => clearInterval(iv);
  }, [visible]);

  const typeColor = {
    RISK:     theme.crimson,
    ACTION:   theme.gold,
    INFO:     theme.sakura,
    DECISION: theme.agentColors[3],
    RESOLVED: theme.isDark?"#2EBFB0":"#077060",
  };

  return (
    <div style={{position:"relative"}}>
      <div style={{position:"absolute",left:14,top:0,bottom:0,width:1,
        background:`linear-gradient(to bottom,${theme.crimson},${theme.isDark?"rgba(240,235,225,0.05)":"rgba(10,7,22,0.06)"})`,
        zIndex:0}}/>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>
        {TIMELINE_EVENTS.map((ev,i)=>{
          const isVisible = i < visible;
          const tcol = typeColor[ev.type] || theme.textMuted;
          return(
            <AnimatePresence key={i}>
              {isVisible && (
                <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}}
                  transition={{duration:0.4,ease:"easeOut"}}
                  style={{display:"flex",alignItems:"flex-start",gap:12,
                    paddingLeft:0,paddingBottom:14,position:"relative"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                    background:`rgba(${hex2rgb(ev.color)},${theme.isDark?0.15:0.12})`,
                    border:`1.5px solid ${ev.color}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:12,color:ev.color,zIndex:1,position:"relative",
                    boxShadow:`0 0 12px rgba(${hex2rgb(ev.color)},0.3)`}}>
                    {ev.icon}
                  </div>
                  <div style={{flex:1,paddingTop:4}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                        color:tcol,letterSpacing:"0.12em",textTransform:"uppercase",
                        background:`rgba(${hex2rgb(ev.color)},${theme.isDark?0.12:0.09})`,
                        border:`1px solid rgba(${hex2rgb(ev.color)},0.18)`,
                        padding:"1px 6px",borderRadius:3,fontWeight:700}}>{ev.type}</span>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                        color:theme.textFaint,letterSpacing:"0.06em",fontVariantNumeric:"tabular-nums"}}>
                        {ev.t}
                      </span>
                    </div>
                    <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:15,
                      fontWeight:500,color:theme.text,marginBottom:2,lineHeight:1.2}}>{ev.event}</div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,
                      color:theme.textMuted,fontWeight:300,lineHeight:1.5}}>{ev.detail}</div>
                  </div>
                  <div style={{flexShrink:0,paddingTop:4}}>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,
                      color:ev.color,letterSpacing:"0.1em",textTransform:"uppercase"}}>{ev.agent}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
      {visible >= TIMELINE_EVENTS.length && (
        <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={()=>setVisible(2)}
          style={{marginTop:8,padding:"8px 18px",background:"transparent",
            border:`1px solid ${theme.borderSubtle}`,borderRadius:5,color:theme.textMuted,
            fontFamily:"'Space Grotesk',sans-serif",fontSize:8,letterSpacing:"0.14em",
            textTransform:"uppercase",cursor:"pointer"}}>↺ Replay</motion.button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   OPERATIONAL HEALTH LAYER (unchanged)
═══════════════════════════════════════════════════════ */
const HEALTH_METRICS = [
  { label:"Center Utilization", value:81, color:"#C4002B",  sub:"18 centers online" },
  { label:"Capacity Load",      value:88, color:"#BF8C2C",  sub:"4 near-critical"   },
  { label:"Resource Readiness", value:96, color:"#2EBFB0",  sub:"Proctors staged"   },
  { label:"Comm Status",        value:99, color:"#7C6FE8",  sub:"All channels live" },
  { label:"Risk Exposure",      value:42, color:"#E8A0B0",  sub:"3 open incidents"  },
];

function HealthRingFull({ value, color, size=72, strokeWidth=6, label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}
          role="img" aria-label={`${label}: ${value}%`}>
          <title>{label}: {value}%</title>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="rgba(128,128,128,0.12)" strokeWidth={strokeWidth}/>
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{strokeDashoffset:circ}} animate={{strokeDashoffset:offset}}
            transition={{duration:1.4,delay:0.5,ease:"easeOut"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,fontWeight:700,color:color}}>
            {value}%
          </span>
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:"inherit",
          letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1.3}}>{label}</div>
      </div>
    </div>
  );
}

function OperationalHealthLayer({ theme }) {
  return(
    <div>
      <div style={{position:"relative",display:"flex",alignItems:"center",
        justifyContent:"space-around",flexWrap:"wrap",gap:8,padding:"20px 12px",
        border:`1px solid ${theme.borderSubtle}`,borderRadius:10,
        background:theme.glass,backdropFilter:"blur(18px)",marginBottom:16}}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",
          pointerEvents:"none",overflow:"visible"}} aria-hidden="true">
          {HEALTH_METRICS.slice(0,-1).map((_,i)=>(
            <line key={i} x1={`${(i+1)*20 - 8}%`} y1="50%" x2={`${(i+2)*20 - 12}%`} y2="50%"
              stroke={theme.borderSubtle} strokeWidth="1" strokeDasharray="3 5"/>
          ))}
        </svg>
        {HEALTH_METRICS.map((m)=>(
          <div key={m.label} style={{color:theme.textMuted,zIndex:1}}>
            <HealthRingFull value={m.value} color={m.color} label={m.label} size={70} strokeWidth={5}/>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
              color:theme.textFaint,textAlign:"center",marginTop:4,letterSpacing:"0.04em"}}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 16px",border:`1px solid ${theme.borderSubtle}`,
        borderRadius:8,background:theme.glass}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
            color:theme.textMuted,letterSpacing:"0.1em"}}>SYSTEM THROUGHPUT</span>
          <motion.span animate={{opacity:[0.5,1,0.5]}} transition={{duration:2,repeat:Infinity}}
            style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
              color:theme.isDark?"#2EBFB0":"#077060",fontWeight:700}}>STREAMING</motion.span>
        </div>
        <div style={{height:3,background:theme.isDark?"rgba(255,255,255,0.06)":"rgba(10,7,22,0.08)",
          borderRadius:2,overflow:"hidden"}}>
          <motion.div animate={{width:["70%","95%","80%","92%","75%"]}}
            transition={{duration:6,repeat:Infinity,ease:"easeInOut"}}
            style={{height:"100%",
              background:`linear-gradient(90deg,${theme.crimson},${theme.gold},${theme.isDark?"#2EBFB0":"#077060"})`,
              borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SITUATIONAL AWARENESS PANEL (unchanged)
═══════════════════════════════════════════════════════ */
const RISKS = [
  { level:"CRITICAL", agent:"Risk",    color:"#C4002B", msg:"Center 7 power grid instability · failover required",   time:"2m ago"  },
  { level:"WARNING",  agent:"Risk",    color:"#BF8C2C", msg:"NH-48 congestion · 74% probability of gridlock in 90m", time:"4m ago"  },
  { level:"INFO",     agent:"Comm",    color:"#7C6FE8", msg:"Notification batch delayed · retrying 3rd segment",     time:"7m ago"  },
];
const RECOMMENDATIONS = [
  { agent:"Intelligence", color:"#7C6FE8", rec:"Execute Protocol Delta — relocate cohort A→B12", confidence:97 },
  { agent:"Allocation",   color:"#C4002B", rec:"Rebalance 147 proctors across 8 underutilized centers", confidence:94 },
  { agent:"Risk",         color:"#BF8C2C", rec:"Pre-deploy emergency transport on Ring Road East", confidence:89 },
];

function SituationalAwareness({ theme }) {
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <motion.div animate={{opacity:[1,0.2,1]}} transition={{duration:1.2,repeat:Infinity}}
            style={{width:5,height:5,borderRadius:"50%",background:theme.crimson}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
            color:theme.crimson,letterSpacing:"0.18em",fontWeight:700}}>ACTIVE RISKS</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {RISKS.map((r,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
              transition={{delay:i*0.12}}
              style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 12px",borderRadius:6,
                background:`rgba(${hex2rgb(r.color)},${theme.isDark?0.06:0.05})`,
                border:`1px solid rgba(${hex2rgb(r.color)},0.18)`}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,fontWeight:700,
                color:r.color,letterSpacing:"0.1em",
                background:`rgba(${hex2rgb(r.color)},${theme.isDark?0.14:0.10})`,
                padding:"2px 5px",borderRadius:3,flexShrink:0,marginTop:1}}>{r.level}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:theme.textMuted,
                  fontWeight:300,margin:0,lineHeight:1.4}}>{r.msg}</p>
              </div>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                color:theme.textFaint,flexShrink:0}}>{r.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:theme.agentColors[3]}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
            color:theme.agentColors[3],letterSpacing:"0.18em",fontWeight:700}}>AGENT RECOMMENDATIONS</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {RECOMMENDATIONS.map((r,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
              transition={{delay:0.3+i*0.1}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:6,
                border:`1px solid ${theme.borderSubtle}`,background:theme.glass}}>
              <div style={{flexShrink:0}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,
                  color:r.color,fontWeight:700,letterSpacing:"0.08em"}}>{r.agent}</div>
              </div>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:theme.textMuted,
                fontWeight:300,margin:0,lineHeight:1.4,flex:1}}>{r.rec}</p>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:16,
                  fontWeight:700,color:r.color,lineHeight:1}}>{r.confidence}%</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,
                  color:theme.textFaint,letterSpacing:"0.06em"}}>conf.</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AGENT NETWORK SVG (unchanged)
═══════════════════════════════════════════════════════ */
const AGENTS = [
  { id:"allocation",   label:"Allocation",   color:"#C4002B", icon:"◈", x:50, y:12,
    role:"Resource Allocation",  status:"ACTIVE",     confidence:94, action:"Remapping 3 centers to backup nodes" },
  { id:"risk",         label:"Risk",         color:"#BF8C2C", icon:"⬡", x:88, y:42,
    role:"Threat Intelligence",  status:"ALERT",      confidence:97, action:"Detected weather anomaly · 2hr window" },
  { id:"operations",   label:"Operations",   color:"#E8A0B0", icon:"⟁", x:72, y:82,
    role:"Orchestration",        status:"ACTIVE",     confidence:91, action:"Sequencing 48 dependent tasks" },
  { id:"intelligence", label:"Intelligence", color:"#7C6FE8", icon:"◬", x:28, y:82,
    role:"Decision Engine",      status:"PROCESSING", confidence:99, action:"Generating optimal strategy" },
  { id:"communication",label:"Comm",         color:"#2EBFB0", icon:"◫", x:12, y:42,
    role:"Stakeholder Comms",    status:"READY",      confidence:88, action:"12,400 alerts queued for dispatch" },
];
const CONNECTIONS=[[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[1,3],[2,4],[3,0],[4,1]];

function AgentNetwork({ theme, onAgentSelect, selectedAgent }) {
  const [packets,setPackets]=useState([]);
  useEffect(()=>{
    const spawnPacket=()=>{
      const conn=CONNECTIONS[Math.floor(Math.random()*CONNECTIONS.length)];
      const id=Date.now()+Math.random();
      setPackets(p=>[...p.slice(-12),{id,from:conn[0],to:conn[1],progress:0,color:AGENTS[conn[0]].color}]);
    };
    const iv=setInterval(spawnPacket,600);
    return ()=>clearInterval(iv);
  },[]);
  useEffect(()=>{
    let raf;
    const tick=()=>{
      setPackets(prev=>prev.map(p=>({...p,progress:p.progress+0.012})).filter(p=>p.progress<1));
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[]);
  const lerp=(a,b,t)=>a+(b-a)*t;
  return(
    <div role="list" aria-label="Agent network" style={{position:"relative",width:"100%",height:"100%"}}>
      <svg viewBox="0 0 100 100" style={{width:"100%",height:"100%",overflow:"visible"}}>
        <defs>
          {AGENTS.map(a=>(
            <radialGradient key={a.id} id={`glow-${a.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={a.color} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={a.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>
        {CONNECTIONS.map(([fi,ti],ci)=>{
          const f=AGENTS[fi]; const t=AGENTS[ti];
          return(<line key={ci} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
            stroke={theme.borderSubtle} strokeWidth="0.35" strokeDasharray="1.2 2.4"/>);
        })}
        {packets.map(p=>{
          const from=AGENTS[p.from]; const to=AGENTS[p.to];
          return(<circle key={p.id}
            cx={lerp(from.x,to.x,p.progress)} cy={lerp(from.y,to.y,p.progress)}
            r="0.8" fill={p.color} opacity={Math.sin(p.progress*Math.PI)}/>);
        })}
        {AGENTS.map((agent)=>{
          const isSelected=selectedAgent?.id===agent.id;
          return(
            <g key={agent.id} role="listitem"
              onClick={()=>onAgentSelect(isSelected?null:agent)}
              onKeyDown={(e)=>e.key==="Enter"&&onAgentSelect(isSelected?null:agent)}
              tabIndex={0} aria-label={`${agent.label} agent — ${agent.status}`}
              style={{cursor:"pointer",outline:"none"}}>
              <rect x={agent.x-6} y={agent.y-6} width={12} height={12} fill="transparent"/>
              <circle cx={agent.x} cy={agent.y} r={isSelected?7:5}
                fill={`url(#glow-${agent.id})`} opacity={isSelected?1:0.55}>
                <animate attributeName="r" values={isSelected?"6;8;6":"4.5;5.5;4.5"}
                  dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx={agent.x} cy={agent.y} r={isSelected?4.2:3.4}
                fill={`rgba(${hex2rgb(agent.color)},${isSelected?0.22:0.12})`}
                stroke={agent.color} strokeWidth={isSelected?0.9:0.6}/>
              <text x={agent.x} y={agent.y+1.2} textAnchor="middle" dominantBaseline="middle"
                fontSize="4" fill={agent.color}
                style={{fontFamily:"monospace",pointerEvents:"none"}}>{agent.icon}</text>
              <text x={agent.x} y={agent.y+(agent.y>50?8.5:-6.2)}
                textAnchor="middle" fontSize="3"
                fill={theme.isDark?"rgba(240,235,225,0.72)":"#3D3250"} fontWeight="500"
                style={{fontFamily:"'Space Grotesk',sans-serif",pointerEvents:"none"}}>
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
   LIVE ACTIVITY LOG (unchanged)
═══════════════════════════════════════════════════════ */
const INITIAL_LOGS=[
  {id:1,agent:"Risk",color:"#BF8C2C",icon:"⬡",msg:"Detected congestion anomaly at Zone 7 · 3 routes flagged",time:"00:04",level:"WARN"},
  {id:2,agent:"Allocation",color:"#C4002B",icon:"◈",msg:"Generated 3 alternative center configurations",time:"00:05",level:"INFO"},
  {id:3,agent:"Operations",color:"#E8A0B0",icon:"⟁",msg:"Validated backup center · capacity 2,300 · CONFIRMED",time:"00:06",level:"INFO"},
  {id:4,agent:"Communication",color:"#2EBFB0",icon:"◫",msg:"Prepared candidate notification batch · 2,300 recipients",time:"00:07",level:"INFO"},
  {id:5,agent:"Intelligence",color:"#7C6FE8",icon:"◬",msg:"Strategy: Relocate cohort A → Center B12. Confidence 97%",time:"00:08",level:"REC"},
  {id:6,agent:"Risk",color:"#BF8C2C",icon:"⬡",msg:"Weather window tightening · executing within 90 minutes",time:"00:09",level:"WARN"},
];
const LOG_POOL=[
  {agent:"Allocation",color:"#C4002B",icon:"◈",msg:"Reallocated 847 proctors across 12 centers",level:"INFO"},
  {agent:"Risk",color:"#BF8C2C",icon:"⬡",msg:"Bottleneck probability at NH-48 now 74% · rerouting",level:"WARN"},
  {agent:"Intelligence",color:"#7C6FE8",icon:"◬",msg:"Pattern match: 2019 incident · invoking Protocol Delta",level:"REC"},
  {agent:"Operations",color:"#E8A0B0",icon:"⟁",msg:"Dependency chain resolved · 48 tasks sequenced",level:"INFO"},
  {agent:"Communication",color:"#2EBFB0",icon:"◫",msg:"SMS batch dispatched · 99.2% delivery rate",level:"INFO"},
  {agent:"Risk",color:"#BF8C2C",icon:"⬡",msg:"Center 14 power grid anomaly · flagging operations",level:"WARN"},
  {agent:"Allocation",color:"#C4002B",icon:"◈",msg:"Optimal center mesh recalculated · 99.4% utilization",level:"INFO"},
  {agent:"Intelligence",color:"#7C6FE8",icon:"◬",msg:"Decision confidence elevated to 99.1% on new data",level:"REC"},
];

function LiveActivityLog({theme}) {
  const [logs,setLogs]=useState(INITIAL_LOGS);
  const scrollRef=useRef();
  useEffect(()=>{
    let poolIdx=0;
    const iv=setInterval(()=>{
      const entry=LOG_POOL[poolIdx%LOG_POOL.length];
      const now=new Date();
      const time=`${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      setLogs(prev=>[...prev.slice(-20),{...entry,id:Date.now(),time}]);
      poolIdx++;
    },2800);
    return ()=>clearInterval(iv);
  },[]);
  useEffect(()=>{if(scrollRef.current) scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[logs]);
  const levelColor={WARN:theme.logLevelWarn,INFO:theme.logLevelInfo,REC:theme.logLevelRec};
  return(
    <div style={{position:"relative"}}>
      <div ref={scrollRef} role="log" aria-live="polite" aria-label="Agent activity log"
        style={{height:260,overflowY:"auto",display:"flex",flexDirection:"column",
          gap:2,scrollBehavior:"smooth",paddingRight:4}}>
        {logs.map((log,i)=>{
          const isLatest=i===logs.length-1;
          return(
            <motion.div key={log.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
              transition={{duration:0.28}}
              style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 12px",
                borderRadius:6,
                background:isLatest?`rgba(${hex2rgb(log.color)},${theme.isDark?0.07:0.06})`:"transparent",
                borderLeft:isLatest?`2px solid ${log.color}`:"2px solid transparent",
                transition:"background 0.3s"}}>
              <span style={{fontSize:11,color:log.color,flexShrink:0,lineHeight:"18px"}}>{log.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,fontWeight:700,
                    color:log.color,letterSpacing:"0.1em",textTransform:"uppercase",flexShrink:0}}>{log.agent}</span>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                    color:levelColor[log.level]||theme.textFaint,letterSpacing:"0.08em",textTransform:"uppercase",
                    background:`rgba(${hex2rgb(log.color)},${theme.isDark?0.1:0.08})`,
                    padding:"1px 5px",borderRadius:3,flexShrink:0,
                    border:`1px solid rgba(${hex2rgb(log.color)},0.18)`}}>{log.level}</span>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                    color:theme.textFaint,marginLeft:"auto",flexShrink:0,fontVariantNumeric:"tabular-nums"}}>{log.time}</span>
                </div>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:11.5,color:theme.textMuted,
                  fontWeight:300,lineHeight:1.5,margin:0}}>{log.msg}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:28,pointerEvents:"none",
        background:`linear-gradient(to bottom,transparent,${theme.surfaceSolid})`}}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MISSION CARDS (unchanged)
═══════════════════════════════════════════════════════ */
const MISSIONS=[
  {code:"OP-001",name:"NEET 2027",status:"LIVE",health:99,confidence:96,
   progress:68,candidates:"2.3M",centers:4820,color:"#C4002B",alerts:3,eta:"14d 6h"},
  {code:"OP-002",name:"CUET Operations",status:"STAGING",health:87,confidence:91,
   progress:34,candidates:"890K",centers:1920,color:"#BF8C2C",alerts:7,eta:"31d 12h"},
  {code:"OP-003",name:"State Recruitment Drive",status:"PLANNING",health:100,confidence:84,
   progress:12,candidates:"340K",centers:680,color:"#2EBFB0",alerts:0,eta:"68d 0h"},
];

function MissionCard({mission,theme,delay=0}) {
  const [hov,setHov]=useState(false);
  const statusColor={LIVE:theme.crimson,STAGING:theme.gold,PLANNING:"#2EBFB0"};
  const col=statusColor[mission.status]||theme.textMuted;
  const progressColor=mission.status==="LIVE"?theme.crimson:mission.status==="STAGING"?theme.gold:"#2EBFB0";
  return(
    <motion.article initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
      transition={{duration:0.5,delay}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      aria-label={`Mission ${mission.name} — ${mission.status}`}
      style={{padding:"20px 22px",
        border:`1px solid ${hov?mission.color+"44":theme.borderSubtle}`,borderRadius:10,
        background:hov?`rgba(${hex2rgb(mission.color)},${theme.isDark?0.05:0.04})`:theme.glass,
        backdropFilter:"blur(18px)",cursor:"default",position:"relative",overflow:"hidden",
        transition:"border-color 0.3s,background 0.3s"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,
        background:`linear-gradient(90deg,transparent 0%,${mission.color} 50%,transparent 100%)`,
        opacity:hov?1:0.45,transition:"opacity 0.3s"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
            <motion.div animate={{opacity:mission.status==="LIVE"?[1,0.2,1]:0.7}}
              transition={{duration:1.5,repeat:Infinity}}
              style={{width:6,height:6,borderRadius:"50%",background:col,flexShrink:0}}/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:col,
              letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700}}>{mission.status}</span>
            {mission.alerts>0&&(
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                color:theme.isDark?"#FF6B6B":"#A8001F",
                background:`rgba(${hex2rgb(theme.crimson)},${theme.isDark?0.14:0.1})`,
                border:`1px solid rgba(${hex2rgb(theme.crimson)},0.22)`,
                padding:"1px 6px",borderRadius:3,letterSpacing:"0.06em",fontWeight:600}}>
                {mission.alerts} alerts
              </span>
            )}
          </div>
          <h3 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(18px,2vw,22px)",
            fontWeight:600,color:theme.text,margin:"0 0 2px",lineHeight:1.1}}>{mission.name}</h3>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
            color:theme.textFaint,letterSpacing:"0.12em"}}>{mission.code}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
          <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:30,fontWeight:700,
            color:mission.health>95?(theme.isDark?"#2EBFB0":"#077060"):theme.text,lineHeight:1}}>
            {mission.health}%</div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
            color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>Health</div>
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
            color:theme.textMuted,letterSpacing:"0.08em"}}>Completion</span>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
            color:progressColor,fontWeight:700}}>{mission.progress}%</span>
        </div>
        <div style={{height:4,background:theme.isDark?"rgba(255,255,255,0.08)":"rgba(10,7,22,0.1)",
          borderRadius:2,overflow:"hidden"}}>
          <motion.div initial={{width:0}} animate={{width:`${mission.progress}%`}}
            transition={{duration:1.2,delay:delay+0.3,ease:"easeOut"}}
            style={{height:"100%",
              background:`linear-gradient(90deg,${progressColor},${progressColor}88)`,borderRadius:2}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:0,borderTop:`1px solid ${theme.borderSubtle}`,paddingTop:12}}>
        {[
          {label:"Candidates",value:mission.candidates},
          {label:"Centers",value:mission.centers.toLocaleString()},
          {label:"ETA",value:mission.eta},
          {label:"Confidence",value:`${mission.confidence}%`},
        ].map((s,idx)=>(
          <div key={s.label} style={{flex:1,
            paddingLeft:idx>0?12:0,
            borderLeft:idx>0?`1px solid ${theme.borderSubtle}`:"none",
            marginLeft:idx>0?12:0}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,
              fontWeight:600,color:theme.text,lineHeight:1,marginBottom:3}}>{s.value}</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
              color:theme.textFaint,letterSpacing:"0.08em",textTransform:"uppercase"}}>{s.label}</div>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════
   AI INSIGHTS PANEL (unchanged)
═══════════════════════════════════════════════════════ */
const INSIGHTS=[
  {type:"RECOMMENDED ACTION",typeColor:"#7C6FE8",
   title:"Relocate 2,300 candidates to Center B12",
   detail:"Center 7's infrastructure risk exceeds threshold. B12 has 96% capacity alignment. Relocation window: 2.4 hours.",
   riskReduction:38,confidence:97,agent:"Intelligence"},
  {type:"RISK FORECAST",typeColor:"#BF8C2C",
   title:"NH-48 congestion escalation in 90 minutes",
   detail:"Traffic density models predict gridlock affecting 6 exam routes. Recommend pre-emptive rerouting via Ring Road East.",
   riskReduction:54,confidence:89,agent:"Risk"},
  {type:"OPTIMIZATION",typeColor:"#2EBFB0",
   title:"Proctor rebalance can lift utilization to 99.4%",
   detail:"Current allocation leaves 147 proctors underutilized across 8 centers. Proposed mesh increases coverage with no added cost.",
   riskReduction:22,confidence:94,agent:"Allocation"},
];
function insightTypeColorForTheme(typeColor,isDark) {
  if(isDark) return typeColor;
  const map={"#7C6FE8":"#3630A0","#BF8C2C":"#8C600C","#2EBFB0":"#077060"};
  return map[typeColor]||typeColor;
}

function InsightCard({insight,theme,isActive,onClick,delay=0}) {
  const tc=insightTypeColorForTheme(insight.typeColor,theme.isDark);
  return(
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
      transition={{duration:0.45,delay}} onClick={onClick}
      onKeyDown={(e)=>e.key==="Enter"&&onClick()}
      tabIndex={0} role="button" aria-expanded={isActive}
      aria-label={`Insight: ${insight.title}`}
      style={{padding:"16px 18px",
        border:`1px solid ${isActive?tc+"44":theme.borderSubtle}`,borderRadius:8,
        background:isActive?`rgba(${hex2rgb(insight.typeColor)},${theme.isDark?0.07:0.05})`:theme.glass,
        cursor:"pointer",position:"relative",overflow:"hidden",
        transition:"all 0.3s",backdropFilter:"blur(12px)",outline:"none"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:2.5,
        background:isActive?tc:"transparent",transition:"background 0.3s"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:tc,
          letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,
          background:`rgba(${hex2rgb(insight.typeColor)},${theme.isDark?0.12:0.09})`,
          border:`1px solid rgba(${hex2rgb(insight.typeColor)},0.2)`,
          padding:"2px 7px",borderRadius:3}}>{insight.type}</span>
        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
          color:tc,fontWeight:700,flexShrink:0}}>↑{insight.confidence}%</span>
      </div>
      <h4 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(15px,1.4vw,17px)",
        fontWeight:500,color:theme.text,margin:"0 0 6px",lineHeight:1.25}}>{insight.title}</h4>
      <AnimatePresence>
        {isActive&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
            exit={{opacity:0,height:0}} transition={{duration:0.28}} style={{overflow:"hidden"}}>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,
              fontWeight:300,lineHeight:1.65,margin:"0 0 14px"}}>{insight.detail}</p>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:26,
                  fontWeight:700,color:tc,lineHeight:1}}>↓{insight.riskReduction}%</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                  color:theme.textMuted,letterSpacing:"0.1em",textTransform:"uppercase"}}>Risk Reduction</div>
              </div>
              <div style={{marginLeft:"auto",textAlign:"right"}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                  color:theme.textFaint,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>
                  via {insight.agent} Agent</div>
                <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}}
                  style={{padding:"8px 18px",background:tc,border:"none",borderRadius:5,
                    color:"#F0EBE1",fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
                    fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer"}}>
                  Execute →
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   CRISIS SIMULATION (unchanged)
═══════════════════════════════════════════════════════ */
const CRISIS_STEPS=[
  {agent:"Risk",color:"#BF8C2C",icon:"⬡",action:"Detecting anomaly",detail:"Center 7 flagged · capacity crisis incoming",duration:1200},
  {agent:"Allocation",color:"#C4002B",icon:"◈",action:"Computing alternatives",detail:"3 backup centers identified · optimal: B12",duration:1400},
  {agent:"Operations",color:"#E8A0B0",icon:"⟁",action:"Validating feasibility",detail:"B12 confirmed · transport routes reserved",duration:1200},
  {agent:"Communication",color:"#2EBFB0",icon:"◫",action:"Preparing notifications",detail:"2,300 candidate alerts queued for dispatch",duration:900},
  {agent:"Intelligence",color:"#7C6FE8",icon:"◬",action:"Generating recommendation",detail:"Execute relocation · 97% confidence · ↓38% risk",duration:1500},
];
function CrisisSimulation({theme}) {
  const [running,setRunning]=useState(false);
  const [activeStep,setActiveStep]=useState(-1);
  const [completed,setCompleted]=useState(false);
  const trigger=useCallback(()=>{
    if(running) return;
    setRunning(true); setCompleted(false); setActiveStep(-1);
    let step=0;
    const run=()=>{
      if(step>=CRISIS_STEPS.length){setCompleted(true);setRunning(false);return;}
      setActiveStep(step);
      const dur=CRISIS_STEPS[step].duration;
      setTimeout(()=>{step++;run();},dur);
    };
    setTimeout(run,300);
  },[running]);
  const reset=useCallback(()=>{setRunning(false);setActiveStep(-1);setCompleted(false);},[]);
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:22,alignItems:"center"}}>
        <motion.button
          whileHover={!running?{scale:1.03,boxShadow:`0 8px 28px ${theme.crimsonGlow}`}:{}}
          whileTap={!running?{scale:0.97}:{}}
          onClick={trigger} disabled={running}
          aria-label="Trigger crisis simulation"
          style={{padding:"11px 26px",
            background:running?`rgba(${hex2rgb(theme.crimson)},0.3)`:theme.crimson,
            border:"none",borderRadius:6,color:"#F0EBE1",
            fontFamily:"'Space Grotesk',sans-serif",fontSize:10,fontWeight:700,
            letterSpacing:"0.16em",textTransform:"uppercase",
            cursor:running?"not-allowed":"pointer",transition:"all 0.25s",
            display:"flex",alignItems:"center",gap:8}}>
          {running?(
            <><motion.span animate={{rotate:360}} transition={{duration:1.2,repeat:Infinity,ease:"linear"}}
              style={{display:"inline-block",fontSize:12}}>⟳</motion.span>Simulating…</>
          ):(<><span>⚡</span>Trigger Simulation</>)}
        </motion.button>
        {completed&&(
          <motion.button initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} onClick={reset}
            style={{padding:"11px 18px",background:"transparent",
              border:`1px solid ${theme.borderSubtle}`,borderRadius:6,color:theme.textMuted,
              fontFamily:"'Space Grotesk',sans-serif",fontSize:9,letterSpacing:"0.14em",
              textTransform:"uppercase",cursor:"pointer"}}>Reset</motion.button>
        )}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {CRISIS_STEPS.map((step,i)=>{
          const isActive=activeStep===i; const isDone=activeStep>i||completed;
          const stepColor=isDone||isActive?step.color:theme.textFaint;
          return(
            <motion.div key={step.agent+i}
              animate={{opacity:activeStep===-1?0.45:(isDone||isActive?1:0.28)}}
              transition={{duration:0.3}}
              style={{display:"flex",alignItems:"flex-start",gap:12,padding:"11px 14px",
                borderLeft:`2.5px solid ${isDone||isActive?step.color:"transparent"}`,
                borderRadius:"0 7px 7px 0",
                background:isActive?`rgba(${hex2rgb(step.color)},${theme.isDark?0.08:0.06})`:
                  isDone?`rgba(${hex2rgb(step.color)},${theme.isDark?0.04:0.03})`:"transparent",
                transition:"background 0.3s,border-color 0.3s"}}>
              <div style={{width:26,height:26,borderRadius:"50%",border:`1.5px solid ${stepColor}`,
                background:isDone?`rgba(${hex2rgb(step.color)},0.15)`:"transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,color:stepColor,flexShrink:0,transition:"all 0.3s"}}>
                {isDone?"✓":isActive?(
                  <motion.span animate={{opacity:[1,0.2,1]}} transition={{duration:0.8,repeat:Infinity}}>
                    {step.icon}
                  </motion.span>
                ):step.icon}
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,fontWeight:700,
                    color:stepColor,letterSpacing:"0.1em",textTransform:"uppercase"}}>{step.agent} Agent</span>
                  {isActive&&(
                    <motion.span animate={{opacity:[0,1,0]}} transition={{duration:1,repeat:Infinity}}
                      style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,color:step.color,
                        letterSpacing:"0.12em",background:`rgba(${hex2rgb(step.color)},0.12)`,
                        border:`1px solid rgba(${hex2rgb(step.color)},0.2)`,
                        padding:"1px 5px",borderRadius:2}}>PROCESSING</motion.span>
                  )}
                </div>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:15,fontWeight:500,
                  color:theme.text,marginBottom:2,lineHeight:1.2}}>{step.action}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11.5,
                  color:theme.textMuted,fontWeight:300}}>{step.detail}</div>
              </div>
              {isDone&&(
                <motion.span initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}}
                  style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:step.color,
                    letterSpacing:"0.08em",alignSelf:"center",flexShrink:0}}>✓ DONE</motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {completed&&(
          <motion.div initial={{opacity:0,y:12,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0}}
            style={{marginTop:18,padding:"18px 20px",
              border:`1px solid ${theme.borderGold}`,borderRadius:8,
              background:`rgba(${hex2rgb(theme.gold)},${theme.isDark?0.06:0.05})`,
              display:"flex",alignItems:"center",justifyContent:"space-between",
              flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:26,fontWeight:700,
                color:theme.gold,lineHeight:1,marginBottom:4}}>Crisis Resolved · 6.2s</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.textMuted,
                letterSpacing:"0.1em",textTransform:"uppercase"}}>
                5 agents · 2,300 candidates protected · 97% confidence</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textMuted,
                letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Human equivalent: 4–6 hours</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.gold,
                fontWeight:700,letterSpacing:"0.08em"}}>OrchestrAI advantage: 10,000×</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVBAR — UNIFIED WITH AGENTS PAGE
   Exact same structure, logo size, spacing, and layout
   as AgentsPage Nav component.
═══════════════════════════════════════════════════════ */
function DashboardNav({isDark, toggleTheme, theme}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 58, display: "flex", alignItems: "center",
        padding: "0 clamp(16px, 4vw, 56px)",
        justifyContent: "space-between",
        background: isDark ? "rgba(3,2,8,0.92)" : "rgba(240,235,225,0.92)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderBottom: `1px solid ${theme.borderSubtle}`,
      }}
    >
      {/* Logo — identical to AgentsPage */}
      <button
        onClick={() => navigate("/dashboard")}
        aria-label="OrchestrAI home"
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <svg width="24" height="24" viewBox="0 0 30 30" fill="none" aria-hidden="true">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5"
            stroke={theme.crimson} strokeWidth="1.5" fill="none" />
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5"
            fill={theme.crimson} opacity="0.85" />
          <circle cx="15" cy="15" r="2.5" fill={isDark ? "#F0EBE1" : "#1A1028"} />
        </svg>
        <div>
          <span style={{
            fontFamily: "'Cormorant Garant', serif", fontSize: 17, fontWeight: 600,
            color: theme.text, letterSpacing: "0.01em", display: "block", lineHeight: 1,
          }}>
            Orchestr<span style={{ color: theme.crimson, fontStyle: "italic" }}>AI</span>
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, color: theme.textFaint,
            letterSpacing: "0.2em", textTransform: "uppercase",
            marginLeft: 0, display: "block",
          }}>Mission Control</span>
        </div>
      </button>

      {/* Nav tabs — same loop pattern as AgentsPage */}
      <div className="dash-nav-tabs" style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {navItems.map(item => {
          const isActive = pathname === item.path || (item.path === "/dashboard" && (pathname === "/" || pathname === "/dashboard"));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-current={isActive ? "page" : undefined}
              style={{
                padding: "6px 16px",
                background: isActive ? `rgba(${hex2rgb(theme.crimson)},0.12)` : "transparent",
                border: "none",
                borderRadius: 5,
                color: isActive ? theme.crimson : theme.textMuted,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right side — LIVE + toggle, same as AgentsPage */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }} aria-label="System live">
          <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: theme.crimson }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: theme.crimson,
            letterSpacing: "0.12em", fontWeight: 600,
          }}>LIVE</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          style={{
            width: 38, height: 20, borderRadius: 10,
            background: isDark ? theme.crimson : "rgba(10,7,22,0.25)",
            border: "none",
            cursor: "pointer", position: "relative", transition: "background 0.35s",
            outline: "none", flexShrink: 0,
          }}
        >
          <motion.div
            animate={{ x: isDark ? 19 : 2 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            style={{ width: 16, height: 16, borderRadius: "50%", background: isDark ? "#F0EBE1" : "#1A1028", position: "absolute", top: 2 }}
          />
        </button>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION HEADER / PANEL — shared primitives (unchanged)
═══════════════════════════════════════════════════════ */
function SectionHeader({eyebrow,eyebrowColor,title,theme}) {
  return(
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
        <div style={{width:18,height:1.5,background:eyebrowColor||theme.crimson,borderRadius:1,flexShrink:0}}/>
        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,letterSpacing:"0.22em",
          color:eyebrowColor||theme.crimson,textTransform:"uppercase",fontWeight:600}}>{eyebrow}</span>
      </div>
      <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(20px,2vw,27px)",
        fontWeight:500,lineHeight:1.15,color:theme.text,margin:0}}>{title}</h2>
    </div>
  );
}
function Panel({children,style={},theme}) {
  return(
    <div style={{
      border:`1px solid ${theme.borderSubtle}`,borderRadius:12,
      background:theme.surface,
      backdropFilter:"blur(24px) saturate(1.6)",
      WebkitBackdropFilter:"blur(24px) saturate(1.6)",
      padding:"22px",...style,
    }}>{children}</div>
  );
}

/* ═══════════════════════════════════════════════════════
   TWIN METRICS STRIP (unchanged)
═══════════════════════════════════════════════════════ */
const TWIN_METRICS = [
  { label:"Total Centers", value:"18,240", icon:"⬡", color:"#C4002B" },
  { label:"Candidates",    value:"2.34M",  icon:"◈", color:"#BF8C2C" },
  { label:"Regions",       value:"7",      icon:"◬", color:"#E8A0B0" },
  { label:"Live Missions", value:"12",     icon:"⟁", color:"#7C6FE8" },
  { label:"Risk Nodes",    value:"4",      icon:"⬡", color:"#2EBFB0" },
  { label:"Optim. Score",  value:"96.4%",  icon:"◫", color:"#BF8C2C" },
];

function TwinMetricsStrip({ theme }) {
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",
      gap:1,border:`1px solid ${theme.borderSubtle}`,borderRadius:10,overflow:"hidden",
      marginBottom:"clamp(12px,1.6vw,18px)",
      background:theme.isDark?"rgba(3,2,8,0.4)":"rgba(240,235,225,0.4)"}}>
      {TWIN_METRICS.map((m,i)=>(
        <motion.div key={m.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
          transition={{delay:0.5+i*0.06}}
          style={{padding:"12px 14px",
            borderRight:i<TWIN_METRICS.length-1?`1px solid ${theme.borderSubtle}`:"none",
            position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,
            background:`radial-gradient(ellipse at 50% 0%,rgba(${hex2rgb(m.color)},${theme.isDark?0.06:0.04}) 0%,transparent 70%)`,
            pointerEvents:"none"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <span style={{fontSize:10,color:m.color,opacity:0.8}}>{m.icon}</span>
          </div>
          <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(20px,2vw,28px)",
            fontWeight:700,color:m.color,lineHeight:1,letterSpacing:"-0.01em",marginBottom:3}}>
            {m.value}
          </div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
            color:theme.textFaint,letterSpacing:"0.12em",textTransform:"uppercase"}}>
            {m.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CORE TELEMETRY — fills vertical whitespace in left panel
   Uses existing agent data; no invented content.
═══════════════════════════════════════════════════════ */
function CoreTelemetry({ theme }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1600);
    return () => clearInterval(iv);
  }, []);

  const metrics = useMemo(() => [
    { label: "Decisions / min", value: Math.floor(580 + Math.sin(tick * 0.8) * 40).toLocaleString(), color: theme.crimson },
    { label: "Mesh Latency",    value: `${Math.max(7, Math.floor(10 + Math.sin(tick * 1.1) * 2))}ms`, color: theme.gold },
    { label: "Agent Sync",      value: "5 / 5",    color: theme.isDark ? "#2EBFB0" : "#077060" },
    { label: "Confidence",      value: "96.4%",    color: theme.agentColors[3] },
  ], [tick, theme]);

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
      marginTop: 14, paddingTop: 14,
      borderTop: `1px solid ${theme.borderSubtle}`,
    }}>
      {metrics.map((m) => (
        <div key={m.label} style={{
          padding: "10px 12px",
          border: `1px solid ${theme.borderSubtle}`,
          borderRadius: 7,
          background: theme.glass,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${m.color}, transparent)`,
            opacity: 0.5,
          }} />
          <div style={{
            fontFamily: "'Cormorant Garant', serif",
            fontSize: "clamp(16px, 1.6vw, 22px)",
            fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: 4,
          }}>{m.value}</div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 8,
            color: theme.textFaint, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD — ROOT
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [isDark,setIsDark]=useState(()=>{
    try { return localStorage.getItem("orchestrai-theme")!=="light"; } catch { return true; }
  });
  const theme=isDark?THEMES.dark:THEMES.light;

  const toggleTheme=useCallback(()=>{
    setIsDark(d=>{
      const next=!d;
      try { localStorage.setItem("orchestrai-theme",next?"dark":"light"); } catch {}
      return next;
    });
  },[]);

  const [ops,setOps]=useState(247318);
  useEffect(()=>{
    const iv=setInterval(()=>setOps(v=>v+Math.floor(Math.random()*450-100)),1200);
    return ()=>clearInterval(iv);
  },[]);

  const [selectedAgent,setSelectedAgent]=useState(null);
  const [activeInsight,setActiveInsight]=useState(0);

  return(
    <>
      <InjectFonts/>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{
          background:${theme.bg};
          color:${theme.text};
          overflow-x:hidden;
          transition:background 0.5s ease,color 0.5s ease;
        }
        ::selection{background:${theme.crimson}44;color:${theme.text};}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${theme.crimson}44;border-radius:2px;}
        :focus-visible{outline:2px solid ${theme.crimson};outline-offset:3px;border-radius:4px;}

        @media(max-width:860px){
          .dash-nav-tabs{display:none!important;}
          .dash-main-grid{grid-template-columns:1fr!important;}
          .dash-bottom-grid{grid-template-columns:1fr!important;}
          .dash-deep-grid{grid-template-columns:1fr!important;}
        }
        @media(prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;}
        }
      `}</style>

      {/* Backgrounds */}
      <div aria-hidden="true" style={{
        position:"fixed",inset:0,zIndex:0,background:theme.bgGradient,pointerEvents:"none",
      }}/>
      <SakuraPetals isDark={isDark}/>
      <div aria-hidden="true" style={{
        position:"fixed",inset:0,zIndex:1,pointerEvents:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity:isDark?0.022:0.01,mixBlendMode:"overlay",
      }}/>

      {/* Content */}
      <div style={{position:"relative",zIndex:2}}>
        <DashboardNav isDark={isDark} toggleTheme={toggleTheme} theme={theme}/>

        <main id="main-content" style={{
          paddingTop:"calc(58px + clamp(16px,2.5vw,32px))",
          paddingLeft:"clamp(12px,3vw,40px)",
          paddingRight:"clamp(12px,3vw,40px)",
          paddingBottom:60,
          minHeight:"100vh",
        }}>

          {/* ════ 1. MISSION CONTROL HEADER ════ */}
          <MissionControlHeader theme={theme} ops={ops}/>

          {/* ════ 2. TWIN METRICS STRIP ════ */}
          <TwinMetricsStrip theme={theme}/>

          {/* ════ 3. DIGITAL TWIN CENTERPIECE (full-width) ════ */}
          <motion.section
            initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
            transition={{duration:0.7,delay:0.18}}
            aria-label="Operational digital twin"
            style={{marginBottom:"clamp(12px,1.6vw,18px)"}}
          >
            <Panel theme={theme} style={{padding:"0 0 0 0",overflow:"hidden"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"16px 22px 14px",borderBottom:`1px solid ${theme.borderSubtle}`}}>
                <SectionHeader
                  eyebrow="Digital Twin · Operational Mirror"
                  eyebrowColor={theme.crimson}
                  title={<span>Live Examination<br/><em style={{color:theme.crimson}}>Operations Network</em></span>}
                  theme={theme}
                />
                <div style={{display:"flex",gap:14,alignItems:"center",flexShrink:0}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                      color:theme.textFaint,letterSpacing:"0.12em",marginBottom:3}}>SIMULATION MODE</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
                      color:theme.isDark?"#2EBFB0":"#077060",fontWeight:700,letterSpacing:"0.08em"}}>
                      LIVE TWIN ACTIVE
                    </div>
                  </div>
                  <motion.div animate={{opacity:[1,0.25,1]}} transition={{duration:1.4,repeat:Infinity}}
                    style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:theme.isDark?"#2EBFB0":"#077060"}}/>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,
                      color:theme.isDark?"#2EBFB0":"#077060",letterSpacing:"0.18em",fontWeight:700}}>STREAMING</span>
                  </motion.div>
                </div>
              </div>
              <OperationalTwin theme={theme}/>
            </Panel>
          </motion.section>

          {/* ════ 4. MAIN GRID: Intelligence Core · Agent Network · Activity Log ════
               Grid is now balanced: Core gets more room, inner panel fills with telemetry
          ════ */}
          <div
            className="dash-main-grid"
            style={{
              display:"grid",
              gridTemplateColumns:"1fr 1.5fr 1fr",
              gap:"clamp(12px,1.6vw,18px)",
              marginBottom:"clamp(12px,1.6vw,18px)",
              alignItems:"start",
            }}
          >
            {/* Intelligence Core — left column, fills space with CoreTelemetry */}
            <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{duration:0.6,delay:0.28}} aria-label="Intelligence core">
              <Panel theme={theme} style={{display:"flex",flexDirection:"column"}}>
                <SectionHeader eyebrow="Intelligence Core" eyebrowColor={theme.crimson}
                  title={<span>Autonomous<br/><em style={{color:theme.crimson}}>Command Core</em></span>}
                  theme={theme}/>
                <div style={{height:"clamp(200px,20vw,260px)",margin:"0 -8px",borderRadius:8,overflow:"hidden"}}>
                  <CoreScene/>
                </div>

                {/* Agent legend */}
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",marginTop:14,
                  paddingTop:14,borderTop:`1px solid ${theme.borderSubtle}`}}>
                  {AGENTS.map(a=>(
                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:a.color,flexShrink:0}}/>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
                        color:theme.textMuted,letterSpacing:"0.04em"}}>{a.label}</span>
                    </div>
                  ))}
                </div>

                {/* Live waveform */}
                <div style={{marginTop:12,position:"relative",height:24,overflow:"hidden",borderRadius:4}}>
                  <svg viewBox="0 0 200 24" style={{width:"100%",height:"100%"}}
                    preserveAspectRatio="none" aria-hidden="true">
                    <motion.polyline
                      points="0,12 20,12 30,4 38,20 46,2 52,22 58,12 80,12 90,12 100,12 110,12 118,4 126,20 134,2 140,22 146,12 170,12 180,12 200,12"
                      fill="none" stroke={theme.crimson} strokeWidth="1.5"
                      opacity={theme.isDark?0.6:0.5}
                      animate={{x:[0,-200]}}
                      transition={{duration:3,repeat:Infinity,ease:"linear"}}/>
                  </svg>
                  <div style={{position:"absolute",right:0,top:0,bottom:0,width:32,
                    background:`linear-gradient(to right,transparent,${theme.surfaceSolid})`}}/>
                </div>

                {/* ── Core Telemetry: fills the remaining vertical space ── */}
                <CoreTelemetry theme={theme}/>
              </Panel>
            </motion.section>

            {/* Agent Network — center column */}
            <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{duration:0.6,delay:0.36}} aria-label="Agent network">
              <Panel theme={theme} style={{display:"flex",flexDirection:"column"}}>
                <SectionHeader eyebrow="Agent Network" eyebrowColor={theme.gold}
                  title={<span>Living Agent<br/><em style={{color:theme.gold}}>Ecosystem</em></span>}
                  theme={theme}/>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,
                  fontWeight:300,lineHeight:1.55,marginBottom:16}}>
                  Click any agent node to inspect its status, confidence score, and current action.
                </p>
                <div style={{minHeight:"clamp(200px,24vw,280px)",position:"relative"}}>
                  <AgentNetwork theme={theme} onAgentSelect={setSelectedAgent} selectedAgent={selectedAgent}/>
                </div>
                <AnimatePresence mode="wait">
                  {selectedAgent?(
                    <motion.div key={selectedAgent.id}
                      initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                      exit={{opacity:0,y:6}} transition={{duration:0.22}}
                      role="region" aria-label={`${selectedAgent.label} agent details`}
                      style={{marginTop:14,padding:"14px 16px",
                        border:`1px solid ${selectedAgent.color}44`,borderRadius:8,
                        background:`rgba(${hex2rgb(selectedAgent.color)},${theme.isDark?0.07:0.05})`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <span style={{fontSize:18,color:selectedAgent.color,lineHeight:1}}>{selectedAgent.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,fontWeight:700,
                            color:selectedAgent.color,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                            {selectedAgent.label} Agent</div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,color:theme.textMuted}}>
                            {selectedAgent.role}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:24,fontWeight:700,
                            color:selectedAgent.color,lineHeight:1}}>{selectedAgent.confidence}%</div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,
                            color:theme.textFaint,letterSpacing:"0.08em"}}>Confidence</div>
                        </div>
                        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,
                          color:selectedAgent.color,letterSpacing:"0.1em",
                          background:`rgba(${hex2rgb(selectedAgent.color)},0.12)`,
                          border:`1px solid rgba(${hex2rgb(selectedAgent.color)},0.22)`,
                          padding:"3px 7px",borderRadius:4,fontWeight:700,
                          alignSelf:"flex-start",flexShrink:0}}>{selectedAgent.status}</span>
                      </div>
                      <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,
                        fontWeight:300,margin:0,lineHeight:1.55}}>{selectedAgent.action}</p>
                    </motion.div>
                  ):(
                    <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      style={{marginTop:14,padding:"12px 16px",
                        border:`1px solid ${theme.borderSubtle}`,borderRadius:8,textAlign:"center"}}>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
                        color:theme.textFaint,letterSpacing:"0.14em"}}>SELECT AN AGENT TO INSPECT</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Panel>
            </motion.section>

            {/* Live Activity Log — right column */}
            <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{duration:0.6,delay:0.44}} aria-label="Live activity log">
              <Panel theme={theme} style={{display:"flex",flexDirection:"column"}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"flex-start",marginBottom:14}}>
                  <SectionHeader eyebrow="Live Feed" eyebrowColor={theme.sakura}
                    title={<span>Agent<br/><em style={{color:theme.sakura}}>Activity Log</em></span>}
                    theme={theme}/>
                  <motion.div animate={{opacity:[1,0.25,1]}}
                    transition={{duration:1.4,repeat:Infinity}}
                    style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}
                    aria-hidden="true">
                    <div style={{width:5,height:5,borderRadius:"50%",background:theme.crimson}}/>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,
                      color:theme.crimson,letterSpacing:"0.18em",fontWeight:700}}>STREAMING</span>
                  </motion.div>
                </div>
                <LiveActivityLog theme={theme}/>
              </Panel>
            </motion.section>
          </div>

          {/* ════ 5. OPERATIONAL HEALTH LAYER ════ */}
          <motion.section initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            transition={{duration:0.6,delay:0.52}}
            aria-label="Operational health layer"
            style={{marginBottom:"clamp(12px,1.6vw,18px)"}}>
            <Panel theme={theme}>
              <SectionHeader eyebrow="Operational Health Layer" eyebrowColor={theme.isDark?"#2EBFB0":"#077060"}
                title={<span>System<br/><em style={{color:theme.isDark?"#2EBFB0":"#077060"}}>Vital Signs</em></span>}
                theme={theme}/>
              <OperationalHealthLayer theme={theme}/>
            </Panel>
          </motion.section>

          {/* ════ 6. DEEP GRID: Missions · Insights · Crisis Simulation ════ */}
          <div
            className="dash-bottom-grid"
            style={{
              display:"grid",
              gridTemplateColumns:"1.35fr 1fr 1fr",
              gap:"clamp(12px,1.6vw,18px)",
              marginBottom:"clamp(12px,1.6vw,18px)",
              alignItems:"start",
            }}
          >
            {/* Active Missions */}
            <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{duration:0.6,delay:0.58}} aria-label="Active missions">
              <Panel theme={theme}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"flex-start",marginBottom:18}}>
                  <SectionHeader eyebrow="Active Missions" eyebrowColor={theme.crimson}
                    title={<span>Operational<br/><em style={{color:theme.crimson}}>Command Deck</em></span>}
                    theme={theme}/>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
                    color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",
                    marginTop:4,flexShrink:0}}>3 of 12</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {MISSIONS.map((m,i)=>(
                    <MissionCard key={m.code} mission={m} theme={theme} delay={0.62+i*0.09}/>
                  ))}
                </div>
              </Panel>
            </motion.section>

            {/* AI Insights */}
            <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{duration:0.6,delay:0.64}} aria-label="AI insights">
              <Panel theme={theme} style={{display:"flex",flexDirection:"column"}}>
                <SectionHeader eyebrow="Intelligence Layer" eyebrowColor={theme.agentColors[3]}
                  title={<span>AI<br/><em style={{color:theme.agentColors[3]}}>Insights Panel</em></span>}
                  theme={theme}/>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,
                  fontWeight:300,lineHeight:1.55,marginBottom:16}}>
                  Expand a recommendation to review details and execute.
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:10,flex:1}}>
                  {INSIGHTS.map((ins,i)=>(
                    <InsightCard key={ins.type+i} insight={ins} theme={theme}
                      isActive={activeInsight===i}
                      onClick={()=>setActiveInsight(activeInsight===i?-1:i)}
                      delay={0.66+i*0.08}/>
                  ))}
                </div>
                <div style={{marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSubtle}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
                      color:theme.textMuted,letterSpacing:"0.08em"}}>System Decision Confidence</span>
                    <motion.span animate={{opacity:[0.55,1,0.55]}} transition={{duration:2.2,repeat:Infinity}}
                      style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
                        color:theme.agentColors[3],fontWeight:700}}>96.4%</motion.span>
                  </div>
                  <div style={{height:4,background:theme.isDark?"rgba(255,255,255,0.08)":"rgba(10,7,22,0.1)",
                    borderRadius:2,overflow:"hidden"}}>
                    <motion.div animate={{width:["84%","97%","91%","96%"]}}
                      transition={{duration:5,repeat:Infinity,ease:"easeInOut"}}
                      style={{height:"100%",
                        background:`linear-gradient(90deg,${theme.agentColors[3]},${theme.sakura})`,
                        borderRadius:2}}/>
                  </div>
                </div>
              </Panel>
            </motion.section>

            {/* Crisis Simulation */}
            <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{duration:0.6,delay:0.70}} aria-label="Crisis simulation">
              <Panel theme={theme} style={{display:"flex",flexDirection:"column"}}>
                <SectionHeader eyebrow="Simulation Theatre" eyebrowColor={theme.gold}
                  title={<span>Crisis<br/><em style={{color:theme.gold}}>Response Demo</em></span>}
                  theme={theme}/>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,
                  fontWeight:300,lineHeight:1.55,marginBottom:18}}>
                  Watch all five agents collaborate autonomously to resolve a real-time infrastructure crisis.
                </p>
                <div style={{flex:1}}>
                  <CrisisSimulation theme={theme}/>
                </div>
              </Panel>
            </motion.section>
          </div>

          {/* ════ 7. MISSION TIMELINE + SITUATIONAL AWARENESS ════ */}
          <div
            className="dash-deep-grid"
            style={{
              display:"grid",
              gridTemplateColumns:"1fr 1fr",
              gap:"clamp(12px,1.6vw,18px)",
              marginBottom:"clamp(12px,1.6vw,18px)",
              alignItems:"start",
            }}
          >
            <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{duration:0.6,delay:0.76}} aria-label="Mission timeline">
              <Panel theme={theme} style={{display:"flex",flexDirection:"column"}}>
                <SectionHeader eyebrow="Mission Timeline" eyebrowColor={theme.gold}
                  title={<span>Operational<br/><em style={{color:theme.gold}}>Event Stream</em></span>}
                  theme={theme}/>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,
                  fontWeight:300,lineHeight:1.55,marginBottom:20}}>
                  Live playback of agent actions and system decisions.
                </p>
                <MissionTimeline theme={theme}/>
              </Panel>
            </motion.section>

            <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}
              transition={{duration:0.6,delay:0.82}} aria-label="Situational awareness">
              <Panel theme={theme} style={{display:"flex",flexDirection:"column"}}>
                <SectionHeader eyebrow="Situational Awareness" eyebrowColor={theme.crimson}
                  title={<span>Active Risks &<br/><em style={{color:theme.crimson}}>Recommendations</em></span>}
                  theme={theme}/>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,
                  fontWeight:300,lineHeight:1.55,marginBottom:20}}>
                  Real-time intelligence feed from all five agents.
                </p>
                <SituationalAwareness theme={theme}/>
              </Panel>
            </motion.section>
          </div>

          {/* ════ FOOTER ════ */}
          <motion.footer initial={{opacity:0}} animate={{opacity:1}}
            transition={{delay:0.9}}
            style={{marginTop:28,paddingTop:20,borderTop:`1px solid ${theme.borderSubtle}`,
              display:"flex",justifyContent:"space-between",alignItems:"center",
              flexWrap:"wrap",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <svg width="16" height="16" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5"
                  stroke={theme.crimson} strokeWidth="1.5" fill="none"/>
                <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5"
                  fill={theme.crimson} opacity="0.8"/>
              </svg>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,
                color:theme.textFaint,letterSpacing:"0.1em"}}>
                OrchestrAI © 2025 · Digital Twin Platform v3.1.0
              </span>
            </div>
            <div style={{display:"flex",gap:18,alignItems:"center",flexWrap:"wrap"}}>
              {[
                {label:"Agent Mesh",value:"HEALTHY",color:theme.isDark?"#2EBFB0":"#077060"},
                {label:"Twin Sync",value:"LIVE",color:theme.gold},
                {label:"Auth",value:"JWT SECURE",color:theme.crimson},
              ].map(s=>(
                <div key={s.label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,
                    color:theme.textMuted,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                    {s.label}: <span style={{color:s.color,fontWeight:700}}>{s.value}</span>
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