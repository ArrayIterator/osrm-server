module.exports = (req, res) => {
	const {notfound} = express.serve;
	return notfound(
		res
	);
}
