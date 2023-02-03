import { Auditable, Sortable } from '@/models/models';

import { useUser } from './useUser';

export function setAuditableValues(auditable: Auditable) {
  auditable.modifiedAt = Date.now();
  auditable.changedBy = useUser().getCurrentUserId();
}

export function sortByPriorityAndName(a: Sortable, b: Sortable) {
  if (a.priority !== undefined && a.priority === b.priority) {
    return a.name?.localeCompare(b.name);
  }
  return (a.priority ?? 0) - (b.priority ?? 0);
}

export function getStorageBoolean(itemName: string): boolean {
  return window.localStorage.getItem(itemName) === 'true';
}

export function setStorageValue(itemName: string, value: string | boolean) {
  window.localStorage.setItem(itemName, value.toString());
}
