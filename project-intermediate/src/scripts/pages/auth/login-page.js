import { login, subscribePush } from '../../data/api.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h1>Login</h1>
        <form id="login-form" class="form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" required>
          </div>
          <div class="form-group">
            <button type="submit">Login</button>
          </div>
        </form>
        <p>Belum punya akun? <a href="#/register">Register</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const result = await login({ email, password });
        localStorage.setItem('token', result.loginResult.token);
        if ('serviceWorker' in navigator && 'PushManager' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array('BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'),
            });
            const p256dh = arrayBufferToBase64(subscription.getKey('p256dh'));
            const auth = arrayBufferToBase64(subscription.getKey('auth'));
            await subscribePush({
              endpoint: subscription.endpoint,
              keys: {
                p256dh,
                auth,
              },
            });
            localStorage.setItem('pushSubscription', JSON.stringify({
              endpoint: subscription.endpoint,
              keys: { p256dh, auth },
            }));
          } catch (error) {
            console.warn('Push subscription failed:', error);
          }
        }
        alert('Login successful!');
        window.location.hash = '#/';
      } catch (error) {
        alert('Login failed: ' + error.message);
      }
    });
  }
}
