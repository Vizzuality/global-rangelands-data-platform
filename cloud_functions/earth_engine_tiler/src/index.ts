import {Request, Response} from 'express';
import {validateOrReject} from 'class-validator';
import 'reflect-metadata';
import {plainToClass} from 'class-transformer';
import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';
import {EarthEngineUtils} from './earth-engine-utils';
import {ModisNetPrimaryProductionDataset} from './geeAssets/modis-net-primary-production-dataset';
import {EarthEngineDataset} from "./geeAssets/earth-engine-dataset";
import {TileRequestDTO, Tilesets} from "./tile-request.dto";
import {default as fetch , Response as FetchResponse} from "node-fetch";

const assets: Record<Tilesets, EarthEngineDataset> = {
  [Tilesets.modis_net_primary_production]: ModisNetPrimaryProductionDataset,
}
export const getTiles: HttpFunction = async (req: Request, res: Response) => {
  // This block handles CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  let tileRequestDTO: TileRequestDTO;
  try {
    tileRequestDTO = await getAndValidateRequestDTO(req);
  } catch (errors) {
    return {status: false, res: res.status(400).json({error: errors})}
  }

  const { tileset, x, y, z, year } = tileRequestDTO;
  console.log(`Requesting tile for ${tileset} with coordinates ${x}-${y}-${z} and year ${year || 'N/A'}`)

  try {
    await EarthEngineUtils.authenticate();

    const asset = assets[tileset];
    if (!asset) {
      throw new Error(`Tileset ${tileset} not found`)
    }
    const tileURL = await asset.getMapUrl(z, x, y, year);

    //TODO CACHING
    // what takes the longest? getting the image url or the image itself? should we cache the url or the image?
    // create new DB on SQL instance, can't use same strapi DB, redis on memorystore might be overkill

    //Get the tile image and stream it into the function response
    const imageResponse: FetchResponse = await fetch(tileURL);
    const contentType = imageResponse.headers.get('content-type');

    if(!imageResponse.ok || !contentType || !imageResponse.body){
      throw new Error (`A problem ocurred retrieving the tile on ${tileURL}`)
    }

    res.status(200).contentType(contentType);
    imageResponse.body.pipe(res);

    return {status: true, res}

  } catch (error) {
    console.error(error)
    return {status: false, res: res.status(500).json({"error": error.message})}
  }
}

async function getAndValidateRequestDTO(req: Request): Promise<TileRequestDTO> {
  if (!req.query) {
    throw new Error("No data provided");
  }

  const result = plainToClass(TileRequestDTO, req.query, {enableImplicitConversion: true})
  await validateOrReject(result);

  return result;
}
