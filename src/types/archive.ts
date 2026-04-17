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
  visibility: "public" | "private";
  order_index?: number;
};
