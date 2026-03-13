import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "./firebase-admin";

/**
 * Verifies the Firebase ID token from the Authorization header.
 * Returns the decoded UID on success, or a NextResponse error on failure.
 */
export async function verifyAuthToken(
  request: Request,
): Promise<{ uid: string } | NextResponse> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 },
    );
  }

  const idToken = authHeader.slice(7);
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
    return { uid: decoded.uid };
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
