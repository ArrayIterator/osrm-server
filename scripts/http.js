process.env.UV_THREADPOOL_SIZE = Math.ceil(require('os').cpus().length * 1.5);
// echo
const path = require('path');
const fs = require('fs');
const express = require('express');
const YAML = require('yaml');
const Config = require('./Config');
express.serve =
    express.application.serve =
    express.Router.serve = require('./serve');
require('express-group-routes');
const {internal, notfound} = express.serve;
global.express = express;
global.rootPath   = path.join(__dirname, '/../').replace(/[\/]+$/g, '');
global.configFile = path.join(rootPath, '/config.yaml');
try {
    global.config = new Config({});
    if (fs.existsSync(global.configFile)) {
        config = YAML.parse(fs.readFileSync(global.configFile).toString());
        if (!global.config || typeof global.config !== 'object') {
            config = {};
        }
        global.config = new Config(config);
    }
} catch(e) {
    console.error(e);
    global.config = new Config({});
}

console.log("Using Config: \n" + JSON.stringify(config.all(), null, 2));
module.exports = () => {
    let app = express();
    app.disable('x-powered-by');
    var token = null;

    try {
        let tokenTmp = config.get('auth', null);
        if (tokenTmp && typeof tokenTmp === 'object') {
            for (var hash in tokenTmp) {
                if (typeof hash === 'string' && typeof tokenTmp[hash] === 'string')  {
                    token = token || {};
                    token[hash] = tokenTmp[hash];
                }
            }
        }
        delete tokenTmp;
    } catch(e) {
        token = null;
    }
    try {
        var router = function(req, res, next) {
            if (token === null) {
                try {
                    next();
                } catch(e) {
                    return internal(
                        res,
                        {
                            message : `500 Internal Server Error.`,
                            trace : {
                                message: e.message,
                                code: e.code || 500
                            }
                        }
                    );
                }
                return this;
            }
            let headers = req.headers;
            let query = req.query;
            let headerToken = headers['x-auth-token'] || query['token'];
            if (!headerToken || ! token[headerToken]) {
                return unauthorized(res);
            }

            res.header('X-User-Auth', token[headerToken]);
            next();
            return this;
        };

        app.use(router);
        let basePath = path.join(__dirname, '/../routes');
        router = app.group('/', require(basePath));
        app.use(router);
    } catch(e) {
        console.log(e);
        router = function(req, res) {
            return internal(res, {
                message : `500 Internal Server Error.`,
                trace : {
                    message: e.message,
                    code: e.code || 500
                }
            })
        };
        app.use(router);
    }
    app.use(function(req, res, next) {
        return notfound(res);
    });
    return app;
};
