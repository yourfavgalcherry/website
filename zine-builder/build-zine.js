#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(__dirname, "zine-source");
const ZINE_DIR = path.join(ROOT, "zine");
const INDEX_PATH = path.join(ROOT, "zine.html");

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(dateValue) {
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function plainTextExcerpt(markdownBody, maxLen = 160) {
  const text = markdownBody
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

const HEAD = (title, relPrefix) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Manrope:wght@200..800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="${relPrefix}styles.css">
<link rel="stylesheet" href="${relPrefix}zine.css">
</head>`;

const BEAM_SCRIPT = `<script>
(function () {
  var beam = document.createElement("div");
  beam.className = "beam";
  document.body.appendChild(beam);
  var isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile) { beam.style.display = "none"; return; }
  document.addEventListener("mousemove", function (e) {
    beam.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px)";
  });
})();
</script>`;

const FOOTER = `<footer class="footer-marquee fadeout-horizontal">
  <div class="marquee-text" aria-label="copyright marquee">
    <div class="marquee-text-track">
      <span>© 2026 Chaery Yoon. All rights reserved.</span>
      <span class="separator">✴︎</span>
      <span>© 2026 Chaery Yoon. All rights reserved.</span>
      <span class="separator">✴︎</span>
      <span>© 2026 Chaery Yoon. All rights reserved.</span>
      <span class="separator">✴︎</span>
      <span aria-hidden="true">© 2026 Chaery Yoon. All rights reserved.</span>
      <span class="separator" aria-hidden="true">✴︎</span>
      <span aria-hidden="true">© 2026 Chaery Yoon. All rights reserved.</span>
      <span class="separator" aria-hidden="true">✴︎</span>
      <span aria-hidden="true">© 2026 Chaery Yoon. All rights reserved.</span>
      <span class="separator" aria-hidden="true">✴︎</span>
    </div>
  </div>
</footer>`;

function renderIndexPage(posts) {
  const entries = posts.length
    ? posts
        .map(
          (p) => `      <a class="zine-entry" href="zine/${p.slug}.html">
        <span class="zine-entry-date">${escapeHtml(formatDate(p.date))}</span>
        <span class="zine-entry-title">${escapeHtml(p.title)}</span>
        <span class="zine-entry-excerpt">${escapeHtml(p.excerpt)}</span>
      </a>`
        )
        .join("\n")
    : `      <p class="zine-empty">No entries yet.</p>`;

  return `${HEAD("Zine — Chaery Yoon", "")}
<body>

<nav class="navbar">
    <a href="index.html">Home</a>
</nav>

<div class="zine-wrapper">
  <h1 class="zine-title">Zine</h1>
  <div class="zine-list">
${entries}
  </div>
</div>

${FOOTER}

${BEAM_SCRIPT}

</body>
</html>
`;
}

function renderPostPage(post) {
  return `${HEAD(`${post.title} — Chaery Yoon`, "../")}
<body>

<nav class="navbar">
    <a href="../zine.html">Zine</a>
</nav>

<article class="zine-post">
  <div class="zine-post-date">${escapeHtml(formatDate(post.date))}</div>
  <h1 class="zine-post-title">${escapeHtml(post.title)}</h1>
  <div class="zine-post-body">
${post.html}
  </div>
</article>

${FOOTER}

${BEAM_SCRIPT}

</body>
</html>
`;
}

function loadPosts() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.log(`[zine] source dir not found: ${SOURCE_DIR} — nothing to build.`);
    return [];
  }

  const files = fs.readdirSync(SOURCE_DIR).filter((f) => f.toLowerCase().endsWith(".md"));
  const posts = [];

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const raw = fs.readFileSync(filePath, "utf8");
    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      console.warn(`[zine] skipping "${file}": failed to parse frontmatter (${err.message})`);
      continue;
    }

    const data = parsed.data || {};

    if (data.publish !== true) {
      console.log(`[zine] skipping "${file}" (publish is not true)`);
      continue;
    }

    if (!data.title) {
      console.warn(`[zine] skipping "${file}": missing required "title" in frontmatter`);
      continue;
    }

    const title = String(data.title).trim();
    const date = data.date ? String(data.date) : new Date().toISOString();
    const slug = slugify(data.slug || path.basename(file, ".md"));
    const excerpt = data.excerpt ? String(data.excerpt).trim() : plainTextExcerpt(parsed.content);
    const html = marked.parse(parsed.content);

    posts.push({ title, date, slug, excerpt, html, sourceFile: file });
  }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const seen = new Map();
  for (const post of posts) {
    if (seen.has(post.slug)) {
      console.warn(
        `[zine] duplicate slug "${post.slug}" from "${post.sourceFile}" (already used by "${seen.get(post.slug)}") — overwriting`
      );
    }
    seen.set(post.slug, post.sourceFile);
  }

  return posts;
}

function build() {
  const posts = loadPosts();

  fs.rmSync(ZINE_DIR, { recursive: true, force: true });
  fs.mkdirSync(ZINE_DIR, { recursive: true });

  for (const post of posts) {
    const outPath = path.join(ZINE_DIR, `${post.slug}.html`);
    fs.writeFileSync(outPath, renderPostPage(post), "utf8");
    console.log(`[zine] built zine/${post.slug}.html`);
  }

  fs.writeFileSync(INDEX_PATH, renderIndexPage(posts), "utf8");
  console.log(`[zine] built zine.html (${posts.length} post${posts.length === 1 ? "" : "s"})`);
}

build();
