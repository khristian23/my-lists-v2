import {
  DocumentData,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import List from '@/models/list';
import constants from '@/util/constants';
import ListItem from '@/models/listItem';
import Note from '@/models/note';
import User from '@/models/user';
import { IList, INote, IListItem, Listable } from '@/models/models';

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

export class ListableConverter implements FirestoreDataConverter<Listable> {
  protected userId: string;
  private noteConverter = new NoteConverter();
  private listConverter = new ListConverter();

  constructor(userId: string) {
    this.userId = userId;
  }

  toFirestore(listable: PartialWithFieldValue<Listable>): DocumentData {
    const userPriorities: { [k: string]: number } = {};
    userPriorities[this.userId] = listable.priority as number;

    if (listable.isFavorite) {
      listable.favorites = [this.userId];
    }

    const firestoreData = {
      name: listable.name,
      description: listable.description,
      type: listable.type,
      subtype: listable.subtype ?? '',
      priority: listable.priority,
      owner: this.userId,
      sharedWith: listable.sharedWith ?? [],
      favorites: listable.favorites ?? [],
      userPriorities,
    };

    if (listable.type === constants.listType.note) {
      return this.noteConverter.toFirestore(listable, firestoreData);
    }

    return this.listConverter.toFirestore(listable, firestoreData);
  }

  toFirestoreUpdate(listable: PartialWithFieldValue<Listable>): DocumentData {
    const firestoreData = {
      name: listable.name,
      description: listable.description,
      type: listable.type,
      subtype: listable.subtype ?? '',
      changedBy: listable.changedBy,
      modifiedAt: listable.modifiedAt,
    };

    if (listable.type === constants.listType.note) {
      return this.noteConverter.toFirestoreUpdate(listable, firestoreData);
    }
    return this.listConverter.toFirestoreUpdate(listable, firestoreData);
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): Listable {
    const data = snapshot.data();

    const listableData = {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      type: data.type,
      subtype: data.subtype,
      priority:
        data.userPriorities?.[this.userId] ?? constants.lists.priority.lowest,
      isShared: data.sharedWith?.includes(this.userId) ?? false,
      isFavorite: data.favorites?.includes(this.userId) ?? false,
      owner: data.owner,
      changedBy: data.changedBy,
      modifiedAt: data.modifiedAt,
    };

    if (data.type === constants.listType.note) {
      return this.noteConverter.fromFirestore(data, listableData);
    }

    return this.listConverter.fromFirestore(data, listableData);
  }
}

class ListConverter {
  toFirestore(
    listable: PartialWithFieldValue<Listable>,
    firestoreData: DocumentData
  ): DocumentData {
    firestoreData.keepDoneItems = (listable as IList).keepDoneItems;
    return firestoreData;
  }

  toFirestoreUpdate(
    listable: PartialWithFieldValue<Listable>,
    firestoreData: DocumentData
  ): DocumentData {
    firestoreData.keepDoneItems = (listable as IList).keepDoneItems;
    return firestoreData;
  }

  fromFirestore(
    firestoreData: DocumentData,
    listableData: DocumentData
  ): IList {
    listableData.keepDoneItems = firestoreData.keepDoneItems ?? true;

    return new List(listableData);
  }
}

class NoteConverter {
  toFirestore(
    listable: PartialWithFieldValue<Listable>,
    firestoreData: DocumentData
  ): DocumentData {
    firestoreData.noteContent = (listable as INote).noteContent;
    return firestoreData;
  }

  toFirestoreUpdate(
    listable: PartialWithFieldValue<Listable>,
    firestoreData: DocumentData
  ): DocumentData {
    firestoreData.noteContent = (listable as INote).noteContent;
    return firestoreData;
  }

  fromFirestore(
    firestoreData: DocumentData,
    listableData: DocumentData
  ): INote {
    listableData.noteContent = firestoreData.noteContent;

    return new Note(listableData);
  }
}

export class ListItemConverter implements FirestoreDataConverter<IListItem> {
  constructor(private userId: string, private listId: string) {}

  toFirestore(listItem: PartialWithFieldValue<IListItem>): DocumentData {
    const userPriorities: { [k: string]: number } = {};
    userPriorities[this.userId] = listItem.priority as number;

    return {
      name: listItem.name,
      notes: listItem.notes,
      userPriorities,
      owner: this.userId,
      changedBy: listItem.changedBy,
      modifiedAt: listItem.modifiedAt,
      status: listItem.status,
    };
  }

  toFirestoreUpdate(listItem: PartialWithFieldValue<IListItem>): DocumentData {
    return {
      name: listItem.name,
      notes: listItem.notes ?? '',
      status: listItem.status,
      changedBy: listItem.changedBy,
      modifiedAt: listItem.modifiedAt,
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): IListItem {
    const data = snapshot.data();

    return new ListItem({
      id: snapshot.id,
      name: data.name,
      notes: data.notes,
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
