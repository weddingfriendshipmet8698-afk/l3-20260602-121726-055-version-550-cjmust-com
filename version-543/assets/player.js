(function () {
    var configElement = document.getElementById("playerConfig");
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");

    if (!configElement || !video || !button) {
        return;
    }

    var config = JSON.parse(configElement.textContent || "{}");
    var source = config.source;
    var Hls = window.Hls;
    var ready = false;
    var hlsInstance = null;

    function attachSource() {
        if (ready || !source) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        attachSource();
        button.classList.add("hide");
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                button.classList.remove("hide");
            });
        }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("hide");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            button.classList.remove("hide");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
