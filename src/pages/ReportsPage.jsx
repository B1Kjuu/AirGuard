import { CalendarDays, ChevronDown, Download } from 'lucide-react';

const defaultReportOptions = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

function createChartPath(points, key, width, height, padding) {
  if (!points.length) {
    return '';
  }

  const values = points.map((point) => Number(point[key] ?? 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = width / Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const value = Number(point[key] ?? 0);
      const x = index * step;
      const normalized = (value - min) / span;
      const y = height - padding - normalized * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function SummaryCard({ title, value, unit, accentClass = 'text-primary', hoverClass = '', sparkClass = 'stroke-emerald-500', path = '' }) {
  return (
    <div className={`group relative flex h-32 flex-col justify-between overflow-hidden rounded-sm border border-outline-variant bg-surface-container p-6 shadow-inner transition-colors ${hoverClass}`}>
      <h3 className="relative z-10 font-label-caps text-label-caps uppercase text-on-surface-variant">{title}</h3>
      <div className={`relative z-10 flex items-baseline gap-2 pb-1 font-data text-data-lg ${accentClass}`}>
        <span>{value}</span>
        {unit ? <span className="font-data text-data-sm font-normal text-on-surface-variant">{unit}</span> : null}
      </div>
      {path ? (
        <div className="absolute bottom-0 left-0 h-8 w-full opacity-30">
          <svg className={`h-full w-full fill-transparent stroke-[1.5] ${sparkClass}`} preserveAspectRatio="none" viewBox="0 0 100 20">
            <path d={path} />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

function Legend({ label, tintClass }) {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant">
      <div className={`h-3 w-3 rounded-sm border ${tintClass}`} />
      {label}
    </div>
  );
}

export default function ReportsPage({
  range = 'Last 7 Days',
  options = defaultReportOptions,
  dropdownOpen,
  onToggleDropdown,
  onSelectRange,
  onExportCsv,
  summaryCards = [],
  weeklyDays = [],
  chartData = [],
}) {
  const width = 1000;
  const height = 300;
  const padding = 20;
  const hasSummaryCards = summaryCards.length > 0;
  const hasChartData = chartData.length > 0;
  const aqiPath = hasChartData ? createChartPath(chartData, 'aqi', width, height, padding) : '';
  const tempPath = hasChartData ? createChartPath(chartData, 'temperature', width, height, padding) : '';
  const aqiFillPath = `${aqiPath} L1000,300 L0,300 Z`;
  const tempFillPath = `${tempPath} L1000,300 L0,300 Z`;
  const markerIndexes = hasChartData ? [0, Math.floor((chartData.length - 1) / 2), chartData.length - 1].filter((value, index, array) => array.indexOf(value) === index) : [];

  return (
    <div className="mx-auto w-full max-w-[1920px] overflow-x-hidden bg-surface-lowest p-container_padding md:pt-container_padding">
      <div className="relative flex flex-1 flex-col gap-6">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-sm border border-outline-variant bg-surface-container p-4 shadow-inner sm:flex-row sm:items-center">
          <h1 className="font-display text-headline-md text-primary">System Reports</h1>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={onToggleDropdown} className="flex cursor-pointer items-center rounded-sm border border-outline-variant bg-background px-3 py-2 font-data text-data-sm text-on-surface transition-colors hover:border-primary">
              <CalendarDays className="mr-2 h-4 w-4 text-on-surface-variant" />
              {range}
              <ChevronDown className="ml-2 h-4 w-4 text-on-surface-variant" />
            </button>
            <button type="button" onClick={onExportCsv} className="flex items-center gap-2 rounded-sm border border-outline-variant bg-surface-variant px-4 py-2 font-label-caps text-label-caps text-on-surface transition-colors hover:bg-surface-bright">
              <Download className="h-4 w-4" />
              Export to CSV
            </button>
          </div>
        </div>

        {dropdownOpen ? (
          <div className="absolute right-0 top-16 z-20 w-48 overflow-hidden rounded-sm border border-outline-variant bg-surface-container shadow-lg">
            {options.length ? options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelectRange(option)}
                className="flex w-full items-center justify-start px-4 py-3 font-data text-data-sm text-on-surface transition-colors hover:bg-surface-container-high"
              >
                {option}
              </button>
            )) : (
              <div className="px-4 py-3 font-data text-data-sm text-on-surface-variant">No ranges available.</div>
            )}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-card_gap md:grid-cols-3">
          {hasSummaryCards ? summaryCards.map((card) => <SummaryCard key={card.title} {...card} />) : (
            <div className="md:col-span-3 rounded-sm border border-outline-variant bg-surface-container p-6 font-data text-data-sm text-on-surface-variant">
              No live report summary data available.
            </div>
          )}
        </div>

        <div className="flex h-[460px] flex-col overflow-hidden rounded-sm border border-outline-variant bg-surface-container shadow-inner">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-4">
            <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">AQI Trends vs Temperature</h2>
            <div className="flex gap-4 font-data text-data-sm text-on-surface-variant">
              <Legend label="AQI (PPM)" tintClass="bg-emerald-500/20 border-emerald-500" />
              <Legend label="Temp (°C)" tintClass="bg-rose-500/20 border-rose-500" />
            </div>
          </div>

          <div className="relative h-full p-6">
            <div className="absolute inset-x-6 top-6 bottom-10 z-0 flex flex-col justify-between">
              {['1000', '750', '500', '250', '0'].map((tick) => (
                <div key={tick} className="relative w-full border-t border-surface-variant">
                  <span className="absolute -left-6 -top-2 font-data text-[10px] text-outline">{tick}</span>
                </div>
              ))}
            </div>

            <div className="absolute inset-x-6 bottom-4 z-10 flex justify-between font-data text-[10px] text-outline">
              {weeklyDays.length ? weeklyDays.map((day) => <span key={day}>{day}</span>) : <span>No live chart data available.</span>}
            </div>

            {hasChartData ? (
              <svg className="absolute left-0 top-6 z-10 h-[calc(100%-2rem)] w-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                <defs>
                  <linearGradient id="aqi-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="temp-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {aqiPath ? <path d={aqiFillPath} fill="url(#aqi-grad)" /> : null}
                {aqiPath ? <path d={aqiPath} fill="none" stroke="#10b981" strokeLinejoin="round" strokeWidth="2" /> : null}

                {tempPath ? <path d={tempFillPath} fill="url(#temp-grad)" /> : null}
                {tempPath ? <path d={tempPath} fill="none" stroke="#f43f5e" strokeDasharray="4 4" strokeLinejoin="round" strokeWidth="2" /> : null}

                {markerIndexes.map((index) => {
                  const point = chartData[index];
                  const step = width / Math.max(chartData.length - 1, 1);
                  const x = index * step;
                  const aqiValues = chartData.map((entry) => Number(entry.aqi ?? 0));
                  const max = Math.max(...aqiValues, 1);
                  const min = Math.min(...aqiValues, 0);
                  const span = max - min || 1;
                  const normalized = (Number(point.aqi ?? 0) - min) / span;
                  const y = height - padding - normalized * (height - padding * 2);

                  return <circle key={`${point.time}-${index}`} cx={x} cy={y} r="4" fill="#051424" stroke="#10b981" strokeWidth="2" />;
                })}
              </svg>
            ) : (
              <div className="absolute inset-6 flex items-center justify-center rounded border border-dashed border-outline-variant/30 bg-surface-container/30 font-data text-data-sm text-on-surface-variant">
                No live chart data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
