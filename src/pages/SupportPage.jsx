import { CircleHelp, Headphones, Mail, PhoneCall } from 'lucide-react';

const supportIconMap = {
  PhoneCall,
  Mail,
  CircleHelp,
};

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

export default function SupportPage({ hero = { heroTitle: '', heroBody: '', cards: [] } }) {
  return (
    <div className="bg-surface-dim min-h-[calc(100vh-4rem)] px-container_padding pb-10 text-on-surface md:py-0">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-lg border border-outline-variant bg-surface p-6 industrial-inset">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-primary">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-headline-md text-on-surface">{hero.heroTitle || 'Support Center'}</div>
              {hero.heroBody ? <p className="mt-2 max-w-3xl font-data text-data-sm leading-6 text-on-surface-variant">{hero.heroBody}</p> : null}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {hero.cards.length ? (
            hero.cards.map((card) => {
              const Icon = supportIconMap[card.iconName] ?? CircleHelp;
              return <SupportCard key={card.title} icon={Icon} title={card.title} description={card.description} action={card.action} />;
            })
          ) : (
            <div className="lg:col-span-3 rounded-lg border border-outline-variant bg-surface-container p-6 font-data text-data-sm text-on-surface-variant">
              No live support data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
