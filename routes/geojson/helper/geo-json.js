const geo_countries = require(RootPath+'/countries.json');
function GeoJson()
{
    let geo = GeoJson;
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
                    "type": "FeatureCollection",
                    features: all[i]
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
                    "type": "FeatureCollection",
                    "features": all[i]
                };
            }
        }
        return null;
    };
    return geo;
}

module.exports = new GeoJson;
