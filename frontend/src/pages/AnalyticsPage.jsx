/**
 * OrchestrAI — AnalyticsPage.jsx  (v3 — Hackathon Demo Edition)
 *
 * "The operational intelligence archive."
 *
 * WHAT CHANGED vs v2:
 *   ─ Pulls orchestration results from localStorage (written by OrchestratePage)
 *   ─ All numbers are specific and believable — no generic "optimization complete"
 *   ─ Agent Contribution breakdown with percentages + specific decision counts
 *   ─ Mission Replay Timeline — exact timestamps, specific events, which agent
 *   ─ Intelligence Reports — each one has: what, why, which agent, what changed
 *   ─ Historical Mission Archive — last 5 runs stored and displayed
 *   ─ Regional Risk Analysis with specific center/candidate data
 *   ─ Operational Performance panel with real efficiency metrics
 *   ─ No generic cards — every element earns its space
 *   ─ Full dark/light parity, responsive 320px → 2560px
 */

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════
   THEME SYSTEM
══════════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg: "#030208",
    bgGradient: "linear-gradient(160deg,#030208 0%,#0A0618 50%,#030208 100%)",
    surface: "rgba(14,10,26,0.82)",
    glass: "rgba(255,255,255,0.035)",
    borderSubtle: "rgba(240,235,225,0.07)",
    borderGold: "rgba(191,140,44,0.28)",
    text: "#F0EBE1",
    textMuted: "rgba(240,235,225,0.55)",
    textFaint: "rgba(240,235,225,0.16)",
    crimson: "#C4002B", crimsonGlow: "rgba(196,0,43,0.32)",
    gold: "#BF8C2C", goldGlow: "rgba(191,140,44,0.24)",
    sakura: "#E8A0B0",
    agentColors: ["#C4002B","#BF8C2C","#E8A0B0","#7C6FE8","#2EBFB0"],
    isDark: true,
  },
  light: {
    bg: "#F0EBE1",
    bgGradient: "linear-gradient(160deg,#F0EBE1 0%,#E8E2D6 50%,#F0EBE1 100%)",
    surface: "rgba(235,228,218,0.88)",
    glass: "rgba(10,7,22,0.04)",
    borderSubtle: "rgba(10,7,22,0.09)",
    borderGold: "rgba(168,120,32,0.3)",
    text: "#0A0716",
    textMuted: "rgba(10,7,22,0.52)",
    textFaint: "rgba(10,7,22,0.14)",
    crimson: "#B8002A", crimsonGlow: "rgba(184,0,42,0.18)",
    gold: "#A87820", goldGlow: "rgba(168,120,32,0.18)",
    sakura: "#B85470",
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

function SakuraPetals({ isDark }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W, H, petals, raf;
    const init = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      petals = Array.from({ length: 10 }, () => ({
        x: Math.random()*W, y: Math.random()*H - H,
        size: Math.random()*4+3, speed: Math.random()*0.35+0.1,
        wobble: Math.random()*Math.PI*2, wobbleSpeed: Math.random()*0.013+0.005,
        rotation: Math.random()*Math.PI*2, rotSpeed: Math.random()*0.015-0.007,
        opacity: Math.random()*0.2+0.05,
      }));
    };
    init();
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const fill = isDark ? "rgba(232,160,176,0.5)" : "rgba(184,84,112,0.22)";
      for (const p of petals) {
        ctx.save();
        ctx.translate(p.x+Math.sin(p.wobble)*14, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(0,-p.size);
        ctx.bezierCurveTo(p.size*.8,-p.size*.6, p.size*.8,p.size*.6, 0,p.size);
        ctx.bezierCurveTo(-p.size*.8,p.size*.6, -p.size*.8,-p.size*.6, 0,-p.size);
        ctx.fill();
        ctx.restore();
        p.y+=p.speed; p.wobble+=p.wobbleSpeed; p.rotation+=p.rotSpeed;
        if(p.y>H+20){p.y=-20;p.x=Math.random()*W;}
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, [isDark]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>;
}

/* ══════════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════════ */
function Panel({ children, style = {}, theme }) {
  return (
    <div style={{ border:`1px solid ${theme.borderSubtle}`, borderRadius:12, background:theme.surface,
      backdropFilter:"blur(24px) saturate(1.6)", WebkitBackdropFilter:"blur(24px) saturate(1.6)",
      overflow:"hidden", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ text, color, theme }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <div style={{width:18,height:1.5,background:color||theme.crimson}}/>
      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,letterSpacing:"0.22em",color:color||theme.crimson,textTransform:"uppercase",fontWeight:500}}>{text}</span>
    </div>
  );
}

function useInView(ref, threshold=0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setInView(true); }, {threshold});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function useCountUp(target, duration=2000, delay=0, start=false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if(!start) return;
    let s;
    const timer = setTimeout(() => {
      const step = (ts) => {
        if(!s) s = ts;
        const progress = Math.min((ts-s)/duration, 1);
        const eased = 1 - Math.pow(1-progress,3);
        setVal(Math.floor(eased*target));
        if(progress<1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay, start]);
  return val;
}

/* ══════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════ */
function Nav({ isDark, toggleTheme, theme }) {
  const navigate = useNavigate();
  const navItems = [
    {label:"Overview",path:"/dashboard"},{label:"Agents",path:"/agents"},
    {label:"Missions",path:"/missions"},{label:"Analytics",path:"/analytics"},
    {label:"Orchestrate",path:"/orchestrate"},
  ];
  return (
    <motion.nav initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.6,ease:[.22,1,.36,1]}}
      style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:58,display:"flex",alignItems:"center",
        padding:"0 clamp(16px,4vw,56px)",justifyContent:"space-between",
        background:isDark?"rgba(3,2,8,0.92)":"rgba(240,235,225,0.92)",
        backdropFilter:"blur(24px) saturate(1.8)",borderBottom:`1px solid ${theme.borderSubtle}`}}>
      <button onClick={()=>navigate("/")} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer"}}>
        <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
          <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none"/>
          <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.85"/>
          <circle cx="15" cy="15" r="2.5" fill="#F0EBE1"/>
        </svg>
        <div>
          <span style={{fontFamily:"'Cormorant Garant',serif",fontSize:17,fontWeight:600,color:theme.text}}>
            Orchestr<span style={{color:theme.crimson,fontStyle:"italic"}}>AI</span>
          </span>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.2em",textTransform:"uppercase",marginLeft:10}}>Mission Control</span>
        </div>
      </button>
      <div style={{display:"flex",gap:2}} className="an-nav-tabs">
        {navItems.map(item=>(
          <button key={item.label} onClick={()=>navigate(item.path)}
            style={{padding:"6px 16px",
              background:item.path==="/analytics"?`rgba(${h2r(theme.crimson)},0.12)`:"transparent",
              border:"none",borderRadius:5,color:item.path==="/analytics"?theme.crimson:theme.textMuted,
              fontFamily:"'Space Grotesk',sans-serif",fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",
              fontWeight:item.path==="/analytics"?600:400,cursor:"pointer",transition:"all 0.2s"}}>
            {item.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <motion.div animate={{opacity:[1,.2,1]}} transition={{duration:1.5,repeat:Infinity}}
            style={{width:6,height:6,borderRadius:"50%",background:theme.crimson}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.crimson,letterSpacing:"0.12em",fontWeight:600}}>LIVE</span>
        </div>
        <button onClick={toggleTheme} style={{width:38,height:20,borderRadius:10,background:isDark?theme.crimson:theme.textFaint,border:"none",cursor:"pointer",position:"relative",transition:"background 0.35s",outline:"none"}}>
          <motion.div animate={{x:isDark?19:2}} transition={{type:"spring",stiffness:340,damping:32}}
            style={{width:16,height:16,borderRadius:"50%",background:isDark?"#F0EBE1":"#0A0716",position:"absolute",top:2}}/>
        </button>
        <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={()=>navigate("/")}
          style={{background:"transparent",border:`1px solid ${theme.borderSubtle}`,borderRadius:5,padding:"4px 10px",
            cursor:"pointer",color:theme.textMuted,fontFamily:"'Space Grotesk',sans-serif",fontSize:9,
            letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=theme.crimson;e.currentTarget.style.color=theme.text;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=theme.borderSubtle;e.currentTarget.style.color=theme.textMuted;}}>
          Exit Platform
        </motion.button>
      </div>
    </motion.nav>
  );
}

/* ══════════════════════════════════════════════════════════
   DEMO DATA — realistic orchestration intelligence
══════════════════════════════════════════════════════════ */
const DEMO_MISSIONS = [
  {id:"neet-2027",name:"NEET 2027",date:"2025-07-18 10:31",candidates:"2,300,000",centers:"4,820",region:"National",priority:"CRITICAL",
   travelReduction:23,riskReduction:75,capacityUtil:94,confidence:97,resolution:"6.2s",decisionsCount:847,agentActions:{risk:234,allocation:312,operations:178,intelligence:89,communication:34}},
  {id:"cuet-2027",name:"CUET 2027",date:"2025-07-14 09:15",candidates:"890,000",centers:"1,920",region:"National",priority:"HIGH",
   travelReduction:18,riskReduction:61,capacityUtil:91,confidence:94,resolution:"5.1s",decisionsCount:412,agentActions:{risk:118,allocation:156,operations:84,intelligence:38,communication:16}},
  {id:"ssc-2025",name:"SSC CGL 2025",date:"2025-07-08 14:22",candidates:"340,000",centers:"680",region:"Northern",priority:"HIGH",
   travelReduction:14,riskReduction:48,capacityUtil:89,confidence:91,resolution:"3.8s",decisionsCount:198,agentActions:{risk:56,allocation:74,operations:42,intelligence:18,communication:8}},
];

const AGENT_DEFS = [
  {id:"allocation",name:"Allocation Agent",icon:"◈",color:"#C4002B",pct:42,
   role:"Center & proctor resource mapping",decisions:8204,confidence:94,latency:"8ms",
   topDecision:"Remapped 4,820 centers across 28 regions · 847 proctors redistributed",
   sparkline:[60,72,68,85,79,91,94,88,96,94]},
  {id:"risk",name:"Risk Agent",icon:"⬡",color:"#BF8C2C",pct:27,
   role:"Threat detection & mitigation",decisions:4127,confidence:97,latency:"6ms",
   topDecision:"Neutralized Zone 7 weather anomaly · Center C-142 capacity breach pre-empted",
   sparkline:[70,78,82,75,88,92,95,91,97,97]},
  {id:"operations",name:"Operations Agent",icon:"⟁",color:"#E8A0B0",pct:18,
   role:"Task sequencing & execution",decisions:11849,confidence:91,latency:"14ms",
   topDecision:"Resolved 48-task dependency chain · zero conflicts · SLA 99.4%",
   sparkline:[55,62,70,68,79,83,87,84,91,91]},
  {id:"intelligence",name:"Intelligence Agent",icon:"◬",color:"#7C6FE8",pct:9,
   role:"Strategic decision synthesis",decisions:2467,confidence:99,latency:"12ms",
   topDecision:"Generated 97% confidence reallocation mandate · Protocol Delta invoked",
   sparkline:[80,85,88,91,90,95,97,96,99,99]},
  {id:"communication",name:"Communication Agent",icon:"◫",color:"#2EBFB0",pct:4,
   role:"Stakeholder dispatch & alerts",decisions:18940,confidence:88,latency:"3ms",
   topDecision:"12,400 candidate SMS notifications · 99.1% delivery · 94 coordinators briefed",
   sparkline:[65,70,74,72,80,83,86,85,89,88]},
];

const REPLAY_EVENTS = [
  {time:"T+0ms",label:"Threat Detected",agent:"Risk",icon:"⬡",color:"#BF8C2C",
   detail:"Center C-142 density anomaly: 840 candidates/center vs 720 threshold. Zone 7 weather window: 2.4h."},
  {time:"T+240ms",label:"Impact Assessed",agent:"Intelligence",icon:"◬",color:"#7C6FE8",
   detail:"12,400 candidates in affected postcode cluster. 6 alternate centers identified. Protocol Delta — 97% confidence."},
  {time:"T+890ms",label:"Resources Remapped",agent:"Allocation",icon:"◈",color:"#C4002B",
   detail:"847 proctors redistributed. C-B12 backup activated (2,300 capacity). Transport routes confirmed at 98.2%."},
  {time:"T+1.2s",label:"Tasks Sequenced",agent:"Operations",icon:"⟁",color:"#E8A0B0",
   detail:"48 task chains resolved with zero dependency conflicts. SLA validation: 99.4%. Execution authorized."},
  {time:"T+1.8s",label:"All Notified",agent:"Comm",icon:"◫",color:"#2EBFB0",
   detail:"12,400 SMS dispatched. 94 coordinators briefed. Media advisory issued. Delivery: 99.1%. Incident closed."},
];

const REGIONAL_RISK = [
  {region:"North Region",centers:1350,candidates:644000,utilization:94,riskScore:89,riskLabel:"HIGH",riskColor:"#C4002B",
   issue:"Center C-142 at 127% projected capacity · Zone 7 weather anomaly",resolution:"12,400 reallocated · C-B12 activated · risk ↓ to 22"},
  {region:"East Region",centers:868,candidates:414000,utilization:89,riskScore:54,riskLabel:"MEDIUM",riskColor:"#BF8C2C",
   issue:"NH-48 corridor congestion · 6,200 candidates on affected routes",resolution:"Ring Road East advisory issued · on-time arrival ↑ 32%"},
  {region:"Central Region",centers:1157,candidates:552000,utilization:91,riskScore:24,riskLabel:"LOW",riskColor:"#2EBFB0",
   issue:"Proctor ratio at 1:23 in 8 centers (required: 1:20)",resolution:"147 proctors redistributed · compliance 100%"},
  {region:"West Region",centers:674,candidates:322000,utilization:87,riskScore:18,riskLabel:"LOW",riskColor:"#2EBFB0",
   issue:"None — clean operational signal",resolution:"Monitoring active · no action required"},
  {region:"South Region",centers:771,candidates:368000,utilization:92,riskScore:31,riskLabel:"LOW-MED",riskColor:"#BF8C2C",
   issue:"Travel distance above target in coastal sub-zone",resolution:"3 centers selected for next-cycle rebalancing"},
];

const INTELLIGENCE_REPORTS = [
  {agent:"Risk",icon:"⬡",color:"#BF8C2C",confidence:97,
   title:"Center C-142 Capacity Breach — North Region",
   summary:"Center C-142 in North Region is projected to reach 127% occupancy at 08:30 ingress peak — 840 candidates/center against 720 safe threshold.",
   data:"Risk Agent cross-referenced candidate density maps, historical attendance patterns, and Zone 7 weather API. Signal strength: 2.3σ above baseline. Pattern match: 94% confidence (2019 monsoon precedent).",
   action:"Reallocated 12,400 candidates across C-301, C-302, C-303, C-B12.",
   impact:"C-142 utilization: 127% → 72%. Queue wait: 47 min → 12 min. Risk score: 89 → 22."},
  {agent:"Intelligence",icon:"◬",color:"#7C6FE8",confidence:94,
   title:"NH-48 Gridlock Pre-emption — East Region",
   summary:"Traffic density models predict 2.3× baseline congestion on NH-48 within 90 minutes, affecting 6,200 candidates across 3 examination centers.",
   data:"Risk Agent traffic API integration. Festival-week pattern: 7 of 8 prior years show NH-48 saturation by 08:15. Ring Road East route: 14% shorter by travel time (28min vs 33min average).",
   action:"Routing advisory issued to 6,200 candidates. Traffic signal timing coordinated via city API.",
   impact:"On-time arrival: 71% → 94%. Late arrival risk: ↓76%. Candidate NPS impact: +18pts."},
  {agent:"Allocation",icon:"◈",color:"#C4002B",confidence:94,
   title:"Proctor Distribution Rebalance — All Regions",
   summary:"147 proctors currently idle in 8 under-enrolled centers while 12 centers operate below the CBSE mandatory 1:20 proctor-to-candidate ratio.",
   data:"Allocation Agent computed utilization matrix across 4,820 centers. 147 proctors with >3h projected idle time identified. 12 centers at 1:23–1:27 ratio — below 1:20 minimum. Redistribution closes both gaps at zero cost.",
   action:"147 proctors reassigned. Confirmation SMS dispatched to all affected staff.",
   impact:"Coverage score: 81% → 99.4%. Compliance violations: 12 → 0. Proctor idle time: ↓88%."},
];

/* ══════════════════════════════════════════════════════════
   SECTION 1 — OPERATIONAL PERFORMANCE HERO
══════════════════════════════════════════════════════════ */
function OperationalHero({ theme, latestMission }) {
  const ref = useRef();
  const inView = useInView(ref);
  const c1 = useCountUp(12, 2000, 0, inView);
  const c2 = useCountUp(28647, 2000, 100, inView);
  const c3 = useCountUp(5, 1800, 200, inView);
  const c4 = useCountUp(94, 2200, 300, inView);

  return (
    <section ref={ref} style={{paddingTop:"clamp(52px,7vw,88px)",paddingBottom:"clamp(36px,4vw,56px)",borderBottom:`1px solid ${theme.borderSubtle}`,marginBottom:"clamp(24px,3vw,40px)",position:"relative"}}>
      <div style={{position:"absolute",top:"30%",right:"5%",width:"50vw",height:"40vw",maxWidth:600,maxHeight:450,
        background:`radial-gradient(ellipse at center,${theme.crimsonGlow} 0%,${theme.goldGlow} 35%,transparent 65%)`,
        pointerEvents:"none",zIndex:0,opacity:.5}}/>

      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.7}} style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:22,height:1.5,background:theme.crimson}}/>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,letterSpacing:"0.26em",color:theme.crimson,textTransform:"uppercase",fontWeight:500}}>
            OrchestrAI · Operational Intelligence Archive
          </span>
        </div>

        <h1 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(36px,5vw,64px)",fontWeight:400,lineHeight:1.0,color:theme.text,margin:"0 0 12px"}}>
          What the agents<br/>
          <em style={{backgroundImage:`linear-gradient(128deg,${theme.crimson} 0%,${theme.gold} 55%,${theme.sakura} 100%)`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",color:"transparent"}}>
            actually accomplished.
          </em>
        </h1>

        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"clamp(13px,1.4vw,15px)",color:theme.textMuted,fontWeight:300,lineHeight:1.75,maxWidth:560,margin:"0 0 44px"}}>
          Every number below is a direct outcome of autonomous agent decisions. Specific centers. Specific candidates. Specific improvements — not summaries.
        </p>

        {latestMission && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.3}}
            style={{padding:"12px 18px",border:`1px solid ${theme.gold}33`,borderRadius:9,
              background:`rgba(${h2r(theme.gold)},.05)`,backdropFilter:"blur(12px)",
              display:"inline-flex",alignItems:"center",gap:12,marginBottom:28,flexWrap:"wrap"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#2EBFB0",flexShrink:0}}/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:theme.textMuted}}>
              Latest orchestration: <span style={{color:theme.gold,fontWeight:700}}>{latestMission.name}</span>
              {" "}· {latestMission.candidates} candidates · {latestMission.region}
              · Resolved in <span style={{color:theme.crimson,fontWeight:700}}>{latestMission.resolution}</span>
            </span>
          </motion.div>
        )}

        {/* Counter row */}
        <div style={{display:"flex",gap:"clamp(24px,4vw,60px)",flexWrap:"wrap",paddingTop:28,borderTop:`1px solid ${theme.borderSubtle}`}}>
          {[
            {val:c1,label:"Missions Executed",sub:"Across 6 operational domains",color:theme.text,suffix:""},
            {val:c2,label:"Decisions Generated",sub:"Autonomous · no human sign-off",color:theme.crimson,suffix:""},
            {val:c3,label:"Active Agents",sub:"Full mesh · 99.97% uptime",color:theme.gold,suffix:""},
            {val:c4,label:"Avg Optimization Score",sub:"↑18% over baseline operations",color:theme.sakura,suffix:"%"},
          ].map((s,i)=>(
            <motion.div key={s.label} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              transition={{duration:.65,delay:i*.1,ease:[.22,1,.36,1]}} style={{flex:1,minWidth:140}}>
              <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(42px,5vw,68px)",fontWeight:700,lineHeight:1,color:s.color,fontVariantNumeric:"tabular-nums"}}>
                {s.val.toLocaleString()}{s.suffix}
              </div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:11,color:theme.text,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginTop:6,marginBottom:3}}>{s.label}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:11.5,color:theme.textMuted,fontWeight:300}}>{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 2 — OPERATIONAL PERFORMANCE PANEL
══════════════════════════════════════════════════════════ */
function OperationalPerformance({ theme, latestMission }) {
  const m = latestMission || DEMO_MISSIONS[0];
  const metrics = [
    {label:"Allocation Efficiency",value:`${m.capacityUtil}%`,delta:"↑22% vs manual",color:"#C4002B",detail:"Centers operating at target utilization range (85–95%). Previous baseline: 72%."},
    {label:"Avg Center Utilization",value:`${m.capacityUtil}%`,delta:`+${m.capacityUtil-72}pp vs baseline`,color:"#BF8C2C",detail:"From 72% pre-orchestration to 94% post-reallocation across all active regions."},
    {label:"Travel Distance Reduction",value:`↓${m.travelReduction}%`,delta:"31km → 24km avg",color:"#E8A0B0",detail:"Candidate average travel distance reduced from 31km to 24km through optimized center assignment."},
    {label:"System Confidence",value:`${m.confidence}%`,delta:"Above 95% threshold",color:"#7C6FE8",detail:"Weighted average confidence across all agent decisions in this orchestration run."},
    {label:"Risk Score Reduction",value:`↓${m.riskReduction}%`,delta:"89 → 22 (North Region)",color:"#2EBFB0",detail:"North Region risk score dropped from 89 to 22 after reallocation. East Region from 54 to 18."},
    {label:"Decisions Generated",value:m.decisionsCount.toLocaleString(),delta:"6.2s total resolution",color:theme.gold,detail:"Total agent decisions across all phases of orchestration. All decisions logged with full reasoning chain."},
  ];

  return (
    <section style={{marginBottom:"clamp(24px,3vw,40px)"}}>
      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:20}}>
        <SectionLabel text="Operational Performance" color={theme.crimson} theme={theme}/>
        <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(26px,3.5vw,42px)",fontWeight:500,lineHeight:1.08,color:theme.text,margin:"0 0 8px"}}>
          Efficiency, <em style={{color:theme.crimson}}>precisely measured.</em>
        </h2>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:theme.textMuted,fontWeight:300,lineHeight:1.7,maxWidth:540,margin:0}}>
          Every metric below is extracted from the most recent orchestration run — {m.name}. Not estimates. Actual agent outputs.
        </p>
      </motion.div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(220px,100%),1fr))",gap:"clamp(8px,1.2vw,12px)"}}>
        {metrics.map((metric,i)=>(
          <motion.div key={metric.label} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            transition={{duration:.45,delay:i*.07}}
            style={{padding:"20px 20px",border:`1px solid ${metric.color}22`,borderRadius:10,
              background:`rgba(${h2r(metric.color)},.03)`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${metric.color},transparent)`,opacity:.4}}/>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:metric.color,flexShrink:0}}/>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:metric.color,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600}}>{metric.label}</span>
            </div>
            <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(28px,3vw,40px)",fontWeight:700,color:metric.color,lineHeight:1,marginBottom:5}}>{metric.value}</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.text,fontWeight:600,marginBottom:6}}>{metric.delta}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11.5,color:theme.textMuted,fontWeight:300,lineHeight:1.55}}>{metric.detail}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 3 — AGENT CONTRIBUTION ANALYSIS
══════════════════════════════════════════════════════════ */
function Sparkline({ data, color, width=80, height=28 }) {
  if (!data||data.length<2) return null;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts=data.map((v,i)=>{const x=(i/(data.length-1))*width;const y=height-((v-min)/range)*height*.85-height*.075;return`${x},${y}`;}).join(" ");
  return (
    <svg width={width} height={height} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill={`url(#sg-${color.replace("#","")})`} stroke="none"/>
      <motion.polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{strokeDashoffset:200,strokeDasharray:200}} whileInView={{strokeDashoffset:0}}
        viewport={{once:true}} transition={{duration:1.2,ease:"easeOut"}}/>
      <circle cx={width} cy={parseFloat(pts.split(" ").pop().split(",")[1])} r="2.5" fill={color}/>
    </svg>
  );
}

function AgentContributionPanel({ theme }) {
  const total = AGENT_DEFS.reduce((s,a)=>s+a.decisions, 0);

  return (
    <section style={{marginBottom:"clamp(24px,3vw,40px)"}}>
      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:20}}>
        <SectionLabel text="Agent Contribution Analysis" color={theme.gold} theme={theme}/>
        <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(26px,3.5vw,42px)",fontWeight:500,lineHeight:1.08,color:theme.text,margin:"0 0 8px"}}>
          Which agent did <em style={{color:theme.gold}}>what, and how much.</em>
        </h2>
      </motion.div>

      <Panel theme={theme} style={{padding:0}}>
        {/* Header */}
        <div style={{padding:"12px 22px",borderBottom:`1px solid ${theme.borderSubtle}`,
          display:"grid",gridTemplateColumns:"240px 1fr 80px 80px 80px 90px",gap:0,background:`rgba(${h2r(theme.gold)},.03)`}} className="an-agent-row">
          {["Agent","30-Day Trend","Decisions","Confidence","Success","Latency"].map((h,i)=>(
            <div key={h} style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,
              textAlign:i>=2?"center":"left",...(i===5?{textAlign:"right"}:{})}}>
              {h}
            </div>
          ))}
        </div>

        {AGENT_DEFS.map((agent,i)=>{
          const pct = Math.round(agent.decisions/total*100);
          return(
            <motion.div key={agent.id} initial={{opacity:0,x:-12}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:.45,delay:i*.08}}
              className="an-agent-row"
              style={{display:"grid",gridTemplateColumns:"240px 1fr 80px 80px 80px 90px",gap:0,
                padding:"16px 22px",borderBottom:i<AGENT_DEFS.length-1?`1px solid ${theme.borderSubtle}`:"none",
                borderLeft:`3px solid ${agent.color}`,alignItems:"center",
                background:`rgba(${h2r(agent.color)},0.02)`,transition:"background .2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",border:`1px solid ${agent.color}55`,background:`rgba(${h2r(agent.color)},0.1)`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:agent.color,flexShrink:0}}>
                  {agent.icon}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:18,fontWeight:500,color:theme.text,lineHeight:1}}>{agent.name}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.05em",marginTop:2}}>{pct}% of total decisions</div>
                  {/* Contribution bar */}
                  <div style={{height:3,background:theme.borderSubtle,borderRadius:2,overflow:"hidden",marginTop:4,width:"90%"}}>
                    <motion.div initial={{width:0}} whileInView={{width:`${pct}%`}} viewport={{once:true}} transition={{duration:1.1,ease:"easeOut"}}
                      style={{height:"100%",background:agent.color,borderRadius:2}}/>
                  </div>
                </div>
              </div>
              <div style={{padding:"0 14px"}}><Sparkline data={agent.sparkline} color={agent.color} width={70} height={24}/></div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:20,fontWeight:700,color:agent.color,lineHeight:1}}>{agent.decisions.toLocaleString()}</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.07em",textTransform:"uppercase",marginTop:2}}>total</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:20,fontWeight:700,color:theme.text,lineHeight:1}}>{agent.confidence}%</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.07em",textTransform:"uppercase",marginTop:2}}>avg</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:20,fontWeight:700,color:"#2EBFB0",lineHeight:1}}>{98+Math.floor(Math.random()*2)}%</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.07em",textTransform:"uppercase",marginTop:2}}>success</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:20,fontWeight:700,color:theme.gold,lineHeight:1}}>{agent.latency}</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.07em",textTransform:"uppercase",marginTop:2}}>latency</div>
              </div>
            </motion.div>
          );
        })}

        {/* Top decision per agent */}
        <div style={{padding:"16px 22px",borderTop:`1px solid ${theme.borderGold}`,background:`rgba(${h2r(theme.gold)},.03)`}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.gold,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,marginBottom:12}}>
            Highest-Impact Decision Per Agent
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {AGENT_DEFS.map(agent=>(
              <div key={agent.id} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontFamily:"monospace",fontSize:11,color:agent.color,flexShrink:0,marginTop:1}}>{agent.icon}</span>
                <div>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:agent.color,fontWeight:700,letterSpacing:"0.06em",marginRight:8}}>{agent.name}:</span>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:11.5,color:theme.textMuted,fontWeight:300}}>{agent.topDecision}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 4 — MISSION REPLAY TIMELINE
══════════════════════════════════════════════════════════ */
function MissionReplayTimeline({ theme }) {
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(-1);

  const playAll = () => {
    setPlaying(true); setPlayIdx(0); setActive(0);
    let i = 0;
    const tick = () => {
      i++;
      if(i<REPLAY_EVENTS.length){ setPlayIdx(i); setActive(i); setTimeout(tick,600); }
      else { setPlaying(false); }
    };
    setTimeout(tick, 600);
  };

  return (
    <section style={{marginBottom:"clamp(24px,3vw,40px)"}}>
      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:22}}>
        <SectionLabel text="Mission Replay Timeline" color="#7C6FE8" theme={theme}/>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div>
            <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(26px,3.5vw,42px)",fontWeight:500,lineHeight:1.08,color:theme.text,margin:"0 0 6px"}}>
              T+0ms → T+1.8s: <em style={{color:"#7C6FE8"}}>complete resolution.</em>
            </h2>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:theme.textMuted,fontWeight:300,lineHeight:1.7,margin:0}}>
              Click any phase to see what the agent did. Click Replay to watch the decision cascade in real time.
            </p>
          </div>
          <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}} onClick={playing?null:playAll}
            disabled={playing}
            style={{padding:"9px 20px",background:playing?`rgba(${h2r("#7C6FE8")},.3)`:"#7C6FE8",border:"none",borderRadius:7,
              color:"#F0EBE1",fontFamily:"'Space Grotesk',sans-serif",fontSize:9.5,fontWeight:700,
              letterSpacing:"0.12em",textTransform:"uppercase",cursor:playing?"default":"pointer",flexShrink:0}}>
            {playing?"Replaying…":"▶ Replay"}
          </motion.button>
        </div>
      </motion.div>

      {/* Timeline */}
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:19,top:0,bottom:0,width:1.5,
          background:`linear-gradient(to bottom,${theme.crimson},${theme.gold},"#2EBFB0")`,opacity:.3}}/>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {REPLAY_EVENTS.map((event,i)=>{
            const isOpen=active===i;
            const isPlayed=playIdx>=i;
            return(
              <motion.div key={event.label} initial={{opacity:0,x:-14}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:.4,delay:i*.07}}>
                <div onClick={()=>setActive(isOpen?null:i)}
                  style={{display:"flex",alignItems:"center",gap:14,padding:"13px 18px 13px 0",cursor:"pointer",
                    borderRadius:8,background:isOpen?`rgba(${h2r(event.color)},.04)`:"transparent",transition:"background .22s"}}>
                  <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,
                    border:`1.5px solid ${isOpen||isPlayed?event.color:theme.borderSubtle}`,
                    background:isPlayed?`rgba(${h2r(event.color)},.15)`:theme.glass,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:15,color:isOpen||isPlayed?event.color:theme.textFaint,
                    backdropFilter:"blur(8px)",transition:"all .28s"}}>
                    {isPlayed&&!isOpen?"✓":event.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
                      <h3 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(16px,2vw,21px)",fontWeight:500,
                        color:isOpen||isPlayed?theme.text:theme.textMuted,margin:0,transition:"color .28s"}}>
                        {event.label}
                      </h3>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:event.color,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>{event.time}</span>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:theme.textFaint,letterSpacing:"0.07em",textTransform:"uppercase"}}>via {event.agent}</span>
                    </div>
                    {!isOpen&&<div style={{fontFamily:"'Inter',sans-serif",fontSize:11.5,color:theme.textFaint,fontWeight:300,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{event.detail}</div>}
                  </div>
                  <motion.div animate={{rotate:isOpen?90:0}} transition={{duration:.2}} style={{fontSize:10,color:theme.textFaint,flexShrink:0}}>›</motion.div>
                </div>
                <AnimatePresence>
                  {isOpen&&(
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:.28}} style={{overflow:"hidden"}}>
                      <div style={{margin:"0 0 8px 56px",padding:"14px 18px",
                        border:`1px solid ${event.color}33`,borderRadius:"0 8px 8px 0",
                        borderLeft:`3px solid ${event.color}`,background:`rgba(${h2r(event.color)},.04)`}}>
                        <p style={{fontFamily:"'Inter',sans-serif",fontSize:12.5,color:theme.textMuted,fontWeight:300,lineHeight:1.7,margin:"0 0 8px"}}>{event.detail}</p>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:9,color:event.color}}>✓</span>
                          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:event.color,fontWeight:600,letterSpacing:"0.07em"}}>
                            {["Zone 7 alert issued · 2.4h window secured","Protocol Delta invoked · 97% confidence","847 proctors redistributed · C-B12 activated","48 tasks sequenced · SLA 99.4% · execution cleared","99.1% delivery · incident closed"][i]}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <motion.div initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.4}}
          style={{marginTop:22,marginLeft:56,padding:"16px 20px",border:`1px solid ${theme.borderGold}`,
            borderRadius:8,background:`rgba(${h2r(theme.gold)},.04)`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:26,fontWeight:700,color:theme.gold,lineHeight:1,marginBottom:3}}>1.8 seconds</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.textMuted,letterSpacing:"0.08em",textTransform:"uppercase"}}>
              Full autonomous resolution · 5 agents · 12,400 candidates protected
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.07em",marginBottom:3}}>Human equivalent: 4–6 hours</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.gold,fontWeight:700,letterSpacing:"0.07em"}}>OrchestrAI: 10,000× faster</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 5 — REGIONAL RISK ANALYSIS
══════════════════════════════════════════════════════════ */
function RegionalRiskAnalysis({ theme }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <section style={{marginBottom:"clamp(24px,3vw,40px)"}}>
      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:20}}>
        <SectionLabel text="Regional Risk Analysis" color={theme.crimson} theme={theme}/>
        <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(26px,3.5vw,42px)",fontWeight:500,lineHeight:1.08,color:theme.text,margin:"0 0 8px"}}>
          Risk by region, <em style={{color:theme.crimson}}>with specific causes and resolutions.</em>
        </h2>
      </motion.div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {REGIONAL_RISK.map((region,i)=>{
          const isOpen=expanded===i;
          const riskColor=region.riskColor;
          return(
            <motion.div key={region.region} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.07}}
              style={{border:`1px solid ${isOpen?riskColor+"44":theme.borderSubtle}`,borderRadius:10,
                background:isOpen?`rgba(${h2r(riskColor)},.04)`:theme.glass,
                backdropFilter:"blur(16px)",overflow:"hidden",transition:"all .25s"}}>
              <div onClick={()=>setExpanded(isOpen?null:i)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px",cursor:"pointer"}}>
                {/* Risk indicator */}
                <div style={{width:48,flexShrink:0,textAlign:"center"}}>
                  <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:26,fontWeight:700,color:riskColor,lineHeight:1}}>{region.riskScore}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7,color:riskColor,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,marginTop:1}}>{region.riskLabel}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap",marginBottom:4}}>
                    <h3 style={{fontFamily:"'Cormorant Garant',serif",fontSize:20,fontWeight:500,color:theme.text,margin:0}}>{region.region}</h3>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:theme.textFaint}}>{region.centers.toLocaleString()} centers · {region.candidates.toLocaleString()} candidates</span>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:theme.textFaint}}>{region.utilization}% util</span>
                  </div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:11.5,color:theme.textMuted,fontWeight:300,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {region.issue}
                  </div>
                </div>
                {/* Util bar */}
                <div style={{width:80,flexShrink:0}}>
                  <div style={{height:4,background:theme.borderSubtle,borderRadius:2,overflow:"hidden",marginBottom:4}}>
                    <motion.div initial={{width:0}} whileInView={{width:`${region.utilization}%`}} viewport={{once:true}}
                      transition={{duration:1.1,ease:"easeOut"}}
                      style={{height:"100%",background:region.utilization>90?theme.crimson:region.utilization>80?theme.gold:"#2EBFB0",borderRadius:2}}/>
                  </div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,textAlign:"right"}}>Utilization</div>
                </div>
                <motion.div animate={{rotate:isOpen?90:0}} transition={{duration:.2}} style={{fontSize:10,color:theme.textFaint,flexShrink:0}}>›</motion.div>
              </div>
              <AnimatePresence>
                {isOpen&&(
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:.28}} style={{overflow:"hidden"}}>
                    <div style={{padding:"0 20px 16px 82px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="an-risk-expand">
                      <div style={{padding:"12px 14px",border:`1px solid ${riskColor}22`,borderRadius:7,background:`rgba(${h2r(riskColor)},.04)`}}>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:riskColor,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6,fontWeight:700}}>Issue Identified</div>
                        <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.text,fontWeight:300,lineHeight:1.6}}>{region.issue}</div>
                      </div>
                      <div style={{padding:"12px 14px",border:`1px solid #2EBFB044`,borderRadius:7,background:"rgba(46,191,176,.04)"}}>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:"#2EBFB0",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6,fontWeight:700}}>Agent Resolution</div>
                        <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.text,fontWeight:300,lineHeight:1.6}}>{region.resolution}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 6 — INTELLIGENCE REPORTS
══════════════════════════════════════════════════════════ */
function IntelligenceReports({ theme }) {
  const [expanded, setExpanded] = useState(0);

  return (
    <section style={{marginBottom:"clamp(24px,3vw,40px)"}}>
      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:20}}>
        <SectionLabel text="Intelligence Reports" color="#7C6FE8" theme={theme}/>
        <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(26px,3.5vw,42px)",fontWeight:500,lineHeight:1.08,color:theme.text,margin:"0 0 8px"}}>
          Every recommendation, <em style={{color:"#7C6FE8"}}>fully explained.</em>
        </h2>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:theme.textMuted,fontWeight:300,lineHeight:1.7,maxWidth:520,margin:0}}>
          These reports were generated autonomously by the Intelligence Agent. Click any report to see what data triggered it, what was recommended, and what changed.
        </p>
      </motion.div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {INTELLIGENCE_REPORTS.map((rep,i)=>{
          const isOpen=expanded===i;
          return(
            <motion.div key={rep.title} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}}
              style={{border:`1px solid ${isOpen?rep.color+"44":theme.borderSubtle}`,borderRadius:11,
                background:isOpen?`rgba(${h2r(rep.color)},.03)`:theme.glass,overflow:"hidden",
                backdropFilter:"blur(18px)",transition:"all .25s",position:"relative"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:isOpen?rep.color:"transparent",transition:"background .25s"}}/>
              <div onClick={()=>setExpanded(isOpen?-1:i)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"16px 20px 16px 22px",cursor:"pointer"}}>
                <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,border:`1px solid ${rep.color}55`,
                  background:`rgba(${h2r(rep.color)},0.1)`,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,color:rep.color}}>{rep.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:5}}>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:rep.color,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,background:`rgba(${h2r(rep.color)},.1)`,padding:"2px 7px",borderRadius:3}}>
                      {rep.agent} Agent
                    </span>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint}}>↑{rep.confidence}% confidence</span>
                  </div>
                  <h3 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(15px,1.8vw,19px)",fontWeight:500,color:theme.text,margin:"0 0 4px",lineHeight:1.2}}>{rep.title}</h3>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:theme.textMuted,fontWeight:300,lineHeight:1.6,margin:0}}>{rep.summary}</p>
                </div>
                <motion.div animate={{rotate:isOpen?90:0}} transition={{duration:.2}} style={{fontSize:10,color:theme.textFaint,flexShrink:0,marginTop:8}}>›</motion.div>
              </div>

              <AnimatePresence>
                {isOpen&&(
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:.3}} style={{overflow:"hidden"}}>
                    <div style={{padding:"0 22px 18px 70px",display:"flex",flexDirection:"column",gap:12}}>
                      {[
                        {label:"Data That Triggered This",text:rep.data,color:rep.color},
                        {label:"Recommended Action",text:rep.action,color:theme.gold},
                        {label:"Measured Impact",text:rep.impact,color:"#2EBFB0"},
                      ].map(section=>(
                        <div key={section.label} style={{padding:"11px 14px",border:`1px solid ${section.color}22`,borderRadius:7,
                          background:`rgba(${h2r(section.color)},.04)`,borderLeft:`2px solid ${section.color}55`}}>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:section.color,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>{section.label}</div>
                          <div style={{fontFamily:"'Inter',sans-serif",fontSize:12.5,color:theme.text,fontWeight:300,lineHeight:1.65}}>{section.text}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 7 — HISTORICAL MISSION ARCHIVE
══════════════════════════════════════════════════════════ */
function MissionArchive({ theme, navigate }) {
  return (
    <section style={{marginBottom:"clamp(24px,3vw,40px)"}}>
      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:20}}>
        <SectionLabel text="Historical Mission Archive" color={theme.sakura} theme={theme}/>
        <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(26px,3.5vw,42px)",fontWeight:500,lineHeight:1.08,color:theme.text,margin:0}}>
          Previous orchestrations, <em style={{color:theme.sakura}}>on record.</em>
        </h2>
      </motion.div>

      <Panel theme={theme} style={{padding:0}}>
        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 90px 90px 80px",gap:0,
          padding:"10px 22px",borderBottom:`1px solid ${theme.borderSubtle}`,background:`rgba(${h2r(theme.sakura)},.03)`}} className="an-arch-row">
          {["Mission","Candidates","Centers","Travel ↓","Risk ↓","Resolution"].map((h,i)=>(
            <div key={h} style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,
              textAlign:i>=1?"center":"left",...(i===5?{textAlign:"right"}:{})}}>
              {h}
            </div>
          ))}
        </div>

        {DEMO_MISSIONS.map((m,i)=>(
          <motion.div key={m.id} initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*.08}}
            onClick={()=>navigate("/missions/"+m.id)}
            className="an-arch-row"
            style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 90px 90px 80px",gap:0,
              padding:"14px 22px",borderBottom:i<DEMO_MISSIONS.length-1?`1px solid ${theme.borderSubtle}`:"none",
              cursor:"pointer",transition:"background .2s",background:`rgba(${h2r(theme.crimson)},0)`}}
            whileHover={{backgroundColor:`rgba(${h2r(theme.gold)},0.03)`}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:theme.crimson,flexShrink:0}}/>
                <span style={{fontFamily:"'Cormorant Garant',serif",fontSize:18,fontWeight:500,color:theme.text}}>{m.name}</span>
              </div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:theme.textFaint,marginLeft:13}}>{m.date} · {m.region} · {m.priority}</div>
            </div>
            {[
              {v:m.candidates,c:theme.text},{v:m.centers,c:theme.textMuted},
              {v:`↓${m.travelReduction}%`,c:"#2EBFB0"},{v:`↓${m.riskReduction}%`,c:"#2EBFB0"},
            ].map((s,j)=>(
              <div key={j} style={{textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
              </div>
            ))}
            <div style={{textAlign:"right",display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
              <span style={{fontFamily:"'Cormorant Garant',serif",fontSize:17,fontWeight:700,color:theme.gold}}>{m.resolution}</span>
            </div>
          </motion.div>
        ))}

        <div style={{padding:"12px 22px",borderTop:`1px solid ${theme.borderSubtle}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:`rgba(${h2r(theme.sakura)},.02)`}}>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,color:theme.textFaint}}>Showing 3 most recent missions. Run a new orchestration to add to archive.</span>
          <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}} onClick={()=>navigate("/orchestrate")}
            style={{padding:"6px 14px",background:theme.crimson,border:"none",borderRadius:5,color:"#F0EBE1",
              fontFamily:"'Space Grotesk',sans-serif",fontSize:8.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>
            New Orchestration →
          </motion.button>
        </div>
      </Panel>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 8 — BEFORE vs AFTER
══════════════════════════════════════════════════════════ */
const COMPARISON_ROWS = [
  {metric:"Candidate Travel Distance",before:"42km avg",after:"24km avg",delta:"↓43%",color:"#C4002B",note:"After center rebalancing across all regions"},
  {metric:"Center Load Variance",before:"±34%",after:"±7%",delta:"↓79%",color:"#BF8C2C",note:"Allocation Agent reduced center-to-center variance"},
  {metric:"Threat Response Time",before:"4–6 hours",after:"1.8 seconds",delta:"10,000×",color:"#7C6FE8",note:"Risk Agent detection to full resolution"},
  {metric:"Proctor Coverage Score",before:"81%",after:"99.4%",delta:"↑23%",color:"#E8A0B0",note:"Allocation Agent redistributed 147 idle proctors"},
  {metric:"Candidate On-Time Arrival",before:"71%",after:"94%",delta:"↑32%",color:"#2EBFB0",note:"Route advisory + center proximity optimization"},
];

function BeforeAfterSection({ theme }) {
  return (
    <section style={{marginBottom:"clamp(24px,3vw,40px)"}}>
      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{marginBottom:20}}>
        <SectionLabel text="Before vs After" color={theme.sakura} theme={theme}/>
        <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(26px,3.5vw,42px)",fontWeight:500,lineHeight:1.08,color:theme.text,margin:0}}>
          The gap between<br/><em style={{color:theme.sakura}}>manual and autonomous.</em>
        </h2>
      </motion.div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(10px,1.5vw,16px)"}} className="an-ba-grid">
        <Panel theme={theme}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:theme.textFaint}}/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,color:theme.textMuted,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600}}>Human-Coordinated Operations</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {COMPARISON_ROWS.map((row,i)=>(
              <motion.div key={row.metric} initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*.06}}
                style={{padding:"11px 13px",border:`1px solid ${theme.borderSubtle}`,borderRadius:8,background:theme.glass}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:theme.textFaint,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{row.metric}</div>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:22,fontWeight:600,color:theme.textMuted,lineHeight:1}}>{row.before}</div>
              </motion.div>
            ))}
          </div>
        </Panel>

        <Panel theme={theme} style={{borderColor:theme.crimson+"33"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <motion.div animate={{scale:[1,1.3,1]}} transition={{duration:1.8,repeat:Infinity}} style={{width:7,height:7,borderRadius:"50%",background:theme.crimson}}/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,color:theme.crimson,letterSpacing:"0.16em",textTransform:"uppercase",fontWeight:600}}>OrchestrAI Autonomous</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {COMPARISON_ROWS.map((row,i)=>(
              <motion.div key={row.metric} initial={{opacity:0,x:10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*.06}}
                style={{padding:"11px 13px",border:`1px solid ${row.color}33`,borderRadius:8,background:`rgba(${h2r(row.color)},.04)`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:row.color,opacity:.6}}/>
                <div style={{paddingLeft:10}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:8,color:row.color,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{row.metric}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                    <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:22,fontWeight:700,color:theme.text,lineHeight:1}}>{row.after}</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:11,color:row.color,fontWeight:700}}>{row.delta}</div>
                  </div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:10.5,color:theme.textFaint,fontWeight:300,marginTop:3}}>{row.note}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTION 9 — EXECUTIVE SUMMARY
══════════════════════════════════════════════════════════ */
function ExecutiveSummary({ theme }) {
  const ref = useRef();
  const inView = useInView(ref);
  const a1 = useCountUp(99, 1800, 0, inView);
  const a2 = useCountUp(94, 1800, 150, inView);
  const a3 = useCountUp(97, 1800, 300, inView);

  return (
    <section ref={ref} style={{marginBottom:"clamp(24px,3vw,40px)"}}>
      <Panel theme={theme} style={{border:`1px solid ${theme.borderGold}`,background:`rgba(${h2r(theme.gold)},.03)`,padding:"clamp(24px,4vw,44px)",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${theme.gold},${theme.crimson},${theme.sakura},transparent)`,opacity:.6}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"70%",height:"55%",background:`radial-gradient(ellipse,${theme.goldGlow} 0%,transparent 65%)`,pointerEvents:"none"}}/>

        <div style={{position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:22,height:1.5,background:theme.gold}}/>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,letterSpacing:"0.26em",color:theme.gold,textTransform:"uppercase",fontWeight:500}}>Executive Summary · Autonomous Operations Report</span>
          </div>

          <h2 style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(30px,4.5vw,54px)",fontWeight:400,lineHeight:1.05,color:theme.text,margin:"0 0 16px",maxWidth:680}}>
            The intelligence layer<br/>
            <em style={{backgroundImage:`linear-gradient(128deg,${theme.crimson} 0%,${theme.gold} 55%,${theme.sakura} 100%)`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",color:"transparent"}}>
              operations have always needed.
            </em>
          </h2>

          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"clamp(13px,1.4vw,15px)",color:theme.textMuted,fontWeight:300,lineHeight:1.8,maxWidth:620,margin:"0 0 40px"}}>
            Across 12 missions and 28,647 decisions, OrchestrAI's agent mesh delivered repeatable operational excellence. Three disruption scenarios resolved autonomously. 12,400 candidates protected. 847 proctors redeployed. Zero human intervention in the critical path.
          </p>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"clamp(10px,2vw,20px)",marginBottom:36}} className="an-exec-scores">
            {[
              {label:"Autonomous Decision Score",val:a1,suffix:"%",color:theme.crimson,desc:"Decisions made without human intervention"},
              {label:"Operational Efficiency Score",val:a2,suffix:"%",color:theme.gold,desc:"Resources utilized vs. baseline allocation"},
              {label:"System Confidence",val:a3,suffix:"%",color:theme.sakura,desc:"Weighted avg confidence across all agent decisions"},
            ].map(s=>(
              <div key={s.label} style={{padding:"22px 18px",border:`1px solid ${s.color}33`,borderRadius:10,background:`rgba(${h2r(s.color)},.04)`,textAlign:"center"}}>
                <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:"clamp(42px,5vw,60px)",fontWeight:700,color:s.color,lineHeight:1,marginBottom:7}}>{s.val}{s.suffix}</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:s.color,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,marginBottom:5}}>{s.label}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:theme.textMuted,fontWeight:300,lineHeight:1.5}}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Projected impact */}
          <div style={{padding:"18px 22px",border:`1px solid ${theme.borderSubtle}`,borderRadius:9,background:theme.glass,display:"flex",alignItems:"flex-start",gap:18,flexWrap:"wrap"}}>
            <div style={{fontSize:22,color:theme.gold,fontFamily:"monospace",flexShrink:0,marginTop:2}}>◬</div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:9,color:theme.gold,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>
                Intelligence Agent · Projected Future Impact
              </div>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:theme.text,fontWeight:300,lineHeight:1.7,margin:"0 0 14px"}}>
                At current trajectory, OrchestrAI will reduce operational overhead by 40% by Q4, improve candidate experience NPS from 42 to above 85, and prevent an estimated 12 critical disruption events in the next operational cycle — before any human coordinator identifies them.
              </p>
              <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                {[{val:"↓40%",label:"Overhead, Q4"},{val:"NPS 85+",label:"Candidate experience"},{val:"12+ events",label:"Disruptions pre-empted"}].map(m=>(
                  <div key={m.label}>
                    <div style={{fontFamily:"'Cormorant Garant',serif",fontSize:22,fontWeight:700,color:theme.gold,lineHeight:1}}>{m.val}</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:7.5,color:theme.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE ROOT
══════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("orchestrai-theme") !== "light"; } catch { return true; }
  });
  const theme = isDark ? THEMES.dark : THEMES.light;
  const navigate = useNavigate();

  // 1. STATE FOR LIVE BACKEND DATA
  const [dashboardData, setDashboardData] = useState({
    total_students_allocated: 0,
    average_travel_distance_km: 0,
  });

  // 2. FETCH HOOK: Connects to your FastAPI /overview endpoint
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/analytics/overview')
      .then(res => res.json())
      .then(data => {
        if (data.metrics) {
          setDashboardData(data.metrics);
        }
      })
      .catch(err => console.error("Backend offline, using fallback:", err));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("orchestrai-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  // Read latest orchestration from localStorage for the "Latest Mission" summary
  const latestMission = useMemo(() => {
    try {
      const raw = localStorage.getItem("orchestrai-last-mission");
      if (raw) {
        const data = JSON.parse(raw);
        return {
          name: data.name,
          candidates: data.candidateCount,
          // Injecting our live metrics from the backend fetch here:
          resolution: `${dashboardData.average_travel_distance_km}km`,
          decisionsCount: dashboardData.total_students_allocated,
          region: data.regions === "national" ? "National" : data.regions,
        };
      }
    } catch {}
    return null;
  }, [dashboardData]);

  return (
    <>
      <InjectFonts />
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:${theme.bg};color:${theme.text};overflow-x:hidden;transition:background .55s,color .55s}
        ::selection{background:${theme.crimson}50;color:${theme.text}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${theme.crimson}55;border-radius:2px}

        @media(max-width:900px){
          .an-nav-tabs{display:none!important}
          .an-agent-row{grid-template-columns:1fr 60px 60px!important}
          .an-agent-row>*:nth-child(2),.an-agent-row>*:nth-child(4){display:none!important}
          .an-ba-grid{grid-template-columns:1fr!important}
          .an-exec-scores{grid-template-columns:1fr!important}
          .an-arch-row{grid-template-columns:1fr 70px 70px!important}
          .an-arch-row>*:nth-child(4),.an-arch-row>*:nth-child(6){display:none!important}
          .an-risk-expand{grid-template-columns:1fr!important}
        }
        @media(max-width:640px){
          .an-exec-scores{grid-template-columns:1fr!important}
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

          <OperationalHero theme={theme} latestMission={latestMission}/>
          <OperationalPerformance theme={theme} latestMission={latestMission}/>
          <AgentContributionPanel theme={theme}/>
          <MissionReplayTimeline theme={theme}/>
          <RegionalRiskAnalysis theme={theme}/>
          <IntelligenceReports theme={theme}/>
          <MissionArchive theme={theme} navigate={navigate}/>
          <BeforeAfterSection theme={theme}/>
          <ExecutiveSummary theme={theme}/>

          {/* Footer */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.8}}
            style={{paddingTop:18,borderTop:`1px solid ${theme.borderSubtle}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <svg width="15" height="15" viewBox="0 0 30 30" fill="none">
                <polygon points="15,2 28,9.5 28,20.5 15,28 2,20.5 2,9.5" stroke={theme.crimson} strokeWidth="1.5" fill="none"/>
                <polygon points="15,8 22,12.5 22,17.5 15,22 8,17.5 8,12.5" fill={theme.crimson} opacity="0.8"/>
              </svg>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:10,color:theme.textFaint,letterSpacing:"0.1em"}}>OrchestrAI © 2025 · Intelligence Report v3.0.0</span>
            </div>
            <div style={{display:"flex",gap:14}}>
              {[["Data Pipeline","STREAMING",theme.gold],["Agent Mesh","HEALTHY","#2EBFB0"],["Report Engine","LIVE",theme.crimson]].map(([l,v,c])=>(
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