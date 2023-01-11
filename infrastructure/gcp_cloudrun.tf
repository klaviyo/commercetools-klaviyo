# Providers

provider "google" {
  project = local.project
}

# APIs

resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = true
}

resource "google_project_service" "resource_manager_api" {
  service            = "cloudresourcemanager.googleapis.com"
  disable_on_destroy = true
}

resource "google_project_service" "iam_api" {
  service            = "iam.googleapis.com"
  disable_on_destroy = true
}

# Cloud Run service

resource "google_cloud_run_service" "klaviyo_ct_plugin" {
  name = local.service_name
  location = local.location

  template {
    spec {
      containers {
        image = local.image
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    ignore_changes = [
      template.0.spec.0.containers.0.image,
    ]
  }

  depends_on = [google_project_service.run_api, google_project_service.resource_manager_api]
}

resource "google_pubsub_subscription" "subscription" {
  name  = "pubsub_subscription"
  topic = google_pubsub_topic.commercetools.name
  push_config {
    push_endpoint = google_cloud_run_service.klaviyo_ct_plugin.status[0].url
    oidc_token {
      service_account_email = google_service_account.pubsub_invoker.email
    }
    attributes = {
      x-goog-version = "v1"
    }
  }
  depends_on = [google_cloud_run_service.klaviyo_ct_plugin]
}

#resource "google_cloud_run_service_iam_member" "allUsers" {
#  service  = google_cloud_run_service.run_service.name
#  location = google_cloud_run_service.run_service.location
#  role     = "roles/run.invoker"
#  member   = "allUsers"
#}

# Service Account for deployment

resource "google_service_account" "pubsub_invoker" {
  project      = local.project
  account_id   = "cloud-run-pubsub-invoker"
  display_name = "Cloud Run Pub/Sub Invoker"
}

resource "google_service_account_key" "deployment_sa_key" {
  service_account_id = google_service_account.pubsub_invoker.name
}

resource "google_project_iam_member" "deployment_sa_role_editor" {
  project = local.project
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.pubsub_invoker.email}"
}

resource "google_project_iam_member" "deployment_sa_storage_admin" {
  project = local.project
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.pubsub_invoker.email}"
}

# Artifact repository

resource "google_project_service" "artifact_registry_api" {
  service                    = "artifactregistry.googleapis.com"
  disable_on_destroy         = true
  disable_dependent_services = true
}

resource "google_artifact_registry_repository" "klaviyo-ct-plugin" {
  location      = "us-central1"
  repository_id = "${var.environment}-docker-repo"
  description   = "Klaviyo commercetools plugin docker repository"
  format        = "DOCKER"
  depends_on = [google_project_service.artifact_registry_api]
}

# Outputs

output "cloud_run_url" {
  value = google_cloud_run_service.klaviyo_ct_plugin.status[0].url
}

output "deployment_sa_key" {
  sensitive = true
  value     = base64decode(google_service_account_key.deployment_sa_key.private_key)
}
