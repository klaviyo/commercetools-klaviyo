resource "commercetools_api_client" "klaviyo-plugin-api-client" {
  name  = "Klaviyo plugin API Client"
  scope = ["view_orders:klaviyo-dev", "view_products:klaviyo-dev", "view_customers:klaviyo-dev"]
}
