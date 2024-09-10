export function useServiceWorker() {

  const isServiceWorkerSupported = ('serviceWorker' in navigator);
  
  const isPushNotificationSupported = ('PushManager' in window);

  const triggerPushNotification = async () => {
    if (isServiceWorkerSupported && isPushNotificationSupported) {

      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const pushManagerSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

      if (!pushManagerSubscription) {
        createPushNotification(serviceWorkerRegistration);
      }

    }
  };

  const createPushNotification = async (serviceWorkerRegistration: ServiceWorkerRegistration) => {

    serviceWorkerRegistration.pushManager.subscribe();
      
        // serviceWorkerRegistration.showNotification('You are subscribed to notifications', {
        //     body: 'Thanks for subscribing',
        //     icon: 'icons/icon-128x128.png',
        //     image: 'icons/icon-128x128.png',
        //     badge: 'icons/icon-128x128.png',
        //     dir: 'ltr',
        //     lang: 'en-US',
        //     vibrate: [100, 50, 200],
        //     tag: 'confirm-notification',
        //     renotify: true,
        //     actions: [{ action: 'test', title: 'Test'}]
        // })
  };

  return {
    isServiceWorkerSupported,
    isPushNotificationSupported,
    triggerPushNotification
  }
}