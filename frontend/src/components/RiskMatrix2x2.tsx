import React from 'react';
import { ShieldAlert, Crosshair, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FraudMatrixAnalysis {
  fraud_intent_score: number;
  fraud_intent_category: string;
  matrix_position: string;
  reasoning: string;
}

interface RiskMatrixProps {
  fraudData: FraudMatrixAnalysis | null;
  isLoading: boolean;
}

const RiskMatrix2x2: React.FC<RiskMatrixProps> = ({ fraudData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card-premium p-8 h-full flex flex-col justify-center items-center animate-pulse bg-white">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl mb-6 shadow-sm"></div>
        <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
      </div>
    );
  }

  if (!fraudData) return <div className="card-premium p-8 h-full border border-slate-100 bg-white"></div>;

  const isHighIntent = fraudData.fraud_intent_category === "High Intent";
  const positionParts = fraudData.matrix_position.split(":");
  const title = positionParts[0];
  const description = positionParts.length > 1 ? positionParts[1].trim() : "";
  
  // Matrix Box Selection
  let boxColor = "bg-white";
  let icon = <ShieldCheck size={32} className="text-emerald-600" />;
  
  if (title.includes("Critical Risk")) {
    boxColor = "bg-red-50/20";
    icon = <ShieldAlert size={32} className="text-red-600" />;
  } else if (title.includes("Sleeper Risk")) {
    boxColor = "bg-orange-50/20";
    icon = <Crosshair size={32} className="text-orange-600" />;
  } else if (title.includes("Financial Risk")) {
    boxColor = "bg-amber-50/20";
    icon = <AlertTriangle size={32} className="text-amber-600" />;
  } else {
    boxColor = "bg-emerald-50/10";
  }

  return (
    <div className={`card-premium p-8 h-full ${boxColor} relative overflow-hidden flex flex-col bg-white`}>
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-slate-900 pointer-events-none">
        <ShieldAlert size={120} />
      </div>

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-50">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 font-display tracking-tight">OSINT Fraud Matrix</h3>
          <p className="label-caps !text-[10px] mt-1.5 opacity-60">Threat Intent vs Capacity Analysis</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center relative z-10">
        <div className="mb-4">
           <span className="label-caps !text-[9px] mb-2 block">Position Classification</span>
           <h4 className={`text-2xl font-black font-display tracking-tight ${title.includes("Safe") ? "text-emerald-600" : "text-slate-900"}`}>
             {title}
           </h4>
           <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">{description}</p>
        </div>
        
        <div className="mt-5 p-5 bg-slate-50/50 rounded-2xl text-[12px] text-slate-600 font-mono leading-relaxed border border-slate-50/50 shadow-inner">
           <span className="text-slate-300 mr-2">LOG:</span> {fraudData.reasoning}
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-5 relative z-10">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Intent Score: <span className={`font-black font-display text-base ml-1 ${isHighIntent ? 'text-red-600' : 'text-slate-900'}`}>{fraudData.fraud_intent_score}<span className="text-[10px] text-slate-300 font-normal ml-0.5">/100</span></span>
        </div>
        <div className="label-caps !text-[9px] opacity-40">
          Dual-Layer Proprietary Engine
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix2x2;
