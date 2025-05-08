# Changelog

## v2.0.1

### Bug Fixes

- Set profile location properties from under `location` object to match newer API revisions.

## v2.0.0

### Breaking Changes

- Klaviyo API/SDK: upgraded `klaviyo-api` to v16.0.0 with API revision v2025-01-15.
- Some API requests have changed slightly, but the SDK now maps properties between snake_case and camelCase for requests and responses.
- For existing forks of this code: caution is advised. For new forks (or lightly customized ones), there shouldn't be much of a difference.

### Bug Fixes

- Made some changes to decrease the chance of rate limiting during bulk imports (429 errors).
- Fixed an issue that could lead to ProductPublished events being reprocessed continuosly, depending on PubSub configuration.

### Other Changes

- Tests have been updated to match the latest API/SDK.
- Documentation updates: clarification on the different case mappings between API/SDK and other small changes.

## v1.0.15

### Bug Fixes

- Product mapping: fixed an issue when handling products without any price defined (thanks @KthProg)

### Other Changes

- Documentation updates: improved documentation to clarify contribution process.

## v1.0.14

### Other Changes

- Documentation updates: improved documentation around bulk import and product mapping.

## v1.0.13

### Other Changes

- Small GCP deployment pipeline changes.

## v1.0.12

### New Features

- Requests to Klaviyo now send plugin version and mode (selfhosted or Connect) for analytics purposes.

### Other Changes

- Miscellaneous pipeline changes.

## v1.0.6

- Product mapping: fixed an issue when handling variants without any images (thanks @thekiwi)

### Bug Fixes

- Improved commercetools Connect post-deploy and pre-undeploy scripts.

## v1.0.5

### Other Changes

- Documentation updates: added documentation about running bulk import locally, improved documentation around price selection

## v1.0.4

### Bug Fixes

- Improved commercetools Connect post-deploy and pre-undeploy scripts.

## v1.0.3

### New Features

- Added support to disable specific event processing, rather than just disabling specific Subscription messages.

### Bug Fixes

- Updated dependencies to fix vulnerabilities.

### Other Changes

- Documentation updates: added documentation related to disabling events.

## v1.0.2

### New Features

- Support for [commercetools Connect](https://commercetools.com/products/connect)

### Bug Fixes

- Minor bug fixes

### Other Changes

- Documentation updates: added documentation related to commercetools Connect, other small documentation changes

## v1.0.1

### New Features

- Support for real-time product published
- Additional properties in the product message for localized fields and different currencies

### Bug Fixes

- Minor bug fixes

### Other Changes

- Documentation updates: added missing configuration properties, added product published event details

## v1.0.0

* First release


