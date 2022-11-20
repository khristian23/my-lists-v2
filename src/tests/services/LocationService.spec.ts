import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCurrentCityWithCountry } from '@/services/LocationService';

describe('Location Service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function stubSuccessfulGeolocationPosition() {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 1, longitude: 1 },
          } as GeolocationPosition),
      },
    });
  }

  it('should provide current location', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              city: 'Montreal',
              country: 'Canada',
            }),
        })
      )
    );

    stubSuccessfulGeolocationPosition();

    const location = await getCurrentCityWithCountry();
    expect(location).toBe('Montreal, Canada');
  });

  it('should handle not available geolocation', async () => {
    vi.stubGlobal('navigator', { geolocation: undefined });

    await expect(getCurrentCityWithCountry).rejects.toThrow(
      'Cannot read properties of undefined'
    );
  });

  it('should handle error in geolocation calculation', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (
          _: PositionCallback,
          error: PositionErrorCallback
        ) => {
          error({
            code: 2,
            message: 'Unknown error acquiring position',
          } as GeolocationPositionError);
        },
      },
    });

    await expect(getCurrentCityWithCountry).rejects.toThrow(
      'Unknown error acquiring position'
    );
  });

  it('should handle unavailable geocode service', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('Service unavailable');
      })
    );

    stubSuccessfulGeolocationPosition();

    await expect(getCurrentCityWithCountry).rejects.toThrow(
      'Service unavailable'
    );
  });

  it('should handle geocode trottled error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              success: false,
              error: {
                code: '006',
                message:
                  'Request Throttled. Over Rate limit: up to 2 per sec. See geocode.xyz/pricing',
                requests: '5',
              },
            }),
        })
      )
    );

    stubSuccessfulGeolocationPosition();

    await expect(getCurrentCityWithCountry).rejects.toThrow(
      'Request Throttled'
    );
  });
});
