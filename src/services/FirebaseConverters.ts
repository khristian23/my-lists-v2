import {
  DocumentData,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import List from '@/models/list';
import constants from '@/util/constants';

export class ListConverter implements FirestoreDataConverter<List> {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  toFirestore(list: PartialWithFieldValue<List>): DocumentData {
    return {
      id: list.id,
      name: list.name,
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): List {
    const data = snapshot.data();

    return new List({
      id: data.id,
      name: data.name,
      type: data.type,
      description: data.description,
      priority:
        data.userPriorities?.[this.userId] ?? constants.lists.priority.lowest,
      isShared: data.sharedWith?.includes(this.userId) ?? false,
      owner: data.owner,
    });
  }
}
