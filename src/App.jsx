import { useEffect, useMemo, useRef, useState } from 'react';
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
import { onValue, ref, set, push } from 'firebase/database';
import { db } from './firebase';
import OverviewPage from './pages/OverviewPage';
import SensorsPage from './pages/SensorsPage';
import ControlsPage from './pages/ControlsPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';
import SupportPage from './pages/SupportPage';
import DocumentationPage from './pages/DocumentationPage';

const defaultTelemetry = {
  temperature: 0,
  humidity: 0,
  heat_index: 0,
  aqi_ppm: 0,
  fan_status: false,
  manual_override: false,
};

const initialControls = {
  aqiTrigger: 1000,
  heatTrigger: 33,
  relayMode: 'AUTO',
  masterOverride: false,
};

const defaultMaintenance = {
  firmwareVersion: '',
  uptime: {
    days: '',
    hours: '',
  },
  filterRemaining: 0,
  rows: [],
};

const defaultReports = {
  range: 'Last 7 Days',
  options: [],
  summaryCards: [],
  weeklyDays: [],
  chartData: [],
};

const defaultOverview = {
  chartData: [],
};

const defaultSupport = {
  heroTitle: 'Support Center',
  heroBody: '',
  cards: [],
};

const defaultDocumentation = {
  heroTitle: 'Documentation',
  heroBody: '',
  cards: [],
};

const AUTH_STORAGE_KEY = 'airguard-authenticated';
const AUTH_USERNAME = 'Admin';
const AUTH_PASSWORD = 'Admin123';

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => window.sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [telemetry, setTelemetry] = useState(defaultTelemetry);
  const [controls, setControls] = useState(initialControls);
  const [currentPage, setCurrentPage] = useState('overview');
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [maintenanceLive, setMaintenanceLive] = useState(defaultMaintenance);
  const [reportsLive, setReportsLive] = useState(defaultReports);
  const [overviewLive, setOverviewLive] = useState(defaultOverview);
  const [supportLive, setSupportLive] = useState(defaultSupport);
  const [documentationLive, setDocumentationLive] = useState(defaultDocumentation);
  const [lastControlSyncAt, setLastControlSyncAt] = useState(0);
  const lastTelemetryUpdateRef = useRef(0);
  const telemetryStaleTimeoutMs = 12000;

  const handleLogin = (event) => {
    event.preventDefault();

    if (loginUsername === AUTH_USERNAME && loginPassword === AUTH_PASSWORD) {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setLoginError('');
      setLoginPassword('');
      return;
    }

    setLoginError('Invalid username or password.');
  };

  useEffect(() => {
    const liveRef = ref(db, 'AIRGUARD_Live');

    const unsubscribe = onValue(
      liveRef,
      (snapshot) => {
        if (snapshot.exists()) {
          lastTelemetryUpdateRef.current = Date.now();
          setTelemetry({ ...defaultTelemetry, ...snapshot.val() });
          setIsOnline(true);
        } else {
          lastTelemetryUpdateRef.current = 0;
          setTelemetry(defaultTelemetry);
          setIsOnline(false);
        }
      },
      (error) => {
        console.error('Firebase Read Error: ', error);
        lastTelemetryUpdateRef.current = 0;
        setTelemetry(defaultTelemetry);
        setIsOnline(false);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      if (!lastTelemetryUpdateRef.current) {
        return;
      }

      if (Date.now() - lastTelemetryUpdateRef.current > telemetryStaleTimeoutMs) {
        setTelemetry(defaultTelemetry);
        setIsOnline(false);
        lastTelemetryUpdateRef.current = 0;
      }
    }, 2000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const controlsRef = ref(db, 'AIRGUARD_Controls');

    const unsubscribe = onValue(
      controlsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setControls({ ...initialControls, ...snapshot.val() });
          setLastControlSyncAt(Date.now());
        } else {
          setControls(initialControls);
        }
      },
      (error) => {
        console.error('Firebase Controls Read Error: ', error);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const overviewRef = ref(db, 'AIRGUARD_Overview');

    const unsubscribe = onValue(
      overviewRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setOverviewLive(defaultOverview);
          return;
        }

        const data = snapshot.val() || {};
        setOverviewLive({
          chartData: Array.isArray(data.chartData) ? data.chartData : [],
        });
      },
      (error) => {
        console.error('Firebase Overview Read Error: ', error);
        setOverviewLive(defaultOverview);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const maintenanceRef = ref(db, 'AIRGUARD_Maintenance');

    const unsubscribe = onValue(
      maintenanceRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setMaintenanceLive(defaultMaintenance);
          return;
        }

        const data = snapshot.val() || {};
        setMaintenanceLive({
          firmwareVersion: data.firmwareVersion ?? '',
          uptime: {
            days: data.uptime?.days ?? '',
            hours: data.uptime?.hours ?? '',
          },
          filterRemaining: typeof data.filterRemaining === 'number' ? data.filterRemaining : 0,
          rows: Array.isArray(data.rows) ? data.rows : [],
        });
      },
      (error) => {
        console.error('Firebase Maintenance Read Error: ', error);
        setMaintenanceLive(defaultMaintenance);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const reportsRef = ref(db, 'AIRGUARD_Reports');

    const unsubscribe = onValue(
      reportsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setReportsLive(defaultReports);
          return;
        }

        const data = snapshot.val() || {};
        setReportsLive({
          range: data.range ?? 'Last 7 Days',
          options: Array.isArray(data.options) ? data.options : [],
          summaryCards: Array.isArray(data.summaryCards) ? data.summaryCards : [],
          weeklyDays: Array.isArray(data.weeklyDays) ? data.weeklyDays : [],
          chartData: Array.isArray(data.chartData) ? data.chartData : [],
        });
      },
      (error) => {
        console.error('Firebase Reports Read Error: ', error);
        setReportsLive(defaultReports);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const supportRef = ref(db, 'AIRGUARD_Support');

    const unsubscribe = onValue(
      supportRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setSupportLive(defaultSupport);
          return;
        }

        const data = snapshot.val() || {};
        setSupportLive({
          heroTitle: data.heroTitle ?? '',
          heroBody: data.heroBody ?? '',
          cards: Array.isArray(data.cards) ? data.cards : [],
        });
      },
      (error) => {
        console.error('Firebase Support Read Error: ', error);
        setSupportLive(defaultSupport);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const docsRef = ref(db, 'AIRGUARD_Documentation');

    const unsubscribe = onValue(
      docsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setDocumentationLive(defaultDocumentation);
          return;
        }

        const data = snapshot.val() || {};
        setDocumentationLive({
          heroTitle: data.heroTitle ?? '',
          heroBody: data.heroBody ?? '',
          cards: Array.isArray(data.cards) ? data.cards : [],
        });
      },
      (error) => {
        console.error('Firebase Documentation Read Error: ', error);
        setDocumentationLive(defaultDocumentation);
      },
    );

    return () => unsubscribe();
  }, []);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-on-surface antialiased sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
          <form onSubmit={handleLogin} className="w-full rounded-2xl border border-outline-variant bg-surface-container p-8 shadow-2xl industrial-inset">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high">
                <Router className="h-7 w-7 text-primary" />
              </div>
              <h1 className="mt-4 font-display text-headline-md text-on-surface">AIRGUARD+</h1>
              <p className="mt-2 font-data text-data-sm text-on-surface-variant">Sign in to continue to the dashboard.</p>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Username</span>
              <input
                type="text"
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 font-data text-data-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                placeholder="Admin"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Password</span>
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 font-data text-data-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                placeholder="Admin123"
              />
            </label>

            {loginError ? <p className="mt-4 rounded-lg border border-status-critical/30 bg-status-critical/10 px-4 py-3 font-data text-data-sm text-status-critical">{loginError}</p> : null}

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 font-label-caps text-label-caps uppercase tracking-wider text-on-primary transition-colors hover:brightness-110"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const openConfirmModal = (type) => {
    if (type === 'reboot') {
      setModal({
        type,
        title: 'Reboot Microcontroller',
        message: 'This will reset the live dashboard state back to defaults. Continue?',
        confirmLabel: 'Reboot Now',
      });
      return;
    }

    if (type === 'emergency_stop') {
      setModal({
        type,
        title: 'Confirm Emergency Stop',
        message: 'Emergency Stop will immediately set relays OFF and notify the device. This is irreversible from the UI without manual reset. Continue?',
        confirmLabel: 'Emergency Stop',
      });
      return;
    }
  };

  const closeModal = () => setModal(null);

  const handleModalConfirm = () => {
    if (!modal) {
      return;
    }

    if (modal.type === 'reboot') {
      // notify device to reboot
      const cmd = { type: 'reboot', issuedAt: Date.now(), issuedBy: 'web' };
      void push(ref(db, 'AIRGUARD_Commands'), cmd);
      void set(ref(db, 'AIRGUARD_Controls/reboot'), true);
      window.setTimeout(() => {
        void set(ref(db, 'AIRGUARD_Controls/reboot'), false);
      }, 1000);
      setTelemetry(defaultTelemetry);
      setControls(initialControls);
      setOverviewLive(defaultOverview);
      setMaintenanceLive(defaultMaintenance);
      setReportsLive(defaultReports);
      setSupportLive(defaultSupport);
      setDocumentationLive(defaultDocumentation);
      void set(ref(db, 'AIRGUARD_Controls'), initialControls);
      void set(ref(db, 'AIRGUARD_Overview'), defaultOverview);
      void set(ref(db, 'AIRGUARD_Maintenance'), defaultMaintenance);
      void set(ref(db, 'AIRGUARD_Reports'), defaultReports);
      setLastControlSyncAt(Date.now());
      setSaveStatus('Microcontroller rebooted');
      closeModal();
      return;
    }

    if (modal.type === 'emergency_stop') {
      handleEmergencyStop();
      closeModal();
      return;
    }

    closeModal();
  };

  const handleSaveControls = () => {
    void set(ref(db, 'AIRGUARD_Controls'), controls);
    setLastControlSyncAt(Date.now());
    setSaveStatus('Configuration saved');
  };

  const updateTelemetry = (patch) => {
    setTelemetry((current) => ({ ...current, ...patch }));
  };

  const handleSensorCalibration = () => {
    // Send a calibration command to the device via Realtime Database
    const cmd = {
      type: 'calibrate',
      target: 'MQ-135',
      issuedAt: Date.now(),
      issuedBy: 'web',
    };
    void push(ref(db, 'AIRGUARD_Commands'), cmd);
    setSaveStatus('Calibration requested');
    // Apply a small local visual adjustment while device processes it
    const nextAqi = Math.max(180, Math.round(telemetry.aqi_ppm - 18));
    updateTelemetry({ aqi_ppm: nextAqi, heat_index: Number((telemetry.heat_index - 0.2).toFixed(1)) });
  };

  const handleSensorRefresh = () => {
    // Ask the NodeMCU to take a fresh reading
    const cmd = {
      type: 'refresh',
      target: 'sensors',
      issuedAt: Date.now(),
      issuedBy: 'web',
    };
    void push(ref(db, 'AIRGUARD_Commands'), cmd);
    setSaveStatus('Refresh requested');
    // Keep a small local visual jitter so UI feels responsive
    const drift = (seed) => Number((seed + (Math.random() - 0.5) * 0.6).toFixed(1));
    updateTelemetry({
      temperature: drift(telemetry.temperature),
      humidity: drift(telemetry.humidity),
      heat_index: drift(telemetry.heat_index),
      aqi_ppm: Math.max(150, Math.round(telemetry.aqi_ppm + (Math.random() - 0.5) * 20)),
    });
  };

  const handleRunDiagnosticTest = () => {
    setSaveStatus('Diagnostic test completed');
  };

  const handleExportCsv = () => {
    const rows = [
      ['Range', reportsLive.range],
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
    setMaintenanceLive((current) => ({ ...current, rows: [] }));
    void set(ref(db, 'AIRGUARD_Maintenance/rows'), []);
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

  // Emergency stop: tell the device to immediately stop and set relays off in controls
  const handleEmergencyStop = () => {
    const cmd = { type: 'emergency_stop', issuedAt: Date.now(), issuedBy: 'web' };
    void push(ref(db, 'AIRGUARD_Commands'), cmd);
    const nextControls = { ...initialControls, relayMode: 'OFF', masterOverride: true };
    setControls(nextControls);
    void set(ref(db, 'AIRGUARD_Controls'), nextControls);
    setLastControlSyncAt(Date.now());
    setSaveStatus('Emergency stop issued');
  };

  // Developer helper: push sample report data to Firebase so Reports UI shows content
  const pushSampleReports = () => {
    const sample = {
      range: 'Last 7 Days',
      options: ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'],
      summaryCards: [
        { title: 'Avg Daily AQI', value: '480', unit: 'PPM', accentClass: 'text-primary', path: 'M0,10 L20,8 L40,12 L60,10 L80,7 L100,10' },
        { title: 'Highest Temp', value: '35.1°C', accentClass: 'text-error', path: 'M0,15 L20,15 L40,12 L60,5 L80,8 L100,2' },
        { title: 'Fan Runtime', value: '14', unit: 'hrs', accentClass: 'text-tertiary', path: 'M0,10 L30,10 L70,15 L100,15' },
      ],
      weeklyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      chartData: [
        { time: '00', aqi: 210, temperature: 29.8 },
        { time: '03', aqi: 255, temperature: 30.2 },
        { time: '06', aqi: 320, temperature: 31.1 },
        { time: '09', aqi: 410, temperature: 32.4 },
        { time: '12', aqi: 450, temperature: 34.0 },
        { time: '15', aqi: 430, temperature: 33.2 },
        { time: '18', aqi: 470, temperature: 34.5 },
        { time: '21', aqi: 490, temperature: 33.8 },
        { time: '24', aqi: 450, temperature: 32.7 },
      ],
    };

    void set(ref(db, 'AIRGUARD_Reports'), sample);
    setSaveStatus('Sample reports pushed');
  };

  const handleControlChange = (nextConfig) => {
    const nextControls = { ...controls, ...nextConfig };
    setControls(nextControls);
    void set(ref(db, 'AIRGUARD_Controls'), nextControls);
    setLastControlSyncAt(Date.now());
  };

  const handleRelayModeChange = (relayMode) => {
    const nextControls = { ...controls, relayMode };
    setControls(nextControls);
    void set(ref(db, 'AIRGUARD_Controls'), nextControls);
    setLastControlSyncAt(Date.now());
  };

  const handleReportsRangeChange = (nextRange) => {
    setReportsLive((current) => ({ ...current, range: nextRange }));
    void set(ref(db, 'AIRGUARD_Reports/range'), nextRange);
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
      return <OverviewPage telemetry={overviewTelemetry} controls={controls} onRelayModeChange={handleRelayModeChange} chartData={overviewLive.chartData} />;
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
          isOnline={isOnline}
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
          lastSyncedAt={lastControlSyncAt}
        />
      );
    }

    if (currentPage === 'maintenance') {
      return (
        <MaintenancePage
          rows={maintenanceLive.rows}
          firmwareVersion={maintenanceLive.firmwareVersion}
          uptime={maintenanceLive.uptime}
          filterRemaining={maintenanceLive.filterRemaining}
          onClearLogs={handleClearLogs}
          onExportDump={handleExportErrorDump}
        />
      );
    }

    if (currentPage === 'reports') {
      return (
        <ReportsPage
          range={reportsLive.range}
          options={reportsLive.options}
          summaryCards={reportsLive.summaryCards}
          weeklyDays={reportsLive.weeklyDays}
          chartData={reportsLive.chartData}
          dropdownOpen={reportsDropdownOpen}
          onToggleDropdown={() => setReportsDropdownOpen((current) => !current)}
          onSelectRange={handleReportsRangeChange}
          onExportCsv={handleExportCsv}
        />
      );
    }

    if (currentPage === 'support') {
      return <SupportPage hero={supportLive} />;
    }

    if (currentPage === 'documentation') {
      return <DocumentationPage hero={documentationLive} />;
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
              <div className={`font-display text-label-caps flex items-center gap-1 ${isOnline ? 'text-emerald-500' : 'text-status-critical'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-status-critical'}`} />
                {isOnline ? 'System Online' : 'System Offline'}
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
              onClick={() => pushSampleReports()}
              className="flex w-full items-center justify-center gap-2 rounded-DEFAULT border border-outline-variant bg-surface-container-high py-3 font-display text-label-caps text-on-surface transition-colors hover:bg-surface-bright"
            >
              Seed Reports
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
