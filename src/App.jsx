import { useState } from 'react';
import {
  AlertTriangle,
  BookText,
  CircleHelp,
  Bell,
  LayoutDashboard,
  Menu,
  MonitorCog,
  Router,
  Settings2,
  ShieldAlert,
  Zap,
  Wrench,
} from 'lucide-react';
import OverviewPage from './pages/OverviewPage';
import SensorsPage from './pages/SensorsPage';
import ControlsPage from './pages/ControlsPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';

const initialTelemetry = {
  temperature: 31.4,
  humidity: 54.3,
  heat_index: 34.2,
  aqi_ppm: 450,
  fan_status: false,
  manual_override: false,
};

function NavItem({ icon: Icon, label, active = false, compact = false, onClick }) {
  const activeClass = active
    ? 'bg-primary-container/10 text-primary font-bold border-l-4 border-primary opacity-90 pl-3'
    : 'text-on-surface-variant hover:bg-surface-container-high';
  const paddingClass = compact ? 'py-2' : 'py-3';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-DEFAULT px-4 text-left ${paddingClass} font-display text-label-caps transition-colors ${activeClass}`}
    >
      <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      {label}
    </button>
  );
}

function App() {
  const [telemetry] = useState(initialTelemetry);
  const [currentPage, setCurrentPage] = useState('controls');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sensors', label: 'Sensors', icon: MonitorCog },
    { id: 'controls', label: 'Controls', icon: Settings2 },
    { id: 'maintenance', label: 'Maintenance', icon: ShieldAlert },
    { id: 'reports', label: 'Reports', icon: Zap },
  ];

  const pageTitle = {
    overview: 'Mission Control',
    sensors: 'Sensor Diagnostics',
    controls: 'System Controls',
    maintenance: 'Maintenance',
    reports: 'Reports',
  }[currentPage];

  const renderPage = () => {
    if (currentPage === 'overview') {
      return <OverviewPage telemetry={telemetry} />;
    }

    if (currentPage === 'sensors') {
      return <SensorsPage telemetry={telemetry} onGoOverview={() => setCurrentPage('overview')} />;
    }

    if (currentPage === 'controls') {
      return <ControlsPage />;
    }

    if (currentPage === 'maintenance') {
      return <MaintenancePage />;
    }

    if (currentPage === 'reports') {
      return <ReportsPage />;
    }

    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center px-container_padding py-16">
        <div className="w-full rounded-lg border border-outline-variant bg-surface-container-high p-8 text-center industrial-inset">
          <div className="font-display text-label-caps uppercase tracking-wider text-on-surface-variant">{pageTitle}</div>
          <h2 className="mt-3 font-display text-headline-md text-on-surface">Coming Soon</h2>
          <p className="mt-2 font-display text-[16px] leading-6 text-on-surface-variant">
            This section is reserved for future AIRGUARD+ modules.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="hidden h-full flex-col border-r border-outline-variant bg-surface-container py-6 md:fixed md:left-0 md:top-0 md:z-40 md:flex md:w-64">
          <div className="mb-8 flex items-center gap-4 px-container_padding">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high">
              <Router className="h-5 w-5 text-primary" />
              <div className="status-pip-online absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="font-display text-headline-md text-on-surface">AIRGUARD+</div>
              <div className="font-display text-label-caps flex items-center gap-1 text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Online
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-container_padding">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                active={currentPage === item.id}
                icon={item.icon}
                label={item.label}
                onClick={() => setCurrentPage(item.id)}
              />
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2 px-container_padding">
            <button className="flex w-full items-center justify-center gap-2 rounded-DEFAULT border border-error bg-surface-container-high py-3 font-display text-label-caps text-error transition-colors hover:bg-error-container hover:text-on-error-container">
              <AlertTriangle className="h-4 w-4" />
              Emergency Stop
            </button>
            <div className="my-4 h-px bg-outline-variant" />
            <NavItem compact icon={CircleHelp} label="Support" onClick={() => setCurrentPage('overview')} />
            <NavItem compact icon={BookText} label="Documentation" onClick={() => setCurrentPage('overview')} />
          </div>
        </aside>

        <main className="flex-1 bg-surface-lowest md:ml-64">
          <header className="mb-4 flex items-center justify-between border-b border-outline-variant bg-surface-container-high p-4 md:hidden">
            <div>
              <div className="font-display text-headline-md tracking-tighter text-on-surface">AIRGUARD+</div>
              <div className="font-display text-label-caps text-on-surface-variant">{pageTitle}</div>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Bell className="h-5 w-5" />
              <Settings2 className="h-5 w-5" />
            </div>
          </header>

          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;