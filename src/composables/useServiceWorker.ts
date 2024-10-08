import { NotificationSubscription } from '@/models/models';
import { useUser } from './useUser';

export function useServiceWorker() {

  const { setUserNotificationSubscription } = useUser();

  const isServiceWorkerSupported = ('serviceWorker' in navigator);
  
  const isPushNotificationSupported = ('PushManager' in window);

  const vapidPublicKey = "BCEXZLGCY-d_ZBEHLEuqrNyVCZjOs_tuW1m5Vn2Kdb0VpbQCzmHzA7Zijm6qezH6PARJAPo4Y-C9CCd-WfqlX4k";

  const triggerPushNotification = async () => {
    if (isServiceWorkerSupported && isPushNotificationSupported) {

      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const pushManagerSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

      if (!pushManagerSubscription) {
        createPushNotificationSubscription(serviceWorkerRegistration);
      }

    }
  };

  const createPushNotificationSubscription = async (serviceWorkerRegistration: ServiceWorkerRegistration) => {
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });

    const subscriptionObject = subscription.toJSON();
    return setUserNotificationSubscription(subscriptionObject as NotificationSubscription);
  };

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

  return {
    isServiceWorkerSupported,
    isPushNotificationSupported,
    triggerPushNotification
  }
}