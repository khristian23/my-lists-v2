export function useServiceWorker() {

  const isServiceWorkerSupported = ('serviceWorker' in navigator);
  
  const isPushNotificationSupported = ('PushManager' in window);

  const triggerNotification = (message: string) => {
    if (isServiceWorkerSupported && isPushNotificationSupported) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => console.error('SW registration:', reg))
      })

      navigator.serviceWorker.ready.then(ServiceWorkerRegistration => {
        ServiceWorkerRegistration.showNotification(message, {
            body: 'Thanks for subscribing',
            icon: 'icons/icon-128x128.png',
            image: 'icons/icon-128x128.png',
            badge: 'icons/icon-128x128.png',
            dir: 'ltr',
            lang: 'en-US',
            vibrate: [100, 50, 200],
            tag: 'confirm-notification',
            renotify: true,
            actions: [{ action: 'test', title: 'Test'}]
        })
      });
    }
  }

  return {
    isServiceWorkerSupported,
    isPushNotificationSupported,
    triggerNotification
  }
}