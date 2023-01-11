locals {
  project  = var.project
  image    = var.image
  location = var.location

  service_name = "${var.environment}-klaviyo-ct-plugin"
}
