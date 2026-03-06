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
      case 'High': return <ShieldAlert className="text-red-500" size={24} />;
      case 'Moderate': return <Shield className="text-amber-500" size={24} />;
      case 'Low': return <ShieldCheck className="text-emerald-500" size={24} />;
      default: return <Shield className="text-slate-500" size={24} />;
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
    <div className="glass-panel p-5 flex flex-col items-center justify-between h-full hover:shadow-xl transition-all duration-300">
      <div className="w-full flex justify-between items-center mb-2">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Risk Assessment</h3>
        {getRiskIcon()}
      </div>

      <div className="relative w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={12}
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
              background={{ fill: '#f1f5f9' }}
              dataKey="value"
              cornerRadius={30}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <div className={`text-4xl font-black tracking-tighter ${getRiskColorClass()}`}>
            {probPercentage.toFixed(1)}%
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {category} Risk
          </div>
        </div>
      </div>

      <div className="w-full pt-4 mt-auto border-t border-slate-100 flex justify-center">
         <p className="text-[10px] text-slate-400 font-medium italic text-center leading-relaxed px-4">
           Probability of default based on ensemble ML vectors.
         </p>
      </div>
    </div>
  );
};

export default RiskCard;

