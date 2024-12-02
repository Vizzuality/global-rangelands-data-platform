import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import { EarthEngineUtils } from "../earth-engine-utils";

export const ForestGain: ContinuousDataset = {
  assetPath: {
    default: "projects/glad/GLCLU2020/Forest_gain"
  },

  vizParams: {
    bands: ['b1'],
    min: 0,
    max: 1, 
    palette: ['#008000']
  },

  areYearsValid(startYear?: number, endYear?: number): boolean {
    // This Asset is static, and year selector is irrelevant
    return true;
  },

  getEEAsset() {
    // Apply mask
    const rawImage = ee.Image(this.assetPath.default);
    const maskedImage = rawImage
      .select('b1')
      .updateMask(rawImage); // Mask out no-data pixels

    return maskedImage;
  },

  async getMapUrl(z, x, y, startYear, endYear) {
    const image = this.getEEAsset()

    const mapId = await EarthEngineUtils.getMapId(image, this.vizParams);

    return ee.data.getTileUrl( mapId, x, y, z );
  },
};
