const path = require('path');

class Config {
    constructor(config) {
        this.____replacer = 'temp-' + Math.random();
        if (typeof config === 'object') {
            for (let i in config) {
                if (!config.hasOwnProperty(i)) {
                    continue;
                }
                this.set(i, config[i]);
            }
        }
    };

    set(name, value) {
        if (['____replacer', 'has', 'set', 'all', 'get', 'constructor'].indexOf(name) > -1) {
            name = this.____replacer + '(' + name + ')';
        }
        let fixPath = (con) => {
            if (!con) {
                return con;
            }

            let RootPath = path.join(__dirname, '/..');
            let StoragePath = path.join(RootPath, '/storage');
            if (typeof con === 'string') {
                return con
                    .replace(/\${root}/g, RootPath)
                    .replace(/\${storage}/g, StoragePath)
                    .replace(/\${script}/g, __dirname)
                    .replace(/\${scripts}/g, __dirname)
                    .replace(/\${public}/g, RootPath + '/public')
                    .replace(/\${data}/g, StoragePath + '/data')
                    .replace(/\${[^}]+}/g, '')
                    ;
            } else if (typeof con === 'object') {
                for (let k in con) {
                    if (!con.hasOwnProperty(k)) {
                        continue;
                    }
                    con[k] = fixPath(con[k]);
                }
                return con;
            }

            return con;
        };
        this[name] = fixPath(value);
    };

    get(name, def) {
        if (['____replacer', 'has', 'set', 'all', 'get', 'constructor'].indexOf(name) > -1) {
            let reg = new RegExp('^' + this.____replacer + '\\((.+)\\)$', 'g');
            name = name.replace(reg, '$1');
        }
        if (this[name] === undefined) {
            return def;
        }
        return this[name];
    };

    has(name) {
        if (['____replacer', 'has', 'set', 'all', 'get', 'constructor'].indexOf(name) > -1) {
            let reg = new RegExp('^' + this.____replacer + '\\((.+)\\)$', 'g');
            name = name.replace(reg, '$1');
        }
        return this[name] !== undefined;
    };

    all() {
        let config = {};
        for (let i in this) {
            if (!this.hasOwnProperty(i)) {
                continue;
            }
            if (['____replacer', 'has', 'set', 'all', 'get', 'constructor'].indexOf(i) > -1) {
                continue;
            }

            let reg = new RegExp('^' + this.____replacer + '\\((.+)\\)$', 'g');
            let name = i.replace(reg, '$1');
            config[name] = this[i];
        }
        return config;
    }
}

module.exports = Config;
