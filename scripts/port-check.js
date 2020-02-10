var net = require('net');

var portInUse = function(port, callback, ...variable) {
    var server = net.createServer(function(socket) {
	   socket.write('Echo server\r\n');
    	socket.pipe(socket);
    });

    server.listen(port, '127.0.0.1');
    server.on('error', function (e) {
	   callback(true, ...variable);
    });

    server.on('listening', function (e) {
	   server.close();
	   callback(false, ...variable);
    });
};

module.exports = portInUse;
