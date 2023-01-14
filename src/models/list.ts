import {
  BaseItem,
  IList,
  IListItem,
  ObjectData,
  Sortable,
} from '@/models/models';
import constants from '@/util/constants';
import ListableObject from './listableObject';

type SortableItem = Sortable & BaseItem;

function sortByPriority(a: SortableItem, b: SortableItem) {
  if (a.priority != undefined && a.priority === b.priority) {
    return a.name?.localeCompare(b.name);
  }
  return (a.priority ?? 0) - (b.priority ?? 0);
}

export default class List extends ListableObject implements IList {
  numberOfItems = 0;
  items: Array<IListItem> = [];

  constructor(listData: ObjectData) {
    super(listData);
    Object.assign(this, listData);
  }

  get pendingItems() {
    return this.items
      .filter(({ status }) => status === constants.itemStatus.pending)
      .sort(sortByPriority);
  }

  get doneItems() {
    return this.items
      .filter(({ status }) => status === constants.itemStatus.done)
      .sort(sortByPriority);
  }

  get hasPendingItems() {
    return !!this.pendingItems.length;
  }

  get hasDoneItems() {
    return !!this.doneItems.length;
  }
}
