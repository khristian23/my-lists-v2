/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

console.log('CUSTOM SERVICE WORKER');

//import { clientsClaim } from 'workbox-core'
import { precacheAndRoute/*, cleanupOutdatedCaches, createHandlerBoundToURL*/ } from 'workbox-precaching'
//import { registerRoute, NavigationRoute } from 'workbox-routing'

// self.skipWaiting()
// clientsClaim()

// Use with precache injection set in quasar config file as InjectManifest workbox mode
precacheAndRoute(self.__WB_MANIFEST)

// cleanupOutdatedCaches()

// // Non-SSR fallback to index.html
// // Production SSR fallback to offline.html (except for dev)
// if (process.env.MODE !== 'ssr' || process.env.PROD) {
//   registerRoute(
//     new NavigationRoute(
//       createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
//       { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] }
//     )
//   )
// }
