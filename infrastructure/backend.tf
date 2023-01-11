terraform {
  #  backend "s3" {
  #    bucket         = "dcx-tf-management-tf-state-u1giaj7b"
  #    key            = "dcx-domain-product-fact-etl-tf.tfstate"
  #    dynamodb_table = "dcx-tf-management-tf-state"
  #    region         = "eu-west-1"
  #  }

  required_version = ">= 0.13"

  backend "gcs" {
    bucket = "tfstate-klaviyo-test-roberto"
    prefix = "terraform/state"
  }

  required_providers {
    commercetools = {
      source = "labd/commercetools"
    }
    google = ">= 3.3"
  }
}
