# klaviyo-ct-plugin

## TODO
* list libraries that can be removed when adapter is not required


## Setup
### GitHub actions
* Create commercetools API client with the following scopes:
  * manage_extensions
  * manage_orders
  * manage_products
  * manage_tax_categories
  * manage_stores
  * manage_project_settings
  * manage_shipping_methods
  * manage_subscriptions
  * manage_types
* Create GCP project with service account key
* Add the following GitHub repository secrets: 
  * `CT_TF_CLIENT_ID`: commercetools client id
  * `CT_TF_SECRET`: commercetools secret
  * `GCP_CREDENTIALS`: google cloud service account key
  * `KLAVIYO_AUTH_KEY`: the klaviyo private key

## Local development

### Running terraform locally
- Authenticate to Google Cloud platform using the terraform service account key:
```shell
gcloud auth activate-service-account terraform@klaviyo-ct-plugin.iam.gserviceaccount.com --key-file=/Users/roberto.losanno/work/klaviyo/gcp/klaviyo-ct-plugin-a5c9b42d8e43.json --project=klaviyo-ct-plugin
```
Create a new file `infrastructure/environment/credentials.tfvars` with the following content:
```shell
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
gcloud run services update app \
--image us-central1-docker.pkg.dev/klaviyo-test-roberto/klaviyo-ct-plugin/klaviyo-ct-plugin \
--region=us-central1 \
--port 6789 \
--max-instances=5 \
--update-env-vars KLAVIYO_AUTH_KEY=<the-klaviyo-api-key>
```

## Security
The klaviyo API key is passed via environment variable. When deployed on the cloud use your cloud specific secrets manager to store and retrieve the key.
