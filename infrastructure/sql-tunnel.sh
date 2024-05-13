SQL_NAME=gmvad-grass:us-central1:rdp-staging-cjhi

ssh -L 5433:localhost:5433 -i ~/.ssh/google_compute_engine -p 4226 localhost -- ./cloud-sql-proxy $SQL_NAME --port=5433 --private-ip
