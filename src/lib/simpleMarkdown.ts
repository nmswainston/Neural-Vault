const HEADING_REGEX = /^(#{1,3})\s+(.*)$/;
const LIST_ITEM_REGEX = /^-\s+(.*)$/;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatInline = (value: string) => {
  return value
    .split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith("`") && segment.endsWith("`")) {
        const code = segment.slice(1, -1);
        return `<code>${escapeHtml(code)}</code>`;
      }

      if (segment.startsWith("[") && segment.includes("](") && segment.endsWith(")")) {
        const match = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          const [, label, href] = match;
          return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
        }
      }

      return escapeHtml(segment);
    })
    .join("");
};

export function renderMarkdown(markdown: string) {
  const lines = markdown.trim().split(/\r?\n/);
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    const headingMatch = line.match(HEADING_REGEX);
    if (headingMatch) {
      closeList();
      const [, hashes, content] = headingMatch;
      const level = hashes.length;
      html.push(`<h${level}>${formatInline(content.trim())}</h${level}>`);
      continue;
    }

    const listMatch = line.match(LIST_ITEM_REGEX);
    if (listMatch) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${formatInline(listMatch[1].trim())}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${formatInline(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}

