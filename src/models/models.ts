import Consts from '@/util/constants';
import { Ref } from 'vue';

export type ActionIcon = keyof typeof Consts.itemActionIcon;

export type ListType =
  | typeof Consts.listType.checklist
  | typeof Consts.listType.toDoList
  | typeof Consts.listType.whishlist
  | typeof Consts.listType.note
  | typeof Consts.listType.shoppingCart;

export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  priority?: number;
}

export interface ManageableItem extends BaseItem {
  actionIcon: string;
  canBeDeleted: boolean;
  numberOfItems: number;
  priority: number;
}

export interface UserData {
  id: string;
  name?: string;
  photoURL?: string;
  email?: string;
}

export interface ListData extends BaseItem {
  type: ListType;
  isShared: boolean;
  owner: string;
}

export interface Auditable {
  changedBy: string;
  modifiedAt: string;
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
