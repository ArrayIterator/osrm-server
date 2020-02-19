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
        // determine to markers group layer to remove later
        MarkersGroup,
        startStopControl,
        looping,
        lMap = new LogislyMap(config);
    let processor = (res) => {
        // if in invalid clause
        if (!map
            || !lMap
            || !res.data.result.routes[0]
        ) {
            return;
        }
        /*!
         * ------------------------------------------------------
         * add Markers Group To Layer
         * ------------------------------------------------------
         */
        map.addLayer(MarkersGroup);

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
                icon: lMap.icon.glyph({
                    prefix: 'mif',
                    glyph: 'truck',
                })
            })
            .bindPopup('I\'m Moving');
        looping = () => {
            if (count === 0) {
                lastMarker.addTo(MarkersGroup);
            }
            if (count + 1 >= last || !polyline.getLatLngs()[count + 1]) {
                if (lastMarker) {
                    MarkersGroup.removeLayer(lastMarker);
                    count = 0;
                }
                console.log('DONE .....!');
                return;
            }
            count++;
            if ((count % 2) !== 0) {
                looping();
                return;
            }
            pos = polyline.getLatLngs()[count];
            lastMarker
                .setLatLng(pos);
            setTimeout(looping, 10);
        };
        window.document.onreadystatechange = () => {
            if (document.readyState === 'complete') {
                setTimeout(looping, 1000);
            }
        };
    };
    let Log = new LogislyMap(config)
        //! SUCCEED
        .onSuccess((m, LM) => {
            // override variable
            lMap = LM;
            map = m;
            MarkersGroup = LM.featureGroup();
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
