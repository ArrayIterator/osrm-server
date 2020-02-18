(function (_) {
    // custom zoom bar control that includes a Zoom Home function
    let config = {
        selector: 'map',
        type: 'google', // default provider
        mode: 'standard', // default provider
        // disable ESRI Map
        disableMapEsri: true,
        enableScale: false,
        // disable Google Terrain
        disableGoogleModeTerrain: true,
        // disable all mode satellite
        disableModeSatellite: true,
        // enable map control
        enableMapControl: true,
        preferCanvas: true,
        fitSelectedRoutes: false
    };
    let host = location.protocol + '//' + location.host,
        url = host + '/osrm/route/?coordinates=112.7227133,-7.9963867|113.6548642,-7.9963867&geometry=poly&overview=full&compress=1',
        map,
        icon = host + '/assets/images/truck.png',
        // determine to markers group layer to remove later
        MarkersGroup,
        startStopControl,
        looping,
        temporaryStop = true,
        lMap = new LogislyMap(config);
    /*!
     * ------------------------------------------------------
     * Map Control Button To Add Play Pause
     * ------------------------------------------------------
     */
    lMap.Control.startStop = lMap.Control.extend({
        options: {
            position: 'topleft',
            startTitle: '<span class="mif-play" title="Start Direction"></span>',
            startWithoutZoomTitle: '<span class="mif-play" title="Start Direction Without Zoom"></span>',
            stopWithoutZoomTitle: '<span class="mif-pause" title="Pause Direction Without Zoom"></span>',
            stopTitle: '<span class="mif-pause" title="Pause Direction"></span>',
            resetZoomTitle: '<span class="mif-spinner5" title="Reset Zoom"></span>',
        },
        onAdd: function (map) {
            map.startStop = this;
            let controlName = 'gin-control-zoom',
                container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                options = this.options;
            this._resetZoomButton = this
                ._createButton(
                    options.resetZoomTitle,
                    controlName + '-play', container,
                    this.resetZoomFn
                );
            this._startTitleButton = this
                ._createButton(
                    options.startTitle,
                    controlName + '-play', container,
                    this.playStop
                );
            return container;
        },
        playStop: function () {
            if (typeof looping !== "function") {
                return;
            }
            let options = this.options;
            if (temporaryStop === true) {
                this._startTitleButton.innerHTML = options.stopTitle;
                temporaryStop = false;
                looping();
                return;
            }

            this._startTitleButton.innerHTML = options.startTitle;
            temporaryStop = true;
        },
        resetZoomFn: function () {
            if (temporaryStop === true) {
                map.flyToBounds(MarkersGroup, {animate: true});
            }
        },
        onRemove: function (map) {
        },
        _createButton: function (html, className, container, fn) {
            let link = L.DomUtil.create('a', className, container);
            link.innerHTML = html;
            link.href = '#';
            L.DomEvent
                .on(link, 'click', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', () => {
                    fn.call(this, link);
                });

            return link;
        }
    });
    let processor = (res) => {
        // if in invalid clause
        if (!map
            || !lMap
            || !res.data.result.routes[0]
        ) {
            return;
        }
        let zoomedMarkerGroup = lMap.featureGroup();
        /*!
         * ------------------------------------------------------
         * add Markers Group To Layer
         * ------------------------------------------------------
         */
        map.addLayer(MarkersGroup);
        map.addLayer(zoomedMarkerGroup);

        /*!
         * ------------------------------------------------------
         * Decode Polyline
         * ------------------------------------------------------
         */
        let PolyLineDecoded = lMap.decode(res.data.result.routes[0].geometry);
        res = null;
        if (typeof PolyLineDecoded !== 'object') {
            return;
        }
        // for implement icon see: https://github.com/Leaflet/Leaflet.Icon.Glyph
        // and for icon see : https://metroui.org.ua/v3/font.html
        let polyline = lMap.polyline(PolyLineDecoded).addTo(map);
        let last = polyline.getLatLngs().length - 1;
        /*!
         * ------------------------------------------------------
         * add last marker
         * ------------------------------------------------------
         */
        let pos = polyline.getLatLngs()[last];
        lMap
            .marker(pos, {
                icon: L.icon.glyph({
                    prefix: 'mif',
                    glyph: 'my-location'
                })
            })
            .bindPopup("Destination Point" + JSON.stringify(pos))
            .addTo(MarkersGroup);

        pos = polyline.getLatLngs()[0];
        /*!
         * ------------------------------------------------------
         * add first marker
         * ------------------------------------------------------
         */
        lMap
            .marker(pos, {
                icon: L.icon.glyph({
                    prefix: 'mif',
                    glyph: 'location-city'
                })
            })
            .bindPopup("Starting Point" + JSON.stringify(pos))
            .addTo(MarkersGroup);

        /*!
         * ------------------------------------------------------
         * fit bound first fly it
         * ------------------------------------------------------------
         */
        map.flyToBounds(MarkersGroup, {animate: true});
        /*!
         * ------------------------------------------------------
         * Add Points each on
         * ------------------------------------------------------------
         */
        let count = 0;
        let lastMarker = lMap
            .marker(pos, {
                icon: L.icon.glyph({
                    prefix: 'mdi',
                    iconUrl: icon,
                    iconSize: [32, 32],
                    rotationAngle: lMap.angleFromCoordinates(pos, pos),
                })
            })
            .bindPopup('I\'m Moving');
        zoomedMarkerGroup.addLayer(lastMarker);
        let hasStarted = false;
        looping = () => {
            if (count === 0) {
                lastMarker.addTo(MarkersGroup);
            }
            if (temporaryStop === true) {
                return;
            }
            temporaryStop = false;
            if (count + 1 >= last || !polyline.getLatLngs()[count + 1]) {
                if (lastMarker) {
                    MarkersGroup.removeLayer(lastMarker);
                    count = 0;
                }
                hasStarted = false;
                temporaryStop = true;
                if (map.startStop) {
                    temporaryStop = false;
                    map.startStop.playStop();
                }
                console.log('DONE .....!');
                return;
            }
            count++;
            if ((count % 2) !== 0) {
                looping();
                return;
            }
            let lastPos = pos;
            pos = polyline.getLatLngs()[count];
            lastMarker
                .setLatLng(pos)
                .setRotationAngle(lMap.angleFromCoordinates(lastPos, pos));
            map.flyToBounds(zoomedMarkerGroup.getBounds(), {animate: !hasStarted});
            hasStarted = true;
            setTimeout(looping, 1000);
        };
    };
    let Log = new LogislyMap(config)
        //! SUCCEED
        .onSuccess((m, LM) => {
            // override variable
            lMap = LM;
            map = m;
            MarkersGroup = LM.featureGroup();
            // add Map Control
            startStopControl = new lMap.Control.startStop().addTo(map);
            // call remote
            return lMap.remoteJSON(url).then(processor).catch((e) => {
                console.log(e);
            });
        })
        //! ERROR
        .onError((e) => {
            console.log(e);
        }).init();
})(window);
