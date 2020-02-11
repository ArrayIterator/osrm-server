const resp = require('express/lib/response');

function Serve() {
    let S = Serve;
    S.success = (res, message, statusCode = 200, isCompressed) => {
        res = res || global.Response || Object.create(resp, {
            app: {configurable: true, enumerable: true, writable: true, value: Application || Express}
        });
        isCompressed = isCompressed === undefined
            ? global.Compressed || false
            : isCompressed;
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
    S.error = function (res, message, statusCode = 500, isCompressed) {
        res = res || global.Response || Object.create(resp, {
            app: {configurable: true, enumerable: true, writable: true, value: Application || Express}
        });
        isCompressed = isCompressed === undefined
            ? global.Compressed || false
            : isCompressed;
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
                message: message.message,
                trace: {
                    message: message.message,
                    code: message.code || 0,
                    stack: message.stack
                }
            };
        }
        if (message.trace && message.trace.stack && typeof message.trace.stack === 'string'
            && typeof global.RootPath === 'string'
        ) {
            let reg = new RegExp(global.RootPath, 'g');
            message.trace.stack = message.trace.stack.replace(reg, '${RootPath}');
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
    S.required = function (res, message, isCompressed) {
        message = message || '428 Precondition Required';
        if (typeof message === 'string' && message.match(/^Precondition\s+Required/gi)) {
            message = '428 ' + message;
        }
        return Serve.error(res, message, 428, isCompressed);
    };
    S.preconditionrequired = S.required;
    S.ok = function (res, message, isCompressed) {
        message = message || '200 OK';
        return Serve.success(res, message, 200, isCompressed);
    };
    S.OK = Serve.ok;
    S.precondition = function (res, message, isCompressed) {
        message = message || '412 Precondition Failed';
        if (typeof message === 'string' && message.match(/^Precondition\s+Failed/gi)) {
            message = '412 ' + message;
        }
        return Serve.error(res, message, 412, isCompressed)
    };
    S.preconditionfailed = Serve.precondition;
    S.expectation = function (res, message, isCompressed) {
        message = message || '417 Expectation Failed';
        if (typeof message === 'string' && message.match(/^Expectation\s+Failed/gi)) {
            message = '417 ' + message;
        }
        return Serve.error(res, message, 417, isCompressed)
    };
    S.expectationfailed = Serve.expectation;
    S.internal = function (res, message, isCompressed) {
        message = message || '500 Internal Server Error';
        if (typeof message === 'string' && message.match(/^Internal\s+Server\s+Error/gi)) {
            message = '500 ' + message;
        }
        return Serve.error(res, message, 500, isCompressed)
    };
    S.notfound = function (res, message, isCompressed) {
        message = message || '404 Not Found';
        if (typeof message === 'string' && message.match(/^Not\s+Found/gi)) {
            message = '404 ' + message;
        }
        return Serve.error(res, message, 404, isCompressed)
    };
    S.forbidden = function (res, message, isCompressed) {
        message = message || '403 Forbidden';
        if (typeof message === 'string' && message.match(/^Forbidden/gi)) {
            message = '403 ' + message;
        }
        return Serve.error(res, message, 403, isCompressed)
    };
    S.unauthorized = function (res, message, isCompressed) {
        message = message || '401 Unauthorized';
        if (typeof message === 'string' && message.match(/^Unauthorized/gi)) {
            message = '401 ' + message;
        }
        return Serve.error(res, message, 401, isCompressed)
    };

    return S;
}

module.exports = new Serve();
