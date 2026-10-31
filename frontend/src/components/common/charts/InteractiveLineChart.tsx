import React, { useState } from 'react';

export interface LineChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface InteractiveLineChartProps {
  title?: string;
  subtitle?: string;
  data: LineChartPoint[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
}

export const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  title,
  subtitle,
  data,
  height = 240,
  valuePrefix = '₹',
  valueSuffix = '',
  strokeColor = '#10b981',
  fillColor = 'rgba(16, 185, 129, 0.15)',
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 600;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 40;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  const points = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1 || 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((d.value - minValue) / valueRange) * innerHeight;
    return { x, y, ...d, idx };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`;

  return (
    <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col justify-between ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-2">
          <div>
            {title && <h4 className="text-sm font-black text-white tracking-wide">{title}</h4>}
            {subtitle && <p className="text-xs text-slate-300 mt-0.5 font-medium">{subtitle}</p>}
          </div>
          {hoveredIdx !== null && (
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-300">{data[hoveredIdx].label}: </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {valuePrefix}{data[hoveredIdx].value.toLocaleString('en-IN')}{valueSuffix}
              </span>
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1={paddingX} y1={paddingTop} x2={width - paddingX} y2={paddingTop} stroke="rgba(255,255,255,0.06)" />
          <line x1={paddingX} y1={paddingTop + innerHeight / 2} x2={width - paddingX} y2={paddingTop + innerHeight / 2} stroke="rgba(255,255,255,0.06)" />
          <line x1={paddingX} y1={paddingTop + innerHeight} x2={width - paddingX} y2={paddingTop + innerHeight} stroke="rgba(255,255,255,0.1)" />

          {/* Gradient area */}
          <path d={areaD} fill="url(#lineAreaGrad)" />

          {/* Trend line */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((pt) => {
            const isHovered = hoveredIdx === pt.idx;
            return (
              <g key={pt.label}>
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={paddingTop + innerHeight}
                    stroke="rgba(255,255,255,0.3)"
                    strokeDasharray="4 4"
                  />
                )}
                {/* Data point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={strokeColor}
                  stroke="#0f172a"
                  strokeWidth={2}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(pt.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                {/* X-axis label */}
                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[10px] select-none fill-current ${isHovered ? 'font-bold fill-white' : 'fill-slate-300 font-medium'}`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
