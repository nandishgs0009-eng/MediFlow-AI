/**
 * Mobile Platform Detection Utility
 * Helps detect if app is running on mobile via Capacitor
 */

import { Capacitor } from '@capacitor/core';

export const Platform = {
  /**
   * Check if running on native mobile app
   */
  isNative: (): boolean => {
    return Capacitor.isNativePlatform();
  },

  /**
   * Get current platform name
   */
  getPlatform: (): 'android' | 'ios' | 'web' => {
    return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
  },

  /**
   * Check if running on Android
   */
  isAndroid: (): boolean => {
    return Capacitor.getPlatform() === 'android';
  },

  /**
   * Check if running on iOS
   */
  isIOS: (): boolean => {
    return Capacitor.getPlatform() === 'ios';
  },

  /**
   * Check if running on web
   */
  isWeb: (): boolean => {
    return Capacitor.getPlatform() === 'web';
  },

  /**
   * Get device info
   */
  async getDeviceInfo() {
    try {
      const { Device } = await import('@capacitor/device');
      return await Device.getInfo();
    } catch {
      return null;
    }
  },
};

export default Platform;
