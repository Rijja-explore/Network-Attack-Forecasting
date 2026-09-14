import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { Target, Activity, ShieldAlert, Cpu, Zap, AlertTriangle, FileText, TrendingUp, BarChart3, Info, Database, Clock, Crosshair, HelpCircle, Network } from 'lucide-react';

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
  const isHighRisk = trajectory.includes('HIGH');
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white/5 border border-white/10 backdrop-blur-md">
      <TrendingUp size={14} className={isHighRisk ? "text-[#FF453A]" : "text-[#FFD60A]"} strokeWidth={2} />
      <span className="text-white/90 tracking-wide">{trajectory.replace(/_/g, ' ')}</span>
    </div>
  );
}

/* ═════════════════════════════════════════════
   SCENARIO TAG
═════════════════════════════════════════════ */
export function ScenarioTag({ metadata }) {
  if (!metadata) return null;
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[12px]">
      <Database size={12} className="text-white/40" />
      <span className="text-white/70 font-medium">{metadata.scenario_id}</span>
      <span className="text-white/30">|</span>
      <span className={clsx(
        "font-medium",
        metadata.split === 'test' ? 'text-[#FF453A]' : 'text-[#32D74B]'
      )}>
        {metadata.split}
      </span>
    </div>
  );
}

/* ═════════════════════════════════════════════
   RISK TRAJECTORY STEPPER (NEW: PS153)
═════════════════════════════════════════════ */
export function RiskTrajectory({ caseData }) {
  const t = caseData.stage1_output?.trajectory;
  const state = caseData.stage1_output?.current_observed_attack_state;
  const sev = caseData.severity;

  let step = 1; // Normal
  if (t === 'STABLE_HIGH_RISK' || state === 1) step = 4;
  else if (sev === 'MEDIUM') step = 3;
  else if (sev === 'LOW' && t !== 'STABLE') step = 2;

  const steps = [
    { label: 'Normal', activeColor: 'bg-[#32D74B]' },
    { label: 'Suspicious', activeColor: 'bg-[#FFD60A]' },
    { label: 'Elevated', activeColor: 'bg-[#FF9F0A]' },
    { label: 'High Risk / Attack', activeColor: 'bg-[#FF453A]' }
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
          style={{ width: `${((step - 1) / 3) * 100}%`, background: steps[step-1].activeColor }}
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
   EXPLAINABILITY PANEL: WHY? (NEW: PS153)
═════════════════════════════════════════════ */
export function ExplainabilityPanel({ caseData }) {
  if (!caseData) return null;
  const s2 = caseData.stage2_output;
  const changes = s2?.top_behavior_changes ? s2.top_behavior_changes.replace(/[\[\]"]/g, '').split(',') : [];

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center gap-3 mb-4">
        <AppleIcon Icon={HelpCircle} bgClass="bg-[#BF5AF2]" colorClass="text-white" size={18} />
        <h3 className="text-[13px] font-semibold text-white/90 tracking-wide">WHY? (Explainability)</h3>
      </div>
      
      <div className="space-y-4">
        {/* Stage 1 Drivers */}
        <div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Global Model Drivers</div>
          <p className="text-[13px] text-white/70 leading-relaxed font-medium">
            {caseData.xai_evidence}
          </p>
        </div>

        {/* Behavioral Shifts (Stage 2) */}
        {changes.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Key Behavioural Shifts</div>
            <div className="space-y-2">
              {changes.map((sig, i) => (
                <div key={i} className="flex items-center gap-3 text-[12px] text-white/80 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#BF5AF2]" />
                  <span className="capitalize">{sig.trim().replace(/_/g, ' ')}</span>
                  <span className="ml-auto text-[#FF453A] font-mono text-[11px] font-bold">↑ Increased</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   ATTACK CHAIN / MITRE CONTEXT (NEW: PS153)
═════════════════════════════════════════════ */
export function AttackChainContext({ caseData }) {
  if (!caseData) return null;
  return (
    <div className="glass-card p-5 h-full border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <AppleIcon Icon={Network} bgClass="bg-[#32D74B]" colorClass="text-white" size={18} />
        <h3 className="text-[13px] font-semibold text-white/90 tracking-wide">ATTACK CHAIN</h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-[12px] text-white/70 leading-relaxed font-medium">
            {caseData.mitre_evidence}
          </p>
        </div>
        
        <div className="border-t border-white/10 pt-4">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Provenance & Context</div>
          <p className="text-[12px] text-white/60 leading-relaxed font-medium">
            {caseData.provenance}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   MODEL PERFORMANCE STRIP
═════════════════════════════════════════════ */
export function ModelPerfStrip({ registry }) {
  if (!registry) return null;

  const models = [];
  if (registry.stage1?.xgboost_current_risk?.validation) {
    const v = registry.stage1.xgboost_current_risk.validation;
    models.push({ name: 'Stage-1 XGBoost', metrics: [{ label: 'F1', value: v.f1 }, { label: 'ROC-AUC', value: v.roc_auc }]});
  }
  if (registry.stage1?.forecasting_reference?.validation) {
    const v = registry.stage1.forecasting_reference.validation;
    models.push({ name: 'Persistence', metrics: [{ label: 'Mean F1', value: v.mean_f1 }, { label: 'Mean PR-AUC', value: v.mean_pr_auc }]});
  }
  if (registry.stage2?.catboost_attack_family) {
    const m = registry.stage2.catboost_attack_family;
    models.push({ name: 'Stage-2 CatBoost', metrics: [{ label: 'Val Macro-F1', value: m.validation?.macro_f1 }, { label: 'Test Macro-F1', value: m.test?.macro_f1 }]});
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <AppleIcon Icon={BarChart3} bgClass="bg-[#5E5CE6]" colorClass="text-white" size={18} />
        <h3 className="text-[13px] font-semibold text-white/90 tracking-wide">Validated Metrics</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map(m => (
          <div key={m.name} className="bg-white/5 rounded-[14px] p-4 border border-white/10">
            <div className="text-[13px] font-semibold text-white/90 mb-3">{m.name}</div>
            <div className="space-y-2">
              {m.metrics.map(metric => (
                <div key={metric.label} className="flex justify-between items-center">
                  <span className="text-[12px] text-white/50">{metric.label}</span>
                  <span className="text-[13px] font-medium text-white/90 font-mono">
                    {metric.value?.toFixed(4) ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   CHANNEL DISCLAIMER BANNER
═════════════════════════════════════════════ */
export function ChannelDisclaimer() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
      <Info size={16} className="text-[#0A84FF] shrink-0" strokeWidth={2} />
      <span className="text-[12px] text-white/70 font-medium leading-relaxed">
        Contextual evidence from independent dataset/capture pipelines.
        <span className="ml-1 text-white/90 font-semibold bg-white/10 px-1.5 py-0.5 rounded-md text-[10px] tracking-wide uppercase">temporal_fusion=false</span>
      </span>
    </div>
  );
}

/* ═════════════════════════════════════════════
   CASE LIST ITEM
═════════════════════════════════════════════ */
export function CaseListItem({ c, isActive, onClick }) {
  const isHigh   = c.severity === 'HIGH' || c.severity === 'CRITICAL';
  const isMedium = c.severity === 'MEDIUM';
  const dotColor = isHigh ? 'bg-[#FF453A]' : isMedium ? 'bg-[#FF9F0A]' : 'bg-[#32D74B]';

  const parts = c.case_id.split('_');
  const caseNumber = `Case ${parts[1]}`;
  const caseLabel = parts.slice(2).join(' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div
      onClick={onClick}
      className={clsx(
        "cursor-pointer px-3 py-2.5 rounded-xl flex items-center transition-all duration-200 mb-1",
        isActive ? "bg-white/15 shadow-sm" : "bg-transparent hover:bg-white/5"
      )}
    >
      <div className={clsx("w-2 h-2 rounded-full mr-3 shrink-0", dotColor)} />
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className={clsx(
          "font-semibold text-[13px] truncate transition-colors",
          isActive ? "text-white/90" : "text-white/70"
        )}>
          {caseNumber}
        </div>
        <div className={clsx(
          "text-[11px] truncate",
          isActive ? "text-white/60 font-medium" : "text-white/40 font-medium"
        )}>
          {caseLabel}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   ASSESSMENT HERO (UPDATED: PS153)
═════════════════════════════════════════════ */
export function AssessmentHero({ caseData }) {
  if (!caseData) return null;
  const isHigh   = caseData.severity === 'HIGH' || caseData.severity === 'CRITICAL';
  const isMedium = caseData.severity === 'MEDIUM';

  const severityConfig = isHigh
    ? { bg: 'bg-[#FF453A]', label: 'CRITICAL THREAT' }
    : isMedium
    ? { bg: 'bg-[#FF9F0A]', label: 'ELEVATED RISK' }
    : { bg: 'bg-[#32D74B]', label: 'NORMAL' };

  const attackState = caseData.stage1_output?.current_observed_attack_state;
  const trajectory  = caseData.stage1_output?.trajectory;
  
  // Calculate probability & window
  const forecast = caseData.stage1_output?.forecast;
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
        
        {/* Section 1: Main Status */}
        <div className="flex flex-col gap-5 shrink-0 xl:w-64">
          <div className="flex items-center gap-4">
            <AppleIcon Icon={ShieldAlert} bgClass={severityConfig.bg} size={28} />
            <div>
              <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-0.5">{severityConfig.label}</div>
              <div className="font-bold text-2xl tracking-tight text-white/90">
                {caseData.severity}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <AttackStateBadge state={attackState} />
          </div>
        </div>

        <div className="hidden xl:block w-px bg-white/10" />

        {/* Section 2: Attack Probability & Window (PS153) */}
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

        {/* Section 3: Recommended Action & Confidence */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">Recommended Action</div>
            <div className="text-white/80 text-[14px] font-medium leading-relaxed">
              {caseData.recommended_action}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">Confidence Level</div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/5 text-white/90 text-[12px] font-medium">
              <Crosshair size={14} className="mr-2 text-white/50" />
              {caseData.confidence.split(':')[0]}
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

export function AttackProbabilityChart({ caseData }) {
  if (!caseData || !caseData.stage1_output) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30">
        <Activity size={32} strokeWidth={1.5} className="mb-4" />
        <span className="text-[13px] font-medium">No forecast available</span>
      </div>
    );
  }
  const forecast = caseData.stage1_output.forecast;
  const isHigh   = caseData.severity === 'HIGH' || caseData.severity === 'CRITICAL';
  const data = Object.keys(forecast).map(key => ({ time: key, prob: forecast[key] * 100 }));
  const strokeColor = isHigh ? '#FF453A' : '#FFD60A';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="probHighApple" x1="0" y1="0" x2="0" y2="1">
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
          fill="url(#probHighApple)"
          activeDot={{ r: 5, fill: strokeColor, strokeWidth: 2, stroke: '#1c1c1e' }}
          dot={{ r: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ═════════════════════════════════════════════
   FAMILY BARS (MULTIPLE OUTCOMES)
═════════════════════════════════════════════ */
export function FamilyBars({ caseData }) {
  if (!caseData || !caseData.stage2_output) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30">
        <Cpu size={32} strokeWidth={1.5} className="mb-4" />
        <span className="text-[13px] font-medium">No stage-2 packet data available</span>
      </div>
    );
  }
  const s2 = caseData.stage2_output;
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center justify-between">
        <ScenarioTag metadata={s2.scenario_metadata} />
      </div>
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[14px] font-semibold text-white/90">{s2.dominant_family}</span>
          <span className="text-[16px] text-[#0A84FF] font-bold font-mono">
            {(s2.dominant_family_probability * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
          <div className="h-full rounded-full bg-[#0A84FF]" style={{ width: `${s2.dominant_family_probability * 100}%` }} />
        </div>
      </div>
      {s2.second_family && (
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[13px] font-medium text-white/50">{s2.second_family}</span>
            <span className="text-[13px] text-white/40 font-semibold font-mono">
              {(s2.second_family_probability * 100).toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-white/20" style={{ width: `${s2.second_family_probability * 100}%` }} />
          </div>
        </div>
      )}
      
      {/* Uncertainty Warnings in this panel */}
      {caseData.uncertainty?.length > 0 && (
        <div className="mt-auto bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-[14px] p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-[#FF9F0A]" />
            <span className="text-[11px] font-bold text-[#FF9F0A] uppercase tracking-wide">Caveats</span>
          </div>
          {caseData.uncertainty.map((u, i) => (
            <div key={i} className="text-[11px] text-white/70 mb-1 last:mb-0">• {u}</div>
          ))}
        </div>
      )}
    </div>
  );
}
