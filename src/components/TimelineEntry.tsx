"use client";

import { useMemo, useState } from "react";
import type { ArchiveEntry, ArchiveMediaItem } from "@/types/archive";

type TimelineAlign = "left" | "right" | "center";
type PreviewTile = {
  kind: "image" | "youtube" | "spotify" | "external";
  href: string;
  label: string;
  thumbnailUrl?: string;
  alt?: string;
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatTimelineDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  });
}

function inferPreviewTileFromMediaItem(item: ArchiveMediaItem): PreviewTile | null {
  if (!item.url) return null;

  return {
    kind: item.type,
    href: item.url,
    label: item.title || item.caption || (item.type === "youtube" ? "YouTube" : item.type === "spotify" ? "Spotify" : item.type === "image" ? "Image" : "Link"),
    thumbnailUrl: item.type === "image" ? item.thumbnail_url || item.url : item.thumbnail_url,
    alt: item.alt,
  };
}

function inferPreviewTile(entry: ArchiveEntry): PreviewTile | null {
  if (!entry.media_url || entry.media_type === "none") return null;

  if (entry.media_type === "image") {
    return {
      kind: "image",
      href: entry.media_url,
      label: entry.media_caption || entry.title,
      thumbnailUrl: entry.media_thumbnail_url || entry.media_url,
      alt: entry.media_alt || entry.title,
    };
  }

  if (entry.media_type === "youtube") {
    return {
      kind: "youtube",
      href: entry.media_url,
      label: entry.media_caption || "YouTube",
      thumbnailUrl: entry.media_thumbnail_url,
      alt: entry.media_alt || entry.title,
    };
  }

  if (entry.media_type === "spotify") {
    return {
      kind: "spotify",
      href: entry.media_url,
      label: entry.media_caption || "Spotify",
      thumbnailUrl: entry.media_thumbnail_url,
      alt: entry.media_alt || entry.title,
    };
  }

  return {
    kind: "external",
    href: entry.media_url,
    label: entry.media_caption || "Link",
    thumbnailUrl: entry.media_thumbnail_url,
    alt: entry.media_alt || entry.title,
  };
}

function inferPreviewTileFromSlot(
  type: ArchiveMediaItem["type"] | undefined,
  url: string | undefined,
): PreviewTile | null {
  if (!type || !url) return null;

  return {
    kind: type,
    href: url,
    label:
      type === "youtube"
        ? "YouTube"
        : type === "spotify"
          ? "Spotify"
          : type === "image"
            ? "Image"
            : "Link",
    thumbnailUrl: type === "image" ? url : undefined,
  };
}

export function TimelineEntry({ entry, align }: { entry: ArchiveEntry; align: TimelineAlign }) {
  const [isOpen, setIsOpen] = useState(false);

  const reflectionParagraphs = useMemo(
    () => splitParagraphs(entry.body_reflection_long || ""),
    [entry.body_reflection_long],
  );

  const mediaTiles = useMemo(() => {
    const fromItems = entry.media_items?.length
      ? entry.media_items
          .map((item) => inferPreviewTileFromMediaItem(item))
          .filter((tile): tile is PreviewTile => Boolean(tile))
      : [];

    const fallbackTile = inferPreviewTile(entry);
    const slotTiles = [
      inferPreviewTileFromSlot(entry.media_2_type as ArchiveMediaItem["type"] | undefined, entry.media_2_url),
      inferPreviewTileFromSlot(entry.media_3_type as ArchiveMediaItem["type"] | undefined, entry.media_3_url),
    ].filter((tile): tile is PreviewTile => Boolean(tile));

    const tiles =
      fromItems.length > 0
        ? fromItems
        : fallbackTile
          ? [fallbackTile, ...slotTiles]
          : slotTiles;

    return [...tiles.slice(0, 3), null, null, null].slice(0, 3);
  }, [entry]);

  return (
    <article
      className={`timeline__card ${align}${isOpen ? " is-reflection-open" : ""}`}
      aria-labelledby={`entry-title-${entry.id}`}
    >
      <div className="entry__meta-row">
        <p className="entry__date">{formatTimelineDate(entry.date)}</p>
        <p className="entry__tag">{entry.category}</p>
      </div>
      <h2 id={`entry-title-${entry.id}`}>{entry.title}</h2>
      <p className="entry__body">{entry.body_main}</p>

      <div className="entry__media-strip" aria-label={`Media previews for ${entry.title}`}>
        {mediaTiles.map((tile, index) => {
          if (!tile) {
            return <span key={`empty-${entry.id}-${index}`} className="entry__media-tile is-empty" aria-hidden="true" />;
          }

          return (
            <a
              key={`${tile.kind}-${tile.href}-${index}`}
              className={`entry__media-tile is-${tile.kind}`}
              href={tile.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tile.label} for ${entry.title}`}
            >
              {tile.thumbnailUrl ? (
                <img src={tile.thumbnailUrl} alt={tile.alt || entry.title} className="entry__media-thumb" width={160} height={96} />
              ) : (
                <span className="entry__media-glyph" aria-hidden="true">
                  {tile.kind === "youtube" ? "▶" : tile.kind === "spotify" ? "♫" : "↗"}
                </span>
              )}
              <span className="entry__media-caption">{tile.label}</span>
            </a>
          );
        })}
      </div>

      <div className="entry__reflection-wrap">
        <button
          type="button"
          className="entry__reflection"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls={`reflection-${entry.id}`}
          aria-haspopup="dialog"
        >
          <span className="entry__reflection-label">{isOpen ? "Hide reflection" : "Read reflection"}</span>
          {entry.body_reflection_short ? (
            <span className="reflection__teaser">{entry.body_reflection_short}</span>
          ) : null}
        </button>

        <div
          className="entry__reflection-backdrop"
          data-open={isOpen ? "true" : "false"}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        <div
          id={`reflection-${entry.id}`}
          className={`entry__reflection-popover ${isOpen ? "open" : ""}`}
          role="dialog"
          aria-modal="false"
          aria-label={`Reflection for ${entry.title}`}
        >
          {reflectionParagraphs.length > 0 ? (
            reflectionParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ) : (
            <p>No reflection added yet.</p>
          )}
        </div>
      </div>
    </article>
  );
}
