class Routing {
    constructor(Serve) {
        this.serve = Serve;
    }
    getDescription()
    {
        return '';
    }

    // --- START SERVING
    notfound(res, message) {
        return this.serve.notfound(...arguments);
    }

    unauthorized(res, message) {
        return this.serve.unauthorized(...arguments);
    }

    internal(res, message) {
        return this.serve.internal(...arguments);
    }

    failed(res, message) {
        return this.serve.preconditionfailed(...arguments);
    }

    precondition(res, message) {
        return this.serve.preconditionfailed(...arguments);
    }

    expectation(res, message) {
        return this.serve.internal(...arguments);
    }

    required(res, message) {
        return this.serve.required(...arguments);
    }

    error(res, message, statusCode = 500) {
        return this.serve.error(...arguments);
    }

    success(res, message) {
        return this.serve.success(...arguments);
    }

    // --- END SERVING
    getPattern() {
        return '/';
    }

    getMethods() {
        return ['ALL'];
    }

    /**
     * @final
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    __handleSucceed(req, res, next) {
        this.request = req;
        this.response = res;
        return this.route(req, res, next);
    }

    route(req, res, next) {
        return this.notfound(res);
    }

    next(groupRouter, parentRouter, nextRouter) {
        // console.log(router);
    }

    __handleError(err, req, res, next) {
        this.request = req;
        this.response = res;
        let response = this.onError(err, req, res, next);
        return response || this.internal(res, err);
    }

    onError(err, req, res, next) {
        return this.internal(res, err);
    }
}

module.exports = Routing;
