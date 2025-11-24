/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/utils/aes-crypto.ts

import crypto from "crypto";

/**
 * Decrypt ticket_key using AES-256-ECB with full 32-byte Client Secret
 */
export function decryptTicketKey(
  ticketKey: string,
  clientSecret: string
): string {
  if (!clientSecret) {
    throw new Error("Client Secret is required for decryption");
  }

  if (clientSecret.length !== 32) {
    throw new Error(
      `Client Secret must be 32 characters, got ${clientSecret.length}`
    );
  }

  try {
    // Use the FULL 32-byte secret for AES-256
    const key = Buffer.from(clientSecret, "utf8");

    const decipher = crypto.createDecipheriv(
      "aes-256-ecb", // ✅ Changed from aes-128-ecb to aes-256-ecb
      key,
      null // ECB mode doesn't use IV
    );
    decipher.setAutoPadding(true);

    const encrypted = Buffer.from(ticketKey, "hex");
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    const result = decrypted.toString("utf8");
    console.log("✅ Decrypted key length:", result.length);

    return result;
  } catch (error: any) {
    console.error("🔴 Decryption error details:", {
      ticketKeyLength: ticketKey.length,
      secretLength: clientSecret.length,
      error: error.message,
    });
    throw new Error(`Failed to decrypt ticket key: ${error.message}`);
  }
}

/**
 * Encrypt password using AES-128-ECB with decrypted ticket key
 */
export function encryptPassword(
  password: string,
  decryptedKey: string
): string {
  if (!decryptedKey) {
    throw new Error("Decrypted key is required for password encryption");
  }

  try {
    // The decrypted ticket key should be 16 bytes for AES-128
    const keyLength = decryptedKey.length;
    console.log("🔑 Decrypted key length for password encryption:", keyLength);

    // Use first 16 bytes if longer
    const key = Buffer.from(decryptedKey.substring(0, 16), "utf8");

    const cipher = crypto.createCipheriv(
      "aes-128-ecb", // Password uses AES-128
      key,
      null
    );
    cipher.setAutoPadding(true);

    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(password, "utf8")),
      cipher.final(),
    ]);

    return encrypted.toString("hex").toUpperCase();
  } catch (error: any) {
    console.error("🔴 Encryption error details:", {
      passwordLength: password.length,
      keyLength: decryptedKey.length,
      error: error.message,
    });
    throw new Error(`Failed to encrypt password: ${error.message}`);
  }
}
