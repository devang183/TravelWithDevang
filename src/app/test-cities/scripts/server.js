// if you paste http://localhost:3000/api/luas

// server.js
import express from "express";
import { getLuasStopData } from "./luasscraper.js";

const app = express();
app.get("/api/luas/:stopId", async (req, res) => {
  const stopId = req.params.stopId;
  const data = await getLuasStopData(stopId);
  res.json({ stopId, arrivals: data });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));