class VideoPlayer {
  constructor(video, src) {
    this.video = video;
    this._setup_play_pause();
    this._setup_progress();
    this._setup_fullscreen();
    this.video.src = src;
  }

  _setup_progress() {
    this.progress = document.querySelector("#controls input[type=range]");
    this.video.addEventListener("loadedmetadata", () => {
      this.progress.setAttribute("max", this.video.duration);
    });
    this.video.addEventListener("timeupdate", () => {
      this.progress.value = this.video.currentTime;
    });
    this.progress.addEventListener("input", () => {
      this.video.currentTime = this.progress.value;
    });
  }

  _setup_play_pause() {
    $("#play_pause").click(({ currentTarget: n }) => {
      if (this.video.paused) {
        this.video.play();
      } else {
        this.video.pause();
      }
    });
  }

  _setup_fullscreen() {
    $("#fullscreen").click((_) => {
      if (!document.fullscreenElement) {
        $("#fullscreen_wrapper")[0].requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }
}

export default VideoPlayer;
