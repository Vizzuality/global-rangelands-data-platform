variable "name" {
  type = string
}

variable "project_id" {
  type        = string
  description = "GCP project id"
}

variable "subnetwork_name" {
  type = string
}


variable "ssh_keys" {
  type        = list(string)
  description = "List of SSH keys to add to the bastion host"
}