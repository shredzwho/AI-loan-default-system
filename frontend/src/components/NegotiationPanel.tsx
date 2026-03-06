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
      <div className="card-premium p-8 w-full animate-pulse h-full bg-white">
        <div className="h-5 bg-slate-100 rounded-full w-1/4 mb-6"></div>
        <div className="h-20 bg-slate-100 rounded-2xl w-full"></div>
      </div>
    );
  }

  if (!negotiationData) return null;

  return (
    <div className="card-premium flex flex-col h-full bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Handshake size={16} className="text-blue-900" />
          <h3 className="label-caps !text-slate-900 !font-black !tracking-[0.15em]">Loan Strategy Engine</h3>
        </div>
        {!negotiationData.requires_negotiation ? (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100">
             <span className="label-caps !text-[10px] !text-emerald-700">Standard Verified</span>
             <CheckCircle2 size={14} />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50/50 px-3 py-1 rounded-full border border-orange-100">
             <span className="label-caps !text-[10px] !text-orange-700">Restructuring Required</span>
             <AlertOctagon size={14} />
          </div>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        {negotiationData.requires_negotiation ? (
          <div className="flex flex-col h-full">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {negotiationData.alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-slate-50/40 p-5 rounded-3xl border border-slate-100 flex flex-col justify-between hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-blue-900 text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest font-display">
                          OPTION {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-blue-900/20 group-hover:bg-blue-600 transition-colors"></div>
                      </div>
                      <h4 className="text-[15px] font-black text-slate-900 mb-2 font-display leading-tight">{alt.option}</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed opacity-80">{alt.details}</p>
                    </div>
                    <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-end">
                       <div className="flex flex-col">
                         <span className="label-caps !text-[9px] !text-slate-400 mb-0.5">ESTIMATED DTI</span>
                         <span className="text-[22px] font-black text-emerald-600 font-display leading-none">{Math.round(alt.projected_dti * 100)}%</span>
                       </div>
                       <ArrowRight size={18} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-auto pt-6 flex items-start gap-3 border-t border-slate-50 mt-6">
                <span className="label-caps !text-slate-300 mt-0.5">Note</span>
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed italic opacity-80">{negotiationData.reasoning}</p>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow py-8 text-center relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-50/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col items-center animate-fade-in">
              <div className="w-20 h-20 bg-emerald-50/80 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 shadow-inner border border-emerald-100/50">
                <CheckCircle2 size={40} className="drop-shadow-sm" />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-8 bg-emerald-100"></div>
                <span className="label-caps !text-emerald-700 !text-[10px] tracking-[0.2em]">Compliance Verified</span>
                <div className="h-px w-8 bg-emerald-100"></div>
              </div>
              
              <h4 className="text-2xl font-black text-slate-900 mb-3 font-display">Standard Terms Valid</h4>
              
              <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-emerald-50 max-w-[360px] shadow-sm">
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Applicant precision score <span className="text-emerald-600 font-black font-display text-base">({Math.round(baseRisk*100)}%)</span> remains within the institutional risk threshold. Standard amortization structure is recommended without further optimization.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NegotiationPanel;

