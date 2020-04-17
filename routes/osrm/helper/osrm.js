const OSRM = require('osrm');
const path = require('path');
const fs = require('fs');
module.exports = (options) => {
    options = typeof options !== 'object'
        ? {algorithm: "MLD"}
        : options;
    if (typeof options.algorithm !== 'string'
        || ['MLD', 'CH', 'CoreCH'].indexOf(options.algorithm)
    ) {
        options.algorithm = 'MLD';
    }
    if (typeof options.mmap_memory !== 'boolean') {
        options.mmap_memory = true;
    }
    if (typeof options.shared_memory !== "undefined" && typeof options.shared_memory !== 'boolean') {
        options.shared_memory = true;
    }

    let osrmPath = Config.get('osrm') || null;
    osrmPath = osrmPath ? osrmPath.path : null;
    osrmPath = osrmPath || path.join(StoragePath + '/osrm/indonesia-latest.osrm');
    if (!fs.existsSync(osrmPath)) {
        return {
            message: "500 Internal Server Error. OSRM database has not ready.",
            code: 500
        };
    }

    options.path = osrmPath;
    return new OSRM(options);
};
