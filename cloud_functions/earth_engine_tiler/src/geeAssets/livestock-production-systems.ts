import { EarthEngineImage } from './earth-engine-dataset';
import ee from '@google/earthengine';

export const LivestockProductionSystems: EarthEngineImage = {
  assetPath: {
    default: "projects/gmvad-grass/assets/ps_cmb_ByteCompress"
  },

  bandName: 'b1',

  sldStyles: '<RasterSymbolizer>' + 
  '<ColorMap type="values" extended="false">' +
    '<ColorMapEntry color="#F9FFE5" quantity="1" />' + // LG Rangelands Hyperarid
    '<ColorMapEntry color="#FDFFBB" quantity="2" />' + // LG Rangelands Arid
    '<ColorMapEntry color="#F1CB7C" quantity="3" />' + // LG Rangelands Humid
    '<ColorMapEntry color="#C9AA69" quantity="4" />' + // LG Rangelands Temperate
    '<ColorMapEntry color="#DFF3C9" quantity="5" />' + // MR Mixed Rainfed Hyperarid
    '<ColorMapEntry color="#C6FFB9" quantity="6" />' + // MR Mixed RainfedArid
    '<ColorMapEntry color="#6EA91E" quantity="7" />' + // MR Mixed Rainfed Humid
    '<ColorMapEntry color="#2B7414" quantity="8" />' + // MR Mixed Rainfed Temperate
    '<ColorMapEntry color="#F4E2EC" quantity="9" />' + // MI Mixed Irrigated Hyperarid
    '<ColorMapEntry color="#E8BAFE" quantity="10" />' + // MI Mixed Irrigated Arid
    '<ColorMapEntry color="#DD6DDE" quantity="11" />' + // MI Mixed Irrigated Humid
    '<ColorMapEntry color="#71004D" quantity="12" />' + // MI Mixed Irrigated Temperate
    '<ColorMapEntry color="#373737" quantity="13" />' + // Urban
    '<ColorMapEntry color="#E0E0E0" quantity="14" />' + // Other
  '</ColorMap>' + '</RasterSymbolizer>',

  areYearsValid (startYear?: number, endYear?: number) : boolean {
    //This Asset is static, and year selector are irrelevant
    return true;
  },

  getEEAsset() {
    return ee.Image(this.assetPath.default);
  },

  getMapUrl(z, x, y) {
    const image = this.getEEAsset().select(this.bandName).sldStyle(this.sldStyles);
    return ee.data.getTileUrl( image.getMapId(), x, y, z );
  },
};
