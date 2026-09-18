import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { Target, Activity, ShieldAlert, Cpu, Zap, AlertTriangle, FileText, TrendingUp, BarChart3, Info, Database, Clock, Crosshair, HelpCircle, Network, Upload, File, CheckCircle, XCircle } from 'lucide-react';

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

  const SUPPORTED = ['.csv', '.pcap', '.pcapng', '.cap', '.binetflow', '.log', '.json', '.tsv', '.netflow'];

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
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
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
          "w-full rounded-[24px] p-12 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-700 min-h-[300px] relative overflow-hidden",
          isDragging ? "scale-[1.01]" : ""
        )}
      >
        {/* Base border fallback & Animated Rotating Conic Gradient Border */}
        <div className="absolute inset-0 bg-[#1c1c1e] z-0" />
        <div className="absolute inset-0 border border-white/10 rounded-[24px] z-0 group-hover:opacity-0 transition-opacity duration-500" />
        
        <div className={clsx(
          "absolute -inset-[100%] z-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(10,132,255,1)_360deg)] animate-[spin_3s_linear_infinite]",
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        )} />
        
        {/* Inner Panel */}
        <div className={clsx(
          "absolute inset-[1px] rounded-[23px] z-0 transition-colors duration-500",
          isDragging ? "bg-[#0A84FF]/10 backdrop-blur-md" : "bg-[#1c1c1e] group-hover:bg-[#18181b]"
        )} />

        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-700 z-0" />

        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED.join(',')}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="relative z-10 flex flex-col items-center">
            <div className={clsx(
              "w-20 h-20 rounded-[28%] flex items-center justify-center mb-6 transition-all duration-500 shadow-[inset_0_1px_rgba(255,255,255,0.05)]",
              isDragging 
                ? "bg-[#0A84FF] text-white shadow-[0_0_40px_rgba(10,132,255,0.6)] scale-110" 
                : "bg-white/5 text-white/50 group-hover:bg-[#0A84FF]/20 group-hover:text-[#0A84FF] group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(10,132,255,0.3)]",
              isUploading && "bg-[#0A84FF]/20 text-[#0A84FF]"
            )}>
              {isUploading ? (
                <Activity size={32} strokeWidth={2} className="animate-pulse" />
              ) : (
                <Network size={32} strokeWidth={1.5} className="transition-transform duration-500" />
              )}
            </div>

            <h2 className="text-[20px] font-bold text-white/90 mb-2 tracking-tight transition-colors duration-300 group-hover:text-white">
              {isUploading ? 'Analyzing Telemetry Data...' : 'Select or drop telemetry file'}
            </h2>
            <p className="text-[13px] text-white/40 max-w-sm text-center font-medium transition-colors group-hover:text-white/60">
              {isUploading
                ? 'Extracting temporal features and running multi-stage inference.'
                : 'Supports .pcap, .csv, .log, and .netflow up to 500MB'
              }
            </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/30 w-full mx-auto max-w-md animate-in fade-in slide-in-from-bottom-2">
          <XCircle size={18} className="text-[#FF453A] shrink-0" />
          <span className="text-[13px] text-[#FF453A] font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════
   TRAFFIC SUMMARY CARDS (NEW)
═════════════════════════════════════════════ */
export function TrafficSummary({ report }) {
  const summary = report.traffic_summary;
  if (!summary) return null;

  const cards = [
    { label: 'Total Flows', value: summary.total_flows?.toLocaleString(), icon: Activity, color: 'bg-[#0A84FF]' },
    { label: 'Total Packets', value: summary.total_packets?.toLocaleString(), icon: Zap, color: 'bg-[#BF5AF2]' },
    { label: 'Total Bytes', value: formatBytes(summary.total_bytes), icon: Database, color: 'bg-[#FF9F0A]' },
    { label: 'Unique Source IPs', value: summary.unique_src_ips?.toLocaleString(), icon: Network, color: 'bg-[#32D74B]' },
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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Risk Trajectory</h3>
        <span className="text-[#FF453A] font-bold text-[12px]">{step === 4 ? "ATTACK LIKELY" : ""}</span>
      </div>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full z-0 transition-all duration-500" 
          style={{ width: `${((step - 1) / 3) * 100}%`, background: step === 4 ? '#FF453A' : step === 3 ? '#FF9F0A' : step === 2 ? '#FFD60A' : '#32D74B' }}
        />
        {steps.map((s, i) => {
          let alignClass = "left-1/2 -translate-x-1/2 text-center";
          if (i === 0) alignClass = "left-0 text-left";
          if (i === steps.length - 1) alignClass = "right-0 text-right";

          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <div className={clsx(
                "w-4 h-4 rounded-full border-2 transition-all duration-300",
                i < step ? s.activeColor : i === step - 1 ? `${s.activeColor} shadow-[0_0_12px_currentColor]` : "bg-[#1c1c1e] border-white/20",
                i < step && "border-transparent"
              )} />
              <span className={clsx(
                "text-[10px] font-semibold uppercase tracking-wider absolute top-6 whitespace-nowrap",
                alignClass,
                i <= step - 1 ? "text-white/90" : "text-white/40"
              )}>{s.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-8" />
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
   ATTACK CHAIN / MITRE CONTEXT
═════════════════════════════════════════════ */
export function AttackChainContext({ report }) {
  if (!report) return null;
  return (
    <div className="glass-card p-5 h-full border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <AppleIcon Icon={Network} bgClass="bg-[#32D74B]" colorClass="text-white" size={18} />
        <h3 className="text-[13px] font-semibold text-white/90 tracking-wide">ATTACK CHAIN</h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-[12px] text-white/70 leading-relaxed font-medium">
            {report.mitre_evidence}
          </p>
        </div>
        
        <div className="border-t border-white/10 pt-4">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Provenance & Context</div>
          <p className="text-[12px] text-white/60 leading-relaxed font-medium">
            {report.provenance}
          </p>
        </div>

        {report.uncertainty?.length > 0 && (
          <div className="bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-[14px] p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-[#FF9F0A]" />
              <span className="text-[11px] font-bold text-[#FF9F0A] uppercase tracking-wide">Caveats</span>
            </div>
            {report.uncertainty.map((u, i) => (
              <div key={i} className="text-[11px] text-white/70 mb-1 last:mb-0">• {u}</div>
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
