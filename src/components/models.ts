import constants from 'src/util/constants';

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
