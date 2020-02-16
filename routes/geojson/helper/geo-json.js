const geo_countries = require(RootPath+'/countries.json');
function GeoJson()
{
    let geo = GeoJson;
    let getMaxMin = (coordinate) => {
        let maxMin = {
            latitude: {
                minimum: undefined,
                maximum: undefined,
            },
            longitude: {
                minimum: undefined,
                maximum: undefined,
            },
        };

        for (let i = 0;coordinate.length > i;i++) {
            let coordinates = [];
            let coords = coordinate[i];
            if (coords !== 2 || typeof coords[0] !== "number") {
                for (let i2 =0; coords.length > i2;i2++) {
                    if (coords[i2] === 2 || typeof coords[i2][0] === "number") {
                        coordinates = coords;
                        break;
                    }
                    for (let i3 =0; coords[i2].length > i3;i3++) {
                        if (coords[i2][i3] === 2 || typeof coords[i2][i3][0] === "number") {
                            coordinates = coords[i2];
                            break;
                        }
                    }
                }
            }

            for (let c1 = 0; coordinates.length > c1;c1++) {
                if (!coordinates[c1]) {
                    continue;
                }
                let lat = coordinates[c1][1];
                let lon = coordinates[c1][0];
                if (typeof maxMin.latitude.maximum !== 'number'
                    || typeof maxMin.latitude.minimum !== 'number'
                    || typeof maxMin.longitude.maximum !== 'number'
                    || typeof maxMin.longitude.minimum !== 'number'
                ) {
                    maxMin.latitude.minimum = lat;
                    maxMin.latitude.maximum = lat;
                    maxMin.longitude.maximum = lon;
                    maxMin.longitude.minimum = lon;
                    continue;
                }
                if (maxMin.latitude.minimum > lat) {
                    maxMin.latitude.minimum = lat;
                }
                if (maxMin.latitude.maximum < lat) {
                    maxMin.latitude.maximum = lat;
                }
                if (maxMin.longitude.minimum > lon) {
                    maxMin.longitude.minimum = lon;
                }
                if (maxMin.longitude.maximum < lon) {
                    maxMin.longitude.maximum = lon;
                }
            }
        }
        return maxMin;
    };
    geo.all = () => {
        return geo_countries.features || [];
    };
    geo.json = () => geo_countries;
    geo.code = function (code) {
        if (typeof code !== 'string'
            || code.trim().length < 3
            || !code.trim().match(/^[a-z]{3}$/gi)
        ) {
            return null;
        }
        code = code.trim().toUpperCase();
        let all = geo.all();
        for (let i =0; all.length > i;i++) {
            if (all[i].id.toUpperCase() === code) {
                return {
                    info: getMaxMin(all[i].geometry.coordinates),
                    result: {
                        type: "FeatureCollection",
                        features: all[i]
                    },
                };
            }
        }

        return null;
    };
    geo.countryName = function (name) {
        if (typeof name !== 'string') {
            return null;
        }
        name = name.trim().toLowerCase();
        let all = geo.all();
        for (let i =0; all.length > i;i++) {
            if (typeof all[i].properties.name === 'string'
                && all[i].properties.name.toString().toLowerCase() === name
            ) {
                return {
                    info : getMaxMin(all[i].geometry.coordinates),
                    result: {
                        type: "FeatureCollection",
                        features: all[i]
                    }
                };
            }
        }
        return null;
    };

    return geo;
}

module.exports = new GeoJson;
