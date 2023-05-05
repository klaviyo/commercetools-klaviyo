# Plugin installation

The plugin is a Node.js application and can be deployed in different ways and configurations.

## Deployment options

The plugin handles both realtime events and bulk data import. It can be configured to handle only realtime
events or bulk data import.

### Two deployments

![Single deployment](./img/plugin_installation_option.png "Klaviyo Commercetools Plugin Architecture")

**Recommended**  
This is the recommended way to deploy the plugin. The same plugin is deployed as two separate services. One service
handles the realtime events from commercetools
subscription, the other service handles the data bulk import.

* Realtime events: this deployment unit can scale horizontally to handle events coming via Commercetools
  subscriptions.  
  Follow [How to run the real time events module](./how_to_run_realtime.md)
* Bulk imports: this deployment should not scale horizontally and have a single running instance, this configuration
  allows to call the APIs to force the stop of imports in progress.  
  Follow [How to run the bulk import module](./how_to_run_bulk_import.md)

### Single deployment

![Two deployments](./img/arch_diagram.png "Klaviyo Commercetools Plugin Architecture")

This option is not recommended, it has the following downsides compared to two deployments:

* If the single deployment is configured to scale horizontally then it might not be possible to stop a running bulk
  import.
* If the single deployment is configured to not scale horizontally (single instance) then it will be possible to stop a
  running
  bulk import but the realtime events processing might be slower when the load of events is high.

To install the plugin in this configuration follow the instruction of the two deployment configuration but a single
commercetools API client should be created with both the scopes required by the real-time module and the bulk import
module. The environment variable `APP_TYPE` should NOT be set.

## Configuration

The plugin has a default configuration that can optionally be customized.
TODO explain how to do it and what are the config properties used for.

## Plugin update

Check the [changelog](changelog.md) page for the list of changes.
If the source code was previously customised reapply the custom changes to the new version of the plugin.

todo write internal doc on release creation and changelog generation.
See https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes

## Infrastructure (TODO remove me)

For all details visit
the [infrastructure documentation](./infrastructure.md)
