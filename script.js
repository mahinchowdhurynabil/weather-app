const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");
const cityName = document.querySelector(".city");
const date = document.querySelector(".date");
const currentTemp = document.querySelector(".current-condition-value");

async function getLoation() {
  const city = "rajshahi";

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    );
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("City not found");
    }

    const place = data.results[0];
    console.log(place);

    getWeatherData(place.latitude, place.longitude, place);
  } catch (error) {
    console.log(error, "cant fetch location API");
  }
}

async function getWeatherData(lat, lon, location) {
  try {
    const APIkey = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,apparent_temperature`;
    const response = await fetch(APIkey);
    const WeatherData = await response.json();

    currentValue = WeatherData.current;

    currentWeather(currentValue, location);
    console.log(WeatherData);
  } catch (error) {
    console.log(error, " can't fetch the weather Data");
  }
}

getLoation();

function currentWeather(currentValue, location) {
  cityName.innerText = `${location.name}, ${location.country}`;
  date.innerText = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  currentTemp.innerText = `${Math.round(currentValue.temperature_2m)}°C`;
}
