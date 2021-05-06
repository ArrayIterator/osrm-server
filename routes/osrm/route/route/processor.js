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
        continue_straight,
        responseCoordinates,
        bearings,
        approaches
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
    let queries = {
        coordinates: responseCoordinates.coordinates.array,
        alternateRoute: alternateRoute,
        alternatives: alternatives,
        overview: overview,
        geometries: geometries,
        annotations: annotations,
        snapping: snapping,
        steps: steps,
        continue_straight: continue_straight,
        radiuses: radiuses,
        bearings: bearings,
        approaches: approaches
    };

    // freed
    query = null;
    let response,
        q;
    let timeout = 5;
    let intvalErr;
    let stopped = false;
    let StopInt = function() {
        if (stopped === false && intvalErr) {
            stopped = true;
            clearInterval(intvalErr);
            intvalErr = null;
        }
    };
    try {
        intvalErr = setInterval(function() {
            if (timeout-- < 0) {
                StopInt();
                throw new Error("There was timeout processing request!");
            }
        }, 1000);
        osrm.route(queries, (err, result) => {
            if (err) {
                StopInt();
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
                    result: {},
                }
            };
            for (let k in result) {
                if (!result.hasOwnProperty(k)) {
                    continue;
                }
                response.data.result[k] = result[k];
            }
            result = null;
            StopInt();
            return response;
        });

        let Response = await AsyncAwait(() => response !== undefined, () => response, timeoutProcessSecond);
        if (Response instanceof Error) {
            StopInt();
            Response = {
                message: Response.message,
                code: Response.code
            }
        }
        if (Response.data === undefined && Response.message.toString().match(/nosegment|noroute/gi)) {
            StopInt();
            return {
                message: 'Could not find data within given request.',
                request: {
                    queries: queries
                },
                code: 404
            }
        }
        StopInt();
        return Response;
    } catch (e) {
        StopInt();
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
