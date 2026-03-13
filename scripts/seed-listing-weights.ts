/**
 * One-off script: add weight to existing Firestore listings that are missing it.
 * - Listings without variants: set listing-level weight (grams).
 * - Listings with variants: set weight on each variant value that doesn't have it.
 * Uses category-based ranges and per-listing variation for realistic weights.
 *
 * Run from project root: pnpm run seed-listing-weights
 * (Runs scripts/seed-listing-weights.mjs with Node; this .ts file is the source of truth for logic.)
 *
 * Requires: FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID
 */

import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "../src/lib/firebase-admin";
import { LISTINGS_COLLECTION } from "../src/lib/firestore";
import type { Listing, VariantGroup, VariantValue } from "../src/lib/schemas/listing";
import * as fs from "fs";
import * as path from "path";

// Load .env.local if present (no dotenv dependency)
function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
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
  } catch {
    // ignore
  }
}

loadEnvLocal();

/** Weight range in grams [min, max] per category for realistic defaults. */
const WEIGHT_RANGES_BY_CATEGORY: Record<string, [number, number]> = {
  Lures: [8, 120],
  Rods: [120, 450],
  Reels: [180, 520],
  Line: [40, 350],
  Tackle: [15, 200],
  Apparel: [100, 900],
  Other: [50, 350],
};

function getWeightRange(category: string): [number, number] {
  return WEIGHT_RANGES_BY_CATEGORY[category] ?? WEIGHT_RANGES_BY_CATEGORY.Other;
}

/** Simple numeric hash of a string for deterministic seeding. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h >>> 0;
}

/** Deterministic but varied weight from listing index and optional seed. */
function weightInRange(
  range: [number, number],
  index: number,
  seed: number | string = 0
): number {
  const seedNum = typeof seed === "string" ? hashString(seed) : seed;
  const [min, max] = range;
  const span = max - min + 1;
  const combined = (index * 31 + seedNum * 17) % span;
  return min + (combined < 0 ? combined + span : combined);
}

function applyWeightsToListing(
  listing: Listing,
  index: number
): { weight?: number; variants?: VariantGroup[] } | null {
  const category = listing.category ?? "Other";
  const range = getWeightRange(category);

  if (listing.variants?.length) {
    const groups: VariantGroup[] = listing.variants.map((group) => ({
      ...group,
      values: group.values.map((v, vi) => {
        if (v.weight != null) return v;
        const w = weightInRange(range, index * 100 + vi, group.id.length);
        return { ...v, weight: w } as VariantValue;
      }),
    }));
    return { variants: groups };
  }

  if (listing.weight !== undefined && listing.weight !== null) return null;
  const weight = weightInRange(range, index, listing.id ?? "");
  return { weight };
}

async function main(): Promise<void> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing env: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY"
    );
    process.exit(1);
  }

  getAdminApp();
  const db = getFirestore(getAdminApp());
  const snap = await db.collection(LISTINGS_COLLECTION).orderBy("createdAt", "desc").get();
  const listings = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Listing & { id: string }));

  console.log(`Found ${listings.length} listing(s).`);

  let updated = 0;
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const payload = applyWeightsToListing(listing, i);
    if (!payload) continue;

    const ref = db.collection(LISTINGS_COLLECTION).doc(listing.id!);
    const update: Record<string, unknown> = {};
    if (payload.weight !== undefined) update.weight = payload.weight;
    if (payload.variants !== undefined) update.variants = payload.variants;

    await ref.update(update);
    updated++;
    const detail =
      payload.weight !== undefined
        ? `weight=${payload.weight}g`
        : `variants: ${payload.variants!.flatMap((g) => g.values.map((v) => `${v.name}=${v.weight}g`)).join(", ")}`;
    console.log(`  Updated ${listing.id}: ${detail}`);
  }

  console.log(`Done. Updated ${updated} listing(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
