# klaviyo-ct-plugin

![Deployment status](https://github.com/e2x/klaviyo-ct-plugin/actions/workflows/plugin-deploy.yml/badge.svg)

The [Klaviyo](https://www.klaviyo.com/) plugin for [commercetools](https://commercetools.com/) is a Node.js application
that provides support to sync Commercetools data with Klaviyo.

The plugin syncs data from commercetools in two different ways:

- **Realtime data** - [Commercetools subscriptions](https://docs.commercetools.com/api/projects/subscriptions) are used
  to sync asynchronously data into Klaviyo in response to an event (order creation, customer creation...) on
  commercetools.
- **Bulk import** - A set of API endpoints are provided to manually trigger the data synchronization into Klaviyo.
  Typical use cases include the sync of old orders and customers into Klaviyo, or the synchronization of the product
  catalogue. This is typically done when installing the plugin for the first time but can also be done periodically if
  the data goes out of sync for any reason.

![Klaviyo CT Plugin architecture](./docs/img/arch_diagram.png "Klaviyo Commercetools Plugin Architecture")

## Supported features

Real-time data sync:

- Customer creation
- Customer update
- Order placed
- Order fulfilled
- Order cancelled
- Order refunded (single refund)
- Category created
- Category updated
- Category deleted
- Product deleted

Bulk data import:

- Orders
- Product Catalogue and categories
- Customers

Check [data flow](docs/plugin-development-customization.md#data-flow) for all the details about the data exchanged
between commercetools and klaviyo.

## Plugin installation

See [plugin installation documentation](docs/plugin-installation.md)

## How it works

See [how it works](docs/how-it-works.md) for the details on how the data is synced between commercetools and klaviyo.

## Plugin development and customization

See [plugin development and customization documentation](docs/plugin-development-customization.md)

## Final words

The process of setting up commercetools can differ based on the specific implementation, and the integration needs may
also vary in each scenario. Due to these variations, the plugin is distributed as an open source application to
facilitate the integration of these systems. This way, individuals are able to freely download, host, and customize the
solution according to their distinct business needs.

## TODO

* list libraries that can be removed when adapter is not required
