## NGINX SNIPPETS & BLOCKS

### EXAMPLE

> VIRTUAL HOST USING SNIPPET

```conf
# change /var/www/osrm to app directory
# change ssl_certificate && ssl_certificate_key
# change domain osrm.example.com

include /var/www/osrm/upstream/*.conf;
server {
    listen 80;
    listen 443 ssl http2;
    server_name osrm.example.com;
    root /var/www/osrm/map.dot/public;
    ssl_certificate /etc/ssl/cert.crt;
    ssl_certificate_key /etc/ssl/cert.key;

    set $osrm_upstream_name generated_node_proxy_osrm;
    include /var/www/osrm/snippets/osrm.conf;
}

```

> VIRTUAL HOST WITH GENERATED CONF

```conf

# change /var/www/osrm to app directory
# change ssl_certificate && ssl_certificate_key
# change domain osrm.example.com

include /var/www/osrm/upstream/*.conf;
server {
	listen 80;
	listen 443 ssl http2;
    ssl_certificate /etc/ssl/cert.crt;
    ssl_certificate_key /etc/ssl/cert.key;
	root /var/www/osrm/map.dot/public;
	server_name osrm.example.com;

    # SET DEFAULT MIME TYPE
	default_type text/html;
	# ADD PROXY HEADER
	proxy_set_header X-Forwarded-For $remote_addr;

	# INDEX (NOT USED)
	# index '#';

	# ERROR HANDLER
	location = /\#404 {
		add_header Content-Type application/json;
		default_type application/json;
		add_header http 404;
		echo "{\n	\"message\": \"404 Not Found\"\n}";
	}
	location = /\#403 {
		add_header Content-Type application/json;
		default_type application/json;
		add_header http 403;
		echo "{\n	\"message\": \"403 Forbidden\"\n}";
	}
	location = /\#500 {
		add_header Content-Type application/json;
		default_type application/json;
		add_header http 500;
		echo "{\n	\"message\": \"500 Internal Server Error\"\n}";
	}
	location = /\#502 {
		add_header Content-Type application/json;
		default_type application/json;
		add_header http 502;
		echo "{\n	\"message\": \"502 Bad Gateway\"\n}";
	}
	location = /\#504 {
		add_header Content-Type application/json;
		default_type application/json;
		add_header http 504;
		echo "{\n	\"message\": \"504 Gateway Timeout\"\n}";
	}
	# HANDLE ERROR
	error_page 404 /\#404;
	error_page 403 /\#403;
	error_page 500 /\#500;
	error_page 502 /\#502;
	error_page 504 /\#504;
	location @proxy {
		proxy_pass http://generated_node_proxy_osrm;
	}

	# HANDLE ROOT URI TO NON EXISTENCE TO DIRECT SCRIPT
	location = / {
		try_files /.non-existence-file @proxy;
	}

	# HANDLE LOCATION
	location / {
		try_files $uri @proxy;
	}
}
```