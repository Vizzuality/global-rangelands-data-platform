import { CategoricalDataset } from './earth-engine-dataset';
import ee from '@google/earthengine';
import { EarthEngineUtils } from "../earth-engine-utils";
import { GriddedLivestockBuffalo } from './gridded-livestock-buffalo';
import { GriddedLivestockCattle } from './gridded-livestock-cattle';
import { GriddedLivestockChicken } from './gridded-livestock-chicken';
import { GriddedLivestockDuck } from './gridded-livestock-duck';
import { GriddedLivestockGoat } from './gridded-livestock-goat';
import { GriddedLivestockHorse } from './gridded-livestock-horse';
import { GriddedLivestockPig } from './gridded-livestock-pig';
import { GriddedLivestockSheep } from './gridded-livestock-sheep';
import { GriddedLivestockTotalStyle } from "./common-styles-utils";

export const GriddedLivestockTotal: CategoricalDataset = {
    assetPath: {
    },
    bandName: 'b1',
    sldStyles: GriddedLivestockTotalStyle,

    areYearsValid(startYear?: number, endYear?: number): boolean {
        // This Asset is static, and year selector is irrelevant
        return true;
    },

    // Unmask(0) gives 0 to no data pixels so that they can be included in the sum
    getEEAsset() {
        const buffaloImage = ee.Image(GriddedLivestockBuffalo.assetPath.default).select(GriddedLivestockBuffalo.bandName).unmask(0);
        const cattleImage = ee.Image(GriddedLivestockCattle.assetPath.default).select(GriddedLivestockCattle.bandName).unmask(0);
        const chickenImage = ee.Image(GriddedLivestockChicken.assetPath.default).select(GriddedLivestockChicken.bandName).unmask(0);
        const duckImage = ee.Image(GriddedLivestockDuck.assetPath.default).select(GriddedLivestockDuck.bandName).unmask(0);
        const goatImage = ee.Image(GriddedLivestockGoat.assetPath.default).select(GriddedLivestockGoat.bandName).unmask(0);
        const horseImage = ee.Image(GriddedLivestockHorse.assetPath.default).select(GriddedLivestockHorse.bandName).unmask(0);
        const pigImage = ee.Image(GriddedLivestockPig.assetPath.default).select(GriddedLivestockPig.bandName).unmask(0);
        const sheepImage = ee.Image(GriddedLivestockSheep.assetPath.default).select(GriddedLivestockSheep.bandName).unmask(0);

        // Sum all the images
        const totalImage = buffaloImage
            .add(cattleImage)
            .add(chickenImage)
            .add(duckImage)
            .add(goatImage)
            .add(horseImage)
            .add(pigImage)
            .add(sheepImage);

        return totalImage;
    },

    async getMapUrl(z, x, y) {
        const image = this.getEEAsset().sldStyle(this.sldStyles);
        const mapId = await EarthEngineUtils.getMapId(image);
        return ee.data.getTileUrl(mapId, x, y, z);
    },
};