const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

const cityName = document.querySelector(".city");
const date = document.querySelector(".date");
const currentTemp = document.querySelector(".current-condition-value");

const feelslike = document.querySelector(".feelslike");
const humidity = document.querySelector(".humidity");
const wind = document.querySelector(".wind");
const precipitation = document.querySelector(".precipitation");

const forecast = document.querySelector(".forecast");

async function getLocation() {
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
    const currentValue = WeatherData.current;

    currentWeather(currentValue, location);
    dailyForecast(WeatherData.daily);
    console.log(WeatherData);
  } catch (error) {
    console.log(error, " can't fetch the weather Data");
  }
}

getLocation();

function currentWeather(currentValue, location) {
  cityName.innerText = `${location.name}, ${location.country}`;
  date.innerText = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  currentTemp.innerText = `${Math.round(currentValue.temperature_2m)}°`;

  feelslike.innerText = `${Math.round(currentValue.apparent_temperature)}`;
  humidity.innerText = `${Math.round(currentValue.relative_humidity_2m)}`;
  wind.innerText = `${Math.round(currentValue.wind_speed_10m)} `;
  precipitation.innerText = `${Math.round(currentValue.precipitation)} `;
}

function dailyForecast(dailyData) {
  dailyData.time.forEach((element) => {
    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");
    forecast.appendChild(forecastItem);

    const dayEl = document.createElement("p");
    dayEl.classList.add("day");
    dayEl.innerText = new Date(element).toLocaleDateString("en-US", {
      weekday: "short",
    });
    forecastItem.appendChild(dayEl);

    const dailyDayIcon = document.createElement("img");
    dailyDayIcon.classList.add("daily-day-icon");
    let weatherCodeName = getWeatherCodeName(
      dailyData.weather_code[dailyData.time.indexOf(element)],
    );

    dailyDayIcon.src = `./assets/images/icon-${weatherCodeName}.webp`;
    forecastItem.appendChild(dailyDayIcon);

    const tempValue = document.createElement("div");
    tempValue.classList.add("temp-value");
    forecastItem.appendChild(tempValue);

    const tempHigh = document.createElement("p");
    tempHigh.classList.add("temp-high");
    tempHigh.innerText = `${Math.round(dailyData.temperature_2m_max[dailyData.time.indexOf(element)])}°`;
    tempValue.appendChild(tempHigh);

    const tempLow = document.createElement("p");
    tempLow.classList.add("temp-low");
    tempLow.innerText = `${Math.round(dailyData.temperature_2m_min[dailyData.time.indexOf(element)])}°`;
    tempValue.appendChild(tempLow);
  });
  console.log(dailyData);
}

function getWeatherCodeName(code) {
  const weatherCodes = {
    0: "sunny",
    1: "partly-cloudy",
    2: "partly-cloudy",
    3: "overcast",
    45: "fog",
    48: "fog",
    51: "drizzle",
    53: "drizzle",
    55: "drizzle",
    56: "drizzle",
    57: "drizzle",
    61: "rain",
    63: "rain",
    65: "rain",
    66: "rain",
    67: "rain",
    80: "rain",
    81: "rain",
    82: "rain",
    71: "snow",
    73: "snow",
    75: "snow",
    77: "snow",
    85: "snow",
    86: "snow",
    95: "storm",
    96: "storm",
    99: "storm",
  };

  return weatherCodes[code];
}
