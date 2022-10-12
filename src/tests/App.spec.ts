import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/vue';
import App from '@/App.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAuthentication } from '@/composables/useAuthentication';

const mockUseAuthentication = {
  startListeningForFirebaseChanges: vi.fn(),
};

vi.mock('@/composables/useAuthentication', () => ({
  useAuthentication: () => mockUseAuthentication,
}));

describe('Main App Initialization', () => {
  it('should trigger user login', () => {
    render(App, {
      global: {
        stubs: {
          'router-view': true,
        },
      },
    });

    expect(
      mockUseAuthentication.startListeningForFirebaseChanges
    ).toHaveBeenCalledOnce();
  });
});
