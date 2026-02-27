const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".btn");

const cityName = document.querySelector(".city");
const date = document.querySelector(".date");
const currentTemp = document.querySelector(".current-condition-value");

const feelslike = document.querySelector(".feelslike");
const humidity = document.querySelector(".humidity");
const wind = document.querySelector(".wind");
const precipitation = document.querySelector(".precipitation");

const forecast = document.querySelector(".forecast");
const hourlyForecastItems = document.querySelector(".hourly-forecast-items");

const unitButtons = document.querySelectorAll(".btn-unit");

const appState = {
  city: "",
  location: null,
  units: {
    temp: "c",
    wind: "kmh",
    rain: "mm",
  },
};

window.addEventListener("DOMContentLoaded", () => {
  Object.entries(appState.units).forEach(([type, unit]) => {
    setUnit(type, unit, false);
  });
});

unitButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const { type, unit } = btn.dataset;
    if (!type || !unit) return;

    setUnit(type, unit, true);
  });
});

function setUnit(type, unit, shouldRefetch = true) {
  appState.units[type] = unit;

  document.querySelectorAll(`.btn-unit[data-type="${type}"]`).forEach((btn) => {
    btn.parentElement.classList.remove("active-unit");
  });

  const activeBtn = document.querySelector(
    `.btn-unit[data-type="${type}"][data-unit="${unit}"]`,
  );

  activeBtn.parentElement.classList.add("active-unit");

  if (shouldRefetch && appState.location) {
    getWeatherData();
  }
}

searchButton.addEventListener("click", () => {
  if (appState.city) getLocation();
});

searchInput.addEventListener("keyup", (e) => {
  appState.city = e.target.value;

  if (e.key === "Enter") {
    getLocation();
  }
});

async function getLocation() {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        appState.city,
      )}&count=1&language=en&format=json`,
    );

    const data = await response.json();
    if (!data.results?.length) throw new Error("City not found");

    appState.location = data.results[0];

    getWeatherData();
  } catch (error) {
    console.error("Location fetch error:", error);
  }
}

async function getWeatherData() {
  try {
    const { latitude, longitude } = appState.location;

    // 🔥 Convert UI units to API units
    const temperatureUnit =
      appState.units.temp === "c" ? "celsius" : "fahrenheit";

    const windUnit = appState.units.wind === "kmh" ? "kmh" : "mph";

    const rainUnit = appState.units.rain === "mm" ? "mm" : "inch";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m&wind_speed_unit=${windUnit}&temperature_unit=${temperatureUnit}&precipitation_unit=${rainUnit}`;

    const response = await fetch(url);
    const weatherData = await response.json();

    renderWeather(weatherData);
  } catch (error) {
    console.error("Weather fetch error:", error);
  }
}
function renderWeather(data) {
  currentWeather(data.current);
  dailyForecast(data.daily);
  getHourlyForecastData(data.hourly);
}

function currentWeather(currentValue) {
  cityName.innerText = `${appState.location.name}, ${appState.location.country}`;

  date.innerText = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  currentTemp.innerText = `${Math.round(currentValue.temperature_2m)}°`;

  feelslike.innerText = Math.round(currentValue.apparent_temperature);
  humidity.innerText = Math.round(currentValue.relative_humidity_2m);
  wind.innerText = `${Math.round(currentValue.wind_speed_10m)} ${appState.units.wind}`;

  precipitation.innerText = `${Math.round(currentValue.precipitation)} ${
    appState.units.rain === "cm" ? "cm" : appState.units.rain
  }`;
}

function dailyForecast(dailyData) {
  forecast.innerHTML = "";

  dailyData.time.forEach((dateValue, index) => {
    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");

    const dayEl = document.createElement("p");
    dayEl.classList.add("day");
    dayEl.innerText = new Date(dateValue).toLocaleDateString("en-US", {
      weekday: "short",
    });

    const icon = document.createElement("img");
    icon.classList.add("daily-day-icon");
    const weatherCodeName = getWeatherCodeName(dailyData.weather_code[index]);
    icon.src = `./assets/images/icon-${weatherCodeName}.webp`;

    const tempValue = document.createElement("div");
    tempValue.classList.add("temp-value");

    const tempHigh = document.createElement("p");
    tempHigh.classList.add("temp-high");
    tempHigh.innerText = `${Math.round(dailyData.temperature_2m_max[index])}°`;

    const tempLow = document.createElement("p");
    tempLow.classList.add("temp-low");
    tempLow.innerText = `${Math.round(dailyData.temperature_2m_min[index])}°`;

    tempValue.append(tempHigh, tempLow);
    forecastItem.append(dayEl, icon, tempValue);
    forecast.appendChild(forecastItem);
  });
}

function getHourlyForecastData(hourlyData) {
  hourlyForecastItems.innerHTML = "";

  hourlyData.time.slice(0, 12).forEach((timeValue, index) => {
    const hourlyItem = document.createElement("div");
    hourlyItem.classList.add("h-forecast-item");

    const icon = document.createElement("img");
    icon.classList.add("h-forecast");

    const weatherCodeName = getWeatherCodeName(hourlyData.weather_code[index]);
    icon.src = `./assets/images/icon-${weatherCodeName}.webp`;

    const hour = document.createElement("p");
    hour.classList.add("h-hourly-title");
    hour.innerText = new Date(timeValue).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const temp = document.createElement("p");
    temp.classList.add("h-forecast-temp");
    temp.innerText = `${Math.round(hourlyData.temperature_2m[index])}°`;

    hourlyItem.append(icon, hour, temp);
    hourlyForecastItems.appendChild(hourlyItem);
  });
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

  return weatherCodes[code] || "sunny";
}
