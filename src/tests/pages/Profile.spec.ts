import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { render, RenderResult, cleanup, fireEvent } from '@testing-library/vue';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Quasar } from 'quasar';
import { Router } from 'vue-router';
import { createRouterForRoutes } from './helpers/router';
import constants from '@/util/constants';
import User from '@/models/user';
import * as LocationService from '@/services/LocationService';
import { ref } from 'vue';
import flushPromises from 'flush-promises';
import { firebaseAuth } from '@/boot/firebase';

const mockUser = ref(
  new User({
    name: 'Christian Montoya',
    email: 'christian.montoya@test.com',
    location: 'Lima, Peru',
  })
);

vi.mock('@/composables/useUser', () => ({
  useUser: () => ({
    setUserLocation: (location: string) => {
      mockUser.value.location = location;
    },
    getCurrentUserRef: () => mockUser,
    setCurrentUserAsAnonymous: vi.fn(),
  }),
}));

let router: Router;

describe('Profile page', () => {
  beforeEach(async () => {
    router = createRouterForRoutes([
      { name: constants.routes.profile.name },
      { name: constants.routes.camera.name },
    ]);

    router.push({ name: constants.routes.profile.name });
    await router.isReady();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  function renderProfile(): RenderResult {
    return render(MainLayoutTest, {
      global: {
        plugins: [Quasar, router],
        stubs: {
          TheFooter: {
            template: '<div><slot></slot></div>',
          },
        },
        mocks: {
          $Consts: constants,
        },
      },
    });
  }

  it('should render the component', () => {
    const { getByText } = renderProfile();
    expect(getByText('Name')).toBeTruthy();
  });

  describe('Page load', () => {
    it('should be able to see user profile', () => {
      const { getByLabelText } = renderProfile();

      const name: HTMLInputElement = getByLabelText('Name');
      expect(name.value).toBe('Christian Montoya');

      const email: HTMLInputElement = getByLabelText('Email');
      expect(email.value).toBe('christian.montoya@test.com');

      const location: HTMLInputElement = getByLabelText('Location');
      expect(location.value).toBe('Lima, Peru');

      vi.restoreAllMocks();
    });
  });

  describe('Geolocation', () => {
    beforeEach(() => {
      vi.mock('@/services/LocationService', () => ({
        isGeolocationAvailable: vi.fn(),
        getCurrentCityWithCountry: vi.fn(),
      }));
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should not show get location option if geolocation is not available', () => {
      vi.mocked(LocationService).isGeolocationAvailable.mockReturnValueOnce(
        false
      );

      const { queryByLabelText } = renderProfile();

      expect(queryByLabelText('Get Location')).toBeFalsy();
    });

    it('should handle problems in geolocation', async () => {
      vi.mocked(
        LocationService
      ).getCurrentCityWithCountry.mockImplementationOnce(() => {
        throw new Error('Location Service Error');
      });

      vi.mocked(LocationService).isGeolocationAvailable.mockReturnValueOnce(
        true
      );

      const { getByLabelText, emitted } = renderProfile();

      const getLocationButton = getByLabelText('Get Location');
      await fireEvent.click(getLocationButton);

      expect(emitted()).toHaveProperty(constants.events.showError);
    });

    it('should set user geolocation', async () => {
      vi.mocked(LocationService).getCurrentCityWithCountry.mockResolvedValue(
        'Montreal, Canada'
      );
      vi.mocked(LocationService).isGeolocationAvailable.mockReturnValueOnce(
        true
      );

      const { getByLabelText } = renderProfile();

      const getLocationButton = getByLabelText('Get Location');
      await fireEvent.click(getLocationButton);

      await flushPromises();

      const location: HTMLInputElement = getByLabelText('Location');
      expect(location.value).toBe('Montreal, Canada');
    });
  });

  describe('Logout User', async () => {
    it('should handle logout error', async () => {
      vi.spyOn(firebaseAuth, 'signOut').mockImplementation(() => {
        throw new Error('Error login you out');
      });

      const { getByText, emitted } = renderProfile();

      const logoutButton = getByText('Logout');
      await fireEvent.click(logoutButton);

      const errorEvent = emitted()[constants.events.showError];
      const errorMessageList = errorEvent[0] as Array<string>;

      expect(errorMessageList[0]).toBe('Error login you out');
    });

    it('should handle successful logout', async () => {
      vi.spyOn(firebaseAuth, 'signOut').mockResolvedValue();

      const { getByText, emitted } = renderProfile();

      const logoutButton = getByText('Logout');
      await fireEvent.click(logoutButton);

      expect(emitted()).toHaveProperty(constants.events.showToast);
    });
  });
});
