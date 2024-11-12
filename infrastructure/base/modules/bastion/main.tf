resource "google_project_service" "compute_api" {
  service            = "compute.googleapis.com"
  project = var.project_id
  disable_on_destroy = false
}

resource "google_compute_instance" "bastion" {
  name         = "${var.name}-bastion"
  machine_type = "e2-micro"


  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    subnetwork = var.subnetwork_name
    access_config {}
  }

  service_account {
    email  = data.google_compute_default_service_account.default.email
    scopes = ["cloud-platform"]
  }

  allow_stopping_for_update = true

  metadata = {
    ssh-keys = join( "\n", [for ssh-key in var.ssh_keys : "ubuntu:${ssh-key}"])
  }

  lifecycle {
    ignore_changes = [
      boot_disk,
      labels,
    ]
  }
}

data "google_compute_default_service_account" "default" {
  depends_on = [google_project_service.compute_api]
}

resource "google_project_iam_member" "sql_reader" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${data.google_compute_default_service_account.default.email}"
}
