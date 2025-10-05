import { hash, verify } from "argon2";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function checkPasswordHash(password: string, hashedPassword: string): Promise<boolean> {
  return await verify(hashedPassword, password);
}
