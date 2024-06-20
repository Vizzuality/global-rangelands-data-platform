export interface EarthEngineDataset {
  /** Path to earth engine asset */
  readonly assetPath: { [key: string]: string };

  // Performs validation of the year, intended for use with Assets that require a year
  // If not valid, an error should be thrown
  isYearValid: (year?: number) => boolean;

  // Function that returns ee.Image instance with asset
  getEEAsset: (key?: string) => any;
  getMapUrl: (z: number, x: number, y: number, year?: number) => any;
}

interface EarthEngineCollection extends EarthEngineDataset {
  /** Visualization parameters */
  readonly vizParams: {
    bands: string[],
    min: number,
    max: number,
    palette: string[]
  };
}

interface EarthEngineImage extends EarthEngineDataset {
  /** Band names */
  readonly bandName: string;

  /** Visualization parameters */
  readonly sldStyles: string;
}