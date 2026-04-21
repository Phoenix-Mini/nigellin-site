"use client";

import { useMemo, useState } from "react";
import type { ArchiveEntry } from "@/types/archive";

type TimelineAlign = "left" | "right" | "center";
type PreviewTile = {
  kind: "image" | "youtube" | "spotify" | "external";
  href: string;
  label: string;
  thumbnailUrl?: string;
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

function inferPreviewTile(entry: ArchiveEntry): PreviewTile | null {
  if (!entry.media_url || entry.media_type === "none") return null;

  if (entry.media_type === "image") {
    return {
      kind: "image",
      href: entry.media_url,
      label: entry.title,
      thumbnailUrl: entry.media_url,
    };
  }

  if (entry.media_type === "youtube") {
    return {
      kind: "youtube",
      href: entry.media_url,
      label: "YouTube",
    };
  }

  if (entry.media_type === "spotify") {
    return {
      kind: "spotify",
      href: entry.media_url,
      label: "Spotify",
    };
  }

  return {
    kind: "external",
    href: entry.media_url,
    label: "Link",
  };
}

export function TimelineEntry({ entry, align }: { entry: ArchiveEntry; align: TimelineAlign }) {
  const [isOpen, setIsOpen] = useState(false);

  const reflectionParagraphs = useMemo(
    () => splitParagraphs(entry.body_reflection_long || ""),
    [entry.body_reflection_long],
  );

  const primaryTile = useMemo(() => inferPreviewTile(entry), [entry]);
  const mediaTiles = useMemo(() => {
    const tiles = primaryTile ? [primaryTile] : [];
    return [...tiles, null, null].slice(0, 3);
  }, [primaryTile]);

  return (
    <article className={`timeline__card ${align}`} aria-labelledby={`entry-title-${entry.id}`}>
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
                <img src={tile.thumbnailUrl} alt={entry.title} className="entry__media-thumb" width={160} height={96} />
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
