import React, { useState, useMemo } from 'react';
import { TeacherPayout } from '../../../types';
import { TeacherPayrollItem } from '../../../types/finance';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export type TimeFilter = '7D' | '30D' | '3M' | '6M' | '1Y';

interface TeacherRevenueChartProps {
  payouts: TeacherPayout[];
  payrollRecords: TeacherPayrollItem[];
  monthlyFeeRunrate?: number;
}

interface ChartDataPoint {
  label: string;
  earnings: number;
  paid: number;
  pending: number;
}

export const TeacherRevenueChart: React.FC<TeacherRevenueChartProps> = ({
  payouts,
  payrollRecords,
  monthlyFeeRunrate = 0,
}) => {
  const [filter, setFilter] = useState<TimeFilter>('6M');
  const [activeSeries, setActiveSeries] = useState<{
    earnings: boolean;
    paid: boolean;
    pending: boolean;
  }>({
    earnings: true,
    paid: true,
    pending: true,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute aggregated data points strictly from real records
  const chartData = useMemo<ChartDataPoint[]>(() => {
    // Generate chronological buckets based on filter
    const now = new Date();
    const points: ChartDataPoint[] = [];

    if (filter === '7D') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

        // Sum payouts credited on this exact day
        const dayPaid = payouts
          .filter((p) => p.status === 'paid' && p.date === dayStr)
          .reduce((sum, p) => sum + p.amount, 0);

        points.push({
          label,
          earnings: dayPaid,
          paid: dayPaid,
          pending: 0,
        });
      }
    } else if (filter === '30D') {
      // 4 Weekly intervals over 30 days
      for (let w = 3; w >= 0; w--) {
        const startDay = new Date();
        startDay.setDate(now.getDate() - (w + 1) * 7);
        const endDay = new Date();
        endDay.setDate(now.getDate() - w * 7);

        const label = `W-${4 - w}`;
        const weekPaid = payouts
          .filter((p) => {
            const pDate = new Date(p.date);
            return p.status === 'paid' && pDate >= startDay && pDate <= endDay;
          })
          .reduce((sum, p) => sum + p.amount, 0);

        points.push({
          label,
          earnings: weekPaid,
          paid: weekPaid,
          pending: 0,
        });
      }
    } else {
      // Monthly aggregation (3M, 6M, 1Y)
      const monthsCount = filter === '3M' ? 3 : filter === '6M' ? 6 : 12;

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYearStr = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        const monthFull = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const monthShort = d.toLocaleDateString('en-IN', { month: 'short' });

        // Find matching payroll record for this month
        const matchedPayroll = payrollRecords.find(
          (pr) =>
            pr.billingMonth.toLowerCase().includes(monthShort.toLowerCase()) ||
            pr.billingMonth.toLowerCase().includes(monthFull.toLowerCase())
        );

        // Find payouts in this month
        const matchedPayouts = payouts.filter((p) => {
          const pMonthMatch = p.month.toLowerCase().includes(monthShort.toLowerCase());
          return pMonthMatch;
        });

        const paid = matchedPayouts
          .filter((p) => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0) || (matchedPayroll?.status === 'PAID' ? matchedPayroll.netPayable : 0);

        const pending = matchedPayouts
          .filter((p) => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0) || 
          (matchedPayroll && matchedPayroll.status !== 'PAID' ? matchedPayroll.netPayable : 0);

        const earnings = matchedPayroll
          ? matchedPayroll.teacherEarnings
          : paid + pending;

        points.push({
          label: monthYearStr,
          earnings,
          paid,
          pending,
        });
      }
    }

    return points;
  }, [filter, payouts, payrollRecords]);

  // Determine max value for scaling SVG
  const maxValue = useMemo(() => {
    let max = 0;
    chartData.forEach((pt) => {
      if (activeSeries.earnings && pt.earnings > max) max = pt.earnings;
      if (activeSeries.paid && pt.paid > max) max = pt.paid;
      if (activeSeries.pending && pt.pending > max) max = pt.pending;
    });
    return max > 0 ? Math.ceil(max * 1.15) : 10000;
  }, [chartData, activeSeries]);

  const hasData = useMemo(() => {
    return chartData.some((pt) => pt.earnings > 0 || pt.paid > 0 || pt.pending > 0);
  }, [chartData]);

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 240;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 40;

  const innerWidth = svgWidth - padLeft - padRight;
  const innerHeight = svgHeight - padTop - padBottom;

  const getX = (index: number) => {
    if (chartData.length <= 1) return padLeft + innerWidth / 2;
    return padLeft + (index / (chartData.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const ratio = Math.min(1, Math.max(0, val / maxValue));
    return padTop + innerHeight - ratio * innerHeight;
  };

  const createPath = (key: 'earnings' | 'paid' | 'pending') => {
    if (chartData.length === 0) return '';
    return chartData
      .map((pt, i) => {
        const x = getX(i);
        const y = getY(pt[key]);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const createAreaPath = (key: 'earnings' | 'paid' | 'pending') => {
    if (chartData.length === 0) return '';
    const line = createPath(key);
    const lastX = getX(chartData.length - 1);
    const firstX = getX(0);
    const bottomY = padTop + innerHeight;
    return `${line} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Revenue & Payout Analytics</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Authoritative visualization of earned, disbursed, and pending educator settlements
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(['7D', '30D', '3M', '6M', '1Y'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === f
                  ? 'bg-white text-royal-blue-700 shadow-xs'
                  : 'text-slate-700 font-semibold hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Series Toggles & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSeries((s) => ({ ...s, earnings: !s.earnings }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              activeSeries.earnings
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Eligible Earnings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSeries((s) => ({ ...s, paid: !s.paid }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              activeSeries.paid
                ? 'bg-blue-50 text-royal-blue-800 border-royal-blue-300'
                : 'bg-slate-100 text-slate-600 border-slate-300 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-royal-blue-600 inline-block" />
            <span>Paid Out (Disbursed)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSeries((s) => ({ ...s, pending: !s.pending }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
              activeSeries.pending
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-600 border-slate-300 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Pending Settlement</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-600 font-bold hidden sm:inline">
          Amounts in INR (₹)
        </span>
      </div>

      {/* Responsive Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '190px' }}
        >
          <defs>
            <linearGradient id="earningsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="paidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="pendingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const val = Math.round(maxValue * (1 - pct));
            const y = padTop + pct * innerHeight;
            return (
              <g key={pct}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-600 text-[11px] font-mono font-bold"
                >
                  ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={padLeft}
            y1={padTop + innerHeight}
            x2={svgWidth - padRight}
            y2={padTop + innerHeight}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* X-axis labels */}
          {chartData.map((pt, i) => (
            <text
              key={i}
              x={getX(i)}
              y={svgHeight - 12}
              textAnchor="middle"
              className="fill-slate-700 text-[11px] font-bold"
            >
              {pt.label}
            </text>
          ))}

          {/* Areas and Lines */}
          {activeSeries.earnings && (
            <>
              <path d={createAreaPath('earnings')} fill="url(#earningsGrad)" />
              <path
                d={createPath('earnings')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {activeSeries.paid && (
            <>
              <path d={createAreaPath('paid')} fill="url(#paidGrad)" />
              <path
                d={createPath('paid')}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {activeSeries.pending && (
            <>
              <path d={createAreaPath('pending')} fill="url(#pendingGrad)" />
              <path
                d={createPath('pending')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Interactive Hover Vertical Line & Markers */}
          {chartData.map((pt, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onTouchStart={() => setHoveredIndex(i)}
              >
                {/* Invisible hover capture band */}
                <rect
                  x={x - innerWidth / (chartData.length * 2)}
                  y={padTop}
                  width={innerWidth / chartData.length}
                  height={innerHeight}
                  fill="transparent"
                />

                {isHovered && (
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + innerHeight}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point Dots */}
                {activeSeries.earnings && (
                  <circle
                    cx={x}
                    cy={getY(pt.earnings)}
                    r={isHovered ? 5 : 3.5}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
                {activeSeries.paid && (
                  <circle
                    cx={x}
                    cy={getY(pt.paid)}
                    r={isHovered ? 5 : 3.5}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
                {activeSeries.pending && pt.pending > 0 && (
                  <circle
                    cx={x}
                    cy={getY(pt.pending)}
                    r={isHovered ? 5 : 3}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div
            className="absolute z-10 pointer-events-none bg-slate-950/90 text-white p-3 rounded-xl shadow-xl text-xs backdrop-blur-md border border-slate-800 transition-all duration-150"
            style={{
              left: `${Math.min(
                80,
                Math.max(15, (getX(hoveredIndex) / svgWidth) * 100)
              )}%`,
              top: '15px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-bold text-slate-200 border-b border-slate-700/60 pb-1.5 mb-1.5 flex items-center justify-between gap-4">
              <span>{chartData[hoveredIndex].label}</span>
              <span className="text-[10px] text-slate-300 font-medium">Verified activity</span>
            </p>
            <div className="space-y-1 font-mono">
              {activeSeries.earnings && (
                <div className="flex items-center justify-between gap-3 text-emerald-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Earnings:
                  </span>
                  <span className="font-bold">
                    ₹{chartData[hoveredIndex].earnings.toLocaleString()}
                  </span>
                </div>
              )}
              {activeSeries.paid && (
                <div className="flex items-center justify-between gap-3 text-blue-300">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Disbursed:
                  </span>
                  <span className="font-bold">
                    ₹{chartData[hoveredIndex].paid.toLocaleString()}
                  </span>
                </div>
              )}
              {activeSeries.pending && (
                <div className="flex items-center justify-between gap-3 text-amber-300">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Pending:
                  </span>
                  <span className="font-bold">
                    ₹{chartData[hoveredIndex].pending.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Empty State Banner if 0 records */}
      {!hasData && (
        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
          <p className="text-xs font-bold text-slate-700">No completed tuition transactions recorded in this period</p>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Amounts will dynamically plot as attendance logs are signed by guardians and monthly payroll runs execute.
          </p>
        </div>
      )}
    </div>
  );
};
