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
            loan default intelligence system
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
        <div className="glass-panel text-red-600 p-8 text-center ring-1 ring-red-200 w-full max-w-2xl mx-auto mt-20">
          <FileWarning size={48} className="mx-auto mb-4" />
          <p className="font-bold text-lg">{error}</p>
          <p className="text-sm mt-2 text-slate-500">Ensure the backend services are synchronized.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-screen-2xl mx-auto">

          {/* COLUMN 1: Profile & Core Metrics (3 spans) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-3 space-y-6 flex flex-col">

            {/* Risk Card */}
            <div className="h-64 flex-shrink-0">
              <RiskCard
                probability={data?.prediction_metrics.adjusted_probability || 0}
                category={data?.prediction_metrics.risk_category || 'Low'}
              />
            </div>

            {/* Trust Graph Node Status */}
            <div className="glass-panel p-5 border border-indigo-500/20 bg-indigo-950/10 flex-shrink-0">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                <ShieldCheck size={16} /> Trust Graph Verification
              </h3>
              {isLoading ? (
                <div className="animate-pulse h-16 bg-white/5 rounded"></div>
              ) : data ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Employer Node Flag:</span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded bg-slate-900 ${data.trust_graph_analysis.employer_node_flag.includes('Alert') || data.trust_graph_analysis.employer_node_flag.includes('Volatility') ? 'text-orange-400 border border-orange-500/30' : 'text-emerald-400 border border-emerald-500/30'}`}>
                      {data.trust_graph_analysis.employer_node_flag.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-3 leading-relaxed">
                    {'>'} {data.trust_graph_analysis.reasoning}
                  </div>
                </div>
              ) : null}
            </div>

            {/* GenAI Health Coach */}
            <div className="flex-grow flex flex-col h-full">
              <NarrativeBox
                text={data && data.genai_insights ? data.genai_insights.health_coach_plan : null}
                isLoading={isGenAILoading}
                title="Explainable AI Health Coach"
                subtitle="Path to Approval & Recourse Checklist"
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
              <div className="h-full bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <SHAPChart
                  riskFactors={data?.shap_explanation.top_risk_factors || null}
                  mitigatingFactors={data?.shap_explanation.top_mitigating_factors || null}
                />
              </div>
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
