resource "commercetools_api_client" "klaviyo-plugin-api-client" {
  name = "Klaviyo plugin API Client"
  scope = [
    "view_orders:${var.ct_project_key}", "view_products:${var.ct_project_key}", "view_customers:${var.ct_project_key}",
    "view_published_products:${var.ct_project_key}", "view_payments:${var.ct_project_key}"
  ]
}
