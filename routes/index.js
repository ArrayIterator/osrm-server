const
    dr = require('../scripts/DirectoryReader'),
    fs = require('fs');
module.exports = (Router) => {
    let leftRouting = {};
    try {
        let directory = fs.readdirSync(__dirname);
        for (let pathKey=0; directory.length > pathKey;pathKey++) {
            if (!directory.hasOwnProperty(pathKey)) {
                continue;
            }
            let routeName = directory[pathKey],
                path = __dirname + '/' + routeName;
            if (!fs.existsSync(path)
                || !fs.lstatSync(path).isDirectory()
                || !routeName.match(/^[a-z0-9\-_]/gi)
            ) {
                continue;
            }

            let RouterDir = path + '/route';
            let RouterIndex = RouterDir + '/index.js';
            if (!fs.existsSync(RouterDir) || !fs.statSync(RouterDir).isDirectory()) {
                continue;
            }
            if (routeName === 'index') {
                routeName = '/';
            } else {
                routeName = `/${routeName}`;
            }

            if (fs.existsSync(RouterIndex) && fs.statSync(RouterIndex).isFile()) {
                let indexRouter = require(RouterIndex);
                leftRouting[routeName] = RoutingStrategy(routeName, Router, new indexRouter);
            }

            try {
                Router.group(routeName, (Router) => {
                    dr(RouterDir, (RouteName, RouterFile, Router) => {
                        if (RouteName === 'index') {
                            RouteName = '/';
                        } else {
                            RouteName = `/${RouteName}/`;
                        }
                        let route = require(RouterFile);
                        if (typeof route === 'function') {
                            return RoutingStrategy(RouteName, Router, new route);
                        }
                    }, (list) => {
                        if (leftRouting[routeName]) {
                            if (routeName === '/' && leftRouting[routeName].routes) {
                                return;
                            }
                            let res = {};
                            for (let k in list) {
                                if (!list.hasOwnProperty(k)) {
                                    continue;
                                }
                                res['/' + k] = list[k].result;
                            }
                            leftRouting[routeName].routes = res;
                        }
                    }, Router);
                });
            } catch (e) {
                // pas
            }
        }
        if (typeof leftRouting['/'] === 'object') {
            leftRouting['/'].routes = {};
            for (let l in leftRouting) {
                if (!leftRouting.hasOwnProperty(l) || l === '/') {
                    continue;
                }
                leftRouting['/'].routes[l] = leftRouting[l];
            }
        }
    } catch (e) {
        // pass
    }
};
