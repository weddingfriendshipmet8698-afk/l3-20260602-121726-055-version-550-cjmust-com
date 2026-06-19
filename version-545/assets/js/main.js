(function () {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    const button = document.querySelector('.mobile-menu-button');
    const panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.hidden = expanded;
    });
  }

  function setupFilters() {
    document.querySelectorAll('.filter-scope').forEach(function (scope) {
      const input = scope.querySelector('.filter-input');
      const selects = Array.from(scope.querySelectorAll('.filter-select'));
      const reset = scope.querySelector('.filter-reset');
      const cards = Array.from(scope.querySelectorAll('.movie-card'));
      const count = scope.querySelector('.visible-count');
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');

      if (input && q) {
        input.value = q;
      }

      function apply() {
        const keyword = normalize(input ? input.value : '');
        let visible = 0;
        cards.forEach(function (card) {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
          ].join(' '));
          const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          const matchSelects = selects.every(function (select) {
            const value = normalize(select.value);
            const key = select.dataset.filter;
            return !value || normalize(card.dataset[key]) === value;
          });
          const show = matchKeyword && matchSelects;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          selects.forEach(function (select) {
            select.value = '';
          });
          apply();
        });
      }
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupFilters();
  });
})();
