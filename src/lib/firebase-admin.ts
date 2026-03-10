import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import type { App } from "firebase-admin/app";

let _app: App | undefined;

export function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApp();
    return _app;
  }

  _app = initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  return _app;
}
