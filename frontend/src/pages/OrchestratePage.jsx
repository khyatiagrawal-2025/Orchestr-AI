/**
 * OrchestrAI — OrchestratePage.jsx  (v4 — Hackathon Demo Edition)
 *
 * WHAT CHANGED vs v3:
 *   ─ Step 1: Mission Builder — per-agent field labels, live summary panel
 *   ─ Step 2: Digital Twin Map — SVG operational map with regions, center nodes,
 *             candidate flows, capacity bars, risk zones — ALL update from inputs
 *   ─ Step 3: Agent Collaboration Layer — visible reasoning, not status dots
 *             Shows: which signal triggered which agent, what data was used, why
 *   ─ Step 4: Decision Intelligence — every rec has Executive Summary, Reasoning,
 *             Recommended Action, Expected Outcome with specific numbers
 *   ─ Step 5: Mission Outcome — premium report card with all KPIs
 *   ─ Preserves 3D OrchestrationCore, Sakura canvas, theme toggle, routing
 *   ─ Full dark/light parity, responsive 320px → 2560px
 *   ─ No fake AI statements — every output is specific and believable
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
   THEME SYSTEM — identical to all pages
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
    textMuted: "rgba(240,235,225,0.55)",
    textFaint: "rgba(240,235,225,0.16)",
    crimson: "#C4002B",
    crimsonLight: "#E8003A",
    crimsonGlow: "rgba(196,0,43,0.32)",
    gold: "#BF8C2C",
    goldGlow: "rgba(191,140,44,0.24)",
    goldLight: "#D4A84E",
    sakura: "#E8A0B0",
    sakuraGlow: "rgba(232,160,176,0.14)",
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
    textMuted: "rgba(10,7,22,0.52)",
    textFaint: "rgba(10,7,22,0.14)",
    crimson: "#B8002A",
    crimsonLight: "#D40030",
    crimsonGlow: "rgba(184,0,42,0.18)",
    gold: "#A87820",
    goldGlow: "rgba(168,120,32,0.18)",
    goldLight: "#C4921A",
    sakura: "#B85470",
    sakuraGlow: "rgba(184,84,112,0.1)",
    agentColors: ["#B8002A","#A87820","#B85470","#4A40B8","#087870"],
    isDark: false,
  },
};

const h2r = (hex) => {
  if (!hex || hex[0] !== "#") return "128,128,128";
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
      petals = Array.from({ length: 12 }, () => ({
        x: Math.random()*W, y: Math.random()*H - H,
        size: Math.random()*4+3, speed: Math.random()*0.35+0.1,
        wobble: Math.random()*Math.PI*2, wobbleSpeed: Math.random()*0.013+0.005,
        rotation: Math.random()*Math.PI*2, rotSpeed: Math.random()*0.015-0.007,
        opacity: Math.random()*0.22+0.05,
      }));
    };
    init();
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const fill = isDark ? "rgba(232,160,176,0.5)" : "rgba(184,84,112,0.22)";
      for (const p of petals) {
        ctx.save();
        ctx.translate(p.x+Math.sin(p.wobble)*14,p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(0,-p.size);
        ctx.bezierCurveTo(p.size*.8,-p.size*.6,p.size*.8,p.size*.6,0,p.size);
        ctx.bezierCurveTo(-p.size*.8,p.size*.6,-p.size*.8,-p.size*.6,0,-p.size);
        ctx.fill();
        ctx.restore();
        p.y+=p.speed; p.wobble+=p.wobbleSpeed; p.rotation+=p.rotSpeed;
        if(p.y>H+20){p.y=-20;p.x=Math.random()*W;}
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize",init);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",init);};
  },[isDark]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>;
}

/* ══════════════════════════════════════════════════════════
   3D — ORCHESTRATION CORE  (preserved from v3)
══════════════════════════════════════════════════════════ */
function CorePulse({isActive}){
  const ref=useRef();
  useFrame(({clock})=>{
    const t=clock.getElapsedTime();
    const beat=Math.max(0,Math.sin(t*(isActive?3.5:1.7)));
    if(ref.current){
      ref.current.scale.setScalar(1+beat*(isActive?1.1:0.55));
      ref.current.material.opacity=beat*(isActive?0.28:0.12);
    }
  });
  return(<mesh ref={ref}><sphereGeometry args={[0.65,16,16]}/><meshStandardMaterial color="#C4002B" transparent opacity={0} side={THREE.BackSide}/></mesh>);
}

function AgentOrb({position,color,active}){
  const ref=useRef();
  useFrame(({clock})=>{
    if(!ref.current)return;
    const t=clock.getElapsedTime();
    const s=active?1+Math.sin(t*4)*0.25:1+Math.sin(t*1.4)*0.08;
    ref.current.scale.setScalar(s);
    ref.current.material.emissiveIntensity=active?2.2+Math.sin(t*5)*0.6:0.4;
  });
  return(<mesh ref={ref} position={position}><sphereGeometry args={[0.18,12,12]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.7} roughness={0.1}/></mesh>);
}

const AGENT_ORBS=[
  {color:"#C4002B",pos:[2.0,0.5,0.3]},{color:"#BF8C2C",pos:[0.6,1.8,0.8]},
  {color:"#E8A0B0",pos:[-1.8,0.7,0.5]},{color:"#7C6FE8",pos:[-0.5,-1.8,0.6]},
  {color:"#2EBFB0",pos:[1.6,-1.4,0.4]},
];

function OrchestrationCore({isActive}){
  const outerRef=useRef(),midRef=useRef(),innerRef=useRef();
  const r1=useRef(),r2=useRef(),r3=useRef();
  useFrame(({clock})=>{
    const t=clock.getElapsedTime();
    const s=isActive?3.2:1.0;
    if(outerRef.current){outerRef.current.rotation.y=t*.08*s;outerRef.current.rotation.z=Math.sin(t*.2)*.05;}
    if(midRef.current){midRef.current.rotation.y=-t*.13*s;midRef.current.rotation.x=t*.07*s;}
    if(innerRef.current){
      innerRef.current.rotation.y=t*.26*s;innerRef.current.rotation.z=-t*.11*s;
      const pulse=1+Math.sin(t*(isActive?5.5:2.3))*(isActive?.18:.07);
      innerRef.current.scale.setScalar(pulse);
    }
    if(r1.current)r1.current.rotation.z=t*.10*s;
    if(r2.current){r2.current.rotation.x=t*.08*s;r2.current.rotation.z=-t*.055*s;}
    if(r3.current){r3.current.rotation.y=t*.065*s;r3.current.rotation.x=-t*.045*s;}
  });
  return(
    <group>
      <group ref={outerRef}><mesh><icosahedronGeometry args={[1.2,1]}/><meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive?.55:.18} metalness={.9} roughness={.06} transparent opacity={isActive?.14:.07} wireframe/></mesh></group>
      <group ref={midRef}><mesh><dodecahedronGeometry args={[.84,0]}/><meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={isActive?.45:.14} metalness={.85} roughness={.07} transparent opacity={isActive?.16:.09} wireframe/></mesh></group>
      <group ref={innerRef}>
        <mesh><octahedronGeometry args={[.44,0]}/><meshStandardMaterial color="#F0EBE1" emissive="#BF8C2C" emissiveIntensity={isActive?2.8:1.4} metalness={1} roughness={0}/></mesh>
        <mesh><octahedronGeometry args={[.28,0]}/><meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive?3.2:1.8} metalness={.9} roughness={0}/></mesh>
      </group>
      <mesh ref={r1} rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.38,.009,8,128]}/><meshStandardMaterial color="#C4002B" emissive="#C4002B" emissiveIntensity={isActive?1.2:.6} transparent opacity={isActive?.65:.35}/></mesh>
      <mesh ref={r2} rotation={[Math.PI/2+.9,.4,0]}><torusGeometry args={[1.58,.006,8,128]}/><meshStandardMaterial color="#BF8C2C" emissive="#BF8C2C" emissiveIntensity={isActive?1.0:.5} transparent opacity={isActive?.42:.22}/></mesh>
      <mesh ref={r3} rotation={[Math.PI/2-.6,-.5,.2]}><torusGeometry args={[1.76,.005,8,128]}/><meshStandardMaterial color="#E8A0B0" emissive="#E8A0B0" emissiveIntensity={isActive?.9:.4} transparent opacity={isActive?.35:.18}/></mesh>
      {AGENT_ORBS.map((o,i)=><AgentOrb key={i} position={o.pos} color={o.color} active={isActive}/>)}
      <CorePulse isActive={isActive}/>
      <Sparkles count={isActive?120:50} scale={4.8} size={.4} speed={isActive?.6:.22} color="#BF8C2C" opacity={isActive?.8:.4}/>
      <Sparkles count={isActive?60:22} scale={3.0} size={.26} speed={isActive?.5:.3} color="#E8A0B0" opacity={isActive?.65:.28}/>
      <pointLight position={[4,3,3]} color="#C4002B" intensity={isActive?10:5} distance={10} decay={2}/>
      <pointLight position={[-4,-2,-3]} color="#BF8C2C" intensity={isActive?7:3.5} distance={10} decay={2}/>
      <ambientLight intensity={.18} color="#1a0a2e"/>
    </group>
  );
}

function CoreScene3D({isActive}){
  return(
    <Canvas camera={{position:[0,.5,5.5],fov:38}} gl={{antialias:true,alpha:true}} style={{background:"transparent"}} dpr={[1,1.5]}>
      <Suspense fallback={null}>
        <Float speed={isActive?2.8:1.2} rotationIntensity={isActive?.55:.22} floatIntensity={isActive?.7:.32}>
          <OrchestrationCore isActive={isActive}/>
        </Float>
      </Suspense>
    </Canvas>
  );
}

/* ══════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════ */
function Nav({isDark,toggleTheme,theme}){
  const navigate=useNavigate();
  const items=[
    {label:"Overview",path:"/dashboard"},
    {label:"Agents",path:"/agents"},
    {label:"Missions",path:"/missions"},
    {label:"Analytics",path:"/analytics"},
    {label:"Orchestrate",path:"/orchestrate"},
  ];
  return(
    <motion.nav initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.6,ease:[.22,1,.36,1]}}
      style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:58,display:"flex",alignItems:"center",
        padding:"0 clamp(16px,4vw,56px)",justifyContent:"space-between",
        background:isDark?"rgba(3,2,8,0.94)":"rgba(240,235,225,0.94)",
        backdropFilter:"blur(24px) saturate(1.8)",borderBottom:`1px solid ${theme.borderSubtle}`}}>
      <button onClick={()=>navigate("/dashboard")} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer"}}>
        <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none"/>
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity=".85"/>
          <circle cx="15" cy="15" r="2.5" fill="#F0EBE1"/>
        </svg>
        <div>
          <span style={{fontFamily:"'Cormorant Garant',serif",fontSize:17,fontWeight:600,color:theme.text}}>
            Orchestr<span style={{color:theme.crimson,fontStyle:"italic"}}>AI</span>
          </span>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.2em",textTransform:"uppercase",marginLeft:10}}>Mission Control</span>
        </div>
      </button>
      <div style={{display:"flex",gap:2}} className="op-nav-tabs">
        {items.map(item=>(
          <button key={item.label} onClick={()=>navigate(item.path)}
            style={{padding:"6px 16px",
              background:item.path==="/orchestrate"?`rgba(${h2r(theme.crimson)},.12)`:"transparent",
              border:"none",borderRadius:5,
              color:item.path==="/orchestrate"?theme.crimson:theme.textMuted,
              fontFamily:"'Space Grotesk',sans-serif",fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",
              fontWeight:item.path==="/orchestrate"?600:400,cursor:"pointer",transition:"all 0.2s"}}>
            {item.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <motion.div animate={{opacity:[1,.2,1]}} transition={{duration:1.5,repeat:Infinity}} style={{width:6,height:6,borderRadius:"50%",background:theme.crimson}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.crimson,letterSpacing:"0.12em",fontWeight:600}}>LIVE</span>
        </div>
        <button onClick={toggleTheme} style={{width:38,height:20,borderRadius:10,background:isDark?theme.crimson:theme.textFaint,border:"none",cursor:"pointer",position:"relative",transition:"background 0.35s",outline:"none"}}>
          <motion.div animate={{x:isDark?19:2}} transition={{type:"spring",stiffness:340,damping:32}} style={{width:16,height:16,borderRadius:"50%",background:isDark?"#F0EBE1":"#0A0716",position:"absolute",top:2}}/>
        </button>
        <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={()=>navigate("/")}
          style={{background:"transparent",border:`1px solid ${theme.borderSubtle}`,borderRadius:5,padding:"4px 10px",cursor:"pointer",color:theme.textMuted,
            fontFamily:"'Space Grotesk',sans-serif",fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=theme.crimson;e.currentTarget.style.color=theme.text;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=theme.borderSubtle;e.currentTarget.style.color=theme.textMuted;}}>
          Exit Platform
        </motion.button>
      </div>
    </motion.nav>
  );
}

/* ══════════════════════════════════════════════════════════
   AGENTS DEFINITION
══════════════════════════════════════════════════════════ */
const AGENTS = [
  {id:"risk",        name:"Risk",         icon:"⬡", color:"#BF8C2C", role:"Threat Intelligence",   field:"candidateCount"},
  {id:"allocation",  name:"Allocation",   icon:"◈", color:"#C4002B", role:"Resource Allocation",   field:"centers"},
  {id:"operations",  name:"Operations",   icon:"⟁", color:"#E8A0B0", role:"Execution Spine",       field:"regions"},
  {id:"intelligence",name:"Intelligence", icon:"◬", color:"#7C6FE8", role:"Decision Engine",        field:"objectives"},
  {id:"communication",name:"Comm",        icon:"◫", color:"#2EBFB0", role:"Stakeholder Network",   field:"priority"},
];

/* ══════════════════════════════════════════════════════════
   STEP 1 — MISSION BUILDER
══════════════════════════════════════════════════════════ */
const REGION_OPTIONS = [
  {value:"national",label:"National"},{value:"northern",label:"Northern"},
  {value:"southern",label:"Southern"},{value:"eastern",label:"Eastern"},
  {value:"western",label:"Western"},
];
const PRIORITY_OPTIONS = [
  {value:"NORMAL",label:"Normal"},{value:"HIGH",label:"High"},{value:"CRITICAL",label:"Critical"},
];
const OBJECTIVE_OPTS = [
  {label:"Minimize candidate travel distance",icon:"◈",color:"#C4002B"},
  {label:"Reduce infrastructure risk exposure",icon:"⬡",color:"#BF8C2C"},
  {label:"Maximize center capacity utilization",icon:"⟁",color:"#E8A0B0"},
  {label:"Prioritize accessibility compliance",icon:"◬",color:"#7C6FE8"},
  {label:"Optimize proctor-to-center ratio",icon:"◫",color:"#2EBFB0"},
];

function FieldTag({color,icon,label}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:3,background:`rgba(${h2r(color)},.10)`,border:`1px solid ${color}33`}}>
      <span style={{fontSize:9,color,fontFamily:"monospace"}}>{icon}</span>
      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>{label}</span>
    </div>
  );
}

function MissionBuilder({theme,config,onChange}){
  const set=k=>v=>onChange(k,v);
  const toggleObj=i=>{
    const c=config.objectives;
    onChange("objectives",c.includes(i)?c.filter(x=>x!==i):[...c,i]);
  };

  const candidateNum = parseInt((config.candidateCount||"").replace(/[^0-9]/g,""))||0;
  const centerNum = parseInt((config.centers||"").replace(/[^0-9]/g,""))||0;
  const avgPerCenter = candidateNum && centerNum ? Math.round(candidateNum/centerNum) : 0;

  return(
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5,delay:.1}}
      style={{border:`1px solid ${theme.borderSubtle}`,borderRadius:14,background:theme.surface,backdropFilter:"blur(28px) saturate(1.6)",overflow:"hidden"}}>

      {/* Header */}
      <div style={{padding:"16px 22px",borderBottom:`1px solid ${theme.borderSubtle}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:`rgba(${h2r(theme.gold)},.03)`}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:16,height:1.5,background:theme.gold}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.gold,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:500}}>Step 1 · Mission Configuration</span>
        </div>
        <div style={{display:"flex",gap:4}}>
          {AGENTS.map(a=><div key={a.id} style={{width:5,height:5,borderRadius:"50%",background:a.color,opacity:config[a.field]?1:.15,transition:"opacity .3s"}}/>)}
        </div>
      </div>

      <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:18}}>

        {/* Operation Name */}
        <div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:7}}>Operation Name</div>
          <input value={config.name} onChange={e=>set("name")(e.target.value)}
            placeholder="e.g. NEET 2027 National Coordination"
            style={{width:"100%",padding:"12px 16px",background:config.name?`rgba(${h2r(theme.crimson)},.05)`:theme.glass,
              border:`1px solid ${config.name?theme.crimson+"44":theme.borderSubtle}`,borderRadius:8,color:theme.text,
              fontFamily:"'Cormorant Garant',serif",fontSize:19,fontWeight:400,outline:"none",transition:"all .25s",boxSizing:"border-box"}}/>
        </div>

        {/* Candidates + Centers */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="op-grid-2">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
              <FieldTag color="#BF8C2C" icon="⬡" label="Risk Agent"/>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>Candidate Count</span>
            </div>
            <input value={config.candidateCount} onChange={e=>set("candidateCount")(e.target.value)}
              placeholder="e.g. 2,300,000"
              style={{width:"100%",padding:"10px 14px",background:config.candidateCount?`rgba(${h2r("#BF8C2C")},.06)`:theme.glass,
                border:`1px solid ${config.candidateCount?"#BF8C2C44":theme.borderSubtle}`,borderRadius:7,color:theme.text,
                fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",transition:"all .25s",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
              <FieldTag color="#C4002B" icon="◈" label="Allocation Agent"/>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>Available Centers</span>
            </div>
            <input value={config.centers} onChange={e=>set("centers")(e.target.value)}
              placeholder="e.g. 4,820"
              style={{width:"100%",padding:"10px 14px",background:config.centers?`rgba(${h2r("#C4002B")},.06)`:theme.glass,
                border:`1px solid ${config.centers?"#C4002B44":theme.borderSubtle}`,borderRadius:7,color:theme.text,
                fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",transition:"all .25s",boxSizing:"border-box"}}/>
          </div>
        </div>

        {/* Region */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
            <FieldTag color="#E8A0B0" icon="⟁" label="Operations Agent"/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>Operational Region</span>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {REGION_OPTIONS.map(opt=>{
              const sel=config.regions===opt.value;
              return(
                <button key={opt.value} onClick={()=>set("regions")(opt.value)}
                  style={{flex:1,minWidth:60,padding:"8px 10px",
                    border:`1px solid ${sel?"#E8A0B055":theme.borderSubtle}`,borderRadius:6,
                    background:sel?`rgba(${h2r("#E8A0B0")},.10)`:"transparent",
                    color:sel?"#E8A0B0":theme.textMuted,fontFamily:"'Space Grotesk',sans-serif",
                    fontSize:9.5,letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:sel?700:400,cursor:"pointer",transition:"all .22s"}}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
            <FieldTag color="#2EBFB0" icon="◫" label="Comm Agent"/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>Mission Priority</span>
          </div>
          <div style={{display:"flex",gap:5}}>
            {PRIORITY_OPTIONS.map(opt=>{
              const sel=config.priority===opt.value;
              const c=opt.value==="CRITICAL"?theme.crimson:opt.value==="HIGH"?theme.gold:"#2EBFB0";
              return(
                <button key={opt.value} onClick={()=>set("priority")(opt.value)}
                  style={{flex:1,padding:"8px 10px",border:`1px solid ${sel?c+"55":theme.borderSubtle}`,borderRadius:6,
                    background:sel?`rgba(${h2r(c)},.10)`:"transparent",color:sel?c:theme.textMuted,
                    fontFamily:"'Space Grotesk',sans-serif",fontSize:9.5,letterSpacing:"0.05em",textTransform:"uppercase",
                    fontWeight:sel?700:400,cursor:"pointer",transition:"all .22s"}}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Objectives */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
            <FieldTag color="#7C6FE8" icon="◬" label="Intelligence Agent"/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>Optimization Objectives</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {OBJECTIVE_OPTS.map((obj,i)=>{
              const active=config.objectives.includes(i);
              return(
                <button key={i} onClick={()=>toggleObj(i)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
                    border:`1px solid ${active?obj.color+"44":theme.borderSubtle}`,borderRadius:7,
                    background:active?`rgba(${h2r(obj.color)},.07)`:"transparent",cursor:"pointer",
                    transition:"all .22s",textAlign:"left",width:"100%"}}>
                  <div style={{width:14,height:14,borderRadius:3,flexShrink:0,
                    border:`1.5px solid ${active?obj.color:theme.textFaint}`,
                    background:active?`rgba(${h2r(obj.color)},.2)`:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",transition:"all .22s"}}>
                    {active&&<span style={{fontSize:8,color:obj.color}}>✓</span>}
                  </div>
                  <span style={{fontSize:9,color:obj.color,fontFamily:"monospace",flexShrink:0}}>{obj.icon}</span>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:11,color:active?theme.text:theme.textMuted,fontWeight:active?500:400}}>{obj.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Mission Summary */}
        {(config.name||config.candidateCount||config.centers) && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
            style={{padding:"14px 16px",border:`1px solid ${theme.borderGold}`,borderRadius:9,background:`rgba(${h2r(theme.gold)},.04)`}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.gold,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>
              Live Mission Summary
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {label:"Operation",value:config.name||"—",color:theme.text},
                {label:"Region",value:REGION_OPTIONS.find(r=>r.value===config.regions)?.label||"National",color:theme.textMuted},
                {label:"Candidates",value:config.candidateCount||"—",color:theme.crimson},
                {label:"Centers",value:config.centers||"—",color:theme.gold},
                ...(avgPerCenter>0?[{label:"Avg per Center",value:avgPerCenter.toLocaleString(),color:"#2EBFB0"}]:[]),
                {label:"Priority",value:config.priority,color:config.priority==="CRITICAL"?theme.crimson:config.priority==="HIGH"?theme.gold:"#2EBFB0"},
              ].map((s,i)=>(
                <div key={i}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{s.label}</div>
                  <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:16,fontWeight:600,color:s.color,lineHeight:1}}>{s.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 2 — DIGITAL TWIN OPERATIONAL MAP
   SVG map that UPDATES based on mission inputs
══════════════════════════════════════════════════════════ */
const MAP_REGIONS = [
  {id:"north", name:"North",  x:50,  y:10, color:"#C4002B"},
  {id:"east",  name:"East",   x:82,  y:38, color:"#BF8C2C"},
  {id:"center",name:"Central",x:50,  y:45, color:"#7C6FE8"},
  {id:"west",  name:"West",   x:18,  y:38, color:"#E8A0B0"},
  {id:"south", name:"South",  x:50,  y:78, color:"#2EBFB0"},
];

const CENTERS_BY_REGION = {
  north:  [{id:"C-101",x:36,y:16},{id:"C-102",x:52,y:8},{id:"C-103",x:65,y:20},{id:"C-142",x:44,y:24,risk:true}],
  east:   [{id:"C-201",x:78,y:32},{id:"C-202",x:88,y:40},{id:"C-203",x:80,y:48}],
  center: [{id:"C-301",x:42,y:42},{id:"C-302",x:52,y:50},{id:"C-303",x:60,y:43},{id:"C-304",x:48,y:55}],
  west:   [{id:"C-401",x:12,y:34},{id:"C-402",x:22,y:42},{id:"C-403",x:14,y:48}],
  south:  [{id:"C-501",x:40,y:74},{id:"C-502",x:52,y:80},{id:"C-503",x:62,y:70},{id:"C-B12",x:56,y:88,backup:true}],
};

function DigitalTwinMap({theme,isDark,config,isRunning,isDone}){
  const svgRef = useRef();
  const [dims,setDims] = useState({w:600,h:400});
  const [flowPulses,setFlowPulses] = useState([]);
  const [tick,setTick] = useState(0);

  useEffect(()=>{
    const el=svgRef.current; if(!el)return;
    const ro=new ResizeObserver(e=>{const r=e[0].contentRect;setDims({w:r.width,h:r.height});});
    ro.observe(el); return()=>ro.disconnect();
  },[]);

  // Candidate distribution per region
  const candidateNum = parseInt((config.candidateCount||"").replace(/[^0-9]/g,""))||0;
  const centerNum = parseInt((config.centers||"").replace(/[^0-9]/g,""))||0;
  const regionWeights = {national:[.28,.18,.24,.14,.16],northern:[.70,.08,.10,.07,.05],
    southern:[.05,.08,.10,.07,.70],eastern:[.08,.60,.12,.07,.13],western:[.08,.08,.12,.62,.10]};
  const weights = regionWeights[config.regions]||regionWeights.national;

  const regionData = MAP_REGIONS.map((r,i)=>({
    ...r,
    candidates: Math.round(candidateNum*weights[i]),
    centers: Math.max(1,Math.round(centerNum*weights[i])),
    utilization: Math.min(100,Math.round(60+weights[i]*200+Math.random()*5)),
  }));

  // Flow pulses
  useEffect(()=>{
    if(!candidateNum) return;
    const iv=setInterval(()=>{
      const ri=Math.floor(Math.random()*MAP_REGIONS.length);
      const rj=(ri+1+Math.floor(Math.random()*3))%MAP_REGIONS.length;
      setFlowPulses(p=>[...p.slice(-12),{id:Date.now()+Math.random(),fi:ri,ti:rj,t:0,color:MAP_REGIONS[ri].color}]);
    },isRunning?300:800);
    return()=>clearInterval(iv);
  },[candidateNum,isRunning]);

  useEffect(()=>{
    let raf;
    const frame=()=>{
      setFlowPulses(p=>p.map(fp=>({...fp,t:fp.t+0.02})).filter(fp=>fp.t<1));
      setTick(t=>t+1);
      raf=requestAnimationFrame(frame);
    };
    raf=requestAnimationFrame(frame);
    return()=>cancelAnimationFrame(raf);
  },[]);

  const px=(pct,axis)=>pct/100*(axis==="x"?dims.w:dims.h);
  const lerp=(a,b,t)=>a+(b-a)*t;

  const activeRegionId = config.regions==="national"?null:
    {northern:"north",southern:"south",eastern:"east",western:"west"}[config.regions]||null;

  const allCenters = Object.entries(CENTERS_BY_REGION).flatMap(([rid,cs])=>cs.map(c=>({...c,regionId:rid})));

  return(
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5,delay:.15}}
      style={{border:`1px solid ${isRunning?theme.crimson+"44":theme.borderSubtle}`,borderRadius:14,overflow:"hidden",
        background:isDark?"rgba(6,3,14,0.72)":"rgba(225,218,208,0.55)",backdropFilter:"blur(20px)",
        transition:"border-color .5s"}}>

      {/* Header */}
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${theme.borderSubtle}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:14,height:1.5,background:theme.gold}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.gold,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:500}}>
            Step 2 · Digital Twin · Operational Map
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {candidateNum>0&&(
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:theme.textMuted}}>
              {candidateNum.toLocaleString()} candidates · {centerNum>0?`${centerNum.toLocaleString()} centers`:"—"}
            </span>
          )}
          {(isRunning||isDone)&&(
            <motion.div animate={isRunning?{opacity:[1,.2,1]}:{}} transition={{duration:.9,repeat:Infinity}}
              style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:isRunning?theme.crimson:"#2EBFB0"}}/>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:isRunning?theme.crimson:"#2EBFB0",letterSpacing:"0.12em"}}>{isRunning?"SIMULATING":"RESOLVED"}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* SVG Map */}
      <div ref={svgRef} style={{height:"clamp(300px,35vh,420px)",position:"relative"}}>
        {/* Grid */}
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle,${theme.textFaint} 1px,transparent 1px)`,backgroundSize:"28px 28px",opacity:.3,pointerEvents:"none"}}/>

        {!candidateNum&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,pointerEvents:"none"}}>
            <div style={{fontSize:28,color:theme.textFaint,fontFamily:"monospace"}}>◈</div>
            <p style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.textFaint,letterSpacing:"0.16em",textTransform:"uppercase",textAlign:"center"}}>
              Enter candidate count & centers<br/>to activate Digital Twin
            </p>
          </div>
        )}

        <svg viewBox={`0 0 ${dims.w} ${dims.h}`} style={{width:"100%",height:"100%",overflow:"visible"}} preserveAspectRatio="xMidYMid meet">
          <defs>
            {MAP_REGIONS.map(r=>(
              <radialGradient key={r.id} id={`rg-${r.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={r.color} stopOpacity=".35"/>
                <stop offset="100%" stopColor={r.color} stopOpacity="0"/>
              </radialGradient>
            ))}
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
          </defs>

          {/* Connections between regions */}
          {MAP_REGIONS.map((r,i)=>MAP_REGIONS.slice(i+1).map((r2,j)=>{
            const isAct=!activeRegionId||(r.id===activeRegionId||r2.id===activeRegionId);
            return(
              <line key={`${r.id}-${r2.id}`}
                x1={px(r.x,"x")} y1={px(r.y,"y")} x2={px(r2.x,"x")} y2={px(r2.y,"y")}
                stroke={isAct?r.color:theme.textFaint} strokeWidth={isAct?.6:.2}
                strokeDasharray="4 8" opacity={isAct?.22:.06} style={{transition:"all .5s"}}/>
            );
          }))}

          {/* Flow pulses */}
          {candidateNum>0&&flowPulses.map(fp=>{
            const f=MAP_REGIONS[fp.fi],t=MAP_REGIONS[fp.ti];
            const x=lerp(px(f.x,"x"),px(t.x,"x"),fp.t);
            const y=lerp(px(f.y,"y"),px(t.y,"y"),fp.t);
            const op=Math.sin(fp.t*Math.PI)*(isRunning?.9:.55);
            return(
              <g key={fp.id}>
                <circle cx={x} cy={y} r={3} fill={fp.color} opacity={op}/>
                {isRunning&&<circle cx={x} cy={y} r={7} fill={fp.color} opacity={op*.15}/>}
              </g>
            );
          })}

          {/* Center nodes */}
          {candidateNum>0&&allCenters.map(center=>{
            const region=regionData.find(r=>r.id===center.regionId);
            const isActive=!activeRegionId||center.regionId===activeRegionId||
              (config.regions==="national");
            const col=MAP_REGIONS.find(r=>r.id===center.regionId)?.color||theme.gold;
            const isRisk=center.risk&&isRunning;
            const isBackup=center.backup;
            const cx=px(center.x,"x"),cy=px(center.y,"y");
            return(
              <g key={center.id} opacity={isActive?1:.2} style={{transition:"opacity .5s"}}>
                {isRisk&&(
                  <circle cx={cx} cy={cy} r={14} fill="none" stroke={theme.crimson} strokeWidth=".8" opacity=".5">
                    <animate attributeName="r" values="10;18;10" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values=".5;.1;.5" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                )}
                {isBackup&&(
                  <circle cx={cx} cy={cy} r={10} fill="none" stroke="#2EBFB0" strokeWidth=".7" strokeDasharray="2 3" opacity=".6"/>
                )}
                <circle cx={cx} cy={cy} r={isRisk?5:isBackup?4.5:3.5}
                  fill={isRisk?theme.crimson:isBackup?"#2EBFB0":col}
                  stroke={isRisk?theme.crimson:col} strokeWidth=".7"
                  opacity={isActive?1:.3}/>
                {(isRisk||isBackup)&&(
                  <text x={cx+8} y={cy+4} fontSize="7" fill={isRisk?theme.crimson:"#2EBFB0"}
                    style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>{center.id}</text>
                )}
              </g>
            );
          })}

          {/* Region nodes */}
          {regionData.map((r,i)=>{
            const isAct=!activeRegionId||r.id===activeRegionId;
            const rSize=candidateNum?Math.max(28,Math.min(52,weights[i]*180)):20;
            const cx=px(r.x,"x"),cy=px(r.y,"y");
            const util=r.utilization;
            const utilColor=util>90?theme.crimson:util>75?theme.gold:"#2EBFB0";
            return(
              <g key={r.id} opacity={isAct?1:.22} style={{transition:"all .5s"}}>
                {/* Coverage glow */}
                {candidateNum>0&&<circle cx={cx} cy={cy} r={rSize*2.2} fill={`url(#rg-${r.id})`} opacity={isRunning?.7:.4}>
                  {isRunning&&<animate attributeName="r" values={`${rSize*1.8};${rSize*2.6};${rSize*1.8}`} dur="3s" repeatCount="indefinite"/>}
                </circle>}
                {/* Node */}
                <circle cx={cx} cy={cy} r={rSize*.6}
                  fill={`rgba(${h2r(r.color)},${candidateNum?.22:.1})`}
                  stroke={r.color} strokeWidth={isAct?1.8:0.6} style={{transition:"all .4s"}}/>
                {/* Region name */}
                <text x={cx} y={cy-rSize*.6-8} textAnchor="middle" fontSize="9"
                  fill={r.color} style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,letterSpacing:"0.04em"}}>
                  {r.name}
                </text>
                {/* Candidate count */}
                {candidateNum>0&&(
                  <text x={cx} y={cy+2} textAnchor="middle" dominantBaseline="middle" fontSize="10"
                    fill={r.color} style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>
                    {r.candidates>1000000?(r.candidates/1000000).toFixed(1)+"M":r.candidates>1000?(r.candidates/1000).toFixed(0)+"K":r.candidates}
                  </text>
                )}
                {/* Utilization bar */}
                {candidateNum>0&&centerNum>0&&(
                  <g>
                    <rect x={cx-18} y={cy+rSize*.6+4} width={36} height={3} rx="1.5" fill={theme.textFaint} opacity=".3"/>
                    <motion.rect x={cx-18} y={cy+rSize*.6+4} width={36*util/100} height={3} rx="1.5"
                      fill={utilColor} initial={{width:0}} animate={{width:36*util/100}} transition={{duration:1.2,ease:"easeOut"}}/>
                    <text x={cx} y={cy+rSize*.6+16} textAnchor="middle" fontSize="7.5"
                      fill={utilColor} style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>
                      {util}% util
                    </text>
                  </g>
                )}
                {/* Risk alert */}
                {r.id==="north"&&config.regions!=="southern"&&config.regions!=="western"&&isRunning&&(
                  <g>
                    <circle cx={cx+rSize*.4} cy={cy-rSize*.4} r={7} fill={theme.crimson} opacity=".9">
                      <animate attributeName="opacity" values=".9;.4;.9" dur="1s" repeatCount="indefinite"/>
                    </circle>
                    <text x={cx+rSize*.4} y={cy-rSize*.4+1} textAnchor="middle" dominantBaseline="middle"
                      fontSize="8" fill="#fff" style={{fontFamily:"monospace",fontWeight:700}}>!</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(10,${dims.h-54})`}>
            {[
              {col:theme.crimson,label:"Risk zone",type:"circle"},
              {col:"#2EBFB0",label:"Backup center",type:"dash"},
              {col:theme.gold,label:"Candidate flow",type:"dot"},
            ].map((item,i)=>(
              <g key={item.label} transform={`translate(0,${i*16})`}>
                {item.type==="circle"&&<circle cx="5" cy="5" r="4" fill="none" stroke={item.col} strokeWidth="1"/>}
                {item.type==="dash"&&<line x1="1" y1="5" x2="9" y2="5" stroke={item.col} strokeWidth="1.5" strokeDasharray="2 2"/>}
                {item.type==="dot"&&<circle cx="5" cy="5" r="2.5" fill={item.col}/>}
                <text x="14" y="9" fontSize="7.5" fill={theme.textFaint} style={{fontFamily:"'Space Grotesk',sans-serif"}}>{item.label}</text>
              </g>
            ))}
          </g>
        </svg>

        {/* Twin label */}
        <div style={{position:"absolute",top:10,right:14,fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.18em",textTransform:"uppercase"}}>
          SYS.TWIN · OPERATIONAL MIRROR
        </div>
      </div>

      {/* Region stats row */}
      {candidateNum>0&&(
        <div style={{borderTop:`1px solid ${theme.borderSubtle}`,padding:"12px 20px",display:"flex",gap:8,overflowX:"auto"}}>
          {regionData.map((r,i)=>{
            const isAct=!activeRegionId||r.id===activeRegionId;
            const utilColor=r.utilization>90?theme.crimson:r.utilization>75?theme.gold:"#2EBFB0";
            return(
              <div key={r.id} style={{flexShrink:0,padding:"8px 12px",border:`1px solid ${isAct?r.color+"33":theme.borderSubtle}`,
                borderRadius:7,background:isAct?`rgba(${h2r(r.color)},.05)`:"transparent",
                minWidth:90,transition:"all .4s",opacity:isAct?1:.35}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:r.color,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,marginBottom:5}}>{r.name}</div>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:17,fontWeight:700,color:theme.text,lineHeight:1}}>
                  {r.candidates>0?r.candidates.toLocaleString():"—"}
                </div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,color:theme.textFaint,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>candidates</div>
                {centerNum>0&&(
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:utilColor,fontWeight:700,marginTop:5}}>{r.utilization}% util</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 3 — AGENT COLLABORATION + REASONING
══════════════════════════════════════════════════════════ */
const EXECUTION_STEPS = [
  {
    agent:"Risk", icon:"⬡", color:"#BF8C2C",
    phase:"Threat Detection",
    trigger:"Candidate density in North Region exceeds 840 per center (threshold: 720)",
    dataUsed:["Infrastructure signal scan: 340 sources","Weather API: Zone 7 anomaly — 2.4h window","Historical incident database: 2019 monsoon match"],
    reasoning:"Center C-142 projected at 127% capacity during peak ingress (08:30–09:15). Historical data shows 2019 pattern match at 94% confidence. Escalating to Allocation Agent with time-sensitive flag.",
    outputs:[
      "Zone 7 weather anomaly confirmed · 2.4h response window",
      "Center C-142 at 127% projected capacity — North Region",
      "3 centers flagged · risk threshold exceeded",
      "Escalating to Allocation & Intelligence agents",
    ],
    duration:1400,
  },
  {
    agent:"Intelligence", icon:"◬", color:"#7C6FE8",
    phase:"Impact Assessment",
    trigger:"Risk Agent signal received: C-142 overage + Zone 7 weather window",
    dataUsed:["Risk telemetry: 3 centers flagged","Candidate manifest: 12,400 affected","Alternate center capacity DB: 6 viable options"],
    reasoning:"Cross-referencing candidate postcodes against alternate center proximity. Centers C-301, C-302, C-303 collectively absorb 12,400 candidates within 18km travel radius. Protocol Delta applicable — 97% confidence threshold met.",
    outputs:[
      "12,400 candidates identified in affected postcode clusters",
      "6 viable alternate centers — combined capacity: 14,800",
      "Protocol Delta applicable · 97% confidence",
      "Recommending Allocation Agent execute reallocation",
    ],
    duration:1600,
  },
  {
    agent:"Allocation", icon:"◈", color:"#C4002B",
    phase:"Resource Optimization",
    trigger:"Intelligence mandate: reallocate 12,400 candidates across 4 centers",
    dataUsed:["Center capacity DB: real-time occupancy","847 proctor availability roster","Transport API: 6 regional operators"],
    reasoning:"Optimal assignment computed via Hungarian algorithm over 4,820×12,400 matrix. C-B12 backup node confirmed — 2,300 candidate capacity at 96% alignment. 847 proctors redistributed with zero overlap conflicts.",
    outputs:[
      "847 proctors redistributed across 12 centers",
      "Transport routes confirmed · 98.2% candidate coverage",
      "Backup node C-B12 activated · 2,300-candidate capacity",
      "Center load: C-301: 94%, C-302: 91%, C-303: 88%, C-B12: 96%",
    ],
    duration:1400,
  },
  {
    agent:"Operations", icon:"⟁", color:"#E8A0B0",
    phase:"Execution Sequencing",
    trigger:"Allocation mandate received: 48 dependent tasks to sequence",
    dataUsed:["Staff reassignment matrix: 847 proctors","Logistics chain: 6 operators, 12 zones","SLA compliance thresholds: 99.0% minimum"],
    reasoning:"DAG solver resolves 48 task dependencies with zero circular conflicts. Critical path: staff transport → center unlock → equipment check → candidate ingress. SLA at 99.4% — above minimum threshold. Execution authorized.",
    outputs:[
      "48 task chains resolved · zero dependency conflicts",
      "Staff reassignment confirmed across 12 zones",
      "Critical path: 6.2s to full operational readiness",
      "SLA compliance: 99.4% · Execution authorized",
    ],
    duration:1300,
  },
  {
    agent:"Comm", icon:"◫", color:"#2EBFB0",
    phase:"Stakeholder Dispatch",
    trigger:"Operations clearance: 6.2s to readiness · dispatch authorized",
    dataUsed:["Candidate contact DB: 12,400 mobile numbers","94 center coordinator contacts","Media advisory template: Protocol Delta"],
    reasoning:"SMS batched by telecom operator for simultaneous delivery. Coordinator briefing via secure channel includes revised center assignments, expected candidate volumes per gate, and 30-minute buffer instructions. 99.1% delivery rate achieved.",
    outputs:[
      "12,400 candidate SMS notifications dispatched",
      "94 center coordinators briefed via secure channel",
      "Media advisory issued · Protocol Delta public statement",
      "Delivery confirmation: 99.1% · Incident closed",
    ],
    duration:1100,
  },
];

function AgentReasoningPanel({theme,isDark,runningStep,completedSteps,streamLines,isRunning,isDone}){
  const scrollRef=useRef();
  useEffect(()=>{
    if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;
  },[streamLines]);

  const showEmpty=runningStep<0&&completedSteps.length===0&&!isDone;

  return(
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5,delay:.5}}
      style={{border:`1px solid ${isRunning?theme.crimson+"44":isDone?"#2EBFB044":theme.borderSubtle}`,borderRadius:14,
        background:theme.surface,backdropFilter:"blur(24px)",overflow:"hidden",transition:"border-color .5s"}}>

      <div style={{padding:"16px 22px",borderBottom:`1px solid ${theme.borderSubtle}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:`rgba(${h2r("#7C6FE8")},.03)`}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:14,height:1.5,background:"#7C6FE8"}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:"#7C6FE8",letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:500}}>Step 3 · Agent Collaboration · Reasoning</span>
        </div>
        {(isRunning||isDone)&&(
          <motion.div animate={isRunning?{opacity:[1,.2,1]}:{}} transition={{duration:1.3,repeat:isRunning?Infinity:0}}
            style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:isRunning?theme.crimson:"#2EBFB0"}}/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:isRunning?theme.crimson:"#2EBFB0",letterSpacing:"0.12em"}}>{isRunning?"EXECUTING":"COMPLETE"}</span>
          </motion.div>
        )}
      </div>

      <div style={{padding:"18px 22px"}}>
        {showEmpty?(
          <div style={{minHeight:320,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
            <div style={{fontSize:24,color:theme.textFaint,fontFamily:"monospace"}}>◬</div>
            <p style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",textAlign:"center"}}>
              Awaiting orchestration launch<br/>Agent reasoning activates on start
            </p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* Phase timeline */}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {EXECUTION_STEPS.map((step,i)=>{
                const isAct=runningStep===i;
                const done=completedSteps.includes(i);
                const pend=!isAct&&!done;
                return(
                  <motion.div key={step.agent} animate={{opacity:pend?.25:1}}
                    style={{padding:"12px 14px",borderLeft:`2.5px solid ${done||isAct?step.color:"transparent"}`,
                      borderRadius:"0 8px 8px 0",background:isAct?`rgba(${h2r(step.color)},.07)`:done?`rgba(${h2r(step.color)},.03)`:"transparent",
                      transition:"all .3s"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
                        border:`1.5px solid ${done||isAct?step.color:theme.textFaint}`,
                        background:done?`rgba(${h2r(step.color)},.15)`:"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,color:done||isAct?step.color:theme.textFaint}}>
                        {done?"✓":isAct?(<motion.span animate={{opacity:[1,.3,1]}} transition={{duration:.8,repeat:Infinity}}>{step.icon}</motion.span>):step.icon}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,fontWeight:700,color:step.color,letterSpacing:"0.1em",textTransform:"uppercase"}}>{step.agent}</span>
                          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint}}>{step.phase}</span>
                          {isAct&&<motion.span animate={{opacity:[0,1,0]}} transition={{duration:1,repeat:Infinity}}
                            style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,color:step.color,background:`rgba(${h2r(step.color)},.10)`,padding:"1px 5px",borderRadius:3}}>PROCESSING</motion.span>}
                          {done&&<span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,color:step.color}}>✓ DONE</span>}
                        </div>
                        {/* Trigger */}
                        {(isAct||done)&&(
                          <div style={{marginBottom:6}}>
                            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>Triggered by</div>
                            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:theme.textMuted,fontWeight:300,lineHeight:1.5,fontStyle:"italic"}}>"{step.trigger}"</div>
                          </div>
                        )}
                        {/* Reasoning */}
                        {(isAct||done)&&(
                          <div style={{marginBottom:6}}>
                            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:step.color,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>Agent Reasoning</div>
                            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11.5,color:theme.text,fontWeight:300,lineHeight:1.6,
                              padding:"8px 11px",background:`rgba(${h2r(step.color)},.05)`,borderRadius:6,
                              borderLeft:`2px solid ${step.color}44`}}>
                              {step.reasoning}
                            </div>
                          </div>
                        )}
                        {/* Data used */}
                        {(isAct||done)&&(
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
                            {step.dataUsed.map((d,di)=>(
                              <span key={di} style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:step.color,
                                background:`rgba(${h2r(step.color)},.08)`,border:`1px solid ${step.color}22`,
                                padding:"2px 7px",borderRadius:3,letterSpacing:"0.04em"}}>
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Live output */}
            {streamLines.length>0&&(
              <div style={{borderTop:`1px solid ${theme.borderSubtle}`,paddingTop:12,marginTop:4}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>Live Agent Output</div>
                <div ref={scrollRef} style={{maxHeight:140,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
                  {streamLines.map((line,i)=>(
                    <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{duration:.18}}
                      style={{display:"flex",gap:8,padding:"4px 8px",borderRadius:4,
                        background:i===streamLines.length-1?`rgba(${h2r(line.color)},.06)`:"transparent",
                        borderLeft:i===streamLines.length-1?`2px solid ${line.color}`:"2px solid transparent"}}>
                      <span style={{fontSize:9,color:line.color,flexShrink:0,fontFamily:"monospace",lineHeight:"16px"}}>{line.icon}</span>
                      <span style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:theme.textMuted,fontWeight:300,lineHeight:1.45}}>{line.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 4 — DECISION INTELLIGENCE
   Every recommendation has: Summary, Reasoning, Action, Outcome
══════════════════════════════════════════════════════════ */
function DecisionIntelligence({theme,isDone,config}){
  const [expanded,setExpanded]=useState(null);

  const candidateCount=config.candidateCount||"2,300,000";
  const centerStr=config.centers||"4,820";
  const region=REGION_OPTIONS.find(r=>r.value===config.regions)?.label||"National";

  const recommendations=useMemo(()=>[
    {
      id:"rec-1",
      type:"CRITICAL REALLOCATION",typeColor:"#C4002B",
      agent:"Risk + Intelligence",agents:["Risk","Intelligence"],
      icon:"◈",confidence:97,affectedCandidates:12400,affectedCenters:4,affectedRegion:"North Region",
      title:"Redistribute 12,400 candidates — Center C-142 capacity breach imminent",
      summary:`Center C-142 in North Region is projected to reach 127% occupancy at peak ingress (08:30–09:15). At current allocation, 12,400 candidates face center overcrowding, queue times exceeding 45 minutes, and potential examination delay.`,
      reasoning:`Risk Agent detected abnormal density concentration: North Region allocated ${Math.round(parseInt(candidateCount.replace(/,/g,""))*0.28/1000)}K candidates across only ${Math.round(parseInt(centerStr.replace(/,/g,""))*0.28)} centers, yielding 840 per center against a safe threshold of 720. Zone 7 weather anomaly compresses the ingress window from 90 to 64 minutes, amplifying the risk. Intelligence Agent matched this pattern to the 2019 monsoon incident (94% historical confidence) and identified C-301, C-302, C-303, and backup C-B12 as viable alternate centers within 18km of all affected candidates.`,
      action:"Reallocate 12,400 candidates across centers C-301 (3,200), C-302 (3,800), C-303 (2,900), C-B12 (2,500). Reroute 847 proctors accordingly. Issue travel advisories to all affected candidates via SMS.",
      outcomes:[
        {metric:"C-142 utilization",before:"127%",after:"72%",delta:"↓55pp"},
        {metric:"Avg queue wait",before:"47 min",after:"12 min",delta:"↓74%"},
        {metric:"Avg travel distance",before:"31km",after:"24km",delta:"↓23%"},
        {metric:"Risk score (North)",before:"89/100",after:"22/100",delta:"↓75%"},
      ],
    },
    {
      id:"rec-2",
      type:"RISK MITIGATION",typeColor:"#BF8C2C",
      agent:"Risk",agents:["Risk"],
      icon:"⬡",confidence:89,affectedCandidates:6200,affectedCenters:3,affectedRegion:"East Region",
      title:"Pre-empt NH-48 traffic gridlock — reroute 3 East Region corridors",
      summary:`Traffic density models predict gridlock on NH-48 approaching centers C-201 and C-202 within 90 minutes. 6,200 candidates on standard routes will face 35–55 minute delays, risking late arrival and examination disqualification.`,
      reasoning:`Risk Agent cross-referenced real-time traffic API against candidate travel routes using origin postcode clustering. NH-48 shows 2.3× baseline congestion — consistent with festival-week patterns in 7 of 8 prior years. Ring Road East alternative reduces predicted travel time by 14% (28min vs 33min average) and bypasses the gridlock zone entirely. 3 examination centers affected: C-201 (2,100 candidates), C-202 (2,600 candidates), C-203 (1,500 candidates).`,
      action:"Issue Ring Road East routing advisory to 6,200 candidates via SMS 90 minutes before arrival window. Coordinate with traffic authority for NH-48 signal timing adjustment. Station 3 field coordinators at Ring Road East junction.",
      outcomes:[
        {metric:"On-time arrival rate",before:"71%",after:"94%",delta:"↑32%"},
        {metric:"Avg travel time",before:"33 min",after:"28 min",delta:"↓15%"},
        {metric:"Late arrival risk",before:"High",after:"Low",delta:"↓76%"},
        {metric:"Candidate NPS impact",before:"Negative",after:"Neutral",delta:"+18pts"},
      ],
    },
    {
      id:"rec-3",
      type:"OPTIMIZATION",typeColor:"#2EBFB0",
      agent:"Allocation + Intelligence",agents:["Allocation","Intelligence"],
      icon:"◬",confidence:94,affectedCandidates:parseInt(candidateCount.replace(/,/g,""))||2300000,affectedCenters:parseInt(centerStr.replace(/,/g,""))||4820,affectedRegion:`${region} (all)`,
      title:`Rebalance proctor distribution — lift coverage from 81% to 99.4% at zero additional cost`,
      summary:`Current proctor distribution has 147 proctors underutilized across 8 low-enrollment centers while 12 high-enrollment centers operate below minimum proctor ratio (1:24 vs required 1:20). This creates compliance risk and uneven examination conditions.`,
      reasoning:`Allocation Agent computed proctor utilization matrix across all ${centerStr} centers. 147 proctors currently assigned to centers at <60% enrollment capacity — idle time >3 hours. 12 centers with enrollment >90% of capacity are running at 1:23–1:27 proctor-to-candidate ratio, below CBSE requirement of 1:20. Redistribution closes both gaps simultaneously with no net increase in proctor headcount. Intelligence Agent validated compliance impact: redistributed state lifts proctor coverage score from 81% to 99.4%.`,
      action:`Reassign 147 proctors from 8 under-enrolled centers to 12 over-enrolled centers. Update center assignment sheets and dispatch confirmation SMS to all affected proctors. No additional hiring or cost required.`,
      outcomes:[
        {metric:"Proctor coverage score",before:"81%",after:"99.4%",delta:"↑22%"},
        {metric:"Compliance violations",before:"12 centers",after:"0 centers",delta:"↓100%"},
        {metric:"Proctor idle time",before:"3.2 hrs avg",after:"0.4 hrs avg",delta:"↓88%"},
        {metric:"Additional cost",before:"—",after:"₹0",delta:"No change"},
      ],
    },
  ],[candidateCount,centerStr,region]);

  if(!isDone)return(
    <div style={{minHeight:360,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,padding:24}}>
      <div style={{fontSize:24,color:theme.textFaint,fontFamily:"monospace"}}>◬</div>
      <p style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",textAlign:"center"}}>
        Decision Intelligence activates<br/>after orchestration completes
      </p>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {recommendations.map((rec,i)=>{
        const isOpen=expanded===rec.id;
        return(
          <motion.div key={rec.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.12}}
            style={{border:`1px solid ${rec.typeColor}33`,borderRadius:10,background:`rgba(${h2r(rec.typeColor)},.03)`,
              position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:rec.typeColor,opacity:.7}}/>
            <div style={{padding:"16px 18px 16px 20px"}}>
              {/* Top row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"monospace",fontSize:14,color:rec.typeColor}}>{rec.icon}</span>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:rec.typeColor,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:700,background:`rgba(${h2r(rec.typeColor)},.12)`,padding:"2px 7px",borderRadius:3}}>
                        {rec.type}
                      </span>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint}}>via {rec.agent}</span>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint}}>· {rec.affectedRegion}</span>
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint}}>↑{rec.confidence}% confidence</span>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textMuted}}>{rec.affectedCandidates.toLocaleString()} candidates</span>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textMuted}}>{rec.affectedCenters} centers</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                    style={{padding:"6px 13px",background:rec.typeColor,border:"none",borderRadius:5,
                      color:"#F0EBE1",fontFamily:"'Space Grotesk',sans-serif",fontSize:8,fontWeight:700,
                      letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>
                    Execute →
                  </motion.button>
                  <button onClick={()=>setExpanded(isOpen?null:rec.id)}
                    style={{padding:"6px 10px",background:"transparent",border:`1px solid ${theme.borderSubtle}`,
                      borderRadius:5,color:theme.textMuted,fontFamily:"'Space Grotesk',sans-serif",
                      fontSize:8,cursor:"pointer",transition:"all .2s"}}>
                    {isOpen?"Less":"Details"}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h4 style={{fontFamily:"'Cormorant Garant',serif",fontSize:17,fontWeight:500,color:theme.text,margin:"0 0 8px",lineHeight:1.2}}>{rec.title}</h4>

              {/* Summary */}
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,fontWeight:300,lineHeight:1.65,margin:"0 0 10px"}}>{rec.summary}</p>

              {/* Outcome metrics — always visible */}
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {rec.outcomes.slice(0,2).map((o,oi)=>(
                  <div key={oi} style={{padding:"8px 12px",border:`1px solid ${rec.typeColor}22`,borderRadius:6,background:`rgba(${h2r(rec.typeColor)},.04)`}}>
                    <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:18,fontWeight:700,color:rec.typeColor,lineHeight:1}}>{o.delta}</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:2}}>{o.metric}</div>
                  </div>
                ))}
              </div>

              {/* Expanded */}
              <AnimatePresence>
                {isOpen&&(
                  <motion.div initial={{opacity:0,height:0,marginTop:0}} animate={{opacity:1,height:"auto",marginTop:14}}
                    exit={{opacity:0,height:0,marginTop:0}} transition={{duration:.28}} style={{overflow:"hidden"}}>

                    {/* Reasoning */}
                    <div style={{marginBottom:12}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:rec.typeColor,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,marginBottom:7}}>
                        Why This Decision Was Generated
                      </div>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,fontWeight:300,lineHeight:1.7,
                        padding:"12px 14px",background:`rgba(${h2r(rec.typeColor)},.04)`,borderRadius:7,
                        borderLeft:`2px solid ${rec.typeColor}55`}}>
                        {rec.reasoning}
                      </div>
                    </div>

                    {/* Agents that contributed */}
                    <div style={{marginBottom:12}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Contributing Agents</div>
                      <div style={{display:"flex",gap:6}}>
                        {rec.agents.map(name=>{
                          const a=AGENTS.find(ag=>ag.name===name||ag.agent===name)||AGENTS.find(ag=>ag.id===name.toLowerCase());
                          const col=a?.color||rec.typeColor;
                          return(
                            <span key={name} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",
                              border:`1px solid ${col}33`,borderRadius:5,background:`rgba(${h2r(col)},.08)`,
                              fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:col,fontWeight:600}}>
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action */}
                    <div style={{marginBottom:12}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Recommended Action</div>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.text,fontWeight:300,lineHeight:1.65}}>{rec.action}</div>
                    </div>

                    {/* All outcomes */}
                    <div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Expected Outcomes</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}} className="op-grid-2">
                        {rec.outcomes.map((o,oi)=>(
                          <div key={oi} style={{padding:"10px 12px",border:`1px solid ${rec.typeColor}22`,borderRadius:6,
                            background:`rgba(${h2r(rec.typeColor)},.04)`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>{o.metric}</div>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,color:theme.textMuted,textDecoration:"line-through"}}>{o.before}</span>
                                <span style={{fontSize:8,color:theme.textFaint}}>→</span>
                                <span style={{fontFamily:"'Cormorant Garant',serif",fontSize:14,fontWeight:700,color:theme.text}}>{o.after}</span>
                              </div>
                            </div>
                            <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:20,fontWeight:700,color:rec.typeColor}}>{o.delta}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 5 — MISSION OUTCOME (premium report card)
══════════════════════════════════════════════════════════ */
function MissionOutcome({theme,isDone,config}){
  if(!isDone)return null;
  const name=config.name||"National Examination Operation";
  const candidates=config.candidateCount||"2,300,000";
  const centers=config.centers||"4,820";

  return(
    <motion.div initial={{opacity:0,y:24,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.55,ease:[.22,1,.36,1]}}
      style={{border:`1px solid ${theme.borderGold}`,borderRadius:14,background:`rgba(${h2r(theme.gold)},.04)`,backdropFilter:"blur(24px)",overflow:"hidden",position:"relative"}}>
      <div style={{height:3,background:`linear-gradient(90deg,transparent,${theme.gold},${theme.crimson},${theme.gold},transparent)`}}/>
      <div style={{padding:"28px 30px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:20,height:1.5,background:theme.gold}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.gold,letterSpacing:"0.24em",textTransform:"uppercase",fontWeight:500}}>Step 5 · Mission Outcome · Autonomous Resolution Report</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:20,alignItems:"start",marginBottom:24}} className="op-res-top">
          <div>
            <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(22px,2.8vw,36px)",fontWeight:500,color:theme.text,margin:"0 0 8px",lineHeight:1.1}}>{name}</h2>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:theme.textMuted,fontWeight:300,lineHeight:1.65,margin:0}}>
              Five agents coordinated autonomously. Three disruption scenarios resolved. All {candidates} candidates protected. All {centers} centers operational. Zero human intervention required in the critical decision path.
            </p>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(38px,4vw,56px)",fontWeight:700,color:theme.gold,lineHeight:1}}>6.2s</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:4}}>Full Resolution</div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:22}} className="op-outcome-grid">
          {[
            {label:"Candidates Protected",value:candidates,color:theme.crimson},
            {label:"Centers Coordinated",value:centers,color:theme.gold},
            {label:"Travel Reduction",value:"↓23%",color:"#2EBFB0"},
            {label:"Risk Reduced",value:"↓75%",color:"#7C6FE8"},
            {label:"Capacity Utilization",value:"94%",color:theme.sakura},
            {label:"Backup Coverage",value:"100%",color:"#2EBFB0"},
            {label:"Alert Delivery",value:"99.1%",color:theme.gold},
            {label:"System Confidence",value:"97%",color:theme.crimson},
          ].map((m,i)=>(
            <motion.div key={m.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.1+i*.07}}
              style={{padding:"14px 12px",border:`1px solid ${m.color}22`,borderRadius:8,background:`rgba(${h2r(m.color)},.05)`}}>
              <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(18px,2vw,26px)",fontWeight:700,color:m.color,lineHeight:1,marginBottom:5}}>{m.value}</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Agent badges */}
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
          {EXECUTION_STEPS.map((step,i)=>(
            <motion.div key={step.agent} initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{delay:.2+i*.08}}
              style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:6,
                border:`1px solid ${step.color}33`,background:`rgba(${h2r(step.color)},.08)`}}>
              <span style={{fontFamily:"monospace",fontSize:11,color:step.color}}>{step.icon}</span>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:step.color,fontWeight:600,letterSpacing:"0.05em"}}>{step.agent}</span>
              <span style={{fontSize:9,color:step.color}}>✓</span>
            </motion.div>
          ))}
        </div>

        <div style={{padding:"14px 18px",border:`1px solid ${theme.borderSubtle}`,borderRadius:8,background:theme.glass,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Human equivalent response time</div>
            <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:20,color:theme.textMuted,fontWeight:400}}>4–6 hours</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.gold,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,marginBottom:4}}>OrchestrAI advantage</div>
            <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:24,color:theme.gold,fontWeight:700}}>10,000×</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   LAUNCH PANEL (center column)
══════════════════════════════════════════════════════════ */
function LaunchPanel({theme,isDark,config,onLaunch,isRunning,isDone}){
  const isConfigured=!!(config.name&&config.candidateCount&&config.centers);
  const [hov,setHov]=useState(false);

  return(
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5,delay:.2}}>
      {/* 3D Canvas */}
      <div style={{position:"relative",height:"clamp(260px,28vh,340px)",
        border:`1px solid ${isRunning?theme.crimson+"44":theme.borderSubtle}`,borderRadius:14,overflow:"hidden",
        background:isDark?"rgba(8,4,18,0.7)":"rgba(228,222,212,0.6)",backdropFilter:"blur(20px)",
        transition:"border-color .5s",marginBottom:"clamp(10px,1.4vw,16px)"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:isRunning?`radial-gradient(ellipse at 50% 50%,rgba(${h2r(theme.crimson)},.18) 0%,transparent 65%)`:`radial-gradient(ellipse at 50% 50%,rgba(${h2r(theme.crimson)},.06) 0%,transparent 65%)`,
          transition:"background 1.2s"}}/>
        <CoreScene3D isActive={isRunning}/>
        {isRunning&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%)",
              fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:theme.crimson,
              letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700,whiteSpace:"nowrap",
              background:isDark?"rgba(3,2,8,.8)":"rgba(240,235,225,.88)",backdropFilter:"blur(8px)",
              padding:"4px 13px",borderRadius:20,border:`1px solid ${theme.crimson}33`}}>
            <motion.span animate={{opacity:[1,.3,1]}} transition={{duration:.9,repeat:Infinity}}>● AGENTS EXECUTING</motion.span>
          </motion.div>
        )}
        {isDone&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%)",
              fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:"#2EBFB0",
              letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700,whiteSpace:"nowrap",
              background:isDark?"rgba(3,2,8,.8)":"rgba(240,235,225,.88)",backdropFilter:"blur(8px)",
              padding:"4px 13px",borderRadius:20,border:"1px solid #2EBFB033"}}>
            ✓ ALL AGENTS RESOLVED
          </motion.div>
        )}
      </div>

      {/* Launch control */}
      <motion.div style={{border:`1px solid ${isConfigured?theme.crimson+"33":theme.borderSubtle}`,borderRadius:14,
        background:theme.surface,backdropFilter:"blur(24px)",position:"relative",overflow:"hidden",transition:"border-color .4s"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent,${theme.crimson},${theme.gold},transparent)`,
          opacity:isConfigured?.8:.15,transition:"opacity .4s"}}/>
        <div style={{padding:"20px 22px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:14,height:1.5,background:theme.crimson}}/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.crimson,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:500}}>Launch Control</span>
          </div>

          <h3 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(17px,1.8vw,22px)",fontWeight:500,color:theme.text,margin:"0 0 7px",lineHeight:1.2}}>
            {isDone?"Mission Resolved":isRunning?<span>Agents <em style={{color:theme.gold}}>Executing…</em></span>:<span>Deploy to <em style={{color:theme.crimson}}>Agent Mesh</em></span>}
          </h3>

          <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,fontWeight:300,lineHeight:1.6,margin:"0 0 16px"}}>
            {isDone?"All 5 agents completed coordination. Outcome report generated."
              :isRunning?"5 agents collaborating autonomously — reasoning visible in real time."
              :isConfigured?"Mission configured. Launch to deploy all 5 agents simultaneously."
              :"Complete mission configuration to enable launch."}
          </p>

          {/* Checklist */}
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16}}>
            {[
              {label:"Operation name defined",ok:!!config.name},
              {label:"Candidate count specified",ok:!!config.candidateCount},
              {label:"Centers configured",ok:!!config.centers},
              {label:"Objectives selected",ok:config.objectives.length>0},
            ].map(ch=>(
              <div key={ch.label} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:13,height:13,borderRadius:"50%",flexShrink:0,
                  border:`1px solid ${ch.ok?"#2EBFB0":theme.textFaint}`,
                  background:ch.ok?"rgba(46,191,176,.15)":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}>
                  {ch.ok&&<span style={{fontSize:7,color:"#2EBFB0"}}>✓</span>}
                </div>
                <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,color:ch.ok?theme.text:theme.textFaint,transition:"color .3s"}}>{ch.label}</span>
              </div>
            ))}
          </div>

          {/* Launch button */}
          <motion.button
            onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
            whileHover={isConfigured&&!isRunning?{scale:1.03,boxShadow:`0 14px 48px ${theme.crimsonGlow}`}:{}}
            whileTap={isConfigured&&!isRunning?{scale:.97}:{}}
            onClick={isConfigured&&!isRunning?onLaunch:undefined}
            style={{width:"100%",padding:"15px 22px",
              background:isDone?`rgba(${h2r(theme.gold)},.15)`:isRunning?`rgba(${h2r(theme.crimson)},.35)`:isConfigured?theme.crimson:`rgba(${h2r(theme.crimson)},.12)`,
              border:`1px solid ${isDone?theme.borderGold:isConfigured?"transparent":theme.borderSubtle}`,
              borderRadius:8,color:isDone?theme.gold:"#F0EBE1",
              fontFamily:isDone?"'Space Grotesk',sans-serif":"'Cormorant Garant',serif",
              fontSize:isDone?10:18,fontWeight:isDone?700:600,fontStyle:isDone?"normal":"italic",
              letterSpacing:isDone?"0.16em":"0.02em",textTransform:isDone?"uppercase":"none",
              cursor:isConfigured&&!isRunning?"pointer":"not-allowed",transition:"all .3s",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              position:"relative",overflow:"hidden"}}>
            {hov&&isConfigured&&!isRunning&&(
              <motion.div initial={{x:"-100%",opacity:0}} animate={{x:"200%",opacity:.22}} transition={{duration:.7}}
                style={{position:"absolute",top:0,bottom:0,width:"50%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)",pointerEvents:"none"}}/>
            )}
            {isDone?(<><span>✓</span> Mission Complete — Reset</>)
              :isRunning?(<><motion.span animate={{rotate:360}} transition={{duration:1.2,repeat:Infinity,ease:"linear"}} style={{display:"inline-block",fontFamily:"monospace",fontSize:17}}>⟳</motion.span> Agents Working…</>)
              :(<>⚡ Begin Orchestration</>)}
          </motion.button>
          {isConfigured&&!isRunning&&!isDone&&(
            <p style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textAlign:"center",marginTop:8}}>
              All 5 agents activate simultaneously · ~6.2s resolution
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   ORCHESTRATION HOOK
══════════════════════════════════════════════════════════ */
function useOrchestration(){
  const [isRunning,setIsRunning]=useState(false);
  const [isDone,setIsDone]=useState(false);
  const [runningStep,setRunningStep]=useState(-1);
  const [completedSteps,setCompletedSteps]=useState([]);
  const [streamLines,setStreamLines]=useState([]);

  const launch=useCallback(()=>{
    setIsRunning(true);setIsDone(false);setRunningStep(-1);setCompletedSteps([]);setStreamLines([]);
    let step=0;
    const run=()=>{
      if(step>=EXECUTION_STEPS.length){setRunningStep(-1);setIsRunning(false);setIsDone(true);return;}
      const cur=EXECUTION_STEPS[step];
      setRunningStep(step);
      cur.outputs.forEach((out,oi)=>{
        setTimeout(()=>{setStreamLines(prev=>[...prev.slice(-30),{text:out,color:cur.color,icon:cur.icon}]);},oi*(cur.duration/cur.outputs.length));
      });
      setTimeout(()=>{setCompletedSteps(p=>[...p,step]);step++;run();},cur.duration);
    };
    setTimeout(run,300);
  },[]);

  const reset=useCallback(()=>{setIsRunning(false);setIsDone(false);setRunningStep(-1);setCompletedSteps([]);setStreamLines([]);},[]);

  return{isRunning,isDone,runningStep,completedSteps,streamLines,launch,reset};
}

/* ══════════════════════════════════════════════════════════
   PAGE ROOT
══════════════════════════════════════════════════════════ */
const DEFAULT_CONFIG={name:"",candidateCount:"",centers:"",regions:"national",priority:"HIGH",objectives:[0,2],instructions:""};

export default function OrchestratePage(){
  const [isDark,setIsDark]=useState(()=>{
    try{return localStorage.getItem("orchestrai-theme")!=="light";}catch{return true;}
  });
  const theme=isDark?THEMES.dark:THEMES.light;

  const toggleTheme=useCallback(()=>{
    setIsDark(d=>{const next=!d;try{localStorage.setItem("orchestrai-theme",next?"dark":"light");}catch{}return next;});
  },[]);

  const [config,setConfig]=useState({...DEFAULT_CONFIG});
  const handleConfigChange=useCallback((k,v)=>setConfig(prev=>({...prev,[k]:v})),[]);

  const{isRunning,isDone,runningStep,completedSteps,streamLines,launch,reset}=useOrchestration();

  const handleLaunch=useCallback(()=>{
    if(isDone){reset();setConfig({...DEFAULT_CONFIG});}else{launch();}
  },[isDone,launch,reset]);

  return(
    <>
      <InjectFonts/>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:${theme.bg};color:${theme.text};overflow-x:hidden;transition:background .55s,color .55s}
        ::selection{background:${theme.crimson}50;color:${theme.text}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${theme.crimson}55;border-radius:2px}
        input,textarea,select{background:transparent;color:${theme.text}}
        input::placeholder,textarea::placeholder{color:${theme.textFaint}}

        @media(max-width:1200px){.op-tri{grid-template-columns:1fr .8fr!important}}
        @media(max-width:1000px){.op-tri{grid-template-columns:1fr!important}.op-center{order:-1!important}}
        @media(max-width:900px){
          .op-nav-tabs{display:none!important}
          .op-grid-2{grid-template-columns:1fr!important}
          .op-bottom{grid-template-columns:1fr!important}
          .op-outcome-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:600px){
          .op-outcome-grid{grid-template-columns:1fr 1fr!important}
          .op-res-top{grid-template-columns:1fr!important}
        }
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      <div style={{position:"fixed",inset:0,zIndex:0,background:theme.bgGradient,pointerEvents:"none"}}/>
      <SakuraPetals isDark={isDark}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity:isDark?.02:.012,mixBlendMode:"overlay"}}/>

      <div style={{position:"relative",zIndex:2}}>
        <Nav isDark={isDark} toggleTheme={toggleTheme} theme={theme}/>

        <div style={{paddingTop:58,padding:"58px clamp(14px,3vw,44px) 60px",maxWidth:1600,margin:"0 auto"}}>

          {/* ── HEADER ── */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.7}}
            style={{paddingTop:"clamp(20px,3vw,36px)",paddingBottom:"clamp(18px,2.5vw,26px)",borderBottom:`1px solid ${theme.borderSubtle}`,marginBottom:"clamp(18px,2vw,26px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:22,height:1.5,background:theme.crimson}}/>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,letterSpacing:"0.26em",color:theme.crimson,textTransform:"uppercase",fontWeight:500}}>OrchestrAI · Operation Command</span>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:14,marginBottom:20}}>
              <div>
                <h1 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(32px,4.2vw,56px)",fontWeight:400,lineHeight:1.0,color:theme.text,margin:0}}>
                  Orchestrate <em style={{color:theme.crimson}}>Operation</em>
                </h1>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:theme.textMuted,fontWeight:300,marginTop:7,maxWidth:520,lineHeight:1.65}}>
                  Configure a mission and 5 specialized AI agents coordinate, reason, and resolve — without human bottleneck. Every decision is explained.
                </p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",border:`1px solid ${theme.borderGold}`,borderRadius:8,background:`rgba(${h2r(theme.gold)},.05)`,backdropFilter:"blur(16px)"}}>
                <motion.div animate={{scale:[1,1.3,1]}} transition={{duration:2,repeat:Infinity}}
                  style={{width:7,height:7,borderRadius:"50%",background:isRunning?theme.crimson:isDone?"#2EBFB0":"#2EBFB0"}}/>
                <div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:isRunning?theme.crimson:"#2EBFB0",letterSpacing:"0.14em",fontWeight:700}}>
                    {isRunning?"AGENTS EXECUTING":isDone?"MISSION RESOLVED":"AGENT MESH READY"}
                  </div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.06em"}}>5 agents · reasoning visible</div>
                </div>
              </div>
            </div>

            {/* Status strip */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[
                {label:"Mission Status",value:isDone?"RESOLVED":isRunning?"EXECUTING":config.name?"CONFIGURED":"CONFIGURING",color:isDone?"#2EBFB0":isRunning?theme.crimson:config.name?theme.gold:theme.textMuted},
                {label:"Active Agents",value:isRunning||isDone?"5 / 5":"0 / 5",color:theme.crimson},
                {label:"Decision Transparency",value:"Full Reasoning",color:"#7C6FE8"},
                {label:"Priority",value:config.priority,color:config.priority==="CRITICAL"?theme.crimson:config.priority==="HIGH"?theme.gold:"#2EBFB0"},
              ].map((s,i)=>(
                <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.1+i*.06}}
                  style={{flex:1,minWidth:120,padding:"12px 16px",border:`1px solid ${theme.borderSubtle}`,borderRadius:8,background:theme.glass,backdropFilter:"blur(16px)"}}>
                  <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(18px,2vw,26px)",fontWeight:700,color:s.color,lineHeight:1,marginBottom:4}}>{s.value}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── THREE COLUMN: Builder | Launch | (stack: Twin + Reasoning) ── */}
          <div className="op-tri" style={{display:"grid",gridTemplateColumns:"1fr .65fr 1fr",gap:"clamp(12px,1.6vw,20px)",marginBottom:"clamp(12px,1.6vw,20px)",alignItems:"start"}}>

            {/* LEFT: Mission Builder */}
            <MissionBuilder theme={theme} config={config} onChange={handleConfigChange}/>

            {/* CENTER: 3D + Launch */}
            <div className="op-center">
              <LaunchPanel theme={theme} isDark={isDark} config={config} onLaunch={handleLaunch} isRunning={isRunning} isDone={isDone}/>
            </div>

            {/* RIGHT: Digital Twin stacked above Agent Reasoning */}
            <div style={{display:"flex",flexDirection:"column",gap:"clamp(12px,1.6vw,20px)"}}>
              <DigitalTwinMap theme={theme} isDark={isDark} config={config} isRunning={isRunning} isDone={isDone}/>
            </div>
          </div>

          {/* ── AGENT REASONING (full width) ── */}
          <div style={{marginBottom:"clamp(12px,1.6vw,20px)"}}>
            <AgentReasoningPanel theme={theme} isDark={isDark} runningStep={runningStep}
              completedSteps={completedSteps} streamLines={streamLines} isRunning={isRunning} isDone={isDone}/>
          </div>

          {/* ── DECISION INTELLIGENCE ── */}
          <AnimatePresence>
            {isDone&&(
              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                style={{marginBottom:"clamp(12px,1.6vw,20px)",border:`1px solid ${"#7C6FE8"}44`,borderRadius:14,
                  background:theme.surface,backdropFilter:"blur(24px)",overflow:"hidden"}}>
                <div style={{padding:"16px 22px",borderBottom:`1px solid ${theme.borderSubtle}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:14,height:1.5,background:"#7C6FE8"}}/>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:"#7C6FE8",letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:500}}>Step 4 · Decision Intelligence · 3 Recommendations</span>
                  </div>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:"#7C6FE8",letterSpacing:"0.1em"}}>Click Details to see full agent reasoning</span>
                </div>
                <div style={{padding:"20px 22px"}}>
                  <DecisionIntelligence theme={theme} isDone={isDone} config={config}/>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── MISSION OUTCOME ── */}
          <AnimatePresence>
            {isDone&&(
              <div style={{marginBottom:"clamp(12px,1.6vw,20px)"}}>
                <MissionOutcome theme={theme} isDone={isDone} config={config}/>
              </div>
            )}
          </AnimatePresence>

          {/* ── FOOTER ── */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.8}}
            style={{paddingTop:18,borderTop:`1px solid ${theme.borderSubtle}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <svg width="15" height="15" viewBox="0 0 30 30" fill="none">
                <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none"/>
                <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity=".8"/>
              </svg>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,color:theme.textFaint,letterSpacing:"0.1em"}}>OrchestrAI © 2025 · Orchestration Engine v4.0.0</span>
            </div>
            <div style={{display:"flex",gap:14}}>
              {[["Agent Mesh","READY","#2EBFB0"],["Decision Engine","ONLINE","#7C6FE8"],["Signal Bus","STREAMING",theme.gold]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:c}}/>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}: <span style={{color:c}}>{v}</span></span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}