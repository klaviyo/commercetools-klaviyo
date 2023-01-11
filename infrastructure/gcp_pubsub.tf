resource "google_pubsub_topic" "commercetools" {
  name = "${var.environment}-commercetools-topic"

  #  labels = {
  #    foo = "bar"
  #  }

  message_retention_duration = "86400s"
}
resource "google_project_iam_binding" "project_token_creator" {
  project = local.project
  role    = "roles/iam.serviceAccountTokenCreator"
  members = ["serviceAccount:${google_project_service_identity.pubsub_agent.email}"]
}
resource "google_project_service_identity" "pubsub_agent" {
  provider = google-beta
  project  = local.project
  service  = "pubsub.googleapis.com"
}

#Commercetools Permissions
data "google_iam_policy" "publisher" {
  binding {
    role    = "roles/pubsub.publisher"
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




