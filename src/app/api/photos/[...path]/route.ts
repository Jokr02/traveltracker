import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  // Auth direkt hier prüfen (nicht nur über Proxy) — siehe Vercel-Empfehlung,
  // private Blobs immer direkt neben dem get()-Aufruf zu autorisieren.
  if (!(await isAuthenticated())) {
    return new NextResponse(null, { status: 401 });
  }

  const { path } = await params;
  const pathname = path.join("/");

  const { get } = await import("@vercel/blob");
  const result = await get(pathname, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });

  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}
