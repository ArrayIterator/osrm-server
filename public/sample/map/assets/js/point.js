(function (_) {
    // MAP CONFIG
    let config = {
        // id selector
        selector: 'map',
        // default provider -> see processor@LogMapProviders
        type: 'google',
        // default provider
        mode: 'standard',
        // disable ESRI Map
        disableMapEsri: true,
        // enable scaling display (on corner scaling size)
        enableScale: true,
        // disable Google Terrain
        disableGoogleModeTerrain: true,
        // disable all _mode satellite
        disableModeSatellite: true,
        // enable map control (map chooser -> google, osm etc)
        enableMapControl: true,
        // prefer canvas
        preferCanvas: true,
        // fit selected routes
        fitSelectedRoutes: false
    };

    // for implement icon see: https://github.com/Leaflet/Leaflet.Icon.Glyph
    // and for icon see : https://metroui.org.ua/v3/font.html
    /*!
     * ------------------------------------------------------
     * REFERENCES
     * HOST -> CHANGE TO SERVER URL
     * ------------------------------------------------------
     */
    let urlHost = location.protocol + '//' + location.host;
    let routingCoordinatesUrl = urlHost + '/osrm/route/?coordinates=112.7227133,-7.9963867|113.6548642,-7.9963867&geometry=poly&overview=full&compress=1';

    /*!
     * ------------------------------------------------------
     * // PROCESSOR ON SUCCEED
     * ------------------------------------------------------
     */
    let applicationProcessor = (result, Map) => {
        let countForLooping = 0;
        let countIncrementInterval = 0;
        let timeOut = 3;
        let tm = timeOut - countIncrementInterval;

        // if in invalid clause
        if (!result.data.result.routes[0]) {
            return;
        }
        // get currentMap
        let currentMap = Map.getMap();

        /*!
         * ------------------------------------------------------
         * Decode Polyline
         * // @> result.data.result.routes[0].geometry
         * ------------------------------------------------------
         */
        let PolyLineDecoded = currentMap.decode(result.data.result.routes[0].geometry);
        if (! PolyLineDecoded || typeof PolyLineDecoded !== 'object') {
            return;
        }

        /*!
         * ------------------------------------------------------
         * Marker Group & Markers
         * ------------------------------------------------------
         */
        // MarkerGroup to Binding All Current Marker Grouping
        let MarkersGroup = Map.featureGroup();

        // add Markers Group To Layer
        currentMap.addLayer(MarkersGroup);

        /*!
         * ------------------------------------------------------
         * Add Decoded Polyline To CurrentMap
         * This create line of road
         * ------------------------------------------------------
         */
        // add PolyLine from PolyLineDecode to create Route LINE
        let polyline = currentMap.polyline(PolyLineDecoded).addTo(currentMap);

        // below is example of straight line
        // if merge will be add additional straight line
        // currentMap.polyline([PolyLineDecoded[0], PolyLineDecoded[PolyLineDecoded.length-1]]).addTo(currentMap);

        // get last Position by count latLng
        let last = polyline.getLatLngs().length - 1;

        /*!
         * ------------------------------------------------------
         * add last marker
         * ------------------------------------------------------
         */
        // get last Position
        let position = polyline.getLatLngs()[last];
        let markerLast = currentMap
            .marker(position, {
                icon: L.icon.glyph({
                    prefix: 'mif',
                    glyph: 'my-location'
                })
            })
            .bindPopup("Destination Point: " + JSON.stringify(position))
            // add to marker
            .addTo(MarkersGroup);

        /*!
         * ------------------------------------------------------
         * add first marker to marker Group
         * ------------------------------------------------------
         */
        // change current position to starting point
        position = polyline.getLatLngs()[0];
        let firstMarker = currentMap.marker(
                position,
                {
                    icon: L.icon.glyph({
                        prefix: 'mif',
                        glyph: 'location-city'
                    })
                    // if used URL as ICON
                    // icon: L.icon.glyph({
                    //     prefix: 'mdi', // icon type
                    //     iconUrl: urlToIcon, // icon URL
                    //     iconSize: [32, 32], // icon Size
                    // })
                }
            )
            .addTo(MarkersGroup)
            // add popup content
            .bindPopup("Origin : " + JSON.stringify(position));
        /*!
         * ------------------------------------------------------
         * POPUP ELEMENT
         * Create HtmlElement to insert inside popup
         * I used this to easily change the content
         * ------------------------------------------------------
         */
        let divPopUpElement = document.createElement('div');
        divPopUpElement.innerHTML = '<h3>I\'m Moving</h3><p> Latitude :<br> <span data-lat="'+position.lat+'">'
            +position.lat+'</span><br>'
            + 'Longitude:<br> <span data-lng="'+position.lng+'">'+position.lat+'</span>'
            +'</p>';
        let dataLatElement  = divPopUpElement.querySelector('[data-lat]');
        let dataLngElement  = divPopUpElement.querySelector('[data-lng]');

        /*!
         * ------------------------------------------------------
         * fit bound first fly it -> animated
         * ------------------------------------------------------
         */
        currentMap.flyToBounds(MarkersGroup, {animate: true});

        /*!
         * ------------------------------------------------------
         * Add Points each on moving marker
         * ------------------------------------------------------
         */
        let movingMarker = currentMap
            .marker(position, {
                icon: currentMap.icon.glyph({
                    prefix: 'mif',
                    glyph: 'truck',
                })
                // icon: currentMap.icon.glyph({
                //     prefix: 'mdi', // icon type
                //     iconUrl: urlHost + '/assets/images/truck.png', // icon URL
                //     iconSize: [32, 32], // icon Size
                // })
            })
            .bindPopup(divPopUpElement);
        // set Last Position
        // This just for reference
        let lastPosition = position;
        let lastAngle = lastPosition.bearingTo(polyline.getLatLngs()[1]);
        // set rotation angle (bearing)
        movingMarker.setRotationAngle(lastAngle);

        /*!
         * ------------------------------------------------------
         * LOOPING FOR POINTS MOVE
         * REMOVE 2 Process Below To prevent add moving
         * or just remove setTimeOut-> process
         * ------------------------------------------------------
         */
        let looping = () => {
            if (countForLooping === 0) {
                // open popup on first
                movingMarker.addTo(MarkersGroup).openPopup();
            }
            // check if on last pointer
            if (countForLooping + 1 >= last || !polyline.getLatLngs()[countForLooping + 1]) {
                if (movingMarker) {
                    movingMarker.closePopup();
                    MarkersGroup.removeLayer(movingMarker);
                    markerLast._popup.setContent(
                        '<p><strong>Yay!!! We\'ve got arrive</strong><br>'
                        + '<br>Lat: '+position.lat
                        + '<br>Lng: '+position.lng
                        + '</p>'
                    );
                    markerLast.openPopup();
                    countForLooping = 0;
                }
                console.log('DONE .....!');
                return;
            }
            countForLooping++;
            if ((countForLooping % 2) !== 0) {
                looping();
                return;
            }
            if (dataLatElement) {
                dataLatElement.setAttribute('data-lat', position.lat);
                dataLatElement.innerHTML = position.lat;
            }
            if (dataLngElement) {
                dataLngElement.setAttribute('data-lat', position.lng);
                dataLngElement.innerHTML = position.lng;
            }

            lastPosition = position;
            // get current Position
            position = polyline.getLatLngs()[countForLooping];
            // set current marker position
            movingMarker.setLatLng(position);

            // set angle / bearing
            lastAngle = lastPosition.bearingTo(position);
            movingMarker.setRotationAngle(lastAngle);

            setTimeout(looping, 10);
        };
        // RUNNING MOVE
        setTimeout(() => {
            // change POP UP Text
            firstMarker.bindPopup("We Will Move in: " + tm);
            // close popup on first move
            firstMarker.openPopup();
            let iv = setInterval(() => {
                tm = timeOut - countIncrementInterval++;
                if (tm === 0) {
                    firstMarker._popup.setContent("Origin : " + JSON.stringify(position));
                    firstMarker.closePopup();
                    looping();
                    clearInterval(iv);
                    return;
                }
                firstMarker._popup.setContent("We Will Move after : " + tm);
            }, 1000);
        }, 2000);
    };

    /*!
     * ------------------------------------------------------
     * // ON SUCCEED MAP
     * ------------------------------------------------------
     */
    let onSuccessCallback = function(Map) {
        // call remote this could Used As looping prefetch
        Map.remoteJSON(routingCoordinatesUrl, {
            success: (resultData, xhr, Map) => {
                return applicationProcessor(
                    resultData,
                    Map
                );
            },
            error: (xhr) => {
                // console.log(xhr);
            }
        });
    };

    /*!
     * ------------------------------------------------------
     * // CREATE NEW MAP
     * ------------------------------------------------------
     */
    let Map = LogislyMap(config);
        //! ON SUCCEED
        Map.onSuccess(onSuccessCallback);
        //! ON ERROR
        Map.onError((e) => {
            console.log(e);
        });
    /*!
     * ------------------------------------------------------
     * // RUN ON LOAD
     * ------------------------------------------------------
     * or $(document).ready(function() {Map.init()})
     */
    L.windowLoad(Map.init);

})(window);
