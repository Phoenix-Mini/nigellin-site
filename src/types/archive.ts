export type ArchiveMediaItem = {
  type: "image" | "youtube" | "spotify" | "external";
  url: string;
  thumbnail_url?: string;
  title?: string;
  caption?: string;
  alt?: string;
  credit?: string;
  source_url?: string;
};

export type ArchiveEntry = {
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
  media_2_caption?: string;
  media_3_type?: string;
  media_3_url?: string;
  media_3_caption?: string;
  media_thumbnail_url?: string;
  media_alt?: string;
  media_caption?: string;
  media_credit?: string;
  media_source_url?: string;
  media_items?: ArchiveMediaItem[];
  visibility: "public" | "private";
  order_index?: number;
};
