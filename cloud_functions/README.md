# Global rangelands cloud functions

Alerts and analysis accessing for the mangrove atlas project

## Cloud functions

[Documentation of the library](https://www.npmjs.com/package/@google-cloud/functions-framework) to simulate a cloud function in your local machine.
In order to deploy the cloud function you need to create a service account and a bucket in Google Cloud Storage.

Also automatic deployment of the cloud function is available at push in develop/master

### earth engine tiler

1. Go to the folder `earth_engine_tiler`
2. Download `credentials.json` and save to the root of the project (you will require access to google earth engine).
3. For development run `npm install && npm run watch`.
4. Open the browser and go to `http://localhost:8080/`

By default the endpoint returns all data for all locations and aggregated by month.

Params:

* `location_id`, location ID from Mangrove API. Optional.
* `start_date`, start date in format `YYYY-MM-DD`. Optional.
* `end_date`, end date in format `YYYY-MM-DD`. Optional.
* geometry, geojson of the area to filter. Optional, should be located in the body.

Example request:  

``` bash
curl -X GET -G \
'http://localhost:8080?location_id=MOZ&start_date=2019-01-01&end_date=2022-01-01' 
```

Example response:

``` json
[
 {
 "date": {
 "value": "2020-01-01"
 },
 "count": 492
 }
]
```

#### Deploying the function

```bash
gcloud functions deploy fetch-alerts --runtime nodejs10 --trigger-http --memory 128MB --timeout 540s --region us-central1 --entry-point fetchAlerts --service-account-file ./credentials.json --source ./cloud-functions/fetch-alerts
```

``` bash
curl --request GET 'https://us-central1-mangrove-atlas-246414.cloudfunctions.net/fetch-alerts?location_id=MOZ&start_date=2019-01-01&end_date=2022-01-01'
```
