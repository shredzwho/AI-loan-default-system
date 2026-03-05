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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isRisk = data.shapValue > 0;
    
    return (
      <div className="glass-panel p-3 border border-slate-700 bg-slate-900/95 text-sm">
        <p className="font-semibold text-slate-200 mb-1">{data.name}</p>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Actual Value:</span>
          <span className="font-mono text-slate-100">{Number(data.rawValue).toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Risk Impact:</span>
          <span className={`font-mono font-bold ${isRisk ? 'text-red-400' : 'text-emerald-400'}`}>
            {isRisk ? '+' : ''}{Number(data.shapValue).toFixed(4)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const SHAPChart: React.FC<SHAPChartProps> = ({ riskFactors, mitigatingFactors }) => {
  if (!riskFactors || !mitigatingFactors) return null;

  const data = [
    ...riskFactors.map(f => ({
      name: f.Feature.replace(/_/g, ' ').toUpperCase(),
      originalFeature: f.Feature,
      shapValue: f.SHAP_Value,
      rawValue: f.Value,
      type: 'risk'
    })),
    ...mitigatingFactors.map(f => ({
      name: f.Feature.replace(/_/g, ' ').toUpperCase(),
      originalFeature: f.Feature,
      shapValue: f.SHAP_Value,
      rawValue: f.Value,
      type: 'mitigating'
    }))
  ].sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  return (
    <div className="glass-panel p-6 w-full h-full min-h-[400px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Quantifiable Risk Drivers
        </h3>
        <p className="text-sm text-slate-400">SHAP values indicating mathematical feature impact.</p>
      </div>
      
      <div className="flex-grow w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            
            <XAxis 
              type="number" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              stroke="#475569" 
            />
            
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: '#f1f5f9', fontSize: 11, fontWeight: 500 }}
              width={140}
              stroke="#475569"
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            
            <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 3" />
            
            <Bar dataKey="shapValue" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.type === 'risk' ? '#ef4444' : '#10b981'} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500/80"></div>
          <span>Increases Default Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/80"></div>
          <span>Decreases Default Risk</span>
        </div>
      </div>
    </div>
  );
};

export default SHAPChart;
