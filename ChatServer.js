var net = require('net');

var ChatServer = {
  MESSAGE_END_CHAR : 13,

  clients : [],

  server : {},

  PORT : 8124,

  start : function() {
    this.server = http.createServer(this.handleRequests);
    this.server.listen(this.PORT);
  },

  addObserver : function(client) {
    this.clients.push(client);
  },

  removeObserver : function(client) {
    for (var i = 0; i < this.clients.length; i++) {
      var isClient = (this.clients[i] == client);
      if (isClient) {
        this.clients.splice(i, 1);
        break;
      }
    }
  },

  notify : function(sender, msg) {
    for (var i = 0; i < this.clients.length; i++) {
      var isSender = (sender == this.clients[i]);
      if (!isSender) {
        var c = this.clients[i];
        c.write(msg + '\r\n');
      }
    }
  },

  // public
  start : function() {
    var t = ChatServer;

    var server = net.createServer(function(c) {
      console.log('client connected');
      
      t.addObserver(c);

      c.on('end', function() {
        console.log('client disconnected');

        t.removeObserver(c);
      });

      var buffers = [];
      c.on('data', function(buffer) {
        var text = buffer.toString();
        var finalChar = text.substr(-1);
        var hasMessage = (finalChar.charCodeAt(0) == t.MESSAGE_END_CHAR);
        if (hasMessage) {
          var finalBuffer = Buffer.concat(buffers);

          var message = finalBuffer.toString();
          console.log('Received: ', message);

          t.notify(c, message);

          buffers = [];
        } else {
          buffers.push(buffer);
        }
      });
    });
    server.listen(8124, function() { // 'listening' listener
      console.log('server bound');
    });
  }
}

module.exports = ChatServer;
