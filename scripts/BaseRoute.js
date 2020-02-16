let Routing = require('./Routing');
let Methods = require('methods');
class BaseRoute extends Routing {
    getPattern() {
        return '/'
    }

    createRouteData(routes)
    {
        let data = {};
        for (let i in routes) {
            if (!routes.hasOwnProperty(i)) {
                continue;
            }
            let methods = [];
            let m = routes[i].getMethods();
            if (typeof m === 'string') {
                m = [m];
            }

            if (typeof m !== 'object') {
                continue;
            }
            for (let ik in m) {
                if (!m.hasOwnProperty(ik)
                    || typeof m[ik] !== 'string'
                ) {
                    continue;
                }

                m[ik] = m[ik].trim().toUpperCase();
                methods.push(m[ik]);
            }

            data[i] = {
                methods: methods,
                description: routes[i].getDescription(),
            };
            if (routes[i].routes && typeof routes[i].routes === 'object') {
                data[i].endpoints = this.createRouteData(routes[i].routes);
            }
        }
        return data;
    }
    route(req, res, next) {
        let endpoints = this.createRouteData(this.routes);
        return this.error(res, {endpoints}, 400);
    }
}

module.exports = BaseRoute;
