import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { loginRateLimiter } from "@/lib/security";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.toLowerCase().trim();

        // SECURITY: OWASP A07:2025 - Brute force protection
        const rateLimitCheck = loginRateLimiter.checkLimit(email);
        if (!rateLimitCheck.allowed) {
          const resetTime = rateLimitCheck.resetTime.toLocaleTimeString();
          throw new Error(`Too many failed login attempts. Please try again after ${resetTime}`);
        }

        const client = await clientPromise;
        const db = client.db('hello');
        const usersCollection = db.collection('users');

        // Find user by email
        const user = await usersCollection.findOne({ email });

        if (!user || !user.password) {
          // SECURITY: Record failed attempt
          loginRateLimiter.recordAttempt(email);
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          // SECURITY: Record failed attempt
          loginRateLimiter.recordAttempt(email);
          throw new Error("Invalid email or password");
        }

        // SECURITY: Reset rate limit on successful login
        loginRateLimiter.reset(email);

        // Return user object (without password)
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user id to JWT token on sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Add user id to session
      if (session?.user) {
        session.user.id = token?.id || user?.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  // SECURITY: OWASP A07:2025 - Cookie security
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
