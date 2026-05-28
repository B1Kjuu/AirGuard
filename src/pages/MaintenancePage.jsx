import {
  Clock3,
  Download,
  RefreshCw,
  Trash2,
} from 'lucide-react';

export default function MaintenancePage({ rows, onClearLogs, onExportDump, onRebootMicrocontroller }) {
  const eventRows = rows;

  return (
    <div className="mx-auto w-full max-w-[1920px] bg-surface-lowest p-container_padding md:pt-container_padding">
      <header className="mb-8">
        <h2 className="font-display text-headline-md text-on-surface">System Maintenance &amp; Logs</h2>
        <p className="mt-1 font-data text-data-sm text-on-surface-variant">Diagnostic overview and recent event history.</p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-card_gap md:grid-cols-3">
        <div className="data-card flex flex-col justify-between rounded-lg p-6">
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Firmware Version</span>
          <div className="mt-4">
            <span className="font-data text-data-lg block text-primary">v1.2.4</span>
            <span className="mt-1 block font-data text-data-sm text-on-surface-variant">NodeMCU ESP8266</span>
          </div>
        </div>

        <div className="data-card flex flex-col justify-between rounded-lg p-6">
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">System Uptime</span>
          <div className="mt-4">
            <span className="font-data text-data-lg block text-primary">14 Days</span>
            <span className="mt-1 block font-data text-data-sm text-on-surface-variant">6 Hours</span>
          </div>
        </div>

        <div className="data-card flex flex-col justify-between rounded-lg p-6">
          <div className="flex w-full items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Exhaust Filter</span>
            <span className="font-data text-data-sm text-status-success">85% Remaining</span>
          </div>
          <div className="mt-6 flex h-4 w-full gap-[1px] overflow-hidden rounded-sm bg-surface-container-highest p-[2px]">
            {Array.from({ length: 40 }).map((_, index) => (
              <div
                key={`segment-${index}`}
                className={`h-full flex-1 rounded-[1px] ${index < 34 ? 'bg-status-success' : 'bg-surface-container-highest'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-card_gap lg:grid-cols-4">
        <div className="data-card flex flex-col overflow-hidden rounded-lg lg:col-span-3">
          <div className="flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-high p-6">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface">Event History</h3>
            <Clock3 className="h-4 w-4 text-on-surface-variant" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                  <th className="p-4 pl-6 font-normal">Timestamp</th>
                  <th className="p-4 font-normal">Event Type</th>
                  <th className="p-4 font-normal">Description</th>
                  <th className="p-4 pr-6 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-data text-data-sm text-on-surface">
                {eventRows.map((row) => (
                  <tr key={`${row.time}-${row.type}`} className="group transition-colors hover:bg-surface-container-high">
                    <td className="p-4 pl-6 text-on-surface-variant group-hover:text-on-surface">{row.time}</td>
                    <td className="p-4 font-bold text-on-surface-variant">{row.type}</td>
                    <td className="p-4">{row.description}</td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-flex items-center gap-2 rounded px-2.5 py-1 font-label-caps text-[10px] uppercase ${row.statusClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${row.dotClass}`} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border-none p-6 text-center text-on-surface-variant/40" colSpan={4}>
                    ... end of recent logs ...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="data-card rounded-lg p-6">
            <h3 className="mb-6 font-label-caps text-label-caps uppercase tracking-widest text-on-surface">System Actions</h3>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={onClearLogs} className="flex w-full items-center justify-center gap-2 rounded bg-surface-container-high px-4 py-3 font-label-caps text-label-caps uppercase text-on-surface transition-colors hover:bg-surface-bright">
                <Trash2 className="h-4 w-4 text-on-surface-variant" />
                Clear Log
              </button>
              <button type="button" onClick={onExportDump} className="flex w-full items-center justify-center gap-2 rounded bg-surface-container-high px-4 py-3 font-label-caps text-label-caps uppercase text-on-surface transition-colors hover:bg-surface-bright">
                <Download className="h-4 w-4 text-on-surface-variant" />
                Export Error Dump
              </button>
              <hr className="my-3 border-outline-variant/30" />
              <button type="button" onClick={onRebootMicrocontroller} className="group flex w-full items-center justify-center gap-2 rounded border border-status-critical/30 bg-surface-container-lowest px-4 py-3 font-label-caps text-label-caps uppercase text-status-critical transition-colors hover:bg-status-critical/10">
                <RefreshCw className="h-4 w-4 group-hover:animate-spin" />
                Reboot Microcontroller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}