import{ Request, Response} from 'express';
import {
  ArrayNotEmpty,
  validateOrReject,
  IsEnum,
  IsInt
} from 'class-validator';
import 'reflect-metadata';
import { plainToClass } from 'class-transformer';

import   ee  from '@google/earthengine'
import type { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';

import { eeAuthenticate, eeEvaluate } from './utils';

import { ModisNetPrimaryProduction } from './geeAssets/ModisNetPrimaryProduction';

enum Tilesets {
  // this is a placeholder for now
  // modis_net_primary_production = "modis_net_primary_production"
}

class TileRequestParams {
  // this is a placeholder for now
  // tileset, z, x, y
}

export const getTiles: HttpFunction = async (req, res) => {

  res.set('Access-Control-Allow-Origin', '*');

  const TEST_DICT = {
    "modis_net_primary_production": ModisNetPrimaryProduction
  }
  const isValid = await validateInput(req, res);

  if (!isValid.status) {
    return isValid.res;
  }

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  try {

    await eeAuthenticate();

    const tileset = req.query.tileset;
    const asset = TEST_DICT[tileset];
    const {x, y, z} = req.query;

    const response = await eeEvaluate(asset.getMapUrl(asset.vizParams, x, y, z))

    // This is wrong as what we need to give back is the image in the url
    res.status(200).json(response);

  } catch (error) {
    console.error(error)
    res.status(400).json({"error": error.message});
  }

  return res
}

async function validateInput(req: Request, res:  Response): Promise<{"status": Boolean, "res": Response}> {
  try {
    if (!req.body || !req.query) {
      return {"status": false,
            "res":  res.status(400).json({"error":"No data provided"})};
    }

    await validateOrReject(plainToClass(TileRequestParams, req.query));

    return {"status": true, "res": res};
  }
  catch (errors) {
    return {"status": false, "res": res.status(400).json({"error": errors})};
  }
}

