locals {
  gcp_project_id  = var.gcp_project_id
  image    = var.image
  location = var.location

  service_name = "${var.gcp_environment_namespace}-klaviyo-ct-plugin"
}
