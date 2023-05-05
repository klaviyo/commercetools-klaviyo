# How to run the bulk data import module

The bulk data import module syncs existing Commercetools data into Klaviyo.
A set of API endpoints are provided to trigger the bulk import of customers, orders and product information.
The module queries data in commercetools using the commercetools APIs and synced to klaviyo.

## Infrastructure requirements

### Module deployment

The bulk data import module can be deployed in different ways but in this case NON-serverless
technologies are more suitable for the purpose (see [Timeout problems](#timeout-problems)
and [CPU allocation](#cpu-allocation)). In case the bulk data import
is done one off the plugin could also run from a local machine to avoid additional cloud providers costs.
To avoid that multiple imports of the same type (e.g. orders) are running concurrently, the module creates a lock in
commercetools using [custom objects](https://docs.commercetools.com/api/projects/custom-objects).
The module provides also some APIs to stop a running bulk data import, in order to stop the import the module should
not scale horizontally and only a single instance of the module should be available at any time.

In the repository is available a sample Dockerfile that can be used to create a docker image that can be deployed for
example on CloudRun.

#### Timeout problems

Serverless technologies are typically limited on the maximum execution time. If the amount of data to import is very
large it might take longer than the timeout.  
Possible solutions are:

- Run the module from a local machine if the bulk data import needs to be done one off.
- Use a non serverless deployment service, for example VMs that have CPU always allocated.
- Check the logs of the latest imported item ID before the process timed out and restart the import from that ID by
  using the partial import APIs.

#### CPU allocation

Some serverless technologies (e.g. Cloud Run) by default allocate CPU only during request processing. The bulk import
APIs once called, accept the request and return immediately the HTTP response 202, the import process then runs in
background. In this case the service CPU needs to be allocated all the time to avoid that the background import process
is killed.

#### Environment variables

The bulk data import module requires all the following environment variables to start:

| NAME             | VALUE                                                                                                                                                                                                                            | Example                                                                                                                                                                             |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CT_API_URL       | *commercetools API url*                                                                                                                                                                                                          | `https://api.us-central1.gcp.commercetools.com`                                                                                                                                     |
| CT_AUTH_URL      | *commercetools AUTH url*                                                                                                                                                                                                         | `https://auth.us-central1.gcp.commercetools.com`                                                                                                                                    |
| CT_PROJECT_ID    | *commercetools project ID*                                                                                                                                                                                                       | `my-project-prod`                                                                                                                                                                   |
| CT_SCOPE         | *commercetools API client scopes. The following scopes are required for the realtime event plugin:* <br /> `view_orders` `view_published_products` `view_products` `manage_key_value_documents` `view_customers` `view_payments` | `view_orders:project-key view_published_products:project-key view_products:project-key manage_key_value_documents:project-key view_customers:project-key view_payments:project-key` |
| KLAVIYO_AUTH_KEY | *Klaviyo private api KEY*                                                                                                                                                                                                        | `pk_1234567890`                                                                                                                                                                     |
| CT_API_CLIENT    | *Commercetools API client id and secret*                                                                                                                                                                                         | `{"clientId":"the-ct-client-id","secret":"the-ct-client-secret"}`                                                                                                                   |
| APP_TYPE         | `BULK_IMPORT`                                                                                                                                                                                                                    | this variable is used to NOT start the real-time sync module                                                                                                                        |

### GCP example

TODO add link to sample implementation using terraform and GCP



