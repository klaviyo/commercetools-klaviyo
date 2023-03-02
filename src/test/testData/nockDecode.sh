#!/bin/sh
# nock recorded response is returned as gzipped data. Nock is saving this data a hex encoded buffer string.
# To convert to json use this script.
#     ./nockDecode.sh <encoded>

echo $1 | xxd -r -p | gunzip
