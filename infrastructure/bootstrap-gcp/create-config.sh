#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
pushd $SCRIPT_DIR > /dev/null

source common/usage.sh

export PROJECT_NAME=klaviyo-ct-plugin
export USER_ACCOUNT=$1

source common/vars.sh
source common/utils.sh
source common/create-config.sh
