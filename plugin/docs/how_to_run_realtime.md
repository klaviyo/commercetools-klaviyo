# How to run the real-time events module

The real-time data sync uses commercetools subscription that shares data with the plugin via events on a message queue.

## Infrastructure requirements

### Message queue

A message queue with the right permissions to communicate with the real-time module should be created and configured in
the commercetools subscription as
a [destination](https://docs.commercetools.com/api/projects/subscriptions#destination).  
Check the [commercetools documentation](https://docs.commercetools.com/api/projects/subscriptions#destination) for the
supported queue technologies.  
The plugin supports out-of-the-box *Google Cloud Pub/Sub*, if another message queue is used then view
the [Adapt plugin to different message queues](./plugin-development-customization.md#adapt-plugin-to-different-message-queues)
section.
It is recommended to configure also a Dead-letter queue (DLQ) and set alerts when a message is moved to the DLQ to
handle error scenarios.

### Module deployment

The real-time module plugin can be deployed in different ways:

- Serverless function (AWS Lambda, GCP functions...)
- Container application (Kubernetes, Cloud Run, Fargate...)
- VM (EC2, Compute Engine)
- and more

The realtime module has no state and can scale horizontally to handle increased events from commercetools, serverless
technologies are a good option for this scope.  
In the repository is available a sample Dockerfile that can be used to create a docker image that can be deployed for
example on CloudRun.

#### Environment variables

The real-time module requires all the following environment variables to start:

| NAME             | VALUE                                                                                                                                                                                               | Required | Example                                                                                                                                      |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------|
| CT_API_URL       | *commercetools API url*                                                                                                                                                                             | Yes      | `https://api.us-central1.gcp.commercetools.com`                                                                                              |
| CT_AUTH_URL      | *commercetools AUTH url*                                                                                                                                                                            | Yes      | `https://auth.us-central1.gcp.commercetools.com`                                                                                             |
| CT_PROJECT_ID    | *commercetools project ID*                                                                                                                                                                          | Yes      | `my-project-prod`                                                                                                                            |
| CT_SCOPE         | *commercetools API client scopes. The following scopes are required for the realtime event plugin:* <br /> `view_orders` `view_published_products` `view_products` `view_customers` `view_payments` | Yes      | `view_orders:project-key view_published_products:project-key view_products:project-key view_customers:project-key view_payments:project-key` |
| KLAVIYO_AUTH_KEY | *Klaviyo private api KEY*                                                                                                                                                                           | Yes      | `pk_1234567890`                                                                                                                              |
| CT_API_CLIENT    | *commercetools API client id and secret*                                                                                                                                                            | Yes      | `{"clientId":"the-ct-client-id","secret":"the-ct-client-secret"}`                                                                            |
| APP_TYPE         | `EVENT`                                                                                                                                                                                             | No       | Used to NOT start the bulk import API server                                                                                                 |
| PUB_SUB_PORT     | 6789                                                                                                                                                                                                | No       | To change the default (`6789`) server port for the pubSub push endpoint                                                                      |

[//]: # (| KLAVIYO_COMPANY_ID | *Klaviyo public api KEY*                                                                                                                                                                                                         | `C4VV2d `                                                                                                                                                                           |)

## commercetools project requirements

The following commercetools resources are required for the real-time module to operate with the default configuration:

| commercetools resource type | details                                                                                                             | Description            |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------|------------------------|
| subscription                | `resourceTypeId: "customer"`<br /> `types: ["CustomerCreated"]`                                                     | syncs customer created |
| subscription                | `resourceTypeId: "order"`<br /> `types: ["OrderCreated", "OrderStateChanged", "OrderImported", "OrderCustomerSet"]` | syncs orders           |
| subscription                | `resourceTypeId: "payment"`<br /> `types: ["PaymentTransactionAdded", "PaymentTransactionStateChanged"]`            | syncs order refunded   |
| subscription                | `resourceTypeId: "category"`<br /> `types: ["CategoryCreated"]`                                                     | syncs categories       |
| subscription                | `resourceTypeId: "product"`<br /> `types: ["ProductPublished", "ProductUnpublished"]`                               | syncs products         |

To create a subscription in commercetools check
the [documentation](https://docs.commercetools.com/api/projects/subscriptions#create-subscription), below is available a
sample json request body to create a new subscription.
<details>
  <summary>Sample create subscription request for commercetools</summary>

```json
{
  "key": "klaviyo-customer-created",
  "destination": {
    "type": "GoogleCloudPubSub",
    "projectId": "my-commercetools-project-id",
    "topic": "prod-commercetools-topic"
  },
  "messages": [
    {
      "resourceTypeId": "customer",
      "types": [
        "CustomerCreated"
      ]
    }
  ],
  "changes": [
    {
      "resourceTypeId": "customer"
    }
  ]
}
```

</details>

The subscription destination should reference the message queue, see the [Message queue](#message-queue)
section.  
If the synchronization of one or more events is not required then the corresponding subscription should not be
created.  
It is also possible to create subscriptions in commercetools using Terraform, in the `/infrastructure` directory can be
found an example.

> **_NOTE:_** The *customer updated* and *category updated* events use the commercetools `ResourceUpdated` notification
> type, to disable these events all customer and category subscription should not be enabled or the plugin source code
> should to be updated.
