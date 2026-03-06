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
      <div className="glass-panel p-6 w-full animate-pulse bg-slate-800/50">
        <div className="h-5 bg-slate-700/50 rounded w-1/4 mb-4"></div>
        <div className="h-20 bg-slate-700/50 rounded w-full"></div>
      </div>
    );
  }

  if (!negotiationData) return null;

  if (!negotiationData.requires_negotiation) {
    return (
      <div className="glass-panel p-4 flex items-center justify-between border border-emerald-500/20 bg-emerald-900/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
             <Handshake size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Standard Terms Valid</h4>
            <p className="text-xs text-slate-400">Default probability ({Math.round(baseRisk*100)}%) is within acceptable bounds. No restructuring required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 border border-indigo-500/30 bg-indigo-950/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Handshake size={80} />
      </div>
      
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
           <AlertOctagon size={22} />
        </div>
        <div>
          <h3 className="text-md font-bold text-indigo-300">AI Loan Restructuring Engine</h3>
          <p className="text-xs text-slate-400">High Risk Detected ({Math.round(baseRisk*100)}%). Optimizing to achieve &lt;35% DTI Safe Harbor.</p>
        </div>
      </div>

      {negotiationData.alternatives.length > 0 ? (
        <div className="space-y-3 relative z-10">
          {negotiationData.alternatives.map((alt, idx) => (
            <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-slate-500">OPTION {String.fromCharCode(65 + idx)}</span>
                  <span className="text-sm font-bold text-slate-200">{alt.option}</span>
                </div>
                <p className="text-xs text-slate-400">{alt.details}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <ArrowRight size={16} className="text-slate-600 hidden sm:block" />
                <div className="bg-emerald-950/50 border border-emerald-900 px-3 py-1.5 rounded text-center min-w-[100px]">
                  <div className="text-[10px] uppercase text-emerald-500/70 font-bold mb-0.5">Proj. DTI</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{Math.round(alt.projected_dti * 100)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-900/50 rounded-lg text-sm text-slate-300 border border-slate-800 text-center">
          No simple restructuring option bounds DTI below 35%. Complex manual review required.
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-indigo-900/30 text-[11px] text-indigo-300/60 font-mono">
        {'>'} {negotiationData.reasoning}
      </div>
    </div>
  );
};

export default NegotiationPanel;
