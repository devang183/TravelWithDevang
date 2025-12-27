// API endpoint for automated daily sync (can be called by cron services like Vercel Cron, GitHub Actions, or external cron)
// This endpoint can be secured with a secret token in production

import clientPromise from '@/lib/mongodb';

const GITHUB_CSV_URL = 'https://raw.githubusercontent.com/thecont1/namma-metro-ridership-tracker/main/NammaMetro_Ridership_Dataset.csv';

export async function GET(request) {
  try {
    // Optional: Add authentication check
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log(`[${new Date().toISOString()}] Starting automated Namma Metro data sync...`);

    // Fetch CSV from GitHub
    const response = await fetch(GITHUB_CSV_URL, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    // Parse CSV
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      if (values.length === headers.length) {
        const record = {};
        headers.forEach((header, idx) => {
          if (header !== 'Record Date') {
            record[header] = parseInt(values[idx]) || 0;
          } else {
            record[header] = values[idx];
          }
        });
        records.push(record);
      }
    }

    console.log(`Parsed ${records.length} records`);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'hello');
    const collection = db.collection('dailyNammaMetro');

    // Clear and replace all data
    await collection.deleteMany({});

    if (records.length > 0) {
      await collection.insertMany(records);
    }

    const totalRecords = await collection.countDocuments();
    const latestRecord = await collection.findOne({}, { sort: { 'Record Date': -1 } });

    console.log(`[${new Date().toISOString()}] Sync complete. Total records: ${totalRecords}`);

    return Response.json({
      success: true,
      message: 'Automated sync completed successfully',
      stats: {
        totalRecords,
        latestDate: latestRecord?.['Record Date'],
        syncedAt: new Date().toISOString(),
        source: 'GitHub (thecont1/namma-metro-ridership-tracker)'
      }
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Automated sync failed:`, error);
    return Response.json(
      {
        success: false,
        error: 'Automated sync failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
