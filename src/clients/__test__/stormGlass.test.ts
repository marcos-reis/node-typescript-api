import { StormGlass } from '@src/clients/StormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalize3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StormGlass Client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it('Should return the normalize forecast from the StormGlass service', async () => {
    const lat = -33.79377;
    const lng = 54.23425;

    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalize3HoursFixture);
  });

  it('Should exclude incomplete data points', async () => {
    const lat = -33.79377;
    const lng = 54.23425;

    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };

    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });
    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('Should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.79377;
    const lng = 54.23425;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to comumnication to StormGlass: Network Error'
    );
  });

  it('Should get an StormGlassResponseError when StormGlass responds with error', async () => {
    const lat = -33.79377;
    const lng = 54.23425;

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: {
          errors: ['Rate Limit rechead'],
        },
      },
    });

    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error:{"errors":["Rate Limit rechead"]} Code: 429'
    );
  });
});
