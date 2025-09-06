import clientPromise from "@/lib/mongodb"; // your MongoDB connection helper

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("hello");
    const listings = await db.collection("londonAirbnb")
      .find({})
      //.limit(500) // optional limit
      .toArray();

    return new Response(JSON.stringify(listings), { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to load data" }), { status: 500 });
  }
}