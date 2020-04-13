class VideoPlayer {
  constructor(video, src) {
    this.playing = false;
    this.video = video;
    this._setup_hiding();
    this._setup_play_pause();
    this._setup_progress();
    this._setup_fullscreen();
    this._setup_keyboard();
    if (src instanceof MediaStream) {
      this.video.srcObject = src;
    } else {
      this.video.src = URL.createObjectURL(src);
    }
  }

  _set_playing(playing) {
    if (playing) {
      this.playing = true;
      $("#play_pause").html(
        '<span class="oi oi-media-pause" title="Pause"></span>'
      );
      this._hide_controls();
    } else {
      this.playing = false;
      $("#play_pause").html(
        '<span class="oi oi-media-play" title="Play"></span>'
      );
      this._show_controls();
    }
  }

  _show_controls() {
    $("#controls").removeClass("hide");
  }

  _hide_controls() {
    setTimeout(() => {
      if (this.playing && $("#controls:hover").length == 0) {
        $("#controls").addClass("hide");
      }
    }, 3000);
  }

  _setup_hiding() {
    $("#controls").mouseenter(() => {
      this._show_controls();
    });
    $("#controls").mouseleave(() => {
      this._hide_controls();
    });
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
    $("#play_pause").click(() => {
      if (this.playing) {
        this.pause();
      } else {
        this.play();
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
    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        $("#fullscreen").html(
          '<span class="oi oi-fullscreen-exit" title="Exit fullscreen">'
        );
      } else {
        $("#fullscreen").html(
          '<span class="oi oi-fullscreen-enter" title="Enter fullscreen">'
        );
      }
    });
  }

  _setup_keyboard() {
    $(document).keydown((e) => {
      switch (e.which) {
        case 32: // space
          $("#play_pause").click();
          break;
        case 37: // left arrow
          this.video.currentTime -= 5;
          break;
        case 39: // right arrow
          this.video.currentTime += 5;
          break;
      }
    });
  }
}

class ClientVideoPlayer extends VideoPlayer {
  play() {
    this.peer.send({
      type: "play",
    });
  }

  pause() {
    this.peer.send({
      type: "pause",
    });
  }

  remote_play() {
    this._set_playing(true);
  }

  remote_pause() {
    this._set_playing(false);
  }
}

class ServerVideoPlayer extends VideoPlayer {
  constructor(...args) {
    super(...args);
    this.video.addEventListener("play", () => {
      this._set_playing(true);
      if (this.peer) {
        this.peer.send({
          type: "play",
        });
      }
    });
    this.video.addEventListener("pause", () => {
      this._set_playing(false);
      if (this.peer) {
        this.peer.send({
          type: "pause",
        });
      }
    });
  }

  play() {
    this.video.play();
  }

  pause() {
    this.video.pause();
  }

  remote_play() {
    this.play();
  }

  remote_pause() {
    this.pause();
  }
}

export { ClientVideoPlayer, ServerVideoPlayer };
