let config = {
    selector: 'map',
    type: 'google', // default provider
    mode: 'standard', // default provider
    // disable ESRI Map
    disableMapEsri: true,
    enableScale: false,
    // disable Google Terrain
    disableGoogleModeTerrain: true,
    // disable all _mode satellite
    disableModeSatellite: true,
    // enable map control
    enableMapControl: true,
    preferCanvas: true,
    fitSelectedRoutes: false,
    useCache: false,
    // forceTile: {
    //     name: 'Standard',
    //     prefix: 'Google',
    //     uri: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    //     subdomains: ['', 1, 2, 3], // for google
    // },
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
