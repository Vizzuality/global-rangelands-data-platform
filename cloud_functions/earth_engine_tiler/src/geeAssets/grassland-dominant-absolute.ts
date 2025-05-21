import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";


export const GrasslandDominantAbsolute: ContinuousDataset = {
  assetPath: {
    default: "projects/global-pasture-watch/assets/ggc-30m/v1/grassland_c"
  },

  vizParams: {
    bands: ['dominant_class'],
    min: 0,
    max: 2,
    palette: ['#ff9916','#ffcd73']
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
    // Get the image collection and select the image for the year, then mask out value 0
    return ee.ImageCollection(this.assetPath.default)
      .map(img => img.updateMask(img.select('dominant_class').neq(0)));
  },

  async getMapUrl(z, x, y, startYear, endYear) {
    // Filter by year and get the first image
    let image = this.getEEAsset()
      .filter(ee.Filter.date(`${String(startYear)}-01-01`, `${String(startYear)}-12-31`))
      .first();

    // Mask out value 0 (make it transparent)
    image = image.updateMask(image.select('dominant_class').neq(0));

    // Adjust vizParams: min should be 1, palette should have only two colors
    const vizParams = {
      ...this.vizParams,
      min: 1,
      palette: ['#ff9916', '#ffcd73']
    };

    const mapId = await EarthEngineUtils.getMapId(image, vizParams);

    return ee.data.getTileUrl(mapId, x, y, z);
  },
};
