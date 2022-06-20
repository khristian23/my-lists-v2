export interface BaseItem {
  id: string;
  name: string;
}

export interface ManageableItem extends BaseItem {
  priority: number;
  numberOfItems: number;
  canBeDeleted: boolean;
  actionIcon: string;
}

export interface List extends ManageableItem {
  description: string;
}
