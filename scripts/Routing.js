class Routing
{
    constructor(Serve) {
        this.serve = Serve;
    }
    // --- START SERVING
    notfound(res, message)
    {
        return this.serve.notfound(res, message);
    }
    unauthorized(res, message)
    {
        return this.serve.unauthorized(res, message);
    }
    internal(res, message)
    {
        return this.serve.internal(res, message);
    }
    failed(res, message)
    {
        return this.serve.preconditionfailed(res, message);
    }
    expectation(res, message)
    {
        return this.serve.exception(res, message);
    }
    required(res, message)
    {
        return this.serve.required(res, message);
    }
    error(res, message)
    {
        return this.internal(res, message);
    }
    success(res, message)
    {
        return this.serve.success(res, message);
    }
    // --- END SERVING
    getPattern()
    {
        return '/';
    }

    getMethods()
    {
        return ['all'];
    }

    /**
     * @final
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    __handleSucceed(req, res, next)
    {
        this.request  = req;
        this.response = res;
        return this.route(req, res, next);
    }

    route(req, res, next)
    {
        return this.notfound(res);
    }

    next(router)
    {
        // console.log(router);
    }
    __handleError(err, req, res, next)
    {
        this.request = req;
        this.response = res;
        let response = this.onError(err, req, res, next);
        return response || this.internal(res, err);
    }

    onError(err, req, res, next)
    {
        return this.internal(res, err);
    }
}

module.exports = Routing;
