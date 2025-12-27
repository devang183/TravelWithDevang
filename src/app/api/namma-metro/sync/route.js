import clientPromise from '@/lib/mongodb';

// GitHub raw CSV URL
const GITHUB_CSV_URL = 'https://raw.githubusercontent.com/thecont1/namma-metro-ridership-tracker/main/NammaMetro_Ridership_Dataset.csv';

export async function GET() {
  try {
    console.log('Starting Namma Metro data sync from GitHub...');

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
    console.log('CSV fetched successfully, length:', csvText.length);

    // Parse CSV manually (simple parser for this specific format)
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      if (values.length === headers.length) {
        const record = {};
        headers.forEach((header, idx) => {
          // Convert numeric fields
          if (header !== 'Record Date') {
            record[header] = parseInt(values[idx]) || 0;
          } else {
            record[header] = values[idx];
          }
        });
        records.push(record);
      }
    }

    console.log(`Parsed ${records.length} records from CSV`);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'hello');
    const collection = db.collection('dailyNammaMetro');

    // Clear existing data and insert new data
    await collection.deleteMany({});
    console.log('Cleared existing data');

    if (records.length > 0) {
      const result = await collection.insertMany(records);
      console.log(`Inserted ${result.insertedCount} records`);
    }

    // Get some stats
    const totalRecords = await collection.countDocuments();
    const latestRecord = await collection.findOne({}, { sort: { 'Record Date': -1 } });

    return Response.json({
      success: true,
      message: 'Data synced successfully from GitHub',
      stats: {
        totalRecords,
        latestDate: latestRecord?.['Record Date'],
        sourceUrl: GITHUB_CSV_URL,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to sync data',
        details: error.message
      },
      { status: 500 }
    );
  }
}
