import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';


export const ForestLoss: ContinuousDataset = {
  assetPath: {
    default: "UMD/hansen/global_forest_change_2023_v1_11"
  },

  vizParams: {
    bands: ['lossyear'],
    min: 0,
    max: 23,
    palette: ['#F1EEF6', '#C37D9F', '#760B39']
  },

  areYearsValid (startYear?: number, endYear?: number) : boolean {
    //This Asset is static, and year selector are irrelevant
    return true;
  },

  getEEAsset() {
    return ee.Image(this.assetPath.default);
  },

  getMapUrl(z, x, y, startYear, endYear) {
    const image = this.getEEAsset()
    return ee.data.getTileUrl( image.getMapId(this.vizParams), x, y, z );
  },
};