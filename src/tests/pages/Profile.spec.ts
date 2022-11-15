import { describe, expect, it, beforeEach } from 'vitest';
import { render, RenderResult } from '@testing-library/vue';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Quasar } from 'quasar';
import { Router } from 'vue-router';
import { createRouterForRoutes } from './helpers/router';
import constants from '@/util/constants';

let router: Router;

describe('Profile page', () => {
  beforeEach(async () => {
    router = createRouterForRoutes([{ name: constants.routes.profile.name }]);

    router.push({ name: constants.routes.profile.name });
    await router.isReady();
  });

  function renderProfile(): RenderResult {
    return render(MainLayoutTest, {
      global: {
        plugins: [Quasar, router],
        stubs: {
          TheFooter: {
            template: '<div><slot></slot></div>',
          },
        },
        mocks: {
          $Consts: constants,
        },
      },
    });
  }

  it('should render the component', () => {
    const { getByText } = renderProfile();
    expect(getByText('name')).toBeTruthy();
  });
});
