import { Listable, ObjectData } from '@/models/models';
import constants from '@/util/constants';

export default abstract class ListableObject implements Listable {
  id!: string;
  type!: string;
  subtype!: string;
  name!: string;
  description!: string;

  readonly isShared = false;
  owner!: string;

  actionIcon = constants.itemActionIcon.edit;
  canBeDeleted = true;
  priority = 0;

  changedBy = '';
  modifiedAt = 0;

  sharedWith: Array<string> = [];

  constructor(listableData: ObjectData) {
    Object.assign(this, listableData);
  }
}
