'use client';

import React, { useState, useEffect } from 'react';
import { User, Activity, FileWarning, Search, ShieldCheck, Landmark } from 'lucide-react';
import RiskCard from '@/components/RiskCard';
import SHAPChart from '@/components/SHAPChart';
import NarrativeBox from '@/components/NarrativeBox';
import RiskMatrix2x2 from '@/components/RiskMatrix2x2';
import StressTrajectoryChart from '@/components/StressTrajectoryChart';
import NegotiationPanel from '@/components/NegotiationPanel';
import DocumentVerification from '@/components/DocumentVerification';

// Define the massively expanded API Payloads
interface APIResponse {
  applicant_id: number;
  prediction_metrics: {
    base_probability: number;
    adjusted_probability: number;
    risk_category: 'High' | 'Moderate' | 'Low';
  };
  shap_explanation: {
    top_risk_factors: any[];
    top_mitigating_factors: any[];
  };
  trust_graph_analysis: {
    employer_node_flag: string;
    graph_penalty_applied: number;
    adjusted_default_probability: number;
    graph_impact_label: string;
    reasoning: string;
  };
  financial_stress_analysis: {
    stress_score: number;
    risk_window: string;
    historical_balances: number[];
    reasoning: string;
  };
  fraud_matrix_analysis: {
    fraud_intent_score: number;
    fraud_intent_category: string;
    matrix_position: string;
    reasoning: string;
  };
  negotiation_alternatives: {
    requires_negotiation: boolean;
    alternatives: any[];
    reasoning: string;
  };
  genai_insights: {
    narrative: string;
    positive_indicators: string[];
    risk_drivers: string[];
    health_coach_plan: string;
  };
  document_verification: {
    aadhar_verified: boolean;
    pan_verified: boolean;
    salary_slips_verified: boolean;
    bank_statements_verified: boolean;
  };
}

export default function Home() {
  const [applicantId, setApplicantId] = useState<number>(0);
  const [data, setData] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isGenAILoading, setIsGenAILoading] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("0");

  // Handle typed search with a small delay to prevent rapid firing
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed = parseInt(searchInput);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 199) {
        setApplicantId(parsed);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync search input when slider moves
  useEffect(() => {
    setSearchInput(applicantId.toString());
  }, [applicantId]);

  useEffect(() => {
    fetchApplicantData(applicantId);
  }, [applicantId]);

  const fetchApplicantData = (id: number) => {
    setIsLoading(true);
    setIsGenAILoading(true);
    setError(null);
    setData(null);

    try {
      const ws = new WebSocket('ws://localhost:8000/ws/analyze_borrower');

      ws.onopen = () => {
        ws.send(JSON.stringify({ applicant_id: id }));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.type === 'error') {
          setError(response.message);
          setIsLoading(false);
          setIsGenAILoading(false);
          ws.close();
          return;
        }

        if (response.type === 'partial') {
          // Render the core UI instantly
          setData(response.data as APIResponse);
          setIsLoading(false);
        }

        if (response.type === 'complete') {
          // Render the GenAI payloads
          setData(response.data as APIResponse);
          setIsGenAILoading(false);
          ws.close();
        }
      };

      ws.onerror = (err) => {
        setError("WebSocket connection failed. Ensure the backend is running.");
        setIsLoading(false);
        setIsGenAILoading(false);
      };

      ws.onclose = () => {
        // Handle unexpected disconnects during loading
        if (isLoading || isGenAILoading) {
          setIsLoading(false);
          setIsGenAILoading(false);
        }
      };

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setIsLoading(false);
      setIsGenAILoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-900 font-sans">
      {/* Premium Command Center Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-slate-100">
        <div className="flex flex-col">
        <div className="flex items-center gap-4">
          <Landmark className="text-blue-900" size={36} />
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-900 leading-tight">
              LDIS
            </h1>
            <p className="label-caps -mt-1 shadow-none opacity-50">
              Loan Default Intelligence System
            </p>
          </div>
        </div>
        </div>

        {/* Applicant Selector */}
        <div className="flex items-center gap-6 bg-white p-4 px-8 rounded-3xl border border-slate-100 shadow-sm w-full md:w-auto">
          <div className="flex items-center gap-4 flex-grow min-w-[280px]">
            <Search size={18} className="text-blue-900 opacity-40 shrink-0" />
            <div className="flex flex-col flex-grow">
              <label className="label-caps !text-[10px] mb-2 opacity-50">
                Browse Applicants (0-199)
              </label>
              <input
                type="range"
                min="0"
                max="199"
                value={applicantId}
                onChange={(e) => setApplicantId(parseInt(e.target.value))}
                className="w-full h-1.5 accent-blue-900 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="h-10 w-px bg-slate-100 mx-2 hidden md:block"></div>

          <div className="flex flex-col items-center">
            <label className="label-caps !text-[10px] mb-1 opacity-50 block md:hidden">ID</label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-mono text-sm group-focus-within:text-blue-500 transition-colors">#</span>
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val === '' || (parseInt(val) <= 199)) {
                    setSearchInput(val);
                  }
                }}
                className="bg-slate-50 pl-7 pr-4 py-2.5 rounded-xl font-mono font-black text-slate-900 w-[90px] text-left border border-slate-100 shadow-inner text-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                placeholder="000"
              />
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <div className="bg-white border border-red-100 p-10 text-center rounded-2xl shadow-xl w-full max-w-2xl mx-auto mt-20 animate-fade-in">
          <FileWarning size={64} className="mx-auto mb-6 text-red-500 opacity-80" />
          <h2 className="font-black text-2xl text-slate-900 mb-2">System Out of Sync</h2>
          <p className="text-slate-500 font-medium">{error}</p>
          <div className="mt-8 pt-6 border-t border-slate-50">
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-blue-900 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all">
              Reconnect System
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-screen-2xl mx-auto pb-20">

          {/* ROW 1: PRIMARY HUB (Profile, Gauge, Summary Stats) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Borrower Profile */}
            <div className="col-span-1 md:col-span-4 h-full">
              <div className="card-premium h-full flex flex-col overflow-hidden">
                <div className="p-7 bg-slate-50/50 border-b border-slate-100 flex-grow">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img
                        src={`https://ui-avatars.com/api/?name=Applicant+${applicantId}&background=0f172a&color=fff&bold=true`}
                        className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                        alt="Profile"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                        <ShieldCheck size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight font-display tracking-tight">Applicant #{applicantId.toString().padStart(3, '0')}</h3>
                      <p className="label-caps !text-[10px] !text-blue-800">Priority Banking Client</p>
                    </div>
                  </div>
                  <div className="mt-7 grid grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <span className="label-caps !text-[9px]">Client Age</span>
                      <span className="text-sm font-bold text-slate-800">{30 + (applicantId % 40)} Years</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="label-caps !text-[9px]">Classification</span>
                      <span className="text-sm font-bold text-slate-800">Salaried Elite</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="font-semibold text-slate-500">Employer Status</span>
                    <span className={`font-black px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider ${data?.trust_graph_analysis.employer_node_flag.includes('Alert') ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {data?.trust_graph_analysis.employer_node_flag.replace('_', ' ') || 'VERIFIED'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="font-semibold text-slate-500">Verification Hash</span>
                    <span className="font-mono text-xs text-slate-400">0x{applicantId}F{applicantId}A...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="col-span-1 md:col-span-3 h-full">
              <RiskCard
                probability={data?.prediction_metrics.adjusted_probability || 0}
                category={data?.prediction_metrics.risk_category || 'Low'}
              />
            </div>

            {/* Global Logic Stats */}
            <div className="col-span-1 md:col-span-5 h-full">
              <div className="card-premium p-7 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.15em] font-display">Global Risk Vectors</h3>
                    <p className="label-caps mt-1 tracking-widest text-[10px]">Integrated Model Portfolio Metrics</p>
                  </div>
                  <Activity size={20} className="text-blue-900 opacity-20" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-50">
                    <div className="label-caps mb-2 !text-[9px]">Fraud Intent</div>
                    <div className="text-3xl font-black text-slate-900 font-display tracking-tight">{data?.fraud_matrix_analysis.fraud_intent_score.toFixed(1)}%</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-blue-900 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.abs(data?.fraud_matrix_analysis.fraud_intent_score || 0)}%` }}></div>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-50">
                    <div className="label-caps mb-2 !text-[9px]">Financial Stress</div>
                    <div className="text-3xl font-black text-slate-900 font-display tracking-tight">{data?.financial_stress_analysis.stress_score.toFixed(1)}</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-blue-900 h-full rounded-full transition-all duration-1000" style={{ width: `${data?.financial_stress_analysis.stress_score || 0}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-[11px] text-slate-500 font-bold italic border-t border-slate-50 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-900 animate-pulse"></div>
                    <span className="tracking-wide">Live ML Signals Synchronized</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-40">UTC:2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* NEW ROW: Compliance & Verification */}
          <div className="w-full">
            <DocumentVerification 
              status={data?.document_verification || {
                aadhar_verified: false,
                pan_verified: false,
                salary_slips_verified: false,
                bank_statements_verified: false
              }} 
            />
          </div>

          {/* ROW 2: SIGNAL ANALYTICS (Charts) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <div className="col-span-1 md:col-span-6 min-h-[400px]">
              <StressTrajectoryChart stressData={data?.financial_stress_analysis || null} isLoading={isLoading} />
            </div>
            <div className="col-span-1 md:col-span-6 min-h-[400px]">
              <SHAPChart
                riskFactors={data?.shap_explanation.top_risk_factors || null}
                mitigatingFactors={data?.shap_explanation.top_mitigating_factors || null}
              />
            </div>
          </div>

          {/* ROW 3: RISK MAPPING & COMMENTARY */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <div className="col-span-1 md:col-span-4 min-h-[350px]">
              <RiskMatrix2x2 fraudData={data?.fraud_matrix_analysis || null} isLoading={isLoading} />
            </div>
            <div className="col-span-1 md:col-span-8 min-h-[350px]">
              <NarrativeBox
                text={data && data.genai_insights ? data.genai_insights.narrative : null}
                isLoading={isGenAILoading}
                title="Applicant Summary"
                subtitle="Integrated Risk Narrative"
                positiveIndicators={data?.genai_insights?.positive_indicators}
                riskDrivers={data?.genai_insights?.risk_drivers}
              />
            </div>
          </div>

          {/* ROW 4: STRATEGY & RECOURSE */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <div className="col-span-1 md:col-span-7">
              <NegotiationPanel
                negotiationData={data?.negotiation_alternatives || null}
                baseRisk={data?.prediction_metrics.base_probability || 0}
                isLoading={isLoading}
              />
            </div>
            <div className="col-span-1 md:col-span-5 min-h-[280px]">
              <NarrativeBox
                text={data?.genai_insights?.health_coach_plan || null}
                isLoading={isGenAILoading}
                title="AI Health Coach"
                subtitle="Path to Approval & Recourse"
              />
            </div>
          </div>

        </div>
      )}
    </main>
  );

}
