import React from 'react';
import { Handshake, ArrowRight, AlertOctagon } from 'lucide-react';

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
      <div className="glass-panel p-6 w-full animate-pulse bg-slate-50">
        <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="h-20 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  if (!negotiationData) return null;

  if (!negotiationData.requires_negotiation) {
    return (
      <div className="glass-panel p-4 flex items-center justify-between border border-emerald-200 bg-emerald-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
             <Handshake size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Standard Terms Valid</h4>
            <p className="text-xs text-slate-500 font-medium">Default probability ({Math.round(baseRisk*100)}%) is within acceptable bounds. No restructuring required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 border border-indigo-200 bg-indigo-50/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-900">
        <Handshake size={80} />
      </div>
      
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
           <AlertOctagon size={22} />
        </div>
        <div>
          <h3 className="text-md font-bold text-indigo-900">AI Loan Restructuring Engine</h3>
          <p className="text-xs text-slate-500 font-medium">High Risk Detected ({Math.round(baseRisk*100)}%). Optimizing to achieve &lt;35% DTI Safe Harbor.</p>
        </div>
      </div>

      {negotiationData.alternatives.length > 0 ? (
        <div className="space-y-3 relative z-10">
          {negotiationData.alternatives.map((alt, idx) => (
            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-slate-400">OPTION {String.fromCharCode(65 + idx)}</span>
                  <span className="text-sm font-bold text-slate-800">{alt.option}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{alt.details}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <ArrowRight size={16} className="text-slate-300 hidden sm:block" />
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded text-center min-w-[100px]">
                  <div className="text-[10px] uppercase text-emerald-600 font-bold mb-0.5">Proj. DTI</div>
                  <div className="text-sm font-mono font-bold text-emerald-700">{Math.round(alt.projected_dti * 100)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-white rounded-lg text-sm text-slate-500 font-medium border border-slate-200 text-center shadow-inner relative z-10">
          No simple restructuring option bounds DTI below 35%. Complex manual review required.
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-indigo-200 text-[11px] text-indigo-700 font-mono relative z-10">
        {'>'} {negotiationData.reasoning}
      </div>
    </div>
  );
};

export default NegotiationPanel;
