import { readFile } from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const envText = await readFile(new URL('../.env', import.meta.url), 'utf8');

for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    continue;
  }

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) {
    continue;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim();
  process.env[key] = value;
}

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing Firebase environment variable: ${key}`);
  }
}

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});

const db = getDatabase(app);

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

await set(ref(db, 'AIRGUARD_Reports'), sample);
console.log('Seeded AIRGUARD_Reports sample data.');