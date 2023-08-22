# End-to-end tests

End-to-end tests are written using [Postman](https://learning.postman.com/docs/writing-scripts/test-scripts/). These
must be executed in an environment where the plugin is installed and configured to communicate with both a
Commercetools project and a Klaviyo account.

The end-to-end tests for realtime events use the Commercetools API to create/update data in commercetools and verify
that the data is synced correctly into Klaviyo using the Klaviyo API. These tests do not have direct access to the
plugin. 

## Tests structure

All tests are grouped into a Postman collection (`klaviyo ct plugin e2e tests`).  
Each test is made of different steps (API calls) that are grouped into folders (e.g. `customer created`).  
Example:

```
klaviyo ct plugin e2e tests
└───customer created
│   │   POST Obtain Access Token
│   │   POST Create customer in CT
│   │   GET  Profile in Klaviyo
│   
└───order created
    │   POST Obtain Access Token
    │   POST Create cart in CT
    │   POST Create order in CT
    │   GET  Event in Klaviyo
```

The test collection is exported from postman and saved in the repository
at `src/test/e2e/postman/klaviyo-e2e-tests.postman_collection.json`

## Add/edit tests

To edit the existing tests:

- import the test collection into postman
- edit or add new tests
- re-export the collection and overwrite the json file in the repository

### How to write tests with Postman

https://learning.postman.com/docs/running-collections/intro-to-collection-runs/  
https://learning.postman.com/docs/running-collections/building-workflows/  
https://learning.postman.com/docs/writing-scripts/test-scripts/

## Test environment variables

The tests require API keys and other information to run. This sensitive information cannot be saved in the repository
and should be manually added in postman.

- Create a new environment in postman with the following variables:
    - `ct_host` = `https://api.us-central1.gcp.commercetools.com`
    - `ct_auth_url` = `https://auth.us-central1.gcp.commercetools.com`
    - `ct_client_id` = _use the same CT client id configured in the GitHub secret `CT_E2E_CLIENT_ID`_
    - `ct_client_secret` = _use the same CT secret configured in the GitHub secret `CT_E2E_SECRET`_
    - `project-key` = `klaviyo-dev` (commercetools project key)
    - `klaviyoPrivateKey` = _the klaviyo private key for the dev klaviyo project_
    - `klaviyoBaseUrl` = `https://a.klaviyo.com/`
- Select the new postman environment when running the test collection

## Running tests from postman

To run all tests select the collection in postman and click on the `Run` button.  
To run a single test select the directory in postman and click on the `Run` button.

## Running test from CLI

Test can be run using
the [postman or newman CLI](https://learning.postman.com/docs/postman-cli/postman-cli-overview/). The CLI can use an
environment file exported from postman:

```shell
newman run src/test/e2e/postman/klaviyo-e2e-tests.postman_collection.json -e src/test/e2e/postman/env.postman_environment.json
```

or all environment variables can be passed in via the CLI:

```shell
newman run src/test/e2e/postman/klaviyo-e2e-tests.postman_collection.json --env-var "ct_client_id=..."
```
