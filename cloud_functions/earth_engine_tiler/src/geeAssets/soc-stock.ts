import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";


export const SocStock: ContinuousDataset = {
  assetPath: {
    default: "projects/soilgrids-isric/ocs_mean"
  },

  vizParams: {
    bands: ['ocs_0-30cm_mean'],
    min: 0,
    max: 212,
    palette: ['#f6e8c3', '#c2b280', '#7b9e6c', '#447a50', '#1f5f8b', '#0b2b40']
  },

  areYearsValid (startYear?: number, endYear?: number) : boolean {
    //This Asset is static, and year selector are irrelevant
    return true;
  },

  getEEAsset() {
    return ee.Image(this.assetPath.default);
  },

  async getMapUrl(z, x, y, startYear, endYear) {
    const image = this.getEEAsset()

    const mapId = await EarthEngineUtils.getMapId(image, this.vizParams);

    return ee.data.getTileUrl( mapId, x, y, z );
  },
};