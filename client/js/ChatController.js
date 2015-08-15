/**
 * nodeChat v0.1 
 * 
 * @author Fernando Gabrieli
 */

var ChatController = {
  client : {},

  init : function() {
    this.client = ChatClientFactory.create();
  },

  ngController : function($scope) {
    var t = ChatController;

    $scope.msgs = [];

    $scope.isRegistered = false;
    
    nc.Event.bind('msgReceived', 'ChatController', function(msg) {
      $scope.msgs.push({
        isMine : (msg.sender == $scope.name),
        sender : msg.sender,
        text : msg.text
      });
      $scope.$apply();
    });
    
    $(window).on('beforeunload', function() {
      t.client.end();
    });

    $scope.sendMsg = function() {
      t.client.say($scope.msg);
      $scope.msg = '';
    };

    $scope.onKeyUp = function(e) {
      var KEY_ENTER = 13;

      if (e.keyCode == KEY_ENTER) {
        $scope.sendMsg();
      }
    };
    
    $scope.register = function() {
      t.client.register($scope.name);
      
      // XXX: need to implement veryfing the ack from server, otherwise we are blinded
      
//      
//      function onSuccess() {
        $scope.isRegistered = true;
        $scope.$apply();
//      });
    }
  }
}

ChatController.init();

webApp.controller('ChatController', ChatController.ngController);