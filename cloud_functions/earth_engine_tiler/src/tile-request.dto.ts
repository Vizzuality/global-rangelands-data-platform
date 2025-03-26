import {IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional} from "class-validator";
import {Type} from "class-transformer";

export enum Tilesets {
  modis_net_primary_production = "modis_net_primary_production",
  modis_net_primary_production_change = "modis_net_primary_production_change",
  anthropogenic_biomes = "anthropogenic_biomes",
  livestock_production_systems = "livestock_production_systems",
  forest_loss = "forest_loss",
  gridded_livestock_total = "gridded_livestock_total",
  gridded_livestock_buffalo = "gridded_livestock_buffalo",
  gridded_livestock_cattle = "gridded_livestock_cattle",
  gridded_livestock_chicken = "gridded_livestock_chicken",
  gridded_livestock_duck = "gridded_livestock_duck",
  gridded_livestock_goat = "gridded_livestock_goat",
  gridded_livestock_horse = "gridded_livestock_horse",
  gridded_livestock_pig = "gridded_livestock_pig",
  gridded_livestock_sheep = "gridded_livestock_sheep",
  surface_water = "surface_water",
  forest_gain = "forest_gain",
  population_count = "population_count",
  land_cover = "land_cover",
  soc_stock = "soc_stock",
  intactness_qprime = "intactness_qprime",
  intactness_qslope = "intactness_qslope",
  grassland_cultivated_absolute = "grassland_cultivated_absolute",
  grassland_natural_absolute = "grassland_natural_absolute",
  grassland_dominant_absolute = "grassland_dominant_absolute",
  grassland_cultivated_change = "grassland_cultivated_change",
  grassland_natural_change = "grassland_natural_change",
}


export class TileRequestDTO {
  @IsEnum(Tilesets)
  @IsNotEmpty()
  tileset!: Tilesets

  @IsNumber()
  @Type(()=>Number)
  @IsNotEmpty()
  x!: number;

  @IsNotEmpty()
  @Type(()=>Number)
  @IsNumber()
  y!: number;

  @IsNotEmpty()
  @Type(()=>Number)
  @IsNumber()
  z!: number;

  @IsOptional()
  @Type(()=>Number)
  @IsInt()
  startYear?: number;

  @IsOptional()
  @Type(()=>Number)
  @IsInt()
  endYear?: number;
}
