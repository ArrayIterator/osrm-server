class Ip extends Routing {
    getPattern() {
        return '/ip';
    }

    getMethods() {
        return 'GET';
    }

    async route(req, res, next) {
        const MaxMind = require('maxmind');
        const fs = require('fs');
        const geoIpPath = StoragePath + '/geoip';
        let query = req.query;
        let ip = query.ip || req.headers['x-forwarded-for'] || req.ip;
        if (!ip || typeof ip !== 'string') {
            return this.failed(res, 'Precondition Failed. Invalid IP Address.');
        }
        let isFromQuery = typeof query.ip === 'string' && query.ip.trim() !== '';
        ip = ip.trim() === '' ? req.ip : ip;
        let isIpv6;
        let isIpValid;
        isIpv6 = ip.match(/[:]/g);
        if (isIpv6) {
            isIpValid = !ip.match(/[^0-9:a-f]/gi)
                && ip.match(
                    /(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))/g
                );
        } else {
            isIpValid = ip.match(/^[0-9][0-9.]+[0-9]$/g)
                && ip.match(
                    /^(?:(?:0|1[0-9]{0,2}|2(?:5[0-5]?|[0-4][0-9]?)?|[3-9][0-9]?)\.){3}(?:0|1[0-9]{0,2}|2(?:5[0-5]?|[0-4][0-9]?)?|[3-9][0-9]?)$/g
                );
        }
        if (!isIpValid) {
            return this.failed(
                res,
                'Precondition Failed. Invalid IPv' + (isIpv6 ? '6' : '4') + ' Address.'
            );
        }

        let configs = Config.get('geoip');
        let geoIPCountryPath = geoIpPath + '/GeoIP-Country.mmdb';
        let geoIPCityPath = geoIpPath + '/GeoIP-City.mmdb';
        if (typeof configs === 'object') {
            geoIPCountryPath = configs['country'] || geoIPCountryPath;
            geoIPCityPath = configs['city'] || geoIPCityPath;
        }

        let isErrorCountry = false;
        let isErrorCity = false;
        let doneCountry;
        let doneCity;
        let dbExists = false;
        if (fs.existsSync(geoIPCityPath)) {
            dbExists = true;
            doneCity = await MaxMind.open(geoIPCityPath).then((lookup) => {
                return lookup.get(ip) || null;
            }).catch((e) => {
                doneCity = e || undefined;
                isErrorCity = true;
                return e || undefined;
            });
        }
        if (!doneCity || isErrorCity) {
            if (fs.existsSync(geoIPCountryPath)) {
                dbExists = true;
                doneCountry = await MaxMind.open(geoIPCountryPath).then((lookup) => {
                    return lookup.get(ip) || null;
                }).catch((e) => {
                    doneCountry = e || undefined;
                    isErrorCountry = true;
                    return doneCountry;
                });
            }
        } else if (doneCity && typeof doneCity === 'object') {
            doneCountry = {
                continent: doneCity.continent,
                country: doneCity.country
            };
        }
        if (!dbExists) {
            return this.expectation(res, 'Geo database has not ready.');
        }
        if (!doneCity || !doneCountry) {
            return this.expectation(res, `Could not get data from ${ip}`);
        }
        if (isErrorCountry) {
            return this.internal(res, doneCountry);
        }
        if (isErrorCity) {
            return this.internal(res, doneCity);
        }
        let data = {
            ip: {
                query: isFromQuery,
                address: ip
            },
            city: {
                name: null,
                subdivisions: null,
                location: {
                    latitude: null,
                    longitude: null,
                }
            },
            continent: {
                code: doneCountry.continent.code || null,
                name: doneCountry.continent.names.en || null,
            },
            country: {
                code: doneCountry.country.iso_code,
                name: doneCountry.country.names.en || null,
            },
        };
        if (doneCity && !isErrorCity) {
            data.city.name = doneCity.city.names.en || null;
            data.city.subdivisions = [];
            for (let i = doneCity.subdivisions.length - 1; i >= 0; i--) {
                data.city.subdivisions.push(doneCity.subdivisions[i].names.en);
            }
            data.city.location.latitude = doneCity.location.latitude || null;
            data.city.location.longitude = doneCity.location.longitude || null;
        }

        return this.success(res, {
            request: {
                client_ip: req.headers['x-forwarded-for'] || req.ip || null
            },
            result: data
        });
    };
}

module.exports = Ip;
