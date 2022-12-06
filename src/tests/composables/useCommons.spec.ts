import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setAuditableValues } from '@/composables/useCommons';
import { Auditable } from '@/models/models';

const FAKE_USER_ID = 'UserId';

vi.mock('@/composables/useUser', () => ({
  useUser: vi.fn(() => ({
    getCurrentUserId: () => FAKE_USER_ID,
  })),
}));

describe('Use Commons', () => {
  const mockDate = new Date();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Common Funcions', () => {
    const auditableObject: Auditable = {
      changedBy: '',
      modifiedAt: 0,
      owner: '',
    };

    setAuditableValues(auditableObject);

    expect(auditableObject.modifiedAt).toBe(mockDate.getTime());
    expect(auditableObject.changedBy).toBe(FAKE_USER_ID);
  });
});
