import routes from '@/router/routes';
import { createRouter, createWebHistory, Router } from 'vue-router';

export function createRouterForRoute(route: { name: string }): Router {
  const mainLayoutRouteChildren = routes[0].children;
  const routeObjectForRoute = mainLayoutRouteChildren?.find(
    ({ name }) => name === route.name
  );

  if (!routeObjectForRoute) {
    throw new Error(`Route with name ${route.name} not found`);
  }

  return createRouter({
    history: createWebHistory(),
    routes: [routeObjectForRoute],
  });
}
