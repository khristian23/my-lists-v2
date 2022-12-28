import constants from '@/util/constants';
import { Ref } from 'vue';
import ListItem from './listItem';
import User from './user';

export type ActionIcon = keyof typeof constants.itemActionIcon;

export type ListType =
  | typeof constants.listType.checklist
  | typeof constants.listType.toDoList
  | typeof constants.listType.whishlist
  | typeof constants.listType.note
  | typeof constants.listType.shoppingCart;

export type ListSubType =
  | typeof constants.listSubType.personal
  | typeof constants.listSubType.work
  | typeof constants.listSubType.groceries
  | typeof constants.listSubType.house;

export type ListItemStatus =
  | typeof constants.itemStatus.done
  | typeof constants.itemStatus.pending;

export interface BaseItem {
  id: string;
  name: string;
  description?: string;
}

export interface Sortable {
  priority?: number;
}

export interface ManageableItem extends BaseItem, Sortable {
  actionIcon: string;
  canBeDeleted: boolean;
}

export interface ParentObject {
  numberOfItems: number;
  items: Array<ListItem>;
}

export interface UserData {
  id: string;
  name?: string;
  photoURL?: string;
  email?: string;
  location?: string;
}

export interface Auditable {
  owner: string;
  changedBy: string;
  modifiedAt: number;
}

export interface Shareable {
  sharedWith: Array<User>;
}

export interface ListData extends BaseItem, Sortable, Auditable, Shareable {
  type: ListType;
  subtype: ListSubType;
  isShared: boolean;
}

export interface ListItemData extends BaseItem, Sortable, Auditable {
  status: string;
  notes: string;
  listId: string;
}

export interface GlobalComposableReturnValue {
  title: Ref<string>;
  setTitle: (value: string) => void;
  displayHeaderBackButton: Ref<boolean>;
}

export interface ListSubTypeOption {
  value: string;
  label: string;
}

export interface ListTypeOption {
  type: string;
  value: string;
  label: string;
  icon: string;
  subTypes: Array<ListSubTypeOption>;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;

  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  prompt(): Promise<void>;
}
