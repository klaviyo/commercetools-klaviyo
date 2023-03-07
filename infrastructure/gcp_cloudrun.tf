# APIs

resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "resource_manager_api" {
  service            = "cloudresourcemanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iam_api" {
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

# Cloud Run service

resource "google_cloud_run_service" "klaviyo_ct_plugin_realtime_events" {
  name     = "${local.service_name}-realtime-events"
  location = local.location

  template {
    spec {
      containers {
        image = local.image
      }
      service_account_name  = google_service_account.cloud_run_executor.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    //noinspection HILUnresolvedReference
    ignore_changes = [
      template.0.spec.0.containers,
    ]
  }

  depends_on = [google_project_service.run_api, google_project_service.resource_manager_api]
}

resource "google_pubsub_subscription" "subscription" {
  name  = "${var.gcp_environment_namespace}-klaviyo_ct_plugin_on_cloud_run"
  topic = google_pubsub_topic.commercetools.name
  push_config {
    push_endpoint = google_cloud_run_service.klaviyo_ct_plugin_realtime_events.status[0].url
    oidc_token {
      service_account_email = google_service_account.pubsub_invoker.email
    }
    attributes = {
      x-goog-version = "v1"
    }
  }
  depends_on = [google_cloud_run_service.klaviyo_ct_plugin_realtime_events, google_pubsub_topic.commercetools]
}

resource "google_cloud_run_service" "klaviyo_ct_plugin_bulk_import" {
  name     = "${local.service_name}-bulk-import"
  location = local.location

  template {
    spec {
      containers {
        image = local.image
      }
      container_concurrency = 1
      service_account_name = google_service_account.cloud_run_executor.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    //noinspection HILUnresolvedReference
    ignore_changes = [
      template.0.spec.0.containers,
    ]
  }

  depends_on = [google_project_service.run_api, google_project_service.resource_manager_api]
}

# Service Account for invoking cloud run

resource "google_service_account" "pubsub_invoker" {
  project      = local.gcp_project_id
  account_id   = "${var.gcp_environment_namespace}-cloud-run-pubsub-invoker"
  display_name = "Cloud Run Pub/Sub Invoker"
  depends_on   = [google_project_service.iam_api]
}

resource "google_cloud_run_service_iam_binding" "pub_sub_cloud_run_invoker_iam" {
  location = google_cloud_run_service.klaviyo_ct_plugin_realtime_events.location
  service  = google_cloud_run_service.klaviyo_ct_plugin_realtime_events.name
  role     = "roles/run.invoker"
  members  = ["serviceAccount:${google_service_account.pubsub_invoker.email}"]
}

# Service account for executing cloud run

resource "google_service_account" "cloud_run_executor" {
  project      = local.gcp_project_id
  account_id   = "${var.gcp_environment_namespace}-cloud-run-executor"
  display_name = "Cloud Run Executor"
  depends_on   = [google_project_service.iam_api]
}

resource "google_service_account_iam_binding" "cloud_run_service_account_user_iam" {
  service_account_id = google_service_account.cloud_run_executor.name
  role               = "roles/iam.serviceAccountUser"
  members            = ["serviceAccount:${google_service_account.cloud_run_executor.email}"]
}

resource "google_secret_manager_secret_iam_binding" "cloud_run_access_ct_secrets" {
  project   = local.gcp_project_id
  secret_id = google_secret_manager_secret.ct-api-client.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${google_service_account.cloud_run_executor.email}",
  ]
}

resource "google_secret_manager_secret_iam_binding" "cloud_run_access_klaviyo_secrets" {
  project   = local.gcp_project_id
  secret_id = google_secret_manager_secret.klaviyo-auth-key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${google_service_account.cloud_run_executor.email}",
  ]
}

# Artifact repository

resource "google_project_service" "artifact_registry_api" {
  service                    = "artifactregistry.googleapis.com"
  disable_on_destroy         = true
  disable_dependent_services = true
}

//todo add expiry policy for versioned images
resource "google_artifact_registry_repository" "klaviyo-ct-plugin" {
  count         = var.gcp_environment_namespace == "dev" ? 1 : 0
  location      = "us-central1"
  repository_id = "docker-repo"
  description   = "Klaviyo commercetools plugin docker repository"
  format        = "DOCKER"
  depends_on    = [google_project_service.artifact_registry_api]
}

# Outputs

output "cloud_run_url" {
  value = google_cloud_run_service.klaviyo_ct_plugin_realtime_events.status[0].url
}

#output "deployment_sa_key" {
#  sensitive = true
#  value     = base64decode(google_service_account_key.deployment_sa_key.private_key)
#}
