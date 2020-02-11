const app = require('./scripts/Http');
const PortCheck = require('./scripts/PortCheck');
let port_start = 5050;
let countMax = 10;
let succeed = 0;
let counted = 0;
let listener = (inuse, port, app) => {
	counted++;
	if (counted > countMax) {
		console.log(`\n---------------------------------------`);
		console.log("Succeed Binding \033[32m" + succeed + "\033[0m upstreams.");
		console.log("Failed Binding \033[31m"  + (countMax-succeed) + "\033[0m upstreams.");
		console.log(`---------------------------------------\n`);
		return;
	}

	if (inuse) {
		console.log(`\n---------------------------------------`);
		console.log("Port \033[33m"+port+"\033[0m is in used");
		console.log(`---------------------------------------`);
		return PortCheck(port+1, listener, app);
	}
	succeed++;
	let application = app();
	let server = application.listen(port, '127.0.0.1', () => {
		let addr = server.address();
		console.log(`\n---------------------------------------`);
		console.log("Listening [\033[33m"+addr.family+"\033[0m] => \033[32m"+addr.address+":"+addr.port+"\033[0m");
		console.log(`---------------------------------------`);
		application.start(() => {
			PortCheck(addr.port+1, listener, app);
		});
	}).setTimeout(60000);
};

PortCheck(port_start, listener, app);
