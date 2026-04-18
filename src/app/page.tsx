import path from "node:path";
import { promises as fs } from "node:fs";
import Image from "next/image";
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

export default async function Home() {
  const archive = await loadArchive();
  const entries = (archive.entries ?? [])
    .filter((entry) => entry.visibility !== "private")
    .sort(compareEntries);
  const heroImageSrc = "/images/nigel-hero-b-v2.jpg";
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
        <section className="hero hero--minimal hero--b" aria-labelledby="hero-title">
          <div className="hero__message">
            <h1 id="hero-title">Nigel Lin</h1>
            <p>Notes from an ongoing life.</p>
          </div>

          <div className="hero__image-wrap" role="status" aria-live="polite">
            <Image
              src={heroImageSrc}
              alt="Portrait of Nigel Lin"
              className="hero__image"
              width={1264}
              height={842}
              priority
            />
            <p className="hero__card-meta">Archive updated · {lastGenerated || "pending"}</p>
          </div>
        </section>

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
                  <TimelineEntry entry={entry} align={index % 2 === 0 ? "left" : "right"} />
                </li>
              ))}
            </ol>
          )}
          <div className="timeline__fade" aria-hidden />
        </section>
      </main>
    </div>
  );
}
