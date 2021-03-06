#!/usr/bin/env bash

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
NODEMON=$(which nodemon)
LISTENER='listener.js'
# MEMORY TO 128 x 10 = 1280
MAX_MEM_MB=64
DELAY=5

# echo $NODEMON;

if [ "${NODEMON}" = "" ]; then
	echo -e "\033[32mnodemon does not exists\033[0m"
	exit 255;
fi

# Go to pointer
cd $SCRIPTPATH;

#
# set max mem to 256
#
${NODEMON} ${LISTENER} --max-old-space-size=${MAX_MEM_MB} --watch scripts --watch routes --watch config.yaml --watch ${LISTENER} --delay ${DELAY}
