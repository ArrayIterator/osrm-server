module.exports = (coordinates) => {

    let maxLat = 90;
    let minLat = -90;
    let maxLon = 180;
    let minLon = -180;
    // used based on countries.json
    let maxMin = {
        minLat: -10.359987,
        minLon: 95.293026,
        maxLat: 5.479821,
        maxLon: 141.033852
    };

    let indonesiaMaxLat = maxMin.maxLat;
    let indonesiaMinLat = maxMin.minLat;
    let indonesiaMaxLon = maxMin.maxLon;
    let indonesiaMinLon = maxMin.minLon;
    let response = {
        limit: {
            maxLat: maxLat,
            minLat: minLat,
            maxLon: maxLon,
            minLon: minLon,
            indonesiaMaxLat: indonesiaMaxLat,
            indonesiaMinLat: indonesiaMinLat,
            indonesiaMaxLon: indonesiaMaxLon,
            indonesiaMinLon: indonesiaMinLon,
        },
        coordinates: {
            array: [],
            object: [],
        },
        error: undefined
    };
    if (typeof coordinates !== 'object' || typeof coordinates.length !== 'number') {
        response.error = {
            code: 428,
            message: "428 Precondition Required. Coordinate could not be empty."
        };
        return response;
    }

    if (coordinates.length < 2) {
        response.error = {
            code: 412,
            message: "412 Precondition Failed. Invalid source or target position."
        };
        return response;
    }


    let _coordinates = [];
    let newCoordinates = [];
    let error = false;
    for (let i = 0; coordinates.length > i; i++) {
        if (!coordinates[i]) {
            continue;
        }
        let coords = coordinates[i].replace(/\s*/, '');
        if (coords.match(/[^\-0-9.,]/)) {
            if (!error) {
                error = {
                    message: `412 Precondition Failed. Invalid coordinates position offset ${i} : ${coords}`,
                    code: 412
                };
            }
            continue;
        }

        coords = coords.split(',');
        if (coords.length < 2) {
            if (!error) {
                error = {
                    message: `412 Precondition Failed. Invalid coordinates position offset ${i} : ${JSON.stringify(coords)}`,
                    code: 412
                };
            }
            continue;
        }
        let startLat = coords[1];
        let startLon = coords[0];
        let startLatFloat = parseFloat(startLat);
        let startLonFloat = parseFloat(startLon);

        if (startLatFloat > maxLat || startLatFloat < minLat) {
            if (!error) {
                error = {
                    message: `412 Precondition Failed. Coordinates position latitude is out of range on offset ${i} : ${startLat}.`,
                    code: 412
                };
            }
            continue;
        }
        if (startLonFloat > maxLon
            || startLonFloat < minLon
        ) {
            if (!error) {
                error = {
                    message: `412 Precondition Failed. Coordinates position longitude is out of range on offset ${i} : ${startLon}.`,
                    code: 412
                };
            }
            continue;
        }

        if (startLatFloat > indonesiaMaxLat || startLatFloat < indonesiaMinLat) {
            if (!error) {
                error = {
                    message: `412 Precondition Failed. Coordinates position is not in Indonesia on offset ${i}: ${startLat}.`,
                    code: 412
                };
            }
            continue;
        }
        if (startLonFloat > indonesiaMaxLon || startLonFloat < indonesiaMinLon) {
            if (!error) {
                error = {
                    message: `412 Precondition Failed. Coordinates position is not in Indonesia on offset ${i}: ${startLon}.`,
                    code: 412
                };
            }
            continue;
        }
        startLon = +startLon;
        startLat = +startLat;
        _coordinates.push({lon: startLon, lat: startLat});
        newCoordinates.push([startLon, startLat]);
    }
    if (error) {
        response.error = error;
    }
    response.coordinates.array = newCoordinates;
    response.coordinates.object = _coordinates;
    return response;
};
