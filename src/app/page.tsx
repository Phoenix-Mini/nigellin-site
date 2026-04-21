import path from "node:path";
import { promises as fs } from "node:fs";
import type { ArchiveEntry } from "@/types/archive";
import { TimelineEntry } from "@/components/TimelineEntry";

type ArchivePayload = {
  entries: ArchiveEntry[];
  generated_at?: string;
};

async function loadArchive(): Promise<ArchivePayload> {
  const filePath = path.join(process.cwd(), "public", "data", "nigel-archive.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  return parsed;
}

function compareEntries(a: ArchiveEntry, b: ArchiveEntry): number {
  const orderDiff = (b.order_index ?? 0) - (a.order_index ?? 0);
  if (orderDiff !== 0) return orderDiff;
  return b.date.localeCompare(a.date);
}

function getTimelineAlign(index: number): "center" | "left" | "right" {
  if (index === 0) return "center";
  if (index === 1) return "right";
  return index % 2 === 0 ? "left" : "right";
}

export default async function Home() {
  const archive = await loadArchive();
  const entries = (archive.entries ?? [])
    .filter((entry) => entry.visibility !== "private")
    .sort(compareEntries);
  const lastGenerated = archive.generated_at
    ? new Date(archive.generated_at).toLocaleDateString("en-AU", {
        timeZone: "Australia/Sydney",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="page">
      <a className="skip-link" href="#main-content">
        Skip to timeline content
      </a>

      <main id="main-content">
        <section className="hero hero--banner" aria-label="Nigel Lin hero banner">
          <picture className="hero__banner-picture">
            <source media="(max-width: 960px)" srcSet="/images/nigel-hero-mobile.jpg" />
            <source media="(min-width: 961px)" srcSet="/images/nigel-hero-desktop.jpg" />
            <img
              src="/images/nigel-hero-desktop.jpg"
              alt="Nigel Lin — Notes from an ongoing life."
              className="hero__banner-img"
            />
          </picture>
          <div className="hero__overlay-copy">
            <a className="hero__contact" href="mailto:niggle99@gmail.com">
              <span>Drop me a line</span>
            </a>
            <p className="hero__card-meta">Archive updated · {lastGenerated || "pending"}</p>
          </div>
        </section>

        <div className="timeline-mask-window" aria-hidden />

        <section className="timeline" id="timeline" aria-label="Timeline of life archive entries">
          <div className="timeline__spine" aria-hidden />
          {entries.length === 0 ? (
            <div className="timeline__empty">
              <p>No public entries yet.</p>
              <span>This archive grows over time.</span>
            </div>
          ) : (
            <ol className="timeline__list">
              {entries.map((entry, index) => (
                <li key={entry.id} className="timeline__item">
                  <TimelineEntry entry={entry} align={getTimelineAlign(index)} />
                </li>
              ))}
            </ol>
          )}
          <div className="timeline__ending" aria-hidden="true">
            <div className="timeline__ending-break" />
            <span className="timeline__ending-label">To be continued …</span>
            <div className="timeline__ending-fade" />
          </div>
          <div className="timeline__fade" aria-hidden />
        </section>
      </main>
    </div>
  );
}
