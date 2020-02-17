(function (_) {
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
        enableMapControl : true
    };
    let map = new logislyMap(config)
        // on succeed
        .onSuccess((map, logisly_map) => {
            window.logisly = logisly_map;
        }).onError((e) => {
            console.log(e);
        }).init();
})(window);

