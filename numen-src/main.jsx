import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss'
import App from './App.jsx'
// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { PostsProvider } from "./contexts/PostsContext";
import { FriendsProvider } from "./contexts/FriendsContext";
import { SearchProvider } from "./contexts/SearchContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { MessageProvider } from "./contexts/MessageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { StoriesProvider } from "./contexts/StoriesContext";

// Capacitor imports for native functionality
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';

// Register Service Worker for PWA (web only)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

/**
 * Initialize Capacitor plugins for native platforms
 * Only runs on iOS/Android, skips on web
 */
const initializeCapacitor = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('📱 Running as PWA (web platform)');
    return;
  }

  console.log('📱 Initializing Capacitor for native platform:', Capacitor.getPlatform());

  try {
    // Configure status bar for NUMENEON dark theme
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
    console.log('✅ Status bar configured');
  } catch (error) {
    console.log('⚠️ Status bar configuration skipped:', error.message);
  }

  try {
    // Request push notification permissions
    const permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'granted') {
        await PushNotifications.register();
        console.log('✅ Push notifications registered');
      }
    } else if (permStatus.receive === 'granted') {
      await PushNotifications.register();
      console.log('✅ Push notifications already registered');
    }

    // Listen for push notification events
    PushNotifications.addListener('registration', (token) => {
      console.log('📱 Push registration token:', token.value);
      // Store token for backend registration
      Preferences.set({ key: 'push_token', value: token.value });
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📬 Push notification received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('👆 Push notification action performed:', notification);
    });

  } catch (error) {
    console.log('⚠️ Push notifications not available:', error.message);
  }

  try {
    // Hide splash screen after app loads
    await SplashScreen.hide();
    console.log('✅ Splash screen hidden');
  } catch (error) {
    console.log('⚠️ Splash screen hide skipped:', error.message);
  }
};

// Initialize Capacitor after DOM is ready
initializeCapacitor();

createRoot(document.getElementById('root')).render(
   <StrictMode>
    <AuthProvider>           {/* Must be first - provides token */}
      <WebSocketProvider>    {/* Needs token, provides WS connection */}
        <NotificationProvider> {/* Uses WebSocket */}
          <PostsProvider>
            <StoriesProvider>  {/* Stories feature */}
              <FriendsProvider>  {/* Uses WebSocket */}
                <MessageProvider> {/* Uses WebSocket */}
                  <SearchProvider>
                    <App />
                  </SearchProvider>
                </MessageProvider>
              </FriendsProvider>
            </StoriesProvider>
          </PostsProvider>
        </NotificationProvider>
      </WebSocketProvider>
    </AuthProvider>
  </StrictMode>,
)
