export const ctGet2Orders = {
    "limit": 20,
    "offset": 0,
    "count": 2,
    "results": [
    {
      "type": "Order",
      "id": "1911fef0-131a-4802-802c-711d959c2590",
      "version": 1,
      "versionModifiedAt": "2023-02-09T10:02:50.207Z",
      "lastMessageSequenceNumber": 1,
      "createdAt": "2023-02-09T10:02:50.207Z",
      "lastModifiedAt": "2023-02-09T10:02:50.207Z",
      "lastModifiedBy": {
        "clientId": "GoA0a0o2TXhrpN2TPDOBa9Rr",
        "isPlatformClient": false
      },
      "createdBy": {
        "clientId": "GoA0a0o2TXhrpN2TPDOBa9Rr",
        "isPlatformClient": false
      },
      "orderNumber": "76",
      "customerEmail": "testuser1@klaviyo.com",
      "totalPrice": {
        "type": "centPrecision",
        "currencyCode": "EUR",
        "centAmount": 50875,
        "fractionDigits": 2
      },
      "orderState": "Open",
      "syncInfo": [],
      "returnInfo": [],
      "taxMode": "External",
      "inventoryMode": "None",
      "taxRoundingMode": "HalfEven",
      "taxCalculationMode": "LineItemLevel",
      "origin": "Customer",
      "shippingMode": "Single",
      "shipping": [],
      "lineItems": [
        {
          "id": "dd853ebf-b35d-454e-9c6c-703479df6cbd",
          "productId": "2d69d31e-cccc-450d-83c8-aa27c2a0a620",
          "productKey": "72997",
          "name": {
            "en": "Product Name"
          },
          "productType": {
            "typeId": "product-type",
            "id": "a6408130-1800-4cb3-9332-14d27879d929",
            "version": 1
          },
          "variant": {
            "id": 1,
            "sku": "A0E200000001YNN",
            "key": "A0E200000001YNN",
            "prices": [
              {
                "id": "66e65866-50cb-487d-b092-7de6e8e4f9a9",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 40625,
                  "fractionDigits": 2
                }
              },
              {
                "id": "6f603a55-39b5-4109-a52b-a798faa930ed",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 26639,
                  "fractionDigits": 2
                },
                "customerGroup": {
                  "typeId": "customer-group",
                  "id": "3dc582f5-e5a5-493a-ae4d-726356542a7b"
                }
              },
              {
                "id": "732c27eb-34b8-4160-a352-fff57c340be3",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 40625,
                  "fractionDigits": 2
                },
                "country": "US"
              },
              {
                "id": "fc957081-d800-42a5-9e4c-b2cf0f968d32",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 26639,
                  "fractionDigits": 2
                },
                "customerGroup": {
                  "typeId": "customer-group",
                  "id": "3dc582f5-e5a5-493a-ae4d-726356542a7b"
                }
              },
              {
                "id": "349ada18-6889-49a8-8dec-191589b509e6",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 32500,
                  "fractionDigits": 2
                },
                "country": "DE"
              },
              {
                "id": "f33f6bd7-5156-42f8-9bfa-99536b6a3319",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 32500,
                  "fractionDigits": 2
                },
                "country": "IT"
              },
              {
                "id": "84ea9651-a3f9-412e-afbb-e57c639f1986",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 32500,
                  "fractionDigits": 2
                },
                "country": "GB"
              },
              {
                "id": "79a09808-5904-4a50-96a9-1e3b570e4e47",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 31850,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "d79fcace-9711-4665-833d-c80be68dbb01"
                }
              },
              {
                "id": "19bb9e86-06e1-441b-86de-3a3b10e59a62",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 39000,
                  "fractionDigits": 2
                },
                "channel": {
                  "typeId": "channel",
                  "id": "f9a9e6ab-7f3b-469b-abf4-d3422d54bdeb"
                }
              },
              {
                "id": "d4ed1a7a-f886-4aeb-8bfd-910e83112701",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 35100,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "4acdd01d-db26-4f6f-92c0-cc42b7ed403f"
                }
              },
              {
                "id": "25bb5671-a606-4b31-a4d9-ec166f33e006",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 34775,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "75ab4f19-9eb9-4c8d-8ace-ad7a822958ed"
                }
              },
              {
                "id": "98982a79-1251-4701-8b5a-ef5f710a2a60",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 34125,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "d6085a8c-d42b-4e24-a51f-370edebfbbdf"
                }
              },
              {
                "id": "442a1f18-c0d0-4536-aad6-f9a19b2dc008",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 31850,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "c04d75ca-f367-4bef-baa5-5790dd931707"
                }
              },
              {
                "id": "aaf1a669-2849-46ff-a427-f7df28afabe9",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 39000,
                  "fractionDigits": 2
                },
                "channel": {
                  "typeId": "channel",
                  "id": "ba0d6ccb-0aa2-434c-9030-bb88b68e2aa0"
                }
              },
              {
                "id": "2ab509be-f8df-4e86-81cb-b49adbc3c437",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 35100,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "e003b8b9-2562-4993-8ddb-bbf5cde94641"
                }
              },
              {
                "id": "743d698b-e25d-40a4-ac77-011f7b9fab71",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 34775,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "3cb3f673-9805-4e21-9e00-afa1246121da"
                }
              },
              {
                "id": "5bb4934a-e065-4959-bd81-f7a158468c4c",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 34125,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "9a32dc0d-4aa0-4423-8c4d-1389cb22aa72"
                }
              }
            ],
            "images": [
              {
                "url": "https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/072997_1_large.jpg",
                "dimensions": {
                  "w": 0,
                  "h": 0
                }
              }
            ],
            "attributes": [
              {
                "name": "articleNumberManufacturer",
                "value": "30S4GTVS6L 230 LUG"
              },
              {
                "name": "articleNumberMax",
                "value": "72997"
              },
              {
                "name": "matrixId",
                "value": "A0E200000001YNN"
              },
              {
                "name": "baseId",
                "value": "72997"
              },
              {
                "name": "designer",
                "value": {
                  "key": "michaelkors",
                  "label": "Michael Kors"
                }
              },
              {
                "name": "madeInItaly",
                "value": {
                  "key": "no",
                  "label": "no"
                }
              },
              {
                "name": "commonSize",
                "value": {
                  "key": "oneSize",
                  "label": "one Size"
                }
              },
              {
                "name": "size",
                "value": "one size"
              },
              {
                "name": "color",
                "value": {
                  "key": "brown",
                  "label": {
                    "it": "marrone",
                    "de": "braun",
                    "en": "brown"
                  }
                }
              },
              {
                "name": "colorFreeDefinition",
                "value": {
                  "en": "luggage",
                  "de": "luggage"
                }
              },
              {
                "name": "style",
                "value": {
                  "key": "sporty",
                  "label": "sporty"
                }
              },
              {
                "name": "gender",
                "value": {
                  "key": "women",
                  "label": "Damen"
                }
              },
              {
                "name": "season",
                "value": "s15"
              }
            ],
            "assets": []
          },
          "price": {
            "id": "0853898a-2f36-44f5-8f1b-c20775ab6467",
            "value": {
              "type": "centPrecision",
              "currencyCode": "EUR",
              "centAmount": 40625,
              "fractionDigits": 2
            }
          },
          "quantity": 1,
          "discountedPricePerQuantity": [],
          "perMethodTaxRate": [],
          "addedAt": "2023-02-09T10:02:50.192Z",
          "lastModifiedAt": "2023-02-09T10:02:50.192Z",
          "state": [
            {
              "quantity": 1,
              "state": {
                "typeId": "state",
                "id": "3d45b624-3e5b-410c-a9b1-22a7987a7cdf"
              }
            }
          ],
          "priceMode": "Platform",
          "lineItemMode": "Standard",
          "totalPrice": {
            "type": "centPrecision",
            "currencyCode": "EUR",
            "centAmount": 40625,
            "fractionDigits": 2
          },
          "taxedPricePortions": []
        },
        {
          "id": "ba3a2f30-bee0-4bb1-9300-403a941d6e1e",
          "productId": "346a4513-82ee-4aea-90e0-2e7ded859e77",
          "productKey": "79371",
          "name": {
            "en": "Product Name"
          },
          "productType": {
            "typeId": "product-type",
            "id": "a6408130-1800-4cb3-9332-14d27879d929",
            "version": 1
          },
          "variant": {
            "id": 1,
            "sku": "A0E2000000021UK",
            "key": "A0E2000000021UK",
            "prices": [
              {
                "id": "03b1b802-2490-47a9-a742-a3c9a3c756c3",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 10250,
                  "fractionDigits": 2
                }
              },
              {
                "id": "ae65f1f6-4a9a-4021-81f6-555c7223643e",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 6721,
                  "fractionDigits": 2
                },
                "customerGroup": {
                  "typeId": "customer-group",
                  "id": "3dc582f5-e5a5-493a-ae4d-726356542a7b"
                }
              },
              {
                "id": "de262523-f3b4-4cd7-a31a-6fcdc52f81c8",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 10250,
                  "fractionDigits": 2
                },
                "country": "US"
              },
              {
                "id": "2dd29e3e-9921-4957-baee-27d8d39aa726",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 6721,
                  "fractionDigits": 2
                },
                "customerGroup": {
                  "typeId": "customer-group",
                  "id": "3dc582f5-e5a5-493a-ae4d-726356542a7b"
                }
              },
              {
                "id": "2402ed64-4527-4f4b-aaba-7208a1732963",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 8200,
                  "fractionDigits": 2
                },
                "country": "DE"
              },
              {
                "id": "8292bb63-4cf8-4fc0-ba8b-b361bfa5d6d5",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 8200,
                  "fractionDigits": 2
                },
                "country": "IT"
              },
              {
                "id": "b483060a-6d72-4c48-8cd1-c5085c3c8a59",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 8200,
                  "fractionDigits": 2
                },
                "country": "GB"
              },
              {
                "id": "20730f13-5ace-451d-a27e-22f3fe31cd74",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 7544,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "d79fcace-9711-4665-833d-c80be68dbb01"
                }
              },
              {
                "id": "c37dc435-a5dc-4408-9dbb-8155a947898e",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 9840,
                  "fractionDigits": 2
                },
                "channel": {
                  "typeId": "channel",
                  "id": "f9a9e6ab-7f3b-469b-abf4-d3422d54bdeb"
                }
              },
              {
                "id": "ff5bc077-f1ab-475b-988c-4b64f7f875c4",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 8364,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "4acdd01d-db26-4f6f-92c0-cc42b7ed403f"
                }
              },
              {
                "id": "29e95cef-e5c7-4c55-bafe-15ff5f2f21a1",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 8774,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "75ab4f19-9eb9-4c8d-8ace-ad7a822958ed"
                }
              },
              {
                "id": "be31bd24-af7e-48eb-bd39-954e4a850b0c",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 7380,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "d6085a8c-d42b-4e24-a51f-370edebfbbdf"
                }
              },
              {
                "id": "abcc437d-fdbf-4a23-9675-e26eca36fd96",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 7544,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "c04d75ca-f367-4bef-baa5-5790dd931707"
                }
              },
              {
                "id": "3243e34e-0de9-47fa-a64a-e829e64e8c2f",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 9840,
                  "fractionDigits": 2
                },
                "channel": {
                  "typeId": "channel",
                  "id": "ba0d6ccb-0aa2-434c-9030-bb88b68e2aa0"
                }
              },
              {
                "id": "9b3ccf85-606f-4744-9a00-e3436df0dde7",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 8364,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "e003b8b9-2562-4993-8ddb-bbf5cde94641"
                }
              },
              {
                "id": "2e9aa8fd-74da-446d-8a1e-682f27ff2ca0",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 8774,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "3cb3f673-9805-4e21-9e00-afa1246121da"
                }
              },
              {
                "id": "c9e7ac4e-53fc-4bb6-8bb7-19b351ec8433",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 7380,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "9a32dc0d-4aa0-4423-8c4d-1389cb22aa72"
                }
              }
            ],
            "images": [
              {
                "url": "https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/079371_1_medium.jpg",
                "dimensions": {
                  "w": 0,
                  "h": 0
                }
              }
            ],
            "attributes": [
              {
                "name": "articleNumberManufacturer",
                "value": "JC5519PP1KLV0500 ROSSO"
              },
              {
                "name": "articleNumberMax",
                "value": "79371"
              },
              {
                "name": "matrixId",
                "value": "A0E2000000021UK"
              },
              {
                "name": "baseId",
                "value": "79371"
              },
              {
                "name": "designer",
                "value": {
                  "key": "moschinolove",
                  "label": "Moschino Love"
                }
              },
              {
                "name": "madeInItaly",
                "value": {
                  "key": "no",
                  "label": "no"
                }
              },
              {
                "name": "commonSize",
                "value": {
                  "key": "oneSize",
                  "label": "one Size"
                }
              },
              {
                "name": "size",
                "value": "one size"
              },
              {
                "name": "color",
                "value": {
                  "key": "red",
                  "label": {
                    "it": "rosso",
                    "en": "red",
                    "de": "rot"
                  }
                }
              },
              {
                "name": "colorFreeDefinition",
                "value": {
                  "en": "red",
                  "de": "rot"
                }
              },
              {
                "name": "style",
                "value": {
                  "key": "sporty",
                  "label": "sporty"
                }
              },
              {
                "name": "gender",
                "value": {
                  "key": "women",
                  "label": "Damen"
                }
              },
              {
                "name": "season",
                "value": "s15"
              },
              {
                "name": "isOnStock",
                "value": true
              }
            ],
            "assets": []
          },
          "price": {
            "id": "c3be288f-fd4d-4965-a35d-205fb02ae1e0",
            "value": {
              "type": "centPrecision",
              "currencyCode": "EUR",
              "centAmount": 10250,
              "fractionDigits": 2
            }
          },
          "quantity": 1,
          "discountedPricePerQuantity": [],
          "perMethodTaxRate": [],
          "addedAt": "2023-02-09T10:02:50.192Z",
          "lastModifiedAt": "2023-02-09T10:02:50.192Z",
          "state": [
            {
              "quantity": 1,
              "state": {
                "typeId": "state",
                "id": "3d45b624-3e5b-410c-a9b1-22a7987a7cdf"
              }
            }
          ],
          "priceMode": "Platform",
          "lineItemMode": "Standard",
          "totalPrice": {
            "type": "centPrecision",
            "currencyCode": "EUR",
            "centAmount": 10250,
            "fractionDigits": 2
          },
          "taxedPricePortions": []
        }
      ],
      "customLineItems": [],
      "transactionFee": false,
      "discountCodes": [],
      "directDiscounts": [],
      "itemShippingAddresses": [],
      "refusedGifts": [],
      "store": {
        "typeId": "store",
        "key": "default"
      }
    },
    {
      "type": "Order",
      "id": "3a34626e-dca9-4f02-91de-891081245e1b",
      "version": 1,
      "versionModifiedAt": "2023-02-09T10:02:53.041Z",
      "lastMessageSequenceNumber": 1,
      "createdAt": "2023-02-09T10:02:53.041Z",
      "lastModifiedAt": "2023-02-09T10:02:53.041Z",
      "lastModifiedBy": {
        "clientId": "GoA0a0o2TXhrpN2TPDOBa9Rr",
        "isPlatformClient": false
      },
      "createdBy": {
        "clientId": "GoA0a0o2TXhrpN2TPDOBa9Rr",
        "isPlatformClient": false
      },
      "orderNumber": "363",
      "customerEmail": "testuser2@klaviyo.com",
      "totalPrice": {
        "type": "centPrecision",
        "currencyCode": "EUR",
        "centAmount": 42375,
        "fractionDigits": 2
      },
      "orderState": "Open",
      "syncInfo": [],
      "returnInfo": [],
      "taxMode": "External",
      "inventoryMode": "None",
      "taxRoundingMode": "HalfEven",
      "taxCalculationMode": "LineItemLevel",
      "origin": "Customer",
      "shippingMode": "Single",
      "shipping": [],
      "lineItems": [
        {
          "id": "5c5b0f7a-528c-44f4-be03-4cb78ce75558",
          "productId": "88357214-5b2d-4e31-a305-04d6f4fbbc72",
          "productKey": "82772",
          "name": {
            "en": "Product Name"
          },
          "productType": {
            "typeId": "product-type",
            "id": "a6408130-1800-4cb3-9332-14d27879d929",
            "version": 1
          },
          "variant": {
            "id": 1,
            "sku": "M0E20000000EO41",
            "key": "M0E20000000EO41",
            "prices": [
              {
                "id": "adad6724-09d2-4f21-94d7-4c83d94957e1",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 12375,
                  "fractionDigits": 2
                }
              },
              {
                "id": "252be95d-08aa-4429-8658-a8132d92475d",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 8115,
                  "fractionDigits": 2
                },
                "customerGroup": {
                  "typeId": "customer-group",
                  "id": "3dc582f5-e5a5-493a-ae4d-726356542a7b"
                }
              },
              {
                "id": "a555fe15-0615-4424-81b5-90f5393df497",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 12375,
                  "fractionDigits": 2
                },
                "country": "US"
              },
              {
                "id": "50077c7e-7e3e-4313-90d9-65b68be1bb11",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 8115,
                  "fractionDigits": 2
                },
                "customerGroup": {
                  "typeId": "customer-group",
                  "id": "3dc582f5-e5a5-493a-ae4d-726356542a7b"
                }
              },
              {
                "id": "e3c589fc-21d3-40bd-adf7-50cf484cfb67",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 9900,
                  "fractionDigits": 2
                },
                "country": "DE"
              },
              {
                "id": "8c5793d5-8b30-45bf-8e7b-db54a5e1dd0e",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 9900,
                  "fractionDigits": 2
                },
                "country": "IT"
              },
              {
                "id": "81a78bf5-e859-4d55-bfb4-c6f2c2483b50",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 9900,
                  "fractionDigits": 2
                },
                "country": "GB"
              },
              {
                "id": "d570e102-85cf-430a-9a08-b33ea28fdd10",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 10890,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "d79fcace-9711-4665-833d-c80be68dbb01"
                }
              },
              {
                "id": "d2bcfc12-7814-4466-9055-a784092cb1e7",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 13489,
                  "fractionDigits": 2
                },
                "channel": {
                  "typeId": "channel",
                  "id": "f9a9e6ab-7f3b-469b-abf4-d3422d54bdeb"
                }
              },
              {
                "id": "59e50a22-91b4-4b0b-8c9b-b7b99853913a",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 9009,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "4acdd01d-db26-4f6f-92c0-cc42b7ed403f"
                }
              },
              {
                "id": "25e29a5f-c935-4594-97f7-4e5514dbe98d",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 9009,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "75ab4f19-9eb9-4c8d-8ace-ad7a822958ed"
                }
              },
              {
                "id": "9fe6bc43-44e4-42d6-89c5-00a263d706de",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "EUR",
                  "centAmount": 10098,
                  "fractionDigits": 2
                },
                "country": "DE",
                "channel": {
                  "typeId": "channel",
                  "id": "d6085a8c-d42b-4e24-a51f-370edebfbbdf"
                }
              },
              {
                "id": "4bc73d54-9ac1-40c0-83dd-68801f01a4ce",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 10890,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "c04d75ca-f367-4bef-baa5-5790dd931707"
                }
              },
              {
                "id": "0a2b89a3-0566-4d18-a917-ba569119bc07",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 13489,
                  "fractionDigits": 2
                },
                "channel": {
                  "typeId": "channel",
                  "id": "ba0d6ccb-0aa2-434c-9030-bb88b68e2aa0"
                }
              },
              {
                "id": "b167c761-a5f9-490f-8468-fee5fd51d8b8",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 9009,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "e003b8b9-2562-4993-8ddb-bbf5cde94641"
                }
              },
              {
                "id": "662a2701-b593-4d55-8c0b-0f1adbbf4c52",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 9009,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "3cb3f673-9805-4e21-9e00-afa1246121da"
                }
              },
              {
                "id": "79d4c257-75a5-4ca5-92a6-ee7d68013d19",
                "value": {
                  "type": "centPrecision",
                  "currencyCode": "USD",
                  "centAmount": 10098,
                  "fractionDigits": 2
                },
                "country": "US",
                "channel": {
                  "typeId": "channel",
                  "id": "9a32dc0d-4aa0-4423-8c4d-1389cb22aa72"
                }
              }
            ],
            "images": [
              {
                "url": "https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082772_1_medium.jpg",
                "dimensions": {
                  "w": 0,
                  "h": 0
                }
              }
            ],
            "attributes": [
              {
                "name": "articleNumberManufacturer",
                "value": "A04W2A18B5B05 J3YUN"
              },
              {
                "name": "articleNumberMax",
                "value": "82772"
              },
              {
                "name": "matrixId",
                "value": "M0E20000000EO41"
              },
              {
                "name": "baseId",
                "value": "82772"
              },
              {
                "name": "designer",
                "value": {
                  "key": "poloralphlauren",
                  "label": "Polo Ralph Lauren"
                }
              },
              {
                "name": "madeInItaly",
                "value": {
                  "key": "no",
                  "label": "no"
                }
              },
              {
                "name": "commonSize",
                "value": {
                  "key": "xxs",
                  "label": "XXS"
                }
              },
              {
                "name": "size",
                "value": "XXS"
              },
              {
                "name": "color",
                "value": {
                  "key": "green",
                  "label": {
                    "it": "verde",
                    "en": "green",
                    "de": "grün"
                  }
                }
              },
              {
                "name": "colorFreeDefinition",
                "value": {
                  "en": "green",
                  "de": "grün"
                }
              },
              {
                "name": "style",
                "value": {
                  "key": "sporty",
                  "label": "sporty"
                }
              },
              {
                "name": "gender",
                "value": {
                  "key": "men",
                  "label": "Herren"
                }
              },
              {
                "name": "season",
                "value": "A15"
              }
            ],
            "assets": []
          },
          "price": {
            "id": "4aafb1c2-cdf2-466b-be56-71f6dd3af5b0",
            "value": {
              "type": "centPrecision",
              "currencyCode": "EUR",
              "centAmount": 12375,
              "fractionDigits": 2
            }
          },
          "quantity": 1,
          "discountedPricePerQuantity": [],
          "perMethodTaxRate": [],
          "addedAt": "2023-02-09T10:02:53.013Z",
          "lastModifiedAt": "2023-02-09T10:02:53.013Z",
          "state": [
            {
              "quantity": 1,
              "state": {
                "typeId": "state",
                "id": "3d45b624-3e5b-410c-a9b1-22a7987a7cdf"
              }
            }
          ],
          "priceMode": "Platform",
          "lineItemMode": "Standard",
          "totalPrice": {
            "type": "centPrecision",
            "currencyCode": "EUR",
            "centAmount": 12375,
            "fractionDigits": 2
          },
          "taxedPricePortions": []
        }
      ],
      "customLineItems": [],
      "transactionFee": false,
      "discountCodes": [],
      "directDiscounts": [],
      "itemShippingAddresses": [],
      "refusedGifts": []
    },
  ]
}
