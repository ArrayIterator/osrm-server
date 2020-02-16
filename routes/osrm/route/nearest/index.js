class Nearest extends Routing {
    getMethods() {
        return 'GET';
    }
    getDescription() {
        return 'Snaps a coordinate to the street network and returns the nearest n matches.';
    }

    getPattern() {
        return '/'
    }

    async route(req, res, next) {
        let maxWaitingSeconds = 15;
        const processor = require('./processor');
        let data = await processor(req.query, maxWaitingSeconds);
        if (typeof data !== 'object') {
            return this.internal(res);
        }
        if (typeof data['data'] !== "undefined") {
            return this.success(res, data['data']);
        }
        if (typeof data['message'] !== 'undefined') {
            let code = data['code'] || 500;
            delete data['code'];
            return this.error(res, data, code);
        }
        if (typeof data['code'] !== 'undefined') {
            return this.error(res, data['code']);
        }
        return this.internal(res);
    }
}

module.exports = Nearest;
