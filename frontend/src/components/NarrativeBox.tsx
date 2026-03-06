import React from 'react';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';

interface NarrativeBoxProps {
  text: string | null;
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

const NarrativeBox: React.FC<NarrativeBoxProps> = ({ 
  text, 
  isLoading, 
  title = "GenAI Analyst Summary", 
  subtitle = "Executive Committee Decision Support" 
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-900 text-white">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">{title}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{subtitle}</p>
          </div>
        </div>
        <div className="text-blue-950/10">
           <Bot size={24} />
        </div>
      </div>

      <div className="p-5 flex-grow relative">
        <div className={`h-full min-h-[120px] bg-slate-50 rounded-r-lg border-l-4 border-blue-900 p-5 shadow-sm relative transition-all duration-500 ${isLoading ? 'animate-pulse' : ''}`}>
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ) : text ? (
            <div className="prose prose-sm max-w-none">
              <div className="text-slate-700 leading-relaxed text-[14px] font-medium font-sans">
                {text}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 py-8">
              <Sparkles size={24} className="opacity-20" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-center">
                Awaiting Application Context...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NarrativeBox;

