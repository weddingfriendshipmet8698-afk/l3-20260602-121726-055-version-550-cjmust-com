(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var previousButton = document.querySelector("[data-hero-prev]");
    var nextButton = document.querySelector("[data-hero-next]");
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeSlide);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (previousButton) {
            previousButton.addEventListener("click", function () {
                showSlide(activeSlide - 1);
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(activeSlide + 1);
            });
        }

        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function searchableText(card) {
        return normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
        ].join(" "));
    }

    function filterCards(input) {
        var targetSelector = input.getAttribute("data-target") || "[data-filter-card]";
        var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
        var emptyNote = document.querySelector(input.getAttribute("data-empty") || "[data-empty-note]");
        var query = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
            var matched = !query || searchableText(card).indexOf(query) >= 0;
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (emptyNote) {
            emptyNote.classList.toggle("show", visible === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-local-search]")).forEach(function (input) {
        input.addEventListener("input", function () {
            filterCards(input);
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            input.value = query;
        }
        filterCards(input);
    });
})();
