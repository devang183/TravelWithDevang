import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch all guestbook pins for a city
export async function GET(request, context) {
  try {
    const { params } = context;
    const { cityId } = await params;

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`guestbook_${cityId}`);

    const pins = await collection.find({}).sort({ timestamp: -1 }).toArray();

    // Transform MongoDB _id to string for JSON serialization
    const transformedPins = pins.map(pin => ({
      id: pin._id.toString(),
      lat: pin.lat,
      lng: pin.lng,
      title: pin.title,
      note: pin.note,
      author: pin.author,
      authorEmail: pin.authorEmail || null,
      userId: pin.userId || null,
      timestamp: pin.timestamp,
      likes: pin.likes || 0,
      category: pin.category || 'general',
      image: pin.image || null,
      cityId: pin.cityId
    }));

    return Response.json(transformedPins);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Failed to fetch guestbook pins', details: error.message }, { status: 500 });
  }
}

// POST: Add a new guestbook pin
export async function POST(request, context) {
  try {
    const { params } = context;
    const { cityId } = await params;

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({
        error: 'Unauthorized',
        message: 'You must be signed in to create a pin'
      }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.lat || !body.lng || !body.title) {
      return Response.json({
        error: 'Missing required fields',
        required: ['lat', 'lng', 'title']
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`guestbook_${cityId}`);

    // Create the pin document with user information
    const newPin = {
      lat: parseFloat(body.lat),
      lng: parseFloat(body.lng),
      title: body.title,
      note: body.note || '',
      author: session.user.name || session.user.email || 'Anonymous',
      authorEmail: session.user.email,
      userId: session.user.id,
      timestamp: Date.now(),
      likes: body.likes || 0,
      category: body.category || 'general',
      image: body.image || null,
      cityId: cityId,
      createdAt: new Date()
    };

    const result = await collection.insertOne(newPin);

    // Return the created pin with its ID
    return Response.json({
      success: true,
      pin: {
        id: result.insertedId.toString(),
        ...newPin
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json({
      error: 'Failed to create guestbook pin',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE: Remove a guestbook pin (only by owner)
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const { cityId } = await params;

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({
        error: 'Unauthorized',
        message: 'You must be signed in to delete a pin'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pinId = searchParams.get('pinId');

    if (!pinId) {
      return Response.json({ error: 'Pin ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`guestbook_${cityId}`);

    // First, fetch the pin to check ownership
    const pin = await collection.findOne({ _id: new ObjectId(pinId) });

    if (!pin) {
      return Response.json({ error: 'Pin not found' }, { status: 404 });
    }

    // Verify that the current user is the owner of the pin
    if (pin.userId !== session.user.id) {
      return Response.json({
        error: 'Forbidden',
        message: 'You can only delete your own pins'
      }, { status: 403 });
    }

    // Delete the pin
    const result = await collection.deleteOne({ _id: new ObjectId(pinId) });

    if (result.deletedCount === 0) {
      return Response.json({ error: 'Failed to delete pin' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Pin deleted successfully' });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json({
      error: 'Failed to delete guestbook pin',
      details: error.message
    }, { status: 500 });
  }
}
