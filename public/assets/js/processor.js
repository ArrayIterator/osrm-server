"use strict";

!(function (_win) {
    const VERSION = '1.0.1';
    let
        exists, sc, css_,
        currentSrc = document.currentScript.src,
        _css = ['/css/map.package.css'],
        __process_dir = currentSrc.split('/').slice(0, -2).join('/'),
        wDir = __process_dir.replace(/^https?:/gi, '');
    let ret = _win.document.head;
    for (let i = 0; _css.length > i; i++) {
        exists = false;
        css_ = wDir + _css[i];
        for (let c = 0; document.styleSheets.length > c; c++) {
            let currentCss = document.styleSheets[c].toString().replace(/^https?:/gi, '');
            exists = css_ === currentCss;
        }
        if (!exists) {
            sc = document.createElement('link');
            sc.rel = 'stylesheet';
            sc.href = css_;
            if (ret.getElementsByTagName('title').length) {
                ret.prepend(ret.getElementsByTagName('title')[0], sc);
                continue;
            }
            ret.prepend(sc);
        }
    }
    if (typeof _win.LogislyObjectMap !== 'undefined') {
        console.log(
            'LogislyObjectMap has been loaded before.'
            + ' If you feel this not true. Please check your javascript'
        );
        return;
    }
    /*! BEARING */
    L.LatLng.prototype.bearingTo = function (LatLng) {
        let d2r = Math.PI / 180;
        let r2d = 180 / Math.PI;
        let lat1 = this.lat * d2r;
        let lat2 = LatLng.lat * d2r;
        let dLon = (LatLng.lng - this.lng) * d2r;
        let y = Math.sin(dLon) * Math.cos(lat2);
        let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        return (parseInt((Math.atan2(y, x) * r2d)) + 360) % 360;
    };

    L.windowLoad = (fn) => {
        if (typeof fn !== "function") {
            return;
        }
        _win.addEventListener('load', function (event) {
            fn.call(L, L, event, this)
        });
    };

    L.LogislyMap = (...args) => {
        return new LogislyMap(...args);
    };
    const
        prefixId = '_map-',
        additionBounds = 0.5,
        defaultMap = 'google',
        defaultMode = 'standard',
        LogMapProviders = {
            google: {
                name: 'Google Map',
                subdomains: ['', 1, 2, 3],
                mode: {
                    standard: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                    road: 'https://mt{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
                    roadmap: 'https://mt{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
                    hybrid: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                    satellite: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                    terrain: 'https://mt{s}.google.com/vt/lyrs=t&x={x}&y={y}&z={z}',
                }
            },
            osm: {
                name: 'Open Street Map',
                mode: {
                    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    road: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                    hybrid: 'https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
                }
            },
            esri: {
                name: 'Esri',
                mode: {
                    //worldstreetmap: 'https://server.arcgisonline.com/ArcGIS/rest/services/WorldStreetMap/MapServer/tile/{z}/{y}/{x}',
                    //delorme: 'https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}',
                    // hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
                    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
                }
            },
            openmapsurfer: {
                name: 'Open Map Surfer',
                mode: {
                    // hybrid: 'https://maps.heigit.org/openmapsurfer/tiles/hybrid/webmercator/{z}/{x}/{y}.png',
                    road: 'https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png',
                }
            },
            wikimedia: {
                name: 'Wikimedia',
                mode: {
                    standard: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png'
                }
            }
        },
        IndonesiaLocation = {
            lat: {
                min: -11.04,
                max: 5.98,
            },
            lon: {
                min: 94.9,
                max: 141.1
            }
        },
        LogislyObjectMap = (function logislyObjectMap() {
            function LogislyMap() {
                LogislyMap.prototype = LogislyMap;
                LogislyMap.prototype.constructor = LogislyMap;
                LogislyMap.leaflet = L;
                LogislyMap.VERSION = VERSION;
                LogislyMap.defaultMap = defaultMap;
                LogislyMap.defaultMode = defaultMode;
                LogislyMap.defaultBounds = new LogislyMap.leaflet.LatLngBounds(
                    new LogislyMap.leaflet.LatLng(IndonesiaLocation.lat.min - additionBounds, IndonesiaLocation.lon.min - additionBounds),
                    new LogislyMap.leaflet.LatLng(IndonesiaLocation.lat.max + additionBounds, IndonesiaLocation.lon.max + additionBounds)
                );
                LogislyMap._type = defaultMap;
                LogislyMap._mode = defaultMode;
                LogislyMap._lastId = null;
                LogislyMap.getId = function () {
                    return this._lastId || this.createId();
                };
                LogislyMap.uuid = function uuid() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                };
                LogislyMap.createId = function () {
                    let id = prefixId + this.uuid();
                    let el = document.createElement('div');
                    el.setAttribute('data-map-id', id);
                    el.setAttribute('class', 'leaflet-logisly-map');
                    this._lastId = el;
                    return this._lastId;
                };
                LogislyMap.init = function (fn) {
                    if (typeof this._prepare === 'function') {
                        this._prepare.call(this, this);
                    }
                    if (typeof fn === 'function') {
                        fn.call(this, this);
                    }
                    if (typeof this.always === 'function') {
                        this.always.call(this, this);
                    }
                    return this;
                };
                LogislyMap._success = null;
                LogislyMap._error = null;
                LogislyMap._always = null;
                LogislyMap._prepare = null;
                LogislyMap.onBeforeProcess = function (fn) {
                    this._prepare = fn;
                    return this;
                };
                LogislyMap.onSuccess = function (fn) {
                    this._success = fn;
                    return this;
                };
                LogislyMap.onError = function (fn) {
                    this._error = fn;
                    return this;
                };
                LogislyMap.onAlways = function (fn) {
                    this._always = fn;
                    return this;
                };
                LogislyMap.availableMapModes = LogMapProviders;
                if (this) {
                    this.prototype = LogislyMap;
                    this._type = LogislyMap._type;
                    this._mode = LogislyMap._mode;
                    this._success = LogislyMap._success;
                    this._error = LogislyMap._error;
                    this._prepare = LogislyMap._prepare;
                    this._lastId = LogislyMap._lastId;
                }
                for (let i in LogislyMap.leaflet) {
                    if (!LogislyMap.leaflet.hasOwnProperty(i)) {
                        continue;
                    }
                    LogislyMap[i] = LogislyMap.leaflet[i];
                }
                // return _;
            }

            LogislyMap.prototype.constructor = new LogislyMap;
            return Object.seal(LogislyMap);
        })(),
        LogislyMap = function (options, opt) {
            let Map = new LogislyObjectMap,
                bounds = Map.defaultBounds,
                selection,
                currentMap,
                selector,
                layers = {},
                disablingMap = [],
                disablingMode = [],
                disablingMapMode = {},
                UcWords = (str) => str.replace(/\b[a-z]/g, function (letter) {
                    return letter.toUpperCase();
                }),
                createTileLayer = (url, args) => {
                    args.detectRetina = args.detectRetina || true;
                    if (args.subdomains === null || typeof args.subdomains !== 'object') {
                        delete args.subdomains;
                    }
                    if (options.tileLayerCallback) {
                        try {
                            let layer = options.tileLayerCallback.call(Map, url, args, Map);
                            if (typeof layer === 'object') {
                                return layer;
                            }
                            // options.tileLayerCallback = null;
                            throw new Error('Tile Layer Callback Invalid Return Type');
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    return Map.tileLayer(url, args);
                },
                createLayer = (mod, provider, args) => {
                    if (typeof args !== 'object') {
                        args = {};
                    }
                    if (!LogMapProviders[provider]) {
                        return;
                    }
                    let currentMapProvider = LogMapProviders[provider];
                    let currentMapAvailableMode = currentMapProvider.mode;
                    if (!currentMapAvailableMode[mod]) {
                        return;
                    }
                    args.detectRetina = args.detectRetina || true;
                    if (currentMapProvider.subdomains) {
                        args.subdomains = currentMapProvider.subdomains;
                    } else if (Object.isFrozen(args)) {
                        delete args.subdomains;
                    }

                    return Map.createTileLayer(currentMapAvailableMode[mod], args);
                },
                proceedMap = function (map) {
                    if (!map._container
                        || typeof map._container.getAttribute !== 'function'
                    ) {
                        return;
                    }

                    let ids,
                        id = map._container.getAttribute('data-map-id');
                    if (id) {
                        ids = document.querySelector('[data-map-id=' + id + ']');
                    } else {
                        id = null;
                    }

                    let Selector = selector;
                    if (typeof selector === 'string') {
                        if (selector.match(/^#/g) || selector.match(/^[a-z0-9_-]+$/gi)) {
                            Selector = document.getElementById(selector.replace(/^#/g, ''));
                        } else if (selector.match(/^\./g)) {
                            Selector = document.getElementsByClassName(selector.replace(/^\./g, ''));
                        }
                    }
                    let _ob = Object.prototype.toString.call(Selector);
                    if (_ob.match(/^\[object\s+HTML.*lement]/gi)) {
                        if (id) {
                            let id_ = Selector.querySelector('#' + id);
                            if (id_) {
                                id_.replaceWith(map._container);
                            } else {
                                Selector.append(map._container);
                            }
                        } else {
                            Selector.append(map._container);
                        }
                    } else if (_ob.match(/^\[object\s+(NodeList|HTMLCollection)]/gi)) {
                        for (let i = 0; Selector.length > i; i++) {
                            let id_ = Selector[i].querySelector('#' + id);
                            if (id_) {
                                id_.replaceWith(map._container);
                            } else {
                                Selector[i].append(map._container);
                            }
                        }
                    } else if (ids) {
                        ids.append(map._container);
                    }

                    return map;
                };

            if (options
                && typeof options === 'string'
                || Object.prototype.toString.call(options).match(/^\[object\s+HTML.*lement]/gi)
            ) {
                if (typeof opt === 'object') {
                    options = opt;
                    if (typeof options.selector === "undefined") {
                        options.selector = opt;
                    }
                } else {
                    options = {
                        selector: opt
                    };
                }
            }

            if (!options || typeof options !== 'object') {
                options = {};
            }
            // Options
            options.tileLayerCallback = options.tileLayerCallback || null;
            if (typeof options.tileLayerCallback !== "function") {
                options.tileLayerCallback = null;
            }
            options.forceTile = options.forceTile || null;
            if (!options.forceTile || typeof options.forceTile !== 'object') {
                options.forceTile = null;
            }

            if (options.forceTile) {
                if (!options.forceTile.uri
                    || typeof options.forceTile.uri !== 'string'
                    || !options.forceTile.uri.match(/^https?:\/\/.+\.[a-z]+/ig)
                    || !options.forceTile.uri.match(/[xyz]/ig)
                ) {
                    options.forceTile = null;
                }
                if (options.forceTile) {
                    options.forceTile.name = options.forceTile.name || 'custom';
                    if (!options.forceTile.name || typeof options.forceTile.name !== 'string') {
                        options.forceTile.name = 'custom';
                    }
                    if (!options.forceTile.prefix || typeof options.forceTile.prefix !== 'string') {
                        options.forceTile.prefix = '';
                    }
                }
            }

            options.preferCanvas = options.preferCanvas || true;
            // control
            options.zoomControl = options.zoomControl || true;
            options.attributionControl = options.attributionControl || false;
            // Interaction
            options.dragging = options.dragging || true;
            options.closePopupOnClick = options.closePopupOnClick || true;
            options.doubleClickZoom = options.doubleClickZoom || true;
            options.trackResize = options.trackResize || true;
            options.zoomSnap = options.zoomSnap || 1;
            options.zoomDelta = options.zoomDelta || 1;
            // use default
            options.minZoom = options.minZoom || 5;
            options.maxBounds = options.maxBounds || bounds;
            options.zoom = options.zoom || 6;
            options.layers = options.layers || [];
            options.maxBoundsViscosity = options.maxBoundsViscosity || 1.0;
            // animation
            options.zoomAnimation = options.zoomAnimation || true;
            options.zoomAnimationThreshold = options.zoomAnimation || 4;
            options.fadeAnimation = options.fadeAnimation || true;
            // map
            options.center = options.center || bounds.getCenter();
            // custom
            // options.handleResize = options.handleResize || true;
            let disableList = false;
            if (!options.mode && options.forceTile) {
                disableList = true;
            }
            options.mode = options.mode || defaultMode;
            options.type = options.type || defaultMap;
            options.enableMapControl = options.enableMapControl || false;
            // MAP
            Map._type = options.type && typeof options.type === 'string'
            && options.type.toString().match(/(open|osm|openstreetmap)/gi)
                ? 'osm'
                : (typeof options.type === 'string' ? options.type.toString().toLowerCase() : defaultMap);
            if (typeof LogMapProviders[Map._type] === "undefined") {
                Map._type = defaultMap;
            }
            if (LogMapProviders[Map._type].mode[options.mode] === undefined) {
                options.mode = defaultMode;
            }
            let currentProvider = options.type,
                currentMode = options.mode;
            Map._mode = options.mode;
            selector = options.selector || null;
            let enableMapControl = options.enableMapControl && !disableList,
                domEvent = Map.DomEvent,
                element = Map.getId();
            Map._element = element;
            domEvent.on(window, 'resize', (ev) => {
                //if (options.handleResize) {
                element.style.position = 'relative';
                element.style.height = window.innerHeight + 'px';
                element.style['min-height'] = '100%';
                element.style['min-width'] = '100%';
                element.style.width = window.innerWidth + 'px';
                element.style['max-width'] = '100%';
                element.style['max-height'] = '100%';
                domEvent.stopPropagation(ev);
                //}
            });
            Map._current = null;
            Map._layers = null;
            Map.createLayer = createLayer;
            Map.createTileLayer = createTileLayer;
            Map.fitZoom = function (...args) {
                args[0] = args[0] || Map._current.getBounds();
                return Map.fitBounds(...args);
            };
            Map.fitBounds = function (...args) {
                if (args[0]
                    && typeof args[0] === 'object'
                    && typeof args[0]['_map'] === 'object'
                    && typeof args[0]['getBounds'] === 'function'
                ) {
                    args[0] = args[0].getBounds();
                }
                args[0] = args[0] || Map._current.getBounds();
                Map._current.fitBounds(...args);
                return Map;
            };
            Map.fitCenter = function (...args) {
                if (args[0]
                    && typeof args[0] === 'object'
                    && typeof args[0]['getCenter'] === 'function'
                ) {
                    args[0] = args[0].getCenter();
                }
                args[0] = args[0] || Map._current.getCenter();
                Map._current.flyTo(...args);
                return Map;
            };
            Map.zoom = function (...args) {
                Map._current.setZoom(...args);
                return Map;
            };
            Map.encode = function (str) {
                return Map.PolylineUtil.encode(str);
            };
            Map.decode = function (str) {
                return Map.PolylineUtil.decode(str);
            };
            Map.remoteJSON = (uri, options) => {
                let xhr = new XMLHttpRequest();
                if (!options || typeof options !== "object") {
                    options = {};
                }
                let method = options.method || 'GET';
                xhr.open(method, uri);
                xhr.setRequestHeader('Accept', 'application/json');
                if (options && options.headers && typeof options.headers === 'object') {
                    for (let i in options.headers) {
                        if (!options.headers.hasOwnProperty(i) || typeof i !== 'string') {
                            continue;
                        }
                        xhr.setRequestHeader(i, options.headers[i]);
                    }
                }
                if (typeof options.progress === "function") {
                    xhr.onprogress = options.progress;
                }
                if (options.error) {
                    xhr.onerror = options.error;
                }
                xhr.responseType = options.type || 'json';
                xhr.onload = function () {
                    if (xhr.status !== 200) {
                        if (typeof options.error == "function") {
                            options.error(xhr);
                        }
                        return;
                    }
                    if (typeof options.success === "function") {
                        options.success.call(xhr, xhr.response, xhr, Map);
                    }
                };
                if (typeof options.beforeSend === "function") {
                    options.beforeSend(xhr);
                } else if (typeof options.beforesend === "function") {
                    options.beforesend(xhr);
                }
                xhr.send(options.body || null);
                return xhr;
            };

            let hasInit = false;
            Map.getMap = function () {
                return this._current;
            };

            // Map.layers = layers;
            Map.init = function (fn, err) {
                let _this = this instanceof LogislyObjectMap ? this : Map;
                if (hasInit === true) {
                    return _this;
                }
                _this._current = null;
                hasInit = true;
                let result;
                try {
                    currentMap = _this.map(Map._element, options);
                    _this._current = currentMap;
                    _this._current.logislyMap = _this;
                    // console.log(currentMap.fitBounds);
                    // console.log(this.fitBounds);
                    // add nested Object
                    for (let i in _this) {
                        if (!_this.hasOwnProperty(i)) {
                            continue;
                        }
                        if (_this._current.hasOwnProperty(i) || _this._current[i]) {
                            continue;
                        }
                        _this._current[i] = _this[i];
                    }

                    for (let i in _this.prototype) {
                        if (!_this.prototype.hasOwnProperty(i)) {
                            continue;
                        }
                        if (_this._current.hasOwnProperty(i) || _this._current[i]) {
                            continue;
                        }

                        _this._current[i] = _this.prototype[i];
                    }
                    currentMap.on({
                        'layeradd': () => {
                            window.dispatchEvent(new Event('resize'));
                        },
                        'layerremove': () => {
                            window.dispatchEvent(new Event('resize'));
                        }
                    });
                    //add zoom control with your options
                    if (options.zoomControl) {
                        _this._current.zoomControl.setPosition('topright');
                    }
                    if (options.enableScale !== false) {
                        _this.control.scale().addTo(_this._current);
                    }
                    if (enableMapControl) {
                        _this
                            .control
                            .layers(layers, null, {sortLayers: false, collapsed: true, position: 'topright'})
                            .addTo(_this._current);
                    }
                    if (selection) {
                        selection.addTo(_this._current);
                    }
                    let preparation;
                    if (typeof _this._prepare === "function") {
                        preparation = _this._prepare.call(_this, _this._current, _this);
                    }
                    let callDirect = () => {
                        _this._current = proceedMap(Map._current);
                        if (typeof _this._success === 'function') {
                            result = _this._current;
                            _this._success.call(_this, result, _this);
                        }
                        if (typeof fn === 'function') {
                            fn.call(_this, null, _this._current, _this);
                        }
                    };
                    if (preparation && preparation instanceof Promise) {
                        preparation.catch((e) => {
                            throw e;
                        }).finally(() => {
                            callDirect();
                            window.dispatchEvent(new Event('resize'));
                        });
                    } else {
                        callDirect();
                    }
                } catch (e) {
                    if (!_this._current) {
                        _this._current = undefined;
                    }
                    result = e;
                    if (typeof err === 'function') {
                        err.call(_this, result);
                    } else if (fn === 'function') {
                        fn.call(_this, e, _this._current, _this);
                    }
                    // console.log(Map);
                    if (typeof _this._error === 'function') {
                        _this._error.call(_this, e, _this);
                    }
                }
                if (typeof _this._always === 'function') {
                    _this._always.call(_this, result, _this);
                }
                return _this;
            };
            for (let i in options) {
                if (!options.hasOwnProperty(i)) {
                    continue;
                }
                if (!i.toString().match(/^disable_?/gi)) {
                    continue;
                }
                let match = /^disable_?map_?(.+)$/gi.exec(i);
                if (match && match[1]) {
                    disablingMap.push(match[1].toLowerCase());
                }
                match = /^disable_?mode_?(.+)$/gi.exec(i);
                if (match && match[1]) {
                    disablingMode.push(match[1].toLowerCase());
                }
                match = /^disable_?([a-z]{2,}_?)mode_?(.+)$/gi.exec(i);
                if (match && match[1] && match[2]) {
                    disablingMapMode[match[1].toLowerCase()] = match[2].toLowerCase();
                }
            }

            selection = null;
            if (options.forceTile) {
                try {
                    let name = '<span class="leaflet-logisly-map-layer-selector">'
                        + '<span class="leaflet-logisly-map-layer-provider">' + UcWords(options.forceTile.prefix) + '</span>'
                        + ' <span class="leaflet-logisly-map-layer-_mode">' + UcWords(options.forceTile.name) + '</span>'
                        + '</span>';
                    selection = createTileLayer(options.forceTile.uri, options.forceTile);
                    layers[name] = selection;
                } catch (e) {
                    selection = null;
                }
            }
            if (!disableList && enableMapControl) {
                for (let k in LogMapProviders) {
                    if (!LogMapProviders.hasOwnProperty(k)) {
                        continue;
                    }
                    for (let a in LogMapProviders[k].mode) {
                        if (!LogMapProviders[k].mode.hasOwnProperty(a)) {
                            continue;
                        }
                        let name = '<span class="leaflet-logisly-map-layer-selector">'
                            + '<span class="leaflet-logisly-map-layer-provider">' + UcWords(LogMapProviders[k].name) + '</span>'
                            + ' <span class="leaflet-logisly-map-layer-_mode">' + UcWords(a) + '</span>'
                            + '</span>';
                        let ly = createLayer(a, k, {id: (k + ':' + a)});
                        if (selection === null && k === currentProvider && currentMode === a) {
                            selection = ly;
                        }
                        if (disablingMap.indexOf(k) > -1) {
                            continue;
                        }
                        if (disablingMode.indexOf(a) > -1) {
                            continue;
                        }
                        if (disablingMapMode[k] && disablingMapMode[k] === a) {
                            continue;
                        }
                        layers[name] = ly;
                    }
                }
            }
            // console.log(layers);
            Map._layers = layers;
            return Map;
        };

    _win.LogislyObjectMap = LogislyObjectMap;
    _win.LogislyMap = Object.freeze(LogislyMap);
})(window);
