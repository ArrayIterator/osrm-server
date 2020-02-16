const fs = require('fs');
module.exports = (directory, succeed, complete, ...arg) => {
    if (typeof succeed !== 'function') {
        return;
    }
    if (typeof complete !== 'function') {
        complete = () => {};
    }
    if (!fs.existsSync(directory)) {
        return;
    }
    if (!fs.statSync(directory).isDirectory()) {
        return;
    }
    fs.readdir(directory, function (error, path) {
        if (error) {
            return;
        }
        let collect = {};
        for (let pathKey in path) {
            let routeName = path[pathKey];
            if (!routeName.match(/^[a-z0-9\-_]/gi)) {
                continue;
            }
            let paths = directory + '/' + routeName;
            if (!fs.existsSync(paths) || !fs.lstatSync(paths).isDirectory()) {
                continue;
            }
            let RouterFile = paths + '/index.js';
            try {
                if (!fs.existsSync(RouterFile) && fs.lstatSync(RouterFile).isFile()) {
                    continue;
                }
                collect[routeName] = {
                    file: RouterFile,
                    args: arg,
                    result: succeed(routeName, RouterFile, ...arg)
                };
            } catch (e) {
                // pas
            }
        }

        complete(collect);
    });
};
