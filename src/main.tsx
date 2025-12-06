import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile-responsive.css";
import { initCapacitor } from "./utils/capacitor-init";

// Initialize Capacitor for mobile app
initCapacitor();

// Register service worker for background alarm notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registered successfully:', registration);
      })
      .catch(error => {
        console.warn('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
