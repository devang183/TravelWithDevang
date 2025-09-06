// app/api/weather/route.js
import { NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);

    const weatherData = await weatherRes.json();
    const aqiData = await aqiRes.json();

    return NextResponse.json({ weather: weatherData, aqi: aqiData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}