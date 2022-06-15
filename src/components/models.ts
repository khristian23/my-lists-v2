export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface BaseItem {
  id: string;
  name: string;
}

export interface ManageableItem extends BaseItem {
  priority: number;
  numberOfItems: number;
  canBeDeleted: boolean;
}
