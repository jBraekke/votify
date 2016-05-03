'use strict';
angular.module('yapp')
  .controller('OverviewCtrl', function($scope, $rootScope) {
      
      //form values
      $scope.leftValue = '';
      $scope.rightValue = '';

      $scope.votes = [];
      
      var socket = io.connect();
      
      //submit a battle
      $scope.subBattle = function (form) {
      
        if($scope.leftValue.length > 2 && $scope.rightValue.length > 2){
            console.log('do request');
            
            var request = {
                leftQuestion : $scope.leftValue,
                rightQuestion : $scope.rightValue
            }
            
            socket.emit('create-vote', request, function(data){
                console.log(data, " : from server");
                //apply changes to view
                $rootScope.$apply(function () {
                   
                });
			});
            $scope.leftValue = '';
            $scope.rightValue = '';
            
        }
        else{
            console.log('go fuck yourself');
        }
      }
      
    $scope.makeVote = function(vote, side){
        var voted = localStorage.getItem('votes') === null ? [] : JSON.parse(localStorage.getItem('votes'));
        
        voted.forEach(function(element, index) {
            if(element.id === vote._id){
              voted.splice(index, 1); 
              vote.hasChanged = true; 
            }
        }, this);
        
        //save changes to localStore
        voted.push({id : vote._id, side : side});
        localStorage.setItem('votes', JSON.stringify(voted));
        
        vote.side = side;
        socket.emit('voted', vote);        
    }
      
    //eventhandler from socket.io
    socket.on('new-vote', function(data){
        
        console.log(data, ':from server!!')
        
        // do ratio
        data.ratio = 50;
        
        $rootScope.$apply(function () {
            $scope.votes.unshift(data);
        });
    });
    
    socket.on('load-old-votes', function(votes){
        
        console.log(localStorage.getItem('votes'), "voted on client")
        
        //console.log(votes, 'old-votes from server')
        
        var voted = localStorage.getItem('votes') === null ? [] : JSON.parse(localStorage.getItem('votes'));
        
        votes.forEach(function(vote, index) {
            
            votes[index].voted =  voted.filter(function(item){
                   return item.id === vote._id;  
                })[0];
            
            
            var ratio = 50;
            if(vote.leftQuestionVotes === 0 && vote.rightQuestionVotes === 0){
                ratio = 50;
            }
            else if(vote.leftQuestionVotes === 0 || vote.rightQuestionVotes === 0){
                vote.leftQuestionVotes === 0 ? ratio = 0 : ratio = 100;
            }
            else if(vote.leftQuestionVotes < vote.rightQuestionVotes){
                console.log(((vote.leftQuestionVotes/vote.rightQuestionVotes*100)/2), 'rightIsMore');
                ratio = (vote.leftQuestionVotes/vote.rightQuestionVotes*100)/2;
            }
            else if(vote.leftQuestionVotes > vote.rightQuestionVotes){
                console.log((100 - (vote.rightQuestionVotes/vote.leftQuestionVotes*100)/2), 'leftIsMore');
                ratio = 100 - (vote.rightQuestionVotes/vote.leftQuestionVotes*100)/2;
            }
            votes[index].ratio = ratio;
        }, this);
        
        $rootScope.$apply(function () {
            //add votes from server to view
            $scope.votes = votes;
            console.log(votes);  
        });
    });
    
    socket.on('new-user-message', function(message){
        toastr.success(message.message, message.username + ' signed in and says:');
        
    })  
      
  });
