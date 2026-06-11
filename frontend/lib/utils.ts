export function cn(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function normalizeKeyword(value: string) {
  return value.trim().toLowerCase();
}
