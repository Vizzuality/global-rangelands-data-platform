# Global Rangelands Cloud Functions

[Documentation of the library](https://www.npmjs.com/package/@google-cloud/functions-framework) to simulate a cloud function in your local machine.
In order to deploy the cloud function you need to create a service account and a bucket in Google Cloud Storage.

Also automatic deployment of the cloud function is available at push in staging/production

## Earth Engine Tiler (EET)

For local development:
1. Go to the folder `earth_engine_tiler`
2. Download the EE Service Account credentials json, with the name `ee_credentials.json` and save it to the root of the cloud function folder (you will require access to google earth engine).
3. For development run `npm install && npm run watch`.
4. Open the browser and go to `http://localhost:8080/`

The function grabs the EE credentials from the `EE_CREDENTIALS_JSON` environment variable, which in GCP Cloud Functions will get injected from the corresponding secret that must been created by the corresponding previous Terraform installation; if not present it will grab the credentials from the local `ee_credentials.json` file.  

The path follows the subsequent format:

`GET /:z/:x/:y/?tileset=&year=`


Params:

* `x`, `y` `z`, are the coordinates for the tile.
* `tileset`is a string indicating the asset from where to get the tile, defined on `tile-request-dto.ts`.
* `year`, year of the asset to inspect. Can be optional or not, depending on the asset being referenced on `tileset`.

Example request:  

``` bash
curl -X GET -G \
'http://localhost:8080/1/2/3/?tileset=modis_net_primary_production&year=2020' 
```

Response:

Binary Image data representing the tile requested



### Deploying the function

```bash
gcloud functions deploy rdp-<environment>-eet --region=us-central1 --source ./cloud-functions/fetch-alerts
```

``` bash
curl --request GET 'https://us-central1-mangrove-atlas-246414.cloudfunctions.net/fetch-alerts?location_id=MOZ&start_date=2019-01-01&end_date=2022-01-01'
```
