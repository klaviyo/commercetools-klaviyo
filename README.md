# klaviyo-ct-plugin

![Deployment status](https://github.com/e2x/klaviyo-ct-plugin/actions/workflows/plugin-deploy.yml/badge.svg)

The [Klaviyo](https://www.klaviyo.com/) plugin for [commercetools](https://commercetools.com/) is a Node.js application
that provides support to sync Commercetools data with Klaviyo.

The plugin gets data from commercetools in two different ways:

- **Realtime data** - [Commercetools subscriptions](https://docs.commercetools.com/api/projects/subscriptions) are used
  to sync asynchronously data into Klaviyo in response to an event on commercetools.
- **Historical data** - A set of API endpoints are provided to manually trigger the data synchronization into Klaviyo.
  Typical use case include sync of old orders into Klaviyo, synchronization of the product catalogue...

![Klaviyo CT Plugin architecture](./docs/img/arch_diagram.png "Klaviyo Commercetools Plugin Architecture")

## Supported features

Real time data sync from commercetools:

- Customer creation
- Customer update
- Order placed
- Order cancelled
- Order fulfilled

Historical data sync from commercetools:

- Orders
- Product catalogue
- Customers

## Plugin installation

TODO

## Plugin development

See [plugin development documentation](docs/plugin-development.md)

## Plugin integration details

### Realtime events

| Commercetools event | Commercetools subscription event                        | Klaviyo request                                                                                                                                       |
|---------------------|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Customer Created    | `CustomerCreated`                                       | Profiles [create](https://developers.klaviyo.com/en/reference/create_profile) or [update](https://developers.klaviyo.com/en/reference/update_profile) |
| Customer Updated    | `ResourceUpdated` > `customer`                          | Profiles [update](https://developers.klaviyo.com/en/reference/update_profile)                                                                         |
| Order created       | `OrderCreated` or `OrderImported` or `OrderCustomerSet` | Events [create event](https://developers.klaviyo.com/en/reference/create_event)                                                                       |
| Order state changed | `OrderStateChanged`                                     | Events [create event](https://developers.klaviyo.com/en/reference/create_event)                                                                       |
| Order refunded      | TODO                                                    | Events [create event](https://developers.klaviyo.com/en/reference/create_event)                                                                       |

## Plugin customization

### Configuration

It is possible to change the default behaviour of the plugin by customising the default configuration.  
The configuration files can be found in the `/config` directory.  
The configuration can be different per environment (the env variable `NODE_ENV` is used to select the
current environment), check the [node-config](https://github.com/node-config/node-config#readme) library for more info.

#### Configuration options

| Property                              | Default   | Description                                                                                                                                                                                                                                                       |
|---------------------------------------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `order.states.changed.cancelledOrder` | Cancelled | The commercetools `order.orderState` value that triggers an [Cancelled Order](https://developers.klaviyo.com/en/docs/guide_to_integrating_a_platform_without_a_pre_built_klaviyo_integration#fulfilled-order-cancelled-order-and-refunded-order) event in klaviyo |
| ....                                  | ...       | TODO                                                                                                                                                                                                                                                              |

#### Dummy services

Some functionalities are specific to the environment where the plugin is installed or different third party service can
be used. For this reason we provided only the interface of the service with a sample implementation.

| Service           | Sample implementation                           | Description                                                                                                                                                                                                                            |
|-------------------|-------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `CurrencyService` | `src/domain/services/defaultCurrencyService.ts` | Order amounts can be available in different currencies. In order to have a meaningful representation of the data, all amounts should be converted in a single currency. This service should implement the logic to convert currencies. |

### Error handling

#### commercetools subscriptions

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

### Security

The klaviyo API key is passed via an environment variable. When deployed on the cloud, use your cloud specific secrets
manager to store and retrieve the key.

## TODO

* list libraries that can be removed when adapter is not required
