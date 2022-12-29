import {
  ListData,
  ManageableItem,
  Auditable,
  ParentObject,
  Shareable,
} from '@/models/models';
import constants from '@/util/constants';
import Consts from '@/util/constants';
import ListItem from './listItem';
import User from './user';

function sortByPriority(a: ListItem, b: ListItem) {
  if (a.priority === b.priority) {
    return a.name?.localeCompare(b.name);
  }
  return a.priority - b.priority;
}

export default class List
  implements ManageableItem, Auditable, ParentObject, Shareable
{
  id!: string;
  type!: string;
  subtype!: string;
  name!: string;
  description!: string;

  readonly isShared = false;
  owner!: string;

  actionIcon = Consts.itemActionIcon.edit;
  canBeDeleted = true;
  priority = 0;

  changedBy = '';
  modifiedAt = 0;

  numberOfItems = 0;
  items: Array<ListItem> = [];

  sharedWith: Array<string> = [];

  constructor(listData: Partial<ListData>) {
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
