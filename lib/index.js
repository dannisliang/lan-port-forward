var net = require('net');
var util = require('util');

var self = module.exports;

self.createServer = function(recvPort, forwardPort) {

	var recvConn;
	var forwardConn;
	var forwardName = "ForwardServer-" + forwardPort;
	var recvName = "RecvServer-" + recvPort;

	net.createServer(function(c) {
		recvConn = c;
		recvConn.on('data', function(data) {
			if (forwardConn) {
				forwardConn.write(data);
				console.log('Get From Forward: ' + data.length);
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
				console.log('Get From Recv: ' + data.length);
			} else {
				console.error("Null recvConn");
			}
		});
		forwardConn.on('end', function() {
		  console.log('forwardConn disconnected from server');
		});
	}).listen(forwardPort);
}

self.createClient = function(localPort, remotePort, remoteHost) {

	var remoteClient;
	var localClient;
	var remoteClientName = util.format("RemoteClient-%s-%s", remotePort, remoteHost);
	var localClientName = util.format("LocalClient-%s", localPort);
	function doRemoteClient() {
		remoteClient = net.connect(remotePort, remoteHost, function(){
			console.log("[CONNECT] %s ", remoteClientName);
		});
		remoteClient.on('data', function(data) {
			if (localClient) {
				localClient.write(data);
				console.log('[SEND] %s: ' + data.length, localClientName);
			} else 
				console.log('[WAIT] redirect %s: ' + data.length, localClientName);
		});
		remoteClient.on('error', function(e) {
		  console.log('[ERROR] %s ' + e, remoteClientName);
		  doRemoteClient();
		});
		remoteClient.on('end', function() {
		  console.log('[END] %s disconnected from server', remoteClientName);
		  doRemoteClient();
		});

	}
	doRemoteClient();

	function doLocalClient() {
		localClient = net.connect(localPort, function() {
			console.log("connect to local: " + localPort);
		});
		localClient.on('data', function(data) {
			if (remoteClient) {
				remoteClient.write(data);
				console.log('[WRITE]RemoteClient: ' + data.length);
			} else {
				console.error("[WAIT]RemoteClient");
			}
		});
		localClient.on('error', function(err) {
			console.error("localClient err: " + err);
			doLocalClient();
		});
		localClient.on('end', function() {
		  console.log('[END]localClient disconnected from server');
		  // setTimeout(doLocalClient, 50);
		  doLocalClient();
		});
	}

	doLocalClient();

}
