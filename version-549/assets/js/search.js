(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function formatViews(value) {
    if (value >= 10000) {
      return (value / 10000).toFixed(1) + '万';
    }

    return String(value);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">#' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="detail/' + escapeHtml(movie.record_id) + '.html" class="card-link" title="' + escapeHtml(movie.title) + '">',
      '    <figure class="media-frame" data-fallback-title="' + escapeHtml(movie.title) + '">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '      <span class="card-category">' + escapeHtml(movie.category) + '</span>',
      '    </figure>',
      '    <div class="card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.one_line || '') + '</p>',
      '      <div class="card-tags">' + tags + '</div>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '        <span>' + formatViews(movie.views || 0) + '播放</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function setupSearch() {
    var input = $('[data-search-input]');
    var category = $('[data-search-category]');
    var button = $('[data-search-button]');
    var results = $('[data-search-results]');
    var count = $('[data-search-count]');

    if (!input || !results || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
      input.value = initialQuery;
    }

    function render() {
      var keyword = normalize(input.value);
      var selectedCategory = normalize(category ? category.value : '');
      var matched = window.MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.one_line
        ].join(' '));

        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }

        if (selectedCategory && normalize(movie.category) !== selectedCategory) {
          return false;
        }

        return true;
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCard).join('\n') || '<div class="text-panel"><h2>没有找到匹配内容</h2><p>请尝试更换关键词或返回分类页浏览。</p></div>';

      if (count) {
        count.textContent = '找到 ' + matched.length + ' 条匹配结果' + (matched.length === 120 ? '（已展示前 120 条）' : '');
      }

      if (window.dispatchEvent) {
        window.dispatchEvent(new Event('resize'));
      }

      Array.prototype.slice.call(results.querySelectorAll('.media-frame img')).forEach(function (image) {
        image.addEventListener('error', function () {
          var frame = image.closest('.media-frame');
          if (frame) {
            frame.classList.add('is-missing');
          }
        });
      });
    }

    input.addEventListener('input', render);

    if (category) {
      category.addEventListener('change', render);
    }

    if (button) {
      button.addEventListener('click', render);
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', setupSearch);
})();
