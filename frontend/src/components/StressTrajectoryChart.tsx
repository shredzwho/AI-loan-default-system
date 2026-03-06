import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivitySquare } from 'lucide-react';

interface StressAnalysis {
  stress_score: number;
  risk_window: string;
  historical_balances: number[];
  reasoning: string;
}

interface StressTrajectoryChartProps {
  stressData: StressAnalysis | null;
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-slate-200 bg-white/95 text-xs font-mono shadow-md">
        <p className="text-slate-500 mb-1">Month {label}</p>
        <p className="font-bold text-slate-800">
          Balance: ${Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const StressTrajectoryChart: React.FC<StressTrajectoryChartProps> = ({ stressData, isLoading }) => {
  if (isLoading || !stressData) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col justify-center items-center animate-pulse bg-slate-50 min-h-[300px]">
         <ActivitySquare size={32} className="text-slate-300 mb-3" />
         <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      </div>
    );
  }

  // Map the 12 month array to chart plotting format
  const chartData = stressData.historical_balances.map((balance, index) => ({
    month: index + 1,
    balance: balance
  }));
  
  const isCritical = stressData.stress_score > 75;

  return (
    <div className="glass-panel p-6 h-full flex flex-col min-h-[300px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ActivitySquare size={18} className="text-blue-700" />
            Financial Health Trajectory
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">12-Month Synthetic Bank Balance Flow</p>
        </div>
        
        <div className="text-right">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Stress Score</div>
          <div className={`text-2xl font-black ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
            {stressData.stress_score}<span className="text-sm text-slate-400 font-normal">/100</span>
          </div>
          <div className={`text-[10px] uppercase font-bold px-2 py-0.5 mt-1 rounded inline-block ${isCritical ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            {stressData.risk_window} Window
          </div>
        </div>
      </div>

      <div className="flex-grow w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              stroke="#cbd5e1"
              tickFormatter={(val) => `M${val}`}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              stroke="#cbd5e1"
              tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(0)+'k' : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke={isCritical ? "#ef4444" : "#3b82f6"} 
              strokeWidth={3}
              dot={{ r: 3, fill: isCritical ? "#ef4444" : "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium italic">
        {stressData.reasoning}
      </div>
    </div>
  );
};

export default StressTrajectoryChart;
