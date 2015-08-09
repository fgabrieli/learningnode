var ChatServer = {
  LISTEN_ADDRESS : '0.0.0.0',
  LISTEN_PORT : 8734,

  clients : [],

  start : function() {
    var t = ChatServer;

    var WebSocketServer = require('ws').Server;

    wss = new WebSocketServer({
      address : this.LISTEN_ADDRESS,
      port : this.LISTEN_PORT
    });

    wss.on('connection', function connection(ws) {
      console.log('client connected');
      t.addClient(ws);
      t.setupClient(ws);
    });
  },

  setupClient : function(client) {
    var t = ChatServer;

    client.on('message', function incoming(msg) {
      t.broadcast(msg);
    });

    client.on('close', function() {
      t.removeClient(client);
    });
  },

  addClient : function(client) {
    var t = ChatServer;

    t.clients.push(client);
  },

  removeClient : function(client) {
    var t = ChatServer;

    for (var i = 0; i < t.clients.length; i++) {
      if (client == t.clients[i]) {
        t.clients.splice(i, 1);
        break;
      }
    }
  },

  broadcast : function(msg) {
    var t = ChatServer;

    for (var i = 0; i < t.clients.length; i++) {
      t.clients[i].send(msg);
    }
  }

}

module.exports = ChatServer;
