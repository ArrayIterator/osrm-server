## OSRM
OSRM API NODEJS

### PREREQUIRES

- UBUNTU Server

- NodeJS ^v10

- Global `node-pre-gyp`, `node-gyp`, `nodemon`


```bash
sudo add-apt-repository ppa:ubuntu-toolchain-r/test

sudo apt-get update -y

sudo apt install build-essential git cmake pkg-config \
libbz2-dev libxml2-dev libzip-dev libboost-all-dev \
lua5.2 liblua5.2-dev libtbb-dev libstdc++-5-dev

```

see [https://github.com/Project-OSRM/osrm-backend](https://github.com/Project-OSRM/osrm-backend)

### DEPENDS NODE

- osrm@^5.22.0
- expresss@^4.1
- maxmind@^4.1.0
- yaml@^1.7.2
- express-group-routes@^1.1.0

### REF URI

- GEOIP : https://db-ip.com/db/lite.php
- OSRM : https://github.com/Project-OSRM/
- OSM : https://openstreetmap.org


### PORT LISTEN

- PORT : `5050` to `5059`

### RUN DAEMON


Running [`daemon.sh`](daemon.sh) as daemon background service :


```bash
setsid daemon.sh >/dev/null 2>&1 < /dev/null &
```


### NGINX CONFIG


```conf

# FILE $domain.vhost.conf
# NGINX NODE UPSTREAM ADD MAX FAILS 3 & FAILED TIMEDOUT 30 SECONDS
upstream node_proxy_osrm {
        least_conn;
        server 127.0.0.1:5050 max_fails=3 fail_timeout=30s;
	server 127.0.0.1:5051 max_fails=3 fail_timeout=30s;
	server 127.0.0.1:5052 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:5053 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:5054 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:5055 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:5056 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:5057 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:5058 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:5059 max_fails=3 fail_timeout=30s;
}
server {
	listen 80;

	# listen 443 ssl http2;
	# ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
	# ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;

	server_name $domain www.$domain;
	default_type text/html;

	# ADD PROXY HEADER
	proxy_set_header X-Forwarded-For $remote_addr;
	# ROOT PATH JUST TO TRY FILES
	root /home/$user/host/$domain/public;

	# INDEX (NOT USED)
	# index '#';

	# ERROR HANDLER
	location = /\#404 {
		add_header Content-Type application/json;
		default_type application/json;
		add_header http 404;
		echo "{\n    \"message\": \"404 Not Found\"\n}";
	}
        location = /\#403 {
                add_header Content-Type application/json;
                default_type application/json;
                add_header http 403;
                echo "{\n    \"message\": \"403 Forbidden\"\n}";
        }
	location = /\#500 {
                add_header Content-Type application/json;
                default_type application/json;
                add_header http 500;
                echo "{\n    \"message\": \"500 Internal Server Error\"\n}";
	}
	location = /\#502 {
                add_header Content-Type application/json;
                default_type application/json;
                add_header http 502;
                echo "{\n    \"message\": \"502 Bad Gateway\"\n}";
	}
	location = /\#504 {
                add_header Content-Type application/json;
                default_type application/json;
                add_header http 504;
                echo "{\n    \"message\": \"504 Gateway Timeout\"\n}";
        }
	# HANDLE ERROR
	error_page 404 /\#404;
	error_page 403 /\#403;
	error_page 500 /\#500;
	error_page 502 /\#502;
	error_page 504 /\#504;
	location @proxy {
		proxy_pass http://node_proxy_osrm;
	}

	# HANDLE LOCATION
	location / {
		try_files $uri @proxy;
	}
}

```
