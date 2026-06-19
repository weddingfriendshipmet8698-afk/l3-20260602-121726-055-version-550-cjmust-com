import { MOVIES } from "./search-data.js";

const form = document.querySelector("[data-search-form]");
const input = document.querySelector("[data-search-input]");
const region = document.querySelector("[data-search-region]");
const type = document.querySelector("[data-search-type]");
const results = document.querySelector("[data-search-results]");
const count = document.querySelector("[data-search-count]");

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

if (input) {
  input.value = initialQuery;
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });
}

[input, region, type].forEach((control) => {
  if (control) {
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  }
});

render();

function render() {
  if (!results) {
    return;
  }

  const query = (input?.value || "").trim().toLowerCase();
  const regionValue = region?.value || "";
  const typeValue = type?.value || "";

  const filtered = MOVIES.filter((movie) => {
    const text = [
      movie.title,
      movie.region,
      movie.type,
      movie.genre,
      movie.description,
      movie.tags.join(" "),
      movie.category
    ].join(" ").toLowerCase();

    return (!query || text.includes(query))
      && (!regionValue || movie.region === regionValue)
      && (!typeValue || movie.type === typeValue);
  });

  if (count) {
    count.textContent = String(filtered.length);
  }

  results.innerHTML = filtered.slice(0, 240).map(renderCard).join("");

  if (filtered.length === 0) {
    results.innerHTML = '<div class="panel empty-note" style="display:block;">没有找到匹配影片，请换一个关键词。</div>';
  }
}

function renderCard(movie) {
  const tags = [movie.year, movie.region, movie.type].filter(Boolean).join(" · ");
  return `
    <article class="movie-card" data-title="${escapeHtml(movie.title)}">
      <a class="poster-wrap" href="${escapeHtml(movie.detail)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy" data-fallback-title="${escapeHtml(movie.title)}">
        <span class="poster-fill"><span>${escapeHtml(movie.title)}</span></span>
        <span class="card-mask"><span class="card-category">${escapeHtml(movie.category)}</span></span>
      </a>
      <div class="card-body">
        <h3 class="card-title"><a href="${escapeHtml(movie.detail)}">${escapeHtml(movie.title)}</a></h3>
        <p class="card-desc">${escapeHtml(movie.description)}</p>
        <div class="meta-row">
          <span>${escapeHtml(tags)}</span>
          <span class="score">★ ${movie.score}</span>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
