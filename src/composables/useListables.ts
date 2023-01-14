/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { useUser } from '@/composables/useUser';
import List from '@/models/list';
import { IList, ListType, Listable, INote } from '@/models/models';
import ListService from '@/services/ListService';
import constants from '@/util/constants';
import { ref } from 'vue';
import { setAuditableValues } from './useCommons';

const isLoadingLists = ref(false);

export function useListables() {
  const { getCurrentUserId } = useUser();

  const createNewList = (): Listable =>
    new List({
      type: constants.listType.toDoList,
    });

  const getListablesByType = async (
    type: ListType | undefined
  ): Promise<Array<Listable>> => {
    isLoadingLists.value = true;

    const userId = getCurrentUserId();
    const lists = await ListService.getListablesByType(userId, type);

    isLoadingLists.value = false;

    return lists;
  };

  const getListById = (listId: string): Promise<Listable> => {
    const userId = getCurrentUserId();
    return ListService.getListableById(userId, listId);
  };

  const deleteListById = (listId: string): Promise<void> => {
    return ListService.deleteListById(listId).catch(() => {
      throw new Error('Error deleting list by id ' + listId);
    });
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
    getListsByType: getListablesByType,
    getListById,
    deleteListById,
    updateListsPriorities,
    saveList,
    saveNoteContent,
  };
}
