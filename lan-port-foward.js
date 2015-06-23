var net = require('net');

var self = module.exports;

self.createServer = function(recvPort, fowardPort) {

	var recvConn;
	var forwardConn;

	net.createServer(function(c) {
		recvConn = c;
		recvConn.on('data', function(data) {
			if (forwardConn) {
				forwardConn.write(data);
				console.log('Get From Forward: ' + data);
			} else {
				console.error("Null forwardConn " + forwardConn);
			}
		});
		recvConn.on('end', function() {
		  console.log('recvConn disconnected from server');
		});
	}).listen(recvPort);

	net.createServer(function(c) {
		forwardConn = c;
		console.error("Now recvConn " + recvConn);
		forwardConn.on('data', function(data){
			if (recvConn) {
				recvConn.write(data);
				console.log('Get From Recv: ' + data);
			} else {
				console.error("Null recvConn");
			}
		});
		forwardConn.on('end', function() {
		  console.log('forwardConn disconnected from server');
		});
	}).listen(fowardPort);
}

self.createClient = function(localPort, remotePort, remoteHost) {

	var remoteClient;
	var localClient;
	remoteClient = net.connect(remotePort, remoteHost, function(){
		console.log("connect to server: " + remotePort);
	});
	remoteClient.on('data', function(data) {
		if (localClient) {
			localClient.write(data);
			console.log('local client get: ' + data);
		} else 
			console.error("no localClient");
	});
	remoteClient.on('end', function() {
	  console.log('remoteClient disconnected from server');
	});

	localClient = net.connect(localPort, function() {
		console.log("connect to local: " + localPort);
	});
	localClient.on('data', function(data) {
		if (remoteClient) {
			remoteClient.write(data);
			console.log('remoteClient get: ' + data);
		} else {
			console.error("no remoteClient");
		}
	});
	localClient.on('end', function() {
	  console.log('localClient disconnected from server');
	});

}

// send some to 123 -> 321 ->  local 321 -> 111
self.createServer(123, 321);
setTimeout(function() {
	self.createClient(888, 321, 'localhost');	
}, 2000);



net.createServer(function(c) {
	var i = 0;
	setInterval(function(){
	 	c.write('hi!!' + i.toString() + '\n');
	 	i++;
	}, 1000);
	// c.on('data', function(data) {
	// 	console.log("Get from Test: " + data);
	// 	c.write(data);
	// });
}).listen(888);