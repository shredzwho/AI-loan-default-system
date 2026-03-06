import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

interface Factor {
  Feature: string;
  Value: number;
  SHAP_Value: number;
}

interface SHAPChartProps {
  riskFactors: Factor[] | null;
  mitigatingFactors: Factor[] | null;
}

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isRisk = data.shapValue > 0;
    
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl text-sm min-w-[200px]">
        <p className="font-bold text-slate-900 mb-2 border-b border-slate-50 pb-1">{data.name}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 font-medium">Actual Value:</span>
            <span className="font-mono font-bold text-slate-800">{Number(data.rawValue).toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 font-medium">Risk Impact:</span>
            <span className={`font-mono font-black ${isRisk ? 'text-red-500' : 'text-emerald-500'}`}>
              {isRisk ? '+' : ''}{Number(data.shapValue).toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SHAPChart: React.FC<SHAPChartProps> = ({ riskFactors, mitigatingFactors }) => {
  if (!riskFactors || !mitigatingFactors) return null;

  const data = [
    ...riskFactors.slice(0, 5).map(f => ({
      name: f.Feature.replace(/_/g, ' ').toUpperCase(),
      originalFeature: f.Feature,
      shapValue: f.SHAP_Value,
      rawValue: f.Value,
      type: 'risk'
    })),
    ...mitigatingFactors.slice(0, 5).map(f => ({
      name: f.Feature.replace(/_/g, ' ').toUpperCase(),
      originalFeature: f.Feature,
      shapValue: f.SHAP_Value,
      rawValue: f.Value,
      type: 'mitigating'
    }))
  ].sort((a, b) => b.shapValue - a.shapValue);

  return (
    <div className="card-premium p-7 w-full h-full min-h-[400px] flex flex-col bg-white">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight font-display">
            Mathematical Decision Vectors
          </h3>
          <p className="label-caps !text-[10px] mt-1.5 opacity-60">SHAP Factor Contribution Analysis</p>
        </div>
      </div>
      
      <div className="flex-grow w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 40, left: 150, bottom: 0 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" vertical={true} />
            
            <XAxis 
              type="number" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)' }}
              stroke="#f1f5f9"
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-display)' }}
              width={140}
              stroke="#f1f5f9"
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: '#f8fafc' }} 
            />
            
            <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
            
            <Bar dataKey="shapValue" radius={[0, 6, 6, 0]} animationDuration={1200}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.shapValue > 0 ? '#ef4444' : '#10b981'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-10 mt-8 pt-5 border-t border-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/20"></div>
          <span className="label-caps !text-[10px] !text-slate-500">Default Risk +</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></div>
          <span className="label-caps !text-[10px] !text-slate-500">Default Risk -</span>
        </div>
      </div>
    </div>
  );
};

export default SHAPChart;

