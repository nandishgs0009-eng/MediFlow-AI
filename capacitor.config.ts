import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nandishmediflow.app',
  appName: 'MediFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchDuration: 3000
    },
    App: {
      backButtonBehavior: 'app'
    }
  }
};

export default config;
