class PolylineEncode extends Routing {
    getPattern() {
        return '/'
    }

    getMethods() {
        return 'ALL';
    }

    route(req, res, next) {
        return this.notfound(
            res,
            {
                message: '404 Not Found',
                routes: {
                    '/decode': 'Decode Poyline'
                }
            }
        );
    }

    next(Router, Route) {
        RoutingStrategy('/', Router, require('./decode'));
    }
}

module.exports = PolylineEncode;
