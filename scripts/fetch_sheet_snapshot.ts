import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const SHEET_ID = process.env.NIGEL_SHEET_ID || "1ZzMLyC7Z6cyb88CfP8G36_aoLYpatR6jNcxp-zMGAzw";
const OUTPUT = process.env.NIGEL_SNAPSHOT_PATH || path.resolve(process.cwd(), "public/data/nigel-archive.json");
const TOKEN_PATH =
  process.env.GOOGLE_TOKENS_PATH ||
  path.resolve(process.env.HOME || "~", ".openclaw/creds/google-oauth-phoenix-tokens.json");
const RANGE = process.env.NIGEL_SHEET_RANGE || "Sheet1!A1:K1000";

const ALLOWED_MEDIA_TYPES = new Set(["none", "image", "youtube", "spotify"]);
const ALLOWED_VISIBILITY = new Set(["public", "private"]);

type Entry = {
  id: string;
  date: string;
  category: string;
  title: string;
  body_main: string;
  body_reflection_short: string;
  body_reflection_long: string;
  media_type: string;
  media_url: string;
  visibility: "public" | "private";
  order_index: number | null;
};

type Snapshot = {
  generated_at: string;
  source_sheet: string;
  total: number;
  entries: Entry[];
};

function asString(value: string | number | null | undefined): string {
  return String(value ?? "").trim();
}

function normalizeDate(value: string | number | null | undefined): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const utcMillis = epoch.getTime() + value * 24 * 60 * 60 * 1000;
    return new Date(utcMillis).toISOString().slice(0, 10);
  }
  return asString(value);
}

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeRow(
  header: string[],
  row: Array<string | number | null | undefined>,
): Entry {
  const record: Record<string, string | number | null | undefined> = {};
  header.forEach((key, idx) => {
    record[String(key).trim()] = row[idx] ?? "";
  });

  const mediaTypeRaw = asString(record["media_type"]).toLowerCase() || "none";
  const visibilityRaw = asString(record["visibility"]).toLowerCase() || "public";

  return {
    id: asString(record["id"]),
    date: normalizeDate(record["date"]),
    category: asString(record["category"]).toLowerCase() || "life",
    title: asString(record["title"]),
    body_main: asString(record["body_main"]),
    body_reflection_short: asString(record["body_reflection_short"]),
    body_reflection_long: asString(record["body_reflection_long"]),
    media_type: ALLOWED_MEDIA_TYPES.has(mediaTypeRaw) ? mediaTypeRaw : "none",
    media_url: asString(record["media_url"]),
    visibility: (ALLOWED_VISIBILITY.has(visibilityRaw) ? visibilityRaw : "public") as
      | "public"
      | "private",
    order_index: toNumberOrNull(record["order_index"]),
  };
}

function fetchExistingSnapshot(snapshotPath: string): Snapshot | null {
  if (!fs.existsSync(snapshotPath)) return null;
  try {
    const raw = fs.readFileSync(snapshotPath, "utf-8");
    return JSON.parse(raw) as Snapshot;
  } catch {
    return null;
  }
}

async function fetchSheetEntries(): Promise<Entry[]> {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`Token file not found at ${TOKEN_PATH}`);
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
  const oauth2 = new google.auth.OAuth2(token.client_id, token.client_secret, token.token_uri);
  oauth2.setCredentials({
    refresh_token: token.refresh_token,
    access_token: token.token,
    expiry_date: token.expiry_date,
  });

  const sheets = google.sheets({ version: "v4", auth: oauth2 });
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  if (!data.values || data.values.length === 0) {
    throw new Error("Sheet returned no data");
  }

  const [headerRaw, ...rows] = data.values;
  const header = headerRaw.map((key) => String(key).trim());
  const entries = rows
    .filter((row) => row.length && row[0])
    .map((row) => normalizeRow(header, row));

  return entries;
}

function writeSnapshot(entries: Entry[]): void {
  const snapshot: Snapshot = {
    generated_at: new Date().toISOString(),
    source_sheet: SHEET_ID,
    total: entries.length,
    entries,
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${entries.length} entries to ${OUTPUT}`);
}

async function main() {
  const existingSnapshot = fetchExistingSnapshot(OUTPUT);

  try {
    const entries = await fetchSheetEntries();
    writeSnapshot(entries);
  } catch (err) {
    if (existingSnapshot) {
      console.warn("Snapshot refresh failed. Keeping previous snapshot file.");
      console.warn(err);
      console.log(`Fallback active: existing snapshot retained at ${OUTPUT}`);
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
