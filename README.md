# klaviyo-ct-plugin
The [Klaviyo](https://www.klaviyo.com/) plugin for the integration with [commercetools](https://commercetools.com/).

## Cloud environment setup

### Google Cloud project
Run the bootstrap-gcp scripts to setup a new project in GCP (you need project creation rights)
```shell
cd insfrastructure/bootstrap-gcp
```
```shell
./bootstrap.sh <your-user-account>
```
The script will generate a new `terraform` service account. Create a service account key that will be used in GitHub. 

### Configuration of the pipelines in GitHub actions

#### GitHub configuration
* Create a commercetools API client with the following scopes:
  * manage_extensions
  * manage_orders
  * manage_products
  * manage_tax_categories
  * manage_stores
  * manage_project_settings
  * manage_shipping_methods
  * manage_subscriptions
  * manage_types
* Add the following GitHub repository secrets:
  * `CT_TF_CLIENT_ID`: commercetools client id
  * `CT_TF_SECRET`: commercetools secret
  * `GCP_CREDENTIALS`: google cloud service account key
  * `KLAVIYO_AUTH_KEY`: the klaviyo private key

#### Pipelines
The following pipelines are available in `.github/workflows`
- `terraform.yml`
  - commercetools setup:
    - subscriptions
    - test data: stores, project settings, shipping methods, taxes, product types
  - GCP setup:
    - CloudRun instance
    - Pub/Sub topic
    - Permissions
- `plugin-build-test.yml`
  - runs build, linting and tests
- `plugin-deploy` 
  - build the plugin code in a docker container
  - deploy of the container to a cloud run instance

## Local development

Software required:
* Node.js v18
* yarn

Install dependencies:
```shell
yarn 
```

To run integration tests locally create in the root of the project a new file names `.env` with the klaviyo auth key:
```dotenv
KLAVIYO_AUTH_KEY=<the-klaviyo-auth-key>
```

Run tests:
```shell
yarn test
```

### Running terraform locally
- Authenticate to Google Cloud platform using the terraform service account key:
```shell
gcloud auth activate-service-account terraform@klaviyo-ct-plugin.iam.gserviceaccount.com --key-file=/Users/roberto.losanno/work/klaviyo/gcp/klaviyo-ct-plugin-a5c9b42d8e43.json --project=klaviyo-ct-plugin
```
Create a new file `infrastructure/environment/credentials.tfvars` with the following content:
```terraform
ct_client_id = "<add-your-commercetools-client-id>"
ct_secret    = "<add-your-commercetools-secret>"
  ```
```shell
cd infrastructure
```
```shell
./terraform.sh apply dev
```

### Build and deployment to cloud run
Authenticate with Google Cloud platform.  

Authenticate with your google account if owner of the project
```shell
#run only once
gcloud auth application-default login
```
OR authenticate with service account key
```shell
gcloud auth activate-service-account terraform@klaviyo-ct-plugin.iam.gserviceaccount.com --key-file=/Users/roberto.losanno/work/klaviyo/gcp/klaviyo-ct-plugin-a5c9b42d8e43.json --project=klaviyo-ct-plugin    

#export GOOGLE_APPLICATION_CREDENTIALS=~/path-to-you-service-acccount-key.json
```

```shell
#run only once
gcloud auth configure-docker us-central1-docker.pkg.dev
```
```shell
docker build -t klaviyo-ct-plugin .
```  
```shell
docker tag klaviyo-ct-plugin us-central1-docker.pkg.dev/klaviyo-test-roberto/klaviyo-ct-plugin/klaviyo-ct-plugin
```    
```shell
docker push us-central1-docker.pkg.dev/klaviyo-test-roberto/klaviyo-ct-plugin/klaviyo-ct-plugin
```  
```shell
gcloud run services update dev-klaviyo-ct-plugin \
--image us-central1-docker.pkg.dev/klaviyo-test-roberto/klaviyo-ct-plugin/klaviyo-ct-plugin \
--region=us-central1 \
--port 6789 \
--max-instances=5 \
--update-env-vars KLAVIYO_AUTH_KEY=<the-klaviyo-api-key>
```

## Security
The klaviyo API key is passed via environment variable. When deployed on the cloud use your cloud specific secrets manager to store and retrieve the key.

## TODO
* list libraries that can be removed when adapter is not required
