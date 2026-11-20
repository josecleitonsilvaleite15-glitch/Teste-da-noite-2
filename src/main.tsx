import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

const cap = (window as unknown as {Capacitor?: {isNativePlatform?: () => boolean}}).Capacitor;
const isNativeCapacitor = Boolean(cap?.isNativePlatform?.());

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // Clean up any previously registered dev service worker that can break page reloads
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
} else if (import.meta.env.PROD && !isNativeCapacitor) {
  registerSW({immediate: true});
}

createRoot(document.getElementById('root')!).render(<App />);
