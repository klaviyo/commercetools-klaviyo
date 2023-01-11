#COMMERCETOOLS

variable "project_key" {
  description = "commercetools Project key"
  type        = string
}
variable "project_name" {
  description = "commercetools Project name"
  type        = string
}
variable "ct_api_url" {
  description = "commercetools API URL"
  type        = string
  default     = "https://api.us-central1.gcp.commercetools.com"
}

variable "ct_auth_url" {
  description = "commercetools Auth URL"
  type        = string
  default     = "https://auth.us-central1.gcp.commercetools.com"
}

variable "ct_client_id" {
  description = "commercetools client id"
  type        = string
}
variable "ct_secret" {
  description = "commercetools secret"
  type        = string
}
variable "scopes" {
  description = "commercetools scopes"
  type        = string
}

variable "environment" {
  description = "commercetools environment name"
  type        = string
}

#GCP
variable "project" {
  type    = string
  default = "klaviyo-test-roberto"
}

variable "location" {
  type    = string
  default = "us-central1"
}

variable "image" {
  type    = string
  default = "gcr.io/cloudrun/hello"
}

