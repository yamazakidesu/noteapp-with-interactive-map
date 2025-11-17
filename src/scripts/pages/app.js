import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import pushNotificationManager from '../utils/push-notification.js';
import indexedDBManager from '../data/indexeddb.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.initPWA();
  }

  async initPWA() {
    try {
      // Initialize IndexedDB
      await indexedDBManager.openDB();
      console.log('IndexedDB initialized');

      // Initialize Push Notification
      const swRegistered = await pushNotificationManager.init();
      
      if (swRegistered) {
        console.log('Service Worker registered successfully');
        
        // Auto-subscribe to push notifications after login
        const token = localStorage.getItem('token');
        if (token) {
          // Check if already subscribed
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            // Ask for permission and subscribe
            setTimeout(async () => {
              const subscribed = await pushNotificationManager.subscribeToPushNotification();
              if (subscribed) {
                console.log('Subscribed to push notifications');
              }
            }, 2000); // Delay 2 seconds after page load
          }
        }
      }

      // Show install prompt
      this.setupInstallPrompt();
    } catch (error) {
      console.error('PWA initialization error:', error);
    }
  }

  setupInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show custom install button
      this.showInstallButton(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
    });
  }

  showInstallButton(deferredPrompt) {
    // Create install button if not exists
    let installBtn = document.getElementById('install-btn');
    
    if (!installBtn) {
      installBtn = document.createElement('button');
      installBtn.id = 'install-btn';
      installBtn.textContent = '📱 Install App';
      installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-size: 16px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
      `;
      document.body.appendChild(installBtn);
    }

    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    });
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const token = localStorage.getItem('token');

    // Validasi authentication
    if (!token && url !== '/register' && url !== '/login' && url !== '/add' && url !== '/' && !url.startsWith('/story/') && url !== '/favorites') {
      window.location.hash = '#/login';
      return;
    }

    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = '<h1>Page not found</h1>';
      return;
    }

    // Gunakan View Transition API
    if (!document.startViewTransition) {
      // Fallback untuk browser yang tidak support View Transition API
      await this.#renderPageContent(page);
    } else {
      // Gunakan View Transition API
      const transition = document.startViewTransition(async () => {
        await this.#renderPageContent(page);
      });

      // Optional: Handle transition finished
      try {
        await transition.finished;
      } catch (error) {
        console.error('Transition error:', error);
      }
    }
  }

  async #renderPageContent(page) {
    // Render konten halaman
    this.#content.innerHTML = await page.render();
    
    // Jalankan after render (untuk inisialisasi event listeners, dll)
    await page.afterRender();
    
    // Scroll ke atas setelah render
    window.scrollTo(0, 0);
  }
}

export default App;