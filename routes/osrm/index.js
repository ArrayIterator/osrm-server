const dr = require('../../scripts/DirectoryReader');
module.exports = (Router) => {
    dr(__dirname + '/route', (routeName, RouterFile, Router) => {
        RoutingStrategy(Router, require(RouterFile));
    }, Router);
};
