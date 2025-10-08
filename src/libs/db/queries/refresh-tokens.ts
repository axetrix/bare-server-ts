import { eq, and, isNull } from "drizzle-orm";

import { db } from "../index.js";
import { refreshTokens } from "../schema.js";
import type { RefreshToken, RefreshTokenDTO } from "../schema";

export async function createRefreshToken(token: string, userId: string, lifetimeInSeconds: number): Promise<RefreshToken | undefined> {
  const [result] = await db
    .insert(refreshTokens)
    .values({
      token,
      userId,
      expires_at: new Date(Date.now() + lifetimeInSeconds * 1000),
    })
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  const result = await db
    .update(refreshTokens)
    .set({ revoked_at: new Date() })
    .where(eq(refreshTokens.token, token))
    .returning();

  return result.length > 0;
}

export async function getRefreshTokenByUserId(userId: string): Promise<RefreshToken | undefined> {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revoked_at)))
    .limit(1);

  return result;
}

export async function getRefreshToken(token: string): Promise<RefreshToken | undefined> {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token))
    .limit(1);

  return result;
}
