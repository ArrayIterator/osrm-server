// or just leave this file like this
// just create custom-listener.js and copy all of content of this file & edit it.
// -> START
const PortCheck = require('./scripts/PortCheck');
const fs = require('fs');
let ports = []; // lists succeed ports
// listen start port -> use range of free ports
let port_start = 5050;
// max upstream count -> change this to another values
let countMax = 15;
let succeed = 0;
let counted = 0;
let upstream_name = 'generated_node_proxy_osrm';
let upstream_file = __dirname + '/nginx/upstream/'+upstream_name+'.conf';
let listen_address = '127.0.0.1';
let timeout = 60000; // in milliseconds
let nodejs = process.argv[0];

// NGINX CONF
// fail timeout nginx
let fail_timeout = Math.ceil((timeout / 1000 / 2));
if (fail_timeout < 10) {
    fail_timeout = 10;
} else if (fail_timeout > 40) {
    fail_timeout = 40;
}
let max_fails = 3;
function run(...cmd) {
    return new Promise((resolve, reject) => {
        let spawn = require('child_process').spawn;
        let command = spawn.call(this, ...cmd);
        let result = '';
        command.stdout.on('data', function(data) {
            result += data.toString()
        });
        command.on('close', function(code) {
            resolve(command, code, result);
        });
        command.on('error', function(err) { reject(err) })
    })
}

let listener = (inuse, port, closedServer) => {
    counted++;
    if (counted > countMax) {
        console.log(`\n---------------------------------------`);
        console.log("Succeed Binding \033[32m" + succeed + "\033[0m upstreams.");
        console.log("Failed Binding \033[31m"  + (countMax-succeed) + "\033[0m upstreams.");
        console.log(`---------------------------------------\n`);
        let isUpstreamFileExists = fs.existsSync(upstream_file);
        if (ports.length > 0) {
            try {
                // create proxy
                let stream = fs.createWriteStream(upstream_file);
                stream.write(`# This auto generated upstream conf\n`);
                stream.write(`# Please do not edit this file\n`);
                stream.write(`upstream ${upstream_name} {\n`);
                stream.write(`\tleast_conn;\n`);
                for (let p = 0; ports.length > p; p++) {
                    stream.write(`\tserver ${listen_address}:${ports[p]} max_fails=${max_fails} fail_timeout=${fail_timeout}s;\n`);
                }
                // add upstream fair
                stream.write(`\tfair;\n`);
                stream.write(`}\n`);
                stream.close();
            } catch (e) {
                console.error(e.message);
            }
        } else {
            // 50 is minimal upstream generated
            if (!isUpstreamFileExists || fs.statSync(upstream_file)['size'] < 50) {
                let stream = fs.createWriteStream(upstream_file);
                stream.write(`# This auto generated upstream conf\n`);
                stream.write(`# Please do not edit this file\n`);
                stream.write(`upstream ${upstream_name} {\n`);
                stream.write(`\tleast_conn;\n`);
                // create fake upstream
                stream.write(`\tserver ${listen_address}:${port_start} max_fails=1 fail_timeout=1s;\n`);
                stream.write(`}\n`);
                stream.close();
            }
        }
        console.log(`\n---------------------------------------`);
        console.log("Please execute \033[34msudo nginx -s reload\033[0m if required.");
        console.log("Check configuration with \033[34msudo nginx -t\033[0m before doing restart nginx.");
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
    ports.push(port);
    let server = application.listen(port, listen_address, () => {
        let addr = server.address();
        console.log(`\n---------------------------------------`);
        console.log("Listening [\033[33m"+addr.family+"\033[0m] => \033[32m"+addr.address+":"+addr.port+"\033[0m");
        console.log(`---------------------------------------`);
        application.start(() => {
            PortCheck(addr.port+1, listener, app);
        });
    }).setTimeout(timeout);
    return;

    succeed++;
    console.log(port);
    ports.push(port);
    run(nodejs, [`${__dirname}/index.js`, port]).catch((err) => {
        console.log(err);
    }).then((command, code, data) => {
        console.log(data);
    });
    return;
    let child = require('child_process')
        .spawn(`${__dirname}/index.js`);
    // child.on('error', function (e) {
    //     console.log(e);
    // });
    var result = '';
    child.stdout.on('data', function(data) {
        result += data.toString();
    });
    child.on('close', function(code) {
        console.log(result);
    });
    child.on('exit', function (code, signal) {
        console.log('child process exited with ' +
            `code ${code} and signal ${signal}`);
    });
    // let child = spawn(`${nodejs} ${__dirname}/index.js ${port}`);
    // , (error,  stdout, stderr) => {
    //     if (error) {
    //         console.log(`error: ${error.message}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(`stderr: ${stderr}`);
    //         return;
    //     }
    //     console.log(`stdout: ${stdout}`);
    // });
    // let server = application.listen(port, listen_address, () => {
    //     let addr = server.address();
    //     console.log(`\n---------------------------------------`);
    //     console.log("Listening [\033[33m"+addr.family+"\033[0m] => \033[32m"+addr.address+":"+addr.port+"\033[0m");
    //     console.log(`---------------------------------------`);
    //     application.start(() => {
    //         PortCheck(addr.port+1, listener, app);
    //     });
    // }).setTimeout(timeout);
};

PortCheck(port_start, listener, app);
