/**
 * Converts a string into a URL-friendly slug.
 *
 * - Converts to lowercase
 * - Removes special characters (|, &, (, ), commas, quotes, etc.)
 * - Replaces spaces (and other whitespace) with hyphens
 * - Collapses multiple consecutive hyphens into one
 * - Strips leading and trailing hyphens
 *
 * The result contains only: a-z, 0-9, and hyphens.
 *
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove everything except letters, digits, spaces, hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
