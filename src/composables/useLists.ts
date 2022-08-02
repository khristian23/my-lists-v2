import { useUser } from '@/composables/useUser';
import List from '@/models/list';
import { ListType } from '@/models/models';
import ListService from '@/services/ListService';
import { ref, Ref } from 'vue';

const isLoadingLists = ref(false);

export interface ListsComposableReturnValue {
  isLoadingLists: Ref<boolean>;
  getListsByType: (type?: ListType | undefined) => Promise<Array<List>>;
  getListById: (id: string) => Promise<List> | null;
  deleteListById: (listId: string) => Promise<void>;
  updateListsPriorities: (lists: Array<List>) => Promise<void>;
}

export function useLists(): ListsComposableReturnValue {
  const { getCurrentUserId } = useUser();

  const getListsByType = async (
    type: ListType | undefined
  ): Promise<Array<List>> => {
    isLoadingLists.value = true;

    const userId = getCurrentUserId();
    const lists = await ListService.getListsByType(userId, type);

    isLoadingLists.value = false;

    return lists;
  };

  const getListById = (listId: string): Promise<List> | null => {
    const userId = getCurrentUserId();
    return ListService.getListById(userId, listId);
  };

  const deleteListById = (listId: string): Promise<void> => {
    const userId = getCurrentUserId();
    return ListService.deleteListById(userId, listId).catch(() => {
      throw new Error('Error deleting list by id ' + listId);
    });
  };

  const updateListsPriorities = (lists: Array<List>): Promise<void> => {
    const userId = getCurrentUserId();
    return ListService.updateListsPriorities(userId, lists).catch(() => {
      throw new Error('Error updating lists priorities');
    });
  };

  return {
    isLoadingLists,
    getListsByType,
    getListById,
    deleteListById,
    updateListsPriorities,
  };
}
