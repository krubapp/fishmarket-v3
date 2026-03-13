/**
 * One-off script: add weight to existing Firestore listings that are missing it.
 * - Listings without variants: set listing-level weight (grams).
 * - Listings with variants: set weight on each variant value that doesn't have it.
 *
 * Run: pnpm run seed-listing-weights
 * Requires: FIREBASE_ADMIN_* and NEXT_PUBLIC_FIREBASE_PROJECT_ID (e.g. from .env.local)
 */

import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvFile(envPath) {
  try {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eq = trimmed.indexOf("=");
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
          if (!(key in process.env)) process.env[key] = value;
        }
      }
    }
  } catch {}
}

// Load .env then .env.local (later files don't overwrite existing keys)
loadEnvFile(path.join(root, ".env"));
loadEnvFile(path.join(root, ".env.local"));

const WEIGHT_RANGES_BY_CATEGORY = {
  Lures: [8, 120],
  Rods: [120, 450],
  Reels: [180, 520],
  Line: [40, 350],
  Tackle: [15, 200],
  Apparel: [100, 900],
  Other: [50, 350],
};

function getWeightRange(category) {
  return WEIGHT_RANGES_BY_CATEGORY[category] ?? WEIGHT_RANGES_BY_CATEGORY.Other;
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h >>> 0;
}

function weightInRange(range, index, seed = 0) {
  const seedNum = typeof seed === "string" ? hashString(seed) : seed;
  const [min, max] = range;
  const span = max - min + 1;
  const combined = (index * 31 + seedNum * 17) % span;
  return min + (combined < 0 ? combined + span : combined);
}

function applyWeightsToListing(listing, index) {
  const category = listing.category ?? "Other";
  const range = getWeightRange(category);

  if (listing.variants?.length) {
    const groups = listing.variants.map((group) => ({
      ...group,
      values: group.values.map((v, vi) => {
        if (v.weight != null) return v;
        const w = weightInRange(range, index * 100 + vi, group.id?.length ?? 0);
        return { ...v, weight: w };
      }),
    }));
    return { variants: groups };
  }

  if (listing.weight != null) return null;
  const weight = weightInRange(range, index, listing.id ?? "");
  return { weight };
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing required env vars: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY");
    console.error("Add them to .env.local in the project root, or run: FIREBASE_ADMIN_CLIENT_EMAIL=... FIREBASE_ADMIN_PRIVATE_KEY=... NEXT_PUBLIC_FIREBASE_PROJECT_ID=... pnpm run seed-listing-weights");
    process.exit(1);
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }
  const db = getFirestore(getApp());
  const LISTINGS_COLLECTION = "listings";

  const snap = await db.collection(LISTINGS_COLLECTION).orderBy("createdAt", "desc").get();
  const listings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log(`Found ${listings.length} listing(s).`);

  let updated = 0;
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const payload = applyWeightsToListing(listing, i);
    if (!payload) continue;

    const ref = db.collection(LISTINGS_COLLECTION).doc(listing.id);
    const update = {};
    if (payload.weight !== undefined) update.weight = payload.weight;
    if (payload.variants !== undefined) update.variants = payload.variants;

    await ref.update(update);
    updated++;
    const detail =
      payload.weight !== undefined
        ? `weight=${payload.weight}g`
        : payload.variants
            .flatMap((g) => g.values.map((v) => `${v.name}=${v.weight}g`))
            .join(", ");
    console.log(`  Updated ${listing.id}: ${detail}`);
  }

  console.log(`Done. Updated ${updated} listing(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
