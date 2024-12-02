import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import { EarthEngineUtils } from "../earth-engine-utils";

export const PopulationCount: ContinuousDataset = {
  assetPath: {
    1975: "JRC/GHSL/P2023A/GHS_POP/1975",
    1990: "JRC/GHSL/P2023A/GHS_POP/1990",
    2020: "JRC/GHSL/P2023A/GHS_POP/2020"
  },

  vizParams: {
    bands: ['population_count'],
    min: 0.0,
    max: 100.0,
    palette: ['000004', '320A5A', '781B6C', 'BB3654', 'EC6824', 'FBB41A', 'FCFFA4']
  },

  areYearsValid(startYear?: number, endYear?: number): boolean {
    const validYears = [1975, 1990, 2020];
    if (!startYear || !validYears.includes(startYear)) {
      throw new Error(`Start Year '${startYear}' is not valid. Valid years are: ${validYears.join(", ")}`);
    }
    return true;
  },

  getEEAsset(startYear: string) {  // Change the parameter to string as per the type definition
    // Load the asset for the specified year
    const assetPath = this.assetPath[parseInt(startYear)]; // Convert the string to number if necessary
    if (!assetPath) {
      throw new Error(`Asset not found for year '${startYear}'`);
    }

    // Load the image and apply masking logic
    const rawImage = ee.Image(assetPath);
    return rawImage.updateMask(rawImage.gt(0)); // Mask out pixels with value 0
  },

  async getMapUrl(z: number, x: number, y: number, startYear: number, endYear?: number) {
    // Validate the year and get the asset
    this.areYearsValid(startYear, endYear);
    const image = this.getEEAsset(startYear);

    // Generate the mapId with visualization parameters
    const mapId = await EarthEngineUtils.getMapId(image, this.vizParams);

    // Return the Tile URL
    return ee.data.getTileUrl(mapId, x, y, z);
  },
};
