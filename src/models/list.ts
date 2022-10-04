import { ListData, ManageableItem, Auditable } from '@/models/models';
import Consts from '@/util/constants';

export default class List implements ManageableItem, Auditable {
  id!: string;
  type!: string;
  name!: string;
  description!: string;

  isShared = false;
  owner!: string;

  actionIcon = Consts.itemActionIcon.edit;
  canBeDeleted = true;
  numberOfItems = 0;
  priority = 0;

  changedBy = '';
  modifiedAt = '';

  constructor(listData: Partial<ListData>) {
    Object.assign(this, listData);
  }
}
