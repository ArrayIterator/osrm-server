const dr = require('../scripts/DirectoryReader');
module.exports = (Router) => {
    dr(__dirname, (routeName, RouterFile, Router) => {
        if (routeName === 'index') {
            routeName = '/';
        } else {
            routeName = `/${routeName}/`;
        }

        Router.group(routeName, require(RouterFile));
    }, Router);
};
