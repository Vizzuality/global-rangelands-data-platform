import { EarthEngineCollection } from './earth-engine-dataset';
import ee from '@google/earthengine';


export const ModisNetPrimaryProductionDataset: EarthEngineCollection = {
  assetPath: {
    default: "MODIS/061/MOD17A3HGF"
  },

  vizParams: {
    bands: ['Npp'],
    min: 0.0,
    max: 20000.0,
    palette: ['bbe029', '0a9501', '074b03']
  },

  isYearValid (year?: number) : boolean {
    if(!year){
      throw new Error(`Year '${year}' is not valid`)
    }
    return true;
  },

  getEEAsset() {
    return ee.ImageCollection(this.assetPath.default);
  },

  getMapUrl(z, x, y, year) {
    const image = this.getEEAsset()
      .filter( ee.Filter.date( `${String(year)}-01-01`, `${String(year)}-12-31` ) );
    return ee.data.getTileUrl( image.getMapId(this.vizParams), x, y, z );
  },
};
