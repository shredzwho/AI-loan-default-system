import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

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
  subtitle = "Powered by Gemini Explainable AI" 
}) => {
  return (
    <div className="glass-panel p-6 relative overflow-hidden h-full flex flex-col items-stretch">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Bot size={120} />
      </div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="flex-grow flex items-stretch">
        <div className="w-full bg-slate-50 rounded-xl p-5 border border-slate-200 relative z-10 min-h-[150px] shadow-inner">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ) : text ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[15px] font-medium">
                {text}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 italic">
              Select an applicant to generate a risk narrative.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NarrativeBox;
