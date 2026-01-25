import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { isValidEmail, validatePasswordStrength, sanitizeInput } from "@/lib/security";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Validate required fields
    if (!email || !password || !name) {
      return Response.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // SECURITY: Validate email format using security utility
    if (!isValidEmail(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // SECURITY: OWASP A07:2025 - Validate password strength (8+ chars, complexity)
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return Response.json(
        {
          error: 'Password does not meet security requirements',
          requirements: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('hello');
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    // SECURITY: Sanitize user inputs
    const newUser = {
      email: email.toLowerCase().trim(),
      name: sanitizeInput(name.trim(), 100),
      password: hashedPassword,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Return success without exposing the password
    return Response.json(
      {
        success: true,
        message: 'User created successfully',
        user: {
          id: result.insertedId.toString(),
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    // SECURITY: Don't expose internal error details
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
