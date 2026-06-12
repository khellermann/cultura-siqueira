const allowedTags = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "h2",
  "h3",
  "h4",
  "i",
  "li",
  "ol",
  "p",
  "s",
  "strong",
  "u",
  "ul",
]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasHtmlTags(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function plainTextToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function sanitizeRichText(value: string) {
  const html = hasHtmlTags(value) ? value : plainTextToHtml(value);

  return html
    .replace(/<(script|style|iframe|object|embed|form|input|button|meta|link|svg|math)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-zA-Z0-9-]+)(\s[^>]*)?>/g, (tag, tagName: string, attributes = "") => {
      const name = tagName.toLowerCase();
      const isClosingTag = tag.startsWith("</");

      if (!allowedTags.has(name)) return "";
      if (isClosingTag) return `</${name}>`;
      if (name === "br") return "<br>";

      if (name === "a") {
        const hrefMatch = attributes.match(/\shref=(["'])(.*?)\1/i);
        const href = hrefMatch?.[2]?.trim() ?? "";
        const safeHref = /^(https?:\/\/|mailto:|tel:|\/)/i.test(href) ? href : "";

        return safeHref
          ? `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noreferrer">`
          : "<a>";
      }

      return `<${name}>`;
    })
    .trim();
}

export function richTextToPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h2|h3|h4|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
