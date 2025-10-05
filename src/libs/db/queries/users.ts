import { eq } from "drizzle-orm";

import { db } from "../index.js";
import { users } from "../schema.js";
import type { User, UserSafe } from "../schema";

import { hashPassword } from "../../auth.js";

export async function createUser(email: string, password: string): Promise<UserSafe | undefined> {
  const hashedPassword = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      email,
      hashedPassword,
    })
    .onConflictDoNothing()
    .returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).execute();

  if (!user) {
    return undefined;
  }

  return user;
}

export async function removeAllUsers(): Promise<boolean> {
  try {
    await db.delete(users).execute();

    return true;
  } catch (error) {
    console.error("Error removing all users:", error);

    return false;
  }
}
