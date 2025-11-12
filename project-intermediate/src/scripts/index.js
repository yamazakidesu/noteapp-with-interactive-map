import '../styles/styles.css';

import App from './pages/app';
import { unsubscribePush } from './data/api.js';

document.addEventListener('DOMContentLoaded', async () => {
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
    if (token) {
      registerLi.style.display = 'none';
      loginLi.style.display = 'none';
      logoutLi.style.display = 'block';
    } else {
      registerLi.style.display = 'block';
      loginLi.style.display = 'block';
      logoutLi.style.display = 'none';
    }
  };

  await app.renderPage();
  updateNav();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    updateNav();
  });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    const subscription = JSON.parse(localStorage.getItem('pushSubscription'));
    if (subscription) {
      try {
        await unsubscribePush(subscription.endpoint);
      } catch (error) {
        console.warn('Unsubscribe failed:', error);
      }
      localStorage.removeItem('pushSubscription');
    }
    localStorage.removeItem('token');
    window.location.hash = '#/login';
    updateNav();
  });
});
