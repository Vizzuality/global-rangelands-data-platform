import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";


export const GrasslandNaturalAbsolute: ContinuousDataset = {
  assetPath: {
    default: "projects/global-pasture-watch/assets/ggc-30m/v1/nat-semi-grassland_p"
  },

  vizParams: {
    bands: ['probability'],
    min: 0,
    max: 100,
    palette: ['f7f1e5','af8260','803d3b','322c2b'] 
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
