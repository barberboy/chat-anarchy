var express = require('express'),
    http = require('http'),
    Moniker = require('moniker'),
    hbs = require('hbs');

var names = Moniker.generator([Moniker.adjective, Moniker.noun], {
    glue: ' '
});

var app = express();
var server = http.createServer(app);


// Set Handlebars running and as the engine for html
app.set('view engine', 'hbs');
app.engine('html', hbs.__express);

// Set the port and ip address
app.set('port', process.env.PORT || 8000);
app.set('ip', process.env.IP || '0.0.0.0');

app.get('/about', function(req, res, next) {
    res.render('about', {
        title: 'chat-anarchy' + req.path,
        about: true
    });
});

/*
app.get('/join', function(req, res, next) {
    res.render('join', {
        title: 'chat-anarchy' + req.path
    });
});
*/

app.get('/*', function(req, res, next) {
    res.render('index', {
        title: 'chat-anarchy' + req.path
    });
});

var io = require('socket.io')(server);
io.on('connection', function(socket) {
    socket.user = names.choose();
    //console.log("%s connected.", socket.user);
    socket
        .on('join', function(room) {
            //console.log("%s joined %s", socket.user, room);
            socket.join(socket.room = room);
            io.to(socket.room).emit('joined', socket.user);
        })
        .on('message', function(message) {
            //console.log("%s: %s %s", socket.user, message, socket.room);
            io.to(socket.room).emit('message', {
                u: socket.user,
                m: message
            });
        })
        .on('disconnect', function() {
            //console.log("%s left %s", socket.user, socket.room);
            io.to(socket.room).emit('left', socket.user);
        });
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("Chat Anarchy listening at", addr.address + ":" + addr.port);
});