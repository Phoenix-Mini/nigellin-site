import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

process.loadEnvFile?.(".env.local");

const SHEET_ID = process.env.NIGEL_SHEET_ID || "1ZzMLyC7Z6cyb88CfP8G36_aoLYpatR6jNcxp-zMGAzw";
const OUTPUT =
  process.env.NIGEL_SNAPSHOT_PATH || path.resolve(process.cwd(), "public/data/nigel-archive.json");
const TOKEN_PATH =
  process.env.GOOGLE_TOKENS_PATH ||
  path.resolve(process.env.HOME || "~", ".openclaw/creds/google-oauth-phoenix-tokens.json");
const RANGE = process.env.NIGEL_SHEET_RANGE || "Sheet1!A1:U1000";

const ALLOWED_MEDIA_TYPES = new Set(["none", "image", "youtube", "spotify"]);
const ALLOWED_MEDIA_SLOT_TYPES = new Set(["none", "image", "youtube", "spotify", "external"]);
const ALLOWED_MEDIA_ITEM_TYPES = new Set(["image", "youtube", "spotify", "external"]);
const ALLOWED_VISIBILITY = new Set(["public", "private"]);

type MediaItem = {
  type: "image" | "youtube" | "spotify" | "external";
  url: string;
  thumbnail_url?: string;
  title?: string;
  caption?: string;
  alt?: string;
  credit?: string;
  source_url?: string;
};

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
  media_2_type?: string;
  media_2_url?: string;
  media_3_type?: string;
  media_3_url?: string;
  media_thumbnail_url?: string;
  media_alt?: string;
  media_caption?: string;
  media_credit?: string;
  media_source_url?: string;
  media_items?: MediaItem[];
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

function parseMediaItems(raw: string | number | null | undefined): MediaItem[] | undefined {
  const text = asString(raw);
  if (!text) return undefined;

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return undefined;

    const normalized = parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const record = item as Record<string, unknown>;
        const typeRaw = asString(typeof record.type === "string" ? record.type : "").toLowerCase();
        const url = asString(typeof record.url === "string" ? record.url : "");
        if (!ALLOWED_MEDIA_ITEM_TYPES.has(typeRaw) || !url) return null;

        return {
          type: typeRaw as MediaItem["type"],
          url,
          thumbnail_url: asString(typeof record.thumbnail_url === "string" ? record.thumbnail_url : "") || undefined,
          title: asString(typeof record.title === "string" ? record.title : "") || undefined,
          caption: asString(typeof record.caption === "string" ? record.caption : "") || undefined,
          alt: asString(typeof record.alt === "string" ? record.alt : "") || undefined,
          credit: asString(typeof record.credit === "string" ? record.credit : "") || undefined,
          source_url: asString(typeof record.source_url === "string" ? record.source_url : "") || undefined,
        };
      })
      .filter((item) => item !== null)
      .slice(0, 3);

    return normalized.length > 0 ? normalized : undefined;
  } catch (error) {
    console.warn(`Invalid media_items_json for entry payload: ${text.slice(0, 120)}`);
    console.warn(error);
    return undefined;
  }
}

function normalizeMediaSlotType(value: string | number | null | undefined): string | undefined {
  const normalized = asString(value).toLowerCase();
  if (!normalized || normalized === "none") return undefined;
  return ALLOWED_MEDIA_SLOT_TYPES.has(normalized) ? normalized : undefined;
}

function normalizeMediaUrl(value: string | number | null | undefined): string | undefined {
  return asString(value) || undefined;
}

function buildMediaItemsFromSlots(record: Record<string, string | number | null | undefined>): MediaItem[] | undefined {
  const primaryType = normalizeMediaSlotType(record["media_type"]);
  const primaryUrl = normalizeMediaUrl(record["media_url"]);
  const secondaryType = normalizeMediaSlotType(record["media_2_type"]);
  const secondaryUrl = normalizeMediaUrl(record["media_2_url"]);
  const tertiaryType = normalizeMediaSlotType(record["media_3_type"]);
  const tertiaryUrl = normalizeMediaUrl(record["media_3_url"]);
  const primaryThumbnailUrl = normalizeMediaUrl(record["media_thumbnail_url"]);
  const primaryTitle = asString(record["title"]) || undefined;
  const primaryCaption = asString(record["media_caption"]) || undefined;
  const primaryAlt = asString(record["media_alt"]) || undefined;
  const primaryCredit = asString(record["media_credit"]) || undefined;
  const primarySourceUrl = normalizeMediaUrl(record["media_source_url"]);

  const slots: MediaItem[] = [];

  if (primaryType && primaryUrl) {
    slots.push({
      type: primaryType as MediaItem["type"],
      url: primaryUrl,
      thumbnail_url: primaryThumbnailUrl,
      title: primaryTitle,
      caption: primaryCaption,
      alt: primaryAlt,
      credit: primaryCredit,
      source_url: primarySourceUrl,
    });
  }

  if (secondaryType && secondaryUrl) {
    slots.push({
      type: secondaryType as MediaItem["type"],
      url: secondaryUrl,
    });
  }

  if (tertiaryType && tertiaryUrl) {
    slots.push({
      type: tertiaryType as MediaItem["type"],
      url: tertiaryUrl,
    });
  }

  return slots.length > 0 ? slots : undefined;
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
  const parsedMediaItems = parseMediaItems(record["media_items_json"]);
  const slotMediaItems = buildMediaItemsFromSlots(record);
  const secondaryType = normalizeMediaSlotType(record["media_2_type"]);
  const secondaryUrl = normalizeMediaUrl(record["media_2_url"]);
  const tertiaryType = normalizeMediaSlotType(record["media_3_type"]);
  const tertiaryUrl = normalizeMediaUrl(record["media_3_url"]);
  const hasAdditionalSlotMedia = Boolean(secondaryType && secondaryUrl) || Boolean(tertiaryType && tertiaryUrl);
  const mediaItems = hasAdditionalSlotMedia ? slotMediaItems ?? parsedMediaItems : parsedMediaItems ?? slotMediaItems;

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
    media_2_type: normalizeMediaSlotType(record["media_2_type"]),
    media_2_url: normalizeMediaUrl(record["media_2_url"]),
    media_3_type: normalizeMediaSlotType(record["media_3_type"]),
    media_3_url: normalizeMediaUrl(record["media_3_url"]),
    media_thumbnail_url: asString(record["media_thumbnail_url"]) || undefined,
    media_alt: asString(record["media_alt"]) || undefined,
    media_caption: asString(record["media_caption"]) || undefined,
    media_credit: asString(record["media_credit"]) || undefined,
    media_source_url: asString(record["media_source_url"]) || undefined,
    media_items: mediaItems,
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
