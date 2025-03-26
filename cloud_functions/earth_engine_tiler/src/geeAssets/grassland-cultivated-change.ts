import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";


export const GrasslandCultivatedChange: ContinuousDataset = {
  assetPath: {
    default: "projects/global-pasture-watch/assets/ggc-30m/v1/cultiv-grassland_p"
  },

  vizParams: {
    bands: ['probability'],
    min: -100,
    max: 100,
    palette: ["#B30200", '#FFFFCC', '#066C59']
  },

  areYearsValid (startYear?: number, endYear?: number) : boolean {
    if(!startYear){
      throw new Error(`startYear '${startYear}' is not valid`)
    }
    if(!endYear){
      throw new Error(`endYear '${endYear}' is not valid`)
    }
    return true;
  },

  getEEAsset() {
    return ee.ImageCollection(this.assetPath.default);
  },

  async getMapUrl(z, x, y, startYear, endYear) {

    const image_start = this.getEEAsset()
      .filter( ee.Filter.date( `${String(startYear)}-01-01`, `${String(startYear)}-12-31` ) )
      .first();

    const image_end = this.getEEAsset()
      .filter( ee.Filter.date( `${String(endYear)}-01-01`, `${String(endYear)}-12-31` ) )
      .first();

    const image = image_end.subtract(image_start)

    const mapId = await EarthEngineUtils.getMapId(image, this.vizParams);

    return ee.data.getTileUrl( mapId, x, y, z );
  },
};
