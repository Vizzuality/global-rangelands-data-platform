import { EarthEngineCollection } from './earth-engine-dataset';
import ee from '@google/earthengine';


export const ModisNetPrimaryProductionChange: EarthEngineCollection = {
  assetPath: {
    default: "MODIS/061/MOD17A3HGF"
  },

  vizParams: {
    bands: ['Npp'],
    min: -5000,
    max: 5000,
    palette: ["#B30200", '#FFFFCC', '#066C59']
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

    const image_start = this.getEEAsset()
    .filter( ee.Filter.date( `${String(2001)}-01-01`, `${String(2001)}-12-31` ) ).first();

    const image_end = this.getEEAsset()
      .filter( ee.Filter.date( `${String(year)}-01-01`, `${String(year)}-12-31` ) ).first();

    const image = image_end.subtract(image_start)

    return ee.data.getTileUrl( image.getMapId(this.vizParams), x, y, z );
  },
};
