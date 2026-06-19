(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === slideIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === slideIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  var heroSearchForm = document.querySelector('.hero-search');

  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroSearchForm.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      if (keyword) {
        window.location.href = './categories.html?q=' + encodeURIComponent(keyword);
      }
    });
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(root) {
    var scope = root || document;
    var input = scope.querySelector('.movie-search') || document.querySelector('.movie-search');
    var yearSelect = scope.querySelector('.year-filter') || document.querySelector('.year-filter');
    var keyword = normalize(input ? input.value : '');
    var year = yearSelect ? yearSelect.value : '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-row'));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.textContent
      ].join(' '));
      var cardYear = card.getAttribute('data-year') || '';
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !year || cardYear === year;
      card.classList.toggle('hidden-by-filter', !(matchesKeyword && matchesYear));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(document);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.year-filter')).forEach(function (select) {
    select.addEventListener('change', function () {
      filterCards(document);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.clear-filter')).forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = button.closest('.filter-panel') || document;
      var input = panel.querySelector('.movie-search');
      var select = panel.querySelector('.year-filter');
      if (input) {
        input.value = '';
      }
      if (select) {
        select.value = '';
      }
      filterCards(document);
    });
  });

  var initialQuery = new URLSearchParams(window.location.search).get('q');
  if (initialQuery && searchInputs.length) {
    searchInputs[0].value = initialQuery;
    filterCards(document);
  }

  function prepareVideo(video) {
    if (!video || video.dataset.ready === '1') {
      return;
    }

    var source = video.querySelector('source');
    var src = source ? source.getAttribute('src') : video.getAttribute('src');

    if (!src) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.ready = '1';
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.dataset.ready = '1';
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(function (video) {
    prepareVideo(video);
  });

  Array.prototype.slice.call(document.querySelectorAll('.play-trigger')).forEach(function (button) {
    button.addEventListener('click', function () {
      var wrap = button.closest('.player-wrap');
      var video = wrap ? wrap.querySelector('video') : null;
      if (!video) {
        return;
      }
      prepareVideo(video);
      button.classList.add('is-hidden');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    });
  });
})();
