#!/bin/bash -e

function usage() {
    echo
    echo "Usage: $0 <gcp-username>"
    echo
}

if [[ $# -lt 1 ]]
then
    usage
    exit 1
fi
