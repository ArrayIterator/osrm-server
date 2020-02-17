"use strict";
!(function (_win) {
    let _css = ['/css/map.package.css'];
    (function (_) {
        let sc,
            currentSrc = document.currentScript.src;
        window.__process_dir = currentSrc.split('/').slice(0, -2).join('/');
        // let _css = ['/css/leaflet.css', '/css/leaflet-routing-machine.css'];
        let wDir = __process_dir.replace(/^https?:/gi, '');
        let exists;
        let css_;
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
                _.document.head.appendChild(sc);
            }
        }
    })(_win);

    if (typeof _win.logislyObjectMap !== 'undefined') {
        console.log(
            'logislyObjectMap has been loaded before.'
            + ' If you feel this not true. Please check your javascript'
        )
        return;
    }

    /*
    h = roads only
    m = standard roadmap
    p = terrain
    r = somehow altered roadmap
    s = satellite only
    t = terrain only
    y = hybrid
     */
    const logMapModes = {
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
    };
    const IndonesiaLocation = {
        lat: {
            min: -10.359987,
            max: 5.479821,
        },
        lon: {
            min: 95.293026,
            max: 141.033852
        }
    };
    const prefixId = '_map-';
    const additionBounds = 0.5;
    const defaultMap = 'google';
    const defaultMode = 'standard';
    const fallbackDefault = logMapModes.google.standard;
    const logislyObjectMap = (function () {
        let __ = function logislyMap() {
            let o = __;
            o.prototype = o;
            o.prototype.constructor = o;
            o.d3 = d3;
            o.d3 = o.d3;
            o.leaflet = L;
            o.defaultMap = defaultMap;
            o.defaultMode = defaultMode;
            for (let i in __.leaflet) {
                if (!o.leaflet.hasOwnProperty(i)) {
                    continue;
                }
                o[i] = o.leaflet[i];
            }
            o.defaultBounds = new o.leaflet.LatLngBounds(
                new o.leaflet.LatLng(IndonesiaLocation.lat.min - additionBounds, IndonesiaLocation.lon.min - additionBounds),
                new o.leaflet.LatLng(IndonesiaLocation.lat.max + additionBounds, IndonesiaLocation.lon.max + additionBounds)
            );
            o.createId = function () {
                let id = prefixId + this.uuid();
                let el = document.createElement('div');
                el.setAttribute('data-map-id', id);
                el.setAttribute('class', 'leaflet-logisly-map');
                this.lastId = el;
                return this.lastId;
            };
            o.lastId = null;
            o.getId = function () {
                return this.lastId || this.createId();
            };
            o.uuid = function uuid() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
            o.init = function (fn) {
                if (typeof fn === 'function') {
                    fn.call(this, this);
                }
                if (typeof this.finally === 'function') {
                    this.finally.call(this, this);
                }
                return this;
            };
            o.success = null;
            o.error = null;
            o.always = null;
            o.onSuccess = function (fn) {
                this.success = fn;
                return this;
            };
            o.onError = function (fn) {
                this.error = fn;
                return this;
            };
            o.onAlways = function (fn) {
                this.always = fn;
                return this;
            };
            o.availableMapModes = logMapModes;
            if (this) {
                this.prototype = o;
                this.success = o.onsuccess;
                this.onerror = o.onerror;
                this.lastId = o.lastId;
            }
            // return _;
        };
        __.prototype.constructor = new __;
        return Object.seal(__);
    })(_win);
    const logislyMap = function (options, opt) {
        let _map = new logislyObjectMap;
        let bounds = _map.defaultBounds;
        if (typeof options === 'string'
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
        if (typeof options !== 'object') {
            options = {};
        }

        // Options
        options.preferCanvas = typeof options.preferCanvas !== "undefined" ? !!(options.preferCanvas) : true;
        // controle
        options.zoomControl = typeof options.zoomControl !== "undefined" ? !!(options.zoomControl) : true;
        options.attributionControl = typeof options.attributionControl !== "undefined" ? !!(options.attributionControl) : false;
        // Interaction
        options.dragging = typeof options.dragging !== "undefined"
            ? !!(options.dragging)
            : true;
        options.closePopupOnClick = typeof options.closePopupOnClick !== "undefined" ? !!(options.closePopupOnClick) : true;
        options.zoomSnap = typeof options.zoomSnap !== "undefined" ? parseInt(options.zoomSnap) : 1;
        options.zoomDelta = typeof options.zoomDelta !== "undefined" ? parseInt(options.zoomDelta) : 1;
        options.doubleClickZoom = options.doubleClickZoom || true;
        options.trackResize = options.trackResize || true;
        // map
        options.center = options.center || bounds.getCenter();
        options.maxBounds = options.maxBounds || bounds;
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
        let selector = options.selector || null;

        // custom
        // options.handleResize = options.handleResize || true;
        options.mode = options.mode || defaultMode;
        options.type = options.type || defaultMap;
        options.enableMapControl = options.enableMapControl || false;
        let enableMapControl = options.enableMapControl;
        let element = _map.getId();
        _map.element = element;
        let domEvent = _map.DomEvent;
        domEvent.on(window, 'resize', (ev) => {
            //if (options.handleResize) {
            element.style.position = 'relative';
            element.style.height = window.innerHeight + 'px';
            element.style.width = window.innerWidth + 'px';
            element.style['max-width'] = '100%';
            element.style['max-height'] = '100%';
            domEvent.stopPropagation(ev);
            //}
        });
        _map.type = typeof options.type === 'string'
        && options.type.toString().match(/(open|osm|openstreetmap)/gi)
            ? 'osm'
            : (typeof options.type === 'string' ? options.type.toString().toLowerCase() : defaultMap);
        if (!logMapModes[_map.type]) {
            _map.type = defaultMap;
        }
        if (!logMapModes[_map.type].mode[options.mode]) {
            options.mode = defaultMode;
        }
        let createLayer = (mod, provider, args) => {
            if (typeof args !== 'object') {
                args = {};
            }
            if (!logMapModes[provider]) {
                return;
            }
            let currentMapProvider = logMapModes[provider];
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

            return _map.tileLayer(currentMapAvailableMode[mod], args);
        }

        let currentProvider = options.type;
        let currentMode = options.mode;
        let selection;
        let MapCurrent;
        let layers = {};
        let ucwords = function(str) {
            return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
                function(s){
                    return s.toUpperCase();
                });
        };
        let disablingMap = [];
        let disablingMode = [];
        let disablingMapMode = {};
        for (let i in options) {
            if (!options.hasOwnProperty(i)) {
                continue;
            }
            if (!i.toString().match(/^disable\_?/gi)) {
                continue;
            }
            let match = /^disable\_?map\_?(.+)$/gi.exec(i);
            if (match && match[1]) {
                disablingMap.push(match[1].toLowerCase());
            }
            match = /^disable\_?mode\_?(.+)$/gi.exec(i);
            if (match && match[1]) {
                disablingMode.push(match[1].toLowerCase());
            }
            match = /^disable\_?([a-z]{2,}\_?)mode\_?(.+)$/gi.exec(i);
            if (match && match[1] && match[2]) {
                disablingMapMode[match[1].toLowerCase()] = match[2].toLowerCase();
            }
        }
        for (let i in logMapModes) {
            if (!logMapModes.hasOwnProperty(i)) {
                continue;
            }
            for (let a in logMapModes[i].mode) {
                if (!logMapModes[i].mode.hasOwnProperty(a)) {
                    continue;
                }
                let name = '<span class="leaflet-logisly-map-layer-selector">'
                    + '<span class="leaflet-logisly-map-layer-provider">' + ucwords(logMapModes[i].name) + '</span>'
                    + ' <span class="leaflet-logisly-map-layer-mode">' + ucwords(a) + '</span>'
                    + '</span>';
                let ly = createLayer(a, i);
                if (i === currentProvider && currentMode === a) {
                    selection = ly;
                }
                if (disablingMap.indexOf(i) > -1) {
                    continue;
                }
                if (disablingMode.indexOf(a) > -1) {
                    continue;
                }
                if (disablingMapMode[i] && disablingMapMode[i] === a) {
                    continue;
                }
                layers[name] = ly;
            }
        }

        _map.layers = layers;
        let proceed = function (map) {
            if (!map._container || typeof map._container.getAttribute !== 'function') {
                return;
            }
            let id = map._container.getAttribute('data-map-id');
            let ids;
            if (id) {
                ids = document.querySelector('[data-map-id=' + id + ']');
            } else {
                id = null;
            }

            let __selector = selector;
            if (typeof selector === 'string') {
                if (selector.match(/^\#/g) || selector.match(/^[a-z0-9_-]+$/gi)) {
                    __selector = document.getElementById(selector.replace(/^\#/g, ''));
                } else if (selector.match(/^\./g)) {
                    __selector = document.getElementsByClassName(selector.replace(/^\./g, ''));
                }
            }
            let _ob = Object.prototype.toString.call(__selector);
            if (_ob.match(/^\[object\s+HTML.*lement]/gi)) {
                if (id) {
                    let id_ = __selector.querySelector('#' + id);
                    if (id_) {
                        id_.replaceWith(map._container);
                    } else {
                        __selector.append(map._container);
                    }
                } else {
                    __selector.append(map._container);
                }
            } else if (_ob.match(/^\[object\s+(NodeList|HTMLCollection)]/gi)) {
                let id_ = __selector.querySelector('#' + id);
                for (let i = 0; __selector.length > i; i++) {
                    let id_ = __selector[i].querySelector('#' + id);
                    if (id_) {
                        id_.replaceWith(map._container);
                    } else {
                        __selector[i].append(map._container);
                    }
                }
            } else if (ids) {
                ids.append(map._container);
            }
            return map;
        };
        _map.mode = options.mode;
        // _map.layers = layers;
        _map.init = function (fn, err) {
            let result;
            try {
                MapCurrent = _map.current = _map.map(_map.element, options);
                MapCurrent.on({
                    'layeradd': () => {
                        window.dispatchEvent(new Event('resize'));
                    },
                    'layerremove': () => {
                        window.dispatchEvent(new Event('resize'));
                    }
                })
                //add zoom control with your options
                if (options.zoomControl) {
                    MapCurrent.zoomControl.setPosition('topright');
                }
                if (enableMapControl) {
                    _map
                        .control
                        .layers(layers, null, {sortLayers: false, collapsed: true, position: 'topright'})
                        .addTo(MapCurrent);
                }
                if (selection) {
                    selection.addTo(MapCurrent);
                }
                MapCurrent = _map.current = proceed(_map.current);
                if (typeof _map.success === 'function') {
                    result = _map.current;
                    _map.success.call(_map, _map.current, _map);
                }

                if (typeof fn === 'function') {
                    fn.call(_map, null, _map.current, _map);
                }
            } catch
                (e) {
                console.log(e);
                if (!_map.current) {
                    _map.current = undefined;
                }
                result = e;
                if (typeof err === 'function') {
                    err.call(_map, result);
                } else if (fn === 'function') {
                    fn.call(_map, e, _map.current, _map);
                }
                if (typeof _map.error === 'function') {
                    _map.error.call(_map, e, _map);
                }
            }
            if (typeof _map.finally === 'function') {
                _map.finally.call(_map, result, _map);
            }
            return _map;
        };
        return _map;
    };

    _win.logislyObjectMap = logislyObjectMap;
    _win.logislyMap = Object.freeze(logislyMap);
})(window);
