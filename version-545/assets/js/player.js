import { H as Hls } from './hls.js';

export function initMoviePlayer(videoUrl) {
  const player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }

  const video = player.querySelector('video');
  const poster = player.querySelector('.player-poster');
  let loaded = false;
  let hls = null;

  function attach() {
    if (!video || loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = videoUrl;
    }
  }

  function start() {
    attach();
    player.classList.add('is-started');
    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  if (poster) {
    poster.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!loaded) {
      start();
    }
  });

  video.addEventListener('play', function () {
    player.classList.add('is-started');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
