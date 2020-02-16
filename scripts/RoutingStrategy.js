RoutingStrategy = function (Prefix, Router, Routed) {
    const serve = Express.Serve;
    if (typeof Prefix !== 'string') {
        return;
    }
    if (Prefix.trim() === '' || Prefix[0] !== '/') {
        Prefix = '/' + Prefix.trim();
    }

    this.Route = this.RoutingStrategy = RoutingStrategy;
    if (typeof Router !== "function"
        || typeof Router.params !== 'object'
        || typeof Router.stack !== 'object'
    ) {
        return;
    }

    let Route = Routed;
    let inFn = false;
    if (typeof Route === 'function') {
        inFn = true;
        Route = new Route(serve);
    }
    if (!Route || !Route instanceof Routing) {
        return;
    }

    if (!inFn || !Route.serve) {
        Route.serve = serve;
    }

    let pattern = Route.getPattern();
    if (Object.prototype.toString.call(pattern) !== '[object String]'
        && Object.prototype.toString.call(pattern) !== '[object RegExp]'
    ) {
        return;
    }

    let methods = Route.getMethods();
    if (typeof methods === 'string') {
        methods = [methods];
    }

    if (typeof methods !== 'object') {
        return;
    }

    let availableMethods = [];
    for (let method in methods) {
        if (!methods.hasOwnProperty(method)
            || typeof methods[method] !== 'string'
        ) {
            continue;
        }
        let m = methods[method].toLowerCase();
        if (m.match(/[^a-z\-]/)) {
            continue;
        }
        availableMethods[m] = m;
    }

    Route.availableMethods = availableMethods;
    let route;
    let path;
    if (typeof pattern === 'string') {
        path = pattern.replace(/[\/]+/g, '/');
    } else {
        path = pattern;
    }

    for (let method in availableMethods) {
        if (!availableMethods.hasOwnProperty(method)
            || typeof availableMethods[method] !== 'string'
        ) {
            continue;
        }

        let m = availableMethods[method];
        let fn;
        fn = Router[m] || null;
        if (typeof fn !== 'function') {
            continue;
        }

        route = Router.group(Prefix, (Router) => fn.call(
            Router,
            path,
            Route.__handleSucceed.bind(Route), // add binding
            Route.__handleError.bind(Route) // add binding
        ));
        if (typeof route === 'function') {
            Router.group(Prefix, (Router) => Route.next(Router, route));
        }
    }

    return Route;
};

RoutingStrategy.Route
    = RoutingStrategy.RoutingStrategy
    = RoutingStrategy;

module.exports = RoutingStrategy;