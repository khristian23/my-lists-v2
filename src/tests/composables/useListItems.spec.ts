import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useListItems } from '@/composables/useListItems';
import User from '@/models/user';
import ListService from '@/services/ListService';
vi.mock('@/services/ListService');

import { useUser } from '@/composables/useUser';
import constants from '@/util/constants';
import ListItem from '@/models/listItem';
import List from '@/models/list';
import { IListItem } from '@/models/models';
const { setCurrentUser } = useUser();

const FAKE_USER_ID = 'UserId';
const FAKE_LIST_ID = 'ListId';
const FAKE_LIST_ITEM_ID_1 = 'ListItemId1';
const FAKE_LIST_ITEM_ID_2 = 'ListItemId2';
const FAKE_LIST_ITEM_ID_3 = 'ListItemId3';
const FAKE_LIST_ITEM_ID_4 = 'ListItemId4';

const mockListItems: Array<ListItem> = [
  new ListItem({
    id: FAKE_LIST_ITEM_ID_1,
    status: constants.itemStatus.pending,
    listId: FAKE_LIST_ID,
    priority: 1,
  }),
  new ListItem({
    id: FAKE_LIST_ITEM_ID_3,
    status: constants.itemStatus.pending,
    listId: FAKE_LIST_ID,
    priority: 2,
  }),
  new ListItem({
    id: FAKE_LIST_ITEM_ID_4,
    status: constants.itemStatus.pending,
    listId: FAKE_LIST_ID,
    priority: 3,
  }),
  new ListItem({
    id: FAKE_LIST_ITEM_ID_2,
    status: constants.itemStatus.done,
    listId: FAKE_LIST_ID,
  }),
];

describe('List Items', () => {
  const mockDate = new Date(2000, 12, 1, 16);

  beforeEach(() => {
    setCurrentUser(new User({ id: FAKE_USER_ID }));

    vi.mocked(ListService).getListItemsByListId.mockResolvedValue([
      ...mockListItems,
    ]);
    vi.mocked(ListService).getListableById.mockResolvedValue(
      new List({
        id: FAKE_LIST_ID,
        name: 'Mocked List',
      })
    );

    vi.useFakeTimers();

    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.resetAllMocks();

    vi.useRealTimers();
  });

  it('should get list with items', async () => {
    const { getCurrentListWithItems, loadListWithItems } = useListItems();

    const list = getCurrentListWithItems();
    await loadListWithItems(FAKE_LIST_ID);

    expect(list.value.name).toBe('Mocked List');
    expect(list.value.items.length).toBe(4);
    expect(list.value.items[0].id).toBe(FAKE_LIST_ITEM_ID_1);
  });

  it('should set item to done', async () => {
    const spy = vi.spyOn(ListService, 'setListItemStatus');

    const { getCurrentListWithItems, loadListWithItems, toggleItemStatus } =
      useListItems();

    const list = getCurrentListWithItems();
    await loadListWithItems(FAKE_LIST_ID);

    const pendingItem = list.value.pendingItems[0];
    await toggleItemStatus(list.value.id, pendingItem.id);

    expect(spy.mock.calls[0][0].status).toBe(constants.itemStatus.done);
    expect(spy.mock.calls[0][0].changedBy).toBe(FAKE_USER_ID);
    expect(spy.mock.calls[0][0].changedBy).toBe(FAKE_USER_ID);
    expect(spy.mock.calls[0][0].modifiedAt).toBe(mockDate.getTime());

    expect(pendingItem.status).toBe(constants.itemStatus.done);
  });

  it('should set item to pending', async () => {
    const spy = vi.spyOn(ListService, 'setListItemStatus');

    const { getCurrentListWithItems, loadListWithItems, toggleItemStatus } =
      useListItems();

    const list = getCurrentListWithItems();
    await loadListWithItems(FAKE_LIST_ID);

    const doneItem = list.value.doneItems[0];
    await toggleItemStatus(list.value.id, doneItem.id);

    expect(spy.mock.calls[0][0].status).toBe(constants.itemStatus.pending);
    expect(spy.mock.calls[0][0].changedBy).toBe(FAKE_USER_ID);
    expect(spy.mock.calls[0][0].changedBy).toBe(FAKE_USER_ID);
    expect(spy.mock.calls[0][0].modifiedAt).toBe(mockDate.getTime());

    expect(doneItem.status).toBe(constants.itemStatus.pending);
  });

  it('should throw an exception on change status error', async () => {
    vi.mocked(ListService).setListItemStatus.mockImplementationOnce(() => {
      throw new Error('Change status error');
    });

    const { loadListWithItems, toggleItemStatus } = useListItems();

    await loadListWithItems(FAKE_LIST_ID);

    await expect(
      toggleItemStatus(FAKE_LIST_ID, FAKE_LIST_ITEM_ID_1)
    ).rejects.toThrow('Change status error');
  });

  it('should delete an item', async () => {
    const spy = vi.spyOn(ListService, 'deleteListItem');

    const { getCurrentListWithItems, loadListWithItems, deleteListItem } =
      useListItems();

    const list = getCurrentListWithItems();
    await loadListWithItems(FAKE_LIST_ID);

    const numberOfItems = list.value.items.length;

    await deleteListItem(list.value.id, FAKE_LIST_ITEM_ID_1);

    expect(spy).toBeCalledWith(FAKE_LIST_ID, FAKE_LIST_ITEM_ID_1);
    expect(list.value.items.length).toBe(numberOfItems - 1);
  });

  it('should save an item', async () => {
    const newItemId = 'newItemId';
    const spy = vi
      .spyOn(ListService, 'saveListItem')
      .mockImplementation((userId: string, listItem: IListItem) => {
        listItem.id = newItemId;
        return Promise.resolve();
      });

    const { loadListWithItems, quickCreateListItem } = useListItems();

    await loadListWithItems(FAKE_LIST_ID);

    const itemName = 'Test Item Name';
    await quickCreateListItem(FAKE_LIST_ID, itemName);

    const expectedListItem = new ListItem({
      id: newItemId,
      name: itemName,
      listId: FAKE_LIST_ID,
      status: constants.itemStatus.pending,
      modifiedAt: new Date().getTime(),
      changedBy: FAKE_USER_ID,
      priority: 4,
    });

    expect(spy).toBeCalledWith(FAKE_USER_ID, expectedListItem);
  });

  it('should update the priority of items', async () => {
    const spy = vi
      .spyOn(ListService, 'updateListItemsPriorities')
      .mockImplementation(() => Promise.resolve([]));

    const { updateItemsOrder, loadListWithItems, getCurrentListWithItems } =
      useListItems();

    await loadListWithItems(FAKE_LIST_ID);

    const currentList = getCurrentListWithItems();

    const getCurrentListItemById = (itemId: string) => {
      return currentList.value.items.find(({ id }) => id === itemId);
    };

    expect(getCurrentListItemById(FAKE_LIST_ITEM_ID_1)?.priority).toBe(1);

    const newListItems = [
      new ListItem({ id: FAKE_LIST_ITEM_ID_4, priority: 1 }),
      new ListItem({ id: FAKE_LIST_ITEM_ID_1, priority: 3 }),
    ];

    await updateItemsOrder(FAKE_LIST_ID, newListItems);

    expect(getCurrentListItemById(FAKE_LIST_ITEM_ID_1)?.priority).toBe(3);
    expect(getCurrentListItemById(FAKE_LIST_ITEM_ID_4)?.priority).toBe(1);

    expect(spy).toHaveBeenCalled();
  });
});
