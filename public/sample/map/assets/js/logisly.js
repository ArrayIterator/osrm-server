(function (_) {
    // MAP CONFIG
    let config = {
        // maxBounds: null, // max bounds null to access all areas, undefined to indonesia
        minZoom: 0,
        maxZoom: 18,
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
        // disableGoogleModeStandard: true,
        // disable all _mode satellite
        disableModeSatellite: true,
        // enable map control (map chooser -> google, osm etc)
        enableMapControl: false,
        // zoomControl: false,
        // prefer canvas
        preferCanvas: true,
        // fit selected routes
        fitSelectedRoutes: false,
        useCache: false,
        saveToCache: true,
        forceTile: {
            name: 'Logisly',
            prefix: 'Map',
            uri: 'https://tile-{s}.logisly.com/{z}/{x}/{y}.png',
            subdomains: 'abcd',
        },
        tileLayerCallback: function (url, args) {
            args.filter = [
                'blur:0px',
                'brightness:100%',
                'contrast:110%',
                'grayscale:10%',
                //'hue:-20deg', // 20 more darken
                'hue:-15deg',
                'opacity:100%',
            //     'invert:100%',
                'saturate:120%',
                //'sepia:5%',
            ];
            return this.tileLayer.colorFilter(url, args);
        }
    };
    let $overlay = window.document.createElement('div');
    $overlay.className = 'overlay';
    $overlay.innerHTML = '<div class="lds-dual-ring"></div>';
    // for implement icon see: https://github.com/Leaflet/Leaflet.Icon.Glyph
    // and for icon see : https://metroui.org.ua/v3/font.html
    /*!
     * ------------------------------------------------------
     * REFERENCES
     * HOST -> CHANGE TO SERVER URL
     * ------------------------------------------------------
     */
    let urlHost = location.protocol + '//' + location.host;
    let $coordinates = [
        '112.7227133,-7.9963867',
        '112.7380904,-8.2084605',
        '113.6548642,-7.9963867'
    ];
    let routingCoordinatesUrl = urlHost + '/osrm/route/?coordinates={co}&geometry=poly&overview=full&compress=1';
    let processor = (data, Map) => {
        let trans = 100;
        let int = setInterval(function () {
            trans = trans-5;
            if (trans <= 0 ) {
                clearInterval(int);
                $overlay.remove();
                return;
            }
            $overlay.style = 'opacity:'+(trans)+'%';
        }, 20);

        // get currentMap
        let currentMap = Map.getMap();
        /*!
         * ------------------------------------------------------
         * Marker Group & Markers
         * ------------------------------------------------------
         */
        // MarkerGroup to Binding All Current Marker Grouping
        let MarkersGroup = Map.featureGroup();
        let poly = null;
        let startingPoints = {};
        for (let i = 0;data.length > i;i++) {
            let decoded = currentMap.decode(data[i]);
            data[i] = null;
            if (decoded && typeof decoded === 'object' && decoded.length > 0) {
                let polyline = currentMap.polyline(decoded).addTo(currentMap);
                for (let i =0;polyline.getLatLngs().length >i ;i++) {
                    if(i === 0) {
                        startingPoints[JSON.stringify(polyline.getLatLngs()[i])] = true;
                    }
                    if (!poly) {
                        poly = currentMap.polyline([polyline.getLatLngs()[i]]);
                        continue;
                    }
                    poly.addLatLng(polyline.getLatLngs()[i]);
                }
                let position = polyline.getLatLngs()[0];
                let start = i+1;
                currentMap
                    .marker(position, {
                        icon: L.icon.glyph({
                            prefix: 'mif',
                            glyph: 'my-location'
                        })
                    }).addTo(MarkersGroup)
                    .bindPopup(
                        (
                             `<h1>Starting Point ${start}</h1>`
                        ) +
                        `<p>
                        Lat: ${position.lat}<br/>
                        Lng: ${position.lng}</p>
                    `);
            }
        }

        currentMap.addLayer(MarkersGroup);
        currentMap.flyToBounds(MarkersGroup, {animate: true});
        let position = poly.getLatLngs()[0];
        /*!
         * ------------------------------------------------------
         * POPUP ELEMENT
         * Create HtmlElement to insert inside popup
         * I used this to easily change the content
         * ------------------------------------------------------
         */
        let divPopUpElement = document.createElement('div');
        let h3 = document.createElement('h3');
            h3.innerHTML = "I'm Moving";
        divPopUpElement.innerHTML = '<p> Latitude :<br> <span data-lat="'+position.lat+'">'
            +position.lat+'</span><br>'
            + 'Longitude:<br> <span data-lng="'+position.lng+'">'+position.lat+'</span>'
            +'</p>';
        let dataLatElement  = divPopUpElement.querySelector('[data-lat]');
        let dataLngElement  = divPopUpElement.querySelector('[data-lng]');
        divPopUpElement.prepend(h3);
        let firstMarker = currentMap
            .marker(
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
        let lastAngle = lastPosition.bearingTo(poly.getLatLngs()[1]);
        // set rotation angle (bearing)
        // movingMarker.setRotationAngle(lastAngle);
        let last = poly.getLatLngs().length - 1;
        let countForLooping = 0;
        let countIncrementInterval = 0;
        let timeOut = 3;
        let tm = timeOut - countIncrementInterval;

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
            if (countForLooping + 1 >= last || !poly.getLatLngs()[countForLooping + 1]) {
                if (movingMarker) {
                    movingMarker.closePopup();
                    MarkersGroup.removeLayer(movingMarker);
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
                    markerLast._popup.setContent(
                        '<p><strong>Yay!!! We\'ve got arrive</strong><br>'
                        + '<br>Lat: '+position.lat
                        + '<br>Lng: '+position.lng
                        + '</p>'
                    );
                    markerLast.openPopup();
                    countForLooping = 0;
                }
                poly = null;
                console.log('DONE .....!');
                return;
            }
            let selection = JSON.stringify(position);
            let inStop = typeof startingPoints[selection] === 'boolean' && countForLooping > 1;
            if (dataLatElement) {
                dataLatElement.setAttribute('data-lat', position.lat);
                dataLatElement.innerHTML = position.lat;
            }
            if (dataLngElement) {
                dataLngElement.setAttribute('data-lat', position.lng);
                dataLngElement.innerHTML = position.lng;
            }
            h3.innerHTML = "I'm Moving";
            countForLooping++;
            if ((countForLooping % 2) !== 0) {
                if (inStop) {
                    h3.innerHTML = "I'm On CheckPoint";
                    setTimeout(function () {
                        looping();
                    }, 1000);
                    return;
                }
                looping();
                return;
            }

            lastPosition = position;
            // get current Position
            position = poly.getLatLngs()[countForLooping];
            // set current marker position
            movingMarker.setLatLng(position);

            // set angle / bearing
            lastAngle = lastPosition.bearingTo(position);
            // movingMarker.setRotationAngle(lastAngle);
            if (inStop) {
                h3.innerHTML = "I'm On CheckPoint";
                setTimeout(function () {
                    looping();
                }, 1000);
                return;
            }
            setTimeout(looping, 5);
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
        let coordinatesData = [];
        let retryCount = [];
        function getRemote(count)
        {
            let coordinate = $coordinates[count];
            if (!$coordinates[count]) {
                alert(count);
            }
            coordinate += '|' + ($coordinates[count+1] || $coordinates[0]);

            let url = routingCoordinatesUrl.replace(/\{co\}/g, coordinate);
            // call remote this could Used As looping prefetch
            Map.remoteJSON(url, {
                success: (resultData, xhr, Map) => {
                    try {
                        let geo = resultData.data.result.routes[0].geometry;
                        if (geo) {
                            coordinatesData.push(geo);
                        }
                    } catch (e) {
                        // pass
                    }
                    if ($coordinates[count+1]) {
                        // setTimeout(function () {
                        getRemote(count+1);
                        //}, 1000);
                        return;
                    }
                    processor(coordinatesData, Map);
                },
                error: (xhr) => {
                    if (!retryCount[count]) {
                        retryCount[count] = 1;
                    }

                    if (retryCount[count]++ > 10) {
                        if (coordinatesData.length > 0) {
                            processor(coordinatesData, Map);
                            return;
                        }

                        alert('Could Not Request Routing API');
                        let trans = 100;
                        let int = setInterval(function () {
                            trans = trans-5;
                            if (trans <= 0 ) {
                                clearInterval(int);
                                $overlay.remove();
                                return;
                            }
                            $overlay.style = 'opacity:'+(trans)+'%';
                        }, 20);
                        return;
                    }
                    setTimeout(function () {
                        getRemote(count);
                    }, 2000);
                }
            });
        }
        getRemote(0);
    };

    /*!
     * ------------------------------------------------------
     * // CREATE NEW MAP
     * ------------------------------------------------------
     */
    let Map = LogislyMap(config);
        Map.onBeforeProcess(function () {
            document.body.prepend($overlay);
        });

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
