'use client';

import React, { useState, useEffect } from 'react';
import { User, Activity, FileWarning, Search, ShieldCheck, Landmark } from 'lucide-react';
import RiskCard from '@/components/RiskCard';
import SHAPChart from '@/components/SHAPChart';
import NarrativeBox from '@/components/NarrativeBox';
import RiskMatrix2x2 from '@/components/RiskMatrix2x2';
import StressTrajectoryChart from '@/components/StressTrajectoryChart';
import NegotiationPanel from '@/components/NegotiationPanel';

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
    health_coach_plan: string;
  };
}

export default function Home() {
  const [applicantId, setApplicantId] = useState<number>(0);
  const [data, setData] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isGenAILoading, setIsGenAILoading] = useState<boolean>(false);

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
      <header className="mb-6 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Landmark className="text-blue-900" size={32} />
            <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-900">
              LDIS
            </h1>
          </div>
          <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-widest pl-11">
            LOAN DEFAULT INTELLIGENCE SYSTEM
          </p>
        </div>

        {/* Applicant Selector */}
        <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
          <Search size={18} className="text-slate-400" />
          <div className="flex flex-col flex-grow min-w-[200px]">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Search Profile ID (0-199)
            </label>
            <input
              type="range"
              min="0"
              max="199"
              value={applicantId}
              onChange={(e) => setApplicantId(parseInt(e.target.value))}
              className="w-full accent-blue-900 mt-1"
            />
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-lg font-mono font-bold text-slate-900 min-w-[70px] text-center border border-slate-200 shadow-inner">
            #{applicantId.toString().padStart(3, '0')}
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-screen-2xl mx-auto">

          {/* COLUMN 1: Borrower Profile & Risk Gauge (3 spans) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-3 space-y-6 flex flex-col">
            
            {/* Borrower Profile Card (Novathon Style) */}
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={`https://ui-avatars.com/api/?name=Applicant+${applicantId}&background=0f172a&color=fff&bold=true`} 
                      className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                      alt="Profile"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                       <ShieldCheck size={10} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">Applicant #{applicantId.toString().padStart(3, '0')}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Priority Banking Client</p>
                  </div>
                </div>
                
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Age</span>
                    <span className="text-xs font-bold text-slate-700">{30 + (applicantId % 40)} Years</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Category</span>
                    <span className="text-xs font-bold text-slate-700">Salaried</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Node Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${data?.trust_graph_analysis.employer_node_flag.includes('Alert') ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {data?.trust_graph_analysis.employer_node_flag.replace('_', ' ') || 'VERIFIED'}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Fraud Score</span>
                    <span className="font-mono font-bold text-slate-800">{data?.fraud_matrix_analysis.fraud_intent_score.toFixed(1)}%</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Stress Index</span>
                    <span className="font-mono font-bold text-slate-800">{data?.financial_stress_analysis.stress_score.toFixed(1)}</span>
                 </div>
              </div>
            </div>

            {/* Risk Card (Gauge) */}
            <div className="h-72 flex-shrink-0">
              <RiskCard
                probability={data?.prediction_metrics.adjusted_probability || 0}
                category={data?.prediction_metrics.risk_category || 'Low'}
              />
            </div>

            {/* GenAI Health Coach */}
            <div className="flex-grow flex flex-col h-full min-h-[250px]">
              <NarrativeBox
                text={data && data.genai_insights ? data.genai_insights.health_coach_plan : null}
                isLoading={isGenAILoading}
                title="AI Health Coach"
                subtitle="Approval Path Optimization"
              />
            </div>

          </div>

          {/* COLUMN 2: Visualizations & Analytics (5 spans) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-5 space-y-6 flex flex-col">

            {/* Financial Stress Chart */}
            <div className="h-72 flex-shrink-0">
              <StressTrajectoryChart stressData={data?.financial_stress_analysis || null} isLoading={isLoading} />
            </div>

            {/* OSINT Fraud Matrix */}
            <div className="h-64 flex-shrink-0">
              <RiskMatrix2x2 fraudData={data?.fraud_matrix_analysis || null} isLoading={isLoading} />
            </div>

            {/* Loan Negotiation Options */}
            <div className="flex-grow">
              <NegotiationPanel
                negotiationData={data?.negotiation_alternatives || null}
                baseRisk={data?.prediction_metrics.base_probability || 0}
                isLoading={isLoading}
              />
            </div>

          </div>

          {/* COLUMN 3: Explainability Details (4 spans) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-4 space-y-6 flex flex-col">

            {/* SHAP Values Chart */}
            <div className="h-[450px] flex-shrink-0">
               <SHAPChart
                 riskFactors={data?.shap_explanation.top_risk_factors || null}
                 mitigatingFactors={data?.shap_explanation.top_mitigating_factors || null}
               />
            </div>

            {/* GenAI Analyst Narrative */}
            <div className="flex-grow h-full min-h-[300px]">
              <NarrativeBox
                text={data && data.genai_insights ? data.genai_insights.narrative : null}
                isLoading={isGenAILoading}
                title="GenAI Committee Summary"
                subtitle="Integrated Financial Risk Narrative"
              />
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
