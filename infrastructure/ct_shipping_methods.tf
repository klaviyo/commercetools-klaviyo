#resource "commercetools_shipping_method" "standard" {
#  key             = "standard-delivery"
#  name            = "Standard delivery"
#  description     = "Standard delivery 3-5 working days"
#  is_default      = true
#  tax_category_id = commercetools_tax_category.standard-tax-category.id
#  predicate       = "1 = 1"
#}
#
#resource "commercetools_shipping_zone" "it-us" {
#  key         = "it-us"
#  name        = "IT and US"
#  description = "Italy and US"
#  location {
#    country = "IT"
#  }
#  location {
#    country = "US"
#    state   = "Nevada"
#  }
#}
#
#resource "commercetools_shipping_zone_rate" "my-shipping-zone-rate" {
#  shipping_method_id = commercetools_shipping_method.standard.id
#  shipping_zone_id   = commercetools_shipping_zone.it-us.id
#
#  price {
#    cent_amount   = 5000
#    currency_code = "EUR"
#  }
#
#  free_above {
#    cent_amount   = 50000
#    currency_code = "EUR"
#  }
#
#}
