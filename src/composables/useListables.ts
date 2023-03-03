/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { useUser } from '@/composables/useUser';
import List from '@/models/list';
import { ListType, Listable, INote, ListableData } from '@/models/models';
import Note from '@/models/note';
import ListService from '@/services/ListService';
import constants from '@/util/constants';
import { Ref, ref } from 'vue';
import { setAuditableValues, sortByPriorityAndName } from './useCommons';

const isLoadingLists = ref(false);
const currentLists: Ref<Array<Listable>> = ref([]);

export function useListables() {
  const { getCurrentUserId } = useUser();

  const createNewListable = (): Listable =>
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

  const saveListable = async (list: Listable): Promise<Listable> => {
    if (!list.id) {
      return saveNewListable(list);
    } else {
      return saveUpdateListable(list);
    }
  };

  const saveNewListable = async (candidate: Listable): Promise<Listable> => {
    let listable: Listable;

    const listableData: ListableData = {
      name: candidate.name,
      description: candidate.description,
      type: candidate.type,
      subtype: candidate.subtype,
      sharedWith: candidate.sharedWith,
      owner: getCurrentUserId(),
    };

    if (candidate.type === constants.listType.note) {
      listable = new Note(listableData);
    } else {
      listable = new List(listableData);
    }

    setAuditableValues(listable);

    const newListId = await ListService.saveListable(
      getCurrentUserId(),
      listable
    );
    listable.id = newListId ?? '';
    return listable;
  };

  const saveUpdateListable = async (listable: Listable): Promise<Listable> => {
    setAuditableValues(listable);

    await ListService.saveListable(getCurrentUserId(), listable);

    return listable;
  };

  const saveNoteContent = async (note: INote) => {
    setAuditableValues(note);

    return ListService.saveNoteContent(note);
  };

  return {
    createNewListable,
    isLoadingLists,
    getCurrentLists,
    loadListablesByType,
    getListById,
    deleteListById,
    updateListsPriorities,
    saveListable,
    saveNoteContent,
  };
}
