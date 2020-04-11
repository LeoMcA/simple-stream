var uuid = require('uuid')
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({ port: 8081, clientTracking: true });

wss.on('connection', (ws) => {
  ws.id = uuid.v4()
  ws.on('message', (dataString) => {
    var data = JSON.parse(dataString)
    console.log(data)
    try {
      var client = Array.from(wss.clients).find(e => e.id == data.to)
      if (client) {
        client.send(JSON.stringify({
          ...data,
          from: ws.id
        }))
      } else {
        ws.send(JSON.stringify({
          type: 'lost-peer'
        }))
      }
    } catch(e){
      console.log(e)
    }
  })

  ws.send(JSON.stringify({
    type: 'hello',
    id: ws.id
  }))
})
