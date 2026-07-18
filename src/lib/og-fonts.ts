import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type ShareFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700;
  style: "normal";
};

let cached: ShareFont[] | undefined;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

/** Lädt die Geist-Fonts einmal pro Serverprozess für ImageResponse (next/og). */
export async function getShareFonts(): Promise<ShareFont[]> {
  if (cached) return cached;

  const dir = join(process.cwd(), "src/assets/fonts");
  const [regular, semibold, bold] = await Promise.all([
    readFile(join(dir, "Geist-Regular.ttf")),
    readFile(join(dir, "Geist-SemiBold.ttf")),
    readFile(join(dir, "Geist-Bold.ttf")),
  ]);

  cached = [
    { name: "Geist", data: toArrayBuffer(regular), weight: 400, style: "normal" },
    { name: "Geist", data: toArrayBuffer(semibold), weight: 600, style: "normal" },
    { name: "Geist", data: toArrayBuffer(bold), weight: 700, style: "normal" },
  ];
  return cached;
}
