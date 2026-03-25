# 🌤 Weather App

A modern weather application that allows users to search any city and view real-time weather data, including current conditions, daily forecasts, and detailed hourly breakdowns.

---

## ✨ Features

- 🔍 Search weather by city name
- 🌍 Real-time data from Open-Meteo API
- 📅 7-day forecast
- ⏰ Hourly forecast with day-wise filtering
- 🔄 Switch temperature (°C / °F)
- 💨 Change wind units (km/h / mph)
- 🌧 Change precipitation units (mm / cm)
- ⚡ Loading spinner while fetching data
- ❌ Error handling (invalid city, API issues)
- 🎯 Clean and responsive UI

---

## 🧠 How It Works

The app uses a central `appState` object to manage:

- Selected city
- Location coordinates
- Unit preferences

Weather data is fetched in two steps:
1. Convert city name → coordinates (Geocoding API)
2. Fetch weather data using those coordinates

---

## 📊 Advanced Features

### 🔹 Hourly Forecast System
- Groups hourly data by date
- Dynamically updates UI based on selected day
- Improves readability and user experience

### 🔹 Dynamic UI Rendering
- All weather data is rendered using JavaScript
- No static data — everything updates in real-time

---

## ⚙️ Technologies Used

- HTML5
- CSS3 (Responsive Design)
- JavaScript (ES6+)
- Fetch API (Async/Await)
- Open-Meteo API

---

## 🚀 Future Improvements

- 🌙 Add dark mode
- 📍 Detect user location automatically
- 💾 Save the last searched city

---

## 💡 What I Learned

- Working with real APIs
- Handling asynchronous JavaScript (async/await)
- Managing application state
- Structuring dynamic UI updates
- Improving UX with loading & error states

---

## 📌 Final Note

This project represents a step toward building real-world web applications with dynamic data and better user experience.
