var ChatClientFactory = {
  create : function() {
    var client = $.extend(true, {}, ChatClient);
    client.init();
    return client;
  }
}

var ChatClient = {
  SERVER_HOST : 'localhost',
  
  msgType : {
    register : 'chatRegister',
    message : 'chatMessage',
  },

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

  register : function(name) {
    this.send({
      type : this.msgType.register,
      data : {
        name : name
      }
    });
  },
  
  say : function(msg) {
    this.send({
      type : this.msgType.message,
      data : {
        msg : msg
      }
    });
  },
  
  /**
   * private
   * 
   * @param Object with message type and data
   */
  send : function(msg) {
    var finalMsg = '';
    if (typeof msg == 'object') {
      finalMsg = JSON.stringify(msg);
    }
    
    this.ws.send(finalMsg);
  }

}
