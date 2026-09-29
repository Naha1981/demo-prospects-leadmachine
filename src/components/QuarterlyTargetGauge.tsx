import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface QuarterlyTargetGaugeProps {
  projectedMonthlyRevenue: number;
  quarterlyTarget: number;
  currencyPrefix?: string;
  industryName?: string;
}

export const QuarterlyTargetGauge: React.FC<QuarterlyTargetGaugeProps> = ({
  projectedMonthlyRevenue,
  quarterlyTarget,
  currencyPrefix = 'R',
  industryName
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((projectedMonthlyRevenue / quarterlyTarget) * 100)));
  
  // Recharts data array
  const data = [
    {
      name: 'Projected Revenue',
      value: percentage,
      fill: percentage >= 70 ? '#059669' : percentage >= 40 ? '#10b981' : '#d97706'
    }
  ];

  const statusLabel = percentage >= 80 
    ? 'Exceeding Target' 
    : percentage >= 60 
    ? 'On Track' 
    : percentage >= 35 
    ? 'Pacing Target' 
    : 'Early Pipeline';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-emerald-600 font-bold text-sm">🎯</span>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Quarterly Revenue Pacing</h4>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {industryName ? `${industryName} target realization` : 'Projected monthly revenue vs Q target'}
          </p>
        </div>
        <span className={`text-[11px] font-mono px-2.5 py-1 rounded-md border font-medium ${
          percentage >= 60
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {statusLabel}
        </span>
      </div>

      {/* Circular Radial Gauge */}
      <div className="relative flex items-center justify-center my-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="72%"
            outerRadius="98%"
            barSize={14}
            data={data}
            startAngle={90}
            endAngle={-270}
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
              cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {percentage}%
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5 font-semibold">
            Target Achieved
          </span>
        </div>
      </div>

      {/* Target & Realization Summary Footer */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-medium">Projected Monthly</span>
          <span className="font-bold text-emerald-700 font-mono text-sm">
            {currencyPrefix}{projectedMonthlyRevenue.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block">From active pipeline</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-medium">Quarterly Goal</span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            {currencyPrefix}{quarterlyTarget.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block">3-Month benchmark</span>
        </div>
      </div>
    </div>
  );
};
