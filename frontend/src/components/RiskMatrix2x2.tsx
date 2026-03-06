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
      <div className="glass-panel p-6 h-full flex flex-col justify-center items-center animate-pulse bg-slate-50">
        <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!fraudData) return <div className="glass-panel p-6 h-full border border-slate-200 bg-slate-50"></div>;

  const isHighIntent = fraudData.fraud_intent_category === "High Intent";
  const positionParts = fraudData.matrix_position.split(":");
  const title = positionParts[0];
  const description = positionParts.length > 1 ? positionParts[1].trim() : "";
  
  // Matrix Box Selection
  let boxColor = "bg-white";
  let icon = <ShieldCheck size={28} className="text-emerald-600" />;
  
  if (title.includes("Critical Risk")) {
    boxColor = "bg-red-50/50 ring-1 ring-red-200";
    icon = <ShieldAlert size={28} className="text-red-600" />;
  } else if (title.includes("Sleeper Risk")) {
    boxColor = "bg-orange-50/50 ring-1 ring-orange-200";
    icon = <Crosshair size={28} className="text-orange-600" />;
  } else if (title.includes("Financial Risk")) {
    boxColor = "bg-amber-50/50 ring-1 ring-amber-200";
    icon = <AlertTriangle size={28} className="text-amber-600" />;
  } else {
    boxColor = "bg-emerald-50/30 border border-emerald-200";
  }

  return (
    <div className={`glass-panel p-6 h-full ${boxColor} relative overflow-hidden flex flex-col`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-800">
        <ShieldAlert size={100} />
      </div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        {icon}
        <div>
          <h3 className="text-lg font-bold text-slate-900">OSINT Fraud Matrix</h3>
          <p className="text-xs text-slate-500">Threat Intent vs Capacity</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center relative z-10">
        <div className="mb-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Position Classification</span>
           <h4 className={`text-xl font-black ${title.includes("Safe") ? "text-emerald-700" : "text-slate-900"}`}>
             {title}
           </h4>
           <p className="text-sm text-slate-600 mt-1 font-medium">{description}</p>
        </div>
        
        <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 font-mono leading-relaxed border border-slate-200 shadow-inner">
           {'>'} {fraudData.reasoning}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 relative z-10">
        <div className="text-xs font-semibold text-slate-500">
          Intent Score: <span className={`font-bold ${isHighIntent ? 'text-red-600' : 'text-slate-900'}`}>{fraudData.fraud_intent_score}/100</span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Dual-Layer Engine
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix2x2;
