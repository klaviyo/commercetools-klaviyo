#!/bin/bash -e

function gcp_login() {
  echo "logging in with $1"
    login_output=$(gcloud auth login $1 2>&1)
    if [[ ! $? ]]
    then
        echo "GCP login failed:"
        echo "$login_output"
        exit 1
    fi
}

function create_project_config() {
    echo "Configuring $2 gcloud config..."
    if [[ ! $(gcloud config configurations list --filter $2 2>&1 | grep $2) ]]
    then 
        echo "$1 gcloud config not found, creating..."
        gcloud config configurations create $2
        gcloud config set account $1
        gcloud config set project $5
        gcloud config set compute/region $3
        gcloud config set compute/zone $4
    else
        echo "Config: $2 config found, activating..."
        gcloud config configurations activate $2
    fi
}
