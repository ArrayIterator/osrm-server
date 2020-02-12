module.exports = (query) => {
    let queries = {
        coordinates: [],
        alternateRoute: false,
        alternatives: 0,
        overview: 'simplified',
        geometries: 'polyline',
        annotations: false,
        snapping: 'default',
        radiuses: null,
        steps: false,
        continue_straight: false,
        number: 1,
        // disable approach
        // approaches: null,
        // waypoints: null,
        responseCoordinates: null,
    };

    let getCoordinates = (coordinates) => {
        if (typeof coordinates === 'string') {
            coordinates = coordinates
                .replace(/(?:[,\s]+)?[|]+([,\s]+)?/g, '|')
                .replace(/(^[,|\s]+|[,|\s]+$)/g, '')
                .replace(/[,]+/g, ',')
                .trim();
            if (coordinates === '') {
                return [];
            }

            coordinates = coordinates.split('|');
        }
        if (typeof coordinates === 'object') {
            let __coordinates = [];
            for (let c in coordinates) {
                if (!coordinates.hasOwnProperty(c)) {
                    continue;
                }
                if (typeof coordinates[c] === 'string') {
                    coordinates[c] = coordinates[c]
                        .replace(/(?:[,\s]+)?[|]+([,\s]+)?/g, '|')
                        .replace(/(^[,|\s]+|[,|\s]+$)/g, '')
                        .replace(/[,]+/g, ',')
                        .trim()
                        .split(',');
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
                        __coordinates.push(coordinates[c]['lon'], coordinates[c]['lat']);
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

                        __coordinates.push(coordinates[c]['lon'], coordinates[c]['lat']);
                        continue;
                    }
                    if (typeof coordinates[c].length === "number" && coordinates[c].length > 1) {
                        let _co = [];
                        for (let k in coordinates[c]) {
                            if (!coordinates[c].hasOwnProperty(k)) {
                                continue;
                            }

                            if (type.indexOf(typeof coordinates[c][k]) < 0) {
                                continue;
                            }
                            if (typeof coordinates[c][k] === 'string') {
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
    };

    queries.coordinates = getCoordinates(query.coordinates || query.coordinate || null);
    queries.responseCoordinates = require('./coordinates.js')(queries.coordinates);
    let annotationated = typeof query.annotations !== "undefined"
        ? query.annotations
        : (typeof query.annotation !== "undefined"
            ? query.annotation
            : null
        );

    if (annotationated !== null) {
        let availableAnnotations = [
            'duration', 'nodes', 'distance', 'weight', 'datasources', 'speed'
        ];
        let annotations = false;
        let continueAnnotation = false;
        let _annotations = null;
        if (typeof annotationated === 'string') {
            _annotations = annotationated
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
        } else if (typeof annotationated === "object") {
            _annotations = [];
            for (let k in annotationated) {
                if (!annotationated.hasOwnProperty(k)) {
                    continue;
                }
                annotationated[k] = _annotations = annotationated.annotations
                    .replace(/\s*/g, '')
                    .replace(/[,]+/, ',')
                    .replace(/(^[,]+|[,]+$)/, '')
                    .replace(/node(,|$)/, 'nodes$1')
                    .replace(/distances?/, 'distance')
                    .toLowerCase();
                if (annotationated[k] !== '') {
                    _annotations.push(annotationated[k]);
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
        queries.annotations = annotations;
    }

    if (typeof query.snapping) {
        let snapping = 'default';
        if (typeof query.snapping === 'string' && query.snapping.match(/^\s*any\*$/gi)) {
            snapping = 'any';
        }
        queries.snapping = snapping;
    }
    let radius = typeof query.radiuses !== 'undefined'
        ? query.radiuses
        : ( typeof query.radius !== 'undefined' ? query.radius : null);
    if (typeof radius === 'string' && !radius.toString().replace(/\s*/, '').match(/[^0-9.]/)) {
        radius = radius.toString().replace(/\s*/, '');
        radius = parseFloat(radius);
        if (radius <= 0) {
            radius = null;
        }
    }

    let alternatives = typeof query.alternatives === 'undefined'
        ? (typeof query.alternative === "undefined" ? null : query.alternative)
        : query.alternatives;
    if (typeof alternatives === "string") {
        if (alternatives.toString().match(/^\s*(on|true|yes)\s*$/gi)) {
            alternatives = 'true';
        } else if (alternatives.toString().replace(/\s*/, '').match(/^[0-9]+/g)) {
            alternatives = parseInt(alternatives);
        } else {
            alternatives = 'false';
        }
    } else {
        alternatives = 'false';
    }

    queries.alternateRoute = typeof alternatives === 'number' && alternatives > 0 || alternatives === true;
    queries.alternatives = typeof alternatives === 'number' ? alternatives : 0;
    let geometry = typeof query.geometries === 'undefined'
        ? (typeof query.geometry === "undefined" ? 'polyline' : query.geometry)
        : 'polyline';
    queries.geometries = geometry.match(/json/gi) ? 'geojson' : 'polyline';

    let steps = typeof query.steps === 'undefined'
        ? (typeof query.step === "undefined" ? null : query.step)
        : query.steps;
    queries.steps = !!(typeof steps === 'string' && steps.toString().match(/^\s*(on|true|1|yes)\s*$/gi));

    let continue_straight = typeof query.continue_straight === 'undefined'
        ? (typeof query.continue === "undefined" ? null : query.continue)
        : query.continue_straight;
    queries.continue_straight = !!(
        typeof continue_straight === 'string'
        && continue_straight.toString().match(/^\s*(on|true|1|yes)\s*$/gi)
    );
    let number = typeof query.number === 'undefined'
        ? (typeof query.count !== "undefined" ? query.count : (
            typeof query.total !== "undefined" ? query.count : null
        ))
        : query.number;
    queries.number =
        typeof number === 'string'
        && number.toString().match(/^\s*([0-9]+)\s*$/gi)
        ? parseInt(number)
        : 1;
    queries.number = queries.number > 1 ? queries.number : 1;
    if (typeof query.overview === 'string') {
        // query params
        queries.overview = query.overview.match(/^\s*(false|0|no|off)\s*$/gi)
            ? false
            : (query.overview.match(/^\s*(on|true|1|yes|full|all)\s*$/gi)
                ? 'full'
                : queries.overview
            );
    }
    queries.radiuses = [];
    for (let i = 0; queries.responseCoordinates.coordinates.array.length > i;i++) {
        queries.radiuses.push(radius);
    }
    return queries;
};
