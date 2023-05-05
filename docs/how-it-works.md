# How it works

Explain deduplication using CT id

## Realtime data sync

### Customer creation

A new **customer** created in commercetools will cause a new **profile** created in klaviyo
Trigger subscription message: CustomerCreated

#### Fields mapping

| CT Customer                                                                   | Klaviyo Profile   |
|-------------------------------------------------------------------------------|-------------------|
| firstName                                                                     | first_name        |
| lastName                                                                      | last_name         |
| title                                                                         | title             |
| address.mobile *or* address.phone                                             | phone_number      |
| companyName                                                                   | organisation      |
| id                                                                            | external_id       |
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

### Customer update

...

### Order placed

...

### Order fulfilled

...

### Customer cancelled

...

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
