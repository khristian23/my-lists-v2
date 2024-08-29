/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

console.log('CUSTOM SERVICE WORKER');

import { precacheAndRoute/*, cleanupOutdatedCaches, createHandlerBoundToURL*/ } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';


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
registerRoute(
    ({url}) => url.pathname.startsWith('a'),
    new NetworkFirst()
);