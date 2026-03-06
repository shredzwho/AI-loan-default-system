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
      <div className="glass-panel p-6 h-full flex flex-col justify-center items-center animate-pulse bg-slate-800/50">
        <div className="w-12 h-12 bg-slate-700/50 rounded-full mb-4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
      </div>
    );
  }

  if (!fraudData) return <div className="glass-panel p-6 h-full border border-slate-800 bg-slate-900/40"></div>;

  const isHighIntent = fraudData.fraud_intent_category === "High Intent";
  const positionParts = fraudData.matrix_position.split(":");
  const title = positionParts[0];
  const description = positionParts.length > 1 ? positionParts[1].trim() : "";
  
  // Matrix Box Selection
  let boxColor = "from-slate-800 to-slate-900";
  let icon = <ShieldCheck size={28} className="text-emerald-400" />;
  
  if (title.includes("Critical Risk")) {
    boxColor = "from-red-900/40 to-slate-900 ring-1 ring-red-500/50";
    icon = <ShieldAlert size={28} className="text-red-500" />;
  } else if (title.includes("Sleeper Risk")) {
    boxColor = "from-orange-900/40 to-slate-900 ring-1 ring-orange-500/50";
    icon = <Crosshair size={28} className="text-orange-500" />;
  } else if (title.includes("Financial Risk")) {
    boxColor = "from-amber-900/40 to-slate-900 ring-1 ring-amber-500/50";
    icon = <AlertTriangle size={28} className="text-amber-500" />;
  } else {
    boxColor = "from-emerald-900/20 to-slate-900 border border-emerald-500/30";
  }

  return (
    <div className={`glass-panel p-6 h-full bg-gradient-to-br ${boxColor} relative overflow-hidden flex flex-col`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldAlert size={100} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        {icon}
        <div>
          <h3 className="text-lg font-bold text-slate-100">OSINT Fraud Matrix</h3>
          <p className="text-xs text-slate-400">Threat Intent vs Capacity</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <div className="mb-2">
           <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Position Classification</span>
           <h4 className={`text-xl font-black ${title.includes("Safe") ? "text-emerald-400" : "text-slate-100"}`}>
             {title}
           </h4>
           <p className="text-sm text-slate-300 mt-1">{description}</p>
        </div>
        
        <div className="mt-4 p-3 bg-slate-950/50 rounded-lg text-xs text-slate-400 font-mono leading-relaxed border border-slate-800">
           {'>'} {fraudData.reasoning}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/50 pt-3">
        <div className="text-xs text-slate-500">
          Intent Score: <span className={`font-bold ${isHighIntent ? 'text-red-400' : 'text-slate-300'}`}>{fraudData.fraud_intent_score}/100</span>
        </div>
        <div className="text-xs text-slate-500">
          Dual-Layer Engine
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix2x2;
