#!/bin/bash -e

create_project_config ${USER_ACCOUNT} ${CONFIG_NAME} ${COMPUTE_REGION} ${COMPUTE_ZONE} ${PROJECT_NAME}
gcp_login ${USER_ACCOUNT}

echo "Configuring project: ${PROJECT_NAME}..."
if [[ ! $(gcloud projects list --filter ${PROJECT_NAME} 2>&1 | grep ${PROJECT_NAME}) ]]
then
    echo "Project ${PROJECT_NAME} not found, creating..."
    gcloud projects create ${PROJECT_NAME} --organization ${ORG_ID}
    gcloud beta billing projects link ${PROJECT_NAME} --billing-account ${BILLING_ID}
else
    echo "Project ${PROJECT_NAME} already exists, skipping..."
fi

echo "Enabling APIs..."
for api in ${APIS[@]}; do
    if gcloud services list --enabled | grep --quiet $api; then
        echo "API: $api is already enabled"
    else
        gcloud services enable $api
    fi
done

echo "Configuring service account: ${TERRAFORM_SERVICE_ACCOUNT}..."
if [[ ! $(gcloud iam service-accounts list --filter ${TERRAFORM_SERVICE_ACCOUNT} 2>&1 | grep ${TERRAFORM_SERVICE_ACCOUNT}) ]]
then
    echo "Creating the ${TERRAFORM_SERVICE_ACCOUNT} service account..."
    gcloud iam service-accounts create ${TERRAFORM_SERVICE_ACCOUNT} --display-name "Terraform Service User"
    gcloud projects add-iam-policy-binding ${PROJECT_NAME} --member serviceAccount:${TERRAFORM_SERVICE_ACCOUNT}@${PROJECT_NAME}.iam.gserviceaccount.com --role roles/viewer
else
    echo "Service account: ${TERRAFORM_SERVICE_ACCOUNT} already exists, skipping..."
fi

echo "Configuring storage bucket for terraform state..."
if ! gsutil ls gs://${TERRAFORM_BUCKET_NAME} > /dev/null 2>&1;
then
    echo "Creating the ${TERRAFORM_BUCKET_NAME} bucket..."
    gsutil mb -p ${PROJECT_NAME} -l ${COMPUTE_REGION} gs://${TERRAFORM_BUCKET_NAME}

    gsutil versioning set on gs://${TERRAFORM_BUCKET_NAME}
    gsutil bucketpolicyonly set on gs://${TERRAFORM_BUCKET_NAME}

    gsutil iam ch serviceAccount:${TERRAFORM_SERVICE_ACCOUNT}@${PROJECT_NAME}.iam.gserviceaccount.com:roles/storage.admin gs://${TERRAFORM_BUCKET_NAME}
else
    echo "Bucket: ${TERRAFORM_BUCKET_NAME} already exists, skipping..."
fi

echo "Configuring permissions for terraform"
for role in ${ROLES[@]}; do
    echo -n "Adding role $role: "
    gcloud projects add-iam-policy-binding ${PROJECT_NAME} --format=none --member serviceAccount:${TERRAFORM_SERVICE_ACCOUNT}@${PROJECT_NAME}.iam.gserviceaccount.com --role $role
done
