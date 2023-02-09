locals {
  subscriptions = [
    {
      key               = "${var.gcp_environment_namespace}-gcp-product-published"
      type              = "GoogleCloudPubSub"
      projectId         = var.gcp_project_id
      topic             = "${var.gcp_environment_namespace}-commercetools-topic"
      resource_type_ids = ["product"]
      resource_type_id  = "product"
      types             = ["ProductPublished"]
      queue_ref         = google_pubsub_topic.commercetools
    },
    {
      key               = "${var.gcp_environment_namespace}-gcp-order-created"
      type              = "GoogleCloudPubSub"
      projectId         = var.gcp_project_id
      topic             = "${var.gcp_environment_namespace}-commercetools-topic"
      resource_type_ids = ["order"]
      resource_type_id  = "order"
      types             = ["OrderCreated", "OrderStateChanged", "ReturnInfoSet", "ReturnInfoAdded", "OrderImported"]
      queue_ref         = google_pubsub_topic.commercetools
    },
    {
      key               = "${var.gcp_environment_namespace}-gcp-customer-created"
      type              = "GoogleCloudPubSub"
      projectId         = var.gcp_project_id
      topic             = "${var.gcp_environment_namespace}-commercetools-topic"
      resource_type_ids = ["customer"]
      resource_type_id  = "customer"
      types             = ["CustomerCreated"]
      queue_ref         = google_pubsub_topic.commercetools
    }
  ]
}


resource "commercetools_subscription" "subscription" {

  for_each = {
    for subscription in local.subscriptions : subscription.key => subscription
  }

  key = each.value.key

  destination {
    type       = each.value.type
    topic      = each.value.type == "GoogleCloudPubSub" ? each.value.topic : null
    project_id = each.value.type == "GoogleCloudPubSub" ? each.value.projectId : null
  }

  changes {
    resource_type_ids = each.value.resource_type_ids
  }

  message {
    resource_type_id = each.value.resource_type_id
    types            = each.value.types
  }

  lifecycle {
    create_before_destroy = true
  }
  depends_on = [google_pubsub_topic.commercetools, google_pubsub_topic_iam_policy.commercetools_sa_policy]
}
