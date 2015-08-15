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

  pending : [],

  PENDING_CHECK_INTERVAL : 2000,
  PENDING_RESPONSE_TIMEOUT : (5 * 1000), // every 5 seconds
  PENDING_MAX_RETRIES : 3,

  msgType : {
    register : 'chatRegister',
    message : 'chatMessage',
  },

  PORT : 8734,

  // public
  init : function() {
    var t = ChatClient;

    var url = 'ws://' + this.SERVER_HOST + ':' + this.PORT;
    t.server = new WebSocket(url);

    t.server.onmessage = this.onMessage;

    setInterval(this.checkPending, t.PENDING_CHECK_INTERVAL);
  },
  
  end : function() {
    t.server.close();
  },

  onMessage : function(event) {
    var t = ChatClient;

    var msg = event.data;

    t.processMsg(msg);
  },

  processMsg : function(msg) {
    ChatMsgHandler.process(this, msg);
  },

  checkPending : function() {
    var t = ChatClient;

    var hasPending = (t.pending.length > 0);
    if (hasPending) {
      doCheck();
    }
    
    function doCheck() {
     var now = new Date();
     for (var i = 0; i < t.pending.length; i++) {
       var msg = t.pending[i];
 
       var respData = msg.respData;
 
       var lastRetry = respData.lastRetry;
       var timeElapsed = Math.abs(now.getTime() - lastRetry.getTime());
 
        console.log('time elapsed in seconds=', Math.round(timeElapsed / 1000));

       var doRetry = (timeElapsed > t.PENDING_RESPONSE_TIMEOUT);
       if (doRetry) {
         t.retry(msg);

         var isLastRetry = (respData.retries == t.PENDING_MAX_RETRIES);
         if (isLastRetry) {
           t.pending.splice(i, 1);
           
           console.log('giving up for', msg);
         }
       }
     }
    }
  },
  
  retry : function(msg) {
    var t = ChatClient;
    
    var retryMsg = t.cloneMsg(msg);
    delete retryMsg.respData;
    var isRetry = true;
    t.send(retryMsg, isRetry);

    var respData = msg.respData;
    respData.retries++;
    respData.lastRetry = new Date();

    console.log(retryMsg, 'no confirmation received, retrying...');
  },
  
  cloneMsg : function(msg) {
    return $.extend(true, {}, msg);
  },

  register : function(name) {
    this.send({
      type : this.msgType.register,
      data : {
        name : name
      }
    });
  },

  /**
   * Say something in the chat
   * 
   * @param String message
   * @param optional function to be called when the server confirms msg reception
   */
  say : function(msg, onConfirm) {
    this.send({
      type : this.msgType.message,
      data : {
        text : msg
      },
      onConfirm : onConfirm
    });
  },

  getSeq : function() {
    return (++this.seq);
  },

  getPending : function() {
    return this.pending;
  },

  addToPending : function(msg) {
    var t = ChatClient;

    var respData = {
      retries : 0,
      lastRetry : new Date()
    }

    msg.respData = respData;

    t.pending.push(msg);
  },

  /**
   * private
   * 
   * @param Object
   *         with message type and data
   * @param Boolean
   *         is retrying
   */
  send : function(msg, isRetry) {
    var t = ChatClient;

    var isObject = (typeof msg == 'object');
    if (isObject) {
      var msgJson = '';

      msg.seq = this.getSeq();
      msgJson = JSON.stringify(msg);

      t.server.send(msgJson);

      var isRetrying = (typeof isRetry != 'undefined' && isRetry);
      if (!isRetrying) {
        t.addToPending(msg);
      }

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
    var pending = chatClient.getPending();
    for (var i = 0; i < pending.length; i++) {
      var pendingMsg = pending[i];

      var isMsg = (msg.seq == pendingMsg.seq);
      if (isMsg) {
        var hasOnConfirm = (typeof pendingMsg.onConfirm != 'undefined');
        if (hasOnConfirm) {
          pendingMsg.onConfirm();
        }

        pending.splice(i, 1);
        break;
      }
    }
  },

  // a chat participant said something
  chatMessage : function(chatClient, msg) {
    nc.Event.fire('msgReceived', {
      sender : msg.sender,
      text : msg.text
    });
  }

}