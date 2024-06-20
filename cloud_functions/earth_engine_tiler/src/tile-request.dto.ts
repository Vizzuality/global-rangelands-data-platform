import {IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional} from "class-validator";
import {Type} from "class-transformer";

export enum Tilesets {
  modis_net_primary_production = "modis_net_primary_production",
  modis_net_primary_production_change = "modis_net_primary_production_change",
  anthropogenic_biomes = "anthropogenic_biomes"
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
  year?: number;
}
