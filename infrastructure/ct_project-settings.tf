resource "commercetools_project_settings" "project" {
  countries = [
    "IT",
    "US"
  ]
  currencies = [
    "EUR",
    "USD"
  ]
  languages = [
    "en-US",
    "it"
  ]
  name                       = var.ct_project_name
  enable_search_index_orders = true
}
