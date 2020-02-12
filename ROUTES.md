## ROUTE LISTS


### OSRM

- Prefix : `/osrm/`


| PATH              | METHOD        | NOTES                              |
| ------------------|---------------|------------------------------------|
| `/route`          | GET|POST      | Get route by declared coordinates  |
| `/nearest`        | GET           | Get route by declared coordinates  |

> AVAILABLE PARAMETERS

```
coordinates
    - Type     : (string|array)
    - Note     : declare coordinates to get, string separated by `|` and longitude latitude separated by comma `,`
    - Values   : (lon,lat|lon,lat) | (coordinates[0][lon]=float&coordinates[0][lat]=float&coordinates[1][lon]=float&coordinates[1][lat]=float)
    - Default  :
    - Required : true (2 coordinates minimum)
    - Example  :
        1. ?coordinates=112.7227133,-7.9963867|112.6548642,-7.9963867|112.8548642,-7.8963867
        2. ?coordinates[]=112.7227133,-7.9963867&coordinates[]=112.6548642,-7.9963867&coordinates[]=112.8548642,-7.8963867
        3. ?coordinates[0][0]=112.7227133&coordinates[0][1]=-7.9963867&coordinates[1][0]=112.6548642&coordinates[1][1]=-7.9963867&coordinates[2][0]=112.8548642&coordinates[2][1]=-7.8963867

alternatives 
    - Type     : (int|bool)
    - Note     : integer get alternatives
    - Values   : ([0-9]+|true|false)
    - Default  : false
    - Required : false
    - Example  :
        1. ?alternatives=true&coordinates=xxxx,xxx|xxx,xxx
        2. ?alternatives=10&coordinates=xxxx,xxx|xxx,xxx

geometry
    - Type     : (string)
    - Note     : geometry type
    - Values   : (geojson|polyline)
    - Default  : polyline
    - Required : false
    - Example  :
        1. ?geometry=geojson&coordinates=xxxx,xxx|xxx,xxx
        2. ?geometry=polyline&coordinates=xxxx,xxx|xxx,xxx

annotations
    - Type     : (string|bool|array)
    - Note     : show annotations separate by comma
    - Values   : (duration|nodes|distance|weight|datasources|speed)
    - Default  : false
    - Required : false
    - Example  :
        1. ?annotations=duration&coordinates=xxxx,xxx|xxx,xxx
        2. ?annotations=distance,nodes&coordinates=xxxx,xxx|xxx,xxx
        2. ?annotations[]=distance&annotations[]=nodes&coordinates=xxxx,xxx|xxx,xxx

snapping 
    - Type     : (string)
    - Note     : Which edges can be snapped to
    - Values   : (default|any)
    - Default  : default
    - Required : false
    - Example  :
        1. ?snapping=any&coordinates=xxxx,xxx|xxx,xxx
        2. ?snapping=default&coordinates=xxxx,xxx|xxx,xxx

steps 
    - Type     : (string)
    - Note     : Return route steps for each route leg.
    - Values   : (true|false)
    - Default  : false
    - Required : false
    - Example  :
        1. ?steps=true&coordinates=xxxx,xxx|xxx,xxx
        2. ?steps=false&coordinates=xxxx,xxx|xxx,xxx

radius      
    - Type     : (float|int)
    - Note     : Limits the coordinate snapping to streets in the given radius in meters
    - Values   : (null|float)
    - Default  : null
    - Required : false
    - Example  :
        1. ?radius=10.5&coordinates=xxxx,xxx|xxx,xxx
        2. ?radius=20&coordinates=xxxx,xxx|xxx,xxx

number      
    - Type     : (int)
    - Note     : Number of nearest segments that should be returned. Must be an integer greater than or equal to 1.
    - Values   : (null|float)
    - Default  : 1
    - Required : false
    - Example  :
        1. ?nearest=10&coordinates=xxxx,xxx|xxx,xxx

```

> ROUTE : `/osrm/route`

**query `coordinates` make sure request has 2 coordinates.**


Accepted params:

- `coordinates`|`coordinates`  (make sure request has 2 coordinates)
- `alternatives`| `alternative`
- `overview`
- `geometry`|`geometries`
- `annotations`|`annotation`
- `snapping`
- `radius`|`radiuses`
- `steps`|`step`
- `continue_straight`|`continue`


> ROUTE : `/osrm/nearest`

Accepted params:

- `coordinates`|`coordinates`  (make sure request has 2 coordinates)
- `alternatives`| `alternative`
- `overview`
- `geometry`|`geometries`
- `annotations`|`annotation`
- `snapping`
- `radius`|`radiuses`
- `steps`|`step`
- `continue_straight`|`continue`

- Prefix : `/osrm/polyline`

| PATH              | METHOD        | NOTES                              |
| ------------------|---------------|------------------------------------|
| `/decode`         | GET|POST      | Get route by declared coordinates  |


> AVAILABLE PARAMETERS

```
data 
    - Type     : (string)
    - Note     : Decode Polyline to array [latitude, longitude]
    - Values   : polyline
    - Default  : false
    - Required : false
    - Example  :
        1. ?data=|vxo@y`_oTaE}Ak[leAwHtd@pBbBKvH}GnEwFlQ}LxVaDlOyz@v~Bzb@zRtCdg@lPnMnSrf@z^``@pRnKtLzBd@wBu@mEfGsLgVyP`H_K

```

> ROUTE : `/osrm/polyline/decode`

Accepted params:

- `data` (string polyline data)



### GEOIP

- Prefix : `/geoip/`

| PATH              | METHOD        | NOTES                              |
| ------------------|---------------|------------------------------------|
| `/ip`             | GET           | Get IP Information of country/city |


> AVAILABLE PARAMETERS

```
ip
    - Type     : (string)
    - Note     : IP address to get info
    - Values   : (ipv6/4)
    - Default  : (remote ip, eg: 127.0.0.1)
    - Required : false
    - Example  :
        1. ?ip=8.8.8.8
        2. ?ip=2001:4860:4860::8888

```
