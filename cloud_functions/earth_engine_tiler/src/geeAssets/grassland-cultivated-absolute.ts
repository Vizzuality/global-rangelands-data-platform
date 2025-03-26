import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";


export const GrasslandCultivatedAbsolute: ContinuousDataset = {
  assetPath: {
    default: "projects/global-pasture-watch/assets/ggc-30m/v1/cultiv-grassland_p"
  },

  vizParams: {
    bands: ['probability'],
    min: 0,
    max: 100,
    palette: ['f5f5f5','fdaf27','ae7947','3a2200']
  },

  areYearsValid (startYear, endYear) : boolean {
    //This Asset is meant for tiles of a single year. startYear only will be used as the selector for the info required
    // endYear is unneeded and ignored
    if(!startYear){
      throw new Error(`Start Year '${startYear}' is not valid`)
    }
    return true;
  },

  getEEAsset() {
    return ee.ImageCollection(this.assetPath.default);
  },

  async getMapUrl(z, x, y, startYear, endYear) {
    const image = this.getEEAsset()
      .filter( ee.Filter.date( `${String(startYear)}-01-01`, `${String(startYear)}-12-31` ) );

    const mapId = await EarthEngineUtils.getMapId(image, this.vizParams);

    return ee.data.getTileUrl( mapId, x, y, z );
  },
};
