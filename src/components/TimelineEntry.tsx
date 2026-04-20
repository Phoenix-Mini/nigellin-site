"use client";

import { useMemo, useState } from "react";
import type { ArchiveEntry } from "@/types/archive";

function toEmbedUrl(type: string, url: string): string {
  if (!url) return "";
  if (type === "youtube") {
    if (url.includes("embed")) return url;
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0] ?? "";
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }
    return url.replace("watch?v=", "embed/");
  }
  if (type === "spotify") {
    return url.replace("open.spotify.com/", "open.spotify.com/embed/");
  }
  return url;
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function TimelineEntry({ entry, align }: { entry: ArchiveEntry; align: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [imageError, setImageError] = useState(false);

  const reflectionParagraphs = useMemo(
    () => splitParagraphs(entry.body_reflection_long || ""),
    [entry.body_reflection_long],
  );

  const media = useMemo(() => {
    if (!entry.media_url || entry.media_type === "none") return null;
    const embedUrl = toEmbedUrl(entry.media_type, entry.media_url);

    if (entry.media_type === "image") {
      if (imageError || !embedUrl) {
        return <p className="entry__media-fallback">Image unavailable.</p>;
      }
      return (
        <img
          src={embedUrl}
          alt={entry.title}
          className="entry__media-image"
          width={600}
          height={360}
          onError={() => setImageError(true)}
        />
      );
    }

    if (!embedUrl) {
      return <p className="entry__media-fallback">Media unavailable.</p>;
    }

    if (!showEmbed) {
      return (
        <button
          type="button"
          className="entry__media-trigger"
          onClick={() => setShowEmbed(true)}
          aria-label={`Play ${entry.media_type} for ${entry.title}`}
        >
          <span className="entry__media-trigger-label">Play {entry.media_type}</span>
        </button>
      );
    }

    return (
      <iframe
        src={embedUrl}
        title={`${entry.media_type} embed for ${entry.title}`}
        className="entry__media-embed"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
        loading="lazy"
      />
    );
  }, [entry, imageError, showEmbed]);

  return (
    <article className={`timeline__card ${align}`} aria-labelledby={`entry-title-${entry.id}`}>
      <p className="entry__date">{entry.date}</p>
      <p className="entry__tag">{entry.category}</p>
      <h2 id={`entry-title-${entry.id}`}>{entry.title}</h2>
      <p className="entry__body">{entry.body_main}</p>

      {media ? (
        <div className="entry__media">
          <span className="entry__media-label">{entry.media_type}</span>
          {media}
        </div>
      ) : null}

      <button
        type="button"
        className="entry__reflection"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={`reflection-${entry.id}`}
      >
        {open ? "Hide reflection" : "Read reflection"}
        {entry.body_reflection_short ? (
          <span className="reflection__teaser">{entry.body_reflection_short}</span>
        ) : null}
      </button>

      <div
        id={`reflection-${entry.id}`}
        className={`entry__reflection-panel ${open ? "open" : ""}`}
      >
        {reflectionParagraphs.length > 0 ? (
          reflectionParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        ) : (
          <p>No reflection added yet.</p>
        )}
      </div>
    </article>
  );
}
