import { ListData, ManageableItem, Auditable } from '@/models/models';
import Consts from '@/util/constants';

export default class List implements ManageableItem, Auditable {
  id: string;
  type: string;
  name: string;
  description: string;

  actionIcon = Consts.itemActionIcon.edit;
  canBeDeleted = true;
  numberOfItems = 0;
  priority = 0;

  isShared = false;
  owner: string;

  changedBy = '';
  modifiedAt = '';

  constructor(listData: ListData) {
    this.id = listData.id;
    this.type = listData.type;
    this.name = listData.name;
    this.description = listData.description ?? '';
    this.isShared = listData.isShared;
    this.owner = listData.owner;
  }
}
