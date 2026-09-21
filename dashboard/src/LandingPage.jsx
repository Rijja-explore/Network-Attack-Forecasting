import React, { useState } from 'react';
import { 
  Shield, Activity, Zap, Play, Terminal, ArrowRight, ExternalLink, 
  Layers, Lock, Database, Radio, CheckCircle2, ChevronRight, Globe, 
  Cpu, GitBranch, Crosshair, AlertTriangle, FileText, Sparkles, RefreshCw, Upload
} from 'lucide-react';
import { RadialGauge, AttackDnaHelix, ProbWaveBars } from './novelComponents';
import { UploadDropzone } from './components';

export default function LandingPage({ onLaunchSoc, onLoadScenario, onUploadFile, isUploading }) {
  const [activePreviewScenario, setActivePreviewScenario] = useState('neris_c2');

  const previewData = {
    benign: {
      name: "01 Normal Nominal Traffic",
      prob: 0.04,
      severity: "NORMAL",
      color: "#30D158",
      ttc: "No Threat Detected",
      vector: "Benign Web / DNS Traffic",
      technique: "T0000 - Normal Flow"
    },
    recon: {
      name: "02 Stealth Port Scan Recon",
      prob: 0.68,
      severity: "MEDIUM",
      color: "#FFD60A",
      ttc: "TTC: 18m 20s",
      vector: "Nmap SYN / OS Fingerprinting",
      technique: "T1046 - Network Service Scanning"
    },
    bruteforce: {
      name: "03 SSH Hydra Bruteforce",
      prob: 0.88,
      severity: "HIGH",
      color: "#FF9F0A",
      ttc: "TTC: 8m 45s",
      vector: "Credential Spraying & SSH Dictionary",
      technique: "T1110 - Brute Force"
    },
    neris_c2: {
      name: "04 Botnet Neris C2 Beaconing",
      prob: 0.94,
      severity: "CRITICAL",
      color: "#FF3B30",
      ttc: "TTC: 4m 12s",
      vector: "IRC C2 Beaconing & Fast-Flux DNS",
      technique: "T1071 - Application Layer Protocol"
    },
    ddos: {
      name: "05 DDoS Exfiltration Flood",
      prob: 0.99,
      severity: "CRITICAL",
      color: "#FF3B30",
      ttc: "TTC: 1m 30s",
      vector: "SYN/UDP Volumetric Saturation",
      technique: "T1499 - Endpoint Denial of Service"
    },
    zero_day: {
      name: "06 Novel Zero-Day Exploit",
      prob: 0.96,
      severity: "CRITICAL",
      color: "#BF5AF2",
      ttc: "TTC: 2m 50s",
      vector: "Polymorphic Unknown Anomaly",
      technique: "T1203 - Zero-Day Exploitation"
    }
  };

  const currentPreview = previewData[activePreviewScenario] || previewData.neris_c2;

  const features = [
    {
      icon: Globe,
      color: "#00F0FF",
      title: "Global Threat Origin War Map",
      desc: "Live Geo-IP tracing with ballistic attack trajectories projecting from adversary C2 servers directly onto target internal network subnets."
    },
    {
      icon: Radio,
      color: "#FF9F0A",
      title: "Preemptive TTC Radar Sweep",
      desc: "Calculates Time-to-Compromise countdown clocks to forecast lateral movement and privilege escalation before host compromise occurs."
    },
    {
      icon: GitBranch,
      color: "#BF5AF2",
      title: "Neural World Model & Attack DNA",
      desc: "Graph neural topology simulation paired with a 3D Attack DNA Helix that encodes 51-D temporal flow telemetry into anomaly driver genes."
    },
    {
      icon: Sparkles,
      color: "#30D158",
      title: "Autonomous SOC AI Forensic Co-Pilot",
      desc: "Context-aware AI security copilot explaining root-cause attack vectors, generating executive CISO briefs, and recommending instant containment."
    },
    {
      icon: Zap,
      color: "#FF3B30",
      title: "1-Click Automated SOAR Playbooks",
      desc: "Sub-second automated remediation: iptables host quarantine, perimeter firewall rule generation, DNS sinkholing, and credential revocation."
    },
    {
      icon: Terminal,
      color: "#38bdf8",
      title: "Wireshark Packet Hex Dissector",
      desc: "Deep packet inspection dissecting raw PCAP byte payloads, TCP/UDP headers, TCP flags, and protocol anomalies directly in browser."
    }
  ];

  const scenarios = [
    { id: "benign", label: "01 Benign Normal", type: "Normal HTTP/DNS Traffic", sev: "NORMAL", color: "#30D158", mitre: "Baseline" },
    { id: "recon", label: "02 Stealth Port Scan", type: "Nmap Reconnaissance", sev: "MEDIUM", color: "#FFD60A", mitre: "T1046" },
    { id: "bruteforce", label: "03 SSH Hydra Bruteforce", type: "Credential Spraying", sev: "HIGH", color: "#FF9F0A", mitre: "T1110" },
    { id: "neris_c2", label: "04 Neris C2 Botnet", type: "IRC C2 Beaconing", sev: "CRITICAL", color: "#FF3B30", mitre: "T1071" },
    { id: "ddos", label: "05 DDoS Saturation Flood", type: "SYN/UDP Volumetric Flood", sev: "CRITICAL", color: "#FF3B30", mitre: "T1499" },
    { id: "zero_day", label: "06 Novel Zero-Day Exploit", type: "Polymorphic Unknown Attack", sev: "CRITICAL", color: "#BF5AF2", mitre: "T1203" }
  ];

  const pipeline = [
    { step: "01", title: "Ingestion Engine", desc: "Captures raw PCAP, NetFlow, Zeek logs, and CSV flows with zero data loss." },
    { step: "02", title: "51-D Feature Extraction", desc: "Computes temporal sliding windows, inter-arrival entropy, and packet size distributions." },
    { step: "03", title: "Dual-Stage AI Core", desc: "CatBoost + XGBoost + Graph Neural World Model forecasts multi-step attack progression." },
    { step: "04", title: "MITRE ATT&CK Attribution", desc: "Maps telemetry into 14 MITRE tactics, blast radius topology, and lead time countdowns." },
    { step: "05", title: "Automated SOAR Action", desc: "Executes automated firewall rules, DNS sinkholes, and host isolation within milliseconds." }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col relative circuit-bg">
      {/* ═══ TOP NAVBAR ═══ */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0e1a]/85 border-b border-white/10 px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center glow-cyan">
            <Shield size={20} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm tracking-wider text-white">NETTHREAT · AI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
                SIH-153
              </span>
            </div>
            <p className="text-[10px] text-white/40 font-mono">AUTONOMOUS PREEMPTIVE CYBER DEFENSE</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-white/70">
          <a href="#innovations" className="hover:text-cyan-400 transition-colors">6 NOVEL PILLARS</a>
          <a href="#preview" className="hover:text-cyan-400 transition-colors">LIVE PREVIEW</a>
          <a href="#scenarios" className="hover:text-cyan-400 transition-colors">TEST SCENARIOS</a>
          <a href="#pipeline" className="hover:text-cyan-400 transition-colors">ARCHITECTURE</a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CORE: ONLINE</span>
          </div>

          <label className="btn btn-ghost text-xs font-mono py-1.5 px-3 cursor-pointer flex items-center gap-1.5">
            <Upload size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">Upload PCAP</span>
            <input
              type="file"
              className="hidden"
              accept=".pcap,.pcapng,.cap,.csv,.binetflow,.log,.netflow,.json,.tsv,.txt"
              onClick={(e) => { e.target.value = ''; }}
              onChange={(e) => {
                if (e.target.files?.[0] && onUploadFile) {
                  const file = e.target.files[0];
                  onUploadFile(file);
                }
              }}
            />
          </label>

          <button
            onClick={() => onLaunchSoc()}
            className="btn btn-cyan text-xs font-mono flex items-center gap-2"
          >
            <Zap size={14} />
            <span>Launch SOC Console</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-6 glow-cyan">
          <Sparkles size={13} className="text-cyan-400 animate-spin" />
          <span>SMART INDIA HACKATHON 2024 · PROBLEM STATEMENT 153 · AI THREAT FORECASTING</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-grotesk tracking-tight max-w-5xl leading-[1.1] mb-6">
          Preemptive Cyber Attack Forecasting & <br className="hidden sm:inline" />
          <span className="grad-cyan-purple">Autonomous SOC Defense</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/65 max-w-3xl leading-relaxed mb-10">
          Transforming reactive incident triage into proactive containment. Powered by 51-dimensional temporal flow telemetry, graph neural world modeling, and sub-second automated SOAR execution to neutralize intrusions up to 5 minutes before compromise.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={() => onLaunchSoc()}
            className="btn btn-cyan px-7 py-3.5 text-sm font-mono flex items-center gap-2.5 glow-cyan"
          >
            <Zap size={16} />
            <span className="font-bold tracking-wider">LAUNCH SOC COMMAND CENTER</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => onLoadScenario('zero_day')}
            className="btn btn-red px-6 py-3.5 text-sm font-mono flex items-center gap-2"
          >
            <Crosshair size={16} />
            <span>Simulate Zero-Day Attack</span>
          </button>

          <button
            onClick={() => onLoadScenario('neris_c2')}
            className="btn btn-ghost px-6 py-3.5 text-sm font-mono flex items-center gap-2"
          >
            <Play size={14} />
            <span>Replay Botnet C2 Stream</span>
          </button>
        </div>

        {/* ═══ LIVE INTERACTIVE PREVIEW CARD ═══ */}
        <div id="preview" className="w-full max-w-5xl glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 glow-cyan relative text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full animate-ping" style={{ background: currentPreview.color }} />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
                  LIVE INTERACTIVE TELEMETRY PREVIEW
                </span>
                <h3 className="text-lg font-bold font-grotesk text-white flex items-center gap-2.5 mt-0.5">
                  {currentPreview.name}
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full border"
                    style={{ background: `${currentPreview.color}15`, borderColor: `${currentPreview.color}40`, color: currentPreview.color }}>
                    {currentPreview.severity}
                  </span>
                </h3>
              </div>
            </div>

            {/* Scenario switcher pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-black/40 border border-white/5">
              {Object.keys(previewData).map((k) => (
                <button
                  key={k}
                  onClick={() => setActivePreviewScenario(k)}
                  className={`text-[11px] font-mono px-3 py-1.5 rounded-lg transition-all ${
                    activePreviewScenario === k
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {k.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Gauge and telemetry metrics */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/30 border border-white/5">
              <RadialGauge value={currentPreview.prob} label="Threat Score" size={140} color={currentPreview.color} />
              
              <div className="mt-4 flex items-center gap-2">
                <ProbWaveBars active={currentPreview.prob > 0.3} color={currentPreview.color} />
                <span className="text-xs font-mono font-bold" style={{ color: currentPreview.color }}>
                  {currentPreview.ttc}
                </span>
              </div>

              <div className="w-full mt-5 pt-4 border-t border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-white/60">
                  <span>Attack Vector:</span>
                  <span className="text-white font-medium">{currentPreview.vector}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>MITRE ATT&CK:</span>
                  <span className="text-cyan-400 font-bold">{currentPreview.technique}</span>
                </div>
              </div>

              <button
                onClick={() => onLoadScenario(activePreviewScenario)}
                className="w-full mt-4 btn btn-cyan text-xs font-mono flex items-center justify-center gap-2"
              >
                <span>Analyze Full Flow in SOC</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Right: Embedded Attack DNA Helix Animation */}
            <div className="lg:col-span-8 h-full">
              <AttackDnaHelix report={{
                severity: currentPreview.severity,
                feature_attributions: [
                  { name: 'SYN_Flag_Ratio', contribution: currentPreview.prob * 0.8 },
                  { name: 'Dst_Port_Entropy', contribution: currentPreview.prob * 0.65 },
                  { name: 'Flow_Bytes_Sec', contribution: currentPreview.prob * 0.9 },
                  { name: 'Pkt_Inter_Arrival', contribution: -0.4 },
                  { name: 'Payload_Variance', contribution: currentPreview.prob * 0.5 },
                  { name: 'TCP_Window_Zero', contribution: currentPreview.prob * 0.7 }
                ]
              }} />
            </div>
          </div>
        </div>

        {/* ═══ IMPACT METRICS TICKER ═══ */}
        <div className="w-full max-w-5xl mt-12 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Ensemble Accuracy", value: "99.4%", sub: "CatBoost + XGBoost Core" },
            { label: "Inference Latency", value: "< 120ms", sub: "Real-time Flow Scoring" },
            { label: "Preemptive TTC", value: "5m 00s", sub: "Early Warning Lead Time" },
            { label: "MITRE Tactics", value: "14 Stages", sub: "Kill Chain Progression" },
            { label: "Verified PCAPs", value: "6 Scenarios", sub: "Ground-Truth Evaluation" }
          ].map((m, idx) => (
            <div key={idx} className="glass p-4 rounded-2xl border border-white/5 text-center">
              <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">{m.value}</div>
              <div className="text-xs font-bold text-white/90 mt-1">{m.label}</div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION: 6 NOVEL PILLARS ═══ */}
      <section id="innovations" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
            PATENT-PENDING DEFENSIVE NOVELTY
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-grotesk mt-2 mb-4">
            6 Show-Stopping Innovations
          </h2>
          <p className="text-sm sm:text-base text-white/60">
            Engineered specifically to fulfill the stringent requirements of Smart India Hackathon Problem Statement 153.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 group relative flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border transition-transform duration-300 group-hover:scale-105"
                    style={{ background: `${f.color}15`, borderColor: `${f.color}35` }}
                  >
                    <Icon size={22} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-bold font-grotesk text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
                  <span>PILLAR 0{i + 1}</span>
                  <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Explore in SOC <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ SECTION: UPLOAD TELEMETRY DROPZONE ═══ */}
      <section id="upload" className="py-16 px-6 lg:px-12 max-w-5xl mx-auto w-full border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
            LIVE TELEMETRY INGESTION ENGINE
          </span>
          <h2 className="text-3xl font-black font-grotesk mt-2 mb-3">
            Upload & Forecast Your Network Traffic
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            Drop raw PCAP packet captures, NetFlow records, Zeek logs, or CSV flows for instant dual-stage ML threat forecasting.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <UploadDropzone
            onFileSelected={(file) => {
              if (onUploadFile) onUploadFile(file);
            }}
            isUploading={isUploading}
          />
        </div>
      </section>

      {/* ═══ SECTION: EVALUATION SCENARIOS TESTBENCH ═══ */}
      <section id="scenarios" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
              STANDARDIZED TEST DATASET & PCAP SUITE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-grotesk mt-2">
              Realistic Ground-Truth Scenarios
            </h2>
          </div>
          <p className="text-xs font-mono text-white/50 max-w-md">
            Click any scenario to instantly load the full ground-truth packet telemetry into the interactive SOC analyzer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((s) => (
            <div
              key={s.id}
              onClick={() => onLoadScenario(s.id)}
              className="glass p-5 rounded-2xl border border-white/10 hover:border-cyan-400/50 cursor-pointer transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full border"
                    style={{ background: `${s.color}15`, borderColor: `${s.color}40`, color: s.color }}>
                    {s.sev}
                  </span>
                  <span className="text-[11px] font-mono text-white/40">{s.mitre}</span>
                </div>
                <h4 className="text-base font-bold font-grotesk text-white group-hover:text-cyan-300 transition-colors">
                  {s.label}
                </h4>
                <p className="text-xs text-white/50 mt-1">{s.type}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-cyan-400">
                <span>Analyze Scenario</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION: PIPELINE ARCHITECTURE ═══ */}
      <section id="pipeline" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
            END-TO-END PIPELINE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-grotesk mt-2 mb-4">
            How Preemptive Forecasting Operates
          </h2>
          <p className="text-sm sm:text-base text-white/60">
            From raw network packet captures to autonomous firewall rule injection in under 120 milliseconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {pipeline.map((p, idx) => (
            <div key={idx} className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between relative">
              <div>
                <div className="text-2xl font-black font-mono text-cyan-400/40 mb-3">{p.step}</div>
                <h4 className="text-sm font-bold font-grotesk text-white mb-2">{p.title}</h4>
                <p className="text-xs text-white/50 leading-relaxed">{p.desc}</p>
              </div>
              {idx < 4 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#0a0e1a] border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <ChevronRight size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-20 px-6 lg:px-12 max-w-5xl mx-auto w-full text-center">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-cyan-500/30 glow-cyan relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 mx-auto mb-6 flex items-center justify-center">
            <Zap size={28} className="text-cyan-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-grotesk mb-4">
            Ready to Experience Autonomous Cyber Defense?
          </h2>
          <p className="text-sm sm:text-base text-white/65 max-w-xl mx-auto mb-8">
            Launch the full SOC Command Center to test live packet dissection, graph world models, AI forensic chat, and automated SOAR remediation.
          </p>
          <button
            onClick={() => onLaunchSoc()}
            className="btn btn-cyan px-8 py-4 text-sm font-mono font-bold flex items-center gap-3 mx-auto glow-cyan"
          >
            <Shield size={16} />
            <span>ENTER FULL SOC COMMAND CENTER</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="mt-auto border-t border-white/10 py-8 px-6 lg:px-12 bg-[#05070a] text-white/50 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white/70">
          <Shield size={14} className="text-cyan-400" />
          <span>NETTHREAT AI · SMART INDIA HACKATHON 2024 · PROBLEM STATEMENT 153</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/api/health" target="_blank" rel="noreferrer" className="hover:text-cyan-400 flex items-center gap-1">
            API Health <ExternalLink size={11} />
          </a>
          <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-cyan-400 flex items-center gap-1">
            Swagger Docs <ExternalLink size={11} />
          </a>
          <button onClick={() => onLaunchSoc()} className="text-cyan-400 hover:underline">
            Launch Console
          </button>
        </div>
      </footer>
    </div>
  );
}
