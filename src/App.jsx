import { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import OverviewPage from './pages/OverviewPage';
import SensorsPage from './pages/SensorsPage';
import ControlsPage from './pages/ControlsPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';
import SupportPage from './pages/SupportPage';
import DocumentationPage from './pages/DocumentationPage';

const storageKeys = {
  controls: 'airguard-plus-controls',
};

const initialTelemetry = {
  temperature: 31.4,
  humidity: 54.3,
  heat_index: 34.2,
  aqi_ppm: 450,
};

const initialControls = {
  aqiTrigger: 1000,
  heatTrigger: 33,
  relayMode: 'AUTO',
  masterOverride: false,
};

const initialMaintenanceRows = [
  {
    time: '10 mins ago',
    type: 'TRIGGER',
    description: 'Heat Index Exceeded (34.2°C)',
    status: 'CRITICAL',
    statusClass: 'bg-error/10 text-status-critical border border-status-critical/30',
    dotClass: 'bg-status-critical',
  },
  {
    time: '12 mins ago',
    type: 'ACTION',
    description: 'Relay D5 Closed (Fan ON)',
    status: 'SUCCESS',
    statusClass: 'bg-status-success/10 text-status-success border border-status-success/30',
    dotClass: 'bg-status-success',
  },
  {
    time: '2 hours ago',
    type: 'NETWORK',
    description: 'Firebase Reconnection',
    status: 'INFO',
    statusClass: 'bg-status-info/10 text-status-info border border-status-info/30',
    dotClass: 'bg-status-info',
  },
];

const reportOptions = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

function loadStoredControls() {
  if (typeof window === 'undefined') {
    return initialControls;
  }

  try {
    const stored = window.localStorage.getItem(storageKeys.controls);
    return stored ? { ...initialControls, ...JSON.parse(stored) } : initialControls;
  } catch {
    return initialControls;
  }
}

function downloadTextFile(filename, contents, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatBoolean(value) {
  return value ? 'TRUE' : 'FALSE';
}

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
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [controls, setControls] = useState(loadStoredControls);
  const [currentPage, setCurrentPage] = useState('controls');
  const [maintenanceRows, setMaintenanceRows] = useState(initialMaintenanceRows);
  const [reportsRange, setReportsRange] = useState('Last 7 Days');
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    window.localStorage.setItem(storageKeys.controls, JSON.stringify(controls));
  }, [controls]);

  useEffect(() => {
    if (!saveStatus) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSaveStatus(''), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [saveStatus]);

  const fanStatus = useMemo(() => {
    if (controls.masterOverride) {
      if (controls.relayMode === 'ON') return true;
      if (controls.relayMode === 'OFF') return false;
    }

    return telemetry.aqi_ppm > controls.aqiTrigger || telemetry.heat_index > controls.heatTrigger;
  }, [controls.heatTrigger, controls.masterOverride, controls.relayMode, controls.aqiTrigger, telemetry.aqi_ppm, telemetry.heat_index]);

  const overviewTelemetry = useMemo(
    () => ({
      ...telemetry,
      fan_status: fanStatus,
      manual_override: controls.masterOverride,
    }),
    [fanStatus, controls.masterOverride, telemetry],
  );

  const openConfirmModal = (type) => {
    if (type === 'emergency-stop') {
      setModal({
        type,
        title: 'Emergency Stop',
        message: 'This will force the fan OFF and clear manual override. Continue?',
        confirmLabel: 'Stop System',
      });
      return;
    }

    if (type === 'reboot') {
      setModal({
        type,
        title: 'Reboot Microcontroller',
        message: 'This will reset the live dashboard state back to defaults. Continue?',
        confirmLabel: 'Reboot Now',
      });
    }
  };

  const closeModal = () => setModal(null);

  const handleModalConfirm = () => {
    if (!modal) {
      return;
    }

    if (modal.type === 'emergency-stop') {
      setControls((current) => ({ ...current, masterOverride: false, relayMode: 'OFF' }));
      setSaveStatus('Emergency stop executed');
    }

    if (modal.type === 'reboot') {
      setTelemetry(initialTelemetry);
      setControls(initialControls);
      setMaintenanceRows(initialMaintenanceRows);
      setReportsRange('Last 7 Days');
      setSaveStatus('Microcontroller rebooted');
    }

    closeModal();
  };

  const handleSaveControls = () => {
    setSaveStatus('Configuration saved');
  };

  const updateTelemetry = (patch) => {
    setTelemetry((current) => ({ ...current, ...patch }));
  };

  const handleSensorCalibration = () => {
    const nextAqi = Math.max(180, Math.round(telemetry.aqi_ppm - 18));
    updateTelemetry({
      aqi_ppm: nextAqi,
      heat_index: Number((telemetry.heat_index - 0.2).toFixed(1)),
    });
  };

  const handleSensorRefresh = () => {
    const drift = (seed) => Number((seed + (Math.random() - 0.5) * 0.6).toFixed(1));
    updateTelemetry({
      temperature: drift(telemetry.temperature),
      humidity: drift(telemetry.humidity),
      heat_index: drift(telemetry.heat_index),
      aqi_ppm: Math.max(150, Math.round(telemetry.aqi_ppm + (Math.random() - 0.5) * 20)),
    });
  };

  const handleRunDiagnosticTest = () => {
    setMaintenanceRows((currentRows) => [
      {
        time: 'just now',
        type: 'DIAGNOSTIC',
        description: 'Sensor diagnostic test completed',
        status: 'SUCCESS',
        statusClass: 'bg-status-success/10 text-status-success border border-status-success/30',
        dotClass: 'bg-status-success',
      },
      ...currentRows,
    ]);
    setSaveStatus('Diagnostic test completed');
  };

  const handleExportCsv = () => {
    const rows = [
      ['Range', reportsRange],
      ['AQI', telemetry.aqi_ppm],
      ['Temperature', telemetry.temperature],
      ['Humidity', telemetry.humidity],
      ['Heat Index', telemetry.heat_index],
      ['Fan Status', formatBoolean(fanStatus)],
      ['Manual Override', formatBoolean(controls.masterOverride)],
    ];

    const csv = ['Metric,Value', ...rows.map(([metric, value]) => `${metric},${value}`)].join('\n');
    downloadTextFile('airguard-reports.csv', csv, 'text/csv;charset=utf-8');
    setSaveStatus('CSV exported');
  };

  const handleClearLogs = () => {
    setMaintenanceRows([]);
    setSaveStatus('Logs cleared');
  };

  const handleExportErrorDump = () => {
    const dump = [
      'AIRGUARD+ Error Dump',
      `Timestamp: ${new Date().toISOString()}`,
      `Telemetry: ${JSON.stringify(telemetry, null, 2)}`,
      `Controls: ${JSON.stringify(controls, null, 2)}`,
    ].join('\n\n');
    downloadTextFile('airguard-error-dump.txt', dump);
    setSaveStatus('Error dump exported');
  };

  const handleControlChange = (nextConfig) => {
    setControls((current) => ({ ...current, ...nextConfig }));
  };

  const handleRelayModeChange = (relayMode) => {
    setControls((current) => ({ ...current, relayMode }));
  };

  const handleReportsRangeChange = (nextRange) => {
    setReportsRange(nextRange);
    setReportsDropdownOpen(false);
  };

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
    support: 'Support',
    documentation: 'Documentation',
  }[currentPage];

  const renderPage = () => {
    if (currentPage === 'overview') {
      return <OverviewPage telemetry={overviewTelemetry} controls={controls} onRelayModeChange={handleRelayModeChange} />;
    }

    if (currentPage === 'sensors') {
      return (
        <SensorsPage
          telemetry={telemetry}
          onGoOverview={() => setCurrentPage('overview')}
          onCalibrate={handleSensorCalibration}
          onRefreshData={handleSensorRefresh}
          onRunDiagnosticTest={handleRunDiagnosticTest}
          statusMessage={saveStatus}
        />
      );
    }

    if (currentPage === 'controls') {
      return (
        <ControlsPage
          config={controls}
          onChange={handleControlChange}
          onSave={handleSaveControls}
          saveStatus={saveStatus}
        />
      );
    }

    if (currentPage === 'maintenance') {
      return (
        <MaintenancePage
          rows={maintenanceRows}
          onClearLogs={handleClearLogs}
          onExportDump={handleExportErrorDump}
          onRebootMicrocontroller={() => openConfirmModal('reboot')}
        />
      );
    }

    if (currentPage === 'reports') {
      return (
        <ReportsPage
          range={reportsRange}
          options={reportOptions}
          dropdownOpen={reportsDropdownOpen}
          onToggleDropdown={() => setReportsDropdownOpen((current) => !current)}
          onSelectRange={handleReportsRangeChange}
          onExportCsv={handleExportCsv}
        />
      );
    }

    if (currentPage === 'support') {
      return <SupportPage />;
    }

    if (currentPage === 'documentation') {
      return <DocumentationPage />;
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
            <button
              type="button"
              onClick={() => openConfirmModal('emergency-stop')}
              className="flex w-full items-center justify-center gap-2 rounded-DEFAULT border border-error bg-surface-container-high py-3 font-display text-label-caps text-error transition-colors hover:bg-error-container hover:text-on-error-container"
            >
              <AlertTriangle className="h-4 w-4" />
              Emergency Stop
            </button>
            <div className="my-4 h-px bg-outline-variant" />
            <NavItem compact icon={CircleHelp} label="Support" onClick={() => setCurrentPage('support')} />
            <NavItem compact icon={BookText} label="Documentation" onClick={() => setCurrentPage('documentation')} />
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

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-lowest/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container p-6 shadow-2xl">
            <h3 className="font-display text-headline-md text-on-surface">{modal.title}</h3>
            <p className="mt-3 font-data text-data-sm text-on-surface-variant">{modal.message}</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-DEFAULT border border-outline-variant bg-surface-container-high px-4 py-2 font-label-caps text-label-caps text-on-surface transition-colors hover:bg-surface-bright"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalConfirm}
                className="rounded-DEFAULT border border-status-critical/50 bg-error-container px-4 py-2 font-label-caps text-label-caps text-on-error-container transition-colors hover:bg-status-critical/10"
              >
                {modal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;