import { Peer, onError } from "./Peer.js";

class Server extends Peer {
  constructor({ signalling_url, file_length, stream, peer_config, on_share }) {
    super({
      signalling_url,
      peer_config,
    });
    this.signalling_url = signalling_url;
    this.peer_config = peer_config;
    this.file_length = file_length;
    this.stream = stream;
    this.on_share = on_share;
  }

  create_data_url_component() {
    return encodeURIComponent(
      btoa(
        JSON.stringify({
          s: this.signalling_url,
          i: this.our_id,
          p: this.peer_config,
        })
      )
    );
  }

  on_hello() {
    const data_string = this.create_data_url_component();
    console.log(data_string);
    if (this.on_share) {
      this.on_share(data_string);
    }
  }

  on_signalling_message(data) {
    switch (data.type) {
      case "connection-request":
        this.on_connection_request(data);
        break;
      case "webrtc-answer":
        this.on_answer(data);
        break;
      case "ice-candidate":
        this.on_ice(data);
        break;
    }
  }

  on_connection_request(data) {
    this.their_id = data.from;

    this.connect();
    this.create_tracks();
    this.create_channel();
    this.send_offer();
  }

  create_tracks() {
    this.stream.getTracks().forEach((track) => {
      this.peer.addTrack(track, this.stream);
    });
  }

  create_channel() {
    this.data_channel = this.peer.createDataChannel("messages");
    this.data_channel.onmessage = (e) => {
      if (this.on_message) {
        this.on_message(e.data);
      }
    };
    this.data_channel.onopen = (e) => {
      if (this.data_channel.readyState === "open") {
      }
    };
  }

  send_offer() {
    this.peer.createOffer((offer) => {
      this.peer.setLocalDescription(
        offer,
        () => {
          this.signalling_send({
            type: "webrtc-offer",
            offer,
          });
        },
        onError
      );
    }, onError);
  }

  on_answer(data) {
    this.peer.setRemoteDescription(
      new window.RTCSessionDescription(data.answer),
      () => {},
      onError
    );
  }
}

export default Server;
