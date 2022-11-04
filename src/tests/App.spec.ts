import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/vue';
import App from '@/App.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAuthentication } from '@/composables/useAuthentication';

const mockUseAuthentication = {
  startListeningForFirebaseChanges: vi.fn(),
  checkForRedirectAfterAuthentication: vi.fn(),
};

vi.mock('@/composables/useAuthentication', () => ({
  useAuthentication: () => mockUseAuthentication,
}));

describe('Main App Initialization', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderApp() {
    render(App, {
      global: {
        stubs: {
          'router-view': true,
        },
      },
    });
  }

  it('should trigger user login', () => {
    renderApp();

    expect(
      mockUseAuthentication.startListeningForFirebaseChanges
    ).toHaveBeenCalledOnce();
  });

  it('should check for user authentication redirect', () => {
    renderApp();

    expect(
      mockUseAuthentication.checkForRedirectAfterAuthentication
    ).toHaveBeenCalledOnce();
  });
});
