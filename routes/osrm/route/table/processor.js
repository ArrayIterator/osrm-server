module.exports = async (query, timeoutProcessSecond) => {
    if (typeof timeoutProcessSecond === 'number') {
        timeoutProcessSecond = 10;
    }
    if (timeoutProcessSecond < 2) {
        timeoutProcessSecond = 2;
    } else if (timeoutProcessSecond > 60) {
        timeoutProcessSecond = 60;
    }

    const osrm = require('../../helper/osrm.js')();
    if (typeof osrm === 'object' && typeof osrm.code === 'number') {
        return osrm;
    }

    // available Queries
    // alternatives: (int|bool) : integer get alternatives
    // geometry: (string) : geometry type -> geojson|polyline
    // annotations: (string|bool) : show annotations separate by comma -> duration|nodes|distance|weight|datasources|speed
    // snapping: (string) Which edges can be snapped to -> default|any
    // radiuses: (float) Limits the coordinate snapping to streets in the given radiuses in meters -> null|float
    // steps: (bool) Return route steps for each route leg. -> true|false
    // continue_straight: (bool) Forces the route to keep going straight at waypoints and don't do a uturn even if it would be faster.
    let {
        coordinates,
        alternateRoute,
        alternatives,
        overview,
        geometries,
        annotations,
        snapping,
        radiuses,
        steps,
        responseCoordinates,
        bearings,
        approaches,
        fallback_coordinate,
        fallback_speed,
        scale_factor,
        destinations
    } = require('../../helper/paramdata')(query);

    if (!coordinates.length) {
        return {
            code: 428,
            message: "428 Precondition Required. Coordinate could not be empty."
        };
    }

    if (coordinates.length < 2
        || responseCoordinates.coordinates.array.length < 2
    ) {
        if (responseCoordinates.error) {
            return responseCoordinates.error;
        }

        return {
            code: 412,
            message: "412 Precondition Failed. Invalid source or target position."
        };
    }

    if (responseCoordinates.error) {
        return responseCoordinates.error;
    }
    // temp
    let __annotations = ['duration', 'distance'];
    let _annotations = [];
    annotations = annotations || [];
    if (annotations.indexOf('duration')) {
        _annotations.push('duration');
    }
    if (annotations.indexOf('distance')) {
        _annotations.push('distance');
    }
    if (_annotations.length === 0) {
        _annotations = __annotations;
    }
    let queries = {
        coordinates: responseCoordinates.coordinates.array,
        annotations: _annotations,
        snapping: snapping,
        steps: steps,
        radiuses: radiuses,
        bearings: bearings,
        approaches: approaches,
        fallback_coordinate: fallback_coordinate
    };
    if (fallback_speed) {
        queries.fallback_speed = fallback_speed;
    }
    if (scale_factor) {
        queries.scale_factor = scale_factor;
    }
    if (destinations) {
        queries.destinations = destinations;
    }

    // freed
    query = null;
    let response,
        q;
    try {
        osrm.table(queries, (err, result) => {
            if (err) {
                response = {
                    code: 500,
                    message: err
                };
                return response;
            }
            q = queries;
            q.coordinates = responseCoordinates.coordinates.object;
            queries = false;
            response = {
                data: {
                    note: "Location array sorted by longitude first.",
                    request: {
                        queries: q
                    },
                    result: {}
                }
            };
            for (let k in result) {
                if (!result.hasOwnProperty(k)) {
                    continue;
                }
                response.data.result[k] = result[k];
            }
            result = null;
            return response;
        });

        let Response = await AsyncAwait(() => response !== undefined, () => response, timeoutProcessSecond);
        if (Response instanceof Error) {
            Response = {
                message: Response.message,
                code: Response.code
            }
        }
        if (Response.data === undefined && Response.message.toString().match(/nosegment|noroute/gi)) {
            return {
                message: 'Could not find data within given request.',
                request: {
                    queries: queries
                },
                code: 404
            }
        }

        return Response;
    } catch (e) {
        // console.log(e);
        if (e.message.match(/nosegment|noroute/gi)) {
            return {
                message: 'Could not find data within given request.',
                request: {
                    queries: queries
                },
                code: 404
            }
        }
        return {
            message: e,
            code: 500
        }
    }
};
