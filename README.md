# Global Rangelands Data Platform
The Global Rangelands Data Platform (a.k.a. GRDP) is a small geospatial data layers application to show insights on rangelands ecosystems across the globe.

This README is an early WIP, and will be edited as needed, as the project moves along.

## Key Components
- *Client*: The front-end application is implemented using Next.js, TypeScript, and Tailwind CSS. It provides an interface for the map visualization and data exploration.

- *Strapi Headless CMS*: The back-end application is implemented using Strapi, which provides a flexible content management system and exposes APIs for dynamic data retrieval.

- *TiTiler*: A Python FastAPI application for dynamic tiling, used for serving Raster tile data

External services:

- *Mapbox*: used for serving layers for the map

- *Transifex*: a globalization management system, used to localize the application into several languages.


This repository contains all the code and documentation necessary to set up and deploy the project. It is organized into the following subdirectories:

| Subdirectory name | Description                                                 | Documentation                                                                                            |
|-------------------|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| frontend          | The Next.js client application                            | [client/README.md](client/README.md)             |
| cms               | The Strapi CMS / API                                        | [cms/README.md](cms/README.md)             |
| titiler   | Titler Server                                                      | [titiler/README.md](cloud_functions/analysis/README.md)               |
| infrastructure    | The Terraform project & GH Actions workflow (provisioning & deployment to Google Cloud Platform) | [infrastructure/README.md](infrastructure/README.md) |

### Deployment and Infrastructure
The project is deployed on the Google Cloud Platform (GCP) using GitHub Actions for continuous integration and deployment. The infrastructure is provisioned and managed using Terraform scripts, ensuring consistent and reproducible deployments.
