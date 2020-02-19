(function (_) {
    // custom zoom bar control that includes a Zoom Home function
    let host = location.protocol + '//' + location.host,
        url = host + '/osrm/route/?coordinates=112.7227133,-7.9963867|113.6548642,-7.9963867&geometry=poly&overview=simplified&compress=1',
        PolyLineDecoded,
        looping,
    processor = function(res, map, MarkersGroup) {
        // if in invalid clause
        if (!res.data.result.routes[0]) {
            return;
        }
        /*!
         * ------------------------------------------------------
         * add Markers Group To Layer
         * ------------------------------------------------------
         */
        this.addLayer(MarkersGroup);

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
        looping = () => {
            if (count + 1 >= last || !polyline.getLatLngs()[count + 1]) {
                // MarkersGroup.removeLayer(lastMarker);
                count = 0;
                console.log('DONE .....!');
                return;
            }
            count++;
            if (count !== 1 && (count % 2) !== 0) {
                looping();
                return;
            }
            pos = polyline.getLatLngs()[count];
            this
                .marker(pos, {
                    icon: this.icon.glyph({
                        prefix: 'mif',
                        glyph: 'truck',
                    })
                })
                .bindPopup('I\'m On : '+ JSON.stringify(pos)).addTo(MarkersGroup);
            if (count === 1) {
                MarkersGroup.addTo(this);
            }
            setTimeout(looping, 1000);
        };
        setTimeout(looping, 1000);
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
