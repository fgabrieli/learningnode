var ChatClientFactory = {
  create : function() {
    var client = $.extend(true, {}, ChatClient);
    client.init();
    return client;
  }
}

var ChatClient = {
  SERVER_HOST : 'localhost',

  PORT : 8734,

  init : function() {
    var url = 'ws://' + this.SERVER_HOST + ':' + this.PORT;
    this.ws = new WebSocket(url);

    this.ws.onmessage = this.onMessage;
  },

  onMessage : function(event) {
    var msg = event.data;

    nc.Event.fire('msgReceived', {
      msg : msg
    });
  },

  send : function(msg) {
    this.ws.send(msg);
  }

}
