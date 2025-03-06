import { ContinuousDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import {EarthEngineUtils} from "../earth-engine-utils";


export const ForestLoss: ContinuousDataset = {
  assetPath: {
    default: "UMD/hansen/global_forest_change_2023_v1_11"
  },

  vizParams: {
    bands: ['lossyear'],
    min: 0,
    max: 23,
    palette: [
      '#F1EEF6', // 2000
      '#ECE2ED', // 2001
      '#E7D7E4', // 2002
      '#E3CCDB', // 2003
      '#DEC0D3', // 2004
      '#DAB5CA', // 2005
      '#D5AAC1', // 2006
      '#D09EB9', // 2007
      '#CC93B0', // 2008
      '#C788A7', // 2009
      '#C37D9F', // 2010
      '#BD7497', // 2011
      '#B76B8F', // 2012
      '#B16287', // 2013
      '#AB597F', // 2014
      '#A55177', // 2015
      '#9F486F', // 2016
      '#993F68', // 2017
      '#933660', // 2018
      '#8D2E58', // 2019
      '#872550', // 2020
      '#811C48', // 2021
      '#7B1340', // 2022
      '#760A39'  // 2023
    ]
  },

  areYearsValid (startYear?: number, endYear?: number) : boolean {
    //This Asset is static, and year selector are irrelevant
    return true;
  },

  getEEAsset() {
    return ee.Image(this.assetPath.default);
  },

  async getMapUrl(z, x, y, startYear, endYear) {
    const image = this.getEEAsset()

    const mapId = await EarthEngineUtils.getMapId(image, this.vizParams);

    return ee.data.getTileUrl( mapId, x, y, z );
  },
};
