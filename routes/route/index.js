module.exports = (req, res) => {
    const OSRM = require('osrm');
    const path = require('path');
    let params = req.params;
    let query = req.query;
    const {precondition, ok, internal, required} = express.serve;
    const isCompressed = !(!req.query.compress || !req.query.compress.toString().replace(/\s*/, '').match(/^(true|1|yes)$/gi));
    let queryCoordinate = query.coordinates || query.coordinate || null;
    if (typeof queryCoordinate !== 'string') {
        return required(
            res,
            "Precondition Required. Coordinate could not be empty.",
            isCompressed
        );
    }
    queryCoordinate = queryCoordinate.replace(/[\|]+/, '|').replace(/(^[\|]+|[\|]+$)/, '');
    let points = queryCoordinate.split('|');
    if (points.length < 2) {
        return precondition(
            res,
            "Precondition Failed. Invalid source or target position.",
            isCompressed
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

    var coordinates = [];
    for (var i = 0; points.length > i;i++) {
        if (!points[i]) {
            continue;
        }
        var coords = points[i].replace(/\s*/, '');
        if (coords.match(/[^\-0-9\.\,]/)) {
            return precondition(
                res,
                `Precondition Failed. Invalid coordinates position offset ${i}.`,
                412,
                isCompressed
            );
        }

        coords = coords.split(',');
        if (coords.length !== 2) {
            return precondition(
                res,
                `Precondition Failed. Invalid coordinates position count offset ${i}.`,
                412,
                isCompressed
            );   
        }
        var startLat = coords[0];
        var startLon = coords[1];
        var startLatFloat = parseFloat(startLat);
        var startLonFloat = parseFloat(startLon);

        if (startLatFloat > maxLat || startLatFloat < minLat || startLonFloat > maxLon || startLonFloat < minLon) {
            return precondition(
                res,
                `Precondition Failed. Coordinates position out of range on offset ${i}.`,
                isCompressed
            );
        }
        if (startLatFloat > indonesiaMaxLat || startLatFloat < indonesiaMinLat
            || startLonFloat > indonesiaMaxLon || startLonFloat < indonesiaMinLon
        ) {
            return precondition(
                res,
                `Precondition Failed. Coordinates position is not in Indonesia on offset ${i}.`,
                isCompressed
            );
        }
        coordinates.push([ +startLon, +startLat ]);
    }

    // query params
    var overview = 'full';
    var alternatives = req.query.alternatives || 'true';
    if (typeof alternatives !== 'string') {
        alternatives = 'true';
    }
    alternatives = !!alternatives.toLowerCase().replace(/\s*/, '')
        .match(/^\s*(true|1|yes|[0-9]+)\s*$/gi);
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
            .replace(/[\,]+/, ',')
            .replace(/(^[\,]+|[\,]+$)/, '')
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
            for (var anno in annotations) {
                if (typeof annotations[anno] !== 'string') {
                    continue;
                }
                if (availableAnnotations.indexOf(annotations[anno]) > -1) {
                    __annotations.push(annotations[anno]);
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
    if (typeof query.radius === 'string' && !query.radius.replace(/\s*/, '').match(/[^0-9\.]/)) {
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
    // annotations: (string|bool) : show annotations separate by comma -> duration|nodes|istance|weight|datasources|speed
    // snapping: (string) Which edges can be snapped to -> default|any
    // radius: (float) Limits the coordinate snapping to streets in the given radius in meters -> null|float
    var queries = {
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

    let osrmPath = config.get('osrm') || null;
        osrmPath = osrmPath ? osrmPath.path : null;
        osrmPath = osrmPath || path.join(__dirname + '/../../data/indonesia-latest.osrm');
    let osrm = new OSRM({path: osrmPath, algorithm: "MLD"});

    osrm.route(queries, function(err, result) {
        if (err) {
            return internal(res, err.message, isCompressed);
        }
        let resp = {
            request: {
                queries: queries
            }
        };
        for (var k in result) {
            resp[k] = result[k];
        }
        return ok(
            res,
	        resp,
            isCompressed
        );
    });
};
