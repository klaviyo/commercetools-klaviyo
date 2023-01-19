#resource "commercetools_tax_category" "standard-tax-category" {
#  name        = "Standard tax category"
#  description = "Germany standard tax"
#}
#
#resource "commercetools_tax_category_rate" "standard-tax-category-IT" {
#  tax_category_id   = commercetools_tax_category.standard-tax-category.id
#  name              = "21% IVA"
#  amount            = 0.20
#  included_in_price = true
#  country           = "IT"
#}
#
#resource "commercetools_tax_category_rate" "standard-tax-category-US" {
#  tax_category_id   = commercetools_tax_category.standard-tax-category.id
#  name              = "10%"
#  amount            = 0.10
#  included_in_price = false
#  country           = "US"
#}
