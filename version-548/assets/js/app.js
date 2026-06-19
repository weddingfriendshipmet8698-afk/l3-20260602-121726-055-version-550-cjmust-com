(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!cards.length) {
            return;
        }
        var search = document.getElementById("site-search");
        var category = document.getElementById("filter-category");
        var year = document.getElementById("filter-year");
        var region = document.getElementById("filter-region");
        var noResults = document.querySelector(".no-results");
        function value(el) {
            return el ? String(el.value || "").trim().toLowerCase() : "";
        }
        function apply() {
            var q = value(search);
            var c = value(category);
            var y = value(year);
            var r = value(region);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = String(card.getAttribute("data-search") || "").toLowerCase();
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (c && String(card.getAttribute("data-category") || "") !== c) {
                    ok = false;
                }
                if (y && String(card.getAttribute("data-year") || "") !== y) {
                    ok = false;
                }
                if (r && String(card.getAttribute("data-region") || "").toLowerCase() !== r) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle("show", visible === 0);
            }
        }
        [search, category, year, region].forEach(function (el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
    }

    window.initPlayback = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                attached = true;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hls = hls;
                attached = true;
            } else {
                video.src = streamUrl;
                attached = true;
            }
        }
        function play() {
            overlay.classList.add("is-hidden");
            attach();
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {});
            }
        }
        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
