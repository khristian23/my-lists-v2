/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  collection,
  where,
  WhereFilterOp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from '@/boot/firebase';
import List from '@/models/list';
import { Auditable, BaseItem, ListType, Sortable } from '@/models/models';
import { ListConverter, ListItemConverter } from './FirebaseConverters';
import ListItem from '@/models/listItem';
import constants from '@/util/constants';

type Prioritizable = BaseItem & Sortable & Auditable;

export default {
  async getListsByType(
    userId: string,
    type: ListType | undefined
  ): Promise<Array<List>> {
    console.error('before query kists with user: ', userId);
    type firebaseWhereArgs = [string, WhereFilterOp, unknown];

    const ownerArgs: firebaseWhereArgs = ['owner', '==', userId];
    const sharedArgs: firebaseWhereArgs = [
      'sharedWith',
      'array-contains',
      userId,
    ];
    const typeArgs: firebaseWhereArgs = ['type', '==', type];

    const listsCollection = collection(firestore, 'lists').withConverter(
      new ListConverter(userId)
    );

    const ownedListWhere = [where(...ownerArgs)];
    const sharedListWhere = [where(...sharedArgs)];

    if (type) {
      ownedListWhere.push(where(...typeArgs));
      sharedListWhere.push(where(...typeArgs));
    }

    const ownedListsQuery = query(listsCollection, ...ownedListWhere);
    const sharedListsQuery = query(listsCollection, ...sharedListWhere);

    const ownedListsSnapshots = await getDocs(ownedListsQuery);
    const sharedListsSnapshots = await getDocs(sharedListsQuery);

    return ownedListsSnapshots.docs
      .concat(sharedListsSnapshots.docs)
      .map((snapshot) => snapshot.data());
  },

  async getListById(userId: string, listId: string): Promise<List> {
    const listReference = doc(firestore, 'lists', listId).withConverter(
      new ListConverter(userId)
    );
    const listSnapshot = await getDoc(listReference);
    if (listSnapshot.exists()) {
      const list = listSnapshot.data();
      if (list.owner === userId || list.isShared) {
        return list;
      } else {
        throw new Error('No permissions to read list');
      }
    } else {
      throw new Error('List not found');
    }
  },

  async getListItemById(
    userId: string,
    listId: string,
    listItemId: string
  ): Promise<ListItem> {
    const listItemReference = doc(
      firestore,
      `lists/${listId}/items/${listItemId}`
    ).withConverter(new ListItemConverter(userId));

    const listItemSnapshot = await getDoc(listItemReference);
    if (listItemSnapshot.exists()) {
      return listItemSnapshot.data();
    } else {
      throw new Error('List Item not found');
    }
  },

  async getListItemsByListId(
    userId: string,
    listId: string
  ): Promise<Array<ListItem>> {
    const listItemsCollection = collection(
      firestore,
      `lists/${listId}/items`
    ).withConverter(new ListItemConverter(userId));

    const listItemsQuery = query(listItemsCollection);

    const listItemsSnapshots = await getDocs(listItemsQuery);

    return listItemsSnapshots.docs.map((snapshot) => snapshot.data());
  },

  async deleteListById(listId: string): Promise<void> {
    const listsCollection = collection(firestore, `lists/${listId}/items`);

    const itemsSnapshots = await getDocs(listsCollection);

    return Promise.all(
      itemsSnapshots.docs.map((itemSnapshot) => {
        return deleteDoc(itemSnapshot.ref);
      })
    ).then(() => {
      return deleteDoc(doc(firestore, `lists/${listId}`));
    });
  },

  async updateListObjectPriorities(
    userId: string,
    listObjects: Array<Prioritizable>,
    referenceBuilder: (object: Prioritizable) => string
  ) {
    return Promise.all(
      listObjects.map((object) => {
        const listReference = doc(firestore, referenceBuilder(object));

        const objectUpdate: { [k: string]: string | number } = {
          changedBy: object.changedBy,
          modifiedAt: object.modifiedAt,
        };
        objectUpdate[`userPriorities.${userId}`] =
          object.priority ?? constants.lists.priority.lowest;

        return updateDoc(listReference, objectUpdate);
      })
    ).catch((error) => {
      throw new Error(error.message);
    });
  },

  async updateListsPriorities(
    userId: string,
    lists: Array<List>
  ): Promise<void[]> {
    return this.updateListObjectPriorities(
      userId,
      lists,
      ({ id }) => `lists/${id}`
    );
  },

  async updateListItemsPriorities(
    userId: string,
    listId: string,
    listItems: Array<ListItem>
  ): Promise<void[]> {
    return this.updateListObjectPriorities(
      userId,
      listItems,
      ({ id }) => `lists/${listId}/items/${id}`
    );
  },

  async setListItemStatus(listItem: ListItem, status: string): Promise<void> {
    const objectUpdate: { [k: string]: string | number } = {
      changedBy: listItem.changedBy,
      modifiedAt: listItem.modifiedAt,
      status: status,
    };

    const listItemReference = doc(
      firestore,
      `lists/${listItem.listId}/items/${listItem.id}`
    );

    return updateDoc(listItemReference, objectUpdate);
  },

  async deleteListItem(listId: string, listItemId: string): Promise<void> {
    return deleteDoc(doc(firestore, `lists/${listId}/items/${listItemId}`));
  },

  async saveListItem(userId: string, listItem: ListItem): Promise<void> {
    if (!listItem.listId) {
      throw new Error('List item must have be part of a list');
    }

    if (listItem.id) {
      const itemReference = doc(
        firestore,
        `lists/${listItem.listId}/items/${listItem.id}`
      );

      return updateDoc(itemReference, {
        name: listItem.name,
        description: listItem.notes,
        status: listItem.status,
      });
    } else {
      const createdItemRef = doc(
        collection(firestore, `lists/${listItem.listId}/items`)
      ).withConverter(new ListItemConverter(userId));

      await setDoc(createdItemRef, listItem);

      listItem.id = createdItemRef.id;
    }
  },
};
