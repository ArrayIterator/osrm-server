RoutingStrategy = function(Router, Routed) {
    const serve = Express.Serve;
    this.Route = this.RoutingStrategy = RoutingStrategy;
    if (typeof Router !== "function"
        || typeof Router.params !== 'object'
        || typeof Router.stack !== 'object'
    ) {
        return RoutingStrategy;
    }

    let Route = Routed;
    let inFn = false;
    if (typeof Route === 'function') {
        inFn = true;
        Route = new Route(serve);
    }
    if (!Route instanceof Routing) {
        return RoutingStrategy;
    }

    if (!inFn) {
        Route.constructor(serve);
    }
    let pattern = Route.getPattern();
    if (typeof pattern !== 'string') {
        return RoutingStrategy;
    }

    let methods = Route.getMethods();
    if (typeof methods === 'string') {
        methods = [methods];
    }

    if (typeof methods !== 'object') {
        return RoutingStrategy;
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
        route = fn.call(
            Router,
            pattern,
            Route.__handleSucceed.bind(Route), // add binding
            Route.__handleError.bind(Route) // add binding
        );
    }
    if (typeof route === 'function') {
        Route.next(route);
    }
    return RoutingStrategy;
};

RoutingStrategy.Route
    = RoutingStrategy.RoutingStrategy
    = RoutingStrategy;

module.exports = RoutingStrategy;