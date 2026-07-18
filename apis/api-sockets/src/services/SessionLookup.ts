import mongoose from 'mongoose';

export interface SessionUser {
  sessionId: string;
  userId: string;
  email: string;
  userRoles: string[];
}

/**
 * Look up a session by its sessionId cookie value.
 * Queries the raw MongoDB collections directly — no schema definitions needed.
 * The schema is owned by api-mono; we only read what we need.
 */
export async function findValidSession(sessionId: string): Promise<SessionUser | null> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection not established');
  }

  const session = await db.collection('sessions').findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  const user = await db.collection('users').findOne({ _id: session.userId });
  if (!user) {
    return null;
  }

  return {
    sessionId: session.sessionId as string,
    userId: session.userId as string,
    email: user.email as string,
    userRoles: (session.userRoles as string[]) || [],
  };
}
