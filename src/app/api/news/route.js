// app/api/news/route.js
import { NextResponse } from "next/server";

const NEWS_API_KEY = process.env.NEWS_API_KEY; // store key in .env

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "Dublin";
    const from = searchParams.get("from") || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];

    const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(city)}&from=${from}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`);
    if (!res.ok) throw new Error(`NewsAPI returned ${res.status}`);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("News API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}