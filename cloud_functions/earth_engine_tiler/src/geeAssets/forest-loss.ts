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
      '#BB7194', // 2011
      '#B3668A', // 2012
      '#AB5A80', // 2013
      '#A44F76', // 2014
      '#9C446C', // 2015
      '#943861', // 2016
      '#8D2D57', // 2017
      '#85214D', // 2018
      '#7D1643', // 2019
      '#760B39', // 2020
      '#760B39', // 2021
      '#760B39', // 2022
      '#760B39'  // 2023
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
