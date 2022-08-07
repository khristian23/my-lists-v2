import {
  DocumentData,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import List from '@/models/list';

export class ListConverter implements FirestoreDataConverter<List> {
  userId: string;

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
      priority: data.userPriorities ? data.userPriorities[this.userId] : 0,
      isShared: data.sharedWith.contains(this.userId),
      owner: data.owner,
    });
  }
}
