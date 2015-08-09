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
      
      ws.on('close', function() {
        t.removeClient(client);
      });
    });
  },

  addClient : function(ws) {
    var client = new ChatClient(ws);
    this.clients.push(client);
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

// Using javascript constructors, i thought they were useful here to handle the chat clients, each one is a separate instance
var ChatClient = function(ws) {
  var registered = false;
  var ws = {};

  var t = this;
  
  t.setRegistered = function(val) {
    regitered = val;
  }
  
  ws.on('message', function incoming(msgJson) {
    ChatMsgHandler.process(t, msgJson);
  });
}

var ChatMsgHandler = {

  // static
  process : function(client, msgJson) {
    var t = ChatMsgHandler;

    console.log(msgJson);

    var msg = JSON.parse(msgJson);

    var msgType = msg.type;
    var handler = t[msgType];
    var hasHandler = (typeof handler != 'undefined');
    if (hasHandler) {
      handler(msg);
    }
  },

  chatRegister : function(client, msg) {
    console.log('chatRegister', client, msg);
    
    client.setRegistered(true);
  },

  chatMsg : function(client, msg) {
    console.log('chatMsg', client, msg);
  }

// add more handlers here by declaring functions with the msg type as their name

}

module.exports = ChatServer;
