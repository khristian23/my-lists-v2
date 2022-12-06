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
import TheList from '@/components/TheList.vue';
import TheConfirmation from '@/components/TheConfirmation.vue';
import Consts from '@/util/constants';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Router } from 'vue-router';
import { generateLists } from '../helpers/TestHelpers';
import { createRouterForRoutes } from './helpers/router';
import { ListsComposableReturnValue, useLists } from '@/composables/useLists';
import vuedraggable from 'vuedraggable';
import flushPromises from 'flush-promises';
vi.mock('@/composables/useLists');

const noop = () => undefined;
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

let router: Router;

const MAX_NUMBER_OF_LISTS = 20;
const lists = generateLists(MAX_NUMBER_OF_LISTS);

interface SetupData {
  customLists: Array<List>;
  mockedRouteQuery: string;
  mockedDeleteListReturn: () => Promise<void>;
}

function renderComponent(setupData?: Partial<SetupData>): RenderResult {
  vi.mocked(useLists).mockReturnValue({
    isLoadingLists: ref(false),
    getListsByType: () => Promise.resolve(setupData?.customLists ?? lists),
    deleteListById: setupData?.mockedDeleteListReturn ?? vi.fn(),
  } as unknown as ListsComposableReturnValue);

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
    router = createRouterForRoutes([{ name: Consts.routes.lists.name }]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('General Lists rendering', () => {
    beforeEach(async () => {
      router.push({ name: Consts.routes.lists.name });
      await router.isReady();
    });

    it('should render the page with All Lists title', async () => {
      const { getByText, findByText } = renderComponent();
      await waitFor(() => expect(getByText('ListName2')).toBeTruthy());
      expect(findByText('title: All lists')).toBeTruthy();
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
    const filterByType = Consts.listType.toDoList;
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
        query: { type: Consts.listType.shoppingCart },
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
      const route = Consts.routes[firstList.type as keyof typeof Consts.routes];
      const routeName = route?.name ?? Consts.routes.listItems.name;

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
        name: Consts.routes.list.name,
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
        name: Consts.routes.list.name,
        params: { id: 'new' },
      });
    });
  });

  describe('List Management', () => {
    async function triggerDeleteForFirstItem(
      mockedDeleteListReturn: () => Promise<void>
    ): Promise<RenderResult> {
      const firstList = lists[0];
      const renderResult = renderComponent({
        customLists: [firstList],
        mockedDeleteListReturn,
      });

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
      const mockedDeleteListReturn = vi.fn().mockResolvedValue(true);

      const { emitted } = await triggerDeleteForFirstItem(
        mockedDeleteListReturn
      );

      await flushPromises();

      expect(emitted()).toHaveProperty(Consts.events.showToast);
    });

    it('should emit a show error event when error deleting item', async () => {
      const mockedDeleteListReturn = vi
        .fn()
        .mockRejectedValue(new Error('Error updating lists'));

      const { emitted } = await triggerDeleteForFirstItem(
        mockedDeleteListReturn
      );

      await flushPromises();

      expect(emitted()).toHaveProperty(Consts.events.showError);
    });
  });
});
