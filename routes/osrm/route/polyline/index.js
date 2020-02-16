class PolylineEncode extends require('../../../../scripts/BaseRoute') {
    getPattern() {
        return '/'
    }

    getDescription() {
        return 'Polyline helper to interact with coordinates data.';
    }

    getMethods() {
        return 'ALL';
    }

    next(Router, Route) {
        this.routes = {
            '/decode': RoutingStrategy('/', Router, require('./decode'))
        };
    }
}

module.exports = PolylineEncode;
