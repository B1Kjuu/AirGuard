import { CircleHelp, Headphones, Mail, PhoneCall } from 'lucide-react';

function SupportCard({ icon: Icon, title, description, action }) {
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
      <p className="mt-4 font-data text-data-sm text-on-surface-variant">{action}</p>
    </article>
  );
}

export default function SupportPage() {
  return (
    <div className="bg-surface-dim min-h-[calc(100vh-4rem)] px-container_padding pb-10 text-on-surface md:py-0">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-lg border border-outline-variant bg-surface p-6 industrial-inset">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-primary">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-headline-md text-on-surface">Support Center</div>
              <p className="mt-2 max-w-3xl font-data text-data-sm leading-6 text-on-surface-variant">
                Use this page when the dashboard needs a human. It groups the quickest ways to reach the system owner,
                request help, or capture a support ticket.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <SupportCard
            icon={PhoneCall}
            title="Emergency Contact"
            description="Call the on-site maintenance number"
            action="Primary line: +1 (555) 019-2048"
          />
          <SupportCard
            icon={Mail}
            title="Ticketing"
            description="Send logs or screenshots to the support inbox"
            action="Email: support@airguard.local"
          />
          <SupportCard
            icon={CircleHelp}
            title="Remote Help"
            description="Request a guided session with the operations team"
            action="Availability: Mon-Fri, 08:00-18:00"
          />
        </div>
      </div>
    </div>
  );
}
