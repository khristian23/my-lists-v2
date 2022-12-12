import {
  DocumentData,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import List from '@/models/list';
import constants from '@/util/constants';
import ListItem from '@/models/listItem';

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
      id: snapshot.id,
      name: data.name,
      type: data.type,
      description: data.description,
      priority:
        data.userPriorities?.[this.userId] ?? constants.lists.priority.lowest,
      isShared: data.sharedWith?.includes(this.userId) ?? false,
      owner: data.owner,
      changedBy: data.changedBy,
      modifiedAt: data.modifiedAt,
    });
  }
}

export class ListItemConverter implements FirestoreDataConverter<ListItem> {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  toFirestore(listItem: PartialWithFieldValue<ListItem>): DocumentData {
    const userPriorities: { [k: string]: number } = {};
    userPriorities[this.userId] = listItem.priority as number;

    return {
      id: listItem.id,
      name: listItem.name,
      description: listItem.notes,
      userPriorities,
      owner: this.userId,
      changedBy: listItem.changedBy,
      modifiedAt: listItem.modifiedAt,
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): ListItem {
    const data = snapshot.data();

    return new ListItem({
      id: snapshot.id,
      name: data.name,
      description: data.description,
      priority:
        data.userPriorities?.[this.userId] ?? constants.lists.priority.lowest,
      owner: data.owner,
      changedBy: data.changedBy,
      modifiedAt: data.modifiedAt,
    });
  }
}
