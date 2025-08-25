
import { NextResponse } from 'next/server';
import { satrec, propagate, gstime, eciToGeodetic } from 'satellite.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseFloatOr(val: any, fallback: number) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

type SatelliteName = 'landsat8' | 'landsat9';

async function fetchTLE(sat: SatelliteName) {
  const norad = sat === 'landsat9' ? '49260' : '39084';
  const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${norad}&FORMAT=TLE`;
  const r = await fetch(url, { cache: 'no-store' });
  const text = await r.text();
  const lines = text.trim().split(/\r?\n/);
  
  if (lines.length < 2) throw new Error("Failed to parse TLE from Celestrak");

  const line1Index = lines.findIndex(l => l.startsWith('1 '));
  if (line1Index === -1) throw new Error("Failed to parse TLE: Line 1 not found");
  
  const line2Index = lines.findIndex(l => l.startsWith('2 '));
  if (line2Index === -1) throw new Error("Failed to parse TLE: Line 2 not found");
  
  // Name is typically the line before the first TLE line, but can be absent.
  const name = line1Index > 0 ? lines[line1Index - 1].trim() : `NORAD ${norad}`;
  
  return { name: name, l1: lines[line1Index], l2: lines[line2Index] };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloatOr(searchParams.get('lat'), NaN);
    const lon = parseFloatOr(searchParams.get('lon'), NaN);
    const hours = Math.min(parseFloatOr(searchParams.get('hours'), 72), 240);
    const sat = (searchParams.get('sat') as SatelliteName) || 'landsat8';

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: 'lat/lon required' }, { status: 400 });
    }

    const { name, l1, l2 } = await fetchTLE(sat);
    const satrecObj = satrec.fromTle(l1, l2);

    const start = new Date();
    const end = new Date(start.getTime() + hours * 3600 * 1000);
    const stepSec = 10;

    let best: null | { t: Date; elev: number } = null;
    const targetLat = lat * Math.PI / 180;
    const targetLon = lon * Math.PI / 180;

    for (let t = start.getTime(); t <= end.getTime(); t += stepSec * 1000) {
      const time = new Date(t);
      const pv = propagate(satrecObj, time);
      if (typeof pv.position === 'boolean' || !pv.position) continue;

      const gmst = gstime(time);
      const geo = eciToGeodetic(pv.position, gmst);
      const sLat = geo.latitude;
      const sLon = geo.longitude;

      const dLat = Math.abs(sLat - targetLat);
      const dLon = Math.abs(sLon - targetLon);
      const score = -(dLat + dLon); // Higher score is better (closer)

      if (!best || score > best.elev) {
        best = { t: time, elev: score };
      }
    }

    if (!best) {
      return NextResponse.json({ error: "No pass found in window" }, { status: 404 });
    }

    return NextResponse.json({
      satellite: name,
      tle_source: 'Celestrak',
      window_hours: hours,
      approxClosestApproachUTC: best.t.toISOString(),
      note: 'This is an approximation based on subsatellite ground-track proximity. For precise AOS/LOS/elevation, implement full topocentric calculations.',
    }, {
        headers: { "Cache-Control": "no-store" }
    });
  } catch (err: any) {
    console.error('[Satellite Pass API Error]', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
