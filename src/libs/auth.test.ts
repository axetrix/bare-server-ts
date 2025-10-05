import { describe, it, expect, beforeAll } from "vitest";

import { makeJWT, validateJWT } from "./auth";
import { hashPassword, checkPasswordHash } from "./auth";

import { UserNotAuthenticatedError } from "./errors";

describe("Password Hashing", () => {
  const password1 = "password1!";
  const password2 = "Password2!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash1);
    expect(result).toBe(false);
  });

  it("should return false when password doesn't match a different hash", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });

  it("should return false for an empty password", async () => {
    const result = await checkPasswordHash("", hash1);
    expect(result).toBe(false);
  });

  it("should return false for an invalid hash", async () => {
    const result = await checkPasswordHash(password1, "invalidhash");
    expect(result).toBe(false);
  });
});

describe("JWT Validation", () => {
  const secret = "secret!";
  const userID = "userID1";
  let validToken: string;

  beforeAll(async () => {
    validToken = await makeJWT(userID, 200, secret);
  });

  it("should validate a valid token", async () => {
    const result = await validateJWT(validToken, secret);
    expect(result).toBe(userID);
  });

  it("should throw an error for an invalid token", async () => {
    await expect(validateJWT("invalidToken", secret)).rejects.toThrow(UserNotAuthenticatedError);
  });

  it("should throw an error when the token is signed with a wrong secret", async () => {
    await expect(validateJWT(validToken, "wrongSecret")).rejects.toThrow(UserNotAuthenticatedError);
  });

  it("should throw an error when the subject is empty", async () => {
    const validToken = await makeJWT("", 200, secret);

    await expect(validateJWT(validToken, secret)).rejects.toThrowError(UserNotAuthenticatedError);
  });
});
