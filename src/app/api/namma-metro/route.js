import clientPromise from "@/lib/mongodb";

// GET: Fetch all Namma Metro ridership data
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection('nammaMetro');

    // Fetch all records, sorted by date (newest first)
    const metroData = await collection.find({}).sort({ 'Record Date': -1 }).toArray();

    // Transform MongoDB _id to string for JSON serialization
    const transformedData = metroData.map(record => ({
      'Record Date': record['Record Date'],
      'Total Smart Cards': record['Total Smart Cards'] || 0,
      'Stored Value Card': record['Stored Value Card'] || 0,
      'One Day Pass': record['One Day Pass'] || 0,
      'Three Day Pass': record['Three Day Pass'] || 0,
      'Five Day Pass': record['Five Day Pass'] || 0,
      'Total Tokens': record['Total Tokens'] || 0,
      'Total NCMC': record['Total NCMC'] || 0,
      'Group Ticket': record['Group Ticket'] || 0,
      'Total QR': record['Total QR'] || 0
    }));

    return Response.json(transformedData);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch Namma Metro data', details: error.message },
      { status: 500 }
    );
  }
}
