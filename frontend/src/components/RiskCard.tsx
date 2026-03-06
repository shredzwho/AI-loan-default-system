import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

interface RiskCardProps {
  probability: number;
  category: 'High' | 'Moderate' | 'Low';
}

const RiskCard: React.FC<RiskCardProps> = ({ probability, category }) => {
  const probPercentage = (probability * 100);
  
  // Data for Recharts RadialBarChart
  const data = [
    {
      name: 'Risk',
      value: probPercentage,
      fill: category === 'High' ? '#ef4444' : category === 'Moderate' ? '#f59e0b' : '#10b981',
    },
  ];

  const getRiskIcon = () => {
    switch (category) {
      case 'High': return <ShieldAlert className="text-red-500" size={16} />;
      case 'Moderate': return <Shield className="text-amber-500" size={16} />;
      case 'Low': return <ShieldCheck className="text-emerald-500" size={16} />;
      default: return <Shield className="text-slate-500" size={16} />;
    }
  };

  const getRiskColorClass = () => {
    switch (category) {
      case 'High': return 'text-red-600';
      case 'Moderate': return 'text-amber-600';
      case 'Low': return 'text-emerald-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-between h-full shadow-sm">
      <div className="w-full flex justify-between items-center mb-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Index</h3>
        {getRiskIcon()}
      </div>

      <div className="relative w-full h-36 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="80%"
            outerRadius="100%"
            barSize={10}
            data={data}
            startAngle={210}
            endAngle={-30}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#f8fafc' }}
              dataKey="value"
              cornerRadius={5}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className={`text-3xl font-black tracking-tight ${getRiskColorClass()}`}>
            {probPercentage.toFixed(1)}%
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest -mt-0.5">
            {category} Risk
          </div>
        </div>
      </div>

      <div className="w-full pt-3 mt-1 border-t border-slate-50 flex justify-center">
         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight text-center">
           Ensemble ML Inference Score
         </p>
      </div>
    </div>
  );
};

export default RiskCard;
