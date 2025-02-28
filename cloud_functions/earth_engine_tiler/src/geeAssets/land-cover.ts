import { CategoricalDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";

export const LandCover: CategoricalDataset = {
  assetPath: {
    default: "ESA/WorldCover/v200"
  },

  bandName: 'Map',

  sldStyles: '<RasterSymbolizer>' +
  '<ColorMap type="values" extended="false">' +
    '<ColorMapEntry color="#006400" quantity="10" />' + // 	Tree cover
    '<ColorMapEntry color="#ffbb22" quantity="20" />' + // 	Shrubland
    '<ColorMapEntry color="#ffff4c" quantity="30" />' + // 	Grassland
    '<ColorMapEntry color="#f096ff" quantity="40" />' + // 	Cropland
    '<ColorMapEntry color="#fa0000" quantity="50" />' + // 	Built-up
    '<ColorMapEntry color="#b4b4b4" quantity="60" />' + // 	Bare / sparse vegetation
    '<ColorMapEntry color="#f0f0f0" quantity="70" />' + // 	Snow and ice
    '<ColorMapEntry color="#0064c8" quantity="80" />' + // 	Permanent water bodies
    '<ColorMapEntry color="#0096a0" quantity="90" />' + // 	Herbaceous wetland
    '<ColorMapEntry color="#00cf75" quantity="95" />' + // 	Mangroves
    '<ColorMapEntry color="#fae6a0" quantity="100" />' + // Moss and lichen
    
  '</ColorMap>' + '</RasterSymbolizer>',

  areYearsValid (startYear?: number, endYear?: number) : boolean {
    //This Asset is static, and year selector are irrelevant
    return true;
  },

  getEEAsset() {
    return ee.ImageCollection(this.assetPath.default).first();
  },

  async getMapUrl(z, x, y) {
    const image = this.getEEAsset().select(this.bandName).sldStyle(this.sldStyles);

    const mapId = await EarthEngineUtils.getMapId(image);

    return ee.data.getTileUrl( mapId, x, y, z );
  },
};
