import clientPromise from "@/lib/mongodb";

export async function GET(request, context) {
  try {
    const { params } = context; // get the params object
    const { cityId } = await params; // await it before destructuring ✅

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(cityId); // dynamic collection based on cityId

    const pins = await collection.find({}).toArray();

    const transformedPins = pins.map(pin => ({
      coords: pin.coords,
      name: pin.name,
      description: pin.description,
      category: pin.category,
      keywords: pin.keywords || [],
      url: pin.url || '#',
      videoId: pin.videoId || null,
      phone: pin.phone || null,
      website: pin.website || null
    }));

    return Response.json(transformedPins);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Failed to fetch pins', details: error.message }, { status: 500 });
  }
}

// import clientPromise from "@/lib/mongodb";

// export async function GET(request, { params }) {
//   try {
//     const client = await clientPromise;
//     const db = client.db('hello');
    
//     // You can use cityId to determine collection or add filtering
//     const { cityId } = params;
//     const collection = db.collection(cityId); // Or make this dynamic: db.collection(cityId)
    
//     const pins = await collection.find({}).toArray();
    
//     const transformedPins = pins.map(pin => ({
//       coords: pin.coords,
//       name: pin.name,
//       description: pin.description,
//       category: pin.category,
//       keywords: pin.keywords || [],
//       url: pin.url || '#',
//       videoId: pin.videoId || null
//     }));

//     return Response.json(transformedPins);
//   } catch (error) {
//     console.error('Database error:', error);
//     return Response.json({ error: 'Failed to fetch pins', details: error.message }, { status: 500 });
//   }
// }