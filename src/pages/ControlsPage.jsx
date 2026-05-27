import { useState } from 'react';
import { AlertTriangle, Save, Settings2 } from 'lucide-react';

const relayModes = ['ON', 'AUTO', 'OFF'];

function RangeRow({ label, value, unit, minLabel, maxLabel, onChange, step = 1, min, max }) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-4">
        <label className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">{label}</label>
        <div className="flex items-baseline gap-1">
          <span className="font-data text-data-lg text-primary">{value}</span>
          <span className="font-data text-data-sm text-on-surface-variant">{unit}</span>
        </div>
      </div>
      <input
        className="controls-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="mt-1 flex justify-between">
        <span className="font-data text-data-sm text-on-surface-variant/50">{minLabel}</span>
        <span className="font-data text-data-sm text-on-surface-variant/50">{maxLabel}</span>
      </div>
    </div>
  );
}

function ControlsPage() {
  const [aqiTrigger, setAqiTrigger] = useState(1000);
  const [heatTrigger, setHeatTrigger] = useState(33.0);
  const [masterOverride, setMasterOverride] = useState(false);
  const [relayMode, setRelayMode] = useState('AUTO');

  return (
    <div className="bg-surface-dim min-h-[calc(100vh-4rem)] px-container_padding pb-10 text-on-surface md:py-0">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <div className="mb-2">
          <h2 className="font-display text-headline-md mb-2 text-on-surface">System Controls</h2>
          <p className="font-display text-[16px] leading-6 text-on-surface-variant">Manage automated setpoints and master hardware overrides.</p>
        </div>

        <div className="grid grid-cols-1 gap-card_gap lg:grid-cols-2">
          <section className="group relative overflow-hidden rounded-lg border border-outline-variant bg-surface p-6 industrial-inset">
            <div className="absolute left-0 top-0 h-full w-1 bg-primary/50 transition-colors group-hover:bg-primary" />
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-label-caps flex items-center gap-2 text-label-caps text-on-surface">
                <Settings2 className="h-4 w-4" />
                Automated Setpoints
              </h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

            <div className="space-y-8">
              <RangeRow
                label="AQI Trigger Limit"
                value={aqiTrigger}
                unit=""
                minLabel="400"
                maxLabel="2000"
                min={400}
                max={2000}
                step={1}
                onChange={(nextValue) => setAqiTrigger(Number(nextValue))}
              />

              <RangeRow
                label="Heat Index Trigger Limit"
                value={heatTrigger.toFixed(1)}
                unit="°C"
                minLabel="25.0°C"
                maxLabel="50.0°C"
                min={25}
                max={50}
                step={0.1}
                onChange={(nextValue) => setHeatTrigger(Number(nextValue))}
              />
            </div>

            <div className="mt-8 flex justify-end border-t border-outline-variant pt-6">
              <button className="inline-flex items-center gap-2 rounded-DEFAULT border border-outline-variant bg-surface-container-high px-6 py-2 font-display text-label-caps text-on-surface transition-all hover:border-primary hover:bg-surface-bright">
                <Save className="h-4 w-4" />
                Save Configuration
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface p-6 industrial-inset">
            <div className="mb-6 flex items-center justify-between border-b border-outline-variant pb-6">
              <div>
                <h3 className="font-label-caps mb-1 flex items-center gap-2 text-label-caps text-error">
                  <AlertTriangle className="h-4.5 w-4.5" />
                  Manual Override
                </h3>
                <p className="font-data text-data-sm text-on-surface-variant">SYS_OVR_REQ</p>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={masterOverride}
                  onChange={(event) => setMasterOverride(event.target.checked)}
                />
                <div className="peer h-6 w-11 rounded-full bg-surface-variant after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline-variant after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-error peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>

            <div className={`space-y-6 transition-opacity duration-300 ${masterOverride ? '' : 'pointer-events-none opacity-50'}`}>
              <div>
                <label className="font-label-caps mb-3 block text-label-caps uppercase tracking-wider text-on-surface-variant">Exhaust Fan Relay</label>
                <div className="flex rounded-DEFAULT border border-outline-variant bg-surface-container p-1">
                  {relayModes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRelayMode(mode)}
                      className={`flex-1 rounded-sm px-4 py-2 text-center font-mono text-data-sm transition-colors ${relayMode === mode ? 'border border-outline-variant/50 bg-surface-variant text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-label-caps mb-3 block text-label-caps uppercase tracking-wider text-on-surface-variant">LED Status Indicator Test</label>
                <div className="flex gap-4">
                  <button className="flex h-12 w-12 items-center justify-center rounded-DEFAULT border-2 border-rose-500 bg-rose-500/20 transition-colors hover:bg-rose-500/40">
                    <span className="font-data text-data-sm text-rose-500">R</span>
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-DEFAULT border-2 border-emerald-500 bg-emerald-500/20 transition-colors hover:bg-emerald-500/40">
                    <span className="font-data text-data-sm text-emerald-500">G</span>
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-DEFAULT border-2 border-blue-500 bg-blue-500/20 transition-colors hover:bg-blue-500/40">
                    <span className="font-data text-data-sm text-blue-500">B</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ControlsPage;