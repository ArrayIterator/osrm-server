process.env.UV_THREADPOOL_SIZE = Math.ceil(require('os').cpus().length * 1.5);
module.exports = () => {
    // echo
    const path = require('path');
    const fs = require('fs');
    const express = require('express');
    const yaml = require('yaml');
    const Configuration = require('./Config');
    const groupRouter = require('express-group-routes');
    let app = express();
    // add global
    global.Express = express;
    global.RootPath   = path.join(__dirname, '/../').replace(/[\/]+$/g, '');
    global.StoragePath   = path.join(RootPath, '/storage');
    global.ConfigFile = path.join(RootPath, '/config.yaml');
    // console.log(ConfigFile);
    global.Compressed = false;
    // add circular
    app.global = global;
    express.Serve =
        express.application.Serve =
            express.Router.Serve =
                app.Serve = require('./Serve');
    app.Serve.Application = app;
    global.Routing = require('./Routing');
    global.RoutingStrategy = require('./RoutingStrategy');
    global.Application = app;

    app.start = function (callback) {
        const {internal, notfound, unauthorized} = express.Serve;
        let config = new Configuration({});
        try {
            if (fs.existsSync(ConfigFile) && fs.lstatSync(ConfigFile).isFile()) {
                config = yaml.parse(fs.readFileSync(ConfigFile).toString());
                // console.log(config);
                if (!config || typeof config !== 'object') {
                    config = {};
                }
                config = new Configuration(config);
            }
        } catch(e) {
            config = new Configuration({});
        }
        global.Config = config;
        // log
        console.log("Using Config: \n" + JSON.stringify(Config.all(), null, 2));
        // START APPLICATION
        let token = null;
        try {
            let tokenTmp = Config.get('auth', null);
            if (tokenTmp && typeof tokenTmp === 'object') {
                for (let hash in tokenTmp) {
                    if (!tokenTmp.hasOwnProperty(hash)) {
                        continue;
                    }
                    if (typeof hash === 'string' && typeof tokenTmp[hash] === 'string')  {
                        token = token || {};
                        token[hash] = tokenTmp[hash];
                    }
                }
            }
        } catch(e) {
            token = null;
        }

        global.tokens = token;
        try {
            let basePath = path.join(__dirname, '/../routes');
            this.use((req, res, next) => {
                let headers = req.headers;
                let query = req.query;
                global.Response   = res;
                global.Request    = req;
                global.Compressed = !(
                    (
                        headers['x-minify'] && headers['x-minify'].toString().match(/^\s*(true|1|yes|on)\s*$/gi)
                    )
                    || !req.query.compress
                    || !req.query.compress.toString()
                        .replace(/\s*/, '')
                        .match(/^\s*(true|1|yes|on)\s*$/gi)
                );
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
                    return;
                }
                let headerToken = headers['x-auth-token'] || query['token'];
                if (!headerToken || ! token[headerToken]) {
                    return unauthorized(res);
                }

                res.header('X-User-Auth', token[headerToken]);
                next();
            });
            this.group('/', require(basePath));
        } catch(e) {
            this.use((req, res) => {
                return internal(
                    res,
                    {
                        message : `500 Internal Server Error.`,
                        trace : {
                            message: e.message,
                            code: e.code || 500
                        }
                    }
                )
            });
        }

        this.use((req, res) => {
            return notfound(res);
        });

        if (typeof callback === 'function') {
            callback(this);
        }
        return this;
    };

    app.start.bind(app);
    return app;
};
