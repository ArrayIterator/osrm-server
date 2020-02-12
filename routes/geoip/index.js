const dr = require('../../scripts/DirectoryReader');
module.exports = (Router) => {
    dr(__dirname + '/route', (routeName, RouterFile, Router) => {
        if (routeName === 'index') {
            routeName = '/';
        } else {
            routeName = `/${routeName}`;
        }
        RoutingStrategy(routeName, Router, require(RouterFile));
    }, Router);
};
