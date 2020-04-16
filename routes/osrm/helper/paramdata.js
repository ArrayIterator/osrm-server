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
        bearings: null,
        continue_straight: false,
        number: 1,
        // disable approach
        approaches: null,
        // waypoints: null,
        responseCoordinates: null,
        fallback_speed: null,
        fallback_coordinate: 'input',
        destinations: null
    };

    let getCoordinates = (coordinates) => {
        if (!coordinates) {
            return [];
        }
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
                        coordinates[c]['lat'] = coordinates[c]['lat'].toString().trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                        coordinates[c]['lon'] = coordinates[c]['lon'].toString().trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                        __coordinates.push(coordinates[c]['lon'], coordinates[c]['lat']);
                        continue;
                    }
                    if (type.indexOf(typeof coordinates[c]['latitude']) > -1
                        && type.indexOf(typeof coordinates[c]['longitude']) > -1
                    ) {
                        coordinates[c]['latitude'] = coordinates[c]['latitude'].toString().trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                        coordinates[c]['longitude'] = coordinates[c]['longitude'].toString().trim().replace(/(^[\s,]+|[\s,]+$)/, '');
                        __coordinates.push(coordinates[c]['lon'], coordinates[c]['lat']);
                        continue;
                    }
                    if (Object.prototype.toString.call(coordinates[c]) === "[object Array]"
                        && coordinates[c].length > 1
                    ) {
                        let _co = [];
                        for (let k in coordinates[c]) {
                            if (!coordinates[c].hasOwnProperty(k)) {
                                continue;
                            }

                            if (type.indexOf(typeof coordinates[c][k]) < 0) {
                                continue;
                            }
                            if (typeof coordinates[c][k] === 'string') {
                                coordinates[c][k] = coordinates[c][k].trim().replace(/(^[\s,]+|[\s,]+$)/g, '');
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

    query.coordinate = query.coordinate || undefined;
    queries.coordinates = getCoordinates(query.coordinates || query.coordinate || null);
    queries.responseCoordinates = require('./coordinates.js')(queries.coordinates);
    query.annotation = query.annotation || undefined;
    let annotating = typeof query.annotations !== "undefined"
        ? query.annotations
        : (typeof query.annotation !== "undefined"
                ? query.annotation
                : null
        );

    if (annotating !== null) {
        let availableAnnotations = [
            'duration', 'nodes', 'distance', 'weight', 'datasources', 'speed'
        ];
        let annotations = false;
        let continueAnnotation = false;
        let _annotations = null;
        if (typeof annotating === 'string') {
            _annotations = annotating
                .replace(/\s*/g, '')
                .replace(/[,]+/g, ',')
                .replace(/(^[,]+|[,]+$)/g, '')
                .replace(/node(,|$)/g, 'nodes$1')
                .replace(/distances?/g, 'distance')
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
        } else if (typeof annotating === "object") {
            _annotations = [];
            for (let k in annotating) {
                if (!annotating.hasOwnProperty(k)) {
                    continue;
                }
                annotating[k] = _annotations = annotating.annotations
                    .replace(/\s*/g, '')
                    .replace(/[,]+/g, ',')
                    .replace(/(^[,]+|[,]+$)/g, '')
                    .replace(/node(,|$)/g, 'nodes$1')
                    .replace(/distances?/g, 'distance')
                    .toLowerCase();
                if (annotating[k] !== '') {
                    _annotations.push(annotating[k]);
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

    query.snappings = query.snappings || undefined;
    let snapping = typeof query.snapping !== 'undefined'
        ? query.snapping
        : (typeof query.snappings !== 'undefined' ? query.snappings : null);
    queries.snapping = typeof snapping === 'string' && snapping.match(/^\s*any\*$/gi)
        ? 'any'
        : 'default';


    query.alternative = query.alternative || undefined;
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
    query.geometry = query.geometry || undefined;
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
            ? (number.toString().match(/^\s*([0-9]+)\s*$/gi)
                ? parseInt(number)
                : (number.toString().match(/null|false/gi) ? null : 1)
            )
            : 1;
    let fallback_speed = typeof query.fallback_speed === 'undefined'
        ? null
        : query.fallback_speed;
    queries.fallback_speed = typeof fallback_speed === 'string'
        ? (fallback_speed.toString().match(/^\s*([0-9]+)\s*$/gi)
                ? parseFloat(fallback_speed)
                : (fallback_speed.toString().match(/null|false/gi) ? null : null)
        ) : null;
    let scale_factor = typeof query.scale_factor === 'undefined'
        ? null
        : query.scale_factor;
    queries.scale_factor = typeof scale_factor === 'string'
        ? (scale_factor.toString().match(/^\s*([0-9]+)\s*$/gi)
                ? parseFloat(scale_factor)
                : (scale_factor.toString().match(/null|false/gi) ? null : null)
        ) : null;

    let fallback_coordinate = typeof query.fallback_coordinate === 'undefined'
        ? 'input'
        : query.fallback_coordinate;
    queries.fallback_coordinate = typeof fallback_coordinate === 'string'
        ? (fallback_coordinate.match(/snap/gi) ? 'snapped' : 'input')
        : 'input';

    queries.number = queries.number > 1 ? queries.number : 1;
    if (typeof query.overview === 'string') {
        // query params
        queries.overview = queries.overview.trim() === '' || query.overview.match(/^\s*(false|0|no|off)\s*$/gi)
            ? false
            : (query.overview.match(/^\s*(on|true|1|yes|full|all)\s*$/gi)
                    ? 'full'
                    : queries.overview
            );
    }
    let getDestinations = (destinations) => {
        if (!destinations) {
            return [];
        }

        if (typeof destinations === 'string') {
            destinations = destinations
                .replace(/[\s]+/g, '')
                .trim();
            if (destinations === '') {
                return [];
            }
            destinations = destinations.split(',');
        }
        if (destinations && typeof destinations === 'object') {
            let __destinations = [];
            for (let c in destinations) {
                if (!destinations.hasOwnProperty(c)) {
                    continue;
                }
                let type = ['number', 'string'];
                if (type.indexOf(typeof destinations[c]) < 0) {
                    continue;
                }

                destinations[c] = destinations[c]
                    .toString()
                    .replace(/[,]+/g, ',')
                    .replace(/(^[,\s]+|[,\s]+$)/g, '')
                    .trim();

                if (destinations[c] === ''
                    || destinations[c].match(/[^0-9]/gi)
                ) {
                    continue;
                }
                __destinations.push(parseInt(destinations[c]));
            }

            return __destinations;
        }
        return [];
    };
    // DESTINATIONS
    let destinations = getDestinations(
        typeof query.destinations !== 'undefined'
            ? query.destinations
            : (typeof query.destination !== "undefined" ? query.destination : null)
    );
    if (destinations.length > 0) {
        for (let i = 0; destinations.length > i; i++) {
            let dt = destinations[i];
            if (dt < 0 || typeof queries.responseCoordinates.coordinates.array[dt] === "undefined") {
                continue;
            }
            if (!queries.destinations) {
                queries.destinations = [];
            }
            queries.destinations.push(dt);
        }
    }

    // BEARINGS
    let getBearings = (bearings) => {
        if (bearings) {
            if (typeof bearings === 'string') {
                bearings = bearings
                    .replace(/(?:[,\s]+)?[|]+([,\s]+)?/g, '|')
                    .replace(/(^[,|\s]+|[,|\s]+$)/g, '')
                    .replace(/[,]+/g, ',')
                    .trim();
                if (bearings === '') {
                    return [];
                }

                bearings = bearings.split('|');
            }
            if (typeof bearings !== 'object') {
                return [];
            }
            let __bearings = [];
            for (let c in bearings) {
                if (!bearings.hasOwnProperty(c)) {
                    continue;
                }
                if (typeof bearings[c] === 'string') {
                    bearings[c] = bearings[c]
                        .replace(/\s*/, '')
                        .trim()
                        .split(',');
                }
                let bearing = bearings[c];
                if (Object.prototype.toString.call(bearing) !== "[object Object]") {
                    let _bearing = bearing;
                    bearing = [];
                    for (let k1 in _bearing) {
                        if (!_bearing.hasOwnProperty(k1)) {
                            continue;
                        }
                        bearing.push(_bearing);
                    }
                }

                if (!bearing
                    || Object.prototype.toString.call(bearing) !== "[object Array]"
                    || bearing.length < 2
                ) {
                    __bearings.push(null);
                    continue;
                }

                let type = ['number', 'string'];
                let _co = [];
                for (let k in bearing) {
                    if (!bearing.hasOwnProperty(k)) {
                        continue;
                    }
                    if (type.indexOf(typeof bearing[k]) < 0) {
                        continue;
                    }
                    if (typeof bearing[k] === 'string') {
                        bearing[k] = bearing[k].trim().replace(/\s*/g, '');
                        if (bearing[k].match(/[^0-9.]/g)) {
                            continue;
                        }
                        bearing[k] = parseFloat(bearing[k]);
                    }
                    if (typeof bearing[k] !== 'number') {
                        continue;
                    }
                    bearing[k] = parseFloat(bearing[k]);
                    _co.push(bearing[k]);
                    if (_co.length === 2) {
                        break;
                    }
                }
                if (_co.length !== 2
                    || _co[0] > 360
                    || _co[1] > 180
                    || _co[0] < 0
                    || _co[1] < 0
                ) {
                    __bearings.push(null);
                    continue;
                }
                __bearings.push(_co);
            }
            return __bearings;
        } else {
            return [];
        }
    };

    query.bearing = query.bearing || undefined;
    let bearings = getBearings(
        typeof query.bearings !== 'undefined'
            ? query.bearings
            : (typeof query.bearing !== 'undefined' ? query.bearing : null)
    );
    queries.bearings = [];
    while (queries.bearings.length < queries.responseCoordinates.coordinates.array.length) {
        let bearing = bearings[queries.bearings.length] || null;
        queries.bearings.push(bearing);
    }

    // RADIUS
    let getRadius = (radius) => {
        if (!radius) {
            return [];
        }

        if (typeof radius === 'string') {
            radius = radius
                .replace(/[\s]+/g, '')
                .trim();
            if (radius === '') {
                return [];
            }
            radius = radius.split(',');
        }
        if (radius && typeof radius === 'object') {
            let __radius = [];
            for (let c in radius) {
                let type = ['number', 'string'];
                if (type.indexOf(typeof radius[c]) < 0) {
                    continue;
                }

                radius[c] = radius[c]
                    .toString()
                    .replace(/[,]+/g, ',')
                    .replace(/(^[,\s]+|[,\s]+$)/g, '')
                    .trim();

                if (radius[c] === ''
                    || radius[c].match(/^((?:.*)null(?:.*)|[0]+)$/gi)
                    || radius[c].match(/[^0-9.]/gi)
                    || parseFloat(radius[c]) < 1
                ) {
                    __radius.push(null);
                    continue;
                }
                __radius.push(parseFloat(radius[c]));
            }

            return __radius;
        }
        return [];
    };
    query.radius = query.radius || undefined;
    let radius = getRadius(typeof query.radiuses !== 'undefined'
        ? query.radiuses
        : (typeof query.radius !== 'undefined' ? query.radius : null)
    );
    queries.radiuses = [];
    while (queries.radiuses.length < queries.responseCoordinates.coordinates.array.length) {
        let rad = radius[queries.radiuses.length] || null;
        queries.radiuses.push(rad);
    }
    // RADIUS
    let getApproaches = (approaches) => {
        if (!approaches) {
            return [];
        }

        if (typeof approaches === 'string') {
            approaches = approaches
                .replace(/[\s]+/g, '')
                .trim();
            if (approaches === '') {
                return [];
            }
            approaches = approaches.split(',');
        }
        if (approaches && typeof approaches === 'object') {
            let __approaches = [];
            for (let c in approaches) {
                if (!approaches.hasOwnProperty(c)) {
                    continue;
                }
                let type = ['number', 'string'];
                if (type.indexOf(typeof approaches[c]) < 0) {
                    continue;
                }
                __approaches.push(
                    approaches[c].toString().match(/cur/gi) ? 'curb' : null
                )
            }

            return __approaches;
        }
        return [];
    };

    query.approach = query.approach || undefined;
    let approaches = getApproaches(typeof query.approaches !== 'undefined'
        ? query.approaches
        : (typeof query.approach !== 'undefined' ? query.approach : null)
    );

    queries.approaches = [];
    while (queries.approaches.length < queries.responseCoordinates.coordinates.array.length) {
        let ap_ = approaches[queries.approaches.length] || null;
        queries.approaches.push(ap_);
    }
    return queries;
};
