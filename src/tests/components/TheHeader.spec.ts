import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  RenderResult,
  fireEvent,
  cleanup,
} from '@testing-library/vue';
import { Quasar } from 'quasar';
import TheHeader from '@/components/TheHeader.vue';
import User from '@/models/user';
import { GlobalComposableReturnValue } from '@/models/models';
import { ref } from 'vue';

import useUser from '@/composables/useUser';
vi.mock('@/composables/useUser');

import { useGlobals } from '@/composables/useGlobals';
vi.mock('@/composables/useGlobals');

describe('The header', () => {
  function renderTheHeader(): RenderResult {
    return render(TheHeader, {
      global: {
        plugins: [Quasar],
      },
    });
  }

  function mockUser(user: User): void {
    (useUser as any).mockReturnValue({
      user: ref<User>(user),
    });
  }

  function mockGlobalValue(
    globalValues: Partial<GlobalComposableReturnValue>
  ): void {
    (useGlobals as any).mockReturnValue(globalValues);
  }

  afterEach(() => cleanup());

  it('should render the header', () => {
    mockUser(new User({}));
    mockGlobalValue({ title: ref(''), displayHeaderBackButton: ref(false) });

    const container = renderTheHeader();

    expect(container).toBeTruthy();
  });

  it('should render a menu button triggering event', async () => {
    const { emitted } = renderTheHeader();

    const menuButton = screen.getByRole('button', { name: 'Menu' });

    expect(menuButton).toBeTruthy();

    await fireEvent.click(menuButton);

    expect(emitted()).toHaveProperty('toggle-drawer');
  });

  it('should show back button', () => {
    mockGlobalValue({ title: ref(''), displayHeaderBackButton: ref(true) });

    renderTheHeader();

    const backButton = screen.getByRole('button', { name: 'Back' });

    expect(backButton).toBeTruthy();
  });

  it('should not show back button', () => {
    mockGlobalValue({ title: ref(''), displayHeaderBackButton: ref(false) });

    renderTheHeader();

    const backButton = screen.queryByRole('button', { name: 'Back' });

    expect(backButton).toBeFalsy();
  });

  it('should show the wanted title', () => {
    const customTitle = 'This is a custom title';

    mockGlobalValue({ title: ref(customTitle) });

    renderTheHeader();

    const title = screen.getByText(customTitle);

    expect(title).toBeTruthy();
  });

  it('should show loging button is no user logged in', () => {
    mockUser(new User({}));

    renderTheHeader();

    const loginButton = screen.getByRole('button', { name: 'Login' });

    expect(loginButton).toBeTruthy();
  });

  it('should show logged user avatar', () => {
    const loggedUser = new User({
      name: 'TestLoggedUser',
      photoURL: 'http://useravatar/',
    });

    mockUser(loggedUser);

    renderTheHeader();

    const userAvatar = screen.getByAltText('User avatar');
    expect((userAvatar as HTMLImageElement).src).toEqual(loggedUser.photoURL);

    expect(screen.queryByText(loggedUser.initials)).toBeFalsy();
  });

  it('should show logged user initials', () => {
    const loggedUser = new User({ name: 'AnotherLoggedUser' });

    mockUser(loggedUser);

    renderTheHeader();

    expect(screen.getByText(loggedUser.initials)).toBeTruthy();
  });
});
