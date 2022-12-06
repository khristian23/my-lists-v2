import constants from '@/util/constants';
import { Ref } from 'vue';
import ListItem from './listItem';

export type ActionIcon = keyof typeof constants.itemActionIcon;

export type ListType =
  | typeof constants.listType.checklist
  | typeof constants.listType.toDoList
  | typeof constants.listType.whishlist
  | typeof constants.listType.note
  | typeof constants.listType.shoppingCart;

export type ListItemStatus =
  | typeof constants.itemStatus.done
  | typeof constants.itemStatus.pending;

export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  priority?: number;
}

export interface ManageableItem extends BaseItem {
  actionIcon: string;
  canBeDeleted: boolean;
  priority: number;
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

export interface ListData extends BaseItem, Auditable {
  type: ListType;
  isShared: boolean;
}

export interface ListItemData extends BaseItem, Auditable {
  status: string;
  notes: string;
  listId: string;
}

export interface GlobalComposableReturnValue {
  title: Ref<string>;
  setTitle: (value: string) => void;
  displayHeaderBackButton: Ref<boolean>;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;

  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  prompt(): Promise<void>;
}
