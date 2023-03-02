# Plugin installation

TODO: add notes about cloud providers, adapters...

## Deployment options
## Option 1
*Recommended*: two different deployments:
* Realtime events: this deployment unit can scale horizontally to handle increased events coming via Commercetools subscriptions 
* Bulk imports: this deployment should not scale horizontally and have a single running instance, this configuration allows to call the APIs to check the import status and force the stop of imports in progress.  

## Option 2
Single deployment.  
This option has the following downsides compared to option 1:
* If the deployment is configured to scale horizontally then it might not be possible to stop a running bulk import.
* If the deployment is configured to not scale horizontally (single instance) then it will be possible to stop a running bulk import but the realtime events processing might be slower when the load of events is high.
