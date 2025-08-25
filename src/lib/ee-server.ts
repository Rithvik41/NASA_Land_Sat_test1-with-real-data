
// This file is adapted from the user-provided Firebase Functions `index.ts`.
// It contains the server-side logic for interacting with Google Earth Engine.

import ee from '@google/earthengine';

// Promise for singleton EE initialization.
let eeInitialized: Promise<boolean> | null = null;

const initEarthEngine = (): Promise<boolean> => {
  if (eeInitialized) {
    return eeInitialized;
  }

  eeInitialized = new Promise((resolve, reject) => {
    const serviceAccountKeyJson = process.env.EE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKeyJson) {
      eeInitialized = null;
      return reject(new Error(
        'Missing EE_SERVICE_ACCOUNT_KEY. Configure as an environment variable.'
      ));
    }
    
    try {
        const key = JSON.parse(serviceAccountKeyJson);

        if (!key.client_email || !key.private_key) {
          throw new Error('Service account JSON is missing client_email or private_key.');
        }

        // Pass the entire parsed key object to authenticate.
        ee.data.authenticateViaPrivateKey(
            key,
            () => {
                ee.initialize(
                    null, null,
                    () => {
                        console.log('Earth Engine initialized.');
                        resolve(true);
                    },
                    (err: any) => {
                        console.error('EE initialization error:', err);
                        eeInitialized = null; // Reset on failure
                        reject(new Error(`Earth Engine initialization error: ${err}`));
                    }
                );
            },
            (err: any) => {
                console.error('EE authentication error:', err);
                eeInitialized = null; // Reset on failure
                reject(new Error(`Earth Engine authentication error: ${err}`));
            }
        );
    } catch(err: any) {
        console.error('Failed to parse service account key:', err);
        eeInitialized = null;
        reject(new Error(`Failed to parse EE_SERVICE_ACCOUNT_KEY: ${err.message}`));
    }
  });

  return eeInitialized;
};

// Re-usable cloud masking and scaling functions
type CollDef = {
    id: string;
    nir: string;
    red: string;
    green: string;
    swir1: string;
    swir2?: string;
    maskFn: (img: ee.Image) => ee.Image;
    scaleFactor?: number;
};

const LS8: CollDef = {
    id: 'LANDSAT/LC08/C02/T1_L2',
    nir: 'SR_B5', red: 'SR_B4', green: 'SR_B3', swir1: 'SR_B6', swir2: 'SR_B7',
    maskFn: (img) => {
        const qa = img.select('QA_PIXEL');
        const cloud = qa.bitwiseAnd(1 << 3).neq(0);
        const cloudShadow = qa.bitwiseAnd(1 << 4).neq(0);
        const cirrus = qa.bitwiseAnd(1 << 2).neq(0);
        const mask = cloud.or(cloudShadow).or(cirrus).not();
        return img.updateMask(mask);
    },
    scaleFactor: 0.0000275,
};

const LS9: CollDef = { ...LS8, id: 'LANDSAT/LC09/C02/T1_L2' };

const S2: CollDef = {
    id: 'COPERNICUS/S2_SR_HARMONIZED',
    nir: 'B8', red: 'B4', green: 'B3', swir1: 'B11', swir2: 'B12',
    maskFn: (img) => {
        const qa60 = img.select('QA60');
        const cloud = qa60.bitwiseAnd(1 << 10).neq(0).or(qa60.bitwiseAnd(1 << 11).neq(0));
        const scl = img.select('SCL');
        const shadow = scl.eq(3);
        const mask = cloud.or(shadow).not();
        return img.updateMask(mask);
    },
    scaleFactor: 1e-4,
};

const collectionDefs: Record<string, CollDef> = {
    landsat8: LS8,
    landsat9: LS9,
    sentinel2: S2,
};

// Main function to get metrics
export async function getEarthEngineMetrics(
    lat: number, lon: number, bufferKm: number, start: string, end: string, collection: string
) {
    await initEarthEngine();
    
    const aoi = ee.Geometry.Point([lon, lat]).buffer(bufferKm * 1000);
    const def = collectionDefs[collection] || LS8;

    let ic = ee.ImageCollection(def.id)
        .filterBounds(aoi)
        .filterDate(start, end);

    ic = ic.map((img) => {
        let scaled = img;
        if (def.scaleFactor) {
            const opticalBands = img.select([def.red, def.green, def.nir, def.swir1, def.swir2 || def.swir1].filter(b => img.bandNames().contains(b)));
            const scaledBands = opticalBands.multiply(def.scaleFactor);
            scaled = img.addBands(scaledBands, undefined, true);
        }
        return def.maskFn(scaled);
    });

    const comp = ic.median().clip(aoi);

    const red = comp.select(def.red);
    const green = comp.select(def.green);
    const nir = comp.select(def.nir);
    const swir1 = comp.select(def.swir1);
    const swir2 = def.swir2 ? comp.select(def.swir2) : swir1;

    const nd = (a: ee.Image, b: ee.Image) => a.subtract(b).divide(a.add(b));

    const NDVI = nd(nir, red).rename('NDVI');
    const NDWI = nd(green, nir).rename('NDWI');
    const MNDWI = nd(green, swir1).rename('MNDWI');
    const NDBI = nd(swir1, nir).rename('NDBI');
    const NBR = nd(nir, swir2).rename('NBR');
    const SWIR_RATIO = swir1.divide(swir2).rename('SWIR_RATIO');

    const stack = NDVI.addBands([NDWI, MNDWI, NDBI, NBR, SWIR_RATIO]);

    const stats = stack.reduceRegion({
        reducer: ee.Reducer.mean().combine({ reducer2: ee.Reducer.stdDev(), sharedInputs: true }),
        geometry: aoi,
        scale: collection.startsWith('sentinel') ? 20 : 30,
        maxPixels: 1e13,
        bestEffort: true,
    });

    // GEE returns a promise-like object, so we need to use evaluate
    return new Promise((resolve, reject) => {
        stats.evaluate((result: any, error: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}
