## DATA STORAGE

This is place of osrm data

### DATA SOURCE

see [http://download.geofabrik.de/](http://download.geofabrik.de/) to download `phbf` file

> NOTE

If you try to installing via `npm -i` and all succeed.

Please check directory `node_modules/osrm/lib/binding/`, it must be contains :

- `node_osrm.node`  : nodejs binding for osrm
- `osrm-components` : osrm binary components
- `osrm-contract`   : osrm binary contract
- `osrm-customize`  : osrm binary customize
- `osrm-datastore`  : osrm binary data store    
- `osrm-extract`    : osrm binary extractor
- `osrm-partition`  : osrm binary partition maker
- `osrm-routed`     : osrm binary routing maker

On below, process could use osrm binary, eg : `/path/to/node_modules/osrm/lib/binding/osrm-extract data.phbf` 

FOLLOW THIS INSTRUCTION !! [https://github.com/Project-OSRM/osrm-backend/wiki/Running-OSRM](https://github.com/Project-OSRM/osrm-backend/wiki/Running-OSRM)

And Please check [config.example.yaml](config.example.yaml), read it carefully
 
> PROCESS

> Extract data
```bash
osrm-extract data.phbf
```

> Partitioning data
```bash
osrm-partition data.osrm
```

> Customize data
```bash
osrm-customize data.osrm
```

> Contracting data -> this important for CH algorithm
```bash
osrm-contract data.osrm
```
