(function () {
  function setMessage(message) {
    var messageNode = document.querySelector('[data-player-message]');

    if (messageNode) {
      messageNode.textContent = message || '';
    }
  }

  function initializePlayer(video) {
    var source = video.getAttribute('data-src');

    if (!source) {
      setMessage('当前影片暂未绑定播放源。');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          setMessage('播放器已就绪，请再次点击播放。');
        });
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放源加载失败，请检查网络或稍后再试。');
        }
      });
      video.__hlsInstance = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          setMessage('播放器已就绪，请再次点击播放。');
        });
      }, { once: true });
      return;
    }

    setMessage('当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge 或 Safari。');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('moviePlayer');
    var button = document.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function () {
      button.classList.add('is-hidden');

      if (!video.__playerReady) {
        video.__playerReady = true;
        initializePlayer(video);
      } else {
        video.play();
      }
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
      setMessage('');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
  });
})();
