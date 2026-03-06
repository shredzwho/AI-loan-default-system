import React from 'react';
import { Bot, Sparkles, FileText } from 'lucide-react';

interface NarrativeBoxProps {
  text: string | null;
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

const NarrativeBox: React.FC<NarrativeBoxProps> = ({ 
  text, 
  isLoading, 
  title = "AI Analyst Commentary", 
  subtitle = "Decision Support System" 
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-blue-900" />
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5 opacity-30">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{subtitle}</span>
           <Bot size={14} className="text-slate-400" />
        </div>
      </div>

      <div className="p-5 flex-grow">
        <div className={`h-full min-h-[120px] bg-slate-50/50 rounded-lg p-5 border border-slate-50 transition-all duration-500 overflow-y-auto ${isLoading ? 'animate-pulse' : ''}`}>
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-2.5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-2.5 bg-slate-200 rounded w-full"></div>
              <div className="h-2.5 bg-slate-200 rounded w-5/6"></div>
              <div className="h-2.5 bg-slate-200 rounded w-2/3"></div>
            </div>
          ) : text ? (
            <div className="prose prose-sm max-w-none">
              <div className="text-slate-600 leading-relaxed text-[13px] font-medium font-sans antialiased text-justify">
                {text}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2 py-4">
              <Sparkles size={20} className="opacity-10" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-center opacity-40">
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


