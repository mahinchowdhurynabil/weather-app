// ================== SELECTORS ==================
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".btn");
const spinner = document.querySelector(".fa-spinner");
const errorText = document.querySelector(".errorText");

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
const dayToggle = document.querySelector(".day-toggle");

// ================== STATE ==================
const appState = {
  city: "",
  location: null,
  units: {
    temp: "c",
    wind: "kmh",
    rain: "mm",
  },
};

let groupedHourlyData = {}; // 🔥 important

// ================== INIT ==================
window.addEventListener("DOMContentLoaded", () => {
  Object.entries(appState.units).forEach(([type, unit]) => {
    setUnit(type, unit, false);
  });
});

// ================== UNIT BUTTONS ==================
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

// ================== SEARCH ==================
searchButton.addEventListener("click", () => {
  if (appState.city) getLocation();
});

searchInput.addEventListener("keyup", (e) => {
  appState.city = e.target.value;

  if (e.key === "Enter") {
    getLocation();
  }
});

// ================== LOCATION ==================
async function getLocation() {
  errorText.classList.remove("error");

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
    errorText.innerText = error.message;
    errorText.classList.add("error");
  }
}

// ================== WEATHER ==================
async function getWeatherData() {
  try {
    const { latitude, longitude } = appState.location;

    spinner.classList.add("loading");

    const temperatureUnit =
      appState.units.temp === "c" ? "celsius" : "fahrenheit";
    const windUnit = appState.units.wind === "kmh" ? "kmh" : "mph";
    const rainUnit = appState.units.rain === "mm" ? "mm" : "inch";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m&wind_speed_unit=${windUnit}&temperature_unit=${temperatureUnit}&precipitation_unit=${rainUnit}`;

    const response = await fetch(url);
    const weatherData = await response.json();

    renderWeather(weatherData);

    spinner.classList.remove("loading");
    errorText.classList.remove("error");
  } catch (error) {
    errorText.innerText = error.message;
    errorText.classList.add("error");
  }
}

// ================== RENDER ==================
function renderWeather(data) {
  currentWeather(data.current);
  dailyForecast(data.daily);
  getHourlyForecastData(data.hourly);
}

// ================== CURRENT ==================
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
  precipitation.innerText = `${Math.round(currentValue.precipitation)} ${appState.units.rain}`;
}

// ================== DAILY ==================
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
    const weatherCodeName = getWeatherCodeName(dailyData.weather_code[index]);
    icon.src = `./assets/images/icon-${weatherCodeName}.webp`;

    const div = document.createElement("div");
    div.classList.add("temp-value");

    const tempHigh = document.createElement("p");
    tempHigh.innerText = `${Math.round(dailyData.temperature_2m_max[index])}°`;

    const tempLow = document.createElement("p");
    tempLow.innerText = `${Math.round(dailyData.temperature_2m_min[index])}°`;
    tempLow.classList.add("temp-low");

    div.appendChild(tempHigh);
    div.appendChild(tempLow);

    forecastItem.append(dayEl, icon, div);
    forecast.appendChild(forecastItem);
  });
}

// ================== HOURLY ==================
function getHourlyForecastData(hourlyData) {
  dayToggle.innerHTML = "";
  groupedHourlyData = {};

  hourlyData.time.forEach((dateValue, index) => {
    const date = new Date(dateValue);

    const dateKey = date.toLocaleDateString("en-CA");

    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!groupedHourlyData[dateKey]) {
      groupedHourlyData[dateKey] = {
        day: dayName,
        data: [],
      };
    }

    groupedHourlyData[dateKey].data.push({
      time,
      temp: hourlyData.temperature_2m[index],
      weatherCode: hourlyData.weather_code[index],
    });
  });

  Object.keys(groupedHourlyData).forEach((dateKey) => {
    const option = document.createElement("option");
    option.value = dateKey;
    option.innerText = groupedHourlyData[dateKey].day;
    dayToggle.appendChild(option);
  });

  const firstDate = Object.keys(groupedHourlyData)[0];
  renderHourlyUI(groupedHourlyData[firstDate].data);
}

// ================== HOURLY UI ==================
function renderHourlyUI(data) {
  hourlyForecastItems.innerHTML = "";

  data.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("h-forecast-item");
    const icon = document.createElement("img");
    const weatherCodeName = getWeatherCodeName(item.weatherCode);
    icon.src = `./assets/images/icon-${weatherCodeName}.webp`;

    const time = document.createElement("p");
    time.innerText = item.time;

    const temp = document.createElement("p");
    temp.innerText = `${Math.round(item.temp)}°`;
    temp.classList.add("h-forecast-temp");

    div.append(icon, time, temp);
    hourlyForecastItems.appendChild(div);
  });
}

// ================== DROPDOWN EVENT ==================
dayToggle.addEventListener("change", (e) => {
  const selectedDate = e.target.value;
  if (!groupedHourlyData[selectedDate]) return;

  renderHourlyUI(groupedHourlyData[selectedDate].data);

  hourlyForecastItems.scrollTop = 0;
});

// ================== WEATHER CODE ==================
function getWeatherCodeName(code) {
  const weatherCodes = {
    0: "sunny",
    1: "partly-cloudy",
    2: "partly-cloudy",
    3: "overcast",
    45: "fog",
    48: "fog",
    51: "drizzle",
    61: "rain",
    71: "snow",
    95: "storm",
  };

  return weatherCodes[code] || "sunny";
}
