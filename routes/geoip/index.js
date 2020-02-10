module.exports = async (req, res) => {
	const maxmind = require('maxmind');
	const geoIpPath = rootPath + '/storage/geoip';
	const {notfound, internal, precondition, ok, expectation} = express.serve;
	const isCompressed = !(!req.query.compress || !req.query.compress.toString().replace(/\s*/, '').match(/^(true|1|yes)$/gi));
	let query = req.query;
	let ip = query.ip || req.headers['x-forwarded-for'] || req.ip;
	if (!ip || typeof ip !== 'string') {
		return precondition(res, 'Precondition Failed. Invalid IP Address.');
	}
	let isFromQuery = typeof query.ip === 'string' && query.ip.trim() !== '';
	ip = ip.trim() === '' ? req.ip : ip;
	let isIpv6    = false;
	let isIpValid = false;
	isIpv6 = ip.match(/[:]/g);
	if (isIpv6) {
		isIpValid = !ip.match(/[^0-9\:a-f]/gi)
			&& ip.match(
					/(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/g
				);
	} else {
		isIpValid = ip.match(/^[0-9][0-9\.]+[0-9]$/g)
			&& ip.match(
				/^(?:(?:0|1[0-9]{0,2}|2(?:5[0-5]?|[0-4][0-9]?)?|[3-9][0-9]?)\.){3}(?:0|1[0-9]{0,2}|2(?:5[0-5]?|[0-4][0-9]?)?|[3-9][0-9]?)$/g
			);
	}
	if (!isIpValid) {
		return precondition(
			res, 'Precondition Failed. Invalid IPv'+(isIpv6 ? '6' : '4')+' Address.'
		);
	}
	let configs = config.get('geoip');
	let geoIPCountryPath = geoIpPath + geoIpPath + '/GeoIP-Country.mmdb';
	let geoIPCityPath = geoIpPath + geoIpPath + '/GeoIP-City.mmdb';
	if (typeof configs === 'object') {
		geoIPCountryPath = configs['country'] || geoIPCountryPath;
		geoIPCityPath = configs['city'] || geoIPCityPath;
	}
	let isErrorCountry = false;
	let isErrorCity = false;
	let doneCountry;
	let doneCity = await maxmind.open(geoIPCityPath).then((lookup) => {
		return lookup.get(ip) || null;
	}).catch((e) => {
		doneCity = e || undefined;
		isErrorCity = true;
		return e || undefined;
	});
	if (! doneCity || isErrorCity) {
		doneCountry = await maxmind.open(geoIPCountryPath).then((lookup) => {
			return lookup.get(ip) || null;
		}).catch((e) => {
			doneCountry = e || undefined;
			isErrorCountry = true;
			return doneCountry;
		});
	} else {
		doneCountry = {
			continent: doneCity.continent,
			country: doneCity.country
		};
	}

	if (!doneCity || ! doneCountry) {
		return expectation(res, `Could not get data from ${ip}`);
	}
	if (isErrorCountry) {
		return internal(res, doneCountry);
	}
	if (isErrorCity) {
		return internal(res, doneCity);
	}
	var data = {
		ip: {
			query: isFromQuery,
			address : ip
		},
		city : {
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
		data.city.name =  doneCity.city.names.en || null;
		data.city.subdivisions = [];
		for (var i = doneCity.subdivisions.length - 1; i >= 0; i--) {
			data.city.subdivisions.push(doneCity.subdivisions[i].names.en);
		}
		data.city.location.latitude = doneCity.location.latitude || null;
		data.city.location.longitude = doneCity.location.longitude || null;
	}

	return ok(res, {
		request: {
			client_ip: req.headers['x-forwarded-for'] || req.ip || null
		},
		result: data
	});
};
