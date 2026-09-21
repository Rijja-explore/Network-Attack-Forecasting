import React, { useRef, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Zap, CheckCircle2, Radio, Server, Terminal } from 'lucide-react';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════
   RADIAL THREAT GAUGE
═══════════════════════════════════════════════ */
export function RadialGauge({ value = 0, label = 'Threat Level', size = 120, color = null }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  const radius = (size - 18) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  const autoColor = color || (
    pct >= 75 ? '#FF3B30' :
    pct >= 50 ? '#FF9F0A' :
    pct >= 25 ? '#FFD60A' : '#30D158'
  );

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={autoColor}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 8px ${autoColor}80)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-mono font-black tracking-tight" style={{ color: autoColor }}>
          {pct}%
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 -mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROBABILITY EQUALIZER WAVE BARS
═══════════════════════════════════════════════ */
export function ProbWaveBars({ active = false, color = '#00F0FF' }) {
  return (
    <div className="flex items-end gap-[3px] h-4 px-1">
      {[0.4, 1.0, 0.6, 0.85, 0.35].map((h, i) => (
        <span
          key={i}
          className={clsx("w-[3px] rounded-full", active && "wave-bar")}
          style={{
            height: active ? '100%' : `${h * 100}%`,
            background: color,
            opacity: active ? 0.9 : 0.4,
            boxShadow: active ? `0 0 6px ${color}` : 'none'
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ATTACK DNA HELIX (3D FEATURE ATTRIBUTION)
═══════════════════════════════════════════════ */
export function AttackDnaHelix({ report }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    let t = 0;
    const features = report?.feature_attributions || [];
    const severity = report?.severity || 'NORMAL';
    const strandColor1 = severity === 'CRITICAL' ? '#FF3B30' : severity === 'HIGH' ? '#FF9F0A' : '#00F0FF';
    const strandColor2 = '#BF5AF2';

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      const cx = W / 2;
      const segments = 32;
      const step = H / segments;

      for (let i = 0; i <= segments; i++) {
        const y = i * step;
        const wave = Math.sin(i * 0.35 + t) * (W * 0.32);
        const wave2 = Math.sin(i * 0.35 + t + Math.PI) * (W * 0.32);
        const x1 = cx + wave;
        const x2 = cx + wave2;

        // Base pair rungs
        if (i % 2 === 0) {
          const featIndex = Math.floor(i / 2) % Math.max(features.length, 1);
          const feat = features[featIndex];
          const isThreat = feat ? feat.contribution > 0 : (i % 4 === 0);
          const alpha = 0.2 + (Math.sin(i * 0.35 + t) + 1) * 0.35;

          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = isThreat
            ? `rgba(255, 59, 48, ${alpha})`
            : `rgba(48, 209, 88, ${alpha})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Feature gene label on alternating sides
          if (feat && i % 4 === 0 && W > 240) {
            ctx.font = '9px "Space Mono", monospace';
            ctx.fillStyle = isThreat ? 'rgba(255, 99, 88, 0.75)' : 'rgba(48, 209, 88, 0.75)';
            const label = feat.name?.length > 14 ? feat.name.slice(0, 12) + '..' : feat.name;
            if (wave > 0) {
              ctx.fillText(label || '', x1 + 6, y + 3);
            } else {
              ctx.fillText(label || '', x2 + 6, y + 3);
            }
          }
        }

        // Left strand node
        ctx.beginPath();
        ctx.arc(x1, y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = strandColor1;
        ctx.shadowColor = strandColor1;
        ctx.shadowBlur = 6;
        ctx.fill();

        // Right strand node
        ctx.beginPath();
        ctx.arc(x2, y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = strandColor2;
        ctx.shadowColor = strandColor2;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [report]);

  return (
    <div className="glass-card p-5 relative overflow-hidden flex flex-col h-full min-h-[340px]">
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            Attack DNA Helix · 51-D Feature Strands
          </span>
        </div>
        <span className="text-[11px] font-mono text-white/40">
          GENE ROTATION: ACTIVE
        </span>
      </div>
      <div className="relative flex-1 w-full min-h-[260px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono text-white/50">
        <span className="flex items-center gap-1.5 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Anomaly Driver Genes
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Nominal Baseline Dampeners
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WORLD MODEL TOPOLOGICAL CANVAS
═══════════════════════════════════════════════ */
export function WorldModelCanvas({ threatLevel = 0.35, active = true }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let H = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const wCss = canvas.offsetWidth;
    const hCss = canvas.offsetHeight;

    const N = 24;
    const nodes = Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * Math.PI * 2;
      const dist = (0.2 + (i % 3) * 0.15) * Math.min(wCss, hCss);
      const isCompromised = (i / N) < threatLevel;
      return {
        x: wCss / 2 + Math.cos(angle) * dist,
        y: hCss / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        type: isCompromised ? 'threat' : (i % 5 === 0 ? 'gateway' : i % 3 === 0 ? 'crown_jewel' : 'workstation'),
        radius: isCompromised ? 6 : (i % 5 === 0 ? 7 : 4.5),
        label: isCompromised ? `Compromised_Node_${i}` : `Asset_${10 + i}`,
        phase: Math.random() * Math.PI * 2
      };
    });

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, wCss, hCss);
      t += 0.02;

      // Update positions
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 30 || n.x > wCss - 30) n.vx *= -1;
        if (n.y < 30 || n.y > hCss - 30) n.vy *= -1;
      });

      // Draw network links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const isAttackPath = nodes[i].type === 'threat' || nodes[j].type === 'threat';
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = isAttackPath
              ? `rgba(255, 59, 48, ${0.45 * (1 - dist / 130)})`
              : `rgba(0, 240, 255, ${0.25 * (1 - dist / 130)})`;
            ctx.lineWidth = isAttackPath ? 1.6 : 1.0;
            ctx.stroke();

            // Pulsing attack beacon packet along compromised edges
            if (isAttackPath && active) {
              const progress = ((t * 0.8 + (i + j) * 0.1) % 1);
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * progress;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * progress;
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = '#FF3B30';
              ctx.shadowColor = '#FF3B30';
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = Math.sin(t * 2 + n.phase) * 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + (n.type === 'threat' ? pulse : 0), 0, Math.PI * 2);

        let color = '#38bdf8';
        if (n.type === 'threat') color = '#FF3B30';
        else if (n.type === 'gateway') color = '#BF5AF2';
        else if (n.type === 'crown_jewel') color = '#FF9F0A';

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = n.type === 'threat' ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = '8px "Space Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(n.label, n.x + 8, n.y + 3);
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [threatLevel, active]);

  return (
    <div className="w-full h-full relative min-h-[360px] overflow-hidden rounded-2xl bg-[#080d1a] border border-white/10">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-cyan-300 font-bold">GRAPH NEURAL WORLD MODEL</span>
        <span className="text-white/40">| LATERAL REACHABILITY GRAPH</span>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono">
        <span className="flex items-center gap-1.5 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Compromised
        </span>
        <span className="flex items-center gap-1.5 text-purple-400">
          <span className="w-2 h-2 rounded-full bg-purple-500" /> Gateway
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Crown Jewel
        </span>
        <span className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-500" /> Host
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LIVE THREAT TICKER
═══════════════════════════════════════════════ */
export function LiveTicker({ report }) {
  const ttcStr = typeof report?.time_to_compromise === 'object'
    ? (report.time_to_compromise.countdown_str || report.time_to_compromise.countdown_display || `${report.time_to_compromise.ttc_seconds}s`)
    : (report?.time_to_compromise || '12m 40s');

  const alerts = [
    { text: `STAGE 1 TEMPORAL ENSEMBLE: ${report?.attack_probability ? (report.attack_probability * 100).toFixed(1) + '% THREAT SCORE' : 'SYNCHRONIZING TELEMETRY'}`, c: '#00F0FF' },
    { text: `PREEMPTIVE TTC: ${ttcStr} TO CRITICAL ESCALATION`, c: '#FF9F0A' },
    { text: `MITRE VECTOR: ${report?.mitre_kill_chain?.tactics_sequence?.[0] || 'RECONNAISSANCE (T1046)'}`, c: '#FF3B30' },
    { text: `SOAR AUTOPILOT: 4 PLAYBOOKS ARMED & ISOLATION READY`, c: '#30D158' },
  ];

  return (
    <div className="flex items-center gap-4 overflow-hidden h-8 px-4 rounded-xl bg-white/[0.03] border border-white/5 max-w-full">
      <div className="flex items-center gap-1.5 shrink-0 text-cyan-400 font-mono text-[11px] font-bold">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        LIVE THREAT INTEL:
      </div>
      <div className="flex items-center gap-8 text-[11px] font-mono overflow-x-auto no-scrollbar whitespace-nowrap">
        {alerts.map((a, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.c }} />
            <span style={{ color: a.c }}>{a.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
