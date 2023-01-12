resource "google_pubsub_topic" "commercetools" {
  name                       = "${var.gcp_environment_namespace}-commercetools-topic"
  message_retention_duration = "86400s"
}

resource "google_project_iam_binding" "project_token_creator" {
  project = local.gcp_project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  members = ["serviceAccount:${google_project_service_identity.pubsub_agent.email}"]
}

resource "google_project_service_identity" "pubsub_agent" {
  provider = google-beta
  project  = local.gcp_project_id
  service  = "pubsub.googleapis.com"
}

#Commercetools Permissions
data "google_iam_policy" "publisher" {
  binding {
    role = "roles/pubsub.publisher"
    members = [
      "serviceAccount:subscriptions@commercetools-platform.iam.gserviceaccount.com",
    ]
  }
}

resource "google_pubsub_topic_iam_policy" "commercetools_sa_policy" {
  project     = google_pubsub_topic.commercetools.project
  topic       = google_pubsub_topic.commercetools.name
  policy_data = data.google_iam_policy.publisher.policy_data
}
