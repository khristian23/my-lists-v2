import constants from '@/util/constants';

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

export function isListType(candidate: string | null): candidate is ListType {
  return Object.values(constants.listType).includes(candidate ?? '');
}

export interface ObjectData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [field: string]: any;
}

export interface UserData {
  id: string;
  name?: string;
  photoURL?: string;
  email?: string;
  location?: string;
}

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
  items: Array<IListItem>;
}

export interface Auditable {
  owner: string;
  changedBy: string;
  modifiedAt: number;
}

export interface Shareable {
  sharedWith: Array<string>;
  isShared: boolean;
}

export interface Listable extends ManageableItem, Auditable, Shareable {
  type: ListType;
  subtype: ListSubType;
}

export interface ListableItem extends ManageableItem, Auditable {
  status: string;
  notes: string;
  listId: string;
}

export interface IList extends Listable, ParentObject {
  pendingItems: Array<IListItem>;
  hasPendingItems: boolean;
  doneItems: Array<IListItem>;
  hasDoneItems: boolean;
}

export interface IListItem extends ListableItem {
  parentListType: ListType;
}

export interface INote extends Listable {
  noteContent: string;
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
