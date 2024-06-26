import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';


export const ModisNetPrimaryProductionDataset: ContinuousDataset = {
  assetPath: {
    default: "MODIS/061/MOD17A3HGF"
  },

  vizParams: {
    bands: ['Npp'],
    min: 0.0,
    max: 20000.0,
    palette: ['bbe029', '0a9501', '074b03']
  },

  areYearsValid (startYear, endYear) : boolean {
    //This Asset is meant for tiles of a single year. startYear only will be used as the selector for the info required
    // endYear is unneeded and ignored
    if(!startYear){
      throw new Error(`Year '${startYear}' is not valid`)
    }
    return true;
  },

  getEEAsset() {
    return ee.ImageCollection(this.assetPath.default);
  },

  getMapUrl(z, x, y, startYear, endYear) {
    const image = this.getEEAsset()
      .filter( ee.Filter.date( `${String(startYear)}-01-01`, `${String(startYear)}-12-31` ) );
    return ee.data.getTileUrl( image.getMapId(this.vizParams), x, y, z );
  },
};
