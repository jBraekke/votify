'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('LoginCtrl', function($scope, $location) {
    
    /*$('input[name=photo]').change(function(e) {
        var file = e.target.files[0];
        canvasResize(file, {
            width: 100,
            height: 0,
            crop: false,
            quality: 80,
            //rotate: 90,
            callback: function(data, width, height) {
                console.log(data, width, height, 'PHOTO!');
                 $('.user-avatar').attr('src', data);
            }
        });
    });*/
    
    var socket = io.connect();
    
    $scope.submit = function() {
      
      var userObj = {
        username : $scope.name,
        message : $scope.message
      };
      
      $location.path('/dashboard');
      socket.emit('new-user', userObj);
      
      return false;
       
    }

  });
