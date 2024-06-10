export interface EarthEngineDataset {
  /** Path to earth engine asset */
  readonly assetPath: { [key: string]: string };
  /** Number of years */
  readonly numYears: number;

  /** Visualization parameters */
  readonly vizParams: {
    bands: string[],
    min: number,
    max: number,
    palette: string[]
  };

  /** Function that returns ee.Image instance with asset */
  getEEAsset: (key?: string) => any;
  getMapUrl: (z: number, x: number, y: number, year?: number) => string;
}
