import {
  cleanup,
  fireEvent,
  render,
  RenderResult,
  waitFor,
  within,
} from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { Quasar } from 'quasar';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Router } from 'vue-router';
import TheList from '@/components/TheList.vue';
import TheQuickItemCreate from '@/components/TheQuickItemCreate.vue';
import vuedraggable from 'vuedraggable';
import { createRouterForRoutes } from './helpers/router';
import constants from '@/util/constants';
import ListItem from '@/models/listItem';
import List from '@/models/list';
import flushPromises from 'flush-promises';
import ListService from '@/services/ListService';
import { IListItem } from '@/models/models';

let router: Router;

const FAKE_LIST_ID = 'ListId';
const FAKE_LIST_NAME = 'List with items';
const PENDING_LIST = 'pendingList';
const DONE_LIST = 'doneList';
const PENDING_ITEM_ID = 'PendingId';
const DONE_ITEM_ID = 'DoneId';

vi.mock('@/services/ListService');

describe('List Items page', () => {
  beforeEach(async () => {
    mockListWithItems();

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

    vi.resetAllMocks();
  });

  function renderListItems(): RenderResult {
    return render(MainLayoutTest, {
      global: {
        plugins: [Quasar, router],
        components: {
          TheList,
          TheQuickItemCreate,
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

  function mockListWithItems(): void {
    vi.mocked(ListService).getListableById.mockResolvedValue(
      new List({
        id: FAKE_LIST_ID,
        name: FAKE_LIST_NAME,
        type: constants.listType.toDoList,
      })
    );
    vi.mocked(ListService).getListItemsByListId.mockResolvedValue([
      new ListItem({
        id: 'PendingId',
        name: 'Pending Item',
        status: constants.itemStatus.pending,
        priority: constants.lists.priority.lowest,
      }),
      new ListItem({
        id: 'DoneId',
        name: 'Done Item',
        status: constants.itemStatus.done,
      }),
    ]);
  }

  it('should render the component', async () => {
    const { getByText } = renderListItems();

    await flushPromises();

    getByText(`title: ${FAKE_LIST_NAME}`);
    getByText('Pending');
    getByText('Pending Item');
    getByText('Done');
    getByText('Done Item');
  });

  it('should navigate to lists if no list id is found', async () => {
    vi.mocked(ListService).getListableById.mockImplementation(() => {
      throw new Error('List not found');
    });

    const replaceSpy = vi.spyOn(router, 'replace');

    const { emitted } = renderListItems();

    await flushPromises();

    expect(replaceSpy).toHaveBeenCalledWith({
      name: constants.routes.lists.name,
    });

    expect(emitted()).toHaveProperty(constants.events.showError);
  });

  it('should navigate to item details', async () => {
    const spy = vi.spyOn(router, 'push');

    const { getByTestId } = renderListItems();

    await flushPromises();

    const itemPressButton = within(getByTestId(PENDING_ITEM_ID)).getByText(
      'Pending Item'
    );
    await fireEvent.click(itemPressButton);

    expect(spy).toHaveBeenCalledWith({
      name: constants.routes.listItem.name,
      params: { id: PENDING_ITEM_ID, list: FAKE_LIST_ID },
    });
  });

  it('should navigate to list item page', async () => {
    const spy = vi.spyOn(router, 'push');

    const { getByText } = renderListItems();

    await fireEvent.click(getByText('Create'));

    expect(spy).toHaveBeenCalledWith({
      name: constants.routes.listItem.name,
      params: { list: FAKE_LIST_ID, id: 'new' },
    });
  });

  it('should set item to done', async () => {
    const { getByTestId } = renderListItems();

    await flushPromises();

    within(getByTestId(PENDING_LIST)).getByText('Pending Item');

    const setToDoneButton = within(getByTestId(PENDING_ITEM_ID)).getByRole(
      'button',
      {
        name: 'action',
      }
    );
    await fireEvent.click(setToDoneButton);

    await waitFor(() => {
      within(getByTestId(DONE_LIST)).getByText('Pending Item');
    });
  });

  it('should set item to pending', async () => {
    const { getByTestId } = renderListItems();

    await flushPromises();

    within(getByTestId(DONE_LIST)).getByText('Done Item');

    const setToPendingButton = within(getByTestId(DONE_ITEM_ID)).getByRole(
      'button',
      {
        name: 'action',
      }
    );
    await fireEvent.click(setToPendingButton);

    await waitFor(() => {
      within(getByTestId(PENDING_LIST)).getByText('Done Item');
    });
  });

  it('should not change status of item if error occurs', async () => {
    vi.mocked(ListService).setListItemStatus.mockImplementation(() => {
      throw new Error('Unable to update list item status');
    });

    const { getByTestId, emitted } = renderListItems();

    await flushPromises();

    const setToDoneButton = within(getByTestId(PENDING_ITEM_ID)).getByRole(
      'button',
      {
        name: 'action',
      }
    );
    await fireEvent.click(setToDoneButton);

    within(getByTestId(PENDING_LIST)).getByTestId(PENDING_ITEM_ID);

    await flushPromises();
    expect(emitted()).toHaveProperty(constants.events.showError);
  });

  it('should delete the item', async () => {
    const spy = vi.spyOn(ListService, 'deleteListItem');

    const { getAllByRole, getByTestId } = renderListItems();

    await flushPromises();

    const deleteButton = within(getByTestId(PENDING_ITEM_ID)).getByRole(
      'button',
      {
        name: 'delete',
      }
    );
    await fireEvent.click(deleteButton);

    const actionButtons = getAllByRole('button', { name: 'action' });
    expect(actionButtons.length).toBe(1);
    expect(spy).toHaveBeenCalledWith(FAKE_LIST_ID, PENDING_ITEM_ID);
  });

  it('should not delete item if error occurs', async () => {
    vi.mocked(ListService).deleteListItem.mockImplementation(() => {
      throw new Error('Unable to delete list item');
    });

    const { getByTestId, emitted } = renderListItems();

    await flushPromises();

    const deleteButton = within(getByTestId(PENDING_ITEM_ID)).getByRole(
      'button',
      {
        name: 'delete',
      }
    );
    await fireEvent.click(deleteButton);

    within(getByTestId(PENDING_LIST)).getByTestId(PENDING_ITEM_ID);

    await flushPromises();
    expect(emitted()).toHaveProperty(constants.events.showError);
  });

  it('should trigger creation of quick item', async () => {
    const spy = vi.spyOn(ListService, 'saveListItem');

    const { getByPlaceholderText, getByTestId } = renderListItems();

    await flushPromises();

    const quickCreateInput = getByPlaceholderText('Quick create');

    const itemName = 'New Item Name';
    await userEvent.type(quickCreateInput, `${itemName}{enter}`);

    expect((quickCreateInput as HTMLInputElement).value).toBe('');

    within(getByTestId(PENDING_LIST)).getByText(itemName);

    expect(spy).toHaveBeenCalled();
  });

  it('should not quick create item if error occurs', async () => {
    vi.mocked(ListService).saveListItem.mockImplementation(() => {
      throw new Error('Unable to create list item');
    });

    const { getByPlaceholderText, queryByText, emitted } = renderListItems();

    await flushPromises();

    const quickCreateInput = getByPlaceholderText('Quick create');

    const itemNameNotSaved = 'New Item Name not added';
    await userEvent.type(quickCreateInput, `${itemNameNotSaved}{enter}`);

    expect(queryByText(itemNameNotSaved)).toBeFalsy();
    expect(emitted()).toHaveProperty(constants.events.showError);
  });

  it('should add created items to the bottom of the pending list', async () => {
    const newItemId = 'newItemId';
    vi.mocked(ListService).saveListItem.mockImplementation(
      (userId: string, listItem: IListItem) => {
        listItem.id = newItemId;
        return Promise.resolve();
      }
    );
    const { container, getByPlaceholderText } = renderListItems();

    await flushPromises();

    const quickCreateInput = getByPlaceholderText('Quick create');

    const itemName = 'Test Item Name';
    await userEvent.type(quickCreateInput, `${itemName}{enter}`);

    const items = container.getElementsByClassName('item-text');
    expect(items[0].textContent).toBe('Pending Item');
    expect(items[1].textContent).toBe(itemName);
  });

  describe('checklist', () => {
    beforeEach(() => {
      vi.mocked(ListService).getListableById.mockResolvedValue(
        new List({
          id: FAKE_LIST_ID,
          name: FAKE_LIST_NAME,
          type: constants.listType.checklist,
        })
      );
    });

    it('should show checkboxes in checklist items', async () => {
      const { getByTestId } = renderListItems();

      await waitFor(() => {
        within(getByTestId(PENDING_ITEM_ID)).getByText(
          constants.itemActionIcon.unchecked
        );
      });
    });

    it('should not show the pending items title', async () => {
      const { getByTestId } = renderListItems();

      expect(
        within(getByTestId('pendingList')).queryAllByText(/Pending$/).length
      ).toBe(0);
    });

    it('should not show the done items list', async () => {
      const { queryAllByTestId } = renderListItems();

      expect(queryAllByTestId('doneList').length).toBe(0);
    });

    it('should not remove items from checklist when action button is clicked', async () => {
      const { getByTestId } = renderListItems();

      getByTestId(PENDING_ITEM_ID);
      getByTestId(DONE_ITEM_ID);

      const checkPendingItemButton = within(
        getByTestId(PENDING_ITEM_ID)
      ).getByRole('button', {
        name: 'action',
      });
      await fireEvent.click(checkPendingItemButton);

      getByTestId(PENDING_ITEM_ID);
      getByTestId(DONE_ITEM_ID);
    });

    it('should change to checked icon on list item status change', async () => {
      const { getByTestId } = renderListItems();

      await flushPromises();

      within(getByTestId(PENDING_ITEM_ID)).getByText(
        constants.itemActionIcon.unchecked
      );

      const uncheckedItem = within(getByTestId(PENDING_ITEM_ID)).getByRole(
        'button',
        {
          name: 'action',
        }
      );
      await fireEvent.click(uncheckedItem);

      await waitFor(() => {
        within(getByTestId(PENDING_ITEM_ID)).getByText(
          constants.itemActionIcon.checked
        );
      });
    });

    it('should change to unchecked icon on list item status change', async () => {
      const { getByTestId } = renderListItems();

      await flushPromises();

      within(getByTestId(DONE_ITEM_ID)).getByText(
        constants.itemActionIcon.checked
      );

      const checkedItem = within(getByTestId(DONE_ITEM_ID)).getByRole(
        'button',
        {
          name: 'action',
        }
      );
      await fireEvent.click(checkedItem);

      await waitFor(() => {
        within(getByTestId(DONE_ITEM_ID)).getByText(
          constants.itemActionIcon.unchecked
        );
      });
    });
  });
});
