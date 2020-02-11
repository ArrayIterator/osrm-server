## ROUTE LISTS


### OSRM

- Prefix : `/osrm/`


| PATH              | METHOD | NOTES                              |
| ------------------|--------|------------------------------------|
| `/osrm/route`     | GET    | Get route by declared coordinates  |

> QUERY

```
alternatives 
    - Type     : (int|bool)
    - Note     : integer get alternatives
    - Values   : ([0-9]+|true|false)
    - Default  : true
    - Required : false

geometry
    - Type     : (string)
    - Note     : geometry type
    - Values   : (geojson|polyline)
    - Default  : geojson
    - Required : false

annotations
    - Type     : (string|bool)
    - Note     : show annotations separate by comma
    - Values   : (duration|nodes|distance|weight|datasources|speed)
    - Default  : nodes,distance
    - Required : false

snapping 
    - Type     : (string)
    - Note     : Which edges can be snapped to
    - Values   : (default|any)
    - Default  : default
    - Required : false

radius      
    - Type     : (float|int)
    - Note     : Limits the coordinate snapping to streets in the given radius in meters
    - Values   : (null|float)
    - Default  : null
    - Required : false

```


### GEOIP

- Prefix : `/geoip/`

| PATH              | METHOD | NOTES                              |
| ------------------|--------|------------------------------------|
| `/geoip/ip`       | GET    | Get IP Information of country/city |

> QUERY

```
ip
    - Type     : (string)
    - Note     : IP address to get info
    - Values   : (ipv6/4)
    - Default  : (remote ip, eg: 127.0.0.1)
    - Required : false

```
