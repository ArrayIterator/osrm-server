const Poly = require('@mapbox/polyline');
class PolylineDecode extends Routing
{
    getPattern() {
        return '/decode/?'
    }

    getMethods() {
        return ['POST', 'GET'];
    }

    route(req, res, next) {
        let polyline = req.body.data;
        if (typeof polyline !== 'string') {
            polyline = req.query.data;
        }

        if (typeof polyline !== 'string') {
            return this.failed(
                res,
                '412 Precondition Failed. Parameter data must be as a string and not empty.'
            );
        }
        try {
            let data = Poly.decode(polyline);
            return this.success(
                res,
                data
                // {
                //     request: {
                //         data: polyline,
                //     },
                //     result: data,
                // }
            )
        } catch (e) {
            return this.error(res, e);
        }
    }
    next(Router) {
        // pas
    }
}

module.exports = PolylineDecode;
