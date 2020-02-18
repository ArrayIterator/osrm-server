(function (_) {
    let config = {
        selector:'map',
        type: 'google', // default provider
        mode: 'standard', // default provider
        // disable ESRI Map
        disableMapEsri:true,
        // disable Google Terrain
        disableGoogleModeTerrain:true,
        // disable all mode satellite
        disableModeSatellite:true,
        // enable map control
        enableMapControl : true,
        preferCanvas: true,
        fitSelectedRoutes: false
    };
    let host = location.protocol +'//'+ location.host,
        url = host + '/osrm/route/?coordinates=112.7227133,-7.9963867|113.6548642,-7.9963867&geometry=poly&compress=1',
        map,
        // determine to markers group layer to remove later
        MarkersGroup,
        lMap = new LogislyMap(config);
    let processor = (res) => {
        // if in invalid clause
        if (!map || !lMap) {
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
        if (typeof PolyLineDecoded !== 'object') {
            return;
        }
        // for implement icon see: https://github.com/Leaflet/Leaflet.Icon.Glyph
        // and for icon see : https://metroui.org.ua/v3/font.html
        let polyline = lMap.polyline(PolyLineDecoded).addTo(map);
        let last   = polyline.getLatLngs().length-1;
        let pos = polyline.getLatLngs()[0];
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
         * add last marker
         * ------------------------------------------------------
         */
        pos = polyline.getLatLngs()[last];
        lMap
            .marker(pos, {
                icon: L.icon.glyph({
                    prefix: 'mif',
                    glyph: 'my-location'
                })
            })
            .bindPopup("Destination Point" + JSON.stringify(pos))
            .addTo(MarkersGroup);

        /*!
         * ------------------------------------------------------
         * fit bound first fly it
         * ------------------------------------------------------------
         */
        map.flyToBounds(MarkersGroup);
        /*!
         * ------------------------------------------------------
         * Add Points each on
         * ------------------------------------------------------------
         */
        let count = 0;
        let intVal = setInterval(() => {
            if (count+1 >= last || !polyline.getLatLngs()[count+1]) {
                console.log('DONE .....!');
                clearInterval(intVal);
                return;
            }
            count++;
            if ((count % 2) !== 0) {
                return;
            }
            pos = polyline.getLatLngs()[count];
            console.log('Add Marker To: '+ JSON.stringify(pos));
            lMap
                .marker(pos, {
                    icon: L.icon.glyph({
                        prefix: 'mif',
                        glyph: 'truck'
                    })
                })
                .bindPopup('Position On : ' + JSON.stringify(pos))
                .addTo(MarkersGroup);
        }, 1000);
    };
    let Log = new LogislyMap(config)
        //! SUCCEED
        .onSuccess((m, LM) => {
            // override variable
            lMap = LM;
            map = m;
            MarkersGroup = LM.featureGroup();
            // call remote
            return lMap
                .remoteJSON(url)
                .then(processor)
                .catch((e) => {
                console.log('Rejected: ' + e.responseText);
            });
        })
        //! ERROR
        .onError((e) => {
            console.log(e);
        }).init();
})(window);
