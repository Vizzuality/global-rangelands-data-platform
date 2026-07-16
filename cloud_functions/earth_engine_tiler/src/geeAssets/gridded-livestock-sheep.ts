import { CategoricalDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import { EarthEngineUtils } from "../earth-engine-utils";
import { GriddedLivestockCommonStyles} from "./common-styles-utils";

export const GriddedLivestockSheep: CategoricalDataset = {
    assetPath: {
        default: "projects/my-project-ilri-57371/assets/GRASS/5_Sh_2015_Da"
    },

    bandName: 'b1',

    sldStyles: GriddedLivestockCommonStyles,
    

    areYearsValid(startYear?: number, endYear?: number): boolean {
        // This Asset is static, and year selector is irrelevant
        return true;
    },

    getEEAsset() {
        return ee.Image(this.assetPath.default);
    },

    async getMapUrl(z, x, y) {
        const image = this.getEEAsset().select(this.bandName).sldStyle(this.sldStyles);
        const mapId = await EarthEngineUtils.getMapId(image);
        return ee.data.getTileUrl(mapId, x, y, z);
    },
};
