# klaviyo-ct-plugin

![Deployment status](https://github.com/e2x/klaviyo-ct-plugin/actions/workflows/plugin-deploy.yml/badge.svg)

The [Klaviyo](https://www.klaviyo.com/) plugin for [commercetools](https://commercetools.com/) is a Node.js application
that provides support to sync Commercetools data with Klaviyo.

The plugin gets data from commercetools in two different ways:

- **Realtime data** - [Commercetools subscriptions](https://docs.commercetools.com/api/projects/subscriptions) are used
  to sync asynchronously data into Klaviyo in response to an event (order creation, customer creation...) on commercetools.
- **Bulk import** - A set of API endpoints are provided to manually trigger the data synchronization into Klaviyo.
  Typical use case include sync of old orders into Klaviyo, synchronization of the product catalogue...

![Klaviyo CT Plugin architecture](./docs/img/arch_diagram.png "Klaviyo Commercetools Plugin Architecture")

## Supported features

Real time data sync:

- Customer creation
- Customer update
- Order placed
- Order cancelled
- Order fulfilled

Bulk data import:

- Orders
- Product catalogue
- Customers

Check [data flow](docs/plugin-development-customization.md#data-flow) for all the details about the data exchanged between commercetools and klaviyo.

## Plugin installation

See [plugin installation documentation](docs/plugin-installation.md)


## Plugin development and customization

See [plugin development and customization documentation](docs/plugin-development-customization.md)

## TODO

* list libraries that can be removed when adapter is not required
