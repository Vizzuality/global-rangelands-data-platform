import { IDataAsset } from './EEDataset';
import ee from '@google/earthengine';


export const ModisNetPrimaryProduction: IDataAsset = {
  assetPath: {
    default: "MODIS/061/MOD17A3HGF"
  },
  numYears: 20,
  vizParams: {
    bands:['Npp'],
    min: 0.0,
    max: 20000.0,
    palette: ['bbe029', '0a9501', '074b03'],
  },
  getEEAsset(){
    return ee.ImageCollection(this.assetPath.default);
  }
  getMapUrl(z, x, y, year) {
    const image = ee.ImageCollection(this.assetPath.default).filter(ee.Filter.date(`${String(year)}-01-01`, `${String(year)}-12-31`));
    const url = ee.data.getTileUrl(image.getMapId(this.vizParams),x,y,z)

    return url;
  },
};
