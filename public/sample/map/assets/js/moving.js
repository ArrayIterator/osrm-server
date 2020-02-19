(function (_) {
    // custom zoom bar control that includes a Zoom Home function
    let host = location.protocol + '//' + location.host,
        url = host + '/osrm/route/?coordinates=112.7227133,-7.9963867|113.6548642,-7.9963867&geometry=poly&overview=full&compress=1',
        icon = host + '/assets/images/truck.png',
        // determine to markers group layer to remove later
        startStopControl,
        looping,
        PolylineDecode,
        temporaryStop = true,
    /*!
     * ------------------------------------------------------
     * Map Control Button To Add Play Pause
     * ------------------------------------------------------
     */
    processor = function(res, map, MarkersGroup) {
        let _m = this;
        this.Control.startStop = this.Control.extend({
            options: {
                position: 'topleft',
                startTitle: '<span class="mif-play" title="Start Direction"></span>',
                startWithoutZoomTitle: '<span class="mif-play" title="Start Direction Without Zoom"></span>',
                stopWithoutZoomTitle: '<span class="mif-pause" title="Pause Direction Without Zoom"></span>',
                stopTitle: '<span class="mif-pause" title="Pause Direction"></span>',
                resetZoomTitle: '<span class="mif-spinner5" title="Reset Zoom"></span>',
            },
            map,
            onAdd: function (map) {
                this.map = map;
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
                    this.map.flyToBounds(MarkersGroup, {animate: true});
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
        startStopControl = new this.Control.startStop().addTo(this);
        // if in invalid clause
        if (!res.data.result.routes[0]) {
            return;
        }
        let zoomedMarkerGroup = this.featureGroup();
        /*!
         * ------------------------------------------------------
         * add Markers Group To Layer
         * ------------------------------------------------------
         */
        this.addLayer(MarkersGroup);
        this.addLayer(zoomedMarkerGroup);

        /*!
         * ------------------------------------------------------
         * Decode Polyline
         * ------------------------------------------------------
         */
        PolyLineDecoded = this.decode(res.data.result.routes[0].geometry);
        if (!PolyLineDecoded || typeof PolyLineDecoded !== 'object') {
            return;
        }
        // for implement icon see: https://github.com/Leaflet/Leaflet.Icon.Glyph
        // and for icon see : https://metroui.org.ua/v3/font.html
        let polyline = this.polyline(PolyLineDecoded).addTo(this);
        let last = polyline.getLatLngs().length - 1;
        /*!
         * ------------------------------------------------------
         * add last marker
         * ------------------------------------------------------
         */
        let pos = polyline.getLatLngs()[last];
        this
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
        this
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
        this.flyToBounds(MarkersGroup, {animate: true});
        /*!
         * ------------------------------------------------------
         * Add Points each on
         * ------------------------------------------------------------
         */
        let count = 0;
        let div = document.createElement('div');
        div.innerHTML = '<h3>I\'m Moving</h3><p> Latitude :<br> <span data-lat="'+pos.lat+'">'
            +pos.lat+'</span><br>'
            + 'Longitude:<br> <span data-lng="'+pos.lng+'">'+pos.lat+'</span>'
            +'</p>';
        let dataLat  = div.querySelector('[data-lat]');
        let dataLng  = div.querySelector('[data-lng]');
        let lastAngle = pos.bearingTo(polyline.getLatLngs()[1]);
        let lastMarker = this
            .marker(pos, {
                icon: L.icon.glyph({
                    prefix: 'mdi',
                    iconUrl: icon,
                    iconSize: [32, 32],
                    rotationAngle: lastAngle,
                })
            })
            .setRotationAngle(lastAngle)
            .bindPopup(div);
        let hasStarted = false;
        looping = () => {
            if (count === 0) {
                zoomedMarkerGroup.addLayer(lastMarker);
                lastMarker.addTo(MarkersGroup).openPopup();
            }
            if (temporaryStop === true) {
                hasStarted = false;
                return;
            }
            if (count + 1 >= last || !polyline.getLatLngs()[count + 1]) {
                if (lastMarker) {
                    MarkersGroup.removeLayer(lastMarker);
                    zoomedMarkerGroup.removeLayer(lastMarker);
                    count = 0;
                }
                hasStarted = false;
                temporaryStop = true;
                if (this.startStop) {
                    temporaryStop = false;
                    this.startStop.playStop();
                }
                console.log('DONE .....!');
                return;
            }
            count++;
            // if ((count % 2) !== 0) {
            //     looping();
            //     return;
            // }
            let lastPos = pos;
            pos = polyline.getLatLngs()[count];
            lastAngle = lastPos.bearingTo(pos);
            lastMarker
                .setLatLng(pos)
                .setRotationAngle(lastAngle);
            this.flyToBounds(zoomedMarkerGroup.getBounds(), {animate: true});
            if (dataLat) {
                dataLat.setAttribute('data-lat', pos.lat);
                dataLat.innerHTML = pos.lat;
            }
            if (dataLng) {
                dataLng.setAttribute('data-lat', pos.lng);
                dataLng.innerHTML = pos.lng;
            }
            hasStarted = true;
            temporaryStop = false;
            setTimeout(looping, 500);
        };
    };
    L.windowLoad(function () {
        this.LogislyMap(config)
            //! SUCCEED
            .onSuccess(function() {
                // call remote
                this.remoteJSON(url, {
                    success: (res, xhr, Map) => {
                        return processor.call(this.getMap(), res, Map, Map.featureGroup(), this.getMap());
                    },
                    error: (xhr) => {
                        // console.log(xhr);
                    }
                });
            })
            //! ERROR
            .onError((e) => {
                console.log(e);
            }).init();
    });
})(window);
