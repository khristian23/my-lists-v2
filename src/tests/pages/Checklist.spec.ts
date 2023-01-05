import { describe, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/vue';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Quasar } from 'quasar';
import { useRouter } from 'vue-router';
import vuedraggable from 'vuedraggable';
import TheList from '@/components/TheList.vue';
import ListService from '@/services/ListService';
import { createRouterForRoutes } from './helpers/router';
import constants from '@/util/constants';

vi.mock('@/services/ListService');

let router = useRouter();

describe('Checklist page', () => {
  beforeEach(async () => {
    mockChecklistWithItems();

    router = createRouterForRoutes([
      { name: constants.routes.listItems.name },
      { name: constants.routes.lists.name },
      { name: constants.routes.listItem.name },
    ]);
    router.push({
      name: constants.routes.listItems.name,
      params: { id: FAKE_LIST_ID },
    });
    await router.isReady();
  });

  afterEach(() => {
    cleanup();
  });

  function mockChecklistWithItems() {}

  function renderChecklist() {
    return render(MainLayoutTest, {
      global: {
        plugins: [Quasar, router],
        components: {
          TheList,
          vuedraggable,
        },
        stubs: {
          TheListLoader: true,
          TheFooter: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    });
  }

  it('should render the component', async () => {
    const { getByText } = renderChecklist();

    getByText;
  });
});
