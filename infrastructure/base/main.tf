terraform {
  backend "gcs" {
    // TF does not allow vars here. Use the value from var.bucket_name from the remote-state project
    bucket = "rangelands-tf-state"
    // TF does not allow vars here. Use the value from var.tf_state_prefix
    prefix = "state"
  }
}

module "staging" {
  source              = "./modules/env"
  gcp_project_id      = var.gcp_project_id
  gcp_region          = var.gcp_region
  github_org          = var.github_org
  github_project      = var.github_project
  github_branch       = "staging"
  project_name        = var.staging_project_name
  frontend_min_scale  = 0
  backend_min_scale   = 0
  frontend_max_scale  = 1
  backend_max_scale   = 2
  dns_zone_name       = module.dns.dns_zone_name
  domain              = var.domain
  subdomain           = var.staging_subdomain
  backend_path_prefix = "cms"
  cloud_functions_path_prefix = "functions"
  eet_function_path_prefix = "eet"
  eet_function_available_memory = "512M"
  eet_function_min_instance_count = 0
  eet_function_max_instance_count = 2
  eet_function_max_instance_request_concurrency = 160
  uptime_alert_email  = var.uptime_alert_email
  environment         = "staging"
  database_name       = "strapi"
  database_user       = "strapi"
}

resource "google_storage_bucket" "landing_page_bucket" {
  name = "rdp-landing-bucket"
  project = var.gcp_project_id
  location = "US"
  storage_class = "STANDARD"
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

// https://stackoverflow.com/questions/75373877/how-to-create-public-google-bucket-with-uniform-bucket-level-access-enabled
// https://cloud.google.com/storage/docs/uniform-bucket-level-access
resource "google_storage_bucket_iam_member" "landing_bucket_permissions"{
  bucket = google_storage_bucket.landing_page_bucket.name
  member = "allUsers"
  role = "roles/storage.objectViewer"
}

/*
module "production" {
  source              = "./modules/env"
  gcp_project_id      = var.gcp_project_id
  gcp_region          = var.gcp_region
  github_org          = var.github_org
  github_project      = var.github_project
  github_branch       = "main"
  project_name        = var.production_project_name
  frontend_min_scale  = 0
  backend_min_scale   = 0
  frontend_max_scale  = 1
  backend_max_scale   = 2
  dns_zone_name       = module.dns.dns_zone_name
  domain              = var.domain
  subdomain           = var.production_subdomain
  backend_path_prefix = "cms"
  uptime_alert_email  = var.uptime_alert_email
  environment         = "production"
  database_name       = "strapi"
  database_user       = "strapi"
}
*/

module "dns" {
  source = "./modules/dns"
  domain = var.domain
  name   = "domain"
}

//// domain, emailalert
///rangelandsdata.org
/// rangelandsdata.org/rangelandsdataplatform