/**
 * nodeChat v0.1 
 * 
 * @author Fernando Gabrieli
 */

var ChatClientFactory = {
  create : function() {
    var client = $.extend(true, {}, ChatClient);
    client.init();
    return client;
  }
}

var ChatClient = {
  SERVER_HOST : 'localhost',

  server : {},
  
  seq : 0,
  
  pendingAck : [],
  
  msgType : {
    register : 'chatRegister',
    message : 'chatMessage',
  },

  PORT : 8734,

  // public
  init : function() {
    var url = 'ws://' + this.SERVER_HOST + ':' + this.PORT;
    this.server =  new WebSocket(url);

    this.server.onmessage = this.onMessage;
  },

  onMessage : function(event) {
    var t = ChatClient;

    var msg = event.data;
    
    t.process(msg);
  },

  process : function(msg) {
    ChatMsgHandler.process(this, msg);
  },
  
  register : function(name) {
    this.send({
      type : this.msgType.register,
      data : {
        name : name
      }
    });
  },

  // public
  say : function(msg) {
    this.send({
      type : this.msgType.message,
      data : {
        text : msg
      }
    });
  },

  getSeq : function() {
    return (++this.seq);
  },
  
  getPendingAck : function() {
    return this.pendingAck;
  },

  /**
   * private
   * 
   * @param Object with message type and data
   */
  send : function(msg) {
    var isObject = (typeof msg == 'object');
    if (isObject) { 
      var msgJson = '';

      msg.seq = this.getSeq();
      msgJson = JSON.stringify(msg);

      this.server.send(msgJson);
      
      this.pendingAck.push(msg);
    } else {
      console.log('ChatClient.send() Error: message to be sent must be an object');
    }
  }

}

var ChatMsgHandler = {
  process : function(chatClient, msgJson) {
    var msg = JSON.parse(msgJson);
    var type = msg.type;
    var handler = ChatMsgHandler[type];
    var hasHandler = (typeof handler != 'undefined');
    if (hasHandler) {
      handler(chatClient, msg);
    }
  },
  
  // server ack for a client previous message
  chatAck : function(chatClient, msg) {
   console.log('received Ack from server, seq=', msg.seq);
   var pendingAck = chatClient.getPendingAck();
   for (var i = 0; i < pendingAck.length; i++) {
     var pending = pendingAck[i];

     var isMsg = (msg.seq == pending.seq);
     if (isMsg) {
       pendingAck.splice(i, 1);
       break;
     }
   } 
  },
  
  // a chat participant said something
  chatMessage : function(chatClient, msg) {
    var msgText = msg.text;
    nc.Event.fire('msgReceived', {
      text : msgText
    });
  }

}