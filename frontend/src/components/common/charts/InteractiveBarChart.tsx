import React, { useState } from 'react';

export interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  secondaryColor?: string;
  tooltipExtra?: string;
}

export interface InteractiveBarChartProps {
  title?: string;
  subtitle?: string;
  data: BarChartItem[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  showGrid?: boolean;
  className?: string;
  onBarClick?: (item: BarChartItem) => void;
}

export const InteractiveBarChart: React.FC<InteractiveBarChartProps> = ({
  title,
  subtitle,
  data,
  height = 240,
  valuePrefix = '₹',
  valueSuffix = '',
  showGrid = true,
  className = '',
  onBarClick,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0)), 1);
  const chartHeight = height - 60; // leave room for labels and header

  return (
    <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col justify-between ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h4 className="text-sm font-bold text-slate-100">{title}</h4>}
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {hoveredIdx !== null && (
            <div className="text-right">
              <span className="text-xs text-slate-400">{data[hoveredIdx].label}: </span>
              <span className="text-xs font-bold text-white">
                {valuePrefix}{data[hoveredIdx].value.toLocaleString('en-IN')}{valueSuffix}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bar Area */}
      <div className="relative flex items-end justify-between gap-2 pt-6 pb-2" style={{ height: chartHeight }}>
        {/* Horizontal grid lines */}
        {showGrid && (
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-slate-500 w-full" />
            <div className="border-b border-slate-500 w-full" />
            <div className="border-b border-slate-500 w-full" />
          </div>
        )}

        {data.map((item, idx) => {
          const barHeightPercent = Math.max((item.value / maxValue) * 100, 4);
          const isHovered = hoveredIdx === idx;
          const barColor = item.color || '#3b82f6';

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onBarClick && onBarClick(item)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-10 bg-slate-950 text-white px-2 py-1 rounded-md text-[10px] font-bold border border-slate-700 shadow-xl whitespace-nowrap z-20 pointer-events-none">
                  {valuePrefix}{item.value.toLocaleString('en-IN')}{valueSuffix}
                  {item.tooltipExtra && <div className="text-[9px] text-slate-400 font-normal">{item.tooltipExtra}</div>}
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-200 ${
                  isHovered ? 'brightness-125 shadow-lg shadow-blue-500/20' : 'opacity-90 hover:opacity-100'
                }`}
                style={{
                  height: `${barHeightPercent}%`,
                  background: `linear-gradient(to top, ${barColor}, #60a5fa)`
                }}
              />

              {/* X Axis Label */}
              <span className={`text-[10px] truncate max-w-full mt-2 font-medium transition-colors ${
                isHovered ? 'text-white font-bold' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
