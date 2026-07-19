import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes HTML produced by the rich text editor before it is persisted or
 * rendered anywhere else in the app. Runs safely on both server and client
 * because `isomorphic-dompurify` falls back to `jsdom` on the server.
 */
export function sanitizeEditorHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "hr",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "span",
      "mark",
      "div",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "class",
      "style",
      "colspan",
      "rowspan",
      "data-type",
      "data-checked",
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}