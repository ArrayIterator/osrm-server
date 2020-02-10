function serve() {
    this.success = (res, message, statusCode = 200, isCompressed) => {
        if (isCompressed) {
            message = JSON.stringify({
                "data": message
            });
        } else {
            message = JSON.stringify({
                "data": message
            }, null, 4);
        }
        if (typeof statusCode !== 'number') {
            statusCode = 200;
        }
        return res
            .status(statusCode)
            .type('json')
            .send(message);
    };
    this.required = function (res, message, isCompressed) {
        message = message || '428 Precondition Required';
        return this.success(res, message, 428, isCompressed);
    };
    this.preconditionrequired = this.required;
    this.ok = function (res, message, isCompressed) {
        message = message || '200 OK';
        return this.success(res, message, 200, isCompressed);
    };
    this.OK = this.ok;
    this.error = function (res, message, statusCode = 500, isCompressed) {
        message = message
            && typeof message === 'object'
            && typeof message['message'] !== 'undefined'
                ? message
                : (
                    typeof message === 'number'
                    ? (message === 500 ? '500 Internal Server Error' : message)
                    : {"message": message}
                );
        if (message instanceof Error) {
            message = {
                message : message.message,
                trace : {
                    message : message.message,
                    code: message.code||0,
                    stack: message.stack
                }
            };
        }
        if (message.trace && message.trace.stack && typeof message.trace.stack === 'string') {
            var reg = new RegExp(global.rootPath, 'g');
            message.trace.stack = message.trace.stack.replace(reg, '${rootPath}');
        }
        if (isCompressed) {
            message = JSON.stringify(message);
        } else {
            message = JSON.stringify(message, null, 4);
        }
        if (typeof statusCode !== 'number') {
            statusCode = 500;
        }
        return res
            .status(statusCode)
            .type('json')
            .send(message);
    };
    this.precondition = function (res, message, isCompressed) {
        message = message || '412 Precondition Failed';
        return this.error(res, message, 412, isCompressed)
    };
    this.preconditionfailed = this.precondition;
    this.expectation = function (res, message, isCompressed) {
        message = message || '417 Expectation Failed';
        return this.error(res, message, 417, isCompressed)
    };
    this.expectationfailed = this.expectation;
    this.internal = function (res, message, isCompressed) {
        message = message || '500 Internal Server Error';
        return this.error(res, message, 500, isCompressed)
    };
    this.notfound = function (res, message, isCompressed) {
        message = message || '404 Not Found';
        return this.error(res, message, 404, isCompressed)
    };
    this.forbidden = function (res, message, isCompressed) {
        message = message || '403 Forbidden';
        return this.error(res, message, 403, isCompressed)
    };
    this.unauthorized = function (res, message, isCompressed) {
        message = message || '401 Unauthorized';
        return this.error(res, message, 401, isCompressed)
    };
    return this;
}

module.exports = serve();
