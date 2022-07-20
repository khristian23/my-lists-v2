import constants from 'src/util/constants';
import { Ref } from 'vue';

export type ActionIcon = keyof typeof constants.itemActionIcon;

export interface BaseItem {
  id: string;
  name: string;
  description?: string;
}

export interface ManageableItem extends BaseItem {
  actionIcon?: string;
  canBeDeleted?: boolean;
  numberOfItems?: number;
  priority?: number;
}

export interface UserData {
  name?: string;
  photoURL?: string;
  email?: string;
}

export interface ListData extends BaseItem {
  type: string;
}

export interface GlobalComposableReturnValue {
  title: Ref<string>;
  setTitle: (value: string) => void;
  displayHeaderBackButton: Ref<boolean>;
}
