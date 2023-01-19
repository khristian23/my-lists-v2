import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setAuditableValues,
  sortByPriorityAndName,
} from '@/composables/useCommons';
import { Auditable, Sortable } from '@/models/models';
import List from '@/models/list';

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

  it('should sort the lists by priority and name', async () => {
    const sortables: Array<Sortable> = [
      new List({ id: 'ListItem1', priority: 4, name: 'List 4' }),
      new List({ id: 'ListItem2', priority: 5, name: 'List 5' }),
      new List({ id: 'ListItem3', priority: 2, name: 'List B2' }),
      new List({ id: 'ListItem4', priority: 10, name: 'List 10' }),
      new List({ id: 'ListItem5', priority: 1, name: 'List 1' }),
      new List({ id: 'ListItem6', priority: 2, name: 'List B1' }),
    ];

    const sortedLists = sortables.sort(sortByPriorityAndName);

    expect(sortedLists[0].id).toBe('ListItem5');
    expect(sortedLists[1].id).toBe('ListItem6');
    expect(sortedLists[2].id).toBe('ListItem3');
    expect(sortedLists[3].id).toBe('ListItem1');
    expect(sortedLists[4].id).toBe('ListItem2');
    expect(sortedLists[5].id).toBe('ListItem4');
  });
});
