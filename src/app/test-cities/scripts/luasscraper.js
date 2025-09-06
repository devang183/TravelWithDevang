// luasScraper.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function getLuasStopData(stopId = 15) {
  const url = `https://luasforecasts.rpa.ie/Analysis/View.aspx?id=${stopId}`;
  const res = await fetch(url);
  const html = await res.text();

  const $ = cheerio.load(html);
  const rows = [];

  $("table tr").each((_, row) => {
    const cells = $(row).find("td").map((_, td) => $(td).text().trim()).get();
    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  return rows;
}

// Test run
getLuasStopData(15).then(data => console.log(data));