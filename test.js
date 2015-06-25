var net = require('net');
var LPF = require('./lib');

// send some to 123 -> 321 ->  local 321 -> 111

LPF.createClient(888, 321, 'localhost');	
LPF.createServer(123, 321);



// sim LAN server
net.createServer(function(c) {

	var name = "server-888"
	var i = 0;
	// setInterval(function(){
	//  	c.write('hi!!' + i.toString() + '\n');
	//  	i++;
	// }, 1000);

	c.on('data', function(data) {
		if (data == 'Test-' + i.toString() + '\n') {
			console.log('ok!')
		}
		i++;
		// console.log("Get from Test: " + data);
		// c.write(data);
	});
}).listen(888);


// 2s later
setTimeout(function() {
	var i = 0;
	var client = net.connect(123, function() {
		setInterval(function(){
		 	client.write('Test-' + i.toString() + '\n');
		 	i++;
		}, 1000);
	});

}, 2000);