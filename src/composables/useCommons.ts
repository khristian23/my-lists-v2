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
