terraform {
  required_version = ">= 0.13"

  backend "gcs" {
    bucket = "klaviyo-ct-plugin-terraform-state"
    prefix = "terraform/state"
  }

  required_providers {
    commercetools = {
      source = "labd/commercetools"
    }
    google = ">= 3.3.0"
  }
}
