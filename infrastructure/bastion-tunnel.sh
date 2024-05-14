BASTION_NAME=rdp-staging-bastion

gcloud compute start-iap-tunnel $BASTION_NAME 22 --zone=us-central1-a --local-host-port=localhost:4226
