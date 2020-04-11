import { Peer, onError } from './Peer.js'

class Client extends Peer {
  constructor({
    on_channel_open,
    data_string,
  }) {
    const data = JSON.parse(atob(decodeURIComponent(data_string)))
    super({
      signalling_url: data.s,
      peer_config: data.p
    })
    this.their_id = data.i
    this.on_channel_open = on_channel_open
  }

  on_hello() {
    this.send({
      type: 'file-request'
    })
  }

  on_message(data) {
    switch (data.type) {
      case 'file-info':
        this.on_file_info(data)
        break
      case 'webrtc-offer':
        this.on_offer(data)
        break
      case 'ice-candidate':
        this.on_ice(data)
        break
    }
  }

  on_file_info(data) {
    this.file_length = data.length;
  }

  on_offer(data) {
    this.connect()
    this.peer.ontrack = (e) => {
      this.on_channel_open(e)
    }
    this.peer.setRemoteDescription(new window.RTCSessionDescription(data.offer), () => {
      this.send_answer()
    }, onError);
  }

  send_answer() {
    this.peer.createAnswer((answer) => {
      this.peer.setLocalDescription(answer, () => {
        this.send({
          type: 'webrtc-answer',
          answer: answer
        })
      }, onError)
    }, onError)
  }
}

export default Client
