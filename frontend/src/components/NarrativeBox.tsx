import React from 'react';
import { Bot, Sparkles, FileText, CheckCircle2, XCircle } from 'lucide-react';

interface NarrativeBoxProps {
  text: string | null;
  isLoading: boolean;
  title?: string;
  subtitle?: string;
  positiveIndicators?: string[];
  riskDrivers?: string[];
}

const NarrativeBox: React.FC<NarrativeBoxProps> = ({ 
  text, 
  isLoading, 
  title = "Applicant Summary", 
  subtitle = "Decision Support System",
  positiveIndicators = [],
  riskDrivers = []
}) => {
  const parseSteps = (content: string) => {
    // Regex to match numbered steps like "1. Improved..."
    const stepRegex = /(\d+\.\s+)([\s\S]*?)(?=\s+\d+\.\s+|$)/g;
    const matches = Array.from(content.matchAll(stepRegex));
    
    if (matches.length > 0) {
      return matches.map((match, idx) => ({
        id: idx + 1,
        content: match[2].trim()
      }));
    }
    return null;
  };

  const steps = text ? parseSteps(text) : null;

  return (
    <div className="card-premium flex flex-col h-full overflow-hidden bg-white">
      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-blue-900" />
          <h3 className="label-caps !text-slate-900 !font-black !tracking-[0.15em]">{title}</h3>
        </div>
        <div className="flex items-center gap-2 opacity-40">
           <span className="label-caps !text-[9px]">{subtitle}</span>
           <Bot size={14} className="text-slate-900" />
        </div>
      </div>

      <div className="p-8 flex-grow bg-white overflow-y-auto">
        <div className={`h-full min-h-[160px] bg-slate-50/40 rounded-3xl p-8 border border-slate-100/50 transition-all duration-500 ${isLoading ? 'animate-pulse' : ''}`}>
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-3.5 bg-slate-200 rounded-full w-3/4"></div>
              <div className="h-3.5 bg-slate-200 rounded-full w-full"></div>
              <div className="h-3.5 bg-slate-200 rounded-full w-5/6"></div>
              <div className="h-3.5 bg-slate-200 rounded-full w-2/3"></div>
            </div>
          ) : steps ? (
            <div className="space-y-5">
              {steps.map((step) => (
                <div key={step.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-5 items-start hover:border-blue-200 transition-all duration-300 group">
                  <div className="bg-blue-50 text-blue-700 w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                    {String(step.id).padStart(2, '0')}
                  </div>
                  <p className="text-[14px] text-slate-700 font-medium leading-relaxed pt-1.5 antialiased">
                    {step.content}
                  </p>
                </div>
              ))}
            </div>
          ) : text ? (
            <div className="flex flex-col h-full gap-8">
              <div className="text-slate-700 leading-[1.8] text-[15px] font-medium font-sans antialiased text-left px-2">
                {text}
              </div>

              {(positiveIndicators.length > 0 || riskDrivers.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 mt-auto">
                  <div className="bg-emerald-50/50 border border-emerald-100/50 p-5 rounded-2xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Positive Indicators
                    </h4>
                    <ul className="space-y-2">
                      {positiveIndicators.map((item, i) => (
                        <li key={i} className="text-xs font-bold text-emerald-900/70 flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100/50 p-5 rounded-2xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                      Risk Drivers
                    </h4>
                    <ul className="space-y-2">
                      {riskDrivers.map((item, i) => (
                        <li key={i} className="text-xs font-bold text-rose-900/70 flex items-center gap-2">
                          <XCircle size={12} className="text-rose-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4 py-8">
              <Sparkles size={32} className="opacity-20 text-blue-900" />
              <p className="label-caps !text-slate-400 opacity-60 !tracking-[0.2em]">
                PENDING SIGNAL ACQUISITION...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NarrativeBox;


