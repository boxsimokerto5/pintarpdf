import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pintarpdf.app',
  appName: 'PintarPDF',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
