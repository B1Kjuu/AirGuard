import { BookOpen, ClipboardList, FileText, TerminalSquare } from 'lucide-react';

function DocCard({ icon: Icon, title, description, bulletPoints }) {
  return (
    <article className="rounded-lg border border-outline-variant bg-surface-container p-5 industrial-inset">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-high text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-title-lg text-on-surface">{title}</h3>
          <p className="font-data text-data-sm text-on-surface-variant">{description}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 font-data text-data-sm text-on-surface-variant">
        {bulletPoints.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function DocumentationPage() {
  return (
    <div className="bg-surface-dim min-h-[calc(100vh-4rem)] px-container_padding pb-10 text-on-surface md:py-0">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-lg border border-outline-variant bg-surface p-6 industrial-inset">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-headline-md text-on-surface">Documentation</div>
              <p className="mt-2 max-w-3xl font-data text-data-sm leading-6 text-on-surface-variant">
                Quick references for the dashboard workflow, control behavior, and maintenance routines.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <DocCard
            icon={TerminalSquare}
            title="Quick Start"
            description="Bring the dashboard online"
            bulletPoints={['Open Overview to verify telemetry', 'Check Controls before changing relays', 'Use Sensors for calibration']} 
          />
          <DocCard
            icon={ClipboardList}
            title="Operational Notes"
            description="How the shared controls state behaves"
            bulletPoints={['Manual override is shared across pages', 'Save Configuration persists current settings', 'Emergency Stop opens a confirmation modal']}
          />
          <DocCard
            icon={FileText}
            title="Maintenance"
            description="Logs and exports"
            bulletPoints={['Clear Log removes the current event list', 'Export Error Dump downloads a text snapshot', 'Reports export the current range as CSV']}
          />
        </div>
      </div>
    </div>
  );
}
