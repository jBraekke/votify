var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	mongoose = require('mongoose'),
	users = {},
  port = process.env.PORT || 3000;
	
server.listen(port);
console.log('magic happens on localhost:' + port);

app.use(express.static((__dirname, 'public/app'))); 
app.use(express.static((__dirname, 'public'))); 

app.get('/vote', function(req, res){
	res.sendfile(__dirname + '/public/app/index.html');
});

// get new connection URI from https://mlab.com/

var connectionURI = 'mongodb://test:test@ds032579.mlab.com:32579/vote'; 

mongoose.connect(connectionURI, function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

//voteSchema
var voteSchema = mongoose.Schema({
	leftQuestion: String,
	rightQuestion: String,
  	leftQuestionVotes: {type: Number, default: 0},
  	rightQuestionVotes: {type: Number, default: 0},
	created: {type: Date, default: Date.now},
  	modified: {type: Date, default: Date.now},
  	ratio:  {type: Number, default: 0}
});

var Vote = mongoose.model('Vote', voteSchema);

//socket config
io.sockets.on('connection', function(socket){
	
	socket.on('disconnect', function(data){
    console.log('socket disconnect!', data);
	});
  
  //create new vote
  socket.on('create-vote', function(data, callback){
    console.log(data, " : data from client");
    
    var newVote = new Vote({
        leftQuestion: data.leftQuestion, 
        rightQuestion: data.rightQuestion
      });
      
		  newVote.save(function(err, newVote){
				if(err) throw err;
				io.sockets.emit('new-vote', newVote);
		});
    
    //callback('this is the callback!');
  });
  
  //voted
  socket.on('voted', function(vote){
    console.log('voted!', vote.side);
    var voteTicket = vote;
    Vote.findById(vote._id, function(err, vote){
      //console.log('found it!!', vote);
      if(voteTicket.side === 'left'){
        vote.leftQuestionVotes++;
        if(voteTicket.hasChanged){
          vote.rightQuestionVotes--;
        }
      }
      else if(voteTicket.side === 'right'){
        vote.rightQuestionVotes++;
          if(voteTicket.hasChanged){
            vote.leftQuestionVotes--;
          }
      }
      
      vote.save(function(){
        console.log('saved!');
        startup();
      });
      
    })
  });
  
  //startup
  startup()
	function startup(){
    Vote.find({}).sort({created: -1}).limit(30).exec(function(err, votes){
      if(err) throw err;
      
      io.sockets.emit('load-old-votes', votes);
    });
  }
  
  //write message to all sockets
  socket.on('new-user', function(userObj){
    console.log('new-user!!', userObj);
    io.sockets.emit('new-user-message', userObj);  
  })
  
  
});