
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { APP_VERSION } from './version.ts'

// Store app version in localStorage for cross-tab synchronization
if (localStorage.getItem('app_version') !== APP_VERSION) {
  localStorage.setItem('app_version', APP_VERSION);
}

createRoot(document.getElementById("root")!).render(<App />);
