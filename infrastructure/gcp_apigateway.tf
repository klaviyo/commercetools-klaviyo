resource "google_project_service" "api_gw_api" {
  service            = "apigateway.googleapis.com"
  disable_on_destroy = false
}
resource "google_project_service" "service_control_api" {
  service            = "servicecontrol.googleapis.com"
  disable_on_destroy = false
}

resource "google_api_gateway_api" "bulk_import" {
  provider   = google-beta
  api_id     = "${var.gcp_environment_namespace}-bulk-import"
  project    = local.gcp_project_id
  depends_on = [google_project_service.api_gw_api]
}

resource "google_api_gateway_api_config" "api_cfg" {
  provider      = google-beta
  api           = google_api_gateway_api.bulk_import.api_id
  project       = local.gcp_project_id
  api_config_id = "${var.gcp_environment_namespace}-bulk-import-cfg"

  openapi_documents {
    document {
      path = "openapi2-run.yaml"
      contents = base64encode(<<-EOF
        swagger: '2.0'
        info:
          title: dev-bulk-import klaviyo CT plugin for commercetools bulk import API
          description: Sample API on API Gateway with a Cloud Run backend
          version: 1.0.0
        schemes:
          - https
        produces:
          - application/json
        x-google-backend:
          address: ${google_cloud_run_service.klaviyo_ct_plugin_bulk_import.status[0].url}
        paths:
          /sync/orders:
            post:
              summary: Sync all commercetools orders to Klaviyo
              operationId: sync-orders
              parameters:
                - in: body
                  name: Parameters
                  description: Optional parameters for the bulk import job
                  schema:
                    type: object
                    properties:
                      ids:
                          type: array
                          items:
                            type: string
              responses:
                '202':
                  description: Request accepted
                  schema:
                    type: string
          /sync/orders/stop:
            post:
              summary: Stop syncing all commercetools orders to Klaviyo
              operationId: sync-orders-stop
              responses:
                '202':
                  description: Request accepted
                  schema:
                    type: string
          /sync/customers:
            post:
              summary: Sync all commercetools customers to Klaviyo
              operationId: sync-customers
              responses:
                '202':
                  description: Request accepted
                  schema:
                    type: string
          /sync/customers/stop:
            post:
              summary: Stop syncing all commercetools customers to Klaviyo
              operationId: sync-customers-stop
              responses:
                '202':
                  description: Request accepted
                  schema:
                    type: string
    EOF
      )
    }
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "google_api_gateway_gateway" "gw" {
  provider = google-beta
  project  = local.gcp_project_id
  region   = var.location

  api_config = google_api_gateway_api_config.api_cfg.id

  gateway_id   = "${var.gcp_environment_namespace}-bulk-import-gw"
  display_name = "Bulk import gateway"

  depends_on = [google_api_gateway_api_config.api_cfg]
}
