import React, { useState, useEffect } from 'react';
import { Shield, ChevronLeft, ChevronRight, Activity, Zap, Info } from 'lucide-react';
import { loadCases, loadModelRegistry } from './data/dataService';
import { 
  CaseListItem, 
  AssessmentHero, 
  AttackProbabilityChart, 
  FamilyBars, 
  ExplainabilityPanel,
  AttackChainContext,
  RiskTrajectory,
  ChannelDisclaimer,
  ModelPerfStrip
} from './components';

export default function App() {
  const [cases, setCases] = useState([]);
  const [registry, setRegistry] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadCases(),
      loadModelRegistry()
    ]).then(([caseData, regData]) => {
      setCases(caseData);
      setRegistry(regData);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load data", err);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#000000]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-[28%] bg-white/10 flex items-center justify-center shadow-sm animate-pulse">
          <Zap size={20} className="text-white/70" strokeWidth={1.5} />
        </div>
        <span className="text-white/50 text-[13px] font-medium tracking-wide">Loading data...</span>
      </div>
    </div>
  );

  if (!cases.length) return (
    <div className="h-screen flex items-center justify-center bg-[#000000] text-[#FF453A] font-medium">
      No cases found.
    </div>
  );

  const activeCase = cases[activeIndex];
  const hasStage1 = !!activeCase.stage1_output;
  const hasStage2 = !!activeCase.stage2_output;

  return (
    <div className="h-screen flex overflow-hidden bg-[#000000] text-white font-sans">
      
      {/* Left Navigation Sidebar */}
      <div className="w-[280px] bg-[#1c1c1e]/60 border-r border-white/10 flex flex-col shrink-0 z-10 backdrop-blur-3xl">
        <div className="h-[72px] flex items-center px-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-[28%] bg-gradient-to-b from-[#0A84FF] to-[#0066CC] flex items-center justify-center mr-3 shadow-sm shrink-0">
            <Shield size={16} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-semibold text-[14px] leading-tight text-white/90">Network Attack</h1>
            <h2 className="text-[12px] text-white/50">Forecasting System</h2>
          </div>
        </div>
        
        <div className="p-3 flex-1 overflow-y-auto">
          <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-3 mt-2">
            Cases ({cases.length})
          </h3>
          <div className="space-y-0.5">
            {cases.map((c, i) => (
              <CaseListItem 
                key={c.case_id} 
                c={c} 
                isActive={i === activeIndex} 
                onClick={() => setActiveIndex(i)} 
              />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[12px] text-white/50 font-medium">System Status</span>
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#32D74B] shadow-[0_0_4px_rgba(50,215,75,0.6)]"></div>
            <span className="text-[#32D74B] text-[10px] font-bold tracking-wide">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top App Bar */}
        <div className="h-[72px] px-8 flex items-center justify-between shrink-0 bg-[#000000]/80 border-b border-white/5 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-[18px] font-semibold text-white/90 tracking-tight">Case Overview</h2>
            <div className="h-4 w-px bg-white/20 rounded-full"></div>
            <span className="text-white/50 text-[15px] font-medium">#{activeCase.case_id.replace('CASE_', '')}</span>
          </div>
          
          <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/5 gap-1 backdrop-blur-md">
            <button 
              disabled={activeIndex === 0} 
              onClick={() => setActiveIndex(i => i - 1)}
              className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-20 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <span className="px-2 text-[13px] font-medium text-white/60">
              {activeIndex + 1} <span className="text-white/30 mx-0.5">of</span> {cases.length}
            </span>
            <button 
              disabled={activeIndex === cases.length - 1} 
              onClick={() => setActiveIndex(i => i + 1)}
              className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-20 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Dashboard Grid (PS 153 Restructure) */}
        <div className="flex-1 overflow-y-auto px-8 py-7 bg-[#000000] space-y-6">
          
          {/* Row 1: The Core Forecast */}
          <AssessmentHero caseData={activeCase} />

          {/* Row 2: Disclaimer */}
          <ChannelDisclaimer />
          
          {/* Row 3: Risk Trajectory & Outcomes */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left 2/3: Trajectory & Forecast Chart */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              
              {hasStage1 && (
                <RiskTrajectory caseData={activeCase} />
              )}

              <div className="bg-[#1c1c1e] border border-white/10 rounded-[20px] p-6 h-[340px] flex flex-col relative shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[28%] bg-[#FFD60A]/20 flex items-center justify-center shrink-0">
                      <Activity size={14} className="text-[#FFD60A]" strokeWidth={2} />
                    </div>
                    <h3 className="text-[13px] font-semibold text-white/70 tracking-wide">Flow Forecast</h3>
                  </div>
                  {hasStage1 && (
                    <span className="text-[11px] font-medium text-white/40 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      Stage-1
                    </span>
                  )}
                </div>
                <div className="flex-1 min-h-0">
                  <AttackProbabilityChart caseData={activeCase} />
                </div>
              </div>
            </div>

            {/* Right 1/3: Multiple Outcomes (Stage 2) */}
            <div className="xl:col-span-1">
              <div className="bg-[#1c1c1e] border border-white/10 rounded-[20px] p-6 flex flex-col h-full shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[28%] bg-[#0A84FF]/20 flex items-center justify-center shrink-0">
                      <Zap size={14} className="text-[#0A84FF]" strokeWidth={2} />
                    </div>
                    <h3 className="text-[13px] font-semibold text-white/70 tracking-wide">Attack Type Forecast</h3>
                  </div>
                  {hasStage2 && (
                    <span className="text-[11px] font-medium text-white/40 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      Stage-2
                    </span>
                  )}
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  <FamilyBars caseData={activeCase} />
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Explainability & Attack Chain */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ExplainabilityPanel caseData={activeCase} />
            <AttackChainContext caseData={activeCase} />
          </div>

          {/* Row 5: Model Validation */}
          <ModelPerfStrip registry={registry} />

        </div>

      </div>
    </div>
  );
}
