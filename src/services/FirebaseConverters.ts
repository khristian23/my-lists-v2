import {
  DocumentData,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import List from '@/models/list';
import constants from '@/util/constants';
import ListItem from '@/models/listItem';
import User from '@/models/user';

export class UserConverter implements FirestoreDataConverter<User> {
  toFirestore(user: PartialWithFieldValue<User>): DocumentData {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): User {
    const data = snapshot.data();

    return new User({
      id: snapshot.id,
      name: data.name,
      email: data.email,
      photoURL: data.photoURL,
    });
  }
}

export class ListConverter implements FirestoreDataConverter<List> {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  toFirestore(list: PartialWithFieldValue<List>): DocumentData {
    const userPriorities: { [k: string]: number } = {};
    userPriorities[this.userId] = list.priority as number;

    return {
      id: list.id,
      name: list.name,
      description: list.description,
      type: list.type,
      subtype: list.subtype ?? '',
      priority: list.priority,
      owner: this.userId,
      sharedWith: list.sharedWith ?? [],
      userPriorities,
    };
  }

  toFirestoreUpdate(list: PartialWithFieldValue<List>): DocumentData {
    return {
      name: list.name,
      description: list.description,
      type: list.type,
      subtype: list.subtype ?? '',
      changedBy: list.changedBy,
      modifiedAt: list.modifiedAt,
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): List {
    const data = snapshot.data();

    return new List({
      id: snapshot.id,
      name: data.name,
      description: data.description,
      type: data.type,
      subtype: data.subtype,
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
  constructor(private userId: string, private listId: string) {}

  toFirestore(listItem: PartialWithFieldValue<ListItem>): DocumentData {
    const userPriorities: { [k: string]: number } = {};
    userPriorities[this.userId] = listItem.priority as number;

    return {
      name: listItem.name,
      description: listItem.notes,
      userPriorities,
      owner: this.userId,
      changedBy: listItem.changedBy,
      modifiedAt: listItem.modifiedAt,
      status: listItem.status,
    };
  }

  toFirestoreUpdate(listItem: PartialWithFieldValue<ListItem>): DocumentData {
    return {
      name: listItem.name,
      notes: listItem.notes ?? '',
      status: listItem.status,
      changedBy: listItem.changedBy,
      modifiedAt: listItem.modifiedAt,
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): ListItem {
    const data = snapshot.data();

    return new ListItem({
      id: snapshot.id,
      name: data.name,
      notes: data.description,
      status: data.status,
      priority:
        data.userPriorities?.[this.userId] ?? constants.lists.priority.lowest,
      owner: data.owner,
      changedBy: data.changedBy,
      modifiedAt: data.modifiedAt,
      listId: this.listId,
    });
  }
}
