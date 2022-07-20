import {
  describe,
  it,
  vi,
  expect,
  beforeEach,
  afterEach,
  SpyInstance,
} from 'vitest';
import {
  render,
  RenderResult,
  cleanup,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/vue';
import { ref } from 'vue';
import { Quasar } from 'quasar';
import List from '@/models/list';
import Lists from '@/pages/Lists.vue';
import TheList from '@/components/TheList.vue';
import TheConfirmation from '@/components/TheConfirmation.vue';
import Consts from '@/util/constants';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { createRouter, createWebHistory, Router } from 'vue-router';

import { useLists } from '@/composables/useLists';
vi.mock('@/composables/useLists');

const noop = () => undefined;
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

const MAX_NUMBER_OF_LISTS = 20;

let router: Router;

const lists = fillListsWithData();

function fillListsWithData(): Array<List> {
  const listTypes = Object.values(Consts.listTypes);
  const mockedLists: Array<List> = [];

  for (let i = 0; i < MAX_NUMBER_OF_LISTS; i++) {
    mockedLists.push(
      new List({
        id: `ListId${i}`,
        name: `ListName${i}`,
        type: listTypes[Math.floor(Math.random() * listTypes.length)],
      })
    );
  }

  return mockedLists;
}

interface SetupData {
  customLists: Array<List>;
  mockedRouteQuery: string;
}

function renderComponent(setupData?: Partial<SetupData>): RenderResult {
  vi.mocked(useLists).mockReturnValue({
    isLoadingLists: ref(false),
    getListsByType: () => Promise.resolve(setupData?.customLists ?? lists),
    getListById: vi.fn(),
    deleteList: vi.fn(),
    updateListsOrder: vi.fn(),
  });

  return render(MainLayoutTest, {
    global: {
      plugins: [Quasar, router],
      components: { TheList, TheConfirmation },
      stubs: {
        draggable: {
          template: '<div id="listHolder"><slot></slot></div>',
        },
        TheListLoader: true,
        TheFooter: {
          template: '<div><slot></slot></div>',
        },
      },
    },
  });
}

describe('The Lists', () => {
  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: Consts.routes.lists,
          component: Lists,
        },
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('General Lists rendering', () => {
    beforeEach(async () => {
      router.push({ name: Consts.routes.lists });
      await router.isReady();
    });

    afterEach(() => cleanup());

    it('should render the page', async () => {
      const { getByText } = renderComponent();
      await waitFor(() => expect(getByText('ListName2')).toBeTruthy());
    });

    it('should render the list component only if it has items', () => {
      const { container } = renderComponent({
        customLists: [],
      });
      expect(container.querySelector('#listHolder')).toBeFalsy();
    });

    it('should show all lists by default with empty query type', async () => {
      const { findAllByText } = renderComponent();
      const list = await findAllByText((content) =>
        content.startsWith('ListName')
      );
      expect(list).toHaveLength(MAX_NUMBER_OF_LISTS);
    });
  });

  describe('Filtering by route is used', () => {
    const filterByType = Consts.listTypes.toDoList;
    const filteredItems = lists.filter(({ type }) => type === filterByType);

    beforeEach(async () => {
      router.push({ path: '/' });
      await router.isReady();
    });

    it('should filter when reaching the component', async () => {
      const { findAllByText } = renderComponent({ customLists: filteredItems });
      const list = await findAllByText((content) =>
        content.startsWith('ListName')
      );
      expect(list).toHaveLength(filteredItems.length);
    });

    it('should update page title when reaching the component', async () => {
      router.replace({ path: '/', query: { type: filterByType } });
      await router.isReady();

      const { findByText } = renderComponent({
        customLists: filteredItems,
      });
      expect(await findByText('title: To do lists')).toBeTruthy();
    });

    it('should update page title when change the filter', async () => {
      router.replace({
        path: '/',
        query: { type: Consts.listTypes.shoppingCart },
      });
      await router.isReady();

      const { findByText } = renderComponent({
        customLists: filteredItems,
      });
      expect(await findByText('title: Shopping lists')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    let routerSpy: SpyInstance;

    beforeEach(() => {
      routerSpy = vi.spyOn(router, 'push');
      routerSpy.mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
      routerSpy.mockRestore();
    });

    it('should navigate to items details route', async () => {
      const firstList = lists[0];
      const routeName =
        Consts.routes[firstList.type as keyof typeof Consts.routes] ??
        Consts.routes.listItems;

      const { getByText } = renderComponent();

      await waitFor(() => getByText(firstList.name));

      fireEvent.click(getByText(firstList.name));

      expect(routerSpy).toHaveBeenCalledWith({
        name: routeName,
        params: { id: firstList.id },
      });
    });

    it('should navigate to edit list page', async () => {
      const firstList = lists[0];
      const { getByTestId } = renderComponent();

      await waitFor(() => getByTestId(firstList.id));

      const editButton = within(getByTestId(firstList.id)).getByRole('button', {
        name: 'action',
      });
      await fireEvent.click(editButton);

      expect(routerSpy).toHaveBeenCalledWith({
        name: Consts.routes.list,
        params: { id: firstList.id },
      });
    });

    it('should navigate to list creation page', async () => {
      const { findByText } = renderComponent({
        customLists: [],
      });

      const createButton = await findByText('Create');
      await fireEvent.click(createButton);

      expect(routerSpy).toHaveBeenCalledWith({
        name: Consts.routes.list,
        params: { id: 'new' },
      });
    });
  });

  describe('List Management', () => {
    it('should delete an list entry', async () => {
      const firstList = lists[0];
      const { getByTestId, findByText } = renderComponent({
        customLists: [firstList],
      });

      await waitFor(() => getByTestId(firstList.id));

      const deleteButton = within(getByTestId(firstList.id)).getByRole(
        'button',
        {
          name: 'delete',
        }
      );
      await fireEvent.click(deleteButton);

      await findByText(`Are you sure to delete list '${firstList.name}'`);
    });
  });
});
