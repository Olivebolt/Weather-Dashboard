// https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}

import dotenv from "dotenv";
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

class WeatherService {
  APIKey: string = process.env.API_KEY as string;
  cityName: string = "";

  public async fetchLocationData(query: string) {
    try {
      const response = await fetch(this.buildGeocodeQuery(query));
      const cityData = await response.json();

      return cityData;
    } catch (err) {
      console.log(err);

      return null;
    }
  }
  private buildGeocodeQuery(query: string): string {
    return `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${this.APIKey}`;
  }

  /**
   * @param [queryType="forecast"] Defines the type of weather query, where forecast is a 5 day forcast and weather is current weather.
   */
  private buildWeatherQuery(
    coordinates: Coordinates,
    queryType: string = "forecast"
  ): string {
    return `https://api.openweathermap.org/data/2.5/${queryType}?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.APIKey}`;
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const weatherResponse = await fetch(
        this.buildWeatherQuery(coordinates, "weather")
      );
      const forecastResponse = await fetch(this.buildWeatherQuery(coordinates));

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      return [weatherData, forecastData];
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  private parseCurrentWeather(response: any) {
    const city: string = response.name;
    const date: Date = new Date();
    const icon: string = response.weather[0].icon;
    const iconDescription: string = response.weather[0].description;
    const tempF: number = response.main.temp;
    const windSpeed: number = response.wind.speed;
    const humidity: number = response.main.humidity;

    return new Weather(
      city,
      date.toLocaleDateString(),
      icon,
      iconDescription,
      tempF,
      windSpeed,
      humidity
    );
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const outputArray: Weather[] = [];

    outputArray.push(currentWeather);

    let count = 0;
    weatherData.forEach((item) => {
      const city = currentWeather.city;
      const date = new Date(item.dt_txt).toDateString();
      const icon = item.weather[0].icon;
      const iconDescription = item.weather[0].description;
      const tempF = item.main.temp;
      const windSpeed = item.wind.speed;
      const humidity = item.main.humidity;

      if (count % 8 == 1) {
        outputArray.push(
          new Weather(
            city,
            date,
            icon,
            iconDescription,
            tempF,
            windSpeed,
            humidity
          )
        );
      }
      count++;
    });

    return outputArray;
  }

  async getWeatherForCity(city: string) {
    try {
      const localData = await this.fetchLocationData(city);
      const coordinates: Coordinates = localData.coord as Coordinates;
      const rawWeatherData = await this.fetchWeatherData(coordinates);

      if (!rawWeatherData) {
        return [];
      }
      const currentWeather: Weather = this.parseCurrentWeather(
        rawWeatherData[0]
      );
      const forcastArray = this.buildForecastArray(
        currentWeather,
        rawWeatherData[1].list
      );

      return forcastArray;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

export default new WeatherService();
