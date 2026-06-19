import { H as Hls } from "./hls.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  bindMobileNavigation();
  bindHeroCarousel();
  bindImageFallbacks();
  bindLocalFilters();
  bindVideoPlayer();
});

function bindMobileNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const search = document.querySelector("[data-header-search]");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
    if (search) {
      search.classList.toggle("open");
    }
  });
}

function bindHeroCarousel() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === active);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(active + 1), 4800);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function bindImageFallbacks() {
  document.querySelectorAll("img[data-fallback-title]").forEach((image) => {
    image.addEventListener("error", () => {
      const holder = image.closest(".poster-wrap, .hero-card, .rank-cover, .side-cover, .detail-poster");
      if (holder) {
        holder.classList.add("image-missing");
      }
    }, { once: true });
  });
}

function bindLocalFilters() {
  const panels = document.querySelectorAll("[data-filter-panel]");

  panels.forEach((panel) => {
    const scopeSelector = panel.getAttribute("data-filter-panel");
    const scope = document.querySelector(scopeSelector);
    if (!scope) {
      return;
    }

    const queryInput = panel.querySelector("[data-filter-query]");
    const yearSelect = panel.querySelector("[data-filter-year]");
    const regionSelect = panel.querySelector("[data-filter-region]");
    const cards = Array.from(scope.querySelectorAll("[data-title]"));

    const apply = () => {
      const query = (queryInput?.value || "").trim().toLowerCase();
      const year = yearSelect?.value || "";
      const region = regionSelect?.value || "";
      let visible = 0;

      cards.forEach((card) => {
        const text = [
          card.dataset.title || "",
          card.dataset.tags || "",
          card.dataset.region || "",
          card.dataset.type || ""
        ].join(" ").toLowerCase();

        const cardYear = card.dataset.year || "";
        const cardRegion = card.dataset.region || "";
        const matchesQuery = !query || text.includes(query);
        const matchesYear = !year || cardYear === year;
        const matchesRegion = !region || cardRegion === region;
        const matches = matchesQuery && matchesYear && matchesRegion;

        card.style.display = matches ? "" : "none";
        if (matches) {
          visible += 1;
        }
      });

      scope.classList.toggle("no-results", visible === 0);
    };

    [queryInput, yearSelect, regionSelect].forEach((control) => {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
}

function bindVideoPlayer() {
  const video = document.querySelector("video[data-hls-src]");
  const cover = document.querySelector("[data-play-cover]");
  const status = document.querySelector("[data-player-status]");

  if (!video) {
    return;
  }

  const source = video.dataset.hlsSrc;

  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  const attachSource = () => {
    if (!source) {
      setStatus("当前影片暂未配置播放源");
      return Promise.resolve(false);
    }

    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
      video.src = source;
      return Promise.resolve(true);
    }

    if (Hls && Hls.isSupported()) {
      return new Promise((resolve) => {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => resolve(true));
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) {
            setStatus("播放源加载失败，请稍后重试");
          }
        });
        window.__currentHlsPlayer = hls;
      });
    }

    setStatus("当前浏览器不支持 HLS 播放");
    return Promise.resolve(false);
  };

  let attached = false;

  const startPlayback = async () => {
    setStatus("正在加载播放源...");
    if (!attached) {
      attached = await attachSource();
    }

    if (!attached) {
      return;
    }

    video.controls = true;
    if (cover) {
      cover.classList.add("hidden");
    }

    try {
      await video.play();
      setStatus("正在播放");
    } catch (error) {
      setStatus("点击播放器即可继续播放");
    }
  };

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }

  video.addEventListener("play", () => {
    if (cover) {
      cover.classList.add("hidden");
    }
  });
}
