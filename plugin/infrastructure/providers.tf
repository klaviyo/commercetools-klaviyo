provider "commercetools" {
  api_url       = var.ct_api_url
  token_url     = var.ct_auth_url
  client_id     = var.ct_client_id
  client_secret = var.ct_secret
  project_key   = var.ct_project_key
  scopes        = var.ct_scopes
}

# Providers

provider "google" {
  project = local.gcp_project_id
}
