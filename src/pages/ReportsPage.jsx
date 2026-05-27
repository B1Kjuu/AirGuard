import { CalendarDays, Download, ChevronDown } from 'lucide-react';

export default function ReportsPage() {
  const weeklyDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="mx-auto w-full max-w-[1920px] overflow-x-hidden bg-surface-lowest p-container_padding md:pt-container_padding">
      <div className="flex flex-1 flex-col gap-6">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-sm border border-outline-variant bg-surface-container p-4 shadow-inner sm:flex-row sm:items-center">
          <h1 className="font-display text-headline-md text-primary">System Reports</h1>
          <div className="flex flex-wrap items-center gap-4">
            <button className="flex cursor-pointer items-center rounded-sm border border-outline-variant bg-background px-3 py-2 font-data text-data-sm text-on-surface transition-colors hover:border-primary">
              <CalendarDays className="mr-2 h-4 w-4 text-on-surface-variant" />
              Last 7 Days
              <ChevronDown className="ml-2 h-4 w-4 text-on-surface-variant" />
            </button>
            <button className="flex items-center gap-2 rounded-sm border border-outline-variant bg-surface-variant px-4 py-2 font-label-caps text-label-caps text-on-surface transition-colors hover:bg-surface-bright">
              <Download className="h-4 w-4" />
              Export to CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-card_gap md:grid-cols-3">
          <SummaryCard
            title="Avg Daily AQI"
            value="480"
            unit="PPM"
            accentClass="text-primary"
            hoverClass="hover:border-primary"
            sparkClass="stroke-emerald-500"
            path="M0,10 L10,12 L20,8 L30,15 L40,5 L50,10 L60,18 L70,8 L80,12 L90,5 L100,10"
          />
          <SummaryCard
            title="Highest Recorded Temp"
            value="35.1°C"
            accentClass="text-error"
            hoverClass="hover:border-error"
            sparkClass="stroke-rose-500"
            path="M0,15 L20,15 L40,12 L60,5 L80,8 L100,2"
          />
          <SummaryCard
            title="Total Exhaust Fan Runtime"
            value="14"
            unit="hrs 22 mins"
            accentClass="text-tertiary"
            hoverClass="hover:border-tertiary"
            sparkClass="stroke-amber-400"
            path="M0,10 L30,10 L30,2 L70,2 L70,15 L100,15"
          />
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
              {weeklyDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

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

              <path d="M0,250 C100,200 200,280 300,150 C400,20 500,100 600,50 C700,0 800,180 900,120 L1000,150 L1000,300 L0,300 Z" fill="url(#aqi-grad)" />
              <path d="M0,250 C100,200 200,280 300,150 C400,20 500,100 600,50 C700,0 800,180 900,120 L1000,150" fill="none" stroke="#10b981" strokeLinejoin="round" strokeWidth="2" />

              <path d="M0,280 C150,290 250,250 350,260 C450,270 550,180 650,200 C750,220 850,210 1000,240 L1000,300 L0,300 Z" fill="url(#temp-grad)" />
              <path d="M0,280 C150,290 250,250 350,260 C450,270 550,180 650,200 C750,220 850,210 1000,240" fill="none" stroke="#f43f5e" strokeDasharray="4 4" strokeLinejoin="round" strokeWidth="2" />

              <circle cx="300" cy="150" r="4" fill="#051424" stroke="#10b981" strokeWidth="2" />
              <circle cx="600" cy="50" r="4" fill="#051424" stroke="#10b981" strokeWidth="2" />
              <circle cx="900" cy="120" r="4" fill="#051424" stroke="#10b981" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, unit, accentClass, hoverClass, sparkClass, path }) {
  return (
    <div className={`group relative flex h-32 flex-col justify-between overflow-hidden rounded-sm border border-outline-variant bg-surface-container p-6 shadow-inner transition-colors ${hoverClass}`}>
      <div className={`absolute inset-0 ${accentClass.replace('text-', 'bg-')}/5 opacity-0 transition-opacity group-hover:opacity-100`} />
      <h3 className="relative z-10 font-label-caps text-label-caps uppercase text-on-surface-variant">{title}</h3>
      <div className={`relative z-10 flex items-baseline gap-2 pb-1 font-data text-data-lg ${accentClass}`}>
        <span>{value}</span>
        {unit ? <span className="font-data text-data-sm font-normal text-on-surface-variant">{unit}</span> : null}
      </div>
      <div className="absolute bottom-0 left-0 h-8 w-full opacity-30">
        <svg className={`h-full w-full fill-transparent stroke-[1.5] ${sparkClass}`} preserveAspectRatio="none" viewBox="0 0 100 20">
          <path d={path} />
        </svg>
      </div>
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