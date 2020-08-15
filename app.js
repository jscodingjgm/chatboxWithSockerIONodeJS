var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);


var users = {};

var port = process.env.PORT || 4000;

server.listen(port, function() {
  console.log("Server started %s ", port);
});

app.use(express.static(__dirname + '/public'));

app.set('view engine','ejs');

app.get('/',function(req,res){
     res.render('index'); //rendering an ejs tempalte file
});

io.sockets.on('connection',function(socket){

      console.log("A New Connection Established");

      socket.on('new user',function(data, callback){
       
        if(data in users){
          console.log("Username already taken");
          callback(false);
        }
        else{
          console.log("Username available");
          callback(true);

          socket.nickname = data;
          users[socket.nickname] = socket;
          updateNicknames();
        }
      });


      function updateNicknames(){
        io.sockets.emit('usernames', Object.keys(users) );
      }


      socket.on('send message',function(data,callback){
        var msg = data.trim();
        console.log("Got Message :"+data)
        io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
      });


      socket.on('disconnect',function(data){
            if(!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames();
      });


});
