import { RouteRecordRaw } from 'vue-router';
import constants from '@/util/constants';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: constants.routes.lists.path,
        name: constants.routes.lists.name,
        component: () => import('@/pages/Lists.vue'),
      },
      //   {
      //     path: '/list/:id/items',
      //     name: Consts.routes.listItems,
      //     component: () =>
      //       import(/* webpackChunkName: "ListDetails" */ 'pages/ListItems'),
      //   },
      //   {
      //     path: '/list/:list/item/:id',
      //     name: Consts.routes.listItem,
      //     component: () =>
      //       import(/* webpackChunkName: "ListItem" */ 'pages/ListItem'),
      //   },
      //   {
      //     path: '/list/:id',
      //     name: Consts.routes.list,
      //     component: () =>
      //       import(/* webpackChunkName: "EditList" */ 'pages/List'),
      //   },
      //   {
      //     path: '/checklist/:id/items',
      //     name: Consts.routes.checklist,
      //     component: () =>
      //       import(/* webpackChunkName: "CheckList" */ 'pages/Checklist'),
      //   },
      //   {
      //     path: '/note/:id',
      //     name: Consts.routes.note,
      //     component: () => import(/* webpackChunkName: "Note" */ 'pages/Note'),
      //   },
      {
        path: constants.routes.login.path,
        name: constants.routes.login.name,
        component: () =>
          import(/* webpackChunkName: "Login" */ '@/pages/Login.vue'),
      },
      {
        path: constants.routes.register.path,
        name: constants.routes.register.name,
        component: () =>
          import(/* webpackChunkName: "Register" */ '@/pages/Register.vue'),
      },
      {
        path: constants.routes.profile.path,
        name: constants.routes.profile.name,
        component: () =>
          import(/* webpackChunkName: "Profile" */ '@/pages/Profile.vue'),
      },
      //   {
      //     path: '/profile-picture',
      //     name: Consts.routes.camera,
      //     component: () =>
      //       import(/* webpackChunkName: "Camera" */ 'pages/ProfilePicture'),
      //   },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
