process.env.UV_THREADPOOL_SIZE = Math.ceil(require('os').cpus().length * 1.5);
module.exports = () => {
    // echo
    const path = require('path'),
        fs = require('fs'),
        express = require('express'),
        bodyParser = require('body-parser'),
        yaml = require('yaml'),
        cors = require('cors'),
        Configuration = require('./Config'),
        groupRouter = require('express-group-routes');

    let app = express();
    // add global
    global.Express = express;
    global.Extends = require('./Extends');
    global.AsyncAwait = require('./AsyncAwait');
    global.Routing = require('./Routing');
    global.RoutingStrategy = require('./RoutingStrategy');
    global.RootPath = path.join(__dirname, '/../').replace(/[\/]+$/g, '');
    global.StoragePath = path.join(RootPath, '/storage');
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
        } catch (e) {
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
                    if (typeof hash === 'string' && typeof tokenTmp[hash] === 'string') {
                        token = token || {};
                        token[hash] = tokenTmp[hash];
                    }
                }
            }
        } catch (e) {
            token = null;
        }

        global.tokens = token;
        try {
            let basePath = path.join(__dirname, '/../routes');
            // add cors
            app.use(cors())
            this.use((Request, Response, Next) => {
                Response = require('./Response')(Request, Response);
                let headers = Request.headers;
                let query = Request.query;
                global.Response = Response;
                global.Request = Request;
                let min = global.Config.get('minify') === true;
                let reg = min ? /^\s*(off|0|false|no)\s*$/gi : /^\s*(true|1|yes|on)\s*$/gi;
                let minify = min;
                let changed = false;
                if (headers['x-compress']) {
                    changed = true;
                    minify = !!(headers['x-compress'].toString().match(reg))
                } else if (Request.query.compress) {
                    changed = true;
                    minify = !!(Request.query.compress.toString()
                        .replace(/\s*/, '')
                        .match(reg)
                    );
                }
                if (min && changed) {
                    minify = !minify;
                }
                global.Compressed = minify;
                if (token === null) {
                    try {
                        Next();
                    } catch (e) {
                        return internal(
                            Response,
                            {
                                message: `500 Internal Server Error.`,
                                trace: {
                                    message: e.message,
                                    code: e.code || 500
                                }
                            }
                        );
                    }
                    return;
                }
                let headerToken = headers['x-auth-token'] || query['token'];
                if (!headerToken || !token[headerToken]) {
                    return unauthorized(Response);
                }

                Response.header('X-Auth-User', token[headerToken]);
                Next();
            });

            // use body parser
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({extended: true}));
            this.use((Request, Response, Next) => {
                let headers = Request.headers;
                if (headers['x-compress'] !== undefined) {
                    Next();
                    return;
                }
                let body = Request.body || {};
                if (body.compress) {
                    global.Compressed = !(
                        body.compress === 1
                        || body.compress === true
                        || typeof body.compress === 'string' && !body
                            .compress
                            .replace(/\s*/, '')
                            .match(/^\s*(true|1|yes|on)\s*$/gi)
                    );
                }
                Next();
            });
            this.group('/', require(basePath));
        } catch (e) {
            this.use((req, res) => {
                return internal(
                    res,
                    {
                        message: `500 Internal Server Error.`,
                        trace: {
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
