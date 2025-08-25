
import { NextResponse } from 'next/server';
import { getEarthEngineMetrics } from '@/lib/ee-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseFloatOr(val: any, fallback: number) {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloatOr(searchParams.get('lat'), NaN);
    const lon = parseFloatOr(searchParams.get('lon'), NaN);
    const bufferKm = parseFloatOr(searchParams.get('bufferKm'), 5);
    const start = searchParams.get('start') || '2024-01-01';
    const end = searchParams.get('end') || '2024-12-31';
    const collection = searchParams.get('collection') || 'landsat8';

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: 'lat/lon required' }, { status: 400 });
    }

    const result: any = await getEarthEngineMetrics(lat, lon, bufferKm, start, end, collection);

    const clamped = {
      NDVI: clamp(result?.NDVI_mean ?? NaN, -1, 1),
      NDVI_stdDev: result?.NDVI_stdDev ?? null,
      NDWI: clamp(result?.NDWI_mean ?? NaN, -1, 1),
      MNDWI: clamp(result?.MNDWI_mean ?? NaN, -1, 1),
      NDBI: clamp(result?.NDBI_mean ?? NaN, -1, 1),
      NBR: clamp(result?.NBR_mean ?? NaN, -1, 1),
      SWIR_RATIO: result?.SWIR_RATIO_mean ?? null,
      provenance: {
        collection: collection,
        start,
        end,
        scaleMeters: collection.startsWith('sentinel') ? 20 : 30,
        aoi: { lat, lon, bufferKm },
      },
    };
    
    return NextResponse.json(clamped, {
        headers: { "Cache-Control": "no-store" }
    });

  } catch (err: any) {
    console.error('[EE API Error]', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
