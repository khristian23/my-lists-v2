import { describe, it, expect } from 'vitest';
import { useUser } from '@/composables/useUser';
import Constants from '@/util/constants';

describe('User Composable', () => {
  it('should provide an anonymous user', () => {
    const { user } = useUser();

    expect(user.value.isAnonymous).toBe(true);
    expect(user.value.name).toBe(Constants.user.anonymous);
  });
});
