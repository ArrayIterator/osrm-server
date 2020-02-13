const resp = require('express/lib/response');
const STATUS_CODES = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',                 // RFC 2518, obsoleted by RFC 4918
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',               // RFC 4918
    208: 'Already Reported',
    226: 'IM Used',
    300: 'Multiple Choices',           // RFC 7231
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',         // RFC 7238
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: 'I\'m a Teapot',              // RFC 7168
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',       // RFC 4918
    423: 'Locked',                     // RFC 4918
    424: 'Failed Dependency',          // RFC 4918
    425: 'Unordered Collection',       // RFC 4918
    426: 'Upgrade Required',           // RFC 2817
    428: 'Precondition Required',      // RFC 6585
    429: 'Too Many Requests',          // RFC 6585
    431: 'Request Header Fields Too Large', // RFC 6585
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',    // RFC 2295
    507: 'Insufficient Storage',       // RFC 4918
    508: 'Loop Detected',
    509: 'Bandwidth Limit Exceeded',
    510: 'Not Extended',               // RFC 2774
    511: 'Network Authentication Required' // RFC 6585
};

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
        if (arguments.length < 3 && typeof message === 'number' && STATUS_CODES[message]) {
            statusCode = message;
            message = {
                message: message + ' ' + STATUS_CODES[message]
            };
        } else {
            // console.log(Object.prototype.toString.call(message.message))
            if (arguments.length < 3 || typeof statusCode !== "number" || !STATUS_CODES[statusCode]) {
                let statusC;
                if (typeof message.message === 'object' && message.message instanceof Error) {
                    message = message.message;
                    statusC = STATUS_CODES[message.code] ? message.code : 500;
                }
                if (!statusC && message && typeof message === 'object' && !message instanceof Error) {
                    if (typeof message['code'] === 'number'
                        && STATUS_CODES[message['code']]
                    ) {
                        statusC = message['code'];
                    }
                    if (typeof message['message'] === "undefined") {
                        message = undefined;
                    }
                }

                if (!statusC) {
                    if (message instanceof Error) {
                        let statusC_ = message.code;
                        if (STATUS_CODES[statusC_]) {
                            statusCode = statusC_;
                        }
                    }
                    if (!statusC) {
                        statusC = 500;
                    }
                }

                statusCode = statusC;
            } else if (typeof message === "string") {
                message = {message: message};
            } else if (typeof message === 'object'
                && typeof message.message === 'object'
                && message.message instanceof Error
            ) {
                message = message.message;
                statusCode = STATUS_CODES[message.code] ? message.code : 500;
            }

            if (typeof message === "undefined") {
                message = {
                    message: STATUS_CODES[statusCode]
                        ? statusCode + ' ' + STATUS_CODES[statusCode]
                        : "500 Internal Server Error"
                };
            }

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

            if (!STATUS_CODES[statusCode]) {
                statusCode = 500;
            }

            if (message
                && typeof message == 'object'
                && typeof message.trace === 'object'
                && message.trace.stack
                && typeof message.trace.stack === 'string'
            ) {
                let trace = message.trace.stack;
                if (typeof global.RootPath === 'string') {
                    let reg = new RegExp(global.RootPath, 'g');
                    trace = trace.replace(reg, '${RootPath}');
                }
                message.trace.stack = trace;
            }

            if (typeof message !== 'object' || typeof message.message === 'undefined') {
                message = {message: message};
            }
        }
        if (typeof message === 'string') {
            message = {message: message};
        }
        // fallback default
        if (typeof message.message !== 'string') {
            message = {message :STATUS_CODES[statusCode]};
        }

        if (isCompressed) {
            message = JSON.stringify(message);
        } else {
            message = JSON.stringify(message, null, 4);
        }
        // console.log(message);
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
    S.request = function (res, message, isCompressed) {
        message = message || '408 Request Timeout';
        if (typeof message === 'string' && message.match(/^Request\s+Timeout/gi)) {
            message = '408 ' + message;
        }
        return Serve.error(res, message, 408, isCompressed)
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
