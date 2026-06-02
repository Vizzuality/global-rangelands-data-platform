import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import { EarthEngineUtils } from "../earth-engine-utils";

export const IntactnessQSlope: ContinuousDataset = {
  assetPath: {
    default: "projects/my-project-ilri-57371/assets/GRASS/intactness_Qslope_2009"
  },

  // The visualization parameters will be defined here
  vizParams: {
    bands: ['classified'],  // Reference the 'classified' band
    min: 0,
    max: 9,  // 10 quantile classes
    palette: [
      "#d7191c",  // 0 - 0.761
      "#ef7647",  // 0.761 - 1.48
      "#f79a5a",  // 1.48 - 1.97
      "#fec980",  // 1.97 - 2.01
      "#ffedaa",  // 2.01 - 2.06
      "#ecf7b9",  // 2.06 - 2.15
      "#c7e8ad",  // 2.15 - 2.33
      "#9bd1a9",  // 2.33 - 2.6
      "#64abb0",  // 2.6 - 20.2
      "#2b83ba"   // Above 20.2
    ]
  },

  getEEAsset() {
    let image = ee.Image(this.assetPath.default).divide(1000); // Normalize values by dividing by 1000

    // Preserve original NoData mask
    const mask = image.mask();

    // Define breakpoints for classification
    const breakpoints = ee.List([0, 0.761, 1.48, 1.97, 2.01, 2.06, 2.15, 2.33, 2.6, 20.2]);

    // Apply classification based on the breakpoints
    let classified = ee.Image(0);  // Start with an image of 0s
    for (let i = 0; i < breakpoints.size().getInfo() - 1; i++) {
      const lower = breakpoints.get(i);
      const upper = breakpoints.get(i + 1);
      classified = classified.add(
        image.gte(ee.Number(lower))
          .and(image.lt(ee.Number(upper)))
          .multiply(i)
      );
    }

    return classified.rename('classified').updateMask(mask);
  },

  areYearsValid(startYear?: number, endYear?: number): boolean {
    return true; // This asset is static, so year selector is irrelevant
  },

  async getMapUrl(z, x, y, startYear, endYear) {
    const image = this.getEEAsset().visualize(this.vizParams);
    const mapId = await EarthEngineUtils.getMapId(image);

    // Return the tile URL based on the mapId and the tile coordinates
    return ee.data.getTileUrl(mapId, x, y, z);
  }
};
