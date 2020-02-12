const OSRM = require('osrm');
const path = require('path');
const fs = require('fs');
module.exports = async (query, timeoutProcessSecond) => {
    if (typeof timeoutProcessSecond === 'number') {
        timeoutProcessSecond = 10;
    }
    if (timeoutProcessSecond < 2) {
        timeoutProcessSecond = 2;
    } else if (timeoutProcessSecond > 60) {
        timeoutProcessSecond = 60;
    }
    let queryCoordinate = query.coordinates || query.coordinate || null;
    let osrmPath = Config.get('osrm') || null;
    osrmPath = osrmPath ? osrmPath.path : null;
    osrmPath = osrmPath || path.join(StoragePath + '/osrm/indonesia-latest.osrm');
    if (!fs.existsSync(osrmPath)) {
        return {
            message: "500 Internal Server Error. OSRM database has not ready.",
            code: 500
        };
    }

    if (typeof queryCoordinate !== 'string') {
        return {
            code: 428,
            message: "428 Precondition Required. Coordinate could not be empty."
        };
    }
    // replace duplications of separator
    queryCoordinate = queryCoordinate
        .replace(/(?:[,\s]+)?[|]+([,\s]+)?/g, '|')
        .replace(/(^[,|\s]+|[,|\s]+$)/g, '')
        .replace(/[,]+/g, ',');
    let points = queryCoordinate.split('|');
    if (points.length < 2) {
        return {
            code: 412,
            message: "412 Precondition Failed. Invalid source or target position."
        };
    }

    let maxLat = 90;
    let minLat = -90;
    let maxLon = 180;
    let minLon = -180;

    let indonesiaMaxLat = 6.5;
    let indonesiaMinLat = -11.5;
    let indonesiaMaxLon = 141;
    let indonesiaMinLon = 94;

    let coordinates = [],
        _coordinates = [];
    for (let i = 0; points.length > i; i++) {
        if (!points[i]) {
            continue;
        }
        let coords = points[i].replace(/\s*/, '');
        if (coords.match(/[^\-0-9.,]/)) {
            return {
                message: `412 Precondition Failed. Invalid coordinates position offset ${i} : ${coords}`,
                code: 412
            };
        }

        coords = coords.split(',');
        if (coords.length < 2) {
            return {
                message: `412 Precondition Failed. Invalid coordinates position offset ${i} : ${JSON.stringify(coords)}`,
                code: 412
            };
        }
        let startLat = coords[1];
        let startLon = coords[0];
        let startLatFloat = parseFloat(startLat);
        let startLonFloat = parseFloat(startLon);

        if (startLatFloat > maxLat || startLatFloat < minLat) {
            return {
                message: `412 Precondition Failed. Coordinates position latitude is out of range on offset ${i} : ${startLat}.`,
                code: 412
            };
        }
        if (startLonFloat > maxLon
            || startLonFloat < minLon
        ) {
            return {
                message: `412 Precondition Failed. Coordinates position longitude is out of range on offset ${i} : ${startLon}.`,
                code: 412
            };
        }

        if (startLatFloat > indonesiaMaxLat || startLatFloat < indonesiaMinLat) {
            return {
                message: `412 Precondition Failed. Coordinates position is not in Indonesia on offset ${i}: ${startLat}.`,
                code: 412
            };
        }
        if (startLonFloat > indonesiaMaxLon || startLonFloat < indonesiaMinLon) {
            return {
                message: `412 Precondition Failed. Coordinates position is not in Indonesia on offset ${i}: ${startLon}.`,
                code: 412
            };
        }
        startLon = +startLon;
        startLat = +startLat;
        _coordinates.push({lon: startLon, lat: startLat});
        coordinates.push([startLon, startLat]);
    }

    // query params
    let overview = 'full';
    let alternatives = query.alternatives || 'false';
    if (typeof alternatives !== 'string') {
        alternatives = 'false';
    }
    alternatives = !!alternatives.toLowerCase().replace(/\s*/, '')
        .match(/^\s*(on|true|1|yes|[0-9]+)\s*$/gi);
    let geometry = 'polyline';
    if (typeof query.geometry === 'string') {
        geometry = query.geometry.match(/json/gi) ? 'geojson' : 'polyline';
    }
    let availableAnnotations = [
        'duration', 'nodes', 'distance', 'weight', 'datasources', 'speed'
    ];
    // [
    //             'nodes',
    //             'distance',
    //         ]
    let annotations = false;
    let ann = query.annotations;
    let continueAnnotation = false;
    let _annotations = null;
    if (typeof ann === 'string') {
        _annotations = ann
            .replace(/\s*/g, '')
            .replace(/[,]+/, ',')
            .replace(/(^[,]+|[,]+$)/, '')
            .replace(/node(,|$)/, 'nodes$1')
            .replace(/distances?/, 'distance')
            .toLowerCase();
        if (_annotations.trim() === '') {
            // pass
        } else if (_annotations.match(/^false$/g)) {
            annotations = false;
        } else if (_annotations.match(/^true$/g)) {
            annotations = true;
        } else {
            continueAnnotation = true;
        }
    } else if (typeof ann === "object") {
        _annotations = [];
        for (let k in ann) {
            if (!ann.hasOwnProperty(k)) {
                continue;
            }
            ann[k] = _annotations = ann.annotations
                .replace(/\s*/g, '')
                .replace(/[,]+/, ',')
                .replace(/(^[,]+|[,]+$)/, '')
                .replace(/node(,|$)/, 'nodes$1')
                .replace(/distances?/, 'distance')
                .toLowerCase();
            if (ann[k] !== '') {
                _annotations.push(ann[k]);
            }
        }
        continueAnnotation = true;
        _annotations = _annotations.join(',');
    }

    if (continueAnnotation && typeof _annotations === 'string') {
        _annotations = _annotations.toString().split(',');
        let __annotations = [];
        for (let ao in _annotations) {
            if (!_annotations.hasOwnProperty(ao)) {
                continue;
            }
            if (typeof _annotations[ao] !== 'string') {
                continue;
            }
            if (availableAnnotations.indexOf(_annotations[ao]) > -1
                && __annotations.indexOf(annotations[0]) < 0
            ) {
                __annotations.push(_annotations[ao]);
            }
        }

        if (__annotations.length) {
            annotations = __annotations;
        } else {
            annotations = false;
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
    let step = typeof query.steps === 'undefined'
        ? (typeof query.step === "undefined" ? null : typeof query.step)
        : typeof query.steps;
    let steps = !!(typeof step === 'string' && step.toString().match(/^\s*(on|true|1|yes|[0-9]+)\s*$/gi));

    // available Queries
    // alternatives: (int|bool) : integer get alternatives
    // geometry: (string) : geometry type -> geojson|polyline
    // annotations: (string|bool) : show annotations separate by comma -> duration|nodes|distance|weight|datasources|speed
    // snapping: (string) Which edges can be snapped to -> default|any
    // radius: (float) Limits the coordinate snapping to streets in the given radius in meters -> null|float
    // steps: (bool) Return route steps for each route leg. -> true|false
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

    // freed
    query = null;
    let response,
        q;
    try {
        let osrm = new OSRM({path: osrmPath, algorithm: "MLD"});
        osrm.route(queries, (err, result) => {
            if (err) {
                response = {
                    code: 500,
                    message: err
                };
                return response;
            }
            q = queries;
            q.coordinates = _coordinates;
            queries = false;
            response = {
                data: {
                    note: "Location array sorted by longitude first.",
                    request: {
                        queries: q
                    }
                }
            };
            for (let k in result) {
                if (!result.hasOwnProperty(k)) {
                    continue;
                }
                response.data[k] = result[k];
            }
            result = null;
            return response;
        });
        response = await AsyncAwait(() => response !== undefined, () => response, timeoutProcessSecond);
        if (response instanceof Error) {
            response = {
                message: response.message,
                code: response.code
            }
        }
        return response;
    } catch (e) {
        return {
            message: e,
            code: 500
        }
    }
};
