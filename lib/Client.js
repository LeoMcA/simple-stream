import { Peer, onError } from "./Peer.js";

class Client extends Peer {
  constructor(data_string) {
    const data = JSON.parse(atob(decodeURIComponent(data_string)));
    super({
      signalling_url: data.s,
      peer_config: data.p,
    });
    this.their_id = data.i;
  }

  on_hello() {
    this.signalling_send({
      type: "connection-request",
    });
    this.connect();
    this.peer.ontrack = (e) => {
      this.on_channel_open(e);
    };
    this.peer.ondatachannel = (e) => {
      this.data_channel = e.channel;
      this.data_channel.onmessage = (e) => {
        if (this.on_message) {
          this.on_message(JSON.parse(e.data));
        }
      };
    };
  }

  on_signalling_message(data) {
    switch (data.type) {
      case "webrtc-offer":
        this.on_offer(data);
        break;
      case "ice-candidate":
        this.on_ice(data);
        break;
    }
  }

  on_offer(data) {
    this.peer.setRemoteDescription(
      new window.RTCSessionDescription(data.offer),
      () => {
        this.send_answer();
      },
      onError
    );
  }

  send_answer() {
    this.peer.createAnswer((answer) => {
      this.peer.setLocalDescription(
        answer,
        () => {
          this.signalling_send({
            type: "webrtc-answer",
            answer: answer,
          });
        },
        onError
      );
    }, onError);
  }
}

export default Client;
