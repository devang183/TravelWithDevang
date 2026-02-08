import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sanitizeInput } from "@/lib/security";

// Disable caching
export const dynamic = 'force-dynamic';

// Valid contributor IDs
const VALID_CONTRIBUTORS = ['meghana-kankaria', 'kushal-pillewan'];

function validateContributorId(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid contributor ID');
  }
  const sanitized = id.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!VALID_CONTRIBUTORS.includes(sanitized)) {
    throw new Error('Unknown contributor');
  }
  return sanitized;
}

// GET: Fetch all thank-you notes for a contributor
export async function GET(request, context) {
  try {
    const { params } = context;
    const { contributorId } = await params;

    const validatedId = validateContributorId(contributorId);

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`thankyou_${validatedId}`);

    const notes = await collection.find({}).sort({ timestamp: -1 }).limit(100).toArray();

    const transformedNotes = notes.map(note => ({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      author: note.author,
      color: note.color || 'yellow',
      rotation: note.rotation || 0,
      position: note.position || { x: 0, y: 0 },
      timestamp: note.timestamp
    }));

    return Response.json(transformedNotes);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST: Add a new thank-you note
export async function POST(request, context) {
  try {
    const { params } = context;
    const { contributorId } = await params;

    const validatedId = validateContributorId(contributorId);

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({
        error: 'Unauthorized',
        message: 'You must be signed in to leave a thank-you note'
      }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return Response.json({
        error: 'Missing required fields',
        required: ['title', 'content']
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`thankyou_${validatedId}`);

    // Validate color
    const validColors = ['yellow', 'green', 'blue', 'pink', 'orange'];
    const color = validColors.includes(body.color) ? body.color : 'yellow';

    // Create the note
    const newNote = {
      title: sanitizeInput(body.title, 100),
      content: sanitizeInput(body.content, 500),
      author: session.user.name || session.user.email || 'Anonymous',
      authorEmail: session.user.email,
      userId: session.user.id,
      color: color,
      rotation: Math.floor(Math.random() * 13) - 6, // Random rotation between -6 and 6 degrees
      position: body.position || { x: Math.random() * 80, y: Math.random() * 60 },
      timestamp: Date.now(),
      createdAt: new Date()
    };

    const result = await collection.insertOne(newNote);

    return Response.json({
      success: true,
      note: {
        id: result.insertedId.toString(),
        ...newNote
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json({
      error: 'Failed to create note'
    }, { status: 500 });
  }
}

// DELETE: Remove a thank-you note (only by owner)
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const { contributorId } = await params;

    const validatedId = validateContributorId(contributorId);

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({
        error: 'Unauthorized',
        message: 'You must be signed in to delete a note'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');

    if (!noteId || !ObjectId.isValid(noteId)) {
      return Response.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hello');
    const collection = db.collection(`thankyou_${validatedId}`);

    const note = await collection.findOne({ _id: new ObjectId(noteId) });

    if (!note) {
      return Response.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.userId !== session.user.id) {
      return Response.json({
        error: 'Forbidden',
        message: 'You can only delete your own notes'
      }, { status: 403 });
    }

    await collection.deleteOne({ _id: new ObjectId(noteId) });

    return Response.json({ success: true, message: 'Note deleted successfully' });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json({
      error: 'Failed to delete note'
    }, { status: 500 });
  }
}
