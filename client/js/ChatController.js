var ChatController = {
  client : {},

  init : function() {
    this.client = ChatClientFactory.create();
  },

  ngController : function($scope) {
    var t = ChatController;

    $scope.msgs = [];

    nc.Event.bind('msgReceived', 'ChatController', function(data) {
      $scope.msgs.push({
        text : data.msg
      });
      $scope.$apply();
    });

    $scope.sendMsg = function() {
      t.client.send($scope.msg);
      $scope.msg = '';
    };

    $scope.onKeyUp = function(e) {
      var KEY_ENTER = 13;

      if (e.keyCode == KEY_ENTER) {
        $scope.sendMsg();
      }
    }
  }
}

ChatController.init();

webApp.controller('ChatController', ChatController.ngController);