const FIVE_SECONDS = 5000;

const getCurrentPosition = async (): Promise<GeolocationPosition> => {
  return new Promise<GeolocationPosition>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        throw new Error(error.message);
      },
      { timeout: FIVE_SECONDS }
    );
  });
};

export const getCurrentCityWithCountry = async (): Promise<string> => {
  const position = await getCurrentPosition();

  const apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  let location = data.city;
  if (data.country) {
    location += `, ${data.country}`;
  }

  return location;
};

export const isGeolocationAvailable = (): boolean => {
  return 'geolocation' in navigator;
};
