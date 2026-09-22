import React, { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { 
  Shield, Activity, Zap, Upload, ArrowLeft, FileText, LayoutDashboard, 
  History, Settings, Database, Server, Clock, AlertTriangle, CheckCircle2, 
  Radio, UserCheck, Users, Sliders, Layers, GitFork, Play, Pause, RefreshCw, 
  Globe, Terminal, Cpu, ChevronRight, Sparkles, Crosshair
} from 'lucide-react';

import { 
  UploadDropzone,
  TrafficSummary,
  AssessmentHero, 
  AttackProbabilityChart, 
  FamilyBars, 
  ExplainabilityPanel,
  AttackChainContext,
  RiskTrajectory,
  CountermeasuresPanel,
  ZeroDayAnalysisPanel,
  ExecutiveBriefingPanel,
  ScenarioSelector,
  AuthModal,
  FeatureAttributionWaterfall,
  MitreMatrixNavigator,
  BlastRadiusGraph,
  WhatIfDefenseSimulator,
  LiveCaptureStudio,
  ThreatOriginWarMap,
  LeadTimeThreatRadar,
  SoarExecutionTerminal,
  SocAiCopilot,
  PacketHexDissector,
} from './components';

import { 
  RadialGauge, 
  AttackDnaHelix, 
  WorldModelCanvas, 
  ProbWaveBars, 
  LiveTicker 
} from './novelComponents';

import LandingPage from './LandingPage';
import { API_BASE } from './config';
import { MOCK_SCENARIOS, generateOfflineReportForFile } from './mockEngine';

const formatTTC = (val) => {
  if (!val) return 'Lead Time: 12m 30s';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.countdown_str || val.countdown_display || `${val.ttc_seconds}s lead time`;
  return String(val);
};

export default function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'soc'
  const [report, setReport] = useState(() => MOCK_SCENARIOS.benign);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [fileName, setFileName] = useState('01_benign_normal_traffic.csv');
  const [activeTab, setActiveTab] = useState('overview');
  const [activeScenarioId, setActiveScenarioId] = useState('benign');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = localStorage.getItem('netthreat_user');
      return s ? JSON.parse(s) : { username: 'analyst', name: 'Commander Chen', role: 'Lead SOC Architect', badge: 'LEVEL-4 SOC' };
    } catch {
      return { username: 'analyst', name: 'Commander Chen', role: 'Lead SOC Architect', badge: 'LEVEL-4 SOC' };
    }
  });

  // Load specific scenario
  const loadScenario = useCallback(async (id) => {
    setIsUploading(true);
    setUploadError(null);
    setActiveScenarioId(id);
    setFileName(`Scenario: ${id.toUpperCase()}`);

    try {
      const res = await fetch(`${API_BASE}/api/scenarios/${id}/load`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setIsUploading(false);
        return;
      }
    } catch {}

    // Offline fallback for reliable demo
    const fallback = MOCK_SCENARIOS[id] || MOCK_SCENARIOS.neris_c2;
    setReport(fallback);
    setIsUploading(false);
  }, []);

  // Launch scenario from landing page
  const handleLaunchFromLanding = (scenarioId = null) => {
    setViewMode('soc');
    if (scenarioId) {
      loadScenario(scenarioId);
      if (scenarioId === 'zero_day' || scenarioId === 'zeroday') {
        setActiveTab('overview');
      } else if (scenarioId === 'neris_c2') {
        setActiveTab('warmap');
      }
    }
  };

  // Analyze custom file upload
  const analyzeFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    setFileName(file.name);
    setActiveScenarioId(null);
    setViewMode('soc'); // Seamlessly transition to SOC Command Center
    setActiveTab('overview'); // Switch to Overview tab to view results immediately

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setUploadError(null);
        setIsUploading(false);
        return;
      } else {
        const errText = await res.text();
        console.warn("Backend /api/analyze returned non-200:", res.status, errText);
      }
    } catch (e) {
      console.warn("API upload failed, using offline inference engine:", e);
    }

    // Offline fallback for uploaded custom file
    const offlineReport = generateOfflineReportForFile(file.name);
    setReport(offlineReport);
    setUploadError(null);
    setIsUploading(false);
  };

  // Toggle live streaming replay
  const toggleStream = async () => {
    if (isStreaming) {
      clearInterval(streamRef.current);
      setIsStreaming(false);
      return;
    }
    setIsStreaming(true);
    const seq = ['benign', 'recon', 'bruteforce', 'neris_c2', 'ddos', 'zero_day'];
    let i = 0;
    await loadScenario(seq[0]);
    streamRef.current = setInterval(async () => {
      i = (i + 1) % seq.length;
      await loadScenario(seq[i]);
    }, 4500);
  };

  useEffect(() => {
    return () => clearInterval(streamRef.current);
  }, []);

  // Severity color mapping
  const severity = report?.severity || 'NORMAL';
  const severityColor = (
    severity === 'CRITICAL' ? '#FF3B30' :
    severity === 'HIGH' ? '#FF9F0A' :
    severity === 'MEDIUM' ? '#FFD60A' : '#30D158'
  );

  // If in landing mode, render Landing Page
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onLaunchSoc={() => setViewMode('soc')}
        onLoadScenario={handleLaunchFromLanding}
        onUploadFile={analyzeFile}
        isUploading={isUploading}
      />
    );
  }

  // SOC Command Tabs
  const tabs = [
    { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'warmap', label: 'War Map & Radar', icon: Globe },
    { id: 'worldmodel', label: 'World Model & DNA', icon: Cpu },
    { id: 'dissector', label: 'Deep Forensics & Dissector', icon: Terminal },
    { id: 'soar', label: 'SOAR & AI Copilot', icon: Zap },
    { id: 'simulate', label: 'What-If & Live Sniffer', icon: Sliders },
  ];

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-white flex flex-col font-sans relative circuit-bg">
      {/* ═══ TOP COMMAND BAR ═══ */}
      <header className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Platform Logo & Return to Landing */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('landing')}
            className="btn btn-ghost text-xs font-mono py-1.5 px-3 flex items-center gap-1.5"
            title="Return to Landing Page"
          >
            <ArrowLeft size={13} />
            <span>Home</span>
          </button>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center">
              <Shield size={16} className="text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs tracking-wider text-white">NETTHREAT · SOC</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  SIH-153
                </span>
              </div>
              <span className="text-[10px] text-white/40 font-mono hidden md:inline">
                PREEMPTIVE ATTACK FORECASTING PLATFORM
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Alert Ticker */}
        <div className="hidden xl:block flex-1 max-w-xl mx-4">
          <LiveTicker report={report} />
        </div>

        {/* Right: Threat Severity Pill & Action Buttons */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Severity Status Pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold"
            style={{ background: `${severityColor}15`, borderColor: `${severityColor}35`, color: severityColor }}
          >
            <div className="w-2 h-2 rounded-full pulse-threat" style={{ background: severityColor }} />
            <span>{severity}</span>
            <ProbWaveBars active={severity === 'CRITICAL' || severity === 'HIGH'} color={severityColor} />
          </div>

          {/* Live Streaming Toggle */}
          <button
            onClick={toggleStream}
            className={clsx(
              "btn text-xs font-mono flex items-center gap-1.5 py-1.5 px-3",
              isStreaming ? "btn-red" : "btn-ghost"
            )}
          >
            {isStreaming ? <Pause size={13} className="animate-spin" /> : <Play size={13} />}
            <span className="hidden sm:inline">{isStreaming ? "Streaming Active" : "Replay Stream"}</span>
          </button>

          {/* Upload Telemetry Button */}
          <label className="btn btn-cyan text-xs font-mono py-1.5 px-3.5 cursor-pointer flex items-center gap-1.5">
            <Upload size={13} />
            <span className="hidden sm:inline">Upload PCAP</span>
            <input
              type="file"
              className="hidden"
              accept=".pcap,.pcapng,.cap,.csv,.binetflow,.log,.netflow,.json,.tsv,.txt"
              onClick={(e) => { e.target.value = ''; }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  analyzeFile(file);
                }
              }}
            />
          </label>

          {/* User Auth Profile */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="btn btn-ghost text-xs font-mono py-1.5 px-2.5 flex items-center gap-1.5"
            title="Analyst Identity"
          >
            <UserCheck size={13} className="text-cyan-400" />
            <span className="hidden md:inline">{currentUser?.name || 'Analyst'}</span>
          </button>
        </div>
      </header>

      {/* ═══ SCENARIO QUICK-SELECT BAR ═══ */}
      <div className="bg-[#090d18] border-b border-white/5 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 text-[11px] font-mono text-white/50 shrink-0">
          <Activity size={13} className="text-cyan-400" />
          <span>EVALUATION TEST SCENARIOS:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'benign', label: '01 Benign', color: '#30D158' },
            { id: 'recon', label: '02 Recon Scan', color: '#FFD60A' },
            { id: 'bruteforce', label: '03 SSH Bruteforce', color: '#FF9F0A' },
            { id: 'neris_c2', label: '04 Neris C2 Botnet', color: '#FF3B30' },
            { id: 'ddos', label: '05 DDoS Flood', color: '#FF3B30' },
            { id: 'zero_day', label: '06 Zero-Day Exploit', color: '#BF5AF2' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => loadScenario(s.id)}
              disabled={isUploading}
              className={clsx(
                "text-[11px] font-mono px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0 border",
                activeScenarioId === s.id
                  ? "bg-white/10 font-bold border-cyan-400/50 text-white shadow-sm"
                  : "bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-white/40 shrink-0 hidden lg:block">
          SOURCE: <span className="text-white/80">{fileName}</span>
        </div>
      </div>

      {/* ═══ NAVIGATION TABS ═══ */}
      <div className="bg-[#0c1222]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={clsx(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 border",
                isActive
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_16px_rgba(0,240,255,0.15)]"
                  : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Icon size={14} className={clsx(isActive ? "text-cyan-400" : "text-white/40")} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ WORKSPACE CONTENT ═══ */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Loading overlay indicator */}
        {isUploading && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center gap-3 text-cyan-300 font-mono text-xs animate-pulse">
            <RefreshCw size={14} className="animate-spin" />
            <span>AI Inference Pipeline Ingesting Telemetry & Computing Forecast...</span>
          </div>
        )}

        {/* ═══ TAB 1: COMMAND OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Drag & Drop Upload Zone */}
            <div className="glass-card p-6">
              <UploadDropzone
                onFileSelected={analyzeFile}
                isUploading={isUploading}
                error={uploadError}
              />
            </div>

            {/* Top row: Assessment Hero + Radial Threat Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 flex flex-col">
                <AssessmentHero report={report} />
              </div>
              <div className="lg:col-span-4 glass-card p-6 flex flex-col items-center justify-center text-center min-w-0">
                <RadialGauge
                  value={report?.attack_probability || 0}
                  label="Threat Score"
                  size={140}
                  color={severityColor}
                />
                <div className="mt-4 flex items-center gap-2 max-w-full">
                  <ProbWaveBars active={severity === 'CRITICAL' || severity === 'HIGH'} color={severityColor} />
                  <span className="text-xs font-mono font-bold truncate" style={{ color: severityColor }}>
                    {formatTTC(report?.time_to_compromise)}
                  </span>
                </div>
                <p className="text-[11px] text-white/50 mt-3 font-mono leading-snug">
                  Stage 1 Dual Temporal Classifier (XGBoost + CatBoost)
                </p>
              </div>
            </div>

            {/* Attack Chain Context & Risk Trajectory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttackChainContext report={report} />
              <RiskTrajectory report={report} />
            </div>

            {/* Probability Chart & Family Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttackProbabilityChart report={report} />
              <FamilyBars report={report} />
            </div>

            {/* Traffic Summary & Zero-Day Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrafficSummary report={report} />
              <ZeroDayAnalysisPanel report={report} />
            </div>

            {/* Countermeasures & Executive Briefing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CountermeasuresPanel report={report} />
              <ExecutiveBriefingPanel report={report} />
            </div>
          </div>
        )}

        {/* ═══ TAB 2: WAR MAP & RADAR ═══ */}
        {activeTab === 'warmap' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <ThreatOriginWarMap geoContext={report?.geo_context} />
              </div>
              <div className="lg:col-span-4 flex flex-col">
                <LeadTimeThreatRadar
                  timeToCompromise={report?.time_to_compromise}
                  probability={report?.attack_probability}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: WORLD MODEL & ATTACK DNA ═══ */}
        {activeTab === 'worldmodel' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <WorldModelCanvas
                  threatLevel={report?.attack_probability || 0.3}
                  active={severity !== 'NORMAL'}
                />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <AttackDnaHelix report={report} />
              </div>
            </div>

            {/* Feature Attribution Waterfall */}
            <FeatureAttributionWaterfall attributions={report?.feature_attributions} />
          </div>
        )}

        {/* ═══ TAB 4: DEEP FORENSICS & PACKET DISSECTOR ═══ */}
        {activeTab === 'dissector' && (
          <div className="space-y-6">
            {/* Packet Hex Dissector */}
            <PacketHexDissector dissector={report?.packet_dissector} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MitreMatrixNavigator matrix={report?.mitre_matrix} />
              <BlastRadiusGraph blastRadius={report?.blast_radius} />
            </div>
          </div>
        )}

        {/* ═══ TAB 5: SOAR & AI COPILOT ═══ */}
        {activeTab === 'soar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SoarExecutionTerminal countermeasures={report?.countermeasures} report={report} />
            <SocAiCopilot report={report} />
          </div>
        )}

        {/* ═══ TAB 6: WHAT-IF DEFENSE & LIVE SNIFFER ═══ */}
        {activeTab === 'simulate' && (
          <div className="space-y-6">
            <WhatIfDefenseSimulator report={report} />
            <LiveCaptureStudio
              onSnapshotAnalyzed={(newRep) => {
                setReport(newRep);
                setActiveTab('overview');
              }}
              isUploading={isUploading}
            />
          </div>
        )}
      </main>

      {/* ═══ AUTH MODAL ═══ */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          try {
            localStorage.setItem('netthreat_user', JSON.stringify(u));
          } catch {}
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
