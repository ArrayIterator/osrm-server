"use strict";
!(function (_win) {
    const VERSION = '1.0.0';
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
    /*extend leaflet - you should include the polli*/
    L.RotatedMarker = L.Marker.extend({
        options: {
            angle: 0
        },
        _setPos: function (pos) {
            L.Marker.prototype._setPos.call(this, pos);
            if (L.DomUtil.TRANSFORM) {
                // use the CSS transform rule if available
                // console.log(this.options.angle);
                this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
            } else if (L.Browser.ie) {
                // fallback for IE6, IE7, IE8
                let rad = this.options.angle * (Math.PI / 180),
                    cosTheta = Math.cos(rad),
                    sinTheta = Math.sin(rad);
                this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
                    cosTheta + ', M12=' + (-sinTheta) + ', M21=' + sinTheta + ', M22=' + cosTheta + ')';
            }
        }
    });
    L.rotatedMarker = function (pos, options) {
        return new L.RotatedMarker(pos, options);
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
                min: -10.359987,
                max: 5.479821,
            },
            lon: {
                min: 95.293026,
                max: 141.033852
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
                LogislyMap.lastId = null;
                LogislyMap.getId = function () {
                    return this.lastId || this.createId();
                };
                LogislyMap.angleFromCoordinates = (sourceLatLng, targetLatLng) => {
                    let lat1 = sourceLatLng.lat || sourceLatLng[0];
                    let lon1 = sourceLatLng.lng || sourceLatLng[1];
                    let lat2 = targetLatLng.lat || targetLatLng[0];
                    let lon2 = targetLatLng.lng || targetLatLng[1];
                    let dLon = (lon2 - lon1);
                    let y = Math.sin(dLon) * Math.cos(lat2);
                    let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1)
                        * Math.cos(lat2) * Math.cos(dLon);

                    let bearings = Math.atan2(y, x);

                    bearings = bearings * (180 / Math.PI);
                    bearings = (bearings + 360) % 360;
                    bearings = 360 - bearings; // count degrees counter-clockwise - remove to make clockwise
                    return bearings;
                },
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
                    this.lastId = el;
                    return this.lastId;
                };
                LogislyMap.init = function (fn) {
                    if (typeof this.prepare === 'function') {
                        this.prepare.call(this, this);
                    }
                    if (typeof fn === 'function') {
                        fn.call(this, this);
                    }
                    if (typeof this.always === 'function') {
                        this.always.call(this, this);
                    }
                    return this;
                };
                LogislyMap.success = null;
                LogislyMap.error = null;
                LogislyMap.always = null;
                LogislyMap.prepare = null;
                LogislyMap.onBeforeProcess = function (fn) {
                    this.prepare = fn;
                    return this;
                };
                LogislyMap.onSuccess = function (fn) {
                    this.success = fn;
                    return this;
                };
                LogislyMap.onError = function (fn) {
                    this.error = fn;
                    return this;
                };
                LogislyMap.onAlways = function (fn) {
                    this.always = fn;
                    return this;
                };
                LogislyMap.availableMapModes = LogMapProviders;
                if (this) {
                    this.prototype = LogislyMap;
                    this.success = LogislyMap.onsuccess;
                    this.onerror = LogislyMap.onerror;
                    this.prepare = LogislyMap.prepare;
                    this.lastId = LogislyMap.lastId;
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

                    return Map.tileLayer(currentMapAvailableMode[mod], args);
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
            options.preferCanvas = options.preferCanvas || true;
            // control
            options.zoomControl = options.zoomControl || true;
            options.attributionControl = options.attributionControl || false;
            // Interaction
            options.dragging = options.dragging || true;
            options.closePopupOnClick = options.closePopupOnClick || true;
            options.doubleClickZoom = options.doubleClickZoom || true;
            options.trackResize = options.trackResize || true;
            options.zoomSnap = typeof options.zoomSnap !== "undefined" ? parseInt(options.zoomSnap) : 1;
            options.zoomDelta = typeof options.zoomDelta !== "undefined" ? parseInt(options.zoomDelta) : 1;
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
            options.mode = options.mode || defaultMode;
            options.type = options.type || defaultMap;
            options.enableMapControl = options.enableMapControl || false;
            selector = options.selector || null;
            let enableMapControl = options.enableMapControl,
                domEvent = Map.DomEvent,
                element = Map.getId();
            Map.element = element;
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
            Map.type = options.type && typeof options.type === 'string' && options.type.toString().match(/(open|osm|openstreetmap)/gi)
                ? 'osm'
                : (typeof options.type === 'string' ? options.type.toString().toLowerCase() : defaultMap);
            if (typeof LogMapProviders[Map.type] === "undefined") {
                Map.type = defaultMap;
            }
            if (LogMapProviders[Map.type].mode[options.mode] === undefined) {
                options.mode = defaultMode;
            }
            let currentProvider = options.type,
                currentMode = options.mode;
            Map.mode = options.mode;
            Map.createLayer = createLayer;
            Map.fitZoom = function (...args) {
                args[0] = args[0] || this.current.getBounds();
                return this.fitBounds(...args);
            };
            Map.fitBounds = function (...args) {
                args[0] = args[0] || this.current.getBounds();
                this.current.fitBounds(...args);
                return this;
            };
            Map.fitCenter = function (...args) {
                args[0] = args[0] || this.current.getCenter();
                this.current.flyTo(...args);
                return this;
            };
            Map.setZom = function (...args) {
                this.current.setZoom(...args);
                return this;
            };
            Map.encode = function (str) {
                return this.PolylineUtil.encode(str);
            };
            Map.decode = function (str) {
                return this.PolylineUtil.decode(str);
            };

            Map.remoteJSON = (uri, options) => new Promise((resolve, reject) => {
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
                xhr.responseType = 'json';
                xhr.onload = function () {
                    if (xhr.status !== 200) {
                        reject(xhr);
                        return;
                    }
                    resolve(xhr.response);
                };
                xhr.send(options.body || null);
            });
            let hasInit = false;
            // Map.layers = layers;
            Map.init = function (fn, err) {
                if (hasInit === true) {
                    return this;
                }
                hasInit = true;
                let result;
                try {
                    this.current
                        = currentMap
                        = this.map(this.element, options);
                    this.current.logislyMap = this;
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
                        this.current.zoomControl.setPosition('topright');
                    }
                    if (options.enableScale !== false) {
                        this.control.scale().addTo(this.current);
                    }
                    if (enableMapControl) {
                        this
                            .control
                            .layers(layers, null, {sortLayers: false, collapsed: true, position: 'topright'})
                            .addTo(this.current);
                    }
                    if (selection) {
                        selection.addTo(this.current);
                    }
                    let preparation;
                    if (this.prepare && typeof this.prepare === "function") {
                        preparation = this.prepare.call(this, Map.current, this);
                    }
                    let callDirect = () => {
                        this.current = proceedMap(Map.current);
                        if (typeof this.success === 'function') {
                            result = this.current;
                            this.success.call(this, Map.current, this);
                        }

                        if (typeof fn === 'function') {
                            fn.call(this, null, Map.current, this);
                        }
                    };
                    if (preparation && preparation instanceof Promise) {
                        preparation.catch((e) => {
                            throw e;
                        }).finally((e) => {
                            callDirect();
                            window.dispatchEvent(new Event('resize'));
                        });
                    } else {
                        callDirect();
                    }
                } catch (e) {
                    console.log(e);
                    if (!Map.current) {
                        this.current = undefined;
                    }
                    result = e;
                    if (typeof err === 'function') {
                        err.call(this, result);
                    } else if (fn === 'function') {
                        fn.call(this, e, this.current, this);
                    }
                    if (typeof Map.error === 'function') {
                        this.error.call(this, e, this);
                    }
                }
                if (typeof this.always === 'function') {
                    this.always.call(this, result, this);
                }
                return Map;
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
                        + ' <span class="leaflet-logisly-map-layer-mode">' + UcWords(a) + '</span>'
                        + '</span>';
                    let ly = createLayer(a, k, {id: (k + ':' + a)});
                    if (k === currentProvider && currentMode === a) {
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
            Map.layers = layers;
            return Map;
        };

    _win.LogislyObjectMap = LogislyObjectMap;
    _win.LogislyMap = Object.freeze(LogislyMap);
})(window);
