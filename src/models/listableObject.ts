import { Listable, ListableData } from '@/models/models';
import constants from '@/util/constants';

export default abstract class ListableObject implements Listable {
  id!: string;
  type!: string;
  subtype!: string;
  name = '';
  description = '';

  readonly isShared = false;
  owner!: string;

  actionIcon = constants.itemActionIcon.edit;
  canBeDeleted = true;
  priority = 0;

  changedBy = '';
  modifiedAt = 0;

  sharedWith: Array<string> = [];

  constructor(listableData: ListableData) {
    Object.assign(this, listableData);
  }
}
