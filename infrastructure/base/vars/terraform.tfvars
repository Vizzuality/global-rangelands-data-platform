gcp_region     = "us-central1"
gcp_zone       = "us-central1-a" //TBD
gcp_project_id = "gmvad-grass"

github_org     = "Vizzuality"
github_project = "global-rangelands-data-platform"

//Project name here is abbreviated to rdp (rangelands data platform), because the length restriction on some resources
//can be quite short (e.g. VPC connector 25 chars, rangelands-staging-vpc-con is more than 25 chars)
staging_project_name    = "rdp-staging" //
production_project_name = "rdp-prod"

domain = "rangelandsdata.org" //TBD
staging_subdomain = "staging" //TBD
production_subdomain = "" //TBD

uptime_alert_email = "rangelandsdataplatform@gmv.com"
