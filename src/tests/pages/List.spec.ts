import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import {
  cleanup,
  fireEvent,
  getByText,
  render,
  waitFor,
  within,
} from '@testing-library/vue';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Quasar } from 'quasar';
import { Router } from 'vue-router';
import constants from '@/util/constants';
import { createRouterForRoutes } from './helpers/router';
import userEvent from '@testing-library/user-event';
import types from '@testing-library/user-event';
import flushPromises from 'flush-promises';

vi.mock('@/services/ListService');

let router: Router;

const NEW_LIST_ID = 'new';
const FAKE_USER_ID = 'UserId';
const FAKE_LIST_ID = 'ListId';

vi.mock('@/composables/useUser', () => ({
  useUser: () => ({
    getCurrentUserId: () => FAKE_USER_ID,
  }),
}));

describe('List page', () => {
  beforeEach(async () => {
    router = createRouterForRoutes([
      { name: constants.routes.list.name },
      { name: constants.routes.lists.name },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  function renderList() {
    return render(MainLayoutTest, {
      global: {
        plugins: [Quasar, router],
        stubs: {
          TheFooter: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    });
  }

  describe('Basic controls', () => {
    beforeEach(async () => {
      router.push({
        name: constants.routes.list.name,
        params: { id: NEW_LIST_ID },
      });
      await router.isReady();
    });

    it('should render the component', () => {
      const { getByLabelText } = renderList();
      getByLabelText('Name');
    });
  });
});
