import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { validateCityId, isValidCoordinates, sanitizeInput, isValidObjectId } from "@/lib/security";

// GET: Fetch all guestbook pins for a city
export async function GET(request, context) {
  try {
    const { params } = context;
    const { cityId } = await params;

    // SECURITY: Validate cityId against whitelist to prevent NoSQL injection
    const validatedCityId = validateCityId(cityId);

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`guestbook_${validatedCityId}`);

    // SECURITY: Limit query results to prevent DoS
    const pins = await collection.find({}).sort({ timestamp: -1 }).limit(1000).toArray();

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
    // SECURITY: Don't expose internal error details to client
    return Response.json({ error: 'Failed to fetch guestbook pins' }, { status: 500 });
  }
}

// POST: Add a new guestbook pin
export async function POST(request, context) {
  try {
    const { params } = context;
    const { cityId } = await params;

    // SECURITY: Validate cityId against whitelist
    const validatedCityId = validateCityId(cityId);

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

    // SECURITY: Validate coordinates
    if (!isValidCoordinates(body.lat, body.lng)) {
      return Response.json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`guestbook_${validatedCityId}`);

    // SECURITY: Validate image if provided
    let validatedImage = null;
    if (body.image) {
      // Check if it's a valid data URL
      const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
      if (dataUrlPattern.test(body.image)) {
        // Extract base64 data
        const base64Data = body.image.split(',')[1];

        // Validate base64 length (max 5MB as base64, ~3.75MB original)
        const maxBase64Length = 5 * 1024 * 1024 * 4 / 3; // Base64 is ~133% of original size
        if (base64Data && base64Data.length <= maxBase64Length) {
          validatedImage = body.image;
        } else {
          return Response.json({
            error: 'Image too large',
            message: 'Image must be less than 3.75MB'
          }, { status: 400 });
        }
      } else {
        return Response.json({
          error: 'Invalid image format',
          message: 'Only JPEG, PNG, GIF, and WebP images are supported'
        }, { status: 400 });
      }
    }

    // Create the pin document with user information
    // SECURITY: Sanitize all user inputs to prevent XSS
    const newPin = {
      lat: parseFloat(body.lat),
      lng: parseFloat(body.lng),
      title: sanitizeInput(body.title, 200),
      note: sanitizeInput(body.note || '', 1000),
      author: session.user.name || session.user.email || 'Anonymous',
      authorEmail: session.user.email,
      userId: session.user.id,
      timestamp: Date.now(),
      likes: 0, // Always start with 0, don't trust client
      category: sanitizeInput(body.category || 'general', 50),
      image: validatedImage,
      cityId: validatedCityId,
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
    // SECURITY: Don't expose internal error details
    return Response.json({
      error: 'Failed to create guestbook pin'
    }, { status: 500 });
  }
}

// DELETE: Remove a guestbook pin (only by owner)
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const { cityId } = await params;

    // SECURITY: Validate cityId
    const validatedCityId = validateCityId(cityId);

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

    // SECURITY: Validate ObjectId format to prevent injection
    if (!isValidObjectId(pinId)) {
      return Response.json({ error: 'Invalid pin ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`guestbook_${validatedCityId}`);

    // First, fetch the pin to check ownership
    const pin = await collection.findOne({ _id: new ObjectId(pinId) });

    if (!pin) {
      return Response.json({ error: 'Pin not found' }, { status: 404 });
    }

    // Verify that the current user is the owner of the pin
    if (pin.userId !== session.user.id) {
      return Response.json({
        error: 'Forbidden',
        message: "Stop messing with other people's pins"
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
    // SECURITY: Don't expose internal error details
    return Response.json({
      error: 'Failed to delete guestbook pin'
    }, { status: 500 });
  }
}
