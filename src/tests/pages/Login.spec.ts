import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import {
  render,
  RenderResult,
  cleanup,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/vue';
import constants from '@/util/constants';
import { createRouterForRoute } from './helpers/router';
import { Router } from 'vue-router';
import Quasar from 'quasar';
import MainLayoutTest from './helpers/MainLayoutTest.vue';

let router: Router;

// describe('Login', () => {
//   beforeEach(() => {
//     router = createRouterForRoute({ name: constants.routes.login });
//   });

//   afterEach(() => cleanup());

//   describe('General Login rendering', () => {
//     beforeEach(async () => {
//       router.push({ name: constants.routes.login });
//       await router.isReady();
//     });

//     it('should render the login component', () => {
//       render(MainLayoutTest, {
//         global: {
//           plugins: [Quasar, router],
//         },
//       });
//     });
//   });
// });
