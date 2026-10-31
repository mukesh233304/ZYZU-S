import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  textColor?: string;
}

export interface InteractivePieDonutChartProps {
  title?: string;
  subtitle?: string;
  data: DonutSegment[];
  size?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerValue?: string | number;
  onSegmentClick?: (segment: DonutSegment) => void;
  className?: string;
}

export const InteractivePieDonutChart: React.FC<InteractivePieDonutChartProps> = ({
  title,
  subtitle,
  data,
  size = 220,
  innerRadius = 68,
  centerLabel = 'Total',
  centerValue,
  onSegmentClick,
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const resolvedCenterValue = centerValue !== undefined ? centerValue : total.toLocaleString('en-IN');

  const radius = size / 2;
  const strokeWidth = radius - innerRadius;
  const normalizedRadius = innerRadius + strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  // Compute stroke-dasharray offsets
  let accumulatedPercent = 0;
  const segmentsWithAngles = data.map((item, idx) => {
    const percent = total > 0 ? item.value / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return { ...item, idx, percent, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col justify-between ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h4 className="text-sm font-black text-white tracking-wide">{title}</h4>}
          {subtitle && <p className="text-xs text-slate-300 mt-0.5 font-medium">{subtitle}</p>}
        </div>
      )}

      {/* SVG Donut */}
      <div className="relative flex items-center justify-center my-auto py-2">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth={strokeWidth}
          />
          {segmentsWithAngles.map((seg) => {
            const isHovered = hoveredIdx === seg.idx;
            return (
              <circle
                key={seg.label}
                cx={radius}
                cy={radius}
                r={normalizedRadius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(seg.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSegmentClick && onSegmentClick(seg)}
              />
            );
          })}
        </svg>

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {hoveredIdx !== null ? (
            <>
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider truncate max-w-[120px]">
                {data[hoveredIdx].label}
              </span>
              <span className="text-2xl font-black font-mono text-white">
                {data[hoveredIdx].value.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-bold text-emerald-400">
                {((data[hoveredIdx].value / (total || 1)) * 100).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {centerLabel}
              </span>
              <span className="text-2xl font-black font-mono text-white">
                {resolvedCenterValue}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
        {data.map((seg, idx) => {
          const isHovered = hoveredIdx === idx;
          const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0.0';
          return (
            <button
              key={seg.label}
              onClick={() => onSegmentClick && onSegmentClick(seg)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-1.5 rounded-lg text-left transition-all cursor-pointer ${
                isHovered ? 'bg-slate-800/90 ring-1 ring-cyan-400/40' : 'hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: seg.color }} />
                <span className="text-xs text-slate-200 font-medium truncate">{seg.label}</span>
              </div>
              <span className="text-xs font-mono font-bold text-white shrink-0 ml-1">
                {seg.value} <span className="text-[10px] text-slate-300 font-normal">({pct}%)</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
