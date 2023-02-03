import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import {
  cleanup,
  createEvent,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/vue';
import ThePWAInstall from '@/components/ThePWAInstall.vue';
import { Quasar } from 'quasar';
import { BeforeInstallPromptEvent } from '@/models/models';
import flushPromises from 'flush-promises';

const bannerHeader = 'Install?';

class LocalStorage {
  private values: { [key: string]: string | boolean } = {};

  set(key: string, value: string | boolean) {
    this.values[key] = value;
  }

  getBool(key: string) {
    return this.values[key] === 'true';
  }
}

let localStorage: LocalStorage;

vi.mock('@/composables/useCommons', () => ({
  getStorageBoolean: (key: string) => localStorage.getBool(key),
  setStorageValue: (key: string, value: string) => localStorage.set(key, value),
}));

describe('The PWA Install', () => {
  function renderPWA(installable = true) {
    cleanup();
    vi.restoreAllMocks();

    const result = render(ThePWAInstall, {
      global: {
        plugins: [Quasar],
      },
    });

    if (installable) {
      mockBeforeInstallPromptWindowsEvent();
    }

    return result;
  }

  function mockBeforeInstallPromptWindowsEvent() {
    const event = createEvent('beforeinstallprompt', window);

    Object.assign(event, {
      prompt: vi.fn(),
      userChoice: { outcome: 'accepted', platform: '' },
    });

    fireEvent(window, event as BeforeInstallPromptEvent);
  }

  beforeEach(() => {
    localStorage = new LocalStorage();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should show the banner is App is installable', async () => {
    const { getByText } = renderPWA();

    await waitFor(() => getByText(bannerHeader));
  });

  it('should not show Banner is App is not installable', async () => {
    const installable = false;

    const { queryAllByText } = renderPWA(installable);

    await flushPromises();

    expect(queryAllByText(bannerHeader).length).toBe(0);
  });

  it('should not show Banner after App is installed', async () => {
    const { getByRole, getByText, queryAllByText } = renderPWA();

    await waitFor(() => getByText(bannerHeader));

    const installButton = getByRole('button', { name: 'Yes' });

    await fireEvent.click(installButton);

    expect(queryAllByText(bannerHeader).length).toBe(0);

    renderPWA();

    expect(queryAllByText(bannerHeader).length).toBe(0);
  });

  it('should not show Banner if user plans for a Later install', async () => {
    const { getByText, getByRole, queryAllByText } = renderPWA();

    await waitFor(() => getByText(bannerHeader));

    const laterButton = getByRole('button', { name: 'Later' });

    await fireEvent.click(laterButton);

    expect(queryAllByText(bannerHeader).length).toBe(0);

    renderPWA();

    await waitFor(() => getByText(bannerHeader));
  });

  it('should no longer show Banner if user never want to install', async () => {
    const { getByRole, getByText, queryAllByText } = renderPWA();

    await waitFor(() => getByText(bannerHeader));

    const installButton = getByRole('button', { name: 'Never' });

    await fireEvent.click(installButton);

    expect(queryAllByText(bannerHeader).length).toBe(0);

    renderPWA();

    expect(queryAllByText(bannerHeader).length).toBe(0);
  });
});
