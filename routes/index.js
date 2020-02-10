module.exports = (router) => {
	let errorHandler = (err, req, res, next) => {
		const {internal} = express.serve;
		return internal(res, err);
	};
	router.all('/', require('./main'), errorHandler);
	router.get('/routes?', require('./route'), errorHandler);
	router.get('/geoip', require('./geoip'), errorHandler);
}
