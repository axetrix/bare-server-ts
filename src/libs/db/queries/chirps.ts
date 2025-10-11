import { eq, desc, asc } from "drizzle-orm";

import { db } from "../index.js";
import { chirps } from "../schema.js";
import type { Chirp, ChirpDTO, SortOrder } from "../schema";

export async function createChirp(chirpData: ChirpDTO): Promise<Chirp | undefined> {
  const [chirp] = await db
    .insert(chirps)
    .values(chirpData)
    .onConflictDoNothing()
    .returning();

  return chirp;
}

export async function removeAllChirps(): Promise<boolean> {
  try {
    await db.delete(chirps).execute();

    return true;
  } catch (error) {
    console.error("Error removing all chirps:", error);

    return false;
  }
}

export async function getChirps(authorId: string, sort: SortOrder): Promise<Chirp[]> {
  const query = db.select().from(chirps);

  if (authorId) {
    query.where(eq(chirps.userId, authorId));
  }

  if (sort === "asc") {
    query.orderBy(asc(chirps.createdAt));
  } else if (sort === "desc") {
    query.orderBy(desc(chirps.createdAt));
  }

  return await query.execute();
}

export async function getChirpById(id: string): Promise<Chirp | undefined> {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, id)).execute();

  return result;
}

export async function deleteChirp(id: string): Promise<boolean> {
  try {
    await db.delete(chirps).where(eq(chirps.id, id)).execute();

    return true;
  } catch (error) {
    console.error("Error deleting chirp:", error);

    return false;
  }
}
