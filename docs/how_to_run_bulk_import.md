# How to run the Bulk Data Import module

The Bulk Data Import module syncs existing commercetools data into Klaviyo. It queries data held in commercetools via
it's APIs and sync the data to Klaviyo. A set of API endpoints are provided to trigger the bulk import of customers,
orders and product information.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Infrastructure requirements](#infrastructure-requirements)
  - [Serverless Limitations](#serverless-limitations)
    - [Timeout problems](#timeout-problems)
    - [CPU allocation](#cpu-allocation)
  - [Environment variables](#environment-variables)
- [GCP example](#gcp-example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Infrastructure requirements

The Bulk Data Import module can be deployed in different ways, however due to it's potentially long-running nature it
is less suited to serverless environments (see [Timeout problems](#timeout-problems) and [CPU allocation](#cpu-allocation)).

Management APIs are provided that allow an ongoing import to be terminated. To avoid multiple imports of the same type
(e.g. orders) running concurrently, the module creates a lock in commercetools using [custom objects](https://docs.commercetools.com/api/projects/custom-objects).

A sample Dockerfile is available in this repository that can be used to create a docker image that can be deployed
for example on CloudRun. Note that horizontally scaling the Bulk Data Import module should be avoided. If Bulk Data
Import is only expected to be run as a one-off or ad-hoc process, it can even be run on a local machine.

### Serverless Limitations

#### Timeout problems

Serverless technologies are typically limited on the maximum execution time. If the amount of data to import is very
large it might take longer than the timeout.  
Possible solutions are:

- Run the module from a local machine if the bulk data import needs to be done one off.
- Use a non-serverless deployment service, for example VMs that have CPU always allocated.
- Check the logs of the latest imported item ID before the process timed out and restart the import from that ID by
  using the partial import APIs.

#### CPU allocation

Some serverless technologies (e.g. Cloud Run) by default allocate CPU only during request processing. The bulk import
APIs once called, accept the request and return immediately the HTTP response 202, the import process then runs in
background. In this case the service CPU needs to be allocated all the time to avoid that the background import process
is killed.

### Environment variables

The bulk data import module requires all the following environment variables to start:
 
| NAME             | VALUE                                                                                                                                                                                                                            | Required | Example                                                                                                                                                                             |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CT_API_URL       | *commercetools API url*                                                                                                                                                                                                          | Yes      | `https://api.us-central1.gcp.commercetools.com`                                                                                                                                     |
| CT_AUTH_URL      | *commercetools AUTH url*                                                                                                                                                                                                         | Yes      | `https://auth.us-central1.gcp.commercetools.com`                                                                                                                                    |
| CT_PROJECT_ID    | *commercetools project ID*                                                                                                                                                                                                       | Yes      | `my-project-prod`                                                                                                                                                                   |
| CT_SCOPE         | *commercetools API client scopes. The following scopes are required for the realtime event plugin:* <br /> `view_orders` `view_published_products` `view_products` `manage_key_value_documents` `view_customers` `view_payments` | Yes      | `view_orders:project-key view_published_products:project-key view_products:project-key manage_key_value_documents:project-key view_customers:project-key view_payments:project-key` |
| KLAVIYO_AUTH_KEY | *Klaviyo private api KEY*                                                                                                                                                                                                        | Yes      | `pk_1234567890`                                                                                                                                                                     |
| CT_API_CLIENT    | *Commercetools API client id and secret*                                                                                                                                                                                         | Yes      | `{"clientId":"the-ct-client-id","secret":"the-ct-client-secret"}`                                                                                                                   |
| APP_TYPE         | `BULK_IMPORT`                                                                                                                                                                                                                    | No       | Prevents the real-time sync module from being started                                                                                                                               |
| PUB_SUB_PORT     | 6779                                                                                                                                                                                                                             | No       | To change the default (`6779`) bulk import API server port                                                                                                                          |                                                                                                                                                                                                                         | No       | To change the default (`6779`) bulk import API server port                                   |
