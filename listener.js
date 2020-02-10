const app = require('./scripts/http.js');
const portCheck = require('./scripts/port-check.js');
let portStart = 5050;
let count = 0;
let succeed = 0;
let counted = 0;
for (var start = 5050; start+10 > portStart;) {
	counted++;
	portCheck(portStart, (inuse, port, app) => {
		succeed++;
		if (inuse) {
			console.log('Port Is Used : ' + port);
			return;
		}
		count++;
		let server = app().listen(port, '127.0.0.1', () => {
			let addr = server.address();
			console.log(`Listening [${addr.family}] => ${addr.address}:${addr.port}`);
		}).setTimeout(60000);
	}, portStart++, app);
}

var Interval = setInterval(function() {
	if (succeed === counted) {
		if (count === 0) {
			console.log(`---------------------------------------`);
			console.log(`No Upstreams has been started.`);
			console.log(`---------------------------------------`);
		} else {
			console.log(`---------------------------------------`);
			console.log(`Succeed Listening ${count} upstreams.`);
			console.log(`---------------------------------------`);
		}
		clearInterval(Interval);
	}
}, 10);
