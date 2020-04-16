## ROUTE LISTS

Contains Routes List of OSRM Server, this documentations take a long page scrolling.

Please, make sure you have read about all section, start from headers, route path, available parameters into accepted parameter


### MAIN PARAMETERS & HEADERS

> PARAMETERS

- `compress` to compress response (minify) - off|false|0 to disable , true|1|on to enable
- `token` to use token as authenticate (if no `x-auth-token`) - mandatory

> HEADERS

- `x-compress` to compress response (minify)
- `x-auth-token` to use token as authenticate (if no query `token`) - mandatory

### NOTE PARAMETERS

This API currently does not support `hints` parameter, that provide by OSRM.

This just because the system will crash / error when invalid `hints` parameter given.


### OSRM

- Prefix : `/osrm/`

| PATH              | METHOD        | NOTES                                 |
| ------------------|---------------|---------------------------------------|
| `/route`          | GET|POST      | Get route by declared coordinates     |
| `/table`          | GET|POST      | Computes duration table               |
| `/nearest`        | GET           | Get nearest by declared coordinates   |

> AVAILABLE PARAMETERS

```
coordinates
    - Aliases   : coordinate
    - Type      : (string|array)
    - Note      : declare coordinates to get, string separated by vertical bar `|` 
                and longitude latitude separated by comma `,`
    - Values    : (lon,lat|lon,lat) | (coordinates[0][lon]=float&coordinates[0][lat]=float&coordinates[1][lon]=float&coordinates[1][lat]=float)
    - Default   :
    - Required  : true (2 coordinates minimum)
    - Example   :
        1. ?coordinates=112.7227133,-7.9963867|112.6548642,-7.9963867|112.8548642,-7.8963867
        2. ?coordinates[]=112.7227133,-7.9963867&coordinates[]=112.6548642,-7.9963867&coordinates[]=112.8548642,-7.8963867
        3. ?coordinates[0][0]=112.7227133&coordinates[0][1]=-7.9963867&coordinates[1][0]=112.6548642&coordinates[1][1]=-7.9963867&coordinates[2][0]=112.8548642&coordinates[2][1]=-7.8963867

alternatives
    - Aliases   : alternative
    - Type      : (int|bool)
    - Note      : integer get alternatives
    - Values    : ([0-9]+|true|false)
    - Default   : false
    - Required  : false
    - Example   :
        1. ?alternatives=true&coordinates=xxxx,xxx|xxx,xxx
        2. ?alternatives=10&coordinates=xxxx,xxx|xxx,xxx

overview
    - Aliases   : overview
    - Type      : (string|bool)
    - Note      : string about overview, true will be returning full, false or empty to disable, otherwise  simplified
    - Values    : (simplified|full|true)
    - Default   : false|simplified
    - Required  : false
    - Example   :
        1. ?overview=true&coordinates=xxxx,xxx|xxx,xxx
        2. ?overview=full&coordinates=xxxx,xxx|xxx,xxx
        3. ?overview=false&coordinates=xxxx,xxx|xxx,xxx
        4. ?overview=simplified&coordinates=xxxx,xxx|xxx,xxx
        5. ?overview=&coordinates=xxxx,xxx|xxx,xxx

geometries
    - Aliases   : geometry
    - Type      : (string)
    - Note      : geometry type
    - Values    : (geojson|polyline)
    - Default   : polyline
    - Required  : false
    - Example   :
        1. ?geometries=geojson&coordinates=xxxx,xxx|xxx,xxx
        2. ?geometries=polyline&coordinates=xxxx,xxx|xxx,xxx

annotations
    - Aliases   : annotation
    - Type      : (string|bool|array)
    - Note      : show annotations separate by comma, annotations for table only support (duration & distance)
    - Values    : (duration|nodes|distance|weight|datasources|speed)
    - Default   : false (if route `table` default is : duration,distance)
    - Required  : false
    - Example   :
        1. ?annotations=duration&coordinates=xxxx,xxx|xxx,xxx
        2. ?annotations=distance,nodes&coordinates=xxxx,xxx|xxx,xxx
        2. ?annotations[]=distance&annotations[]=nodes&coordinates=xxxx,xxx|xxx,xxx

snapping
    - Aliases   : snappings
    - Type      : (string)
    - Note      : Which edges can be snapped to
    - Values    : (default|any)
    - Default   : default
    - Required  : false
    - Example   :
        1. ?snapping=any&coordinates=xxxx,xxx|xxx,xxx
        2. ?snapping=default&coordinates=xxxx,xxx|xxx,xxx

steps
    - Aliases   : step
    - Type      : (boolean)
    - Note      : Return route steps for each route leg.
    - Values    : (true|false)
    - Default   : false
    - Required  : false
    - Example   :
        1. ?steps=true&coordinates=xxxx,xxx|xxx,xxx
        2. ?steps=false&coordinates=xxxx,xxx|xxx,xxx

approaches
    - Aliases   : approach
    - Type      : (string|null)
    - Note      : Keep waypoints on curb side, approaches followed by coordinates length,
                 separated by comma. Use null to use default
    - Values    : (curb|null)
    - Default   : null
    - Required  : false
    - Example   :
        1. ?approaches=curb,null&coordinates=xxxx,xxx|xxx,xxx
        2. ?approaches=null,null&coordinates=xxxx,xxx|xxx,xxx

radiuses
    - Aliases   : radius
    - Type      : (null|0|float|int|float[]|int[])
    - Note      : Limits the coordinate snapping to streets in the given radius in meters,
                radiuses followed by coordinates length, separated by comma. Use null or 0 to unlimited 
    - Values    : (null|float[]|string,string)
    - Default   : [null, ...]
    - Required  : false
    - Example   :
        1. ?radiuses=10.5&coordinates=xxxx,xxx|xxx,xxx
        2. ?radiuses=20&coordinates=xxxx,xxx|xxx,xxx

bearings
    - Aliases   : bearing
    - Type      : (null|0|float|int|float[]|int[])
    - Note      : Limits the search to segments with given bearing in degrees towards true north in clockwise direction, 
                bearings followed by coordinates length, separated by vertical bar `|`
                [{value},{range}] with integer 0 .. 360,integer 0 .. 180, separated by comma
                Use null or 0 to use default.
    - Values    : (null|float[]|string,string)
    - Default   : [null, ...]
    - Required  : false
    - Example   :
        1. ?bearings=360,180|240,170&coordinates=xxxx,xxx|xxx,xxx
        2. ?bearings[]=360,180&bearings[]=240,170&coordinates=xxxx,xxx|xxx,xxx

continue_straight
    - Aliases   : continue
    - Type      : (boolean)
    - Note      : Forces the route to keep going straight at waypoints and don't do a uturn even if it would be faster
    - Values    : (true|false)
    - Default   : false
    - Required  : false
    - Example   :
        1. ?continue_straight=true&coordinates=xxxx,xxx|xxx,xxx

number
    - Aliases   : count, total
    - Type      : (int)
    - Note      : Number of nearest segments that should be returned.
                Must be an integer greater than or equal to 1, null for unlimited.
    - Values    : (null|float)
    - Default   : 1
    - Required  : false
    - Example   :
        1. ?number=10&coordinates=xxxx,xxx|xxx,xxx

scale_factor
    - Aliases   :
    - Type      : (int|float)
    - Note      : Multiply the table duration values in the table by this number 
                for more controlled input into a route optimization solver.
                Must be an integer / float greater than or equal to 1, null for disable.
    - Values    : (null|[0-9]+)
    - Default   : null
    - Required  : false
    - Example   :
        1. ?scale_factor=10&coordinates=xxxx,xxx|xxx,xxx
        2. ?scale_factor=1.2&coordinates=xxxx,xxx|xxx,xxx

destinations
    - Aliases   : destination
    - Type      : (int) index array coordinates
    - Note      : An array of index elements (0 <= integer < #coordinates) to use location 
                with given index as destination. Default is to use all.
                index separated by comma.
    - Values    : (int[])
    - Default   : null
    - Required  : false
    - Example   :
        1. ?destinations=0,1&coordinates=xxxx,xxx|xxx,xxx
        2. ?destinations=1&coordinates=xxxx,xxx|xxx,xxx

fallback_speed
    - Aliases   :
    - Type      : (int|float)
    - Note      : Replace null responses in result with as-the-crow-flies estimates based on fallback_speed. 
                Value is in metres/second.
                Must be an integer / float greater than or equal to 1, null for disable.
    - Values    : (null|[0-9]+)
    - Default   : null
    - Required  : false
    - Example   :
        1. ?fallback_speed=10&coordinates=xxxx,xxx|xxx,xxx
        2. ?fallback_speed=1.2&coordinates=xxxx,xxx|xxx,xxx

fallback_coordinate
    - Aliases   :
    - Type      : (string)
    - Note      : Either input (default) or snapped. If using a fallback_speed,
                use either the user-supplied coordinate (input),
                or the snapped coordinate (snapped) for calculating the as-the-crow-flies diestance between two points.
    - Values    : (input|snapped)
    - Default   : input
    - Required  : false
    - Example   :
        1. ?fallback_coordinate=snapped&coordinates=xxxx,xxx|xxx,xxx
        2. ?fallback_coordinate=input&coordinates=xxxx,xxx|xxx,xxx

```

> ROUTE : `/osrm/route` -> [routes/osrm/route/route](routes/osrm/route/route)

**query `coordinates` make sure request has 2 coordinates or more.**


Accepted params:

- `coordinates` : make sure request has 2 coordinates
- `alternatives`:
- `overview`    : use `full` to take full overview recommended
- `geometries`  :
- `annotations` :
- `snapping`    :
- `radiuses`    :
- `bearings`    :
- `approaches`  :
- `steps`       :
- `continue_straight`:


> ROUTE : `/osrm/table` -> [routes/osrm/route/table](routes/osrm/route/table)

**query `coordinates` make sure request has 2 coordinates or more.**


Accepted params:

- `coordinates` : make sure request has 2 coordinates
- `annotations` : only accepted duration, distance or both of them
- `snapping`    :
- `radiuses`    :
- `bearings`    :
- `approaches`  :
- `steps`       :
- `fallback_speed`      :
- `fallback_coordinate` :
- `scale_factor`        : float|int must be greater than 0 
- `destinations`        : index offset coordinates 


> ROUTE : `/osrm/nearest` -> [routes/osrm/route/nearest](routes/osrm/route/nearest)

Accepted params:

- `coordinates` : Just accepted 1 coordinates, if you put order out range coordinates, Engine will be try to search first valid coordinates. 
- `annotations` :
- `snapping`    :
- `number`      :
- `radiuses`    :
- `bearings`    :
- `approaches`  :


- Prefix : `/osrm/polyline`

| PATH              | METHOD        | NOTES                                 |
| ------------------|---------------|---------------------------------------|
| `/decode`         | GET|POST      | Get route by declared coordinates     |


> AVAILABLE PARAMETERS

```
data 
    - Aliases   :
    - Type      : (string)
    - Note      : Decode Polyline to array [latitude, longitude]
    - Values    : polyline
    - Default   : false
    - Required  : false
    - Example   :
        1. ?data=|vxo@y`_oTaE}Ak[leAwHtd@pBbBKvH}GnEwFlQ}LxVaDlOyz@v~Bzb@zRtCdg@lPnMnSrf@z^``@pRnKtLzBd@wBu@mEfGsLgVyP`H_K

```

> ROUTE : `/osrm/polyline/decode` -> [routes/osrm/route/polyline/decode.js](routes/osrm/route/polyline/decode.js)

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
    - Aliases   :
    - Type      : (string)
    - Note      : IP address to get info
    - Values    : (ipv6/4)
    - Default   : (remote ip, eg: 127.0.0.1)
    - Required  : true (for mandatory)
    - Example   :
        1. ?ip=8.8.8.8
        2. ?ip=2001:4860:4860::8888

```

### GEOIP

- Prefix : `/geojson/`

| PATH              | METHOD        | NOTES                              |
| ------------------|---------------|------------------------------------|
| `/country`        | ALL           | Get geo json data all countries.   |
| `/country/{code}` | ALL           | Get by given code or country name. |


> AVAILABLE PARAMETERS


> PLACEHOLDER

```
code
    - Aliases   :
    - Type      : (string)
    - Note      : 3 DIGIT ISO 3166 or country name (case insensitive)
    - Values    : (country code / name)
    - Default   : 
    - Required  : true (for mandatory) and empty to list all default countries.json
    - Example   :
        1. /geojson/country/IDN
        1. /geojson/country/Indonesia

```

## RESPONSE
> ERROR

Error Response determine by http code (please check the http code)

```json
{
  "message": "(string) error message"
}
```

If another key is below of message, it means error information about engine / request.

> OSRM Route Response succeed (200)

Succeed response only contain 1 main key `data`.
And the result is on subtree data, and the main result is on `data.result`


```json
{
    "data": {
        "note": "(string) optionals maybe not shown, cause this is informational",
        "request": {
            "queries": {
                "object_queries_lists[]": "(object) key & data to used on osrm tools. Declare follow by requests"
            }
        },
        "result": {
            "object_result_lists[]": "(object) response result data."
        }
    }
}
```

> GeoJSON By Country Route Response succeed (200)

Succeed response only contain 1 main key `data`.
And the result is on subtree data, and the main result is on `data.result`


```json
{
    "data": {
        "info": {
            "latitude": {
                "minimum": "(float) minimum latitude point.",
                "maximum": "(float) maximum latitude point."
            },
            "longitude": {
                "minimum": "(float) minimum longitude point.",
                "maximum": "(float) maximum longitude point."
            }
        },
        "result": {
            "type": "FeatureCollection",
            "features": {
                "type": "Feature",
                "id": "(string) 3 Digit Country Code",
                "properties": {
                    "name": "(string) Country Name"
                },
                "geometry": {
                    "type": "(string) Polygon Type : MultiPolygon|Polygon",
                    "coordinates": [["(object[]|object) multiple result of coordinates."]]
                }
            }
        }
    }
}
```
