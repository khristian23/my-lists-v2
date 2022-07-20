import List from '@/models/list';
import { ref, toRefs, Ref } from 'vue';

const isLoadingLists = ref(false);

export interface ListsComposableReturnValue {
  isLoadingLists: Ref<boolean>;
  getListsByType: (type?: string) => Promise<Array<List>>;
  getListById: (id: string) => List | undefined;
  deleteList: (listId: string) => boolean;
  updateListsOrder: (lists: Array<List>) => boolean;
}

export function useLists(): ListsComposableReturnValue {
  const listsToRender = () => {
    return store.validLists
      .filter(({ type }) => {
        if (this.filterBy) {
          return type === this.filterBy;
        }
        return true;
      })
      .map((list) => {
        const renderList = list.toObject();
        if (renderList.type === this.$Const.listTypes.note) {
          renderList.numberOfItems = undefined;
        } else {
          renderList.numberOfItems = list.listItems.filter(
            (item) => item.status === this.$Const.itemStatus.pending
          ).length;
        }
        renderList.actionIcon = list.isShared ? 'share' : 'edit';
        renderList.canBeDeleted = !list.isShared;
        return renderList;
      });
  };

  const getListById = (listId: string): List | undefined => {
    return store.validLists.find((list) => list.id === listId);
  };

  return {
    isLoadingLists,
    getListsByType: () => true,
    getListById,
    deleteList: (listId: string) => true,
    updateListsOrder: (lists: Array<List>) => true,
  };
}
