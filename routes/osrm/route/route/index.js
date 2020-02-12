class Route extends Routing {
    getPattern() {
        return '/'
    }

    getMethods() {
        return ['POST', 'GET'];
    }

    getCoordinates(coordinates) {
        if (typeof coordinates === 'string') {
            coordinates = coordinates
                .replace(/(?:[,\s]+)?[|]+([,\s]+)?/g, '|')
                .replace(/(^[,|\s]+|[,|\s]+$)/g, '')
                .replace(/[,]+/g, ',')
                .trim();
            if (coordinates === '') {
                return [];
            }
            return coordinates.split('|');
        }

        if (typeof coordinates === 'object') {
            let __coordinates = [];
            for (let c in coordinates) {
                if (!coordinates.hasOwnProperty(c)) {
                    continue;
                }
                if (typeof coordinates[c] === 'string') {
                    __coordinates.push(coordinates[c]);
                    continue;
                }
                if (coordinates[c] && typeof coordinates[c] === 'object') {
                    let type = ['number', 'string'];
                    if (type.indexOf(typeof coordinates[c]['lat']) > -1
                        && type.indexOf(typeof coordinates[c]['lon']) > -1
                    ) {
                        if (typeof coordinates[c]['lat'] === 'string') {
                            coordinates[c]['lat'] = coordinates[c]['lat'].trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                        }
                        if (typeof coordinates[c]['lon'] === 'string') {
                            coordinates[c]['lon'] = coordinates[c]['lon'].trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                        }
                        __coordinates.push(`${coordinates[c]['lon']},${coordinates[c]['lat']}`);
                        // console.log( __coordinates)
                        continue;
                    }
                    if (type.indexOf(typeof coordinates[c]['latitude']) > -1
                        && type.indexOf(typeof coordinates[c]['longitude']) > -1
                    ) {
                        if (typeof coordinates[c]['latitude'] === 'string') {
                            coordinates[c]['latitude'] = coordinates[c]['latitude'].trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                        }
                        if (typeof coordinates[c]['longitude'] === 'string') {
                            coordinates[c]['longitude'] = coordinates[c]['longitude'].trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                        }

                        __coordinates.push(`${coordinates[c]['lon']},${coordinates[c]['lat']}`);
                        continue;
                    }
                    if (typeof coordinates[c].length === "number" && coordinates[c].length > 1) {
                        let _co = [];
                        for (let k in coordinates[c]) {
                            if (!coordinates[c].hasOwnProperty(k)) {
                                continue;
                            }
                            if (!type.indexOf(typeof coordinates[c][k]) > -1) {
                                continue;
                            }
                            if (typeof typeof coordinates[c][k] === 'string') {
                                coordinates[c][k] = coordinates[c][k].trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                            }
                            _co.push(coordinates[c][k]);
                            if (_co.length === 2) {
                                break;
                            }
                        }
                        if (_co.length) {
                            __coordinates.push(_co.join(','));
                        }
                    }
                }
            }

            return __coordinates;
        }
        return [];
    }

    route(req, res, next) {
        let Processor = require('./processor-route');
        Processor = new Processor(this.serve);
        let params = req.query || {};
        if (req.method.toString().toUpperCase() === 'POST') {
            let body = req.body || {};
            if (typeof body !== 'object') {
                body = {};
            }
            let coordinates;
            if (body.coordinates) {
                coordinates = this.getCoordinates(body.coordinates);
            }
            if (coordinates && coordinates.length > 1) {
                params.coordinates = coordinates.join('|');
            } else if (params.coordinates) {
                coordinates = this.getCoordinates(params.coordinates);
                if (coordinates.length) {
                    params.coordinates = coordinates.join('|');
                }
            }

            let _body = {};
            for (let k in body) {
                if (!body.hasOwnProperty(k)) {
                    continue;
                }
                if (['coordinates', 'coordinate'].indexOf(k) > -1) {
                    continue;
                }
                _body[k] = body[k];
            }
            body = null; //clear
            params = Extends(params, _body);
        } else if (params.coordinates) {
            let coordinates = this.getCoordinates(params.coordinates);
            if (coordinates.length) {
                params.coordinates = coordinates.join('|');
            }
        }

        // console.log(params);
        return Processor.route(params, req, res, next);
    }
}

module.exports = Route;
