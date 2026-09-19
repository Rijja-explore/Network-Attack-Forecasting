import React, { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import {
  Shield, Activity, Zap, Upload, ArrowLeft, FileText,
  LayoutDashboard, History, Settings, Database, Server,
  Clock, AlertTriangle, CheckCircle2, Radio, UserCheck,
  Target, Network, BarChart3, ChevronRight, Terminal,
  Crosshair, TrendingUp, ShieldAlert, Lock, Bot, Send,
  RefreshCw, Play, Square, BrainCircuit, Radar, Flame,
  Sparkles, Layers, GitFork, Eye, Cpu, Globe, Wifi,
  MessageSquare, Users, Hexagon, ScanLine, Microscope,
  Workflow, ChevronDown, Info, TriangleAlert
} from 'lucide-react';
import {
  UploadDropzone, TrafficSummary, AssessmentHero,
  AttackProbabilityChart, FamilyBars, ExplainabilityPanel,
  AttackChainContext, RiskTrajectory, CountermeasuresPanel,
  ZeroDayAnalysisPanel, ExecutiveBriefingPanel, ScenarioSelector,
  AuthModal, FeatureAttributionWaterfall, MitreMatrixNavigator,
  BlastRadiusGraph, WhatIfDefenseSimulator, LiveCaptureStudio,
  ThreatOriginWarMap, LeadTimeThreatRadar, SoarExecutionTerminal,
  SocAiCopilot, PacketHexDissector,
} from './components';
import { API_BASE } from './config';

/* ═══════════════════════════════════════════════
   MATRIX RAIN CANVAS
═══════════════════════════════════════════════ */
function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ∑∆∇⊕⊗∞≈≠';
    const cols = Math.floor(canvas.width / 16);
    const drops = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00F0FF';
      ctx.font = '13px Space Mono, monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.97 ? '#ffffff' : `rgba(0,240,255,${0.3 + Math.random() * 0.4})`;
        ctx.fillText(text, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const id = setInterval(draw, 55);
    return () => { clearInterval(id); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="matrix-canvas" />;
}

/* ═══════════════════════════════════════════════
   WORLD MODEL NEURAL NETWORK CANVAS
═══════════════════════════════════════════════ */
function WorldModelCanvas({ threatLevel = 0.2, active = false }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ nodes: [], edges: [], particles: [], t: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      init();
    };

    const init = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const N = 22;
      stateRef.current.nodes = Array.from({ length: N }, (_, i) => {
        const angle = (i / N) * Math.PI * 2 + Math.random() * 0.4;
        const r = (0.25 + Math.random() * 0.3) * Math.min(W, H);
        const threatened = i / N < threatLevel;
        return {
          x: W / 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 60,
          y: H / 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 2.5 + Math.random() * 3.5,
          type: threatened ? 'threat' : (i % 4 === 0 ? 'gateway' : i % 7 === 0 ? 'server' : 'host'),
          phase: Math.random() * Math.PI * 2,
          freq: 0.02 + Math.random() * 0.035,
        };
      });

      stateRef.current.edges = [];
      stateRef.current.nodes.forEach((n, i) => {
        const conn = 1 + Math.floor(Math.random() * 4);
        for (let c = 0; c < conn; c++) {
          const j = Math.floor(Math.random() * stateRef.current.nodes.length);
          if (j !== i) {
            stateRef.current.edges.push({
              from: i, to: j,
              prog: Math.random(),
              spd: 0.003 + Math.random() * 0.008,
              lit: Math.random() > 0.3,
            });
          }
        }
      });

      stateRef.current.particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
        life: Math.random(),
      }));
    };

    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      stateRef.current.t += 0.01;
      const { nodes, edges, particles, t } = stateRef.current;

      ctx.clearRect(0, 0, W, H);

      // Deep scan concentric rings
      const rings = 3;
      for (let r = rings; r >= 1; r--) {
        const radius = (r / rings) * Math.min(W, H) * 0.42;
        const opacity = 0.03 + (1 - r / rings) * 0.04;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,240,255,${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Rotating scan line
      const scanAngle = t * 0.5;
      const grad = ctx.createConicalGradient
        ? null // fallback below
        : null;
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(scanAngle);
      const g = ctx.createLinearGradient(0, 0, Math.min(W, H) * 0.45, 0);
      g.addColorStop(0, 'rgba(0,240,255,0)');
      g.addColorStop(0.6, `rgba(0,240,255,${0.06 + threatLevel * 0.06})`);
      g.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.min(W, H) * 0.45, -0.06, 0.06);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();

      // Background particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.life = (p.life + 0.005) % 1;
        const op = Math.sin(p.life * Math.PI) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,240,255,${op})`;
        ctx.fill();
      });

      // Edges
      edges.forEach(e => {
        const from = nodes[e.from], to = nodes[e.to];
        if (!from || !to) return;
        if (e.lit) e.prog = (e.prog + e.spd) % 1;
        const isThreat = from.type === 'threat' || to.type === 'threat';
        const ec = isThreat
          ? `rgba(255,59,48,${0.06 + threatLevel * 0.12})`
          : 'rgba(0,240,255,0.05)';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = ec;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        if (e.lit) {
          const px = from.x + (to.x - from.x) * e.prog;
          const py = from.y + (to.y - from.y) * e.prog;
          const pc = isThreat ? '#FF3B30' : '#00F0FF';
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = pc;
          ctx.shadowColor = pc;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 24 || n.x > W - 24) n.vx *= -1;
        if (n.y < 24 || n.y > H - 24) n.vy *= -1;
        n.phase += n.freq;
        const pulse = Math.sin(n.phase) * 0.5 + 0.5;

        const colors = {
          threat:  { core: `rgba(255,59,48,${0.7 + pulse * 0.3})`,  glow: '#FF3B30', ring: 'rgba(255,59,48,0.15)' },
          gateway: { core: `rgba(0,240,255,${0.6 + pulse * 0.3})`, glow: '#00F0FF', ring: 'rgba(0,240,255,0.12)' },
          server:  { core: `rgba(191,90,242,${0.6+pulse*0.3})`,     glow: '#BF5AF2', ring: 'rgba(191,90,242,0.12)' },
          host:    { core: `rgba(48,209,88,${0.4 + pulse * 0.25})`, glow: '#30D158', ring: 'rgba(48,209,88,0.08)' },
        };
        const c = colors[n.type] || colors.host;

        // Outer pulse ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (2.5 + pulse * 1.5), 0, Math.PI * 2);
        ctx.strokeStyle = c.ring;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Mid ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 1.6, 0, Math.PI * 2);
        ctx.strokeStyle = c.ring.replace('0.', '0.2');
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = c.core;
        ctx.shadowColor = c.glow;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [threatLevel, active]);

  return <canvas ref={canvasRef} className="wm-canvas" style={{ display: 'block' }} />;
}

/* ═══════════════════════════════════════════════
   ATTACK DNA HELIX VISUALIZATION (NOVEL)
   Encodes attack pattern as a DNA-like helix
═══════════════════════════════════════════════ */
function AttackDnaHelix({ report }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    let t = 0;

    // Encode features as DNA strands
    const features = report?.feature_attributions?.slice(0, 20) || [];
    const severity = report?.severity || 'LOW';
    const strandColor1 = severity === 'CRITICAL' ? '#FF3B30' : severity === 'HIGH' ? '#FF9F0A' : '#00F0FF';
    const strandColor2 = '#BF5AF2';

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;
      const cx = W / 2;
      const segments = 40;
      const step = H / segments;

      for (let i = 0; i <= segments; i++) {
        const y = i * step;
        const wave = Math.sin(i * 0.35 + t) * (W * 0.3);
        const wave2 = Math.sin(i * 0.35 + t + Math.PI) * (W * 0.3);
        const x1 = cx + wave;
        const x2 = cx + wave2;

        // Base pair (crossbar)
        if (i % 2 === 0) {
          const feat = features[Math.floor(i / 2) % Math.max(features.length, 1)];
          const alpha = feat ? Math.min(1, Math.abs(feat.contribution || 0.3) * 2) : 0.15;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = feat && feat.contribution > 0
            ? `rgba(255,59,48,${alpha * 0.8})`
            : `rgba(48,209,88,${alpha * 0.6})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Nucleotide dots
          ctx.beginPath();
          ctx.arc(x1 + (x2 - x1) * 0.4, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = feat && feat.contribution > 0 ? '#FF3B30' : '#30D158';
          ctx.shadowColor = feat && feat.contribution > 0 ? '#FF3B30' : '#30D158';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.arc(x1 + (x2 - x1) * 0.6, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = feat && feat.contribution > 0 ? '#FF9F0A' : '#00F0FF';
          ctx.shadowColor = feat && feat.contribution > 0 ? '#FF9F0A' : '#00F0FF';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Strand 1
        if (i > 0) {
          const pWave = Math.sin((i - 1) * 0.35 + t) * (W * 0.3);
          const py = (i - 1) * step;
          ctx.beginPath();
          ctx.moveTo(cx + pWave, py);
          ctx.lineTo(x1, y);
          ctx.strokeStyle = strandColor1;
          ctx.lineWidth = 2;
          ctx.shadowColor = strandColor1;
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Strand 2
          const pWave2 = Math.sin((i - 1) * 0.35 + t + Math.PI) * (W * 0.3);
          ctx.beginPath();
          ctx.moveTo(cx + pWave2, py);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = strandColor2;
          ctx.lineWidth = 2;
          ctx.shadowColor = strandColor2;
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [report]);

  return (
    <div className="relative h-48 overflow-hidden rounded-2xl" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
      <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
        <div className="label">Attack DNA Pattern Encoder · Feature → Nucleotide Mapping</div>
        <div className="flex gap-3 text-[9px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Malicious Feature</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Benign Feature</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Strand Alpha</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Strand Beta</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LIVE THREAT INTELLIGENCE FEED (NOVEL)
═══════════════════════════════════════════════ */
function ThreatIntelFeed({ report }) {
  const severity = report?.severity || 'LOW';
  const family = report?.stage2_output?.dominant_family || 'Benign';
  const prob = ((report?.attack_probability || 0) * 100).toFixed(1);
  const stage = report?.mitre_kill_chain?.active_stage || 'N/A';

  const events = report ? [
    { time: '00:00', type: 'ALERT',  color: '#FF3B30', msg: `Stage-1 XGBoost → ${prob}% attack probability detected` },
    { time: '00:01', type: 'INFO',   color: '#00F0FF', msg: `MITRE Kill-Chain: ${stage} stage ACTIVE` },
    { time: '00:02', type: 'WARN',   color: '#FF9F0A', msg: `Stage-2 CatBoost → ${family} family signature matched` },
    { time: '00:03', type: 'ALERT',  color: '#FF3B30', msg: `Blast radius: ${report?.blast_radius?.estimated_spread || 'Multiple hosts'} estimated` },
    { time: '00:04', type: 'SYSTEM', color: '#BF5AF2', msg: `Forecasted next TTP: ${report?.mitre_kill_chain?.forecasted_next_stage || 'N/A'}` },
    { time: '00:05', type: 'SOAR',   color: '#30D158', msg: `Automated SOAR playbook staged → READY FOR EXECUTION` },
    { time: '00:06', type: 'XAI',    color: '#00F0FF', msg: report?.xai_evidence?.slice(0, 70) || 'XAI evidence computed' },
  ] : [
    { time: '--:--', type: 'SYSTEM', color: '#00F0FF', msg: 'World Model Engine ONLINE · Awaiting telemetry input' },
    { time: '--:--', type: 'INFO',   color: '#30D158', msg: 'Stage-1 XGBoost classifier LOADED · F1=0.9688' },
    { time: '--:--', type: 'INFO',   color: '#30D158', msg: 'Stage-2 CatBoost 7-family model LOADED · F1=0.9575' },
    { time: '--:--', type: 'SYSTEM', color: '#BF5AF2', msg: 'MITRE ATT&CK Kill-Chain engine READY' },
    { time: '--:--', type: 'SOAR',   color: '#FF9F0A', msg: 'SOAR Playbook dispatcher ARMED · Awaiting trigger' },
    { time: '--:--', type: 'SYSTEM', color: '#00F0FF', msg: 'Drop PCAP / CSV / NetFlow to initiate forensic pipeline' },
  ];

  const doubled = [...events, ...events];

  return (
    <div className="glass-sm overflow-hidden" style={{ height: 180 }}>
      <div className="px-3 py-2 border-b border-white/6 flex items-center justify-between">
        <div className="label">Live Threat Intelligence Feed</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-threat" />
          <span className="text-[9px] font-mono text-red-400">LIVE</span>
        </div>
      </div>
      <div className="overflow-hidden" style={{ height: 150 }}>
        <div className="feed-scroll space-y-0">
          {doubled.map((e, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-1.5 border-b border-white/3 hover:bg-white/2 transition-colors">
              <span className="font-mono text-[9px] text-white/25 shrink-0 mt-0.5">{e.time}</span>
              <span className="tag shrink-0 mt-0.5" style={{ color: e.color, borderColor: `${e.color}30`, background: `${e.color}10`, fontSize: '8px' }}>{e.type}</span>
              <span className="text-[10px] text-white/55 font-mono leading-tight">{e.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROBABILITY RADIAL GAUGE (CINEMATIC)
═══════════════════════════════════════════════ */
function RadialGauge({ value = 0, label = '', size = 120 }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ * 0.78;
  const color = pct > 75 ? '#FF3B30' : pct > 50 ? '#FF9F0A' : pct > 25 ? '#FFD60A' : '#30D158';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" style={{ transform: 'rotate(-126deg)' }}>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth={size*0.08}
            strokeDasharray={`${circ*0.78} ${circ*0.22}`} strokeLinecap="round" />
          {/* Fill */}
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={size*0.08}
            strokeDasharray={`${fill} ${circ-fill}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
            className="ring-reveal" />
          {/* Inner glow ring */}
          <circle cx={size/2} cy={size/2} r={r * 0.7} fill="none"
            stroke={color} strokeWidth={0.5} opacity={0.2} strokeDasharray="3 6" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black font-mono leading-none" style={{ color, textShadow: `0 0 20px ${color}80` }}>
            {pct.toFixed(0)}%
          </span>
          <span className="text-[8px] font-mono text-white/30 mt-0.5 uppercase tracking-wider">{label}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WAVE AUDIO-STYLE PROBABILITY BARS
═══════════════════════════════════════════════ */
function ProbWaveBars({ active = false, color = '#00F0FF' }) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-0.5 h-5">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="wave-bar rounded-t"
          style={{ width: 3, height: '100%', background: color, opacity: 0.7 }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MITRE KILL CHAIN HEADER
═══════════════════════════════════════════════ */
const STAGES = [
  { id: 'recon',     icon: '👁', label: 'Recon' },
  { id: 'access',    icon: '🚪', label: 'Initial Access' },
  { id: 'exec',      icon: '⚡', label: 'Execution' },
  { id: 'persist',   icon: '🔒', label: 'Persistence' },
  { id: 'lateral',   icon: '↔',  label: 'Lateral Move' },
  { id: 'c2',        icon: '📡', label: 'C2' },
  { id: 'exfil',     icon: '📤', label: 'Exfiltration' },
];

function KillChainHeader({ activeStage, nextStage }) {
  const findIdx = (s) => {
    if (!s) return -1;
    const sl = s.toLowerCase();
    return STAGES.findIndex(st =>
      sl.includes(st.id) || sl.includes(st.label.toLowerCase().split(' ')[0])
    );
  };
  const activeIdx = findIdx(activeStage);
  const nextIdx   = findIdx(nextStage);

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {STAGES.map((s, i) => {
        const done    = i < activeIdx;
        const active  = i === activeIdx;
        const next    = i === nextIdx && nextIdx !== activeIdx;
        const future  = !done && !active && !next;
        return (
          <React.Fragment key={s.id}>
            <div className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0 transition-all text-[10px] font-mono font-bold',
              active  && 'bg-amber-500/15 border border-amber-500/40 text-amber-400 stage-active',
              next    && 'bg-red-500/12 border border-red-500/35 text-red-400 stage-next',
              done    && 'bg-green-500/8 border border-green-500/18 text-green-500/70',
              future  && 'bg-white/3 border border-white/7 text-white/22',
            )}>
              <span>{s.icon}</span>
              <span className="hidden md:inline">{s.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <ChevronRight size={9} className={done ? 'text-green-500/40 shrink-0' : 'text-white/10 shrink-0'} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LIVE TICKER
═══════════════════════════════════════════════ */
function LiveTicker({ report }) {
  const msgs = report ? [
    `[WORLD MODEL] K=5 forward sim → ${((report.attack_probability||0)*100).toFixed(1)}% infiltration convergence`,
    `[MITRE] Kill-chain: ${report.mitre_kill_chain?.active_stage||'N/A'} → ${report.mitre_kill_chain?.forecasted_next_stage||'N/A'} (${report.mitre_kill_chain?.forecast_probability||0}% prob)`,
    `[XAI] Top driver: ${report.xai_evidence?.slice(0,65)||'Computing...'}`,
    `[SOAR] Automated containment playbook staged for ${report.countermeasures?.target_indicators?.top_src_ips?.[0]||'attacker node'}`,
    `[STAGE-2] ${report.stage2_output?.dominant_family||'N/A'} · ${((report.stage2_output?.dominant_family_probability||0)*100).toFixed(1)}% confidence`,
  ] : [
    '[NETTHREAT] World Model Engine ONLINE · SIH-26153 · Dual-Stage AI Pipeline',
    '[SYSTEM] Drop PCAP / CSV / NetFlow / binetflow to begin forensic analysis',
    '[MODEL] Stage-1 XGBoost (F1=0.9688) + Stage-2 CatBoost (F1=0.9575) loaded',
    '[MITRE] PREDICTIVE kill-chain mapping · SOAR containment · XAI explainability',
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 4500);
    return () => clearInterval(t);
  }, [msgs.length]);

  return (
    <div className="flex items-center gap-2.5 min-w-0 flex-1">
      <span className="shrink-0 text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 tracking-wider">◉ LIVE</span>
      <span className="text-[10px] font-mono text-white/40 truncate transition-all duration-700">{msgs[idx]}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
function Sidebar({ activeTab, onTabChange, report, currentUser, onOpenAuth }) {
  const severity  = report?.severity;
  const tc = severity === 'CRITICAL' ? '#FF3B30' : severity === 'HIGH' ? '#FF9F0A' : severity === 'MEDIUM' ? '#FFD60A' : '#30D158';
  const prob = ((report?.attack_probability || 0) * 100).toFixed(1);

  const nav = [
    { id: 'live',       label: 'Command Center',  icon: LayoutDashboard, badge: null },
    { id: 'worldmodel', label: 'World Model',      icon: BrainCircuit,    badge: 'AI' },
    { id: 'sniffer',    label: 'Live Capture',     icon: Radio,           badge: 'LIVE' },
    { id: 'history',    label: 'Threat History',   icon: History,         badge: null },
    { id: 'models',     label: 'ML Models',        icon: Database,        badge: null },
    { id: 'settings',   label: 'Settings',         icon: Settings,        badge: null },
  ];

  return (
    <div className="w-[218px] border-r border-white/5 bg-[#03030a] flex flex-col shrink-0 z-30 relative overflow-hidden">
      {/* Hex background */}
      <div className="absolute inset-0 hex-bg pointer-events-none opacity-60" />

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/25 border border-cyan-500/20 flex items-center justify-center">
              <Shield size={16} className="text-cyan-400" />
            </div>
            <div className="absolute inset-[-4px] rounded-xl border border-cyan-500/15 spin-cw" style={{ borderTopColor:'transparent', borderRightColor:'transparent' }} />
            <div className="absolute inset-[-7px] rounded-xl border border-purple-500/10 spin-ccw" style={{ borderBottomColor:'transparent', borderLeftColor:'transparent' }} />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white/90 font-grostesk tracking-tight leading-none">NetThreat<span className="text-cyan-400"> AI</span></div>
            <div className="text-[8px] font-mono text-cyan-500/60 tracking-[0.22em] uppercase mt-0.5">World Model</div>
          </div>
        </div>
      </div>

      {/* Threat Banner */}
      {report && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl border relative z-10 anim-scale-in"
          style={{ background:`${tc}0d`, borderColor:`${tc}25` }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0 pulse-threat" style={{ background: tc }} />
            <div className="min-w-0">
              <div className="text-[9px] font-mono font-black tracking-widest" style={{ color: tc }}>{severity}</div>
              <div className="text-[9px] text-white/40 truncate">{prob}% attack prob · {report?.stage2_output?.dominant_family || 'N/A'}</div>
            </div>
          </div>
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bar-fill rounded-full" style={{ width:`${prob}%`, background:`linear-gradient(90deg, ${tc}80, ${tc})` }} />
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex-1 py-4 px-3 space-y-0.5 relative z-10 overflow-y-auto">
        <div className="label px-2 mb-3">Navigation</div>
        {nav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => onTabChange(item.id)}
              className={clsx(
                'relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all group',
                isActive ? 'text-cyan-400' : 'text-white/45 hover:bg-white/4 hover:text-white/75'
              )}
              style={isActive ? { background:'rgba(0,240,255,0.07)', border:'1px solid rgba(0,240,255,0.14)' } : {}}>
              {isActive && <div className="nav-bar" />}
              <Icon size={14} strokeWidth={isActive ? 2.5 : 1.8} className="shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-[8px] font-mono font-black px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    background: item.badge==='AI' ? 'rgba(191,90,242,0.18)' : 'rgba(255,59,48,0.18)',
                    color:      item.badge==='AI' ? '#BF5AF2' : '#FF3B30',
                  }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      {report && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-white/3 border border-white/6 space-y-2 relative z-10">
          <div className="label">Quick Stats</div>
          {[
            { k: 'Flows',     v: (report.traffic_summary?.total_flows||0).toLocaleString() },
            { k: 'MITRE Stage', v: report.mitre_kill_chain?.active_stage || 'N/A' },
            { k: 'Lead Time', v: report.time_to_compromise || 'N/A' },
          ].map(s => (
            <div key={s.k} className="flex justify-between items-center gap-2">
              <span className="text-[9px] text-white/30 font-mono truncate">{s.k}</span>
              <span className="text-[9px] font-mono text-white/65 truncate text-right max-w-[100px]">{s.v}</span>
            </div>
          ))}
        </div>
      )}

      {/* User */}
      <div className="p-3 border-t border-white/5 relative z-10">
        <button onClick={onOpenAuth}
          className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/6 border border-white/6 transition-all group"
          style={{ background:'rgba(255,255,255,0.03)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0"
            style={{ color:currentUser?.color||'#30D158', background:`${currentUser?.color||'#30D158'}18`, borderColor:`${currentUser?.color||'#30D158'}40` }}>
            {currentUser?.name ? currentUser.name.split(' ').map(n=>n[0]).join('') : 'SC'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[11px] font-semibold text-white/85 truncate">{currentUser?.name||'Sarah Chen'}</div>
            <div className="text-[9px] font-mono text-white/32 truncate">{currentUser?.badge||'L1 ANALYST'}</div>
          </div>
          <UserCheck size={11} className="text-white/22 group-hover:text-white/50 shrink-0" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WORLD MODEL FULL TAB
═══════════════════════════════════════════════ */
function WorldModelTab({ report }) {
  const prob = report?.attack_probability || 0;
  const kc = report?.mitre_kill_chain;
  const severity = report?.severity || 'NORMAL';
  const sc = severity==='CRITICAL'?'#FF3B30':severity==='HIGH'?'#FF9F0A':'#00F0FF';

  return (
    <div className="h-full flex flex-col overflow-hidden anim-fade-in">
      {/* Canvas */}
      <div className="relative flex-1 min-h-0 border-b border-white/5 overflow-hidden">
        <WorldModelCanvas threatLevel={prob} active={!!report} />

        {/* Overlaid Labels */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="label mb-1">World Model · P(S_t+1 | S_t) State-Transition Graph</div>
          <div className="text-[10px] font-mono text-white/28">
            K=5 forward simulation · {(prob*100).toFixed(1)}% infiltration convergence
          </div>
        </div>

        {/* Central Hub */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background:'rgba(0,240,255,0.05)', border:'1px solid rgba(0,240,255,0.15)' }}>
              <BrainCircuit size={24} className="text-cyan-400/60" />
            </div>
            <div className="absolute inset-[-12px] rounded-full border border-cyan-500/10 spin-slow-cw" />
            <div className="absolute inset-[-20px] rounded-full border border-purple-500/8 spin-ccw" />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-none">
          {[
            { color:'#00F0FF', label:'Gateway Node' },
            { color:'#30D158', label:'Host Node' },
            { color:'#BF5AF2', label:'Server Node' },
            { color:'#FF3B30', label:'Compromised Node' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-[9px] font-mono text-white/35">
              <div className="w-2 h-2 rounded-full" style={{ background:l.color, boxShadow:`0 0 6px ${l.color}` }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
          <div className="flex items-center gap-6">
            <div>
              <div className="label mb-1">K-Step Forward Simulation</div>
              <div className="text-[11px] font-mono text-white/50">
                Rolling {kc?.chain?.length||5} steps ahead · Next TTP:{' '}
                <span className="text-red-400 font-bold">{kc?.forecasted_next_stage||'COMPUTING...'}</span>
              </div>
            </div>
            <div className="h-px flex-1 bg-white/5" />
            <RadialGauge value={prob*100} label="Attack Prob" size={100} />
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="h-24 grid grid-cols-5 divide-x divide-white/5 shrink-0 bg-[#03030a]">
        {[
          { label:'Observed State', value: report?.stage1_output?.current_observed_attack_state===1 ? 'ATTACK' : 'NORMAL', color: report?.stage1_output?.current_observed_attack_state===1?'#FF3B30':'#30D158' },
          { label:'Forecast Horizon', value:'K=5 Windows', color:'#00F0FF' },
          { label:'Jump Probability', value:`${kc?.forecast_probability||0}%`, color:'#FF9F0A' },
          { label:'Active MITRE Stage', value: kc?.active_stage||'N/A', color:'#BF5AF2' },
          { label:'Est. Lead Time', value: report?.time_to_compromise||'N/A', color:'#30D158' },
        ].map(s => (
          <div key={s.label} className="flex flex-col justify-center px-4">
            <div className="label mb-1.5">{s.label}</div>
            <div className="text-sm font-black font-mono truncate" style={{ color:s.color, textShadow:`0 0 12px ${s.color}50` }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LANDING HERO (ULTRA-PREMIUM)
═══════════════════════════════════════════════ */
function LandingHero({ onFileSelected, isUploading, error, onSelectScenario, activeScenarioId, onToggleStream, isStreaming }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(i => i + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label:'F1 Score', value:'96.88%', color:'#30D158', sub:'Stage-1 XGBoost' },
    { label:'Botnet Families', value:'7', color:'#00F0FF', sub:'Stage-2 CatBoost' },
    { label:'MITRE TTPs', value:'47+', color:'#BF5AF2', sub:'ATT&CK Mapped' },
    { label:'Inference Time', value:'42ms', color:'#FF9F0A', sub:'End-to-end pipeline' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 anim-fade-up">

      {/* Hero Section */}
      <div className="relative rounded-[28px] overflow-hidden circuit-bg border border-white/7" style={{ minHeight: 340 }}>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background:'rgba(0,240,255,0.07)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background:'rgba(191,90,242,0.06)' }} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
          {/* Left: text + world model mini */}
          <div className="p-8 flex flex-col justify-between border-r border-white/6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="tag tag-cyan">SIH-26153</div>
                <div className="tag tag-green">WORLD MODEL AI</div>
                <div className="flex items-center gap-1.5 ml-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-safe" />
                  <span className="text-[9px] font-mono text-green-400">ENGINE ONLINE</span>
                </div>
              </div>

              <h1 className="text-3xl font-black font-grostesk leading-tight mb-3">
                <span className="grad-cyan-purple">Network Attack</span>
                <br />
                <span className="text-white/90">Forecasting System</span>
              </h1>
              <p className="text-[13px] text-white/45 leading-relaxed max-w-sm mb-6">
                AI World Model that learns temporal network behaviour, predicts attacker progression,
                maps MITRE ATT&CK kill-chains and provides explainable cyber-defence intelligence.
              </p>

              <div className="flex items-center gap-2 font-mono text-[10px] text-white/30 mb-3">
                <span className="text-cyan-400">P(S_t+1 | S_t)</span>
                <span>·</span>
                <span>K-step forward simulation</span>
                <span>·</span>
                <span>SHAP/XAI explainability</span>
              </div>
            </div>

            {/* Mini world model canvas */}
            <div className="relative h-32 rounded-2xl overflow-hidden border border-white/6" style={{ background:'rgba(0,0,0,0.5)' }}>
              <WorldModelCanvas threatLevel={0.2} active={true} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-[9px] font-mono text-cyan-400/50 tracking-widest uppercase">State Transition Graph</div>
                  <div className="text-[8px] font-mono text-white/20 mt-0.5">Live simulation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Upload + Scenarios */}
          <div className="p-8 flex flex-col gap-4">
            <div className="label">Ingest Telemetry</div>
            <UploadDropzone onFileSelected={onFileSelected} isUploading={isUploading} error={error} />
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="glass rounded-[20px] p-5">
        <ScenarioSelector
          onSelectScenario={onSelectScenario}
          isLoading={isUploading}
          activeScenarioId={activeScenarioId}
          onStartLiveStream={onToggleStream}
          isStreaming={isStreaming}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`glass-sm p-4 lift anim-fade-up d-${(i+1)*100}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="label">{s.label}</div>
              <div className="w-2 h-2 rounded-full pulse-safe" style={{ background: s.color }} />
            </div>
            <div className="text-2xl font-black font-mono mb-0.5" style={{ color: s.color, textShadow:`0 0 20px ${s.color}50` }}>{s.value}</div>
            <div className="text-[9px] text-white/30 font-mono">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Model Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name:'Stage-1 XGBoost', desc:'Temporal flow-level risk classification', metric:'F1 0.9688 · PR-AUC 0.9871', color:'#30D158', status:'LOADED' },
          { name:'Stage-2 CatBoost', desc:'7-family botnet characterisation', metric:'Macro-F1 0.7681 · wF1 0.9575', color:'#0A84FF', status:'LOADED' },
          { name:'World Model Engine', desc:'State-transition dynamics · K=5 forward sim', metric:'P(S_t+1|S_t) · MITRE-mapped', color:'#BF5AF2', status:'ACTIVE' },
        ].map((m, i) => (
          <div key={m.name} className={`glass-sm p-4 lift anim-fade-up d-${(i+1)*100}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-bold text-white/85 font-grostesk">{m.name}</div>
              <span className="tag tag-green">{m.status}</span>
            </div>
            <div className="text-[11px] text-white/40 mb-3">{m.desc}</div>
            <div className="text-sm font-black font-mono" style={{ color: m.color }}>{m.metric}</div>
          </div>
        ))}
      </div>

      {/* Threat Feed */}
      <ThreatIntelFeed report={null} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   REPORT VIEW — FULL ANALYSIS DASHBOARD
═══════════════════════════════════════════════ */
function ReportView({ report, isUploading, onReset, onSelectScenario, onFileSelected, activeScenarioId, isStreaming, onToggleStream, fileName }) {
  const kc = report?.mitre_kill_chain;
  const prob = report?.attack_probability || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-14 anim-fade-up">
      {/* Top Quick Bar */}
      <div className="glass-sm px-4 py-2.5 flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={onReset} className="btn btn-ghost"><ArrowLeft size={12} />Reset</button>
          <label className="btn btn-cyan cursor-pointer"><Upload size={12} />Upload
            <input type="file" className="hidden" accept=".csv,.pcap,.pcapng,.cap,.binetflow,.log,.json,.tsv,.netflow"
              onChange={e => { if (e.target.files?.[0]) { onFileSelected(e.target.files[0]); e.target.value = ''; } }} />
          </label>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <span className="text-[10px] font-mono text-white/40 truncate">{report.input_context?.filename || fileName}</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto">
          {[
            { id:'benign', label:'Benign', c:'#30D158' },
            { id:'recon', label:'Recon', c:'#FFD60A' },
            { id:'bruteforce', label:'BruteForce', c:'#FF9F0A' },
            { id:'neris_c2', label:'Neris C2', c:'#FF453A' },
            { id:'ddos', label:'DDoS', c:'#FF3B30' },
            { id:'zeroday', label:'0-Day', c:'#BF5AF2' },
          ].map(s => (
            <button key={s.id} onClick={() => onSelectScenario(s.id)} disabled={isUploading}
              className={clsx('px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all shrink-0 cursor-pointer border',
                activeScenarioId===s.id ? 'bg-white/15 text-white border-white/25' : 'bg-white/4 text-white/40 border-white/6 hover:text-white hover:bg-white/8'
              )}>
              <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ background:s.c }} />{s.label}
            </button>
          ))}
          <button onClick={onToggleStream} className={clsx('px-3 py-1 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 ml-1 shrink-0 cursor-pointer border',
            isStreaming ? 'bg-red-500/80 text-white border-red-500 animate-pulse' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 hover:bg-cyan-500/18'
          )}>
            <Activity size={9} className={isStreaming ? 'animate-spin' : ''} />
            {isStreaming ? 'STREAMING' : 'STREAM'}
          </button>
        </div>
      </div>

      {/* Traffic Summary */}
      <TrafficSummary report={report} />

      {/* Assessment Hero */}
      <AssessmentHero report={report} />

      {/* ★ NOVEL: Attack DNA Helix */}
      <div className="glass p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
            <Microscope size={14} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-[12px] font-bold text-white/80 font-mono uppercase tracking-wide">Attack DNA Pattern Encoder</h3>
            <p className="text-[10px] text-white/35">Novel: XAI feature attribution mapped to dual-strand helix — positive features (red) vs benign features (green)</p>
          </div>
          <span className="tag tag-purple ml-auto">NOVEL</span>
        </div>
        <AttackDnaHelix report={report} />
      </div>

      {/* Risk Trajectory */}
      <RiskTrajectory report={report} />

      {/* Threat Intel Feed */}
      <ThreatIntelFeed report={report} />

      {/* Lead-Time Radar + War Map */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <LeadTimeThreatRadar timeToCompromise={report.time_to_compromise} probability={report.attack_probability} />
        <ThreatOriginWarMap geoContext={report.geo_context} />
      </div>

      {/* Forecast Chart + Family Bars */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 glass p-5" style={{ height:320 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-xl bg-yellow-500/15 flex items-center justify-center"><Activity size={14} className="text-yellow-400" /></div>
            <h3 className="text-[12px] font-bold text-white/70 font-mono uppercase tracking-wide">K-Step Attack Probability Forecast</h3>
            <ProbWaveBars active={true} color="#FFD60A" />
          </div>
          <div style={{ height:240 }}><AttackProbabilityChart report={report} /></div>
        </div>
        <div className="xl:col-span-1 glass p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-xl bg-red-500/15 flex items-center justify-center"><Zap size={14} className="text-red-400" /></div>
            <h3 className="text-[12px] font-bold text-white/70 font-mono uppercase tracking-wide">Botnet Family</h3>
          </div>
          <FamilyBars report={report} />
        </div>
      </div>

      {/* XAI + MITRE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ExplainabilityPanel report={report} />
        <AttackChainContext report={report} />
      </div>

      {/* Zero-Day */}
      <ZeroDayAnalysisPanel report={report} />

      {/* Feature Attribution Waterfall */}
      <FeatureAttributionWaterfall attributions={report.feature_attributions} />

      {/* MITRE Matrix Navigator */}
      <MitreMatrixNavigator matrix={report.mitre_matrix} />

      {/* Blast Radius */}
      <BlastRadiusGraph blastRadius={report.blast_radius} />

      {/* What-If Defense Simulator */}
      <WhatIfDefenseSimulator report={report} />

      {/* SOC Copilot + SOAR */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SocAiCopilot report={report} />
        <SoarExecutionTerminal countermeasures={report.countermeasures} report={report} />
      </div>

      {/* Packet Hex Dissector */}
      <PacketHexDissector dissector={report.hex_dissector} />

      {/* Countermeasures + Executive Brief */}
      <CountermeasuresPanel report={report} />
      <ExecutiveBriefingPanel report={report} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ML MODELS TAB
═══════════════════════════════════════════════ */
function ModelsTab() {
  const models = [
    { name:'Stage-1 XGBoost', desc:'Temporal flow-level risk classifier on CTU-13 dataset', file:'xgboost.pkl', metric:'F1 0.9688 · PR-AUC 0.9871 · ROC-AUC 0.9668', color:'#30D158', status:'ACTIVE' },
    { name:'Stage-2 CatBoost', desc:'7-family botnet packet-state characterisation', file:'stage2_family_best_model.joblib', metric:'Macro-F1 0.7681 · weighted-F1 0.9575', color:'#0A84FF', status:'ACTIVE' },
    { name:'Persistence Forecaster', desc:'Strongest validated K-step forward simulation baseline', file:'persistence_forecaster.pkl', metric:'Mean F1 0.9749 · PR-AUC 0.9677', color:'#BF5AF2', status:'ACTIVE' },
    { name:'GRU Temporal Baseline', desc:'Historical sequence model for temporal dynamics comparison', file:'gru_baseline.h5', metric:'F1 0.9805 (test)', color:'#FF9F0A', status:'REFERENCE' },
  ];
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-4 anim-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Database size={18} className="text-blue-400" /></div>
        <div>
          <h2 className="text-lg font-bold text-white/85 font-grostesk">ML Model Registry</h2>
          <p className="text-[11px] text-white/35">Dual-stage inference pipeline model cards</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map(m => (
          <div key={m.name} className="glass-sm p-5 lift">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-bold text-white/85 font-grostesk">{m.name}</h3>
              <span className={clsx('tag', m.status==='ACTIVE'?'tag-green':'tag-cyan')}>{m.status}</span>
            </div>
            <p className="text-[11px] text-white/40 mb-3">{m.desc}</p>
            <div className="text-sm font-black font-mono mb-1.5" style={{ color:m.color }}>{m.metric}</div>
            <div className="text-[9px] font-mono text-white/20">{m.file}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="max-w-xl mx-auto py-8 space-y-4 anim-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center"><Settings size={18} className="text-white/40" /></div>
        <div>
          <h2 className="text-lg font-bold text-white/85 font-grostesk">Settings</h2>
          <p className="text-[11px] text-white/35">Engine thresholds and preferences</p>
        </div>
      </div>
      <div className="glass-sm p-5 space-y-1">
        {[
          { label:'Critical Alert Threshold', value:'80%', c:'#FF3B30' },
          { label:'High Alert Threshold', value:'60%', c:'#FF9F0A' },
          { label:'K-Step Forecast Horizon', value:'5 Windows', c:'#00F0FF' },
          { label:'SOAR Auto-Deploy', value:'Staged', c:'#BF5AF2' },
        ].map(s => (
          <div key={s.label} className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-[12px] text-white/50">{s.label}</span>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg" style={{ color:s.c, background:`${s.c}12`, border:`1px solid ${s.c}25` }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function App() {
  const [report, setReport] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = localStorage.getItem('netthreat_user'); return s ? JSON.parse(s) : { username:'analyst', name:'Sarah Chen', role:'SOC Analyst', badge:'L1 ANALYST', color:'#30D158' }; }
    catch { return null; }
  });

  const loadScenario = useCallback(async (id) => {
    setError(null); setIsUploading(true); setActiveScenarioId(id); setFileName(`Scenario: ${id}`);
    try {
      const res = await fetch(`${API_BASE}/api/scenarios/${id}/load`, { method:'POST' });
      if (!res.ok) throw new Error('Failed to load scenario');
      setReport(await res.json());
    } catch (e) { setError(e.message); }
    finally { setIsUploading(false); }
  }, []);

  const toggleStream = async () => {
    if (isStreaming) { clearInterval(streamRef.current); setIsStreaming(false); return; }
    setIsStreaming(true);
    const seq = ['benign','recon','bruteforce','neris_c2','ddos'];
    let i = 0;
    await loadScenario(seq[0]);
    streamRef.current = setInterval(async () => { i = (i+1)%seq.length; await loadScenario(seq[i]); }, 4000);
  };

  useEffect(() => () => clearInterval(streamRef.current), []);

  const analyzeFile = async (file) => {
    setError(null); setIsUploading(true); setFileName(file.name); setActiveScenarioId(null); setActiveTab('live');
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, { method:'POST', body:fd });
      if (!res.ok) { const e = await res.json().catch(()=>({detail:'Server error'})); throw new Error(e.detail||`Error ${res.status}`); }
      setReport(await res.json());
    } catch (e) { setError(e.message); setReport(null); }
    finally { setIsUploading(false); }
  };

  const reset = () => { clearInterval(streamRef.current); setIsStreaming(false); setActiveScenarioId(null); setReport(null); setError(null); setFileName(''); };

  const kc = report?.mitre_kill_chain;
  const severity = report?.severity;
  const tc = severity==='CRITICAL'?'#FF3B30':severity==='HIGH'?'#FF9F0A':severity==='MEDIUM'?'#FFD60A':'#30D158';

  const renderContent = () => {
    if (activeTab === 'worldmodel') return <WorldModelTab report={report} />;
    if (activeTab === 'sniffer') return (
      <div className="max-w-6xl mx-auto py-6 anim-fade-up">
        <LiveCaptureStudio onSnapshotAnalyzed={rep => { setReport(rep); setFileName(`Live_${new Date().toLocaleTimeString()}`); setActiveTab('live'); }} isUploading={isUploading} />
      </div>
    );
    if (activeTab === 'history') return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 anim-scale-in">
        <div className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
          <History size={32} className="text-amber-400/60" />
        </div>
        <h2 className="text-xl font-bold text-white/80 font-grostesk mb-2">Threat History</h2>
        <p className="text-[13px] text-white/32 max-w-sm leading-relaxed">Completed analysis sessions will persist here. No reports in this session yet.</p>
      </div>
    );
    if (activeTab === 'models') return <ModelsTab />;
    if (activeTab === 'settings') return <SettingsTab />;

    if (!report) return (
      <LandingHero onFileSelected={analyzeFile} isUploading={isUploading} error={error}
        onSelectScenario={loadScenario} activeScenarioId={activeScenarioId}
        onToggleStream={toggleStream} isStreaming={isStreaming} />
    );

    return (
      <ReportView report={report} isUploading={isUploading} onReset={reset}
        onSelectScenario={loadScenario} onFileSelected={analyzeFile}
        activeScenarioId={activeScenarioId} isStreaming={isStreaming}
        onToggleStream={toggleStream} fileName={fileName} />
    );
  };

  return (
    <div className="h-screen w-full flex bg-[#000] text-white font-sans overflow-hidden scanline crt">
      {/* Matrix Rain Background */}
      <MatrixRain />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} report={report} currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative" style={{ zIndex: 1 }}>

        {/* Top Bar */}
        <div className="h-14 px-5 flex items-center gap-3 shrink-0 border-b border-white/5 backdrop-blur-2xl sticky top-0 z-20" style={{ background:'rgba(3,3,10,0.88)' }}>
          {activeTab==='live' && report ? (
            <KillChainHeader activeStage={kc?.active_stage} nextStage={kc?.forecasted_next_stage} />
          ) : (
            <LiveTicker report={report} />
          )}

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {report && severity && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
                style={{ background:`${tc}0d`, borderColor:`${tc}22` }}>
                <div className="w-1.5 h-1.5 rounded-full pulse-threat" style={{ background:tc }} />
                <span className="text-[9px] font-mono font-black tracking-widest" style={{ color:tc }}>{severity}</span>
                <ProbWaveBars active={severity==='CRITICAL'||severity==='HIGH'} color={tc} />
              </div>
            )}
            {activeTab==='live' && report && (
              <>
                <label className="btn btn-cyan cursor-pointer"><Upload size={11} />Upload
                  <input type="file" className="hidden" accept=".csv,.pcap,.pcapng,.cap,.binetflow,.log,.json,.tsv,.netflow"
                    onChange={e => { if (e.target.files?.[0]) { analyzeFile(e.target.files[0]); e.target.value=''; } }} />
                </label>
                <button onClick={reset} className="btn btn-ghost"><ArrowLeft size={11} />Back</button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={clsx(
          'flex-1 relative',
          activeTab==='worldmodel' ? 'overflow-hidden' : 'overflow-y-auto px-5 py-5'
        )}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,240,255,0.04),transparent)] pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          {renderContent()}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={()=>setIsAuthOpen(false)}
        onLoginSuccess={u => { setCurrentUser(u); try { localStorage.setItem('netthreat_user',JSON.stringify(u)); } catch {} }}
        currentUser={currentUser} />
    </div>
  );
}
