# How it works

[//]: # (Explain deduplication using CT id)

## Realtime data sync

### Customer creation

*Trigger*: **customer** created in commercetools  
*Subscription*: `CustomerCreated` message  
*Action*: [profile created](https://developers.klaviyo.com/en/reference/create_profile) in klaviyo

#### Fields mapping

| CT Customer                                                                   | Klaviyo Profile   |
|-------------------------------------------------------------------------------|-------------------|
| id                                                                            | external_id       |
| email *                                                                       | email             |
| firstName                                                                     | first_name        |
| lastName                                                                      | last_name         |
| title                                                                         | title             |
| address.mobile *or* address.phone                                             | phone_number      |
| companyName                                                                   | organisation      |
| address.apartment, address.building, address.streetNumber, address.streetName | location.address1 |
| address.additionalStreetInfo, address.additionalAddressInfo                   | location.address2 |
| address.city                                                                  | location.city     |
| address.country                                                               | location.country  |
| address.region                                                                | location.region   |
| address.zip                                                                   | location.zip      |
| custom                                                                        | properties        |

The commercetools `address` is selected using the following priority rules:

1. `customer.defaultBillingAddressId`
2. first available `customer.billingAddressIds`
3. first available `customer.addresses`

To disable the customer creation synchronization the CT subscription `CustomerCreated` should not be created.
If the CT message field `payloadNotIncluded` is set to true, the plugin will get the customer data using the
commercetools API.

&ast; Mandatory field, if not present the commercetools event is ignored.

### Customer update

*Trigger*: **customer** updated in commercetools  
*Subscription*: `Customer > ResourceUpdated` message  
*Action*: [profile created]((https://developers.klaviyo.com/en/reference/create_profile))
or [profile updated](https://developers.klaviyo.com/en/reference/update_profile) in klaviyo.

#### Fields mapping

| CT Customer                                                                   | Klaviyo Profile   |
|-------------------------------------------------------------------------------|-------------------|
|                                                                               | id (1)            |
| id                                                                            | external_id       |
| firstName                                                                     | first_name        |
| lastName                                                                      | last_name         |
| title                                                                         | title             |
| address.mobile *or* address.phone                                             | phone_number      |
| companyName                                                                   | organisation      |
| address.apartment, address.building, address.streetNumber, address.streetName | location.address1 |
| address.additionalStreetInfo, address.additionalAddressInfo                   | location.address2 |
| address.city                                                                  | location.city     |
| address.country                                                               | location.country  |
| address.region                                                                | location.region   |
| address.zip                                                                   | location.zip      |
| custom                                                                        | properties        |

(1) In order to get the Klaviyo profile `id` used required to update the profile, the plugin queries the profile in
Klaviyo by `external_id`. If the queried `profile` doesn't exist in Klaviyo then it is created.  
To disable the customer update synchronization all the CT subscription on the resource type `Customer` should not be
created.

### Order placed

*Trigger*: **order** created in commercetools  
*Subscription*: `OrderCreated` or `OrderImported` or `OrderCustomerSet` message. Configurable with
property `order.messages.created`  
*Action*:

* Placed Order [event created](https://developers.klaviyo.com/en/reference/create_event) in klaviyo. Metric name
  configurable with property `order.metrics.placedOrder`
* Ordered Product [event/s created](https://developers.klaviyo.com/en/reference/create_event) in klaviyo. Metric name
  configurable with property `order.metrics.orderedProduct`

#### Fields mapping

##### Placed order event

| CT Order                            | Klaviyo event           |
|-------------------------------------|-------------------------|
| `id`                                | `unique_id`             |
| `createdAt`                         | `time`                  |
| `totalPrice`                        | `value`                 |
| `customerId`                        | profile.id              |
| `customerEmail`                     | profile.email           |
| *mapCTAddressToKlaviyoLocation* (1) | profile.*               |
| *allowedProperties* (2)             | `properties.*`          |
| *itemNames* (3)                     | `properties.ItemNames`  |
| *productCategories* (4)             | `properties.Categories` |

To disable the order placed synchronization the CT subscription `OrderCreated`, `OrderImported`, `OrderCustomerSet`
should not be created.  
If the CT message field `payloadNotIncluded` is set to true, the plugin will get the order data using the commercetools
API.

(1) the klaviyo profile location information are mapped from the `order.billingAddress` using the same logic of the
Customer Created event
(2) all the commercetools order properties are passed in the klaviyo event `properties` field. It is possible to define
only the properties to include with the configuration property `order.properties.include`, the properties to exclude
with `order.properties.exclude` and rename properties using `order.properties.map`.
(3) Array of strings with the ordered product names. Includes `lineItems` and `customLineItems`
(4) Array of strings with the product category names, including category ancestors.

&ast; Mandatory field, if not present the commercetools event is ignored.

##### Ordered product event

An event is sent for each order line.

| CT Order                            | Klaviyo event  |
|-------------------------------------|----------------|
| `lineItem.id`,                      | `unique_id`    |
| `createdAt`                         | `time`         |
| `lineItem.totalPrice`               | `value`        |
| `customerId`                        | profile.id     |
| `customerEmail`                     | profile.email  |
| *mapCTAddressToKlaviyoLocation* (1) | profile.*      |
| all lineItem properties             | `properties.*` |

### Order fulfilled

*Trigger*: **order** status updated in commercetools  
*Subscription*: order `ResourceUpdated` message. Configurable with property `order.messages.changed`
and `order.states.changed.fulfilledOrder`.  
*Action*: Order fulfilled [event created](https://developers.klaviyo.com/en/reference/create_event) in klaviyo. Metric
name configurable with properties `order.states.changed` and `order.metrics`

#### Fields mapping

The field mapping is the same as **Placed order event**.

### Customer cancelled

*Trigger*: **order** status updated in commercetools  
*Subscription*: order `ResourceUpdated` message. Configurable with property `order.messages.changed`
and `order.states.changed.cancelledOrder`.    
*Action*: Order fulfilled [event created](https://developers.klaviyo.com/en/reference/create_event) in klaviyo. Metric
name configurable with properties `order.states.changed` and `order.metrics`

### Customer refunded

...

### Category created

...

### Category updated

...

### Category deleted

...

### Product deleted

...

## Bulk data import

Swagger definition

<details>
  <summary>Swagger definition of the bulk import endpoints</summary>

```yaml
swagger: '2.0'
info:
  title: dev-bulk-import klaviyo CT plugin for commercetools bulk import API
  description: Sample API on API Gateway with a Cloud Run backend
  version: 1.0.0
schemes:
  - https
produces:
  - application/json
paths:
  /sync/orders:
    post:
      summary: Sync all commercetools orders to Klaviyo
      operationId: sync-orders
      parameters:
        - in: body
          name: Parameters
          description: Optional parameters for the bulk import job
          schema:
            type: object
            properties:
              ids:
                type: array
                items:
                  type: string
      responses:
        '202':
          description: Request accepted
          schema:
            type: string
  /sync/orders/stop:
    post:
      summary: Stop syncing all commercetools orders to Klaviyo
      operationId: sync-orders-stop
      responses:
        '200':
          description: Request accepted
          schema:
            type: string
  /sync/customers:
    post:
      summary: Sync all commercetools customers to Klaviyo
      operationId: sync-customers
      parameters:
        - in: body
          name: Parameters
          description: Optional parameters for the bulk import job
          schema:
            type: object
            properties:
              ids:
                type: array
                items:
                  type: string
      responses:
        '202':
          description: Request accepted
          schema:
            type: string
  /sync/customers/stop:
    post:
      summary: Stop syncing all commercetools customers to Klaviyo
      operationId: sync-customers-stop
      responses:
        '200':
          description: Request accepted
          schema:
            type: string
  /sync/categories:
    post:
      summary: Sync all commercetools categories to Klaviyo
      operationId: sync-categories
      parameters:
        - in: body
          name: Parameters
          description: Optional parameters for the bulk import job
          schema:
            type: object
            properties:
              deleteAll:
                type: boolean
              confirmDeletion:
                type: string
      responses:
        '202':
          description: Request accepted
          schema:
            type: string
  /sync/categories/stop:
    post:
      summary: Stop syncing all commercetools categories to Klaviyo
      operationId: sync-categories-stop
      responses:
        '200':
          description: Request accepted
          schema:
            type: string
  /sync/products:
    post:
      summary: Sync all commercetools products to Klaviyo
      operationId: sync-products
      responses:
        '202':
          description: Request accepted
          schema:
            type: string
  /sync/products/stop:
    post:
      summary: Stop syncing all commercetools products to Klaviyo
      operationId: sync-products-stop
      responses:
        '200':
          description: Request accepted
          schema:
            type: string
```

</details>

| Operation              | Endpoint                     | Request body                              | Description                                                                                                                                       |
|------------------------|------------------------------|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Sync all customers     | [post] /sync/customers       | `<empty>`                                 | Synchronizes all customers                                                                                                                        |
| Stop customers sync    | [post] /sync/customers/stop  | `<empty>`                                 | Stops the running customers synchronization                                                                                                       |
| Sync all orders        | [post] /sync/orders          | `<empty>`                                 | Synchronizes all orders, creates in klaviyo the following events: Order placed, Ordered Product, Order cancelled, Order fulfilled, Order refunded |
| Stop orders sync       | [post] /sync/orders/stop     | `<empty>`                                 | Stops the running orders synchronization                                                                                                          |
| Sync all categories    | [post] /sync/categories      | `<empty>`                                 | Synchronizes all categories                                                                                                                       |
| Stop categories sync   | [post] /sync/categories/stop | `<empty>`                                 | Stops the running categories synchronization                                                                                                      |
| Sync all products      | [post] /sync/products        | `<empty>`                                 | Synchronizes all products                                                                                                                         |
| Partial customers sync | [post] /sync/customers       | ```{"ids": "order-id-1", "order-id-2"}``` | Synchronizes the provided list of order ids                                                                                                       |
| Partial orders sync    | [post] /sync/orders          | ```{"ids": "order-id-1", "order-id-2"}``` | Synchronizes all provided list of customer ids                                                                                                    |

All endpoints return the HTTP response code `202` when the request is accepted and the data synchronization happens in
background.  
If another synchronization is already in progress the endpoint returns the HTTP status code `409`
