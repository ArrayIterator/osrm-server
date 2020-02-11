module.exports = (port, callback, ...variable) => {
    const net = require('net');
    let server = net.createServer(function(socket) {
	   socket.write('Echo server\r\n');
    	socket.pipe(socket);
    });
    server.listen(port, '127.0.0.1');
    server.on('error', function (e) {
	   callback(true, port, ...variable);
    });

    server.on('listening', function (e) {
	   server.close();
	   callback(false, port, ...variable);
    });
};
