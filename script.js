import Client from "./lib/Client.js";
import Server from "./lib/Server.js";
import Emoji from "./lib/Emoji.js";
import { ClientVideoPlayer, ServerVideoPlayer } from "./lib/VideoPlayer.js";

const video = document.querySelector("video");
const files = document.querySelector("input[type=file]");
const emoji = new Emoji();

if (getParameterByName("d")) {
  // we're a client

  $("body").addClass("client");
  $("#welcome_modal").modal("show");

  $("#connect").click(() => {
    $("#welcome_modal").modal("hide");
    const client = new Client(getParameterByName("d"));
    client.on_channel_open = (e) => {
      console.log("on_channel_open");
      const player = new ClientVideoPlayer(video, e.streams[0]);
      player.peer = client;
      client.on_message = (msg) => {
        switch (msg.type) {
          case "emoji":
            emoji.render_emoji(msg.value);
            break;
          case "play":
            player.remote_play();
            break;
          case "pause":
            player.remote_pause();
        }
      };
      video.play();
    };
    emoji.peer = client;
  });
} else {
  // we're a server

  ["signalling", "server", "username", "password"].forEach((x) => {
    $("#" + x).val(localStorage.getItem(x));
  });

  $("#save").click(() => {
    $("#settings_modal").modal("hide");
    ["signalling", "server", "username", "password"].forEach((x) => {
      localStorage.setItem(x, $("#" + x).val());
    });
  });

  function updateVideo() {
    const file = files.files[0];
    const player = new ServerVideoPlayer(video, file);
    const stream = video.captureStream
      ? video.captureStream()
      : video.mozCaptureStream();
    const server = new Server({
      signalling_url: localStorage.getItem("signalling"),
      peer_config: {
        iceServers: [
          {
            urls: document.querySelector("#server").value,
            username: document.querySelector("#username").value,
            credential: document.querySelector("#password").value,
          },
        ],
      },
      stream,
      on_share: (data_string) => {
        $("#share_url").val("https://stream.mcardle.io/?d=" + data_string);
        $("#share_modal").modal("show");
      },
    });
    server.on_message = (msg) => {
      switch (msg.type) {
        case "emoji":
          emoji.render_emoji(msg.value);
          break;
        case "play":
          player.remote_play();
          break;
        case "pause":
          player.remote_pause();
      }
    };
    emoji.peer = server;
    player.peer = server;
  }

  files.addEventListener("input", (e) => {
    updateVideo();
  });
}

function getParameterByName(name) {
  var match = RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}
