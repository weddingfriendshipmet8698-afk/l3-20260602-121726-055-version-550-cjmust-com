(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length) {
            showSlide(0);
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var resultCount = document.querySelector("[data-result-count]");
        var emptyState = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter(value) {
            var query = normalize(value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-text"));
                var matched = !query || text.indexOf(query) !== -1;
                card.classList.toggle("hidden-card", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (resultCount) {
                resultCount.textContent = String(visible);
            }
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (q && !filterInput.value) {
                filterInput.value = q;
            }
            applyFilter(filterInput.value);
            filterInput.addEventListener("input", function () {
                applyFilter(filterInput.value);
            });
        }
    });
})();
