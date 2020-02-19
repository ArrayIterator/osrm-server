module.exports = class GeoJson extends require('../../../scripts/BaseRoute') {
    getDescription() {
        return 'Get geo json list by country.'
    }
    route(req, res, next) {
        let endpoints = this.createRouteData(this.routes);
        return this.error(res, {endpoints}, 400);
    }
};
