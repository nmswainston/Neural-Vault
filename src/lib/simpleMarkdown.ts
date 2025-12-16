const HEADING_REGEX = /^(#{1,3})\s+(.*)$/;
const LIST_ITEM_REGEX = /^-\s+(.*)$/;
const NESTED_LIST_ITEM_REGEX = /^\s{2,}-\s+(.*)$/;

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

interface CommitData {
  message: string;
  hash?: string;
  author?: string;
  time?: string;
}

function parseCommitMetadata(line: string): { key: string; value: string } | null {
  const match = line.match(/^(Hash|Author|Time):\s*(.+)$/);
  if (match) {
    return { key: match[1].toLowerCase(), value: match[2].trim() };
  }
  return null;
}

function renderCommit(commit: CommitData): string {
  const messageHtml = formatInline(commit.message);
  const hashHtml = commit.hash ? formatInline(commit.hash) : "";
  const authorHtml = commit.author ? escapeHtml(commit.author) : "";
  const timeHtml = commit.time ? escapeHtml(commit.time) : "";

  return `
    <article class="commit-block not-prose py-5 first:pt-0 last:pb-0 border-b border-slate-300 dark:border-slate-800/50 last:border-b-0">
      <div class="commit-message text-base font-medium text-slate-900 dark:text-slate-100 mb-3 leading-snug">
        ${messageHtml}
      </div>
      <dl class="commit-meta flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        ${hashHtml ? `
          <div class="flex items-center gap-1.5">
            <dt class="sr-only">Hash</dt>
            <dd class="font-mono text-[0.7rem] text-slate-400 dark:text-slate-500">${hashHtml}</dd>
          </div>
        ` : ""}
        ${authorHtml ? `
          <div class="flex items-center gap-1.5">
            <dt class="sr-only">Author</dt>
            <dd class="text-slate-500 dark:text-slate-400">${authorHtml}</dd>
          </div>
        ` : ""}
        ${timeHtml ? `
          <div class="flex items-center gap-1.5">
            <dt class="sr-only">Time</dt>
            <dd class="text-slate-500 dark:text-slate-400"><time datetime="${escapeHtml(timeHtml)}">${timeHtml}</time></dd>
          </div>
        ` : ""}
      </dl>
    </article>
  `.trim();
}

export function renderMarkdown(markdown: string) {
  try {
    const lines = markdown.trim().split(/\r?\n/);
    const html: string[] = [];
    let inList = false;
    let inCommitList = false;
    let currentCommit: CommitData | null = null;
    let commits: CommitData[] = [];

    const closeList = () => {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
    };

    const flushCommits = (forceClose = false) => {
      if (commits.length > 0) {
        if (!inCommitList) {
          html.push('<div class="commit-list not-prose">');
          inCommitList = true;
        }
        for (const commit of commits) {
          html.push(renderCommit(commit));
        }
        commits = [];
      }
      if (forceClose && inCommitList) {
        html.push("</div>");
        inCommitList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();
      const nextRawLine = i < lines.length - 1 ? lines[i + 1] : "";

      if (!line) {
        if (currentCommit) {
          commits.push(currentCommit);
          currentCommit = null;
        }
        flushCommits(false);
        closeList();
        continue;
      }

      const headingMatch = line.match(HEADING_REGEX);
      if (headingMatch) {
        flushCommits(false);
        closeList();
        const [, hashes, content] = headingMatch;
        const level = hashes.length;
        html.push(`<h${level}>${formatInline(content.trim())}</h${level}>`);
        continue;
      }

      // Check for nested list item (commit metadata)
      const nestedMatch = rawLine.match(NESTED_LIST_ITEM_REGEX);
      if (nestedMatch && currentCommit) {
        const metadata = parseCommitMetadata(nestedMatch[1]);
        if (metadata) {
          if (metadata.key === "hash") {
            // Remove backticks if present
            currentCommit.hash = metadata.value.replace(/^`|`$/g, "");
          } else if (metadata.key === "author") {
            currentCommit.author = metadata.value;
          } else if (metadata.key === "time") {
            currentCommit.time = metadata.value;
          }
          continue;
        }
      }

      // Check for top-level list item (potential commit message)
      const listMatch = line.match(LIST_ITEM_REGEX);
      if (listMatch) {
        // If we have a pending commit, save it
        if (currentCommit) {
          commits.push(currentCommit);
          currentCommit = null;
        }

        const content = listMatch[1].trim();
        // Check if this looks like a commit message (starts with backtick or is followed by nested items)
        const nextNestedMatch = nextRawLine.match(NESTED_LIST_ITEM_REGEX);
        const nextMetadata = nextNestedMatch && nextNestedMatch[1] ? parseCommitMetadata(nextNestedMatch[1]) : null;
        const isCommitMessage = content.startsWith("`") || !!nextMetadata;

        if (isCommitMessage) {
          // Extract commit message (remove backticks if present)
          const message = content.replace(/^`|`$/g, "");
          currentCommit = { message };
          closeList();
          continue;
        } else {
          // Regular list item
          flushCommits(false);
          if (!inList) {
            html.push("<ul>");
            inList = true;
          }
          html.push(`<li>${formatInline(content)}</li>`);
          continue;
        }
      }

      // If we have a pending commit and we hit a non-list line, save it
      if (currentCommit) {
        commits.push(currentCommit);
        currentCommit = null;
      }

      flushCommits(false);
      closeList();
      html.push(`<p>${formatInline(line)}</p>`);
    }

    // Handle any remaining commit
    if (currentCommit) {
      commits.push(currentCommit);
    }
    flushCommits(true);
    closeList();

    return html.join("\n");
  } catch (error) {
    console.error("Error rendering markdown:", error);
    // Fallback to basic rendering if commit parsing fails
    return markdown.split(/\r?\n/).map(line => {
      if (line.trim().match(/^#{1,3}\s+/)) {
        const match = line.match(/^(#{1,3})\s+(.*)$/);
        if (match) {
          const [, hashes, content] = match;
          return `<h${hashes.length}>${escapeHtml(content.trim())}</h${hashes.length}>`;
        }
      }
      return `<p>${escapeHtml(line)}</p>`;
    }).join("\n");
  }
}

