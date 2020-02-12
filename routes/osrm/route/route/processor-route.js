class ProcessorRoute extends Routing {
    async route(query, req, res, next) {
        let maxWaitingSeconds = 15;
        const processor = require('./processor');
        let data = await processor(query, maxWaitingSeconds);
        if (typeof data !== 'object') {
            return this.internal(res);
        }
        if (typeof data['data'] !== "undefined") {
            return this.success(res, data['data']);
        }
        if (typeof data['message'] !== 'undefined') {
            return this.error(res, data['message'], data['code']);
        }
        if (typeof data['code'] !== 'undefined') {
            return this.error(res, data['code']);
        }
        return this.internal(res);
    }
}

module.exports = ProcessorRoute;
