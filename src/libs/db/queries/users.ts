import { eq } from "drizzle-orm";

import { db } from "../index.js";
import { users } from "../schema.js";
import type { User, UserDTO } from "../schema";

export async function createUser(email: string, hashedPassword: string): Promise<User | undefined> {
  const [user] = await db
    .insert(users)
    .values({
      email,
      hashedPassword,
    })
    .onConflictDoNothing()
    .returning();

  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).execute();

  if (!user) {
    return undefined;
  }

  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).execute();

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

export async function updateUser(id: string, input: Partial<UserDTO>): Promise<User | undefined> {
  const data: Partial<UserDTO> = {};

  if (input.email) {
    data.email = input.email;
  }

  if (input.hashedPassword) {
    data.hashedPassword = input.hashedPassword;
  }

  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();

  return user;
}

export async function toUserChirpyRed(userId: string): Promise<User> {
  const [user] = await db
    .update(users)
    .set({
      isChirpyRed: true,
    })
    .where(eq(users.id, userId))
    .returning();

  return user;
}
