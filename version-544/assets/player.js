(function () {
    window.initMoviePlayer = function (sourceUrl, videoId, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hls = null;

        if (!video || !button || !sourceUrl) {
            return;
        }

        function loadVideo() {
            if (video.getAttribute("data-loaded") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            video.setAttribute("data-loaded", "1");
        }

        function startPlayback() {
            loadVideo();
            button.style.display = "none";
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.style.display = "flex";
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
            button.style.display = "none";
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.style.display = "flex";
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
