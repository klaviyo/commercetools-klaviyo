#!/bin/bash -e

export CONFIG_NAME=${PROJECT_NAME}

export ORG_ID=696327350455
export BILLING_ID=011EF7-3799F6-D698C5

export COMPUTE_REGION=europe-west2
export COMPUTE_ZONE=${COMPUTE_REGION}-c

export TERRAFORM_SERVICE_ACCOUNT=terraform
export TERRAFORM_BUCKET_NAME=${PROJECT_NAME}-terraform-state

export APIS="cloudkms.googleapis.com \
compute.googleapis.com \
cloudresourcemanager.googleapis.com"

export ROLES="roles/iam.serviceAccountUser \
roles/resourcemanager.projectIamAdmin \
roles/cloudkms.admin \
roles/iam.serviceAccountAdmin \
roles/storage.admin \
roles/cloudbuild.builds.editor \
roles/iam.serviceAccountAdmin \
roles/iam.serviceAccountKeyAdmin \
roles/secretmanager.admin \
roles/serviceusage.serviceUsageAdmin \
roles/artifactregistry.admin \
roles/pubsub.admin \
roles/run.admin \
roles/apigateway.admin"

