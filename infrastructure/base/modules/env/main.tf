locals {
  domain = var.subdomain == "" ? var.domain : "${var.subdomain}.${var.domain}"
}

resource "google_project_service" "iam_service" {
  project = var.gcp_project_id
  service = "iam.googleapis.com"
}

module "network" {
  source     = "../network"
  project_id = var.gcp_project_id
  region     = var.gcp_region
  name       = var.project_name
}

module "frontend_gcr" {
  source     = "../gcr"
  project_id = var.gcp_project_id
  region     = var.gcp_region
  name       = "${var.project_name}-frontend"
}

module "backend_gcr" {
  source     = "../gcr"
  project_id = var.gcp_project_id
  region     = var.gcp_region
  name       = "${var.project_name}-backend"
}

module "postgres_application_user_password" {
  source           = "../secret_value"
  region           = var.gcp_region
  key              = "${var.project_name}_postgres_user_password"
  use_random_value = true
}

//This credentials json file is not commited to the VCS and must be
// placed locally in the correct path when deploying infrastructure changes
module "earth_engine_credentials" {
  source  = "../secret_value"
  region  = var.gcp_region
  key     = "${var.project_name}_earth_engine_credentials_json"
  value   = file("${path.root}/../../cloud_functions/earth_engine_tiler/ee_credentials.json")
}

module "frontend_cloudrun" {
  source             = "../cloudrun"
  name               = "${var.project_name}-fe"
  region             = var.gcp_region
  project_id         = var.gcp_project_id
  repository         = module.frontend_gcr.repository_name
  container_port     = 3000
  vpc_connector_name = module.network.vpc_access_connector_name
  database           = module.database.database
  min_scale          = var.frontend_min_scale
  max_scale          = var.frontend_max_scale
  tag                = var.environment
}

module "backend_cloudrun" {
  source             = "../cloudrun"
  name               = "${var.project_name}-be"
  region             = var.gcp_region
  project_id         = var.gcp_project_id
  repository         = module.backend_gcr.repository_name
  container_port     = 1337
  vpc_connector_name = module.network.vpc_access_connector_name
  database           = module.database.database
  min_scale          = var.backend_min_scale
  max_scale          = var.backend_max_scale
  tag                = var.environment
}

module "eet_cloud_function" {
  source                           = "../cloudfunction"
  region                           = var.gcp_region
  project                          = var.gcp_project_id
  vpc_connector_name               = module.network.vpc_access_connector_name
  function_name                    = "${var.project_name}-eet"
  description                      = "Earth Engine Tiler Cloud Function"
  source_dir                       = "${path.root}/../../cloud_functions/earth_engine_tiler"
  runtime                          = "nodejs20"
  entry_point                      = "eetApp"
  runtime_environment_variables    = local.eet_cloud_function_env
  secrets                          = local.eet_cloud_function_secrets
  timeout_seconds                  = var.eet_function_timeout_seconds
  available_memory                 = var.eet_function_available_memory
  available_cpu                    = var.eet_function_available_cpu
  min_instance_count               = var.eet_function_min_instance_count
  max_instance_count               = var.eet_function_max_instance_count
  max_instance_request_concurrency = var.eet_function_max_instance_request_concurrency

  depends_on = [module.postgres_application_user_password]
}


locals {
  eet_cloud_function_env = {}

  eet_cloud_function_secrets = [{
    key        = "EE_CREDENTIALS_JSON"
    project_id = var.gcp_project_id
    secret     = module.earth_engine_credentials.secret_name
    version    = module.earth_engine_credentials.latest_version
  }]
}

module "database" {
  source            = "../sql"
  name              = var.project_name
  project_id        = var.gcp_project_id
  region            = var.gcp_region
  database_name     = var.database_name
  database_user     = var.database_user
  database_password = module.postgres_application_user_password.secret_value
  network_id        = module.network.network_id

  # explicit dependency for:
  # Error, failed to create instance because the network doesn't have at least 1 private services connection.
  depends_on = [module.network.vpc_access_connector_name]
}


module "bastion" {
  source          = "../bastion"
  name            = var.project_name
  project_id      = var.gcp_project_id
  subnetwork_name = module.network.subnetwork_name
}

module "client_uptime_check" {
  source     = "../uptime-check"
  name       = "${var.project_name} Client"
  host       = element(split("/", module.frontend_cloudrun.cloudrun_service_url), 2)
  email      = var.uptime_alert_email
  project_id = var.gcp_project_id
}

module "cms_uptime_check" {
  source     = "../uptime-check"
  name       = "${var.project_name} CMS"
  host       = element(split("/", module.backend_cloudrun.cloudrun_service_url), 2)
  email      = var.uptime_alert_email
  project_id = var.gcp_project_id
}

module "backend_error_reporting" {
  source                        = "../error-reporting"
  project_id                    = var.gcp_project_id
  backend_service_account_email = module.backend_cloudrun.service_account_email
}

//////////////////
// Secrets and tokens
resource "random_password" "api_token_salt" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "admin_jwt_secret" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "transfer_token_salt" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "jwt_secret" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_password" "app_key" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

///////////////////////////
// Service Account
resource "google_service_account" "deploy_service_account" {
  account_id   = "${var.project_name}-deploy-sa"
  display_name = "${var.project_name} Deploy Service Account"
}

resource "google_service_account_key" "deploy_service_account_key" {
  service_account_id = google_service_account.deploy_service_account.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

resource "google_project_iam_member" "deploy_service_account_roles" {
  count = length(var.roles)

  project = var.gcp_project_id
  role    = var.roles[count.index]
  member  = "serviceAccount:${google_service_account.deploy_service_account.email}"
}

variable "roles" {
  description = "List of roles to grant to the Cloud Run Deploy Service Account"
  type        = list(string)
  default = [
    "roles/iam.serviceAccountTokenCreator",
    "roles/iam.serviceAccountUser",
    "roles/run.developer",
    "roles/artifactregistry.reader",
    "roles/artifactregistry.writer",
    "roles/cloudfunctions.developer"
  ]
}



module "load_balancer" {
  source                  = "../load-balancer"
  region                  = var.gcp_region
  project                 = var.gcp_project_id
  name                    = var.project_name
  backend_cloud_run_name  = module.backend_cloudrun.name
  frontend_cloud_run_name = module.frontend_cloudrun.name
  cloud_function_name     = module.eet_cloud_function.function_name
  cloud_function_path_prefix = var.cloud_functions_path_prefix
  eet_function_path_prefix = var.eet_function_path_prefix
  domain                  = var.domain
  subdomain               = var.subdomain
  dns_managed_zone_name   = var.dns_zone_name
  backend_path_prefix     = var.backend_path_prefix
}
