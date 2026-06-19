(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function getRootPrefix() {
    return document.body.getAttribute('data-root') || './';
  }

  function setupMobileMenu() {
    var button = $('[data-menu-toggle]');
    var menu = $('[data-mobile-nav]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', menu.classList.contains('open'));
    });
  }

  function setupSearchForms() {
    $all('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';

        if (!query) {
          event.preventDefault();
          window.location.href = getRootPrefix() + 'search.html';
          return;
        }

        form.setAttribute('action', getRootPrefix() + 'search.html');
      });
    });
  }

  function setupImageFallbacks() {
    $all('.media-frame img').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.media-frame');
        if (frame) {
          frame.classList.add('is-missing');
        }
      });
    });
  }

  function setupHeroSlider() {
    var slider = $('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var prev = $('[data-hero-prev]', slider);
    var next = $('[data-hero-next]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    if (slides.length > 1) {
      start();
    }
  }

  function setupFilters() {
    var panel = $('[data-filter-panel]');
    var grid = $('[data-card-grid]');

    if (!panel || !grid) {
      return;
    }

    var keywordInput = $('[data-filter-keyword]', panel);
    var categorySelect = $('[data-filter-category]', panel);
    var yearInput = $('[data-filter-year]', panel);
    var resetButton = $('[data-filter-reset]', panel);
    var countLabel = $('[data-filter-count]', panel);
    var cards = $all('[data-card]', grid);

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var category = normalize(categorySelect ? categorySelect.value : '');
      var year = normalize(yearInput ? yearInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        if (year && cardYear.indexOf(year) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (countLabel) {
        countLabel.textContent = '当前显示 ' + visible + ' 条内容';
      }
    }

    [keywordInput, categorySelect, yearInput].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }

        if (categorySelect) {
          categorySelect.value = '';
        }

        if (yearInput) {
          yearInput.value = '';
        }

        applyFilter();
      });
    }

    applyFilter();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchForms();
    setupImageFallbacks();
    setupHeroSlider();
    setupFilters();
  });
})();
