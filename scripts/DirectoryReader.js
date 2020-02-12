const fs = require('fs');
module.exports = (directory, succeed, ...arg) => {
    if (typeof succeed !== 'function') {
        return;
    }
    fs.readdir(directory, function (error, path) {
        if (error) {
            return;
        }
        for (let pathKey in path) {
            let routeName = path[pathKey],
                paths = directory + '/' + routeName;
            if (!fs.lstatSync(paths).isDirectory() || !routeName.match(/^[a-z0-9\-_]/gi)) {
                continue;
            }
            let RouterFile = paths + '/index.js';
            try {
                if (!fs.existsSync(RouterFile) && fs.lstatSync(RouterFile).isFile()) {
                    continue;
                }
                succeed(routeName, RouterFile, ...arg);
            } catch (e) {
                // pas
            }
        }
    });
};
