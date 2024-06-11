import ee from '@google/earthengine';
import { readFileSync } from 'fs';
import path from 'path';

function getCredentialsJSON(): string {
  // By default returns the credentials found in env variable, if not present, assumes it's stored locally (meant for local development)
  return process.env.EE_CREDENTIALS_JSON ||
    readFileSync(path.resolve(process.cwd(), './credentials.json'), 'utf8')
}

export class EarthEngineUtils {
  static authenticate(): Promise<void> {
    // return new Promise((resolve, reject) => {resolve();})
    return new Promise((resolve, reject) => {
      // Authenticate to service account using short living access tokens
      const PRIVATE_KEY = JSON.parse(getCredentialsJSON());

      ee.data.authenticateViaPrivateKey(PRIVATE_KEY,
        () => ee.initialize(null, null, resolve, reject),
        (error: any) => console.error(error),
      );
    });
  }

  static evaluate(eeStatement: ee.ComputedObject): Promise<any> {
    return new Promise((resolve, reject) => {
      eeStatement.evaluate((success: any, failure: any) => {
        if (failure) reject(new Error(failure));
        resolve(success);
      });
    });
  }
}
