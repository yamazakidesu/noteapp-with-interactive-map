// src/index.js

import '../styles/styles.css';
import App from './pages/app';
import { unsubscribePush } from './data/api.js';
import PushNotification from './utils/push-notification.js';
import { registerSW } from 'virtual:pwa-register';

document.addEventListener('DOMContentLoaded', async () => {

  // ============================================================
  // 1. PWA SERVICE WORKER (VitePWA auto register) - HANYA DI SINI SAJA
  // ============================================================
  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      console.log("App ready to work offline");
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
      // Simpan registration untuk digunakan push notification
      if (registration) {
        PushNotification.setRegistration(registration);
      }
    }
  });

  // ============================================================
  // 2. INSTALL PROMPT HANDLING
  // ============================================================

  let deferredPrompt = null;
  const installBtn = document.getElementById('install-button');

  if (installBtn) installBtn.style.display = 'none';

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', async () => {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  });

  // ============================================================
  // 3. APP INIT
  // ============================================================

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const updateNav = () => {
    const token = localStorage.getItem('token');
    document.getElementById('register-li').style.display = token ? 'none' : 'block';
    document.getElementById('login-li').style.display = token ? 'none' : 'block';
    document.getElementById('logout-li').style.display = token ? 'block' : 'none';
    
    // Tampilkan tombol notifikasi hanya jika user sudah login
    const notifBtn = document.getElementById('enable-notification-btn');
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
  // 4. ENABLE NOTIFICATION BUTTON (HANYA SETELAH LOGIN)
  // ============================================================

  const notifBtn = document.getElementById('enable-notification-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        return;
      }

      try {
        const subscription = await PushNotification.subscribeToPushNotification();
        if (subscription) {
          alert('Notifikasi berhasil diaktifkan');
        } else {
          alert('Gagal mengaktifkan notifikasi');
        }
      } catch (error) {
        console.error('Error enabling notification:', error);
        alert('Terjadi kesalahan saat mengaktifkan notifikasi');
      }
    });
  }

  // ============================================================
  // 5. LOGOUT
  // ============================================================

  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', async () => {
    try {
      const subscription = JSON.parse(localStorage.getItem('pushSubscription'));
      if (subscription) {
        await unsubscribePush(subscription.endpoint);
        await PushNotification.unsubscribe();
        localStorage.removeItem('pushSubscription');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }

    localStorage.removeItem('token');
    window.location.hash = '#/login';
    updateNav();
  });

});