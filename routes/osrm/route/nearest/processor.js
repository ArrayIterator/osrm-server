module.exports = async (query, timeoutProcessSecond) => {
    if (typeof timeoutProcessSecond === 'number') {
        timeoutProcessSecond = 10;
    }
    if (timeoutProcessSecond < 2) {
        timeoutProcessSecond = 2;
    } else if (timeoutProcessSecond > 60) {
        timeoutProcessSecond = 60;
    }
    let options = Config.get('osrm') || {};
    if (typeof options !== 'object') {
        options = {};
    }
    const osrm = require('../../helper/osrm.js')(options);
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
        snapping,
        radiuses,
        responseCoordinates,
        number,
        bearings,
        approaches
    } = require('../../helper/paramdata')(query);

    if (!coordinates.length) {
        return {
            code: 428,
            message: "428 Precondition Required. Coordinate could not be empty."
        };
    }

    if (coordinates.length < 1
        || responseCoordinates.coordinates.array.length < 1
    ) {
        if (responseCoordinates.error) {
            return responseCoordinates.error;
        }
        return {
            code: 412,
            message: "412 Precondition Failed. Invalid source or target position."
        };
    }


    // if (responseCoordinates.error) {
    //    return responseCoordinates.error;
    //}

    let arr = [responseCoordinates.coordinates.array.shift()];
    let queries = {
        coordinates: arr,
        snapping: snapping,
        radiuses: [radiuses.shift()],
        number: number,
        approaches: [approaches.shift()],
        bearings: [bearings.shift()]
    };

    // freed
    query = null;
    let response,
        q;
    try {
        osrm.nearest(queries, (err, result) => {
            if (err) {
                response = {
                    code: 500,
                    message: err
                };
                return response;
            }
            q = queries;
            q.coordinates = [responseCoordinates.coordinates.object.shift()];
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

        response = await AsyncAwait(() => response !== undefined, () => response, timeoutProcessSecond);
        if (response instanceof Error) {
            response = {
                message: response.message,
                code: response.code
            }
        }

        if (response.data === undefined && response.message.toString().match(/nosegment|noroute/gi)) {
            return {
                message: 'Could not find data within given request.',
                request: {
                    queries: queries
                },
                code: 404
            }
        }

        return response;
    } catch (e) {
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
