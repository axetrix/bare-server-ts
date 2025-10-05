import { eq } from "drizzle-orm";

import { db } from "../index.js";
import { chirps } from "../schema.js";
import type { Chirp, ChirpDTO } from "../schema";

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

export async function getChirps(): Promise<Chirp[]> {
  const result = await db.select().from(chirps).execute();

  return result;
}

export async function getChirpById(id: string): Promise<Chirp | undefined> {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, id)).execute();

  return result;
}
