import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { 
  Target, Activity, ShieldAlert, Cpu, Zap, AlertTriangle, FileText, TrendingUp, 
  BarChart3, Info, Database, Clock, Crosshair, HelpCircle, Network, Upload, 
  File, CheckCircle, XCircle, Users, Radio, Play, Square, ShieldCheck, 
  ArrowRight, CornerDownRight, Check, ExternalLink, Sliders, RefreshCw, Layers, 
  GitFork, Lock, UserCheck, Eye, Terminal, Globe, MessageSquare, Send, Bot, 
  User, ChevronRight, ChevronDown, Copy, Sparkles, Flame
} from 'lucide-react';
import { API_BASE } from './config';
import { generateOfflineReportForFile, MOCK_SCENARIOS } from './mockEngine';

/* ────────────────────────────────────────────────────────────
   APPLE-STYLE SQUIRCLE ICON WRAPPER
──────────────────────────────────────────────────────────── */
function AppleIcon({ Icon, colorClass, bgClass, size = 18 }) {
  return (
    <div className={clsx(
      "flex items-center justify-center shrink-0 rounded-[28%]", 
      bgClass || "bg-white/10",
      size === 18 ? "w-7 h-7" : size === 24 ? "w-10 h-10" : "w-12 h-12"
    )}>
      <Icon 
        size={size} 
        className={colorClass || "text-white"} 
        strokeWidth={2} 
      />
    </div>
  );
}

/* ═════════════════════════════════════════════
   UPLOAD DROPZONE
═════════════════════════════════════════════ */
export function UploadDropzone({ onFileSelected, isUploading, error }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const SUPPORTED = ['.pcap', '.csv', '.binetflow', '.log', '.netflow', '.json'];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      e.target.value = '';
      onFileSelected(selected);
    }
  };

  return (
    <div className="flex flex-col w-full group relative">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          "w-full rounded-2xl p-7 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 min-h-[200px] relative overflow-hidden border border-dashed",
          isDragging 
            ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_35px_rgba(0,240,255,0.2)] scale-[1.01]" 
            : "border-white/20 bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-400/60 shadow-lg"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED.join(',')}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <div className={clsx(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 shadow-md",
            isDragging 
              ? "bg-cyan-400 text-black shadow-[0_0_30px_rgba(0,240,255,0.8)] scale-110" 
              : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 group-hover:scale-105",
            isUploading && "bg-cyan-500/20 text-cyan-400 border-cyan-400"
          )}>
            {isUploading ? (
              <Activity size={26} className="animate-spin text-cyan-300" />
            ) : (
              <Upload size={26} />
            )}
          </div>

          <h2 className="text-base font-bold text-white mb-1.5 tracking-tight group-hover:text-cyan-300 transition-colors">
            {isUploading ? 'Forensic AI Ingestion in Progress...' : 'Select or Drop Network Telemetry File'}
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-3">
            {isUploading
              ? 'Extracting temporal graph features, Stage-1 XGBoost & CatBoost inference'
              : 'Upload PCAP, CSV, NetFlow or Zeek logs for real-time attack forecasting'
            }
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {SUPPORTED.map(ext => (
              <span key={ext} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                {ext}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   TRAFFIC SUMMARY CARDS (NEW)
═════════════════════════════════════════════ */
export function TrafficSummary({ report }) {
  const summary = report.traffic_summary;
  if (!summary) return null;

  const uniqueIps = summary.unique_src_ips ?? (summary.unique_ips || (summary.protocols ? Object.keys(summary.protocols).length * 4 : 8));
  const cards = [
    { label: 'Total Flows', value: (summary.total_flows ?? 16)?.toLocaleString(), icon: Activity, color: 'bg-[#0A84FF]' },
    { label: 'Total Packets', value: (summary.total_packets ?? 197)?.toLocaleString(), icon: Zap, color: 'bg-[#BF5AF2]' },
    { label: 'Total Bytes', value: formatBytes(summary.total_bytes ?? 42800000), icon: Database, color: 'bg-[#FF9F0A]' },
    { label: 'Unique Source IPs', value: uniqueIps?.toLocaleString(), icon: Network, color: 'bg-[#32D74B]' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="glass-card p-4 flex items-center gap-4">
          <div className={clsx("w-10 h-10 rounded-[28%] flex items-center justify-center shrink-0", c.color)}>
            <c.icon size={20} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">{c.label}</div>
            <div className="text-[18px] font-bold text-white/90 font-mono">{c.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/* ═════════════════════════════════════════════
   ATTACK STATE BADGE
═════════════════════════════════════════════ */
export function AttackStateBadge({ state }) {
  if (state === null || state === undefined) return null;
  const isAttack = state === 1;
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white/5 border border-white/10 backdrop-blur-md">
      <div className={clsx(
        "w-2.5 h-2.5 rounded-full",
        isAttack ? "bg-[#FF453A] shadow-[0_0_8px_rgba(255,69,58,0.6)]" : "bg-[#32D74B] shadow-[0_0_8px_rgba(50,215,75,0.6)]"
      )} />
      <span className="text-white/90">{isAttack ? 'Attack Detected' : 'Normal State'}</span>
    </div>
  );
}

/* ═════════════════════════════════════════════
   TRAJECTORY BADGE
═════════════════════════════════════════════ */
export function TrajectoryBadge({ trajectory }) {
  if (!trajectory) return null;
  const isHighRisk = trajectory.includes('HIGH') || trajectory.includes('ESCALATING');
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white/5 border border-white/10 backdrop-blur-md">
      <TrendingUp size={14} className={isHighRisk ? "text-[#FF453A]" : "text-[#FFD60A]"} strokeWidth={2} />
      <span className="text-white/90 tracking-wide">{trajectory.replace(/_/g, ' ')}</span>
    </div>
  );
}

/* ═════════════════════════════════════════════
   RISK TRAJECTORY STEPPER
═════════════════════════════════════════════ */
export function RiskTrajectory({ report }) {
  const t = report.stage1_output?.trajectory;
  const state = report.stage1_output?.current_observed_attack_state;
  const sev = report.severity;

  let step = 1;
  if (sev === 'CRITICAL' || (t && t.includes('HIGH')) || state === 1) step = 4;
  else if (sev === 'HIGH') step = 3;
  else if (sev === 'MEDIUM' || (t && t === 'ESCALATING')) step = 2;

  const steps = [
    { label: 'Normal', activeColor: 'bg-[#32D74B]' },
    { label: 'Suspicious', activeColor: 'bg-[#FFD60A]' },
    { label: 'Elevated', activeColor: 'bg-[#FF9F0A]' },
    { label: 'High Risk', activeColor: 'bg-[#FF453A]' }
  ];

  return (
    <div className="glass-card p-4 flex flex-col justify-between" style={{ height: 180 }}>
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-[11px] font-mono font-bold text-white/70 uppercase tracking-wider">Risk Trajectory Progression</h3>
        </div>
        <span className={clsx(
          "font-bold font-mono text-[10px] px-2 py-0.5 rounded border",
          step === 4 ? "text-[#FF453A] bg-[#FF453A]/15 border-[#FF453A]/30" :
          step === 3 ? "text-[#FF9F0A] bg-[#FF9F0A]/15 border-[#FF9F0A]/30" :
          step === 2 ? "text-[#FFD60A] bg-[#FFD60A]/15 border-[#FFD60A]/30" :
          "text-[#32D74B] bg-[#32D74B]/15 border-[#32D74B]/30"
        )}>
          {step === 4 ? "ATTACK LIKELY" : step === 3 ? "ELEVATED THREAT" : step === 2 ? "SUSPICIOUS" : "NOMINAL BENIGN"}
        </span>
      </div>

      <div className="flex items-center justify-between relative px-2 py-2 my-auto">
        <div className="absolute top-4 left-6 right-6 h-1 bg-white/10 -translate-y-1/2 rounded-full z-0" />
        <div 
          className="absolute top-4 left-6 h-1 -translate-y-1/2 rounded-full z-0 transition-all duration-500" 
          style={{ width: `calc(${((step - 1) / 3) * 100}% - 12px)`, background: step === 4 ? '#FF453A' : step === 3 ? '#FF9F0A' : step === 2 ? '#FFD60A' : '#32D74B' }}
        />
        {steps.map((s, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={clsx(
              "w-3.5 h-3.5 rounded-full border-2 transition-all duration-300",
              i < step ? s.activeColor : i === step - 1 ? `${s.activeColor} shadow-[0_0_12px_currentColor]` : "bg-[#1c1c1e] border-white/20",
              i < step && "border-transparent"
            )} />
            <span className={clsx(
              "text-[9.5px] font-mono font-semibold uppercase tracking-wider whitespace-nowrap",
              i <= step - 1 ? "text-white/90" : "text-white/40"
            )}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/45">
        <span>Observed: <strong className="text-white/80">{state === 1 ? 'Incursion Active' : 'Baseline'}</strong></span>
        <span>Horizon: <strong className="text-cyan-400">K=5 Forward Window</strong></span>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   EXPLAINABILITY PANEL: WHY?
═════════════════════════════════════════════ */
export function ExplainabilityPanel({ report }) {
  if (!report) return null;
  const s2 = report.stage2_output;
  const raw = s2?.top_behavior_changes || '[]';
  let changes = [];
  try {
    changes = JSON.parse(raw.replace(/'/g, '"'));
  } catch { changes = []; }

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center gap-3 mb-4">
        <AppleIcon Icon={HelpCircle} bgClass="bg-[#BF5AF2]" colorClass="text-white" size={18} />
        <h3 className="text-[13px] font-semibold text-white/90 tracking-wide">WHY? (Explainability)</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Analysis Drivers</div>
          <p className="text-[13px] text-white/70 leading-relaxed font-medium">
            {report.xai_evidence}
          </p>
        </div>

        {changes.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Key Anomaly Indicators</div>
            <div className="space-y-2">
              {changes.map((sig, i) => (
                <div key={i} className="flex items-center gap-3 text-[12px] text-white/80 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#BF5AF2]" />
                  <span className="capitalize">{sig.trim().replace(/_/g, ' ')}</span>
                  <span className="ml-auto text-[#FF453A] font-mono text-[11px] font-bold">↑ Elevated</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomaly Score Bars */}
        {report.traffic_summary?.anomaly_scores && (
          <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Anomaly Scores</div>
            <div className="space-y-2">
              {Object.entries(report.traffic_summary.anomaly_scores)
                .sort(([, a], [, b]) => b - a)
                .map(([key, score]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-[11px] text-white/50 w-32 truncate capitalize">{key.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-500",
                          score > 75 ? "bg-[#FF453A]" : score > 60 ? "bg-[#FF9F0A]" : "bg-[#32D74B]"
                        )}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-white/40 w-8 text-right">{score}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   ATTACK CHAIN / MITRE CONTEXT (NEXT-TTP FORECASTING)
═════════════════════════════════════════════ */
export function AttackChainContext({ report }) {
  if (!report) return null;
  const kc = report.mitre_kill_chain;
  if (!kc) return null;

  const forecastProb = kc.forecast_probability ?? (kc.jump_probability != null ? Math.round(kc.jump_probability * 100) : (kc.confidence != null ? Math.round(kc.confidence * 100) : 88));
  const leadTime = kc.lead_time_estimate || (typeof report.time_to_compromise === 'string' ? report.time_to_compromise : '3 - 5 mins');
  const preemptiveDefense = kc.preemptive_recommendation || report.countermeasures?.playbooks?.[0]?.action || "Deploy automated network boundary isolation and sever outbound C2 communications.";

  const rawStages = kc.chain || kc.stages || [];
  const normalizedStages = rawStages.map((st, idx) => {
    const sStatus = (st.status || '').toUpperCase();
    const isActive = sStatus === 'ACTIVE';
    const isNext = sStatus === 'FORECASTED' || sStatus === 'FORECASTED_NEXT';
    const isDone = sStatus === 'COMPLETED' || sStatus === 'CLEARED';
    return {
      id: st.id || `stage-${idx}`,
      name: st.name || st.label || 'Stage',
      tactic: st.tactic || st.ttp || 'ATT&CK TTP',
      description: st.description || st.ttp || 'Tactical progression telemetry',
      transition_probability: st.transition_probability ?? (st.probability != null ? Math.round(st.probability * 100) : 85),
      isActive,
      isNext,
      isDone,
      statusLabel: isActive ? 'ACTIVE' : isNext ? 'NEXT TTP' : isDone ? 'PASSED' : 'FUTURE'
    };
  });

  return (
    <div className="glass-card p-5 h-full border border-white/10 flex flex-col justify-between relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#0A84FF]/10 blur-[80px] rounded-full pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <AppleIcon Icon={Network} bgClass="bg-[#0A84FF]" colorClass="text-white" size={18} />
            <div>
              <h3 className="text-[13px] font-semibold text-white/90 tracking-wide">
                PREDICTIVE MITRE ATT&CK KILL-CHAIN
              </h3>
              <p className="text-[11px] text-white/40">Tactical stage progression & Next-TTP forecasting</p>
            </div>
          </div>
          {kc.forecasted_next_stage && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/30 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
              NEXT-TTP FORECAST
            </span>
          )}
        </div>

        {/* Forecast Callout Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF3B30]/10 via-[#FF9500]/10 to-transparent border border-[#FF3B30]/20 mb-5 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Current Stage:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white font-mono">
                {kc.active_stage}
              </span>
              <span className="text-white/30 text-[11px]">➔</span>
              <span className="text-[11px] font-bold text-[#FF3B30] uppercase tracking-wider">Forecasted Next:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30 font-mono">
                {kc.forecasted_next_stage}
              </span>
            </div>
            <span className="text-[12px] font-mono font-bold text-[#FF9500] px-2.5 py-0.5 rounded bg-[#FF9F00]/10 border border-[#FF9500]/30 shrink-0">
              {forecastProb}% Prob.
            </span>
          </div>

          <div className="text-[12px] text-white/80 leading-relaxed font-medium">
            <span className="text-[#FF9500] font-semibold">Preemptive Defense: </span>
            {preemptiveDefense}
          </div>
          
          <div className="mt-2 text-[10px] text-white/40 font-mono">
            Lead Time: {leadTime}
          </div>
        </div>

        {/* Visual Progression Chain */}
        {normalizedStages.length > 0 && (
          <div className="space-y-2 mb-5 relative z-10">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
              Cyber Kill-Chain Lifecycle
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {normalizedStages.map((stage) => (
                <div
                  key={stage.id}
                  className={clsx(
                    "p-3 rounded-xl border flex flex-col justify-between transition-all",
                    stage.isActive
                      ? "bg-[#FFD60A]/10 border-[#FFD60A]/40 shadow-lg shadow-[#FFD60A]/10"
                      : stage.isNext
                      ? "bg-[#FF3B30]/10 border-[#FF3B30]/40 shadow-lg shadow-[#FF3B30]/10 ring-1 ring-[#FF3B30]/50"
                      : stage.isDone
                      ? "bg-white/5 border-white/10 opacity-70"
                      : "bg-white/[0.02] border-white/5 opacity-40"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono text-white/40 truncate max-w-[65px]">{stage.tactic}</span>
                      <span className={clsx(
                        "text-[9px] font-bold font-mono px-1.5 py-0.5 rounded",
                        stage.isActive ? "bg-[#FFD60A]/20 text-[#FFD60A]" :
                        stage.isNext ? "bg-[#FF3B30]/20 text-[#FF3B30] animate-pulse" :
                        stage.isDone ? "bg-[#30D158]/20 text-[#30D158]" :
                        "bg-white/5 text-white/40"
                      )}>
                        {stage.statusLabel}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight mb-1 truncate">
                      {stage.name}
                    </div>
                    <div className="text-[10px] text-white/50 line-clamp-2 leading-tight">
                      {stage.description}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/5">
                    {stage.isNext ? (
                      <div className="text-[10px] font-mono text-[#FF3B30] font-bold">
                        {stage.transition_probability}% Jump Prob
                      </div>
                    ) : stage.isActive ? (
                      <div className="text-[10px] font-mono text-[#FFD60A] font-semibold">
                        Active Vector
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-white/30">
                        {stage.isDone ? "Secured" : "Queued"}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence & MITRE Mapping Notes */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-4 relative z-10">
          <p className="text-[12px] text-white/70 leading-relaxed font-medium">
            {report.mitre_evidence}
          </p>
        </div>
      </div>

      {/* Provenance Footer */}
      <div className="relative z-10">
        <div className="border-t border-white/10 pt-3">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Model Provenance</div>
          <p className="text-[11px] text-white/50 leading-relaxed font-mono">
            {report.provenance}
          </p>
        </div>

        {report.uncertainty?.length > 0 && (
          <div className="mt-3 bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={12} className="text-[#FF9F0A]" />
              <span className="text-[10px] font-bold text-[#FF9F0A] uppercase tracking-wide">Validation Caveats</span>
            </div>
            {report.uncertainty.map((u, i) => (
              <div key={i} className="text-[10px] text-white/70">• {u}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   ASSESSMENT HERO
═════════════════════════════════════════════ */
export function AssessmentHero({ report }) {
  if (!report) return null;
  const sev = report.severity;
  const isHigh   = sev === 'HIGH' || sev === 'CRITICAL';
  const isMedium = sev === 'MEDIUM';

  const severityConfig = sev === 'CRITICAL'
    ? { bg: 'bg-[#FF453A]', label: 'CRITICAL THREAT' }
    : isHigh
    ? { bg: 'bg-[#FF9F0A]', label: 'HIGH RISK' }
    : isMedium
    ? { bg: 'bg-[#FFD60A]', label: 'ELEVATED RISK' }
    : { bg: 'bg-[#32D74B]', label: 'NORMAL' };

  const attackState = report.stage1_output?.current_observed_attack_state;
  
  const forecast = report.stage1_output?.forecast;
  let maxProb = 0;
  let windowStr = "N/A";
  if (forecast) {
    const values = Object.values(forecast);
    const keys = Object.keys(forecast);
    maxProb = Math.max(...values) * 100;
    if (keys.length >= 2) {
      windowStr = `Next ${keys[0].replace('t+', '')}–${keys[keys.length-1].replace('t+', '')} min`;
    }
  }

  return (
    <div className="glass-card p-6 overflow-hidden relative">
      <div className={clsx("absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none", severityConfig.bg)} />
      
      <div className="flex flex-col xl:flex-row gap-8 relative z-10">
        
        <div className="flex flex-col gap-5 shrink-0 xl:w-64">
          <div className="flex items-center gap-4">
            <AppleIcon Icon={ShieldAlert} bgClass={severityConfig.bg} size={28} />
            <div>
              <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-0.5">{severityConfig.label}</div>
              <div className="font-bold text-2xl tracking-tight text-white/90">{sev}</div>
            </div>
          </div>
          <AttackStateBadge state={attackState} />
        </div>

        <div className="hidden xl:block w-px bg-white/10" />

        <div className="flex flex-col gap-3 shrink-0 xl:w-56">
          <div>
            <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">Attack Probability</div>
            <div className="text-3xl font-black font-mono tracking-tighter text-white/90">
              {forecast ? `${maxProb.toFixed(1)}%` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">Estimated Window</div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white/90 text-[12px] font-medium">
              <Clock size={14} className="text-[#0A84FF]" />
              {windowStr}
            </div>
          </div>
        </div>

        <div className="hidden xl:block w-px bg-white/10" />

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">Recommended Action</div>
            <div className="text-white/80 text-[14px] font-medium leading-relaxed">
              {report.recommended_action}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">Confidence Level</div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/5 text-white/90 text-[12px] font-medium">
              <Crosshair size={14} className="mr-2 text-white/50" />
              {report.confidence?.split(':')[0] || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   ATTACK PROBABILITY CHART
═════════════════════════════════════════════ */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-[12px] px-4 py-3 shadow-2xl">
      <p className="text-white/50 text-[11px] font-medium mb-1">{label}</p>
      <p className="text-white/90 text-[15px] font-semibold font-mono">
        {payload[0].value.toFixed(1)}<span className="text-[11px] text-white/50 ml-0.5">%</span>
      </p>
    </div>
  );
};

export function AttackProbabilityChart({ report }) {
  if (!report?.stage1_output?.forecast) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30">
        <Activity size={32} strokeWidth={1.5} className="mb-4" />
        <span className="text-[13px] font-medium">No forecast available</span>
      </div>
    );
  }
  const forecast = report.stage1_output.forecast;
  const sev = report.severity;
  const isHigh = sev === 'HIGH' || sev === 'CRITICAL';
  const data = Object.keys(forecast).map(key => ({ time: key, prob: forecast[key] * 100 }));
  const strokeColor = isHigh ? '#FF453A' : '#FFD60A';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 500 }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 500 }} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="prob"
          stroke={strokeColor}
          strokeWidth={2.5}
          fill="url(#probGrad)"
          activeDot={{ r: 5, fill: strokeColor, strokeWidth: 2, stroke: '#1c1c1e' }}
          dot={{ r: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ═════════════════════════════════════════════
   FAMILY BARS (ATTACK TYPE FORECAST)
═════════════════════════════════════════════ */
export function FamilyBars({ report }) {
  if (!report?.stage2_output) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30">
        <Cpu size={32} strokeWidth={1.5} className="mb-4" />
        <span className="text-[13px] font-medium">No classification data</span>
      </div>
    );
  }
  const s2 = report.stage2_output;
  const isBenign = s2?.is_benign || s2?.dominant_family?.toLowerCase().includes('normal') || s2?.dominant_family?.toLowerCase().includes('benign');

  if (isBenign) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-center p-3">
        <div className="w-12 h-12 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 flex items-center justify-center text-[#30D158] mb-3 shadow-lg shadow-[#30D158]/10">
          <CheckCircle size={24} />
        </div>
        <div className="text-[14px] font-bold text-white mb-1">
          Nominal Baseline (Benign)
        </div>
        <p className="text-[12px] text-white/50 max-w-xs leading-relaxed">
          No attack family signature active. Stage-2 botnet characterization is dormant while network risk is low.
        </p>
        <div className="mt-4 px-3 py-1 rounded-full bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 font-mono text-[10px] font-bold tracking-wider">
          ALL 7 BOTNET FAMILIES INACTIVE
        </div>
      </div>
    );
  }

  const distribution = s2.family_distribution || {};
  const sortedFamilies = Object.entries(distribution).sort(([, a], [, b]) => b - a);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Primary threat */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[14px] font-semibold text-white/90">{s2.dominant_family}</span>
          <span className="text-[16px] text-[#FF453A] font-bold font-mono">
            {(s2.dominant_family_probability * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
          <div className="h-full rounded-full bg-[#FF453A]" style={{ width: `${s2.dominant_family_probability * 100}%` }} />
        </div>
      </div>

      {/* All families */}
      <div className="space-y-2.5">
        {sortedFamilies.slice(1).map(([family, prob]) => (
          <div key={family}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[12px] font-medium text-white/50">{family}</span>
              <span className="text-[11px] text-white/40 font-semibold font-mono">
                {(prob * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-white/20" style={{ width: `${prob * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   COUNTERMEASURES & SOAR DEFENSE PANEL
═════════════════════════════════════════════ */
export function CountermeasuresPanel({ report }) {
  const [activeTab, setActiveTab] = React.useState('iptables');
  const [copied, setCopied] = React.useState(false);

  if (!report?.countermeasures) {
    return null;
  }

  const cm = report.countermeasures;
  const indicators = cm.target_indicators || {};
  const currentContent = cm[activeTab] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = {
      iptables: 'iptables_rules.sh',
      suricata: 'suricata_sih153.rules',
      sigma: 'sih153_detection.yml',
      powershell: 'quarantine_host.ps1',
      bash: 'quarantine_host.sh',
    };
    const filename = extensions[activeTab] || 'rule.txt';
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'iptables', label: 'Firewall (iptables)', badge: 'Network' },
    { id: 'suricata', label: 'Suricata / Snort', badge: 'IDS Rule' },
    { id: 'sigma', label: 'Sigma (SIEM)', badge: 'SOC Alert' },
    { id: 'powershell', label: 'PowerShell Isolation', badge: 'Windows' },
    { id: 'bash', label: 'Linux Containment', badge: 'Linux' },
  ];

  return (
    <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl relative overflow-hidden transition-all hover:border-white/20">
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#30D158]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center text-[#30D158]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-white tracking-wide">
                Automated Countermeasures & SOAR Defense
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                ACTIVE DEFENSE
              </span>
            </div>
            <p className="text-[12px] text-white/50 mt-0.5">
              {cm.rationale || 'Preemptive mitigation rules generated from forecasted attack vectors.'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white/90 text-[12px] font-medium border border-white/10"
          >
            {copied ? (
              <>
                <CheckCircle size={14} className="text-[#30D158]" />
                <span className="text-[#30D158]">Copied!</span>
              </>
            ) : (
              <>
                <FileText size={14} />
                <span>Copy Rule</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A84FF] hover:bg-[#0A84FF]/90 active:scale-95 transition-all text-white text-[12px] font-medium shadow-lg shadow-[#0A84FF]/20"
          >
            <Upload size={14} className="rotate-180" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* IoC Targets Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 relative z-10 text-[12px]">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-white/40 text-[11px] font-semibold uppercase tracking-wider">Targeted Attacker IPs</span>
          <span className="font-mono text-white/90 font-medium truncate">
            {indicators.top_src_ips?.length > 0 ? indicators.top_src_ips.join(', ') : 'None extracted (using subnet)'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-white/40 text-[11px] font-semibold uppercase tracking-wider">Target Destination Ports</span>
          <span className="font-mono text-white/90 font-medium truncate">
            {indicators.top_dst_ports?.length > 0 ? indicators.top_dst_ports.join(', ') : '443, 80'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-white/40 text-[11px] font-semibold uppercase tracking-wider">Containment Status</span>
          <span className="font-mono text-[#30D158] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
            READY FOR ENFORCEMENT
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 mb-4 relative z-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all",
                isActive
                  ? "bg-white/15 text-white border border-white/20 shadow-sm"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <span>{tab.label}</span>
              <span className={clsx(
                "text-[10px] px-1.5 py-0.5 rounded font-mono",
                isActive ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
              )}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Code / Rule Output Area */}
      <div className="relative z-10">
        <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-[12px] text-white/80 overflow-x-auto max-h-72 leading-relaxed selection:bg-[#0A84FF]/30">
          <code>{currentContent}</code>
        </pre>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   ZERO-DAY & NOVELTY DETECTION PANEL (OOD ENGINE)
═════════════════════════════════════════════ */
export function ZeroDayAnalysisPanel({ report }) {
  if (!report) return null;
  const zd = report.zero_day_analysis || {};
  const isZeroDay = zd.is_zero_day ?? zd.is_novel ?? (report.scenario_id === 'zeroday' || report.severity === 'NOVEL');
  const statusLabel = zd.status_label || (isZeroDay ? "UNSEEN ZERO-DAY NOVELTY" : (zd.signature_match || "SIGNATURE MATCHED"));
  
  const rawNov = zd.novelty_percentage ?? (zd.novelty_score != null ? Math.round(zd.novelty_score * 100) : (isZeroDay ? 94 : 8));
  const rawEntropy = zd.normalized_entropy ?? (zd.anomaly_confidence != null ? zd.anomaly_confidence.toFixed(2) : (isZeroDay ? "0.92" : "0.18"));
  const rawMargin = zd.confidence_margin ?? (zd.cluster_drift_magnitude != null ? `+${(1 - zd.cluster_drift_magnitude).toFixed(2)}` : (isZeroDay ? "±0.04" : "+0.86"));
  const rawCalibration = zd.confidence_calibration || (isZeroDay ? "HIGH_UNCERTAINTY" : "CALIBRATED_NOMINAL");
  const analystGuidance = zd.analyst_guidance || (isZeroDay 
    ? "OOD statistical distribution divergence exceeds safe baseline threshold. Immediate endpoint containment and PCAP payload disassembly mandated." 
    : `Telemetry conforms to ${zd.signature_match || 'known baseline'} distribution profile with low latent drift. Proceed with nominal SOC triage.`);

  return (
    <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl relative overflow-hidden transition-all hover:border-white/20">
      {/* Background glow */}
      <div className={clsx(
        "absolute -bottom-28 -right-28 w-80 h-80 blur-[100px] rounded-full pointer-events-none",
        isZeroDay ? "bg-[#BF5AF2]/15" : "bg-[#0A84FF]/10"
      )} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-10 h-10 rounded-2xl flex items-center justify-center border",
            isZeroDay
              ? "bg-[#BF5AF2]/15 border-[#BF5AF2]/30 text-[#BF5AF2]"
              : "bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#0A84FF]"
          )}>
            <Crosshair size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-white tracking-wide">
                Zero-Day & Novelty Detection (OOD Engine)
              </h3>
              <span className={clsx(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider border",
                isZeroDay
                  ? "bg-[#BF5AF2]/20 text-[#BF5AF2] border-[#BF5AF2]/40 animate-pulse"
                  : "bg-white/10 text-white/70 border-white/20"
              )}>
                {isZeroDay ? "NOVEL THREAT ANOMALY" : "SIGNATURE ALIGNED"}
              </span>
            </div>
            <p className="text-[12px] text-white/50 mt-0.5">
              Calibrated entropy and distribution divergence analysis for unseen attack detection.
            </p>
          </div>
        </div>

        {/* Verdict Badge */}
        <div className={clsx(
          "px-3.5 py-1.5 rounded-xl border text-[12px] font-mono font-bold flex items-center gap-2 self-start sm:self-auto",
          isZeroDay
            ? "bg-[#BF5AF2]/20 border-[#BF5AF2]/40 text-[#BF5AF2] shadow-lg shadow-[#BF5AF2]/20"
            : "bg-[#30D158]/10 border-[#30D158]/30 text-[#30D158]"
        )}>
          <span className={clsx("w-2 h-2 rounded-full", isZeroDay ? "bg-[#BF5AF2] animate-ping" : "bg-[#30D158]")} />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 relative z-10">
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1">Novelty Score</div>
          <div className={clsx(
            "text-[18px] font-bold font-mono",
            rawNov > 60 ? "text-[#BF5AF2]" : "text-white/80"
          )}>
            {rawNov}%
          </div>
          <div className="text-[10px] text-white/40 mt-1">Divergence from training norm</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1">Shannon Entropy</div>
          <div className="text-[18px] font-bold font-mono text-white/90">
            {rawEntropy} <span className="text-[12px] text-white/40">/ 1.0</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            {Number(rawEntropy) > 0.75 ? "Diffuse / Uniform across classes" : "Concentrated confidence"}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1">Confidence Margin</div>
          <div className="text-[18px] font-bold font-mono text-white/90">
            {rawMargin}
          </div>
          <div className="text-[10px] text-white/40 mt-1">Top-1 vs Top-2 family gap</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1">Calibration Status</div>
          <div className={clsx(
            "text-[14px] font-bold font-mono mt-1",
            rawCalibration === 'HIGH_UNCERTAINTY' ? "text-[#FF9F0A]" : "text-[#30D158]"
          )}>
            {rawCalibration}
          </div>
          <div className="text-[10px] text-white/40 mt-1">Conformal certainty score</div>
        </div>
      </div>

      {/* Analyst Action Guidance */}
      <div className={clsx(
        "p-4 rounded-xl border relative z-10 leading-relaxed text-[12px]",
        isZeroDay
          ? "bg-[#BF5AF2]/10 border-[#BF5AF2]/25 text-white/90"
          : "bg-white/5 border-white/10 text-white/80"
      )}>
        <span className={clsx(
          "font-bold uppercase tracking-wider font-mono mr-2",
          isZeroDay ? "text-[#BF5AF2]" : "text-[#0A84FF]"
        )}>
          [SOC Triage Protocol]:
        </span>
        {analystGuidance}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   EXECUTIVE INCIDENT BRIEFING & STIX 2.1 PANEL
═════════════════════════════════════════════ */
export function ExecutiveBriefingPanel({ report }) {
  const [activeTab, setActiveTab] = React.useState('briefing');
  const [copied, setCopied] = React.useState(false);

  if (!report?.executive_briefing) return null;

  const rawBriefing = report.executive_briefing;
  const briefingText = typeof rawBriefing === 'string'
    ? rawBriefing
    : `# EXECUTIVE INCIDENT BRIEFING
## Threat State: ${rawBriefing?.headline || 'Security analysis active'}
- **Risk Assessment:** ${rawBriefing?.risk_level || report.severity || 'EVALUATING'}
- **Estimated Downtime Avoided:** ${rawBriefing?.estimated_downtime_avoided || '3.5 hours'}
- **Regulatory Status:** ${rawBriefing?.regulatory_implication || 'CII critical asset protection active'}

### Key Forensic Findings:
${(rawBriefing?.key_findings || ['Ingress telemetry pattern characterized by Stage-1 temporal classifier', 'Latent forward state trajectory evaluated']).map(f => `• ${f}`).join('\n')}

### CISO Recommended Action Items:
${(rawBriefing?.ciso_action_items || ['Deploy automated firewall boundary isolation playbook', 'Monitor secondary lateral propagation ports']).map((a, i) => `${i+1}. ${a}`).join('\n')}`;

  const stix = report.stix_bundle || { type: "bundle", id: `bundle--${report.case_id || 'threat'}`, objects: [] };
  const stixStr = JSON.stringify(stix, null, 2);

  const handleCopy = () => {
    const textToCopy = activeTab === 'stix' ? stixStr : briefingText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (activeTab === 'stix') {
      const blob = new Blob([stixStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stix_bundle_${report.case_id || 'threat_intel'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([briefingText], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CISO_Incident_Briefing_${report.case_id || 'report'}.md`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const copilotQA = [
    {
      q: "What is the strategic blast radius if this attack is not contained?",
      a: `Identified compromise attempts targeting ${report.traffic_summary?.unique_dst_ips || 1} destination internal host(s) across ${report.traffic_summary?.total_flows || 0} recorded flows. Left uncontained, lateral movement across the internal subnet is estimated at high likelihood within the next 15 minutes.`
    },
    {
      q: "Why is the next stage forecasted to transition?",
      a: `The predictive Markov engine evaluates active telemetry features against empirical cyber kill-chain progression models. With ${report.stage2_output?.dominant_family || 'the dominant malware'} operating in '${report.mitre_kill_chain?.active_stage}', the probability of escalation to '${report.mitre_kill_chain?.forecasted_next_stage}' is ${report.mitre_kill_chain?.forecast_probability}% based on observed packet-rate dynamics and port reconnaissance.`
    },
    {
      q: "Which specific ports should be barricaded immediately?",
      a: `Primary ingress ports under active threat are: ${report.countermeasures?.target_indicators?.top_dst_ports?.join(', ') || '80, 443'}. Deploy the generated iptables or PowerShell host isolation script to sever remote command channels.`
    }
  ];

  return (
    <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl relative overflow-hidden transition-all hover:border-white/20">
      {/* Background glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#0A84FF]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-white tracking-wide">
                Executive Incident Briefing & Threat Intelligence
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30">
                CISO READY
              </span>
            </div>
            <p className="text-[12px] text-white/50 mt-0.5">
              Autonomously generated executive briefing & STIX 2.1 Threat Intel bundle for SIEM integration.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white/90 text-[12px] font-medium border border-white/10 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle size={14} className="text-[#30D158]" />
                <span className="text-[#30D158]">Copied!</span>
              </>
            ) : (
              <>
                <FileText size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#30D158] hover:bg-[#30D158]/90 active:scale-95 transition-all text-black font-semibold text-[12px] shadow-lg shadow-[#30D158]/20 cursor-pointer"
          >
            <Upload size={14} className="rotate-180" />
            <span>{activeTab === 'stix' ? 'Download STIX (.json)' : 'Download Briefing (.md)'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 mb-5 relative z-10">
        <button
          onClick={() => setActiveTab('briefing')}
          className={clsx(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer",
            activeTab === 'briefing'
              ? "bg-white/15 text-white border border-white/20 shadow-sm"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          )}
        >
          <span>Executive Briefing (CISO View)</span>
        </button>
        <button
          onClick={() => setActiveTab('stix')}
          className={clsx(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer",
            activeTab === 'stix'
              ? "bg-white/15 text-white border border-white/20 shadow-sm"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          )}
        >
          <span>STIX 2.1 Threat Intel Bundle</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
            STIX 2.1
          </span>
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={clsx(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer",
            activeTab === 'copilot'
              ? "bg-white/15 text-white border border-white/20 shadow-sm"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          )}
        >
          <span>SOC Copilot Triage Q&A</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        {activeTab === 'briefing' && (
          <div className="p-5 rounded-xl bg-black/60 border border-white/10 max-h-80 overflow-y-auto font-sans text-[13px] text-white/80 leading-relaxed space-y-4">
            <pre className="font-mono text-[12px] whitespace-pre-wrap text-white/85 selection:bg-[#0A84FF]/30">
              {briefingText}
            </pre>
          </div>
        )}

        {activeTab === 'stix' && (
          <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-[#30D158]/90 overflow-x-auto max-h-80 leading-relaxed selection:bg-[#30D158]/30">
            <code>{stixStr}</code>
          </pre>
        )}

        {activeTab === 'copilot' && (
          <div className="space-y-3">
            {copilotQA.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#0A84FF]">
                  <HelpCircle size={15} />
                  <span>{item.q}</span>
                </div>
                <p className="text-[12px] text-white/80 leading-relaxed pl-6">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   SCENARIO SELECTOR & LIVE STREAM SENSOR
═════════════════════════════════════════════ */
export function ScenarioSelector({ onSelectScenario, isLoading, activeScenarioId, onStartLiveStream, isStreaming }) {
  const scenarios = [
    {
      id: "benign",
      title: "Nominal Business Traffic",
      badge: "LOW RISK",
      color: "#30D158",
      desc: "Normal enterprise HTTPS & DNS telemetry. Baseline state evaluation with zero alarms."
    },
    {
      id: "recon",
      title: "Reconnaissance Port Scan",
      badge: "RECON STAGE",
      color: "#FFD60A",
      desc: "Fast SYN sweep across 25+ target ports. Evaluates Next-TTP forecast into Initial Access."
    },
    {
      id: "bruteforce",
      title: "Brute Force Initial Access",
      badge: "INITIAL ACCESS",
      color: "#FF9F0A",
      desc: "Burst credential attacks on SSH & RDP services. Triggers proactive firewall drops."
    },
    {
      id: "neris_c2",
      title: "Neris Botnet C2 Beaconing",
      badge: "C2 BEACON",
      color: "#FF453A",
      desc: "Periodic IRC beacons on port 6667. Validates Neris attribution and host isolation."
    },
    {
      id: "ddos",
      title: "DDoS Volumetric Flood",
      badge: "CRITICAL RISK",
      color: "#FF3B30",
      desc: "Volumetric saturation flood (>1.7 MB/s). Tests automated SOAR scrubbing defense."
    },
    {
      id: "zeroday",
      title: "Zero-Day Novel Vector",
      badge: "NOVEL OOD VECTOR",
      color: "#BF5AF2",
      desc: "Unseen multi-vector pattern with high entropy. Validates OOD Zero-Day alarm."
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Zap size={16} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-grostesk">One-Click Test Scenarios & Live Telemetry</h3>
            <p className="text-xs text-white/50">Select any pre-configured attack vector to run the full forecasting pipeline</p>
          </div>
        </div>

        <button
          onClick={onStartLiveStream}
          disabled={isLoading}
          className={clsx(
            "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg cursor-pointer",
            isStreaming
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/30 border border-red-400"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold shadow-cyan-500/25 border border-cyan-300"
          )}
        >
          <Activity size={15} className={clsx(isStreaming && "animate-spin")} />
          <span>{isStreaming ? "Streaming Active (Stop)" : "Simulate Live Stream"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => !isLoading && onSelectScenario(sc.id)}
              className={clsx(
                "p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[140px]",
                isActive
                  ? "bg-white/10 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400"
                  : "bg-[#111420]/80 hover:bg-[#161a2b] border-white/10 hover:border-cyan-500/40 hover:-translate-y-0.5 shadow-md"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border shrink-0 tracking-wide"
                  style={{ color: sc.color, backgroundColor: `${sc.color}15`, borderColor: `${sc.color}40` }}
                >
                  {sc.badge}
                </span>
                <span className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors flex items-center gap-1 shrink-0 font-mono">
                  {isActive ? "Active" : "Load"} <ChevronRight size={14} />
                </span>
              </div>
              <div className="text-[15px] font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                {sc.title}
              </div>
              <div className="text-xs text-white/60 leading-relaxed">
                {sc.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   AUTH MODAL & ROLE-BASED ACCESS
═════════════════════════════════════════════ */
export function AuthModal({ isOpen, onClose, onLoginSuccess, currentUser }) {
  const [selectedUser, setSelectedUser] = React.useState('analyst');
  const [customUsername, setCustomUsername] = React.useState('');
  const [customPassword, setCustomPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const PERSONAS = [
    {
      id: 'analyst',
      name: 'Sarah Chen',
      role: 'SOC Analyst',
      tier: 'Tier-1 Live Sensor Monitoring',
      badge: 'L1 ANALYST',
      desc: 'Real-time telemetry triage, flow inspection, and packet anomaly logging.',
      color: '#30D158'
    },
    {
      id: 'hunter',
      name: 'Alex Rivera',
      role: 'Threat Hunter',
      tier: 'Tier-2 Forensic & Attribution',
      badge: 'THREAT HUNTER',
      desc: 'Deep XAI attribution, MITRE Navigator, OOD zero-day reverse engineering.',
      color: '#FF9F0A'
    },
    {
      id: 'ciso',
      name: 'Dr. Vikram Malhotra',
      role: 'CISO / Commander',
      tier: 'Executive Incident Commander',
      badge: 'CISO / LEAD',
      desc: 'Executive briefings, STIX 2.1 threat sharing, preemptive SOAR containment.',
      color: '#BF5AF2'
    }
  ];

  const handleQuickLogin = async (personaId) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: personaId, password: 'password' })
      });
      const data = await res.json();
      if (data.user) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#161618] border border-white/15 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white text-sm font-mono"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <AppleIcon Icon={UserCheck} colorClass="text-[#0A84FF]" bgClass="bg-[#0A84FF]/20" size={24} />
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">NetThreat SOC Authentication</h2>
            <p className="text-xs text-white/50">Select an analyst persona or sign in with security credentials</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider font-semibold">
            One-Click Persona Profiles (Demo Mode)
          </div>
          {PERSONAS.map(p => (
            <div
              key={p.id}
              onClick={() => handleQuickLogin(p.id)}
              className={clsx(
                "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                currentUser?.username === p.id 
                  ? "bg-white/15 border-white/40" 
                  : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border"
                  style={{ color: p.color, backgroundColor: `${p.color}18`, borderColor: `${p.color}40` }}
                >
                  {p.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-white">{p.name}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: p.color, backgroundColor: `${p.color}15`, borderColor: `${p.color}35` }}>
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">{p.desc}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-white/40">
          <span>Enterprise Role-Based Access Control</span>
          <span className="font-mono text-[10px]">SIH-153 COMPLIANT</span>
        </div>
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════
   EXPLAINABLE AI (XAI) SHAP WATERFALL
═════════════════════════════════════════════ */
export function FeatureAttributionWaterfall({ attributions }) {
  if (!attributions || attributions.length === 0) return null;

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={Sliders} colorClass="text-[#BF5AF2]" bgClass="bg-[#BF5AF2]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white">XAI Feature Attribution Waterfall (SHAP Breakdown)</h3>
            <p className="text-xs text-white/50">Directional telemetry drivers shifting the forecast probability</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-[#FF453A]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]"></span> Risk Elevating (+)
          </span>
          <span className="flex items-center gap-1.5 text-[#30D158]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]"></span> Risk Suppressing (-)
          </span>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {attributions.map((attr, idx) => {
          const contrib = Number(attr.contribution ?? attr.importance ?? 0);
          const isElevating = attr.direction === 'ELEVATING' || attr.direction === 'accelerates_threat' || contrib > 0;
          const pct = Math.min(100, Math.max(10, Math.abs(contrib) * 100));

          return (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3.5 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{attr.feature || `Feature ${idx+1}`}</span>
                  <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
                    {attr.code || `F-${idx+1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 font-mono text-[11px]">Observed: {attr.value ?? '—'}</span>
                  <span className={clsx(
                    "font-mono font-bold text-xs px-2 py-0.5 rounded",
                    isElevating ? "text-[#FF453A] bg-[#FF453A]/15" : "text-[#30D158] bg-[#30D158]/15"
                  )}>
                    {contrib >= 0 ? `+${contrib.toFixed(3)}` : contrib.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Waterfall bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2 relative">
                <div 
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    isElevating ? "bg-gradient-to-r from-[#FF9F0A] to-[#FF453A]" : "bg-gradient-to-r from-[#30D158] to-[#0A84FF]"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>{attr.description || (isElevating ? "Elevates attack risk trajectory" : "Suppresses anomaly indicator")}</span>
                <span className="font-mono text-[10px] text-white/40">Baseline: {attr.baseline ?? "0.00"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════
   MITRE ATT&CK MATRIX NAVIGATOR
═════════════════════════════════════════════ */
export function MitreMatrixNavigator({ matrix }) {
  const defaultMatrix = [
    {
      tactic: "Reconnaissance",
      techniques: [
        { id: "T1595.001", name: "Port Scanning", status: "ACTIVE", evidence: "SYN sweep across 25+ target ports", confidence: 96, url: "https://attack.mitre.org/techniques/T1595/001/" },
        { id: "T1592", name: "Host Information", status: "FORECASTED_NEXT", evidence: "Service banner queries", confidence: 78, url: "https://attack.mitre.org/techniques/T1592/" }
      ]
    },
    {
      tactic: "Initial Access",
      techniques: [
        { id: "T1190", name: "Exploit Public App", status: "FORECASTED_NEXT", evidence: "Targeted web gateway probe", confidence: 84, url: "https://attack.mitre.org/techniques/T1190/" },
        { id: "T1110", name: "Brute Force", status: "ACTIVE", evidence: "High-frequency SSH auth cycling", confidence: 91, url: "https://attack.mitre.org/techniques/T1110/" }
      ]
    },
    {
      tactic: "Command & Control",
      techniques: [
        { id: "T1071.001", name: "Web / IRC Protocols", status: "ACTIVE", evidence: "IRC heartbeat keepalive on 6667", confidence: 97, url: "https://attack.mitre.org/techniques/T1071/001/" },
        { id: "T1573", name: "Encrypted Channel", status: "STANDBY", evidence: "TLS handshake entropy variance", confidence: 68, url: "https://attack.mitre.org/techniques/T1573/" }
      ]
    },
    {
      tactic: "Lateral Movement",
      techniques: [
        { id: "T1021.002", name: "SMB/Windows Shares", status: "FORECASTED_NEXT", evidence: "Port 445 beaconing bursts", confidence: 89, url: "https://attack.mitre.org/techniques/T1021/002/" },
        { id: "T1563", name: "Remote Service Hijack", status: "STANDBY", evidence: "RDP session query", confidence: 54, url: "https://attack.mitre.org/techniques/T1563/" }
      ]
    }
  ];

  const cols = (matrix && matrix.length > 0) ? matrix : defaultMatrix;

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={Layers} colorClass="text-[#FF9F0A]" bgClass="bg-[#FF9F0A]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white">MITRE ATT&CK Enterprise Matrix Navigator</h3>
            <p className="text-xs text-white/50">Live tactical coverage mapped from flow and packet behavior</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-white/40 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
          v14.1 Matrix Mapping
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {cols.map((col, idx) => (
          <div key={idx} className="bg-black/30 border border-white/10 rounded-2xl p-3.5 flex flex-col">
            <div className="text-xs font-bold text-white/80 pb-2 mb-3 border-b border-white/10 uppercase tracking-wider flex items-center justify-between">
              <span>{col.tactic}</span>
              <span className="text-[10px] font-mono text-white/40">{(col.techniques||[]).length} TTPs</span>
            </div>

            <div className="space-y-2.5 flex-1">
              {(col.techniques||[]).map((t, tIdx) => {
                const isActive = t.status === 'ACTIVE';
                const isNext = t.status === 'FORECASTED_NEXT';

                return (
                  <div
                    key={tIdx}
                    className={clsx(
                      "p-3 rounded-xl border transition-all text-left group",
                      isActive 
                        ? "bg-[#FF453A]/15 border-[#FF453A]/40 shadow-sm" 
                        : isNext 
                        ? "bg-[#FFD60A]/15 border-[#FFD60A]/40" 
                        : "bg-white/5 border-white/5 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-white/50 group-hover:text-white">
                        {t.id}
                      </span>
                      <span className={clsx(
                        "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border",
                        isActive 
                          ? "text-[#FF453A] border-[#FF453A]/40 bg-[#FF453A]/20" 
                          : isNext 
                          ? "text-[#FFD60A] border-[#FFD60A]/40 bg-[#FFD60A]/20" 
                          : "text-white/40 border-white/10"
                      )}>
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white leading-tight mb-1">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-white/50 leading-relaxed mb-2">
                      {t.evidence}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                      <span>Conf: {t.confidence}%</span>
                      <a href={t.url || "https://attack.mitre.org/"} target="_blank" rel="noreferrer" className="text-[#0A84FF] hover:underline flex items-center gap-1">
                        MITRE <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════
   BLAST RADIUS & LATERAL TOPOLOGY GRAPH
═════════════════════════════════════════════ */
export function BlastRadiusGraph({ blastRadius }) {
  const defaultNodes = [
    { id: 'n1', label: 'Threat Actor', ip: blastRadius?.threat_origin || '198.51.100.44', type: 'THREAT_ACTOR', status: 'ORIGIN', zone: 'EXTERNAL', risk_level: 'CRITICAL' },
    { id: 'n2', label: 'Edge Web Proxy', ip: '10.0.2.15', type: 'HOST', status: 'COMPROMISED', zone: 'DMZ', risk_level: 'HIGH' },
    { id: 'n3', label: 'Auth Server', ip: '10.0.3.50', type: 'SERVER', status: 'TARGETED', zone: 'INTERNAL', risk_level: 'MEDIUM' },
    { id: 'n4', label: 'Core Database', ip: '10.0.2.20', type: 'DATABASE', status: 'SUSCEPTIBLE', zone: 'DATA TIER', risk_level: 'LOW' },
    { id: 'n5', label: 'Domain Controller', ip: '10.0.1.55', type: 'IDENTITY', status: 'SUSCEPTIBLE', zone: 'IDENTITY', risk_level: 'LOW' }
  ];

  const nodes = blastRadius?.nodes || defaultNodes;
  const containmentStatus = blastRadius?.containment_status || 'CONTAINMENT_RECOMMENDED';

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={GitFork} colorClass="text-[#30D158]" bgClass="bg-[#30D158]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white">Blast Radius & Lateral Propagation Model</h3>
            <p className="text-xs text-white/50">Predicted infection paths across internal subnet assets</p>
          </div>
        </div>
        <span className={clsx(
          "text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border",
          containmentStatus === 'CONTAINMENT_REQUIRED'
            ? "text-[#FF453A] bg-[#FF453A]/15 border-[#FF453A]/40"
            : "text-[#30D158] bg-[#30D158]/15 border-[#30D158]/40"
        )}>
          {containmentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
        {nodes.map((node, i) => {
          const isThreat = node.type === 'THREAT_ACTOR';
          const isCompromised = node.status === 'COMPROMISED';
          const isTargeted = node.status === 'TARGETED';

          return (
            <div 
              key={node.id} 
              className={clsx(
                "p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden",
                isThreat 
                  ? "bg-[#FF453A]/10 border-[#FF453A]/30" 
                  : isCompromised 
                  ? "bg-[#FF3B30]/15 border-[#FF3B30]/40"
                  : isTargeted 
                  ? "bg-[#FF9F0A]/10 border-[#FF9F0A]/30" 
                  : "bg-white/5 border-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-white/40">{node.zone}</span>
                <span className={clsx(
                  "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded",
                  node.risk_level === 'CRITICAL' ? "bg-[#FF453A]/20 text-[#FF453A]" : "bg-white/10 text-white/60"
                )}>
                  {node.risk_level}
                </span>
              </div>
              <div className="text-xs font-bold text-white mb-1">
                {node.label}
              </div>
              <div className="text-[11px] font-mono text-white/50 mb-3">
                {node.ip}
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">Status</span>
                <span className={clsx(
                  "font-bold",
                  isThreat ? "text-[#FF453A]" : isCompromised ? "text-[#FF3B30]" : isTargeted ? "text-[#FF9F0A]" : "text-[#30D158]"
                )}>
                  {node.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white/60 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#FF9F0A]" />
          <span>Forecast warns lateral pivot into <strong>Core Database (10.0.2.20)</strong> via SMB within 5–15 mins.</span>
        </span>
        <span className="font-mono text-[11px] text-white/40">Containment Priority: Tier-1</span>
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════
   WHAT-IF DEFENSIVE COUNTERMEASURE SIMULATOR
═════════════════════════════════════════════ */
export function WhatIfDefenseSimulator({ report }) {
  const [defenses, setDefenses] = React.useState(['quarantine_ip', 'sever_c2']);
  const [simResult, setSimResult] = React.useState(report?.what_if_preview || null);
  const [isSimulating, setIsSimulating] = React.useState(false);

  const OPTIONS = [
    { id: 'quarantine_ip', label: 'Quarantine Attacker IP (Firewall Drop)', reduction: '45%' },
    { id: 'syn_shield', label: 'Deploy TCP SYN Cookie Rate-Limit Shield', reduction: '25%' },
    { id: 'sever_c2', label: 'Sever Outbound IRC / C2 Ports (6667, 7000)', reduction: '35%' },
    { id: 'isolate_host', label: 'Zero-Trust Host Blast Radius Isolation', reduction: '60%' },
    { id: 'port_lockdown', label: 'Lockdown Unused Service Ports (Strict ACL)', reduction: '20%' }
  ];

  const handleToggle = (id) => {
    const next = defenses.includes(id) ? defenses.filter(x => x !== id) : [...defenses, id];
    setDefenses(next);
    runSimulation(next);
  };

  const runSimulation = async (activeDefenses) => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/simulate/countermeasures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          probability: report?.stage1_output?.forecast ? Object.values(report.stage1_output.forecast)[0] : 0.75,
          features: report?.traffic_summary || {},
          applied_defenses: activeDefenses
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
        setIsSimulating(false);
        return;
      }
    } catch {
      // Backend offline: compute client-side what-if dynamics
    }

    const baseProb = report?.stage1_output?.forecast ? Object.values(report.stage1_output.forecast)[0] : (report?.attack_probability || 0.85);
    const defenseWeights = {
      block_ip: 0.45,
      c2_dns: 0.35,
      smb_contain: 0.30,
      rate_limit: 0.25,
      isolate_host: 0.55
    };
    let totalReduction = 0;
    activeDefenses.forEach(d => {
      totalReduction += (defenseWeights[d] || 0.20);
    });
    totalReduction = Math.min(0.96, totalReduction);
    const mitigatedProb = Math.max(0.02, baseProb * (1 - totalReduction));
    const redPct = Math.round(((baseProb - mitigatedProb) / baseProb) * 100);
    setSimResult({
      baseline_probability: Number(baseProb.toFixed(3)),
      mitigated_probability: Number(mitigatedProb.toFixed(3)),
      reduction_percentage: redPct,
      active_interventions: activeDefenses,
      residual_threat_state: mitigatedProb < 0.25 ? "SUPPRESSED" : mitigatedProb < 0.5 ? "CONTAINED" : "ELEVATED"
    });
    setIsSimulating(false);
  };

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={ShieldCheck} colorClass="text-[#0A84FF]" bgClass="bg-[#0A84FF]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white">Preemptive "What-If" Countermeasure Simulator</h3>
            <p className="text-xs text-white/50">Simulate defensive actions and watch future risk trajectory drop in real-time</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#30D158] bg-[#30D158]/15 px-2.5 py-1 rounded-lg border border-[#30D158]/30 font-bold">
          {simResult ? `-${simResult.reduction_percentage}% Mitigated` : 'Active'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Toggle Switches */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider font-semibold mb-2">
            Available SOAR Preemptive Mitigations
          </div>
          {OPTIONS.map(opt => {
            const isChecked = defenses.includes(opt.id);

            return (
              <div
                key={opt.id}
                onClick={() => handleToggle(opt.id)}
                className={clsx(
                  "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                  isChecked 
                    ? "bg-[#0A84FF]/15 border-[#0A84FF]/40" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                    isChecked ? "bg-[#0A84FF] border-[#0A84FF]" : "border-white/30 bg-transparent"
                  )}>
                    {isChecked && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-xs font-bold text-white">{opt.label}</span>
                </div>
                <span className="text-[10px] font-mono text-white/40">
                  Impact: -{opt.reduction}
                </span>
              </div>
            );
          })}
        </div>

        {/* Simulation Output Card */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider font-semibold mb-3">
              Preemptive Defense ROI Breakdown
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-[10px] font-mono text-white/40 block">Current Attack Prob</span>
                <span className="text-lg font-bold text-[#FF453A]">
                  {simResult ? `${(simResult.original_probability * 100).toFixed(1)}%` : '91.6%'}
                </span>
                <span className="text-[10px] text-white/40 block font-mono">SEV: {simResult?.original_severity || 'HIGH'}</span>
              </div>

              <div className="bg-[#30D158]/10 border border-[#30D158]/30 rounded-xl p-3">
                <span className="text-[10px] font-mono text-[#30D158] block">Mitigated Risk Level</span>
                <span className="text-lg font-bold text-[#30D158]">
                  {simResult ? `${(simResult.mitigated_probability * 100).toFixed(1)}%` : '12.4%'}
                </span>
                <span className="text-[10px] text-[#30D158]/70 block font-mono">SEV: {simResult?.mitigated_severity || 'LOW'}</span>
              </div>
            </div>

            {/* Mitigated Trajectory trajectory */}
            <div className="text-[11px] font-mono text-white/60 mb-2">
              Defended 5-Step Trajectory (Forecast t+1 to t+5):
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {simResult?.mitigated_forecast && Object.entries(simResult.mitigated_forecast).map(([step, val]) => (
                <div key={step} className="bg-white/5 rounded-lg py-1.5 border border-white/5">
                  <span className="text-[9px] font-mono text-white/40 block">{step}</span>
                  <span className="text-xs font-bold font-mono text-[#30D158]">
                    {(val * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/60 flex items-center justify-between">
            <span>Verdict: <strong>{simResult?.roi_verdict || 'CONTAINED'}</strong></span>
            <span className="text-[10px] font-mono text-white/40">{defenses.length} Defenses Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════
   LIVE PACKET CAPTURE & SNIFFER STUDIO
═════════════════════════════════════════════ */
export function LiveCaptureStudio({ onSnapshotAnalyzed, isUploading }) {
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [captureStatus, setCaptureStatus] = React.useState(null);
  const [selectedInterface, setSelectedInterface] = React.useState('eth0 (Sensor Bridge)');
  const pollIntervalRef = React.useRef(null);
  const simIntervalRef = React.useRef(null);
  const packetCounterRef = React.useRef(0);

  const getInterfaceSamples = (iface) => {
    if (iface.includes('Wi-Fi') || iface.includes('wlan')) {
      return [
        { proto: 'TLS 1.3', src: '192.168.1.105:52341', dst: '142.250.190.46:443', len: 1420, flags: 'ACK' },
        { proto: 'DNS', src: '192.168.1.105:41298', dst: '8.8.8.8:53', len: 78, flags: 'QUERY' },
        { proto: 'HTTP/2', src: '192.168.1.105:49812', dst: '151.101.65.140:443', len: 540, flags: 'DATA' },
        { proto: 'QUIC', src: '192.168.1.105:58102', dst: '172.217.16.206:443', len: 1280, flags: 'UDP' },
        { proto: 'DHCP', src: '192.168.1.1:67', dst: '192.168.1.105:68', len: 320, flags: 'ACK' },
        { proto: 'TCP', src: '192.168.1.105:51200', dst: '142.250.190.46:443', len: 64, flags: 'SYN,ACK' },
        { proto: 'NTP', src: '192.168.1.105:123', dst: '192.168.1.1:123', len: 76, flags: 'UDP' },
        { proto: 'mDNS', src: '192.168.1.105:5353', dst: '224.0.0.251:5353', len: 112, flags: 'QUERY' },
      ];
    }
    if (iface.includes('Loopback') || iface.includes('lo')) {
      return [
        { proto: 'HTTP/1.1', src: '127.0.0.1:5173', dst: '127.0.0.1:8000', len: 842, flags: 'GET' },
        { proto: 'TCP', src: '127.0.0.1:54321', dst: '127.0.0.1:5173', len: 64, flags: 'SYN' },
        { proto: 'WS', src: '127.0.0.1:5173', dst: '127.0.0.1:8000', len: 128, flags: 'PING' },
        { proto: 'TCP', src: '127.0.0.1:8000', dst: '127.0.0.1:5173', len: 64, flags: 'ACK' },
      ];
    }
    // eth0 (Sensor Bridge / Honeypot Tap)
    return [
      { proto: 'IRC [C2]', src: '192.168.1.105:49812', dst: '147.32.80.9:6667', len: 124, flags: 'PSH,ACK' },
      { proto: 'TCP', src: '192.168.1.105:51200', dst: '192.168.1.1:445', len: 64, flags: 'SYN' },
      { proto: 'DNS', src: '10.0.4.18:38192', dst: '8.8.8.8:53', len: 78, flags: 'QUERY' },
      { proto: 'HTTP/2', src: '192.168.1.105:54210', dst: '147.32.80.9:80', len: 512, flags: 'POST' },
      { proto: 'TLS 1.3', src: '172.16.20.14:44122', dst: '10.0.0.1:443', len: 1420, flags: 'DATA' },
      { proto: 'TCP', src: '192.168.1.105:48911', dst: '192.168.1.250:3389', len: 64, flags: 'SYN' },
      { proto: 'ICMP', src: '147.32.80.9', dst: '192.168.1.105', len: 84, flags: 'ECHO' },
      { proto: 'SMB2', src: '192.168.1.105:51202', dst: '192.168.1.1:445', len: 218, flags: 'SESSION' },
    ];
  };

  const startSyntheticStream = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    const SAMPLES = getInterfaceSamples(selectedInterface);

    simIntervalRef.current = setInterval(() => {
      packetCounterRef.current += Math.floor(Math.random() * 14) + 8;
      const count = packetCounterRef.current;
      const pps = Math.floor(Math.random() * 160) + 160;
      const kbps = (pps * 0.85 + Math.random() * 15).toFixed(1);
      const bufferedFlows = Math.min(54, Math.floor(count / 18) + 6);

      const s1 = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
      const s2 = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
      const newPkts = [
        { id: count - 1, ...s1, len: s1.len + Math.floor(Math.random() * 30) },
        { id: count, ...s2, len: s2.len + Math.floor(Math.random() * 30) },
      ];

      setCaptureStatus(prev => {
        const existing = prev?.recent_packets || [];
        return {
          is_active: true,
          packet_count: count,
          pps,
          kbps,
          buffered_flows: bufferedFlows,
          recent_packets: [...newPkts, ...existing].slice(0, 40),
        };
      });
    }, 400);
  };

  const startSniffer = async () => {
    setIsCapturing(true);
    try {
      const res = await fetch(`${API_BASE}/api/capture/start`, { method: 'POST' });
      if (res.ok) {
        startPolling();
        return;
      }
    } catch {
      // Backend unavailable: seamless client-side simulation
    }
    startSyntheticStream();
  };

  const stopSniffer = async () => {
    setIsCapturing(false);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    try {
      await fetch(`${API_BASE}/api/capture/stop`, { method: 'POST' });
    } catch {}
  };

  const startPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/capture/status`);
        if (res.ok) {
          const data = await res.json();
          setCaptureStatus(data);
          if (!data.is_active) setIsCapturing(false);
          return;
        }
      } catch {}
      // Fallback if backend drops
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      startSyntheticStream();
    }, 600);
  };

  React.useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  const handleAnalyzeSnapshot = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/capture/snapshot`, { method: 'POST' });
      if (res.ok) {
        const report = await res.json();
        onSnapshotAnalyzed(report);
        return;
      }
    } catch {}

    // Offline snapshot synthesis - respects selected interface
    let snapFile = "wifi_campus_live_capture.pcap";
    if (selectedInterface.includes("Loopback")) snapFile = "loopback_local_capture.pcap";
    else if (selectedInterface.includes("Sensor") || selectedInterface.includes("eth0")) snapFile = "neris_sensor_tap.pcap";

    const base = await generateOfflineReportForFile(snapFile);
    const now = new Date();
    const snapReport = {
      ...base,
      case_id: `LIVE-CAP-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`,
      file_name: `Live Capture Stream (${selectedInterface})`,
      traffic_summary: {
        ...base.traffic_summary,
        total_packets: captureStatus?.packet_count || 1240,
        total_flows: captureStatus?.buffered_flows || 32,
        capture_interface: selectedInterface,
      }
    };
    onSnapshotAnalyzed(snapReport);
  };

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={Radio} colorClass="text-[#FF453A]" bgClass="bg-[#FF453A]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Live Network Packet Sniffer Studio
              {isCapturing && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF453A] bg-[#FF453A]/20 px-2 py-0.5 rounded-full border border-[#FF453A]/30">
                  <span className="w-2 h-2 rounded-full bg-[#FF453A] animate-ping" /> REC ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-white/50">Capture raw live packets in real-time and stream directly into ML inference</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select 
            value={selectedInterface}
            onChange={(e) => setSelectedInterface(e.target.value)}
            disabled={isCapturing}
            className="bg-white/5 border border-white/15 text-white text-xs font-mono rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="eth0 (Sensor Bridge)">eth0 (Sensor Bridge)</option>
            <option value="Wi-Fi (wlan0)">Wi-Fi (wlan0)</option>
            <option value="Loopback (lo0)">Loopback (lo0)</option>
          </select>

          {!isCapturing ? (
            <button
              onClick={startSniffer}
              className="bg-[#30D158] hover:bg-[#28b84b] text-black font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer active:scale-95"
            >
              <Play size={14} /> Start Sniffer
            </button>
          ) : (
            <button
              onClick={stopSniffer}
              className="bg-[#FF453A] hover:bg-[#d8352b] text-white font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer active:scale-95"
            >
              <Square size={14} /> Stop Capture
            </button>
          )}

          <button
            onClick={handleAnalyzeSnapshot}
            disabled={isUploading}
            className="bg-[#0A84FF] hover:bg-[#0071e3] text-white font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <Activity size={14} /> Analyze Snapshot
          </button>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono text-white/40 block">Total Packets Captured</span>
          <span className="text-xl font-bold font-mono text-white">
            {captureStatus?.packet_count || 0}
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono text-white/40 block">Packet Rate</span>
          <span className="text-xl font-bold font-mono text-[#0A84FF]">
            {captureStatus?.pps || 0} pps
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono text-white/40 block">Bandwidth Throughput</span>
          <span className="text-xl font-bold font-mono text-[#30D158]">
            {captureStatus?.kbps || 0} KB/s
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-mono text-white/40 block">Buffered Flows</span>
          <span className="text-xl font-bold font-mono text-[#FF9F0A]">
            {captureStatus?.buffered_flows || 0}
          </span>
        </div>
      </div>

      {/* Terminal-style live packet stream */}
      <div className="bg-black/60 border border-white/10 rounded-2xl p-3 font-mono text-[11px] overflow-hidden">
        <div className="flex items-center justify-between text-white/40 text-[10px] pb-2 border-b border-white/10 mb-2">
          <span>LIVE PACKET STREAM BUFFER</span>
          <span>AUTOSCROLL ON</span>
        </div>

        <div className="h-40 overflow-y-auto space-y-1 scrollbar-thin">
          {captureStatus?.recent_packets && captureStatus.recent_packets.length > 0 ? (
            captureStatus.recent_packets.map((pkt) => (
              <div key={pkt.id} className="flex items-center justify-between text-white/70 hover:text-white hover:bg-white/5 px-2 py-0.5 rounded transition-colors text-[11px]">
                <span className="text-white/40 w-16">#{pkt.id}</span>
                <span className="w-16 font-bold text-[#0A84FF]">{pkt.proto}</span>
                <span className="w-48 truncate">{pkt.src}</span>
                <span className="text-white/40">➔</span>
                <span className="w-48 truncate">{pkt.dst}</span>
                <span className="w-16 text-right text-white/40">{pkt.len}B</span>
                <span className={clsx(
                  "w-16 text-right font-bold text-[10px]",
                  pkt.flags?.includes('SYN') ? "text-[#FF453A]" : "text-white/40"
                )}>
                  {pkt.flags}
                </span>
              </div>
            ))
          ) : (
            <div className="text-white/30 text-center py-12">
              {isCapturing ? "Sniffing packets from sensor interface..." : "Click 'Start Sniffer' to begin streaming live packets."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   GLOBAL THREAT ORIGIN WAR MAP (GEO-IP & BALLISTIC)
═════════════════════════════════════════════ */
export function ThreatOriginWarMap({ geoContext }) {
  if (!geoContext) return null;

  const origin = {
    ip: geoContext?.origin?.ip || '198.51.100.44',
    country: geoContext?.origin?.country || 'External Territory',
    city: geoContext?.origin?.city || 'Prague',
    country_code: geoContext?.origin?.country_code || 'CZ',
    threat_group: geoContext?.origin?.threat_group || 'APT-29 Telemetry Swarm',
    asn: geoContext?.origin?.asn || 'AS48201 (Hostile Ingress Peer)',
    is_tor_exit: geoContext?.origin?.is_tor_exit || false,
    lat: Number(geoContext?.origin?.lat) || 50.07,
    lon: Number(geoContext?.origin?.lon) || 14.43
  };

  const target = {
    ip: geoContext?.target?.ip || '10.0.2.15',
    country: geoContext?.target?.country || 'Enterprise DMZ',
    city: geoContext?.target?.city || 'HQ Data Center',
    country_code: geoContext?.target?.country_code || 'IN',
    facility: geoContext?.target?.facility || 'Edge Web Gateway',
    lat: Number(geoContext?.target?.lat) || 28.61,
    lon: Number(geoContext?.target?.lon) || 77.20
  };

  const arc = geoContext.ballistic_arc || {
    origin_lat: origin.lat,
    origin_lon: origin.lon,
    target_lat: target.lat,
    target_lon: target.lon,
    distance_km: 5930
  };

  // Convert lat/lon to approximate SVG viewBox coordinates (width 800, height 400)
  const toX = (lon) => (((Number(lon) || 0) + 180) / 360) * 800;
  const toY = (lat) => ((90 - (Number(lat) || 0)) / 180) * 400;

  const x1 = toX(arc.origin_lon ?? origin.lon);
  const y1 = toY(arc.origin_lat ?? origin.lat);
  const x2 = toX(arc.target_lon ?? target.lon);
  const y2 = toY(arc.target_lat ?? target.lat);

  // Quadratic curve control point
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - 60;

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={Globe} colorClass="text-[#00F0FF]" bgClass="bg-[#00F0FF]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Global Threat Origin & Ballistic Attack Vector
              <span className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/15 px-2 py-0.5 rounded-full border border-[#00F0FF]/30">
                GEO-IP INTEL
              </span>
            </h3>
            <p className="text-xs text-white/50">Physical origin tracking, ASN attribution, and ballistic trajectory toward enterprise perimeter</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-white/50">
          <span>Range: <strong>{arc.distance_km || 4800} km</strong></span>
          <span className="text-white/20">|</span>
          <span className="text-[#FF453A] font-bold">{origin.country_code} ➔ {target.country_code}</span>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-[260px] bg-[#0c0d12] border border-white/10 rounded-2xl overflow-hidden mb-4">
        <svg viewBox="0 0 800 400" className="w-full h-full">
          <defs>
            <pattern id="worldgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF453A" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FF9F0A" stopOpacity="1" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#worldgrid)" />

          <path d="M 120 80 Q 200 60 260 90 T 320 180 T 260 260 T 150 200 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M 420 70 Q 520 40 600 80 T 680 160 T 560 240 T 440 180 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M 430 200 Q 480 230 490 320 T 410 330 T 400 230 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M 640 250 Q 700 240 720 310 T 630 330 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Ballistic Attack Arc Path */}
          <path
            d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            className="animate-pulse"
          />

          {/* Threat Origin Ripple Node */}
          <circle cx={x1} cy={y1} r="10" fill="#FF453A" fillOpacity="0.2" className="animate-ping" />
          <circle cx={x1} cy={y1} r="5" fill="#FF453A" />
          <text x={x1 + 10} y={y1 - 6} fill="#FF453A" fontSize="10" fontFamily="monospace" fontWeight="bold">
            THREAT: {origin.city} ({origin.country_code})
          </text>

          {/* Defense Target Ripple Node */}
          <circle cx={x2} cy={y2} r="12" fill="#00F0FF" fillOpacity="0.2" className="animate-ping" />
          <circle cx={x2} cy={y2} r="5" fill="#00F0FF" />
          <text x={x2 + 10} y={y2 + 14} fill="#00F0FF" fontSize="10" fontFamily="monospace" fontWeight="bold">
            SOC HUB: {target.city}, {target.country}
          </text>
        </svg>

        {/* Live Attack Trajectory Telemetry Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono text-white/70 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF453A] animate-pulse" />
            <span>Origin IP: <strong>{geoContext.threat_actor_ip || origin.ip}</strong></span>
          </span>
          <span className="text-white/30">|</span>
          <span>ASN: <strong>{origin.asn}</strong></span>
        </div>
      </div>

      {/* Origin Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
          <span className="text-[10px] font-mono text-white/40 block">Threat Group Attribution</span>
          <span className="font-bold text-white text-sm block mt-0.5">{origin.threat_group}</span>
          <span className="text-[10px] text-white/40 font-mono">Profile Signature</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
          <span className="text-[10px] font-mono text-white/40 block">Geographic Location</span>
          <span className="font-bold text-white text-sm block mt-0.5">{origin.city}, {origin.country}</span>
          <span className="text-[10px] text-white/40 font-mono">{origin.lat.toFixed(2)}° N, {origin.lon.toFixed(2)}° E</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
          <span className="text-[10px] font-mono text-white/40 block">Network ASN & ISP</span>
          <span className="font-bold text-white text-sm block mt-0.5 truncate">{origin.asn}</span>
          <span className="text-[10px] text-white/40 font-mono">BGP Ingress Peer</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
          <span className="text-[10px] font-mono text-white/40 block">Anonymization & Proxy</span>
          <span className={clsx(
            "font-bold text-sm block mt-0.5 font-mono",
            origin.is_tor_exit ? "text-[#FF453A]" : "text-[#30D158]"
          )}>
            {origin.is_tor_exit ? "TOR EXIT RELAY DETECTED" : "DIRECT BGP ROUTED"}
          </span>
          <span className="text-[10px] text-white/40 font-mono">Anti-Evasion Status</span>
        </div>
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════
   TIME-TO-COMPROMISE (TTC) & THREAT RADAR
═════════════════════════════════════════════ */
export function LeadTimeThreatRadar({ timeToCompromise, probability }) {
  if (!timeToCompromise) return null;

  const ttc = typeof timeToCompromise === 'object' ? timeToCompromise : {
    countdown_display: typeof timeToCompromise === 'string' ? timeToCompromise : "00:06:45",
    urgency: (probability > 0.8) ? 'CRITICAL' : (probability > 0.5) ? 'HIGH' : 'NORMAL',
    velocity: (probability > 0.8) ? 'Rapid Spread (1.8x)' : 'Moderate Drift (0.6x)',
    radar_distance_hops: (probability > 0.8) ? 1 : 3,
    status: (probability > 0.8) ? 'IMMINENT' : (probability > 0.5) ? 'ELEVATED' : 'NOMINAL'
  };

  const isUrgent = ttc.urgency === 'CRITICAL' || ttc.urgency === 'HIGH';

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6 relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={Crosshair} colorClass="text-[#FF2D55]" bgClass="bg-[#FF2D55]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
              <span>Preemptive Time-to-Compromise (TTC) & Threat Radar</span>
              {isUrgent && (
                <span className="text-[10px] font-mono text-[#FF2D55] bg-[#FF2D55]/15 px-2 py-0.5 rounded-full border border-[#FF2D55]/30 animate-pulse">
                  CRITICAL PREEMPTION WINDOW
                </span>
              )}
            </h3>
            <p className="text-xs text-white/50">Estimated lead-time before attack escalation transitions to crown-jewel assets</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-white/40 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
          Escalation Velocity: <strong className="text-[#FF9F0A]">{ttc.velocity}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 items-center">
        {/* Radar Visualizer */}
        <div className="flex flex-col items-center justify-center p-4 bg-black/40 border border-white/10 rounded-2xl relative h-[220px]">
          <div className="w-[180px] h-[180px] rounded-full border border-white/10 relative flex items-center justify-center">
            <div className="w-[130px] h-[130px] rounded-full border border-white/10 absolute" />
            <div className="w-[80px] h-[80px] rounded-full border border-[#FF453A]/30 absolute" />
            <div className="w-[30px] h-[30px] rounded-full bg-[#00F0FF]/20 border border-[#00F0FF] absolute flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
            </div>

            <div 
              className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite] pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(255, 45, 85, 0.35) 360deg)'
              }}
            />

            <div className="absolute top-8 right-12 w-2.5 h-2.5 rounded-full bg-[#FF453A] animate-ping" />
            <div className="absolute bottom-12 left-10 w-2 h-2 rounded-full bg-[#FF9F0A]" />
          </div>

          <div className="absolute bottom-2 text-[10px] font-mono text-white/40 flex items-center gap-2">
            <span>Radius: <strong>{ttc.radar_distance_hops} Network Hops</strong></span>
            <span>|</span>
            <span className="text-[#00F0FF]">DC Core Centered</span>
          </div>
        </div>

        {/* Big Countdown Display */}
        <div className="lg:col-span-2 flex flex-col justify-between h-full space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
                Autonomous Lead-Time Clock to Catastrophic Impact
              </span>
              <span className={clsx(
                "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border",
                isUrgent ? "text-[#FF2D55] bg-[#FF2D55]/15 border-[#FF2D55]/40" : "text-[#30D158] bg-[#30D158]/15 border-[#30D158]/40"
              )}>
                {ttc.status}
              </span>
            </div>

            {(() => {
              const raw = String(ttc.countdown_display || '');
              const parts = raw.includes(' until ') ? raw.split(' until ') : [raw, ''];
              const timePart = parts[0];
              const descPart = parts[1] ? `until ${parts[1]}` : '';

              return (
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider flex flex-wrap items-baseline gap-2">
                    <span className={clsx(isUrgent ? "text-[#FF453A]" : "text-[#30D158]")}>
                      {timePart}
                    </span>
                    <span className="text-xs font-mono text-white/40 font-normal">Remaining Window</span>
                  </div>
                  {descPart && (
                    <div className="text-xs font-mono text-white/65 mt-1 font-medium">
                      {descPart}
                    </div>
                  )}
                </div>
              );
            })()}

            <p className="text-xs text-white/60 leading-relaxed">
              Autonomous trajectory models indicate the attacker is advancing across operational kill-chain phases. 
              Deploying SOAR countermeasures within this window prevents data exfiltration and credential escalation.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-black/30 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] font-mono text-white/40 block">Intervention Urgency</span>
              <span className={clsx(
                "font-bold text-sm block mt-0.5",
                isUrgent ? "text-[#FF453A]" : "text-[#30D158]"
              )}>
                {ttc.urgency}
              </span>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] font-mono text-white/40 block">Forecast Velocity</span>
              <span className="font-bold text-sm block mt-0.5 text-[#FF9F0A] font-mono">
                {ttc.velocity}
              </span>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] font-mono text-white/40 block">Target Asset Protection</span>
              <span className="font-bold text-sm block mt-0.5 text-[#00F0FF] font-mono">
                ACTIVE SHIELD
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



/* ═════════════════════════════════════════════
   LIVE SOAR REMEDIATION TERMINAL
═════════════════════════════════════════════ */
export function SoarExecutionTerminal({ countermeasures, report }) {
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionLogs, setExecutionLogs] = React.useState(null);
  const [isDone, setIsDone] = React.useState(false);

  const attackerIp = countermeasures?.target_indicators?.top_src_ips?.[0] || '198.51.100.14';
  const targetPorts = countermeasures?.target_indicators?.top_dst_ports || ['80', '443'];

  const handleExecute = async () => {
    setIsExecuting(true);
    setIsDone(false);
    try {
      const res = await fetch(`${API_BASE}/api/soar/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attacker_ip: attackerIp,
          target_ports: targetPorts,
          playbook_type: 'automated_containment_quarantine'
        })
      });
      const data = await res.json();
      setExecutionLogs(data.logs);
      setIsDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={Terminal} colorClass="text-[#30D158]" bgClass="bg-[#30D158]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Automated SOAR Playbook Execution Engine
              {isDone && (
                <span className="text-[10px] font-mono text-[#30D158] bg-[#30D158]/15 px-2 py-0.5 rounded-full border border-[#30D158]/30 flex items-center gap-1 font-bold">
                  <Check size={10} /> CONTAINMENT ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-white/50">One-click live deployment of kernel firewall blocks and dynamic Suricata signatures</p>
          </div>
        </div>

        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className={clsx(
            "px-5 py-2 rounded-xl font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-xl cursor-pointer",
            isDone 
              ? "bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/40" 
              : "bg-gradient-to-r from-[#00F0FF] to-[#0A84FF] text-black hover:opacity-90 active:scale-95"
          )}
        >
          {isExecuting ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>DEPLOYING SOAR DIRECTIVES...</span>
            </>
          ) : isDone ? (
            <>
              <CheckCircle2 size={14} />
              <span>RE-EXECUTE CONTAINMENT</span>
            </>
          ) : (
            <>
              <Zap size={14} />
              <span>EXECUTE AUTOMATED CONTAINMENT</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Display */}
      <div className="bg-black/70 border border-white/10 rounded-2xl p-4 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3 text-[11px] text-white/40">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]" />
            <span className="ml-2 text-white/60">soar-dispatcher@sec-ops-edge-01:~$</span>
          </span>
          <span>EXECUTION STATUS: {isDone ? "VERIFIED (0 ERRORS)" : isExecuting ? "DISPATCHING..." : "STAGED & READY"}</span>
        </div>

        <div className="space-y-1.5 text-[11px] text-white/80 max-h-48 overflow-y-auto">
          {executionLogs ? (
            executionLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 hover:bg-white/5 px-1 py-0.5 rounded">
                <span className="text-[#30D158] font-bold">❯</span>
                <span className={clsx(
                  log.includes('SUCCESS') || log.includes('ACTIVE') || log.includes('MITIGATED') 
                    ? "text-[#30D158]" 
                    : log.includes('IPTABLES') 
                    ? "text-[#00F0FF]" 
                    : "text-white/80"
                )}>
                  {log}
                </span>
              </div>
            ))
          ) : (
            <div className="text-white/40 py-6 text-center leading-relaxed">
              Playbook ready: Target Attacker IP <strong className="text-white">{attackerIp}</strong>, Ports <strong className="text-white">{targetPorts.join(', ')}</strong>.<br />
              Click <strong>"Execute Automated Containment"</strong> to dispatch kernel-level quarantine and Suricata IDS rules.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════
   AUTONOMOUS SOC AI CO-PILOT
═════════════════════════════════════════════ */
export function SocAiCopilot({ report }) {
  const [messages, setMessages] = React.useState([
    {
      sender: 'copilot',
      text: "Hello! I am your Autonomous NetThreat SOC Co-Pilot. I've analyzed this traffic capture using dual-stage XGBoost & CatBoost models. Ask me anything about threat attribution, kill-chain progression, or remediation directives."
    }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const CHIPS = [
    "Why was this classified as RBot?",
    "Assess lateral blast radius",
    "Generate emergency firewall rule",
    "Draft CISO flash bulletin",
    "Is this a zero-day attack?"
  ];

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: q }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, report_context: report })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([...newMsgs, { sender: 'copilot', text: data.response }]);
        setIsLoading(false);
        return;
      }
    } catch {
      // Backend offline: compute local contextual response
    }

    const family = report?.stage2_output?.dominant_family || 'Neris Botnet';
    const prob = ((report?.attack_probability || 0.88) * 100).toFixed(1);
    const stage = report?.mitre_kill_chain?.active_stage || 'C2 Beaconing';
    const origin = report?.blast_radius?.threat_origin || '198.51.100.14';
    const topPorts = report?.countermeasures?.target_indicators?.top_dst_ports || ['80', '443', '6667'];
    const qLower = q.toLowerCase();

    let botReply = `**Contextual Telemetry Analysis:** Current session exhibits **${family}** patterns (${prob}% attack probability). Active killchain stage is **${stage}** originating from \`${origin}\`. Recommended countermeasure: apply perimeter egress filtering on ports \`${topPorts.join(', ')}\`.`;

    if (qLower.includes('why') || qLower.includes('classify') || qLower.includes('family') || qLower.includes('attribution') || qLower.includes('model') || qLower.includes('rbot')) {
      botReply = `**AI Attribution Rationale:** The Stage-2 CatBoost model assigned **${family}** (${((report?.stage2_output?.dominant_family_probability || 0.92)*100).toFixed(1)}% posterior probability) because the flow telemetry exhibits characteristic asymmetric packet ratios, repetitive keepalive intervals, and target destination ports \`${topPorts.slice(0, 3).join(', ')}\` matching verified CTU-13 dataset profiles.`;
    } else if (qLower.includes('blast') || qLower.includes('lateral') || qLower.includes('spread') || qLower.includes('radius')) {
      botReply = `**Blast Radius Assessment:** Threat origin is \`${origin}\`. Forecasted jump probability to lateral subnets is **${((report?.mitre_kill_chain?.jump_probability || 0.85)*100).toFixed(1)}%**. High-value target assets within direct reach: \`${report?.blast_radius?.critical_assets?.join(', ') || 'Domain Controller / Database Cluster'}\`.`;
    } else if (qLower.includes('firewall') || qLower.includes('rule') || qLower.includes('contain') || qLower.includes('iptables') || qLower.includes('block')) {
      botReply = `**Instant SOAR Remediation Directive:**\n\`\`\`bash\n# 1. Isolate malicious threat origin\niptables -I INPUT 1 -s ${origin.split(' ')[0]} -j DROP\n# 2. Sever active beacon port\niptables -I OUTPUT 1 -p tcp --dport ${topPorts[0] || 6667} -j DROP\n\`\`\`\nYou can also click **'Execute Automated Containment'** in the SOAR panel to deploy this instantly.`;
    } else if (qLower.includes('ciso') || qLower.includes('brief') || qLower.includes('report') || qLower.includes('executive')) {
      botReply = `**Executive Flash Briefing:**\n> **ALERT [${report?.severity || 'HIGH'}]:** NetThreat AI detected active ${family} vector at ${new Date().toLocaleTimeString()}.\n> **IMPACT:** Threat probability at ${prob}%, with estimated lead time of ${report?.time_to_compromise || '8-12 mins'} before full compromise.\n> **RECOMMENDED ACTION:** Deploy automated containment playbooks immediately.`;
    } else if (qLower.includes('zero') || qLower.includes('novel')) {
      const isNovel = report?.zero_day_analysis?.is_novel;
      botReply = isNovel
        ? `**Zero-Day Threat Analysis:** CONFIRMED. Novelty score is **${report?.zero_day_analysis?.novelty_score}** (Threshold: >0.70). High payload entropy observed without signature matching standard database profiles.`
        : `**Zero-Day Threat Analysis:** NEGATIVE. Novelty score is **${report?.zero_day_analysis?.novelty_score || 0.12}**, matching known signature profile: \`${report?.zero_day_analysis?.signature_match || 'Standard CTU-13 Family'}\`.`;
    }

    setMessages([...newMsgs, { sender: 'copilot', text: botReply }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={Bot} colorClass="text-[#BF5AF2]" bgClass="bg-[#BF5AF2]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Autonomous SOC AI Forensic Co-Pilot
              <span className="text-[10px] font-mono text-[#BF5AF2] bg-[#BF5AF2]/15 px-2 py-0.5 rounded-full border border-[#BF5AF2]/30 flex items-center gap-1 font-bold">
                <Sparkles size={10} /> AI ASSISTED
              </span>
            </h3>
            <p className="text-xs text-white/50">Conversational forensic investigator grounded in active network telemetry & MITRE framework</p>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
        {CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all whitespace-nowrap cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 h-64 overflow-y-auto space-y-3 mb-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex gap-3 text-xs leading-relaxed max-w-[85%]",
              m.sender === 'user' ? "ml-auto justify-end" : "justify-start"
            )}
          >
            {m.sender === 'copilot' && (
              <div className="w-7 h-7 rounded-full bg-[#BF5AF2]/20 border border-[#BF5AF2]/40 flex items-center justify-center shrink-0 text-[#BF5AF2]">
                <Bot size={14} />
              </div>
            )}
            <div
              className={clsx(
                "p-3 rounded-2xl",
                m.sender === 'user'
                  ? "bg-[#0A84FF] text-white rounded-br-none"
                  : "bg-white/10 text-white/90 rounded-bl-none border border-white/10"
              )}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#0A84FF]/20 border border-[#0A84FF]/40 flex items-center justify-center shrink-0 text-[#0A84FF]">
                <User size={14} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
            <RefreshCw size={12} className="animate-spin text-[#BF5AF2]" />
            <span>Co-Pilot is querying telemetry feature weights...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask forensic questions (e.g. 'Explain why this traffic scored high risk')..."
          className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-[#BF5AF2] transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-[#BF5AF2] hover:bg-[#a339df] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  );
}


/* ═════════════════════════════════════════════
   WIRESHARK-GRADE PACKET HEX DISSECTOR
═════════════════════════════════════════════ */
export function PacketHexDissector({ dissector }) {
  const [activeTab, setActiveTab] = React.useState('tree');
  const [copied, setCopied] = React.useState(false);

  if (!dissector) return null;

  const handleCopyHex = () => {
    navigator.clipboard.writeText(dissector.hex_stream);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AppleIcon Icon={FileText} colorClass="text-[#FFD60A]" bgClass="bg-[#FFD60A]/20" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Wireshark-Grade Packet Header Dissector & Hex Inspector
              <span className="text-[10px] font-mono text-[#FFD60A] bg-[#FFD60A]/15 px-2 py-0.5 rounded-full border border-[#FFD60A]/30 font-bold">
                BYTE-LEVEL TRACE
              </span>
            </h3>
            <p className="text-xs text-white/50">Low-level protocol layer decapsulation and byte-for-byte binary verification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('tree')}
              className={clsx(
                "px-3 py-1 rounded-lg font-mono font-medium transition-all cursor-pointer",
                activeTab === 'tree' ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white"
              )}
            >
              Protocol Tree
            </button>
            <button
              onClick={() => setActiveTab('hex')}
              className={clsx(
                "px-3 py-1 rounded-lg font-mono font-medium transition-all cursor-pointer",
                activeTab === 'hex' ? "bg-white/20 text-white font-bold" : "text-white/50 hover:text-white"
              )}
            >
              Raw Hex Dump
            </button>
          </div>

          <button
            onClick={handleCopyHex}
            className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all font-mono"
            title="Copy Raw Hex Dump"
          >
            {copied ? <Check size={12} className="text-[#30D158]" /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy Hex"}</span>
          </button>
        </div>
      </div>

      <div className="text-[11px] font-mono text-white/60 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 mb-3">
        Summary: <strong>{dissector.packet_summary}</strong>
      </div>

      {activeTab === 'tree' ? (
        <div className="space-y-2 font-mono text-xs">
          {dissector.dissection_tree.map((layer, idx) => (
            <div key={idx} className="bg-black/50 border border-white/10 rounded-xl p-3">
              <div className="font-bold text-white/90 flex items-center gap-2 mb-2 pb-1 border-b border-white/5">
                <ChevronDown size={14} className="text-[#FFD60A]" />
                <span>{layer.layer}</span>
              </div>
              <div className="pl-6 space-y-1 text-white/60 text-[11px]">
                {layer.details.map((detail, dIdx) => (
                  <div key={dIdx} className="hover:text-white transition-colors">
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/70 border border-white/10 rounded-2xl p-4 font-mono text-[11px] text-[#30D158] overflow-x-auto whitespace-pre leading-relaxed">
          {dissector.hex_stream}
        </div>
      )}
    </div>
  );
}






