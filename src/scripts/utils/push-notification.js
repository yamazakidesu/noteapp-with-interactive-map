import CONFIG from '../config.js';

class PushNotificationManager {
  constructor() {
    this.registration = null;
  }

  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.log('Push Manager not supported');
      return false;
    }

    try {

      console.log('Service Worker registered:', this.registration);
      
      // Tunggu sampai service worker ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      // Jangan throw error, biar app tetap jalan
      return false;
    }
  }

  async requestPermission() {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPushNotification() {
    try {
      const permission = await this.requestPermission();
      
      if (!permission) {
        console.log('Notification permission denied');
        return null;
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY)
      });

      console.log('Push subscription:', subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notification:', error);
      return null;
    }
  }

  async sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, skipping subscription');
      return;
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      const data = await response.json();
      console.log('Subscription sent to server:', data);
    } catch (error) {
      console.error('Error sending subscription:', error);
    }
  }

  urlBase64ToUint8Array(base64String) {
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

  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }
}

export default new PushNotificationManager();