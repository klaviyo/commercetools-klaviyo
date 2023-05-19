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

### Order cancelled

*Trigger*: **order** status updated in commercetools  
*Subscription*: order `ResourceUpdated` message. Configurable with property `order.messages.changed`
and `order.states.changed.cancelledOrder`.    
*Action*: Order cancelled [event created](https://developers.klaviyo.com/en/reference/create_event) in klaviyo. Metric
name configurable with properties `order.states.changed` and `order.metrics`

#### Fields mapping

The field mapping is the same as **Placed order event**.

### Order refunded

*Trigger*: **payment** transaction (with Refund type) related to an order changes state in commercetools  
*Subscription*: payment `TransactionAdded` or `TransactionStateChanged` message. Configurable with property `payment.messages.transactionAdded`/`payment.messages.transactionChanged` and `payment.states.validTransactionStates`.    
*Action*: Order refunded [event created](https://developers.klaviyo.com/en/reference/create_event) in klaviyo. Metric
name configurable with property `order.metrics`

### Category created

| CT Category                         | Klaviyo Category                      |
|-------------------------------------|---------------------------------------|
| `id`                                | `external_id`/`id`                    |
| `name`                              | `name`                                |
| *getCategoryNameWithAncestors*  (1) | `name` (for subcategories)            |

To disable the category created synchronization the CT subscription `CategoryCreated` should not be created.

(1) Category ancestors are checked when applicable to concatenate/format category names into a breadcrumb structure. E. g.: `Women > Pants > Jeans`.

### Category updated

| CT Category                         | Klaviyo Category                      |
|-------------------------------------|---------------------------------------|
| `id`                                | `external_id`/`id`                    |
| `name`                              | `name`                                |
| *getCategoryNameWithAncestors*  (1) | `name` (for subcategories)            |

To disable the category updated synchronization, CT subscriptions should not be created for categories (`ResourceUpdated` message, always enabled when a category subscription exists).

(1) Category ancestors are checked when applicable to concatenate/format category names into a breadcrumb structure. E. g.: `Women > Pants > Jeans`.

### Category deleted

| CT Category                         | Klaviyo Category                      |
|-------------------------------------|---------------------------------------|
| `id`                                | `id`                                  |

To disable the category deleted synchronization, CT subscriptions should not be created for categories (`ResourceDeleted` message, always enabled when a category subscription exists).

### Product deleted

| CT Product                          | Klaviyo Item                          |
|-------------------------------------|---------------------------------------|
| `id`                                | `id`                                  |

To disable the product deleted synchronization, CT subscriptions should not be created for products (`ResourceDeleted` message, always enabled when a product subscription exists).

### Product published

| CT Product                                                             |  Klaviyo Item                  |
|------------------------------------------------------------------------|--------------------------------|
| `id`                                                                   | `external_id`                  |
| *getLocalizedStringAsText(publishedProduct.name)*                      | `title`                        |
| *getLocalizedStringAsText(publishedProduct.description)*  (1)          | `description`                  |
| *getLocalizedStringAsText(publishedProduct.slug)*   (2)                | `url`                          |
| productName.masterVariant.images[0].url                                | `image_full_url`               |
| *getProductPriceByPriority(publishedProduct.masterVariant.prices)*     | `price`                        |
| *getAdditionalLocalizedStringsAsJson(publishedProduct.name)*           | customMetadata.title_json      |
| *getAdditionalLocalizedStringsAsJson(publishedProduct.slug)*           | customMetadata.slug_json       |
| *getAdditionalPricesAsJson(publishedProduct.masterVariant.prices)*     | customMetadata.price_json      |
| *getAdditionalCurrenciesAsJson(publishedProduct.masterVariant.prices)* | customMetadata.currency_json   |

| CT Variant                                                             |  Klaviyo Item                  |
|------------------------------------------------------------------------|--------------------------------|
| `sku`                                                                  | `sku`/`external_id`            |
| *getLocalizedStringAsText(publishedProduct.name)*                      | `title`                        |
| *getLocalizedStringAsText(publishedProduct.description)*  (1)          | `description`                  |
| *getLocalizedStringAsText(publishedProduct.slug)*   (2)                | `url`                          |
| variant.images[0].url                                                  | `image_full_url`               |
| *getProductPriceByPriority(variant.prices)*                            | `price`                        |
| *getAdditionalLocalizedStringsAsJson(publishedProduct.name)*           | customMetadata.title_json      |
| *getAdditionalLocalizedStringsAsJson(publishedProduct.slug)*           | customMetadata.slug_json       |
| *getAdditionalPricesAsJson(variant.prices)*                            | customMetadata.price_json      |
| *getAdditionalCurrenciesAsJson(variant.prices)*                        | customMetadata.currency_json   |

*publishedProduct* always references the current, published set of properties for a product (`product.masterData.current` in commercetools).
*getLocalizedStringAsText* returns the right string based on preferred locale set in environment variables (e.g., `en-US`, or `en` used in this case as a fallback). Otherwise, returns the first string found.
*getProductPriceByPriority* returns the matching price, based on date validity or otherwise first price found (excluding channel/customer groups). Filters by preferred currency if set in evironment variables.
*getAdditional_Something_AsJson* takes a prefix and input data to return an object with properties like `title_en:"some value"`. Useful to get additional strings/prices/currencies besides the default set in base properties.

(1) Only if a description is available, otherwise "None".
(2) Only if `PRODUCT_URL_TEMPLATE` is set in environment variables, otherwise "None".

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
