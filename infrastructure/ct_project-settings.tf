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
  name = var.project_name
}
