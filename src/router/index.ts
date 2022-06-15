import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouterHistory,
} from 'vue-router';

import routes from './routes';

export interface IReturnRouterHistory {
  (base?: string | undefined): RouterHistory;
}

function selectRouterHistoryType(): IReturnRouterHistory {
  if (process.env.SERVER) {
    return createMemoryHistory;
  } else if (process.env.VUE_ROUTER_MODE === 'history') {
    return createWebHistory;
  }

  return createWebHashHistory;
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
export default route(function (/* { store, ssrContext } */) {
  const createHistory = selectRouterHistoryType();

  return createRouter({
    routes,
    scrollBehavior: () => ({ left: 0, top: 0 }),

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });
});
