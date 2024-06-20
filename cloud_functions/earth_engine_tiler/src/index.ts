import express, {Request, Response, Router} from 'express';
import {validateOrReject, ValidationError} from 'class-validator';
import 'reflect-metadata';
import {plainToClass} from 'class-transformer';
import {EarthEngineUtils} from './earth-engine-utils';
import {ModisNetPrimaryProductionDataset} from './geeAssets/modis-net-primary-production-dataset';
import {AnthropogenicBiomes} from './geeAssets/anthropogenic-biomes';
import {EarthEngineDataset} from "./geeAssets/earth-engine-dataset";
import {TileRequestDTO, Tilesets} from "./tile-request.dto";
import {default as fetch , Response as FetchResponse} from "node-fetch";
import {pipeline} from "stream/promises";
import * as crypto from "crypto";

//Asset Mapping
const assets: Record<Tilesets, EarthEngineDataset> = {
  [Tilesets.modis_net_primary_production]: ModisNetPrimaryProductionDataset,
  [Tilesets.anthropogenic_biomes]: AnthropogenicBiomes
}

//We're using express to simplify path parameter parsing for the Tiles endpoint
const router = Router();
const app = express();
app.use('/', router);
exports.eetApp = app;


router.get('/:z/:x/:y', async (req: Request, res: Response) : Promise<void> => {
  const logId = crypto.createHash('sha1').update(performance.now().toString()).digest('hex');

  ///// This block handles CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  ///// Request processing
  let tileRequestDTO: TileRequestDTO;
  let asset: EarthEngineDataset;

  //Validation Block
  try {
    tileRequestDTO = await getAndValidateRequestDTO(req);

    asset = assets[tileRequestDTO.tileset];
    if (!asset) {
      throw new Error(`Tileset ${tileRequestDTO.tileset} not found`);
    }

    asset.isYearValid(tileRequestDTO.year); //Year might be required or not depending on the asset
  } catch (errors) {
    sendErrorResponse(res, logId, 400, errors)
    return;
  }

  const { tileset, x, y, z, year } = tileRequestDTO;
  console.log(`${logId} - Requesting tile for ${tileset} with coordinates ${x}-${y}-${z} and year ${year || 'N/A'}`)

  try {
    await EarthEngineUtils.authenticate();

    const tileURL = await asset.getMapUrl(z, x, y, year);
    console.log(`${logId} - Obtained tile URL on ${tileURL}`)
    //TODO CACHING
    // The calculations when requesting the tile URL take the longest, images are not probably going to be very big (not even MBs)
    // create new schema on Strapi DB instance, can't use same schema without workarounds, redis on memorystore might be overkill
    // Not critical for MVP phase

    //Get the tile image and stream it into the function response
    const imageResponse: FetchResponse = await fetch(tileURL);
    const contentType = imageResponse.headers.get('content-type');

    if(!imageResponse.ok || !contentType || !imageResponse.body){
      const errorResponse = imageResponse.body ? JSON.stringify(imageResponse.body) : 'N/A';
      throw new Error (`A problem ocurred retrieving the tile on ${tileURL}. Status: ${imageResponse.status} - Error Response: ${errorResponse}`)
    }

    res.status(200).contentType(contentType);
    await pipeline(imageResponse.body, res);
  } catch (error) {
    sendErrorResponse(res, logId, 500, error);
  }
});

async function getAndValidateRequestDTO(req: Request): Promise<TileRequestDTO> {
  if (!req.query) {
    throw new Error("Missing query parameters (tileset and/or year)");
  }

  const result = plainToClass(
    TileRequestDTO,
    { ...req.query, ...req.params },
    { enableImplicitConversion: true }
  )
  await validateOrReject(result, { validationError: { target: false } });

  return result;
}

function sendErrorResponse(res: Response, logId: string, status: number, errors: any){
  // Using class validator's validateOrReject, rejects by throwing a list of ValidationErrors, but native Errors are thrown
  // as a single non-array Error object, so this check must be done first to process the errors as a list later
  errors = errors.length ? errors : [errors];

  // Native JS Errors have all their properties as non-enumerable, so it's JSON.stringified when sending the response
  // it will yield empty objects, but ValidationErrors are their own classes and don't extend native Errors
  // This is a bit of a hacky way to simplify responses, by transforming native Errors to actual objects with the error
  // message and leaving the ValidationErrors as is
  const responseErrors = errors.map((error)=>
    error instanceof ValidationError ?
      error : { message: error.message }
  )
  console.log(`${logId} - Returning Errors:  ${JSON.stringify(responseErrors)}`)

  res.status( status ).json( { errors: responseErrors } )
}
