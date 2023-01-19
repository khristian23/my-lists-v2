/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { useUser } from '@/composables/useUser';
import List from '@/models/list';
import { IList, ListType, Listable, INote } from '@/models/models';
import ListService from '@/services/ListService';
import constants from '@/util/constants';
import { Ref, ref } from 'vue';
import { setAuditableValues, sortByPriorityAndName } from './useCommons';

const isLoadingLists = ref(false);
const currentLists: Ref<Array<Listable>> = ref([]);

export function useListables() {
  const { getCurrentUserId } = useUser();

  const createNewList = (): Listable =>
    new List({
      type: constants.listType.toDoList,
    });

  const loadListablesByType = async (
    type: ListType | undefined
  ): Promise<void> => {
    isLoadingLists.value = true;

    const userId = getCurrentUserId();
    currentLists.value = await ListService.getListablesByType(userId, type);
    currentLists.value.sort(sortByPriorityAndName);

    isLoadingLists.value = false;
  };

  const getCurrentLists = (): Ref<Array<Listable>> => {
    return currentLists;
  };

  const getListById = (listId: string): Promise<Listable> => {
    const userId = getCurrentUserId();
    return ListService.getListableById(userId, listId);
  };

  const deleteListById = async (listId: string): Promise<void> => {
    try {
      await ListService.deleteListById(listId);

      const deletedListIndex = currentLists.value.findIndex(
        ({ id }) => id === listId
      );
      currentLists.value.splice(deletedListIndex, 1);
    } catch (e: unknown) {
      if ((e as Error).message === 'Missing or insufficient permissions.') {
        throw new Error('List cannot be deleted as it is a shared list');
      }

      throw new Error('Error deleting list by id ' + listId);
    }
  };

  const updateListsPriorities = (lists: Array<Listable>): Promise<void[]> => {
    const userId = getCurrentUserId();

    lists.forEach((list) => setAuditableValues(list));

    return ListService.updateListsPriorities(userId, lists).catch(() => {
      throw new Error('Error updating lists priorities');
    });
  };

  const saveList = async (list: IList) => {
    setAuditableValues(list);

    const userId = getCurrentUserId();
    if (!list.id) {
      list.owner = userId;
    }

    return ListService.saveList(userId, list);
  };

  const saveNoteContent = async (note: INote) => {
    setAuditableValues(note);

    return ListService.saveNoteContent(note);
  };

  return {
    createNewList,
    isLoadingLists,
    getCurrentLists,
    loadListablesByType,
    getListById,
    deleteListById,
    updateListsPriorities,
    saveList,
    saveNoteContent,
  };
}
