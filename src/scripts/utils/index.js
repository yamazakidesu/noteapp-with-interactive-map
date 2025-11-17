// src/index.js

import '../styles/styles.css';
import App from './pages/app';
import { unsubscribePush } from './data/api.js';
import PushNotification from './utils/push-notification.js';
import { registerSW } from 'virtual:pwa-register';

document.addEventListener('DOMContentLoaded', async () => {

  // ============================================================
  // 1. PWA SERVICE WORKER (VitePWA auto register)
  // ============================================================
  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      console.log("✅ App ready to work offline");
    },
    onRegistered(registration) {
      console.log('✅ Service Worker registered by VitePWA:', registration);
      
      // ✅ Set registration ke PushNotification Manager
      if (registration) {
        PushNotification.setRegistration(registration);
        
        // ✅ Init push notification setelah SW ready
        initPushNotification();
      }
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration error:', error);
    }
  });

  // ============================================================
  // 2. INSTALL PROMPT HANDLING
  // ============================================================

  let deferredPrompt = null;
  const installBtn = document.getElementById('install-button');

  if (installBtn) installBtn.style.display = 'none';

  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('💡 beforeinstallprompt event fired');
    event.preventDefault();
    deferredPrompt = event;
    
    // ✅ Tampilkan tombol install
    if (installBtn) {
      installBtn.style.display = 'block';
    }
  });

  // Handle click pada tombol install
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        console.log('⚠️ No install prompt available');
        return;
      }

      // Tampilkan prompt install
      deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      
      // Reset prompt
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  }

  // Handle after app installed
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA was installed successfully');
    deferredPrompt = null;
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  });

  // ============================================================
  // 3. PUSH NOTIFICATION INITIALIZATION
  // ============================================================

  async function initPushNotification() {
    try {
      const pushReady = await PushNotification.init();
      console.log('Push notification ready:', pushReady);

      if (!pushReady) {
        console.log('⚠️ Push notification not supported');
        return;
      }

      // ✅ Auto-subscribe jika user sudah login
      const token = localStorage.getItem('token');
      if (token) {
        // Cek apakah sudah subscribe
        const isSubscribed = await PushNotification.isSubscribed();
        console.log('Already subscribed?', isSubscribed);

        if (!isSubscribed) {
          console.log('🔔 Auto-subscribing to push notifications...');
          
          // Delay 2 detik agar tidak mengganggu UX
          setTimeout(async () => {
            try {
              const subscription = await PushNotification.subscribeToPushNotification();
              if (subscription) {
                console.log('✅ Successfully subscribed to push notifications');
                // Simpan subscription ke localStorage
                localStorage.setItem('pushSubscription', JSON.stringify(subscription));
              }
            } catch (error) {
              console.error('❌ Auto-subscribe failed:', error);
            }
          }, 2000);
        } else {
          console.log('✅ Already subscribed to push notifications');
        }
      }
    } catch (error) {
      console.error('❌ Push notification initialization error:', error);
    }
  }

  // ============================================================
  // 4. APP INIT
  // ============================================================

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const updateNav = () => {
    const token = localStorage.getItem('token');
    const registerLi = document.getElementById('register-li');
    const loginLi = document.getElementById('login-li');
    const logoutLi = document.getElementById('logout-li');
    const notifBtn = document.getElementById('enable-notification-btn');

    if (registerLi) registerLi.style.display = token ? 'none' : 'block';
    if (loginLi) loginLi.style.display = token ? 'none' : 'block';
    if (logoutLi) logoutLi.style.display = token ? 'block' : 'none';
    
    // Tampilkan tombol notifikasi hanya jika user sudah login
    if (notifBtn) {
      notifBtn.style.display = token ? 'inline-block' : 'none';
    }
  };

  await app.renderPage();
  updateNav();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    updateNav();
  });

  // ============================================================
  // 5. ENABLE NOTIFICATION BUTTON (MANUAL SUBSCRIBE)
  // ============================================================

  const notifBtn = document.getElementById('enable-notification-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Silakan login terlebih dahulu');
        return;
      }

      try {
        // Cek apakah sudah subscribe
        const isSubscribed = await PushNotification.isSubscribed();
        
        if (isSubscribed) {
          alert('✅ Anda sudah berlangganan notifikasi');
          return;
        }

        // Disable button sementara
        notifBtn.disabled = true;
        notifBtn.textContent = '⏳ Mengaktifkan...';

        const subscription = await PushNotification.subscribeToPushNotification();
        
        if (subscription) {
          localStorage.setItem('pushSubscription', JSON.stringify(subscription));
          alert('✅ Notifikasi berhasil diaktifkan!');
          notifBtn.textContent = '✅ Notifikasi Aktif';
        } else {
          alert('❌ Gagal mengaktifkan notifikasi. Pastikan izin notifikasi diaktifkan.');
          notifBtn.textContent = '🔔 Aktifkan Notifikasi';
        }
      } catch (error) {
        console.error('❌ Error enabling notification:', error);
        alert(`❌ Terjadi kesalahan: ${error.message}`);
        notifBtn.textContent = '🔔 Aktifkan Notifikasi';
      } finally {
        notifBtn.disabled = false;
      }
    });
  }

  // ============================================================
  // 6. LOGOUT
  // ============================================================

  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', async () => {
    try {
      // Unsubscribe dari push notification
      const subscriptionStr = localStorage.getItem('pushSubscription');
      if (subscriptionStr) {
        const subscription = JSON.parse(subscriptionStr);
        await unsubscribePush(subscription.endpoint);
        await PushNotification.unsubscribe();
        localStorage.removeItem('pushSubscription');
        console.log('✅ Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }

    // Clear token dan redirect
    localStorage.removeItem('token');
    window.location.hash = '/login';
    updateNav();
  });

});