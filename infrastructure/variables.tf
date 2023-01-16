#COMMERCETOOLS

variable "ct_project_key" {
  description = "commercetools Project key"
  type        = string
}
variable "ct_project_name" {
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
variable "ct_scopes" {
  description = "commercetools scopes"
  type        = string
}

#KLAVIYO

variable "klaviyo_auth_key" {
  description = "Klaviyo auth key"
  type        = string
}

#GCP

variable "gcp_environment_namespace" {
  description = "GCP environment prefix to be added to resources"
  type        = string
}

variable "gcp_project_id" {
  type    = string
  default = "klaviyo-ct-plugin"
}

variable "location" {
  type    = string
  default = "us-central1"
}

variable "image" {
  type    = string
  default = "gcr.io/cloudrun/hello"
}

