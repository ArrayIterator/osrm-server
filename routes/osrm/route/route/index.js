class Route extends Routing {
    getPattern() {
        return '/routes?'
    }

    route(req, res, next) {
        const OSRM = require('osrm');
        const path = require('path');
        const fs = require('fs');
        //let params = req.params;
        let query = req.query;
        let queryCoordinate = query.coordinates || query.coordinate || null;
        let osrmPath = Config.get('osrm') || null;
        osrmPath = osrmPath ? osrmPath.path : null;
        osrmPath = osrmPath || path.join(StoragePath + '/osrm/indonesia-latest.osrm');
        if (!fs.existsSync(osrmPath)) {
            return this.internal(
                res,
                "500 Internal Server Error. OSRM database has not ready."
            );
        }

        if (typeof queryCoordinate !== 'string') {
            return this.required(
                res,
                "428 Precondition Required. Coordinate could not be empty."
            );
        }
        queryCoordinate = queryCoordinate.replace(/[|]+/, '|').replace(/(^[|]+|[|]+$)/, '');
        let points = queryCoordinate.split('|');
        if (points.length < 2) {
            return this.failed(
                res,
                "412 Precondition Failed. Invalid source or target position."
            );
        }

        let maxLat = 90;
        let minLat = -90;
        let maxLon = 180;
        let minLon = -180;


        let indonesiaMaxLat = 6.5;
        let indonesiaMinLat = -11.5;
        let indonesiaMaxLon = 141;
        let indonesiaMinLon = 94;

        let coordinates = [];
        for (let i = 0; points.length > i; i++) {
            if (!points[i]) {
                continue;
            }
            let coords = points[i].replace(/\s*/, '');
            if (coords.match(/[^\-0-9.,]/)) {
                return this.failed(
                    res,
                    `412 Precondition Failed. Invalid coordinates position offset ${i}.`
                );
            }

            coords = coords.split(',');
            if (coords.length !== 2) {
                return this.failed(
                    res,
                    `412 Precondition Failed. Invalid coordinates position count offset ${i}.`
                );
            }
            let startLat = coords[0];
            let startLon = coords[1];
            let startLatFloat = parseFloat(startLat);
            let startLonFloat = parseFloat(startLon);

            if (startLatFloat > maxLat || startLatFloat < minLat || startLonFloat > maxLon || startLonFloat < minLon) {
                return this.failed(
                    res,
                    `412 Precondition Failed. Coordinates position out of range on offset ${i}.`
                );
            }
            if (startLatFloat > indonesiaMaxLat || startLatFloat < indonesiaMinLat
                || startLonFloat > indonesiaMaxLon || startLonFloat < indonesiaMinLon
            ) {
                return this.failed(
                    res,
                    `412 Precondition Failed. Coordinates position is not in Indonesia on offset ${i}.`
                );
            }
            coordinates.push([+startLon, +startLat]);
        }

        // query params
        let overview = 'full';
        let alternatives = req.query.alternatives || 'true';
        if (typeof alternatives !== 'string') {
            alternatives = 'true';
        }
        alternatives = !!alternatives.toLowerCase().replace(/\s*/, '')
            .match(/^\s*(on|true|1|yes|[0-9]+)\s*$/gi);
        let geometry = 'geojson';
        if (typeof query.geometry === 'string'
            && query.geometry.match(/poly/gi)
        ) {
            geometry = 'polyline';
        }
        let availableAnnotations = [
            'duration', 'nodes', 'distance', 'weight', 'datasources', 'speed'
        ];
        let annotations = [
            'nodes',
            'distance',
        ];
        if (typeof query.annotations === 'string') {
            let _annotations = query.annotations
                .replace(/\s*/g, '')
                .replace(/[,]+/, ',')
                .replace(/(^[,]+|[,]+$)/, '')
                .toLowerCase();
            if (_annotations.trim() === '') {
                // pass
            } else if (_annotations.match(/^false$/g)) {
                annotations = false;
            } else if (_annotations.match(/^true$/g)) {
                annotations = true;
            } else {
                _annotations = _annotations.split(',');
                let __annotations = [];
                for (let ao in _annotations) {
                    if (_annotations.hasOwnProperty(ao)) {
                        continue;
                    }
                    if (typeof _annotations[ao] !== 'string') {
                        continue;
                    }
                    if (availableAnnotations.indexOf(_annotations[ao]) > -1) {
                        __annotations.push(_annotations[ao]);
                    }
                }
                if (__annotations.length) {
                    annotations = __annotations;
                } else {
                    annotations = false;
                }
            }
        }
        if (alternatives === true
            && typeof query.alternatives === 'string'
        ) {
            let _alternatives = query.alternatives.replace(/\s*/, '');
            if (!_alternatives.match(/[^0-9]/)) {
                alternatives = parseInt(_alternatives);
            }
        }
        let snapping = 'default';
        if (typeof query.snapping === 'string' && query.snapping.match(/^\s*any\*$/gi)) {
            snapping = 'any';
        }
        let radius = null;
        if (typeof query.radius === 'string' && !query.radius.replace(/\s*/, '').match(/[^0-9.]/)) {
            radius = query.radius.replace(/\s*/, '');
            radius = parseFloat(radius);
            if (radius < 0) {
                radius = null;
            }
        }
        let steps = typeof query.steps === 'string' && query.steps.match(/^\s*true\s*$/gi);

        // available Queries
        // alternatives: (int|bool) : integer get alternatives
        // geometry: (string) : geometry type -> geojson|polyline
        // annotations: (string|bool) : show annotations separate by comma -> duration|nodes|distance|weight|datasources|speed
        // snapping: (string) Which edges can be snapped to -> default|any
        // radius: (float) Limits the coordinate snapping to streets in the given radius in meters -> null|float
        let queries = {
            coordinates: coordinates,
            alternateRoute: typeof alternatives === 'number' || alternatives === true,
            alternatives: typeof alternatives === 'number' ? alternatives : 0,
            overview: overview,
            geometries: geometry,
            annotations: annotations,
            snapping: snapping,
            radius: radius,
            steps: steps
        };

        let osrm = new OSRM({path: osrmPath, algorithm: "MLD"});
        osrm.route(queries, (err, result) => {
            if (err) {
                return this.error(res, err.message);
            }
            let resp = {
                request: {
                    queries: queries
                }
            };
            for (let k in result) {
                if (!result.hasOwnProperty(k)) {
                    continue;
                }
                resp[k] = result[k];
            }
            return this.success(
                res,
                resp
            );
        });
    }
}

module.exports = Route;
