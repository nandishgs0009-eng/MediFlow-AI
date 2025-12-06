import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Initialize Capacitor plugins for mobile app
 */
export const initCapacitor = async () => {
  try {
    // Hide splash screen after 3 seconds
    await SplashScreen.hide();
  } catch (error) {
    console.log('Splash screen error (expected on web):', error);
  }

  // Handle Android back button
  try {
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        // Exit app on last back button press
        App.exitApp();
      } else {
        // Go back in history
        window.history.back();
      }
    });
  } catch (error) {
    console.log('App listener error (expected on web):', error);
  }

  // Handle app state changes
  try {
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed, isActive:', isActive);
    });
  } catch (error) {
    console.log('App state listener error (expected on web):', error);
  }

  // Handle app deep links (if needed)
  try {
    App.addListener('appUrlOpen', (data: any) => {
      console.log('App URL open:', data);
      // Handle deep links here
    });
  } catch (error) {
    console.log('App URL listener error (expected on web):', error);
  }
};

export default initCapacitor;
