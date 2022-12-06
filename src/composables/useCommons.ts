import { Auditable } from '@/models/models';

import { useUser } from './useUser';

export function setAuditableValues(auditable: Auditable) {
  auditable.modifiedAt = Date.now();
  auditable.changedBy = useUser().getCurrentUserId();
}
