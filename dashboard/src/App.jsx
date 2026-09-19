import React, { useState } from 'react';
import clsx from 'clsx';
import { 
  Shield, Activity, Zap, Upload, ArrowLeft, FileText, LayoutDashboard, 
  History, Settings, Database, Server, Clock, AlertTriangle, CheckCircle2, 
  Radio, UserCheck, Users, Sliders, Layers, GitFork
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

export default function App() {
  const [report, setReport] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = React.useRef(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('netthreat_user');
      return saved ? JSON.parse(saved) : {
        username: 'analyst',
        name: 'Sarah Chen',
        role: 'SOC Analyst',
        tier: 'Tier-1 Live Sensor Monitoring',
        badge: 'L1 ANALYST',
        avatar: 'SC',
        color: '#30D158'
      };
    } catch (e) {
      return null;
    }
  });

  const handleSelectScenario = async (scenarioId) => {
    setError(null);
    setIsUploading(true);
    setActiveScenarioId(scenarioId);
    setFileName(`Scenario: ${scenarioId}`);
    try {
      const res = await fetch(`/api/scenarios/${scenarioId}/load`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to load scenario');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load scenario');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleLiveStream = async () => {
    if (isStreaming) {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    const streamSequence = ['benign', 'recon', 'bruteforce', 'neris_c2', 'ddos'];
    let stepIndex = 0;

    await handleSelectScenario(streamSequence[0]);

    streamIntervalRef.current = setInterval(async () => {
      stepIndex = (stepIndex + 1) % streamSequence.length;
      await handleSelectScenario(streamSequence[stepIndex]);
    }, 4000);
  };

  React.useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  const handleFileSelected = async (file) => {
    setError(null);
    setIsUploading(true);
    setFileName(file.name);
    setActiveScenarioId(null);
    setActiveTab('live'); // Force switch to live tab if not already

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze file. Is the API server running?');
      setReport(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsStreaming(false);
    setActiveScenarioId(null);
    setReport(null);
    setError(null);
    setFileName('');
  };

  const navItems = [
    { id: 'live', label: 'Live Analysis', icon: LayoutDashboard },
    { id: 'sniffer', label: 'Live Sniffer Studio', icon: Radio },
    { id: 'history', label: 'Historical Reports', icon: History },
    { id: 'models', label: 'Threat Models', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    if (activeTab === 'sniffer') {
      return (
        <div className="max-w-6xl mx-auto relative z-10 py-6">
          <LiveCaptureStudio 
            onSnapshotAnalyzed={(rep) => {
              setReport(rep);
              setFileName(`Live_Sensor_Snapshot_${new Date().toLocaleTimeString()}`);
              setActiveTab('live');
            }}
            isUploading={isUploading}
          />
        </div>
      );
    }
    if (activeTab === 'history') {
      return (
        <div className="max-w-4xl mx-auto relative z-10 text-center py-24 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <History size={36} className="text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-white/90 mb-3">Historical Reports</h2>
          <p className="text-white/50 max-w-md">Your previously completed analysis reports will appear here. Currently, history is not persisted across browser sessions.</p>
        </div>
      );
    }
    if (activeTab === 'models') {
      return (
        <div className="max-w-4xl mx-auto relative z-10 py-10 space-y-8">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Database size={36} className="text-[#0A84FF]/60" />
            </div>
            <h2 className="text-2xl font-bold text-white/90 mb-3">Threat Models</h2>
            <p className="text-white/50 max-w-md mx-auto">Manage the active machine learning models used by the forecasting engine.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121214] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white/90">Stage 1 (XGBoost)</h3>
                <span className="px-3 py-1 bg-[#30D158]/10 text-[#30D158] text-[11px] font-bold rounded-full uppercase">Active</span>
              </div>
              <p className="text-[13px] text-white/50 mb-6">Predicts overall attack probability from temporal flow features.</p>
              <div className="text-[11px] text-white/30 space-y-1">
                <div>Model file: <span className="font-mono text-white/50">xgboost.pkl</span></div>
                <div>Last updated: <span className="font-mono text-white/50">2026-09-15</span></div>
              </div>
            </div>

            <div className="bg-[#121214] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white/90">Stage 2 (CatBoost)</h3>
                <span className="px-3 py-1 bg-[#30D158]/10 text-[#30D158] text-[11px] font-bold rounded-full uppercase">Active</span>
              </div>
              <p className="text-[13px] text-white/50 mb-6">Classifies exact botnet family signatures from padded feature sets.</p>
              <div className="text-[11px] text-white/30 space-y-1">
                <div>Model file: <span className="font-mono text-white/50">stage2_family_best_model.joblib</span></div>
                <div>Last updated: <span className="font-mono text-white/50">2026-09-15</span></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'settings') {
      return (
        <div className="max-w-2xl mx-auto relative z-10 py-10">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Settings size={36} className="text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white/90 mb-3">Settings</h2>
            <p className="text-white/50">Configure engine thresholds and application preferences.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-[#121214] border border-white/10 rounded-2xl p-6">
              <h3 className="text-[14px] font-semibold text-white/90 mb-4">Risk Thresholds</h3>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-[13px] text-white/60">Critical Alert Threshold</span>
                <span className="px-3 py-1 bg-white/10 rounded text-[13px] font-mono text-white/90">80%</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-[13px] text-white/60">High Alert Threshold</span>
                <span className="px-3 py-1 bg-white/10 rounded text-[13px] font-mono text-white/90">60%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default: 'live' tab
    if (!report) {
      return (
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col">
              <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl flex-1 flex flex-col relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0A84FF]/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-[#0A84FF]/15 transition-all duration-700" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-white/70 uppercase tracking-wider">
                    <Upload size={16} className="text-[#0A84FF]" /> Start New Task
                  </div>
                </div>
                
                <div className="flex-1 relative z-10 flex flex-col justify-center">
                  <UploadDropzone 
                    onFileSelected={handleFileSelected} 
                    isUploading={isUploading}
                    error={error}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-white/70 uppercase tracking-wider mb-5">
                  <Server size={16} className="text-[#30D158]" /> System Readiness
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[#30D158]" />
                      <span className="text-[13px] text-white/80">Stage 1 (XGBoost)</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#30D158]/70">LOADED</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[#30D158]" />
                      <span className="text-[13px] text-white/80">Stage 2 (CatBoost)</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#30D158]/70">LOADED</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[#30D158]" />
                      <span className="text-[13px] text-white/80">API Gateway</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#30D158]/70">ONLINE</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl flex-1 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group" onClick={() => setActiveTab('history')}>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-white/70 uppercase tracking-wider mb-5 group-hover:text-white/90 transition-colors">
                  <History size={16} className="text-[#FF9F0A]" /> Recent Scans
                </div>
                
                <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center">
                  <Clock size={24} className="text-white/20 mb-3 group-hover:text-white/40 transition-colors duration-500" />
                  <p className="text-[13px] text-white/40">No recent scans in this session.</p>
                  <p className="text-[11px] text-white/30 mt-1">Upload a PCAP or CSV to begin.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Load Test Mode & Live Sensor Streamer */}
          <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl">
            <ScenarioSelector
              onSelectScenario={handleSelectScenario}
              isLoading={isUploading}
              activeScenarioId={activeScenarioId}
              onStartLiveStream={handleToggleLiveStream}
              isStreaming={isStreaming}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#30D158]/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-[#30D158]/10 transition-all" />
              <div className="relative z-10">
                <div className="text-[12px] text-white/50 uppercase tracking-widest mb-1">Global Threat Level</div>
                <div className="text-2xl font-bold text-[#30D158] drop-shadow-[0_0_10px_rgba(48,209,88,0.3)]">ELEVATED</div>
              </div>
              <AlertTriangle size={32} className="text-[#30D158]/30 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 flex items-center justify-between shadow-2xl cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group" onClick={() => setActiveTab('models')}>
              <div>
                <div className="text-[12px] text-white/50 uppercase tracking-widest mb-1 group-hover:text-white/70 transition-colors">Active Botnets Tracked</div>
                <div className="text-2xl font-bold text-white/90">7</div>
              </div>
              <Database size={32} className="text-white/10 group-hover:text-white/30 transition-colors group-hover:scale-110" />
            </div>
            <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 flex items-center justify-between shadow-2xl hover:border-white/20 transition-all group">
              <div>
                <div className="text-[12px] text-white/50 uppercase tracking-widest mb-1">Avg Inference Time</div>
                <div className="text-2xl font-bold text-white/90">42ms</div>
              </div>
              <Activity size={32} className="text-white/10 group-hover:text-white/30 transition-colors group-hover:scale-110" />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="max-w-7xl mx-auto space-y-6 relative z-10 pb-10">
          {/* Quick Scenario Switcher Bar */}
          <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-[12px] font-medium border border-white/10 transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Reset View</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A84FF]/20 hover:bg-[#0A84FF]/30 text-[#0A84FF] hover:text-white text-[12px] font-semibold border border-[#0A84FF]/40 transition-all cursor-pointer">
                <Upload size={14} />
                <span>Upload PCAP / CSV</span>
                <input
                  type="file"
                  accept=".csv,.pcap,.pcapng,.cap,.binetflow,.log,.json,.tsv,.netflow"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      e.target.value = '';
                      handleFileSelected(file);
                    }
                  }}
                />
              </label>

              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="text-[12px] text-white/60 truncate font-mono">
                Source: <span className="text-white font-semibold">{report.input_context?.filename || fileName}</span>
              </div>
            </div>

            {/* Quick Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'benign', label: '1. Benign', color: '#30D158' },
                { id: 'recon', label: '2. Recon', color: '#FFD60A' },
                { id: 'bruteforce', label: '3. BruteForce', color: '#FF9F0A' },
                { id: 'neris_c2', label: '4. Neris C2', color: '#FF453A' },
                { id: 'ddos', label: '5. DDoS', color: '#FF3B30' },
                { id: 'zeroday', label: '6. Zero-Day', color: '#BF5AF2' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectScenario(s.id)}
                  disabled={isUploading}
                  className={clsx(
                    "px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all whitespace-nowrap cursor-pointer",
                    activeScenarioId === s.id
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ backgroundColor: s.color }} />
                  {s.label}
                </button>
              ))}

              <button
                onClick={handleToggleLiveStream}
                className={clsx(
                  "px-3 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ml-1 cursor-pointer flex items-center gap-1.5 shrink-0",
                  isStreaming
                    ? "bg-[#FF3B30] text-white animate-pulse"
                    : "bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/40 hover:bg-[#0A84FF]/30"
                )}
              >
                <Activity size={12} className={clsx(isStreaming && "animate-spin")} />
                <span>{isStreaming ? "STREAMING" : "STREAM DEMO"}</span>
              </button>
            </div>
          </div>

          <TrafficSummary report={report} />
          <AssessmentHero report={report} />
          <RiskTrajectory report={report} />
          
          {/* SIH-153 Showstopper 1 & 2: Preemptive Lead-Time Threat Radar & Ballistic Threat Origin War Map */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <LeadTimeThreatRadar timeToCompromise={report.time_to_compromise} probability={report.attack_probability} />
            <ThreatOriginWarMap geoContext={report.geo_context} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="bg-[#121214] border border-white/10 rounded-[24px] p-6 h-[340px] flex flex-col shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[28%] bg-[#FFD60A]/20 flex items-center justify-center shrink-0">
                      <Activity size={14} className="text-[#FFD60A]" strokeWidth={2} />
                    </div>
                    <h3 className="text-[13px] font-semibold text-white/70 tracking-wide">Attack Probability Forecast</h3>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <AttackProbabilityChart report={report} />
                </div>
              </div>
            </div>

            <div className="xl:col-span-1">
              <div className="bg-[#121214] border border-white/10 rounded-[24px] p-6 flex flex-col h-full shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[28%] bg-[#FF453A]/20 flex items-center justify-center shrink-0">
                      <Zap size={14} className="text-[#FF453A]" strokeWidth={2} />
                    </div>
                    <h3 className="text-[13px] font-semibold text-white/70 tracking-wide">Attack Type Classification</h3>
                  </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  <FamilyBars report={report} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ExplainabilityPanel report={report} />
            <AttackChainContext report={report} />
          </div>

          <ZeroDayAnalysisPanel report={report} />
          
          {/* SIH-153 Novel Cyber Intelligence & Forecasting Suite */}
          <FeatureAttributionWaterfall attributions={report.feature_attributions} />
          <MitreMatrixNavigator matrix={report.mitre_matrix} />
          <BlastRadiusGraph blastRadius={report.blast_radius} />
          <WhatIfDefenseSimulator report={report} />

          {/* SIH-153 Showstopper 3 & 4: Autonomous SOC AI Forensic Co-Pilot & Live SOAR Playbook Remediation */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SocAiCopilot report={report} />
            <SoarExecutionTerminal countermeasures={report.countermeasures} report={report} />
          </div>

          {/* SIH-153 Showstopper 5: Wireshark-Grade Deep Packet Hex Dissector */}
          <PacketHexDissector dissector={report.hex_dissector} />

          <CountermeasuresPanel report={report} />
          <ExecutiveBriefingPanel report={report} />
        </div>
      );
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#000000] text-white font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-[260px] border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 z-30">
        <div className="h-[72px] flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* Animated Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A84FF]/20 to-[#00478F]/40 flex items-center justify-center shadow-[0_0_20px_rgba(10,132,255,0.2)] shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 border-2 border-[#0A84FF]/30 rounded-xl animate-[spin_4s_linear_infinite]" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
              <div className="absolute inset-[2px] border-[1.5px] border-[#30D158]/30 rounded-lg animate-[spin_3s_linear_infinite_reverse]" style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent' }} />
              <div className="absolute inset-[4px] bg-[#0A84FF]/10 rounded-full animate-pulse" />
              <Activity size={16} className="text-[#0A84FF] relative z-10 drop-shadow-[0_0_5px_#0A84FF]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-[15px] leading-tight text-white/90 tracking-tight">NetThreat AI</h1>
              <h2 className="text-[10px] text-[#0A84FF] font-semibold tracking-[0.2em] uppercase mt-0.5">Engine Active</h2>
            </div>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          <div className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4 px-2">Navigation</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive 
                    ? 'bg-[#0A84FF]/10 text-[#0A84FF]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                {item.label}
              </button>
            )
          })}
        </div>
        
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c1e] border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-white/50 uppercase tracking-widest">Engine Status</span>
              <span className="text-[13px] font-medium text-white/90">Online & Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000] relative">
        
        {/* Top App Bar */}
        <div className="h-[72px] px-8 flex items-center justify-between shrink-0 bg-[#000000]/60 border-b border-white/5 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex flex-col">
            <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
              {activeTab === 'live' && report ? (
                <>
                  <button onClick={handleReset} className="text-white/50 hover:text-white transition-colors mr-2">
                    <ArrowLeft size={18} />
                  </button>
                  Analysis Report
                </>
              ) : (
                navItems.find(i => i.id === activeTab)?.label || 'Dashboard Command Center'
              )}
            </h2>
            {activeTab === 'live' && !report && (
              <span className="text-[12px] text-white/40 mt-0.5">Upload network traffic records to initiate the multi-stage threat forecasting pipeline.</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {activeTab === 'live' && report && (
              <>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A84FF]/20 hover:bg-[#0A84FF]/30 text-[#0A84FF] hover:text-white text-[12px] font-semibold border border-[#0A84FF]/40 transition-all cursor-pointer shadow-lg shadow-[#0A84FF]/10">
                  <Upload size={13} />
                  <span>Upload New File</span>
                  <input
                    type="file"
                    accept=".csv,.pcap,.pcapng,.cap,.binetflow,.log,.json,.tsv,.netflow"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        e.target.value = '';
                        handleFileSelected(file);
                      }
                    }}
                  />
                </label>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <FileText size={13} className="text-[#0A84FF]" strokeWidth={2} />
                  <span className="text-[12px] text-white/70 font-medium font-mono truncate max-w-[140px]">
                    <span className="text-white/90">{fileName}</span>
                  </span>
                </div>
              </>
            )}

            {/* Persona Switcher / User Login Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer group shadow-sm"
              title="Click to Switch SOC Persona / Login"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border"
                style={{ 
                  color: currentUser?.color || '#30D158', 
                  backgroundColor: `${currentUser?.color || '#30D158'}20`, 
                  borderColor: `${currentUser?.color || '#30D158'}50` 
                }}
              >
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'SC'}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-[11px] font-bold text-white leading-tight">
                  {currentUser?.name || 'Sarah Chen'}
                </span>
                <span className="text-[9px] font-mono text-white/50">
                  {currentUser?.badge || 'L1 ANALYST'}
                </span>
              </div>
              <UserCheck size={13} className="text-white/40 group-hover:text-white transition-colors ml-0.5" />
            </button>
          </div>
        </div>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto px-8 py-8 relative">
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(10,132,255,0.08),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-[0.12] pointer-events-none" />
          
          {renderContent()}
          
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          try {
            localStorage.setItem('netthreat_user', JSON.stringify(u));
          } catch (e) {}
        }} 
        currentUser={currentUser} 
      />
    </div>
  );
}
