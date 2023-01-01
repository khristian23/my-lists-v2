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
import { Quasar } from 'quasar';
import TheList from '@/components/TheList.vue';
import TheConfirmation from '@/components/TheConfirmation.vue';
import constants from '@/util/constants';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Router } from 'vue-router';
import { generateLists } from '../helpers/TestHelpers';
import { createRouterForRoutes } from './helpers/router';
import vuedraggable from 'vuedraggable';
import flushPromises from 'flush-promises';
import ListService from '@/services/ListService';
vi.mock('@/services/ListService');

const noop = () => undefined;
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

let router: Router;

const MAX_NUMBER_OF_LISTS = 20;
const lists = generateLists(MAX_NUMBER_OF_LISTS);

function renderComponent(): RenderResult {
  return render(MainLayoutTest, {
    global: {
      plugins: [Quasar, router],
      components: { TheList, TheConfirmation, vuedraggable },
      stubs: {
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
    router = createRouterForRoutes([{ name: constants.routes.lists.name }]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('General Lists rendering', () => {
    beforeEach(async () => {
      vi.mocked(ListService).getListsByType.mockResolvedValue(lists);

      router.push({ name: constants.routes.lists.name });
      await router.isReady();
    });

    it('should render the page with All Lists title', async () => {
      const { getByText } = renderComponent();

      await flushPromises();

      getByText('ListName2');

      getByText('title: All lists');
    });

    it('should render the list component only if it has items', () => {
      const { container } = renderComponent();

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
    const filteredByToDoLists = lists.filter(
      ({ type }) => type === constants.listType.toDoList
    );
    const filteredByWishLists = lists.filter(
      ({ type }) => type === constants.listType.whishlist
    );

    it('should filter when reaching the component', async () => {
      router.push({ path: '/' });
      await router.isReady();

      vi.mocked(ListService).getListsByType.mockResolvedValue(lists);

      const { findAllByText } = renderComponent();

      expect(ListService.getListsByType).toHaveBeenCalledWith(
        constants.user.anonymous,
        undefined
      );

      const list = await findAllByText((content) =>
        content.startsWith('ListName')
      );
      expect(list).toHaveLength(lists.length);
    });

    it('should update page title when reaching the component', async () => {
      vi.mocked(ListService).getListsByType.mockResolvedValue(
        filteredByToDoLists
      );

      router.replace({
        path: '/',
        query: { type: constants.listType.toDoList },
      });
      await router.isReady();

      const { queryAllByText, getByText } = renderComponent();

      await flushPromises();

      getByText('title: To do lists');
      getByText(filteredByToDoLists[0].name);

      const editListButtons = queryAllByText('edit');
      expect(editListButtons.length).toBe(filteredByToDoLists.length);
    });

    it('should update page title when change the filter', async () => {
      vi.mocked(ListService).getListsByType.mockResolvedValue(
        filteredByToDoLists
      );

      router.push({ path: '/' });
      await router.isReady();

      const { getByText } = renderComponent();

      vi.mocked(ListService).getListsByType.mockResolvedValue(
        filteredByWishLists
      );

      router.replace({
        path: '/',
        query: { type: constants.listType.whishlist },
      });
      await router.isReady();

      await flushPromises();

      getByText('title: Whishlists');
      getByText(filteredByWishLists[0].name);

      expect(ListService.getListsByType).toHaveBeenCalledWith(
        constants.user.anonymous,
        constants.listType.whishlist
      );
    });
  });

  describe('Navigation', () => {
    let routerSpy: SpyInstance;

    beforeEach(() => {
      vi.mocked(ListService).getListsByType.mockResolvedValue(lists);

      routerSpy = vi.spyOn(router, 'push');
      routerSpy.mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
      routerSpy.mockRestore();
    });

    it('should navigate to items details route', async () => {
      const firstList = lists[0];
      const route =
        constants.routes[firstList.type as keyof typeof constants.routes];
      const routeName = route?.name ?? constants.routes.listItems.name;

      const { getByText } = renderComponent();

      await flushPromises();

      await waitFor(() => getByText(firstList.name));

      await fireEvent.click(getByText(firstList.name));

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
        name: constants.routes.list.name,
        params: { id: firstList.id },
      });
    });

    it('should navigate to list creation page', async () => {
      vi.mocked(ListService).getListsByType.mockResolvedValue([]);

      router.replace({
        path: constants.routes.lists.path,
      });
      await router.isReady();

      const { findByText } = renderComponent();

      const createButton = await findByText('Create');
      await fireEvent.click(createButton);

      expect(routerSpy).toHaveBeenCalledWith({
        path: '/list/new',
      });
    });

    it('should navigate to list creation page with filtered list type', async () => {
      router.replace({
        path: '/',
        query: { type: constants.listType.note },
      });
      await router.isReady();

      const { getByText } = renderComponent();

      await fireEvent.click(getByText('Create'));

      expect(routerSpy).toHaveBeenCalledWith({
        path: '/list/new',
        query: { type: constants.listType.note },
      });
    });
  });

  describe('List Management', () => {
    async function triggerDeleteForFirstItem(): Promise<RenderResult> {
      const firstList = lists[0];

      vi.mocked(ListService).getListsByType.mockResolvedValue([firstList]);

      const renderResult = renderComponent();

      const { getByTestId, findByText, getByText } = renderResult;

      await waitFor(() => getByTestId(firstList.id));

      const deleteButton = within(getByTestId(firstList.id)).getByRole(
        'button',
        {
          name: 'delete',
        }
      );
      await fireEvent.click(deleteButton);

      await findByText(`Are you sure to delete list '${firstList.name}'`);

      await fireEvent.click(getByText('Yes'));

      return renderResult;
    }

    it('should delete a list entry', async () => {
      vi.mocked(ListService).deleteListById.mockImplementationOnce(() => {
        return Promise.resolve();
      });

      const { emitted } = await triggerDeleteForFirstItem();

      await flushPromises();

      expect(emitted()).toHaveProperty(constants.events.showToast);
    });

    it('should emit a show error event when error deleting item', async () => {
      vi.mocked(ListService).deleteListById.mockImplementationOnce(() => {
        throw new Error('Error updating lists');
      });

      const { emitted } = await triggerDeleteForFirstItem();

      await flushPromises();

      expect(emitted()).toHaveProperty(constants.events.showError);
    });
  });
});
