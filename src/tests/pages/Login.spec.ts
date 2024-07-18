import {
  describe,
  it,
  vi,
  expect,
  beforeEach,
  afterEach,
  SpyInstance,
} from 'vitest';
import { render, RenderResult, cleanup, fireEvent } from '@testing-library/vue';
import constants from '@/util/constants';
import { createRouterForRoutes } from './helpers/router';
import { Router } from 'vue-router';
import { Quasar } from 'quasar';
import MainLayoutTest from './helpers/MainLayoutTest.vue';

const mockedAuthentication = {
  loginWithEmailAndPassword: vi.fn(),
  loginWithGooglePopup: vi.fn()
};
vi.mock('@/composables/useAuthentication', () => ({
  useAuthentication: () => mockedAuthentication,
}));

let router: Router;
let routerSpy: SpyInstance;

describe('Login', () => {
  beforeEach(async () => {
    router = createRouterForRoutes([
      { name: constants.routes.login.name },
      { name: constants.routes.register.name },
    ]);

    router.push({ name: constants.routes.login.name });
    await router.isReady();

    routerSpy = vi.spyOn(router, 'push');
    routerSpy.mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
    routerSpy.mockRestore();
  });

  function renderLogin(): RenderResult {
    return render(MainLayoutTest, {
      global: {
        plugins: [Quasar, router],
        stubs: {
          TheFooter: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    });
  }

  it('should render the login component', () => {
    renderLogin();
  });

  it('should have Login as title', async () => {
    const { findByText } = renderLogin();

    expect(await findByText('title: Login')).toBeTruthy();
  });

  describe('Email and Password Form', () => {
    it('should trigger login with user and pass', async () => {
      const { getByText, getByLabelText, queryByText } = renderLogin();

      const email = 'email@test.com';
      const password = 'secret';

      const emailField = getByLabelText('Email');
      await fireEvent.update(emailField, email);

      const passwordField = getByLabelText('Password');
      await fireEvent.update(passwordField, password);

      const loginButton = getByText('Login');
      await fireEvent.click(loginButton);

      const errorSection = queryByText('error');
      expect(errorSection).toBeFalsy();
      expect(
        mockedAuthentication.loginWithEmailAndPassword
      ).toHaveBeenCalledWith(email, password);
    });

    it('should see missing email error', async () => {
      const { getByText } = renderLogin();

      const loginButton = getByText('Login');
      await fireEvent.click(loginButton);

      getByText('Please enter an email');
      expect(
        mockedAuthentication.loginWithEmailAndPassword
      ).not.toHaveBeenCalled();
    });

    it('should see invalid email error', async () => {
      const { getByText, getByLabelText } = renderLogin();

      const emailField = getByLabelText('Email');
      await fireEvent.update(emailField, 'invalid_email');

      const loginButton = getByText('Login');
      await fireEvent.click(loginButton);

      expect(
        mockedAuthentication.loginWithEmailAndPassword
      ).not.toHaveBeenCalled();
    });

    it('should see missing password error', async () => {
      const { getByLabelText, getByText } = renderLogin();

      const emailField = getByLabelText('Email');
      await fireEvent.update(emailField, 'test@cm.com');

      const loginButton = getByText('Login');
      await fireEvent.click(loginButton);

      getByText('Please enter password');
      expect(
        mockedAuthentication.loginWithEmailAndPassword
      ).not.toHaveBeenCalled();
    });
  });

  describe('Google provider option', () => {
    it('should trigger google redirect', async () => {
      const { getByLabelText } = renderLogin();

      const googleButton = getByLabelText('Login with Google');
      await fireEvent.click(googleButton);

      expect(mockedAuthentication.loginWithGooglePopup).toHaveBeenCalled();
    });
  });

  describe('User registration', () => {
    it('should navigate to registration page', async () => {
      const { getByText } = renderLogin();

      const registerButton = getByText('Register');
      await fireEvent.click(registerButton);

      expect(routerSpy).toHaveBeenCalledWith(constants.routes.register.path);
    });
  });
});
