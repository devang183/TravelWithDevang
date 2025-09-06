import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request) {
  // Read stopId from query params
  const { searchParams } = new URL(request.url);
  const stopId = searchParams.get('stopId');

  if (!stopId) {
    return NextResponse.json({ error: 'Missing stopId parameter' }, { status: 400 });
  }

  const url = `https://luasforecasts.rpa.ie/Analysis/View.aspx?id=${stopId}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch data from LUAS API (stopId=${stopId})`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const tableData = [];

    $('table tr').each((_, row) => {
      const cells = $(row)
        .find('td')
        .map((_, td) => $(td).text().trim())
        .get();

      if (cells.length > 0) {
        tableData.push(cells);
      }
    });

    return NextResponse.json({ stopId, tableData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// import { NextResponse } from 'next/server';
// import * as cheerio from 'cheerio';

// export async function GET(request) {
//   const stopId = 15; // you can later make this dynamic from query params
//   const url = `https://luasforecasts.rpa.ie/Analysis/View.aspx?id=${stopId}`;

//   const res = await fetch(url, { cache: 'no-store' });
//   const html = await res.text();

//   const $ = cheerio.load(html);
//   const tableData = [];

//   $('table tr').each((_, row) => {
//     const cells = $(row).find('td').map((_, td) => $(td).text().trim()).get();
//     if (cells.length > 0) {
//       tableData.push(cells);
//     }
//   });

//   return NextResponse.json({ stopId, tableData });
// }