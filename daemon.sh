#!/usr/bin/env bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
NODEMON=$(which nodemon)
echo $NODEMON;

if [ "${NODEMON}" = "" ]; then
	echo -e "\033[32mnodemon does not exists\033[0m"
	exit;
fi

# Go to pointer
cd $SCRIPTPATH;
#
# set max mem to 256
#

$(which nodemon) listener.js --max-old-space-size=256 --watch scripts --watch routes --watch config.yaml --watch http.js
