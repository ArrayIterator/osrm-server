class Index extends Routing {
    getMethods() {
        return 'all';
    }
    route(req, res, next) {
        return this.notfound(
            res,
            {
                message: '404 Not Found',
                routes: {
                    '/ip': 'IP Geo Location Check'
                }
            }
        );
    }
}

module.exports = Index;
