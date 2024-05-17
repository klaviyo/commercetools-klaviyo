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
- [Available endpoints](#available-endpoints)

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
APIs once called, accepts the request and returns immediately the HTTP response 202, the import process then runs in
background. In this case the service CPU needs to be allocated all the time to prevent the background import process
from being killed.

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
| PRODUCT_URL_TEMPLATE         | `https://example-store.com/products/{{productSlug}}`                                                                                                                                                                                                                    | No       | Set the template used for product URLs in Klaviyo, references frontend URLs (`productSlug` will be replaced by the product slug set in commercetools)  
| PREFERRED_LOCALE         | *your preferred locale for certain localized strings*                                                                                                                                                                                                                   | No       | Set your (optional) preferred locale to be used when getting string from LocalizedString properties, like product/category names for the Klaviyo catalogue
| PREFERRED_CURRENCY         | *your preferred currency for certain price object arrays*                                                                                                                                                                                                                   | No       | Set your (optional) preferred currency to be used when getting prices from products, for Klaviyo catalogue items and custom_metadata

## Available endpoints

| Endpoint             | Purpose                                            | Notes                                                              |
|----------------------|----------------------------------------------------|--------------------------------------------------------------------|
| `/sync/customers`    | Imports all existing customers into Klaviyo        |                                                                    |
| `/sync/orders`       | Imports all applicable orders as Klaviyo events for each customer   | Has a very high rate-limit, unlikely to cause issues                                                  |
| `/sync/categories`   | Imports all categories into Klaviyo Catalog           | Uses basic catalog endpoints from Klaviyo, might rate limit with high category counts   |
| `/sync/products`     | Imports all published products into Klaviyo Catalog   | Uses job-based catalog endpoints from Klaviyo, should hold with large datasets          |

For `/sync/categories` and `/sync/products` there's an option to send the `"deleteAll": true` and `"confirmDeletetion": "products"` (or `"categories"`), to trigger a complete deletion of these resources from the Klaviyo Catalog. Keep in mind this **DOES NOT** differentiate between data that came from the plugin and data that might have been imported/created from another source. This is why both properties are required in body to start the process.

Additionally, all endpoints shown above support adding `/stop` to the URL to cancel the process. This only stops the process, any modifications will not be reverted and any import tasks still running on Klaviyo servers will still complete.

## Running in a local machine

Setting up bulk import to run in a local machine is very straightforward. Just follow these steps:

1. Head to the `plugin` directory and run `yarn install` to install all dependencies.
2. Copy the `.env.test` file to `.env` and set the required environment variables. Remove/change any other variables as needed.
    - `.env.test` may have variables which are not needed for your use case or may be missing some variables. Double check the environment variables above to avoid issues.
3. Run `yarn run start-ts` to start the plugin. The port used for any of the components will be shown in your console.
4. Open Postman or similar, prepare a POST request with the right URL. For example: `http://localhost:6779/sync/customers`.
5. Send the request. If all went well, you should get a `2XX` status code right away.
6. Monitor progress in your console, you'll get a summary of imported/errored items at the end.
    - Errors will be logged along the way, a decently sized console buffer is recommended.
    - Errors similar to `Product with ID <id> does not exist in Klaviyo` are expected, checks are performed before creating/updating items in Klaviyo.

Also, do keep in mind there are sequences/rules that should be followed when importing data:

- Customers and Orders don't have a strict dependency on each other, but importing Customers first is strongly recommended.
- Categories must be imported before Products, since there's a dependency between them.
- Products must have at least one (1) image. Prices are optional, but recommended.
    - Undefined prices will send a price of 0 (zero) to Klaviyo, regardless of currency.
    - If you set `PREFERRED_CURRENCY` you need at least a price to match said currency, otherwise the resulting price will be 0. If not set, the first price found will be picked.
    - Expiration dates which are still within range are preferred over basic prices.
    - Prices with past expiration dates will be ignored. For future dates, the closest one will be used and the rest will be ignored.
- For products, in cases where more than one locale/currency/inventory channel is defined, only one will be chosen and imported based on configuration and priorities.

## Running bulk import on a schedule

The bulk import component is intended to be a one-and-done, despite the fact it can be reused periodically as needed. It doesn't ship with any options to run import jobs on a schedule by default.

Code changes would be needed if this needed to be implemented in code. As a workaround, any tool or combination of tools capable of performing requests on a schedule (e.g.: a combination of `cron` and `curl`) would allow the user to schedule import jobs of any given type.

Regardless of the method use, it's important to keep in mind logs need to be checked manually and certain operations depend on existing data from other operations (see previous section).