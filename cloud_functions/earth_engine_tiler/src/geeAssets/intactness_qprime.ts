import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";


export const IntactnessQPrime: ContinuousDataset = {
  assetPath: {
    default: "projects/gmvad-grass/assets/intactness/intactness_Qprime_2009"
  },

  vizParams: {
    bands: ['b1'],
    min: 0,
    max: 1,
    palette: [
      '#d7191c', // 0
      '#ee7245', // 0.1
      '#f59053', // 0.2
      '#fdbe74', // 0.3
      '#fedf99', // 0.4
      '#ffffbf', // 0.5
      '#ddf1b4', // 0.6
      '#bce4a9', // 0.7
      '#91cba8', // 0.8
      '#5ea7b1', // 0.9
      '#2b83ba', // 1
    ]
  },

  areYearsValid (startYear?: number, endYear?: number) : boolean {
    //This Asset is static, and year selector are irrelevant
    return true;
  },

  getEEAsset() {
    return ee.Image(this.assetPath.default).divide(1000);
  },

  async getMapUrl(z, x, y, startYear, endYear) {
    const image = this.getEEAsset()

    const mapId = await EarthEngineUtils.getMapId(image, this.vizParams);

    return ee.data.getTileUrl( mapId, x, y, z );
  },
};
