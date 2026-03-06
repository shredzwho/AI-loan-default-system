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
      <div className="card-premium p-8 h-full flex flex-col justify-center items-center animate-pulse bg-white min-h-[350px]">
         <ActivitySquare size={32} className="text-slate-100 mb-4" />
         <div className="h-4 bg-slate-100 rounded-full w-1/3"></div>
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
    <div className="card-premium p-7 h-full flex flex-col min-h-[350px] bg-white">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-3 font-display tracking-tight">
            <div className="bg-blue-50 p-1.5 rounded-lg">
              <ActivitySquare size={18} className="text-blue-900" />
            </div>
            Financial Health Trajectory
          </h3>
          <p className="label-caps !text-[10px] mt-2 opacity-60">12-Month Synthetic Bank Balance Flow</p>
        </div>
        
        <div className="text-right">
          <div className="label-caps !text-[9px] !text-slate-400 mb-1">STRESS SCORE</div>
          <div className={`text-3xl font-black font-display tracking-tight ${isCritical ? 'text-red-600' : 'text-slate-900'}`}>
            {stressData.stress_score}<span className="text-sm text-slate-300 font-normal ml-1">/100</span>
          </div>
          <div className={`label-caps !text-[8.5px] px-2 py-0.5 mt-2 rounded-lg border ${isCritical ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
            {stressData.risk_window} Window
          </div>
        </div>
      </div>

      <div className="flex-grow w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)' }}
              stroke="#f1f5f9"
              tickFormatter={(val) => `M${val}`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)' }}
              stroke="#f1f5f9"
              tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(0)+'k' : val}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke={isCritical ? "#ef4444" : "#1e40af"} 
              strokeWidth={4}
              dot={{ r: 4, fill: isCritical ? "#ef4444" : "#1e40af", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-50 text-[12px] text-slate-500 font-medium italic leading-relaxed opacity-80">
        <span className="label-caps !text-slate-300 mr-2 not-italic">Note</span>
        {stressData.reasoning}
      </div>
    </div>
  );
};

export default StressTrajectoryChart;
