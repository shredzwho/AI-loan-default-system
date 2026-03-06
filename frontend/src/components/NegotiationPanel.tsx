import React from 'react';
import { Handshake, ArrowRight, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface Alternative {
  option: string;
  details: string;
  projected_dti: number;
}

interface NegotiationData {
  requires_negotiation: boolean;
  alternatives: Alternative[];
  reasoning: string;
}

interface NegotiationPanelProps {
  negotiationData: NegotiationData | null;
  baseRisk: number;
  isLoading: boolean;
}

const NegotiationPanel: React.FC<NegotiationPanelProps> = ({ negotiationData, baseRisk, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-6 w-full animate-pulse h-full">
        <div className="h-4 bg-slate-100 rounded w-1/4 mb-4"></div>
        <div className="h-12 bg-slate-100 rounded w-full"></div>
      </div>
    );
  }

  if (!negotiationData) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-xl flex flex-col h-full shadow-sm">
      <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Handshake size={14} className="text-blue-900" />
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Loan Strategy Engine</h3>
        </div>
        {!negotiationData.requires_negotiation ? (
          <div className="flex items-center gap-1.5 text-emerald-600">
             <span className="text-[9px] font-bold uppercase tracking-wider">Standard Verified</span>
             <CheckCircle2 size={14} />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-orange-600">
             <span className="text-[9px] font-bold uppercase tracking-wider">Restructuring Required</span>
             <AlertOctagon size={14} />
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        {negotiationData.requires_negotiation ? (
          <div className="flex flex-col h-full">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {negotiationData.alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-colors">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">OPT {String.fromCharCode(65 + idx)}</span>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">{alt.option}</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{alt.details}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100/50 flex justify-between items-center">
                       <span className="text-[9px] font-bold text-slate-400 uppercase">Proj. DTI</span>
                       <span className="text-xs font-mono font-black text-emerald-600">{Math.round(alt.projected_dti * 100)}%</span>
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-auto pt-4 flex items-start gap-2 border-t border-slate-50 mt-4">
                <span className="text-[10px] font-black text-slate-300 uppercase mt-0.5">Note</span>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{negotiationData.reasoning}</p>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow py-6 text-center">
             <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <CheckCircle2 size={24} />
             </div>
             <h4 className="text-sm font-bold text-slate-800 mb-1">Standard Terms Valid</h4>
             <p className="text-xs text-slate-500 max-w-[280px]">Predicted risk score ({Math.round(baseRisk*100)}%) is within standard approval tolerances.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NegotiationPanel;

