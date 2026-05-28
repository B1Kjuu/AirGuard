import { AlertTriangle, AirVent, LayoutDashboard, MonitorCog, Settings2, Thermometer, Waves, Zap } from 'lucide-react';

function SensorPanel({ title, subtitle, online, value, unit, details, buttonLabel, onButtonClick, children }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 p-container_padding inner-shadow-sm">
      <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-bl-full bg-blue-500/5 transition-transform duration-500 group-hover:scale-110" />
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 font-label-caps text-label-caps uppercase tracking-widest text-slate-400">{title}</h3>
          <p className="font-data text-data-sm text-slate-100">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-status-online/20 bg-status-online/10 px-2.5 py-1">
          <span className="h-2 w-2 rounded-full bg-status-online animate-pulse" />
          <span className="font-data text-[12px] text-data-sm text-status-online">{online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      {typeof value === 'number' ? (
        <div className="flex flex-grow flex-col justify-center py-4">
          <div className="flex items-baseline gap-2">
            <span className="font-data text-data-lg tracking-tighter text-slate-100">{value}</span>
            <span className="font-data text-data-sm text-slate-400">{unit}</span>
          </div>
          {children}
        </div>
      ) : (
        <div className="flex-grow">{children}</div>
      )}

      <div className="mt-6 border-t border-slate-700 pt-4">
        <div className="mb-4 flex flex-wrap gap-4">
          {details.map(([label, detailValue], index) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-label-caps text-[10px] text-slate-400">{label}</span>
                <span className="font-data text-data-sm text-slate-100">{detailValue}</span>
              </div>
              {index !== details.length - 1 ? <div className="h-8 w-px bg-slate-700" /> : null}
            </div>
          ))}
        </div>
        {buttonLabel ? (
          <button
            type="button"
            onClick={onButtonClick}
            className="flex w-full items-center justify-center gap-2 rounded border border-slate-600 bg-slate-700/50 py-2 font-label-caps text-label-caps uppercase text-slate-100 transition-colors active:scale-95 hover:border-blue-400/50 hover:bg-slate-700"
          >
            <Settings2 className="h-4 w-4" />
            {buttonLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SensorActionCard({ onButtonClick, title, subtitle, online, value, unit, details, buttonLabel, children }) {
  return (
    <SensorPanel
      title={title}
      subtitle={subtitle}
      online={online}
      value={value}
      unit={unit}
      details={details}
      buttonLabel={buttonLabel}
      onButtonClick={onButtonClick}
    >
      {children}
    </SensorPanel>
  );
}

export default function SensorsPage({ telemetry, onGoOverview, onCalibrate, onRefreshData, onRunDiagnosticTest, statusMessage }) {
  return (
    <div className="mx-auto max-w-6xl px-container_padding pb-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 border-b border-outline-variant pb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">Sensor Diagnostics</h2>
            <p className="mt-1 font-display text-[16px] leading-6 text-on-surface-variant">Real-time telemetry and hardware status.</p>
          </div>
          <button
            type="button"
            onClick={onGoOverview}
            className="inline-flex items-center justify-center gap-2 rounded-DEFAULT border border-outline-variant px-4 py-2 font-display text-label-caps text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Overview
          </button>
        </div>

        <div className="industrial-inset flex flex-col items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-high p-4 md:flex-row">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <MonitorCog className="h-5 w-5 text-blue-400" />
              <span className="font-data text-data-sm text-on-surface">System Diagnostics: 2 Active Sensors</span>
            </div>
            <div className="hidden h-4 w-px bg-outline-variant md:block" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-online" />
              <span className="font-data text-data-sm text-on-surface">0 Warnings</span>
            </div>
            <div className="hidden h-4 w-px bg-outline-variant md:block" />
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-status-online" />
              <span className="font-data text-data-sm text-status-online">Network: STABLE</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRunDiagnosticTest}
            className="inline-flex w-full items-center justify-center gap-2 rounded border border-outline-variant px-4 py-2 font-display text-label-caps text-on-surface transition-colors hover:bg-surface-container-high active:scale-95 md:w-auto"
          >
            <AirVent className="h-4 w-4" />
            Run Diagnostic Test
          </button>
        </div>

        {statusMessage ? (
          <div className="rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 font-data text-data-sm text-status-success">
            {statusMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-card_gap lg:grid-cols-2">
          <SensorActionCard
            title="MQ-135 Gas & VOC Sensor"
            subtitle="Air Quality Monitor"
            online
            value={telemetry.aqi_ppm}
            unit="PPM"
            details={[
              ['Voltage', '5.0V'],
              ['Pin', 'A0'],
              ['Last Calibrated', '2 days ago'],
            ]}
            buttonLabel="Calibrate Sensor"
            onButtonClick={onCalibrate}
          >
            <div className="mt-4 flex h-12 w-full items-end gap-1 opacity-80">
              <div className="flex h-1 w-full items-end rounded bg-slate-700">
                <div className="h-full w-1/3 rounded-l bg-status-online/40" />
                <div className="h-full w-1/3 bg-status-online/70" />
                <div className="h-full w-1/3 rounded-r bg-status-online" />
              </div>
            </div>
          </SensorActionCard>

          <SensorActionCard
            title="DHT22 Module"
            subtitle="Temp & Humidity"
            online
            value={null}
            unit=""
            details={[
              ['Voltage', '3.3V'],
              ['Pin', 'D4'],
              ['Accuracy', '±0.5°C'],
            ]}
            buttonLabel="Refresh Data"
            onButtonClick={onRefreshData}
          >
            <div className="flex flex-grow gap-8 py-4">
              <div className="flex flex-col justify-center">
                <span className="font-label-caps mb-1 flex items-center gap-1 text-label-caps text-slate-400">
                  <Thermometer className="h-3.5 w-3.5" /> Temperature
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-data text-data-lg tracking-tighter text-slate-100">{telemetry.temperature.toFixed(1)}</span>
                  <span className="font-data text-data-sm text-slate-400">°C</span>
                </div>
              </div>
              <div className="w-px bg-slate-700" />
              <div className="flex flex-col justify-center">
                <span className="font-label-caps mb-1 flex items-center gap-1 text-label-caps text-slate-400">
                  <Waves className="h-3.5 w-3.5" /> Humidity
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-data text-data-lg tracking-tighter text-slate-100">{telemetry.humidity.toFixed(1)}</span>
                  <span className="font-data text-data-sm text-slate-400">%</span>
                </div>
              </div>
            </div>
          </SensorActionCard>
        </div>
      </div>
    </div>
  );
}