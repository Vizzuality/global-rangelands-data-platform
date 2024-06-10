import {IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional} from "class-validator";
import {Type} from "class-transformer";

export enum Tilesets {
  // this is a placeholder for now
  modis_net_primary_production = "modis_net_primary_production"
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
