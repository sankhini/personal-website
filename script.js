const cfg = window.siteConfig;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function excerpt(value, max = 120) {
  const clean = stripHtml(value || "");
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

function createLink(href, text) {
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = text;
  return a;
}

function renderPillars() {
  const wrap = document.getElementById("pillars");
  cfg.pillars.forEach((pillar) => {
    const span = document.createElement("span");
    span.className = "pillar";
    span.textContent = pillar;
    wrap.appendChild(span);
  });
}

function renderNow() {
  const list = document.getElementById("now-list");
  cfg.now.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function renderProjects() {
  const grid = document.getElementById("projects");
  cfg.projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project";

    const title = document.createElement("h3");
    title.appendChild(createLink(project.link, project.title));

    const body = document.createElement("p");
    body.textContent = project.description;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = project.status;

    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(badge);
    grid.appendChild(card);
  });
}

function renderSocials() {
  const wrap = document.getElementById("social-links");
  cfg.socials.forEach((social) => {
    const link = createLink(social.href, social.label);
    wrap.appendChild(link);
  });
}

function showFeedFallback(containerId, siteUrl, label) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const card = document.createElement("article");
  card.className = "feed-item";
  const title = document.createElement("strong");
  title.textContent = "Feed unavailable right now";

  const text = document.createElement("p");
  text.textContent = `Open ${label} directly to see the latest posts.`;

  const link = createLink(siteUrl, `Go to ${label}`);

  card.appendChild(title);
  card.appendChild(text);
  card.appendChild(link);
  container.appendChild(card);
}

async function loadRssFeed({ rssUrl, siteUrl, label, containerId }) {
  const container = document.getElementById(containerId);
  const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Feed request failed");

    const data = await response.json();
    const items = (data.items || []).slice(0, 3);

    if (!items.length) {
      showFeedFallback(containerId, siteUrl, label);
      return;
    }

    container.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "feed-item";

      const heading = document.createElement("div");
      heading.appendChild(createLink(item.link, item.title || "Untitled post"));

      const desc = document.createElement("p");
      desc.textContent = excerpt(item.description || item.content || "", 140);

      card.appendChild(heading);
      card.appendChild(desc);
      container.appendChild(card);
    });
  } catch {
    showFeedFallback(containerId, siteUrl, label);
  }
}

function hydrateBasics() {
  setText("name", cfg.name);
  setText("tagline", cfg.tagline);
  setText("what-i-do", cfg.whatIDo);
  setText("footer-note", cfg.footerNote);

  const image = document.getElementById("profile-image");
  image.src = cfg.profileImage;

  const button = document.getElementById("primary-link");
  button.href = cfg.primaryLink.href;
  button.textContent = cfg.primaryLink.label;

  const poetry = document.getElementById("poetry-link");
  poetry.href = cfg.writing.poetry.siteUrl;
  poetry.textContent = cfg.writing.poetry.label;

  const substack = document.getElementById("substack-link");
  substack.href = cfg.writing.substack.siteUrl;
  substack.textContent = cfg.writing.substack.label;
}

async function init() {
  hydrateBasics();
  renderPillars();
  renderNow();
  renderProjects();
  renderSocials();

  await Promise.all([
    loadRssFeed({
      rssUrl: cfg.writing.poetry.rssUrl,
      siteUrl: cfg.writing.poetry.siteUrl,
      label: cfg.writing.poetry.label,
      containerId: "poetry-feed"
    }),
    loadRssFeed({
      rssUrl: cfg.writing.substack.rssUrl,
      siteUrl: cfg.writing.substack.siteUrl,
      label: cfg.writing.substack.label,
      containerId: "substack-feed"
    })
  ]);
}

init();
