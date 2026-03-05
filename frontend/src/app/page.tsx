'use client';

import React, { useState, useEffect } from 'react';
import RiskCard from '@/components/RiskCard';
import SHAPChart from '@/components/SHAPChart';
import NarrativeBox from '@/components/NarrativeBox';
import { User, Activity, FileWarning, Search, FileText } from 'lucide-react';

interface PredictionMetrics {
  default_probability: number;
  risk_category: 'High' | 'Moderate' | 'Low';
}

interface Factor {
  Feature: string;
  Value: number;
  SHAP_Value: number;
}

interface APIResponse {
  applicant_id: number;
  prediction_metrics: PredictionMetrics;
  top_risk_factors: Factor[];
  top_mitigating_factors: Factor[];
  genai_narrative: string;
}

export default function Home() {
  const [applicantId, setApplicantId] = useState<number>(0);
  const [data, setData] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplicantData(applicantId);
  }, [applicantId]);

  const fetchApplicantData = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/analyze_borrower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: id }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="glass-header rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              AI Loan Intelligence
            </h1>
            <p className="text-sm text-slate-400">Predictive and Explainable Financial Risk System</p>
          </div>
        </div>

        {/* Applicant Selector */}
        <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 flex-grow md:flex-grow-0 max-w-md w-full">
          <div className="text-slate-400 pl-2">
            <Search size={18} />
          </div>
          <div className="flex flex-col flex-grow">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Applicant ID (Test Set Index)
            </label>
            <input 
              type="range" 
              min="0" 
              max="1999" 
              value={applicantId}
              onChange={(e) => setApplicantId(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 font-mono font-bold text-blue-400 min-w-[60px] text-center">
            #{applicantId}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Metrics & Profile */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          {/* Risk Card */}
          <div className="h-64">
            {isLoading ? (
              <div className="glass-panel w-full h-full flex items-center justify-center animate-pulse bg-slate-800/50">
                <p className="text-slate-500">Analyzing Risk Profile...</p>
              </div>
            ) : error ? (
              <div className="glass-panel w-full h-full flex flex-col items-center justify-center text-red-400 p-6 text-center ring-1 ring-red-500/30">
                <FileWarning size={40} className="mb-3" />
                <p className="font-semibold">{error}</p>
                <p className="text-xs mt-2 text-slate-400">Ensure the FastAPI backend is running on port 8000.</p>
              </div>
            ) : data ? (
              <RiskCard 
                probability={data.prediction_metrics.default_probability} 
                category={data.prediction_metrics.risk_category} 
              />
            ) : null}
          </div>

          {/* Quick Profile Summary (Derived from SHAP features for UI brevity) */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-400" />
              Applicant Profile Context
            </h3>
            {isLoading ? (
               <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
                  </div>
                ))}
               </div>
            ) : data ? (
              <div className="space-y-3">
                {/* Dynamically list up to 5 actual values from the SHAP payloads to give human context */}
                {[...data.top_risk_factors, ...data.top_mitigating_factors].slice(0, 5).map((f, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                    <span className="text-sm text-slate-400 capitalize">{f.Feature.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-mono font-medium text-slate-200">
                      {f.Value > 1000 ? f.Value.toLocaleString() : f.Value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Explainability & GenAI */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* GenAI Narrative */}
          <div className="h-full min-h-[250px] lg:h-1/3">
             <NarrativeBox 
              text={data ? data.genai_narrative : null} 
              isLoading={isLoading} 
            />
          </div>

          {/* SHAP Chart */}
          <div className="h-[400px] lg:h-2/3">
            {isLoading ? (
              <div className="glass-panel w-full h-full flex flex-col items-center justify-center animate-pulse bg-slate-800/50">
                <FileText size={40} className="text-slate-600 mb-4" />
                <p className="text-slate-500">Computing SHAP values...</p>
              </div>
            ) : data && !error ? (
              <SHAPChart 
                riskFactors={data.top_risk_factors} 
                mitigatingFactors={data.top_mitigating_factors} 
              />
            ) : (
              <div className="glass-panel w-full h-full border border-slate-800 bg-slate-900/40"></div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
