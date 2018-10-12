#!/usr/bin/env bash

set -e

#<BASH_ORIGIN_LIB_BASE_PATHS>
#</BASH_ORIGIN_LIB_BASE_PATHS>

stream="${2}"
if [ "${stream}" == "" ]; then
    stream="."
fi

if [ -z "${BASH_ORIGIN_LIB_BASE_PATHS[${stream}]}" ]; then
    echo -e "\033[1;31m[bash.origin.lib] ERROR: Cannot get '${1}'. 'BASH_ORIGIN_LIB_BASE_PATHS' for stream '${stream}' not installed!\033[0m" >&2
    exit 1
fi

if [ "$1" == "bin" ]; then
    printf "${BASH_ORIGIN_LIB_BASE_PATHS[${stream}]}/node_modules/.bin"
fi

if [ "$1" == "node_modules" ]; then
    printf "${BASH_ORIGIN_LIB_BASE_PATHS[${stream}]}/node_modules"
fi
