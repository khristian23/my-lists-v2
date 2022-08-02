import { firebaseStore, firebaseStorage } from '@/boot/firebase';
import List from '@/models/list';
import { ListType } from '@/models/models';
import { list } from 'postcss';

export default {
  async getListsByType(
    userId: string,
    type: ListType | undefined
  ): Promise<Array<List>> {
    const results: Array<List> = [];
    const ownerArgs = ['owner', '==', userId];
    const sharedArgs = ['sharedWith', 'array-contains', userId];

    async function loadListsFromFirebaseDocuments(listDocs, options) {
      for (const firebaseList of listDocs) {
        const firebaseListData = firebaseList.data();
        const list = new List(firebaseListData);
        list.id = firebaseList.id;
        list.isShared = list.owner !== userId;
        list.priority = firebaseListData.userPriorities
          ? firebaseListData.userPriorities[userId]
          : 0;

        const items = await listsCollection
          .doc(list.id)
          .collection('items')
          .get();
        for (const item of items.docs) {
          const firebaseItemData = item.data();
          const listItem = new ListItem(firebaseItemData);
          listItem.id = item.id;
          listItem.listId = list.id;
          listItem.isShared = item.owner !== userId;
          listItem.priority = firebaseItemData.userPriorities
            ? firebaseItemData.userPriorities[userId]
            : 0;
          list.addListItem(listItem);
        }
        results.push(list);
      }
    }

    const listsCollection = firebaseStore.collection('lists');
    const listsRef = await listsCollection.where(...ownerArgs).get();
    const sharedListsRef = await listsCollection.where(...sharedArgs).get();

    await loadListsFromFirebaseDocuments(listsRef.docs, ownerArgs);
    await loadListsFromFirebaseDocuments(sharedListsRef.docs, sharedArgs);

    return results;
  },

  populateList(firebaseData): List {},

  async getListById(userId: string, listId: string): Promise<List> | null {
    const listsCollection = firebaseStore.collection('lists');
    const listDocument = await listsCollection.doc(listId).get();
    if (listDocument.exists) {
      const listData = listDocument.data();
      if (listData.owner === userId || listData.sharedWith.contains(userId)) {
        return populateList(listData);
      }
    }
    return null;
  },

  async deleteListById(userId: string, listId: string): Promise<void> {
    try {
      const listRef = firebaseStore.collection('lists').doc(listId);
      const items = await listRef
        .collection('items')
        .where('owner', '==', userId)
        .get();

      for (const item of items.docs) {
        await item.ref.delete();
      }

      return listRef.delete();
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async updateListsPriorities(
    userId: string,
    lists: Array<List>
  ): Promise<void> {
    return Promise.all(
      lists.map((list) => {
        const listRef = firebaseStore.collection('lists').doc(list.id);

        return this.updateObjectPriotity(userId, listRef, list);
      })
    );
  },

  async updateObjectPriotity(userId, objectRef, object): Promise<void> {
    const firebaseObjectUpdate = {};
    firebaseObjectUpdate.changedBy = object.changedBy;
    firebaseObjectUpdate.modifiedAt = object.modifiedAt;
    firebaseObjectUpdate[`userPriorities.${userId}`] = object.priority;

    try {
      return objectRef.update(firebaseObjectUpdate);
    } catch (e) {
      throw new Error(e.message);
    }
  },
};
