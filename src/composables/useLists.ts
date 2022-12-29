/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { useUser } from '@/composables/useUser';
import List from '@/models/list';
import { ListType } from '@/models/models';
import ListService from '@/services/ListService';
import constants from '@/util/constants';
import { ref } from 'vue';
import { setAuditableValues } from './useCommons';

const isLoadingLists = ref(false);

export function useLists() {
  const { getCurrentUserId } = useUser();

  const createNewList = () =>
    new List({
      type: constants.listType.toDoList,
    });

  const getListsByType = async (
    type: ListType | undefined
  ): Promise<Array<List>> => {
    isLoadingLists.value = true;

    const userId = getCurrentUserId();
    const lists = await ListService.getListsByType(userId, type);

    isLoadingLists.value = false;

    return lists;
  };

  const getListById = (listId: string): Promise<List> => {
    const userId = getCurrentUserId();
    return ListService.getListById(userId, listId);
  };

  const deleteListById = (listId: string): Promise<void> => {
    return ListService.deleteListById(listId).catch(() => {
      throw new Error('Error deleting list by id ' + listId);
    });
  };

  const updateListsPriorities = (lists: Array<List>): Promise<void[]> => {
    const userId = getCurrentUserId();

    lists.forEach((list) => setAuditableValues(list));

    return ListService.updateListsPriorities(userId, lists).catch(() => {
      throw new Error('Error updating lists priorities');
    });
  };

  const saveList = async (list: List) => {
    setAuditableValues(list);

    const userId = getCurrentUserId();
    if (!list.id) {
      list.owner = userId;
    }

    return ListService.saveList(userId, list);
  };

  return {
    createNewList,
    isLoadingLists,
    getListsByType,
    getListById,
    deleteListById,
    updateListsPriorities,
    saveList,
  };
}
