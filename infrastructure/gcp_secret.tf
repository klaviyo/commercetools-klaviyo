resource "google_project_service" "secret_manager_api" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = true
}

resource "google_secret_manager_secret" "klaviyo-auth-key" {
  secret_id = "klaviyo_auth_key"

  replication {
    user_managed {
      replicas {
        location = "us-central1"
      }
      replicas {
        location = "us-east1"
      }
    }
  }
  depends_on = [google_project_service.secret_manager_api]
}
resource "google_secret_manager_secret_version" "klaviyo-auth-key-version" {
  secret      = google_secret_manager_secret.klaviyo-auth-key.id
  secret_data = var.klaviyo_auth_key
}

# API client used by the plugin to access the commercetools APIs
resource "google_secret_manager_secret" "ct-api-client" {
  secret_id = "commercetools_api_client"

  replication {
    user_managed {
      replicas {
        location = "us-central1"
      }
      replicas {
        location = "us-east1"
      }
    }
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "ct-api-client-version" {
  secret      = google_secret_manager_secret.ct-api-client.id
  secret_data = jsonencode({
    "clientId" : commercetools_api_client.klaviyo-plugin-api-client.id
    "secret" : commercetools_api_client.klaviyo-plugin-api-client.secret
  })
}
