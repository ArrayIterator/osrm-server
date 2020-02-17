(function (_) {
    let url = 'http://map.dot/osrm/route/?token=default-token&coordinates=112.7227133,-7.9963867|113.6548642,-7.9963867&geometry=poly&compress=1';
    let config = {
        selector:'map',
        type:'google',
        // disable ESRI Map
        disableMapEsri:true,
        // disable Google Terrain
        disableGoogleModeTerrain:true,
        // disable all mode satellite
        disableModeSatellite:true,
        // enable map control
        enableMapControl : true,
        preferCanvas: true,
        fitSelectedRoutes: false,
        center: {lng: 112.7227133, lat: -7.9963867}
    };
    let map = new LogislyMap(config)
        // preparation before init
        .onBeforeProcess((map, LM) => {
            return LM.remoteJSON(url).then((res) => {
                let polyline = LM.polyline(
                    LM.decode(res.data.result.routes[0].geometry)
                ).addTo(map);
                let last   = polyline.getLatLngs().length-1;
                let marker1 = LM.marker(
                    polyline.getLatLngs()[0],
                )
                    .bindPopup("Starting Point")
                    .addTo(map); // add to map
                let marker2 = LM.marker(
                    polyline.getLatLngs()[last]
                ).bindPopup("Ending Point")
                    .addTo(map);
                let zoom = map.getBoundsZoom(polyline.getBounds()) + 3.5;
                if (zoom > 13) {
                    zoom -= 2;
                } else if (zoom < 6) {
                    zoom = 5;
                }
                marker1.bindPopup("Starting Point");
                marker2.bindPopup("Ending Point");
                map.setView(polyline.getCenter(), zoom, {animate: true});
            });
        })
        // on succeed
        .onSuccess((map, LM) => {
            console.log('succeed')
        }).onError((e) => {
            console.log(e);
        }).init();
})(window);

