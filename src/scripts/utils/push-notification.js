import CONFIG from '../config.js';

class PushNotificationManager {
  constructor() {
    this.registration = null;
  }

  // ✅ METHOD BARU: Set registration dari VitePWA
  setRegistration(registration) {
    this.registration = registration;
    console.log('✅ Service Worker registration set:', registration);
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
      // Tunggu sampai service worker ready (sudah di-register oleh VitePWA)
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');
      
      return true;
    } catch (error) {
      console.error('Service Worker initialization failed:', error);
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

      // ✅ CEK APAKAH SUDAH ADA SUBSCRIPTION
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('Already subscribed:', subscription);
        return subscription;
      }

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY)
      });

      console.log('New push subscription:', subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notification:', error);
      throw error; // ✅ Throw error agar bisa di-catch di tempat lain
    }
  }

  async sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, skipping subscription to server');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to send subscription to server');
      }

      const data = await response.json();
      console.log('✅ Subscription sent to server:', data);
      return data;
    } catch (error) {
      console.error('❌ Error sending subscription:', error);
      throw error;
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
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }

  // ✅ METHOD BARU: CEK STATUS SUBSCRIPTION
  async isSubscribed() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }
}

export default new PushNotificationManager();