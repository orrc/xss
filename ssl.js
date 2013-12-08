var fs = require('fs');

var options = {
  key:  fs.readFileSync('test.orr.me.uk.key'),
  cert: fs.readFileSync('test.orr.me.uk.crt.chain'),
};

var app = require('https').createServer(options);
var io = require('socket.io').listen(app);

app.listen(8443);

io.enable('browser client gzip');
io.enable('browser client etag');
io.enable('browser client minification');
//io.set('log level', 1);

var spectators = io.of('/spectators').on('connection', function (socket) {
  socket.emit('count', victimCount);
});

var victimCount = 0;

io.of('/victims').on('connection', function (socket) {

  spectators.emit('count', ++victimCount);
  sendMsg('Arrived from IP ' + socket.handshake.address.address);

  socket.on('disconnect', function(msg) {
    spectators.emit('count', --victimCount);
    sendMsg('Left');
  });

  socket.on('info', function(msg) {
    sendMsg('Browser: ' + msg);
  });

  socket.on('submit', function(msg) {
    sendMsg('Form submitted! Email: ' + msg['user'] + ', password length: ' + msg['pass_length']);
  });

  socket.on('result', function(msg) {
    sendMsg('Login result: ' + msg);
  });

  function sendMsg(msg) {
    spectators.emit('message', '[' + socket.id.substring(0, 5) + '] ' + msg);
  }
  
});
