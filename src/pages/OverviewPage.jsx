import { useMemo } from 'react';
import { AirVent, MonitorCog, Thermometer, Waves } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function StatCard({ label, value, unit, accentClass, icon: Icon, subtext }) {
  return (
    <div className="min-h-[132px] flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container p-4 industrial-inset">
      <div className="flex items-start justify-between gap-4">
        <div className="font-display text-label-caps uppercase tracking-wider text-on-surface-variant">{label}</div>
        <Icon className={`h-5 w-5 ${accentClass}`} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className={`font-data text-data-lg ${accentClass}`}>
            {value}
            {unit}
          </div>
          {subtext ? <div className="mt-1 font-data text-data-sm text-on-surface-variant">{subtext}</div> : null}
        </div>
      </div>
    </div>
  );
}

function ArrowUpText() {
  return <span className="text-[14px] leading-none">↑</span>;
}

const relayModes = ['ON', 'AUTO', 'OFF'];

export default function OverviewPage({ telemetry, controls, onRelayModeChange, chartData = [] }) {
  const chartLabel = useMemo(() => `${telemetry.aqi_ppm} PPM`, [telemetry.aqi_ppm]);
  const overrideEnabled = Boolean(controls.masterOverride);
  const hasChartData = Array.isArray(chartData) && chartData.length > 0;

  return (
    <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-card_gap p-container_padding md:grid-cols-12">
      <section className="group relative col-span-1 overflow-hidden rounded-lg border border-outline-variant bg-surface p-4 industrial-inset md:col-span-6 lg:col-span-4">
        <div className="mb-6 flex items-start justify-between">
          <div className="font-display text-label-caps uppercase tracking-wider text-on-surface-variant">Air Quality (AQI)</div>
          <Waves className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="flex flex-col items-center justify-center pb-4">
          <div className="font-data text-data-lg text-emerald-500">{telemetry.aqi_ppm}</div>
          <div className="mt-1 font-data text-data-sm text-on-surface-variant">PPM CO2 eq</div>
        </div>
        <div className="mt-auto flex h-2 w-full gap-1">
          <div className="h-full flex-1 rounded-sm bg-emerald-500" />
          <div className="h-full flex-1 rounded-sm bg-emerald-500/20" />
          <div className="h-full flex-1 rounded-sm bg-amber-500/20" />
          <div className="h-full flex-1 rounded-sm bg-rose-500/20" />
        </div>
      </section>

      <section className="relative col-span-1 overflow-hidden rounded-lg border border-outline-variant bg-surface p-4 industrial-inset md:col-span-6 lg:col-span-4">
        <div className="mb-6 flex items-start justify-between">
          <div className="font-display text-label-caps uppercase tracking-wider text-on-surface-variant">Heat Index</div>
          <Thermometer className="h-5 w-5 text-rose-500" />
        </div>
        <div className="flex flex-col items-center justify-center pb-4">
          <div className="font-data text-data-lg text-rose-500">{telemetry.heat_index.toFixed(1)}°C</div>
          <div className="mt-1 flex items-center gap-1 font-data text-data-sm text-rose-400">
            <ArrowUpText />
            Critical Threshold &gt;33.0
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full animate-pulse bg-rose-500/50" />
      </section>

      <section className="col-span-1 grid grid-cols-2 gap-card_gap md:col-span-12 lg:col-span-4">
        <StatCard label="Raw Temp" value={telemetry.temperature.toFixed(1)} unit="°" accentClass="text-on-surface" icon={Thermometer} />
        <StatCard label="Humidity" value={telemetry.humidity.toFixed(1)} unit="%" accentClass="text-secondary" icon={Waves} />
      </section>

      <section className="col-span-1 rounded-lg border border-outline-variant bg-surface-container-high p-4 md:col-span-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-label-caps text-on-surface-variant">Exhaust Fan Status</div>
          <div className="rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 font-data text-data-sm text-on-surface-variant">
            {telemetry.fan_status ? 'ON' : 'OFF'}
          </div>
        </div>
        <div className="flex items-center gap-4 rounded border border-outline-variant bg-surface p-4 industrial-inset">
          <AirVent className="h-12 w-12 text-outline-variant" />
          <div className="font-data text-data-sm text-on-surface-variant">
            STAT: {String(telemetry.fan_status).toUpperCase()}<br />
            RPM:  0000<br />
            PWR:  0.0W
          </div>
        </div>
      </section>

      <section className="col-span-1 rounded-lg border border-outline-variant bg-surface-container-high p-4 md:col-span-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-label-caps text-on-surface-variant">Exhaust Fan Relay</div>
          <div className="rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 font-data text-data-sm text-on-surface-variant">
            {telemetry.fan_status ? 'ACTIVE' : 'IDLE'}
          </div>
        </div>
        <div className="rounded border border-outline-variant bg-surface p-4 industrial-inset">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-data text-data-sm text-outline">RELAY_MODE</div>
            <div className="font-data text-data-sm text-on-surface-variant">{controls.relayMode}</div>
          </div>
          <div className={`flex rounded-DEFAULT border border-outline-variant bg-surface-container p-1 ${overrideEnabled ? '' : 'pointer-events-none opacity-50'}`}>
            {relayModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onRelayModeChange(mode)}
                className={`flex-1 rounded-sm px-4 py-2 text-center font-mono text-data-sm transition-colors ${controls.relayMode === mode ? 'border border-outline-variant/50 bg-surface-variant text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="mt-3 font-data text-data-sm text-on-surface-variant">
            {overrideEnabled ? 'Manual override unlocked. Relay can be switched from the overview.' : 'Unlock manual override in Controls to change the relay.'}
          </p>
        </div>
      </section>

      <section className="col-span-1 flex h-64 flex-col rounded-lg border border-outline-variant bg-surface p-4 industrial-inset md:col-span-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-label-caps text-on-surface-variant">AQI Trend (24H)</div>
          <MonitorCog className="h-5 w-5 text-outline" />
        </div>
        <div className="relative flex-1 overflow-hidden rounded border border-dashed border-outline-variant/30 bg-surface-container/50">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute inset-0 p-4">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: '#c6c6cd', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.15)' }} tickLine={false} />
                  <YAxis tick={{ fill: '#c6c6cd', fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    contentStyle={{ background: '#122131', border: '1px solid #45464d', color: '#d4e4fa' }}
                    labelStyle={{ color: '#bec6e0' }}
                  />
                  <Line type="monotone" dataKey="aqi" stroke="#bec6e0" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded border border-dashed border-outline-variant/30 bg-surface-container/50 font-data text-data-sm text-on-surface-variant">
                No live trend data yet.
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded bg-surface-container-high/80 px-4 py-2 font-data text-data-sm text-outline-variant backdrop-blur-sm">
              {chartLabel} CURRENT READING
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}