## DATA STORAGE

This is place of osrm data

### DATA SOURCE

see [http://download.geofabrik.de/](http://download.geofabrik.de/) to download `phbf` file


> PROCESS

`osrm-extract data.phb` extract data

`osrm-partition data.osrm` partitioning data

`osrm-customize data.osrm` customizing data

`osrm-contract data.osrm` contracting data -> this important for CH algorithm

