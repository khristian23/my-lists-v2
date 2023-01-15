import ListItem from '@/models/listItem';
import ListService from '@/services/ListService';
import constants from '@/util/constants';
import { useUser } from './useUser';
import { setAuditableValues } from './useCommons';
import { ListItemStatus, IList, IListItem } from '@/models/models';
import List from '@/models/list';
import { Ref, ref } from 'vue';

const emptyList = new List({});
const currentList: Ref<IList> = ref(emptyList);

export function useListItems() {
  const userId = useUser().getCurrentUserId();

  const getCurrentListWithItems = () => {
    return currentList;
  };

  const loadListWithItems = async (listId: string) => {
    const [list, listItems] = await Promise.all([
      ListService.getListableById(userId, listId),
      ListService.getListItemsByListId(userId, listId),
    ]);

    currentList.value = list as IList;
    listItems.forEach((item) => (item.parentListType = list.type));
    currentList.value.items = listItems;
  };

  const getListItemFromCache = (listId: string, listItemId: string) => {
    if (listId === currentList.value.id) {
      return currentList.value.items.find(({ id }) => id === listItemId);
    }
  };

  const getListItemById = (
    listId: string,
    listItemId: string
  ): Promise<IListItem> => {
    return ListService.getListItemById(userId, listId, listItemId);
  };

  const getListItem = async (
    listId: string,
    listItemId: string
  ): Promise<IListItem> => {
    let listItem = getListItemFromCache(listId, listItemId);

    if (!listItem) {
      listItem = await getListItemById(listId, listItemId);

      if (!listItem) {
        throw new Error('List Item not found');
      }
    }

    return listItem;
  };

  const setItemStatus = async (
    listId: string,
    listItemId: string,
    status: ListItemStatus
  ) => {
    const listItem = await getListItem(listId, listItemId);

    setAuditableValues(listItem);

    const previousStatus = listItem.status;
    listItem.status = status;
    try {
      await ListService.setListItemStatus(listItem, status);
    } catch (e: unknown) {
      listItem.status = previousStatus;
      throw new Error((e as Error).message);
    }
  };

  const toggleItemStatus = async (
    listId: string,
    listItemId: string
  ): Promise<void> => {
    const listItem = await getListItem(listId, listItemId);

    if (listItem.status === constants.itemStatus.done) {
      return setItemStatus(listId, listItemId, constants.itemStatus.pending);
    } else {
      return setItemStatus(listId, listItemId, constants.itemStatus.done);
    }
  };

  const deleteListItem = async (listId: string, listItemId: string) => {
    await ListService.deleteListItem(listId, listItemId);

    if (currentList.value.id === listId) {
      const listItemIndex = currentList.value.items.findIndex(
        ({ id }) => id === listItemId
      );

      if (listItemIndex >= 0) {
        currentList.value.items.splice(listItemIndex, 1);
      }
    }
  };

  const getNewItemPriority = () => {
    const numberOfPendingItems = currentList.value.pendingItems.length;
    if (numberOfPendingItems > 0) {
      const lowestPriorityItem =
        currentList.value.pendingItems[numberOfPendingItems - 1];
      return (lowestPriorityItem.priority ?? 0) + 1;
    } else {
      return constants.lists.priority.highest;
    }
  };

  const quickCreateListItem = async (listId: string, name: string) => {
    if (currentList.value.id === listId) {
      const listItem = new ListItem({
        name: name,
        status: constants.itemStatus.pending,
        listId: listId,
        priority: getNewItemPriority(),
      });

      setAuditableValues(listItem);

      await ListService.saveListItem(userId, listItem);
      currentList.value.items.push(listItem);
    }
  };

  const updateItemsOrder = async (
    listId: string,
    listItems: Array<IListItem>
  ) => {
    listItems.forEach((item) => {
      setAuditableValues(item);

      const cachedListItem = getListItemFromCache(listId, item.id);
      if (cachedListItem) {
        cachedListItem.priority = item.priority;
      }
    });

    return ListService.updateListItemsPriorities(
      userId,
      listId,
      listItems
    ).catch(() => {
      throw new Error('Error updating list items priorities');
    });
  };

  const saveListItem = async (listItem: IListItem) => {
    setAuditableValues(listItem);

    return ListService.saveListItem(userId, listItem);
  };

  return {
    getCurrentListWithItems,
    getListItemById,
    loadListWithItems,
    toggleItemStatus,
    deleteListItem,
    quickCreateListItem,
    updateItemsOrder,
    saveListItem,
  };
}
