import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";


export const SurfaceWater: ContinuousDataset = {
  assetPath: {
    default: "JRC/GSW1_4/GlobalSurfaceWater"
  },

  vizParams: {
    bands: ['occurrence'],
    min: 0,
    max: 100,
    palette: ['ffffff', 'ffbbbb', '0000ff']
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