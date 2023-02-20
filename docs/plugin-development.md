# Plugin development

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

## Infrastructure

In this sample implementation, we used Google Cloud Platform (GCP) to host the plugin.
A single GCP project is created `klaviyo-ct-plugin` which hosts two environments separated by namespace (each
environment specific resource is prefixed with the environment name `dev` or `prod`).
The plugin is built into a docker image and deployed on [GCP Cloud Run](https://cloud.google.com/run).
Commercetools subscriptions are configured via Terraform and communicate to the plugin using a
single [GCP pub/sub](https://cloud.google.com/pubsub) topic.
For all the details about the infrastructure configuration check
the [infrastructure documentation](docs/infrastructure.md)

### Running terraform locally

Use an existing service account key or generate a new one:

```shell
gcloud iam service-accounts keys create ./klaviyo-gcp-key.json --iam-account terraform@klaviyo-ct-plugin.iam.gserviceaccount.com
```

- Authenticate to Google Cloud platform using the terraform service account key:

```shell
gcloud auth activate-service-account terraform@klaviyo-ct-plugin.iam.gserviceaccount.com --key-file=/path-to-your-key/klaviyo-ct-plugin-a5c9b42d8e43.json --project=klaviyo-ct-plugin
```

Add environment variable:
`export GOOGLE_APPLICATION_CREDENTIALS=~/path-to-your-key/klaviyo-ct-plugin-a5c9b42d8e43.json`

Create a new file `infrastructure/environment/credentials.tfvars` with the following content:

```terraform
ct_client_id     = "<add-your-commercetools-client-id>"
ct_secret        = "<add-your-commercetools-secret>"
klaviyo_auth_key = "<add-your-klaviyo-auth-key>"
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
docker tag klaviyo-ct-plugin us-central1-docker.pkg.dev/klaviyo-ct-plugin/docker-repo/klaviyo-ct-plugin
```    

```shell
docker push us-central1-docker.pkg.dev/klaviyo-ct-plugin/docker-repo/klaviyo-ct-plugin
```  

```shell
gcloud run services update dev-klaviyo-ct-plugin \
--image us-central1-docker.pkg.dev/klaviyo-ct-plugin/docker-repo/klaviyo-ct-plugin \
--region=us-central1 \
--port 6789 \
--max-instances=5 \
--update-secrets=KLAVIYO_AUTH_KEY=klaviyo_auth_key:latest \
--update-secrets=CT_API_CLIENT=commercetools_api_client:latest
```

## End-to-end tests

To write and run end-to-end tests check the [documentation](docs/e2e-tests.md)
