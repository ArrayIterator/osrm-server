const helper = require('../../helper/geo-json');
module.exports = class Country extends Routing {
    getMethods() {
        return 'ALL';
    }
    getPattern() {
        return /^\/(?:([^\/]+)?\/?)/;
    }

    getDescription() {
        return 'Get geo json data mapbox support by certain country code / name.';
    }

    async route(req, res, next) {
        let code = req.params[0];
        if (code === undefined) {
            return this.success(res, helper.json());
        }
        let data;
        if (code.length > 3) {
            data = helper.countryName(code) || undefined;
        } else {
            data = helper.code(code) || undefined;
        }
        if (data !== undefined) {
            return this.success(res, data);
        }
        return this.notfound(res, {
            message: 'Could not find data within given request.',
            request: {
                request: {
                    target: code
                }
            },
            code: 404
        });
    }
};
