import clientPromise from "@/lib/mongodb";

// GET: Fetch all Indigo Fiasco 2025 data
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection('indigoFiasco2025');

    // Fetch all records
    const data = await collection.find({}).toArray();

    // Transform MongoDB _id to string for JSON serialization
    const transformedData = data.map(record => {
      const { _id, ...rest } = record;
      return {
        id: _id.toString(),
        ...rest
      };
    });

    return Response.json({
      success: true,
      count: transformedData.length,
      data: transformedData
    });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch Indigo Fiasco data', details: error.message },
      { status: 500 }
    );
  }
}
