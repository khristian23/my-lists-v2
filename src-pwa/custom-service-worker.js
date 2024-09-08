/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

console.log('CUSTOM SERVICE WORKER');

import { precacheAndRoute } from 'workbox-precaching';


// Use with precache injection set in quasar config file as InjectManifest workbox mode
precacheAndRoute(self.__WB_MANIFEST)

/**
 * WorkBox Cache Strategy
 * https://developer.chrome.com/docs/workbox/caching-strategies-overview
 */

/**
 * Network First Falling Back to Cache Strategy
 * It fetches the data from Internet, if no network connection exists it fetches from cache
 * Once a 200 is obtained from network, the response is cached
 */ 

/**
 * Firebase communication is done thru Firestore API, which uses the following href and pathname
 * href: http://localhost:8080/google.firestore.v1.Firestore/Listen/channel?database=projects%2Fmy-lists-2c9dd
 * pathname: /google.firestore.v1.Firestore/Listen/channel
 */

/*
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

registerRoute(
    ({url}) => url.pathname.endsWith('/Listen/channel'),
    new NetworkFirst()
);
*/



/**
 * Event Listeners
 */
self.addEventListener('notificationclick', event => {
    const notification = event.notification;
    let action = event.action;

    console.error('From Service Worker, notification is: ', notification);

    const promiseChain = clients.openWindow(notification.data.Url);
    event.waitUntil(promiseChain);

    notification.close();
});