class Peer {
  constructor({ signalling_url, peer_config }) {
    this.ws = new WebSocket(signalling_url);
    this.ws.onmessage = (message) => {
      var data = JSON.parse(message.data);
      console.log(data);
      if (data.type == "hello") {
        this.our_id = data.id;
        this.on_hello();
      } else {
        this.on_message(data);
      }
    };
    this.peer_config = peer_config;
  }

  connect() {
    this.peer = new window.RTCPeerConnection(this.peer_config);

    this.peer.onicecandidate = (e) => {
      if (e.candidate) {
        this.send_ice(e.candidate);
      }
    };
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.peer) {
      this.peer.close();
    }
  }

  send(data) {
    console.log("signalling.send", data);
    this.ws.send(
      JSON.stringify({
        ...data,
        from: this.our_id,
        to: this.their_id,
      })
    );
  }

  send_ice(candidate) {
    this.send({
      type: "ice-candidate",
      candidate,
    });
  }

  on_ice(data) {
    this.peer.addIceCandidate(
      new window.RTCIceCandidate(data.candidate),
      () => {},
      onError
    );
  }
}

function onError(e) {
  console.error(e);
}

export { Peer, onError };
