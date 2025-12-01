/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/proxy/image/route.ts
import { NextRequest } from "next/server";
import crypto from "crypto";

export const GET = async (request: NextRequest) => {
  const url = request.nextUrl.searchParams.get("url");
  const key = request.nextUrl.searchParams.get("key"); // file_key

  if (!url || !key) {
    return new Response("Missing url or key", { status: 400 });
  }

  if (key.length !== 16) {
    return new Response("Invalid key length", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SmartLife/5.0",
        Referer: "https://smartapp.tuya.com/",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Tuya S3 fetch failed:", response.status, text);
      return new Response("Failed to fetch encrypted image", { status: 502 });
    }

    const encryptedBuffer = Buffer.from(await response.arrayBuffer());

    // Skip first 4 + 16 (IV) + 44 bytes = 64 bytes header
    if (encryptedBuffer.length < 64) {
      return new Response("Invalid encrypted data", { status: 500 });
    }

    const iv = encryptedBuffer.slice(4, 20); // bytes 4–19 = IV
    const encryptedData = encryptedBuffer.slice(64); // actual encrypted JPEG

    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      Buffer.from(key),
      iv
    );
    decipher.setAutoPadding(true);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return new Response(decrypted, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Decryption failed:", error);
    return new Response("Decryption failed", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
export const maxDuration = 30;
