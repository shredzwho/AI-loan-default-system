import React from 'react';
import { AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface RiskCardProps {
  probability: number;
  category: 'High' | 'Moderate' | 'Low';
}

const RiskCard: React.FC<RiskCardProps> = ({ probability, category }) => {
  const probPercentage = (probability * 100).toFixed(1);
  
  // Determine styling based on risk category
  let ringColor: string;
  let textColor: string;
  let Icon: React.ElementType;
  let gradientClass: string;
  
  if (category === 'High') {
    ringColor = 'ring-red-500/50';
    textColor = 'text-red-400';
    gradientClass = 'text-gradient-danger';
    Icon = AlertTriangle;
  } else if (category === 'Moderate') {
    ringColor = 'ring-amber-500/50';
    textColor = 'text-amber-400';
    gradientClass = 'text-gradient-warning';
    Icon = Activity;
  } else {
    ringColor = 'ring-emerald-500/50';
    textColor = 'text-emerald-400';
    gradientClass = 'text-gradient-success';
    Icon = ShieldCheck;
  }

  return (
    <div className={`glass-panel p-6 flex flex-col items-center justify-center space-y-4 ring-1 ${ringColor} animate-slide-up hover:scale-[1.02] transition-transform duration-300 h-full`}>
      <div className={`p-4 rounded-full bg-slate-800/80 shadow-inner ${textColor}`}>
        <Icon size={48} strokeWidth={1.5} />
      </div>
      
      <div className="text-center">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Predicted Default Risk
        </h2>
        <div className={`text-5xl font-extrabold text-gradient ${gradientClass}`}>
          {probPercentage}%
        </div>
        <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest border border-current ${textColor} bg-slate-900/50`}>
          {category} Risk
        </div>
      </div>
    </div>
  );
};

export default RiskCard;
