import routes from '@/router/routes';
import {
  createRouter,
  createWebHistory,
  Router,
  RouterOptions,
} from 'vue-router';

export function createRouterForRoutes(
  routeList: Array<{ name: string }>
): Router {
  const mainLayoutRouteChildren = routes[0].children;

  const routerOptions: RouterOptions = {
    history: createWebHistory(),
    routes: [],
  };

  routeList.forEach((route) => {
    const routeObjectForRoute = mainLayoutRouteChildren?.find(
      ({ name }) => name === route.name
    );

    if (routeObjectForRoute) {
      routerOptions.routes.push(routeObjectForRoute);
    }
  });

  if (!routerOptions.routes.length) {
    throw new Error('Routes are not found');
  }

  return createRouter(routerOptions);
}
