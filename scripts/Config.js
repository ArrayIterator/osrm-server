const path = require('path');
class Config
{
	constructor(config) {
		this.____replacer = 'temp-' + Math.random();
		if (typeof config === 'object') {
			for (var i in config) {
				this.set(i, config[i]);
			}
		}
	};
	set(name, value) {
		if (['____replacer', 'has', 'set', 'all', 'get', 'constructor'].indexOf(name) > -1) {
			name = this.____replacer + '(' + name + ')';
		}
		let fixPath = (confs) => {
	        if (!confs) {
	            return confs;
	        }
	        let rootPath = path.join(__dirname, '/..');
	        if (typeof confs === 'string') {
	            return confs
	                .replace(/\$\{root\}/g, rootPath)
	                .replace(/\$\{script\}/g, __dirname)
	                .replace(/\$\{public\}/g, rootPath +'/public')
	                .replace(/\$\{data\}/g, rootPath +'/data')
	                .replace(/\$\{[^\}]+\}/g, '')
	                ;
	        } else if (typeof confs === 'object') {
	            for (var key in confs) {
	                confs[key] = fixPath(confs[key]);
	            }
	            return confs;
	        }

	        return confs;
	    };
		this[name] = fixPath(value);
	};
	get(name, def) {
		if (['____replacer', 'has', 'set', 'all', 'get', 'constructor'].indexOf(name) > -1) {
			var reg = new RegExp('^' + this.____replacer + '\\((.+)\\)$', 'g');
			name = i.replace(reg, '$1');
		}
		if (this[name] === undefined) {
			return def;
		}
		return this[name];
	};
	has(name) {
		if (['____replacer', 'has', 'set', 'all', 'get', 'constructor'].indexOf(name) > -1) {
			var reg = new RegExp('^' + this.____replacer + '\\((.+)\\)$', 'g');
			name = i.replace(reg, '$1');
		}
		return this[name] !== undefined;
	};
	all() {
		let config = {};
		for (var i in this ) {
			if (['____replacer', 'has', 'set', 'all', 'get', 'constructor'].indexOf(i) > -1) {
				continue;
			}

			var reg = new RegExp('^' + this.____replacer + '\\((.+)\\)$', 'g');
			var name = i.replace(reg, '$1');
			config[name] = this[i];
		}
		return config;
	}
}

module.exports = Config;
