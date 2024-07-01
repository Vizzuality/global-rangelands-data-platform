import { CategoricalDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";

export const AnthropogenicBiomes: CategoricalDataset = {
  assetPath: {
    default: "projects/gmvad-grass/assets/a2000_global_ByteCompress"
  },

  bandName: 'b1',

  sldStyles: '<RasterSymbolizer>' +
  '<ColorMap type="values" extended="false">' +
    '<ColorMapEntry color="#A80000" quantity="11" />' + // Urban
    '<ColorMapEntry color="#FF0000" quantity="12" />' + // Mixed settlements
    '<ColorMapEntry color="#0070FF" quantity="21" />' + // Rice villages
    '<ColorMapEntry color="#00A9E6" quantity="22" />' + // Irrigated villages
    '<ColorMapEntry color="#A900E6" quantity="23" />' + // Rainfed villages
    '<ColorMapEntry color="#FF73DF" quantity="24" />' + // Pastoral villages
    '<ColorMapEntry color="#00FFC5" quantity="31" />' + // Residential irrigated croplands
    '<ColorMapEntry color="#E6E600" quantity="32" />' + // Residential rainfed croplands
    '<ColorMapEntry color="#FFFF73" quantity="33" />' + // Populated croplands
    '<ColorMapEntry color="#FFFFBE" quantity="34" />' + // Remote croplands
    '<ColorMapEntry color="#E69800" quantity="41" />' + // Residential rangelands
    '<ColorMapEntry color="#FFD37F" quantity="42" />' + // Populated rangelands
    '<ColorMapEntry color="#FFEBAF" quantity="43" />' + // Remote rangelands
    '<ColorMapEntry color="#38A800" quantity="51" />' + // Residential woodlands
    '<ColorMapEntry color="#A5F57A" quantity="52" />' + // Populated woodlands
    '<ColorMapEntry color="#D3FFB2" quantity="53" />' + // Remote woodlands
    '<ColorMapEntry color="#B2B2B2" quantity="54" />' + // Inhabited treeless and barren lands
    '<ColorMapEntry color="#DAF2EA" quantity="61" />' + // Wild woodlands
    '<ColorMapEntry color="#E1E1E1" quantity="62" />' + // Wild treeless and barren lands
  '</ColorMap>' + '</RasterSymbolizer>',

  areYearsValid (startYear?: number, endYear?: number) : boolean {
    //This Asset is static, and year selector are irrelevant
    return true;
  },

  getEEAsset() {
    return ee.Image(this.assetPath.default);
  },

  async getMapUrl(z, x, y) {
    const image = this.getEEAsset().select(this.bandName).sldStyle(this.sldStyles);

    const mapId = await EarthEngineUtils.getMapId(image);

    return ee.data.getTileUrl( mapId, x, y, z );
  },
};
