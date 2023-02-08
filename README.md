# klaviyo-ct-plugin

The [Klaviyo](https://www.klaviyo.com/) plugin for the integration with [commercetools](https://commercetools.com/).

![Deployment status](https://github.com/e2x/klaviyo-ct-plugin/actions/workflows/plugin-deploy.yml/badge.svg)

## Infrastructure

In this sample implementation, we used Google Cloud Platform (GCP) to host the plugin.
A single GCP project is created `klaviyo-ct-plugin` which hosts two environments separated by namespace (each
environment specific resource is prefixed with the environment name `dev` or `prod`).
The plugin is built into a docker image and deployed on [GCP Cloud Run](https://cloud.google.com/run).
Commercetools subscriptions are configured via Terraform and communicate to the plugin using a
single [GCP pub/sub](https://cloud.google.com/pubsub) topic.
For all the details about the infrastructure configuration check
the [infrastructure documentation](docs/infrastructure.md)

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

## Error handling

### commercetools subscriptions

commercetools events are sent on the configured queue and consumed by the plugin.  
The event is filtered, transformed and sent to klaviyo using the `processEvent` method.   
The following outcomes are possible:

1. Message sent correctly: klaviyo has accepted the request, and the `processEvent` method returns `status: "OK"`. In
   this
   case the messages should be acknowledged and removed from the queue.
2. Message invalid: klaviyo returned a `4xx` error, the request is invalid or unauthenticated. The `processEvent` method
   logs
   the error and returns `status: "4xx"`, this value can be used to build the custom logic to handle the error, for
   example, to create
   alerts, send a message to a DLQ...
3. Exception: klaviyo returned a `5xx` error, this might be caused by a temporary glitch with the klaviyo API server and
   typically the request should be retried.
   The `processEvent` method throws an error. The `processEvent` caller should catch the error and not acknowledge the
   message to the queue, so that the message can be reprocessed later.

## Security

The klaviyo API key is passed via an environment variable. When deployed on the cloud, use your cloud specific secrets
manager to store and retrieve the key.

## TODO

* list libraries that can be removed when adapter is not required
