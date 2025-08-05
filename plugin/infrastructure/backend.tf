terraform {
  required_version = ">= 0.13"

  backend "gcs" {
    bucket = "klaviyo-ct-plugin-1753264239-terraform-state"
    prefix = "terraform/state"
  }

  required_providers {
    commercetools = {
      source = "labd/commercetools"
    }
    google = ">= 3.3.0"
  }
}
