
import { NextResponse } from 'next/server';

function parseFloatOr(val: any, fallback: number) {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
}

function yyyymmdd(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = parseFloatOr(searchParams.get('lat'), NaN);
        const lon = parseFloatOr(searchParams.get('lon'), NaN);
        const start = searchParams.get('start') || yyyymmdd(new Date(Date.UTC(2024,0,1)));
        const end = searchParams.get('end') || yyyymmdd(new Date());

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return NextResponse.json({ error: "lat/lon required" }, { status: 400 });
        }

        const params = "T2M,PRECTOT,WS2M,RH2M";
        const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=AG&latitude=${lat}&longitude=${lon}&start=${start}&end=${end}&format=JSON`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`NASA POWER error: ${r.status}`);
        const data = await r.json();
        return NextResponse.json({ source: "NASA POWER", url, data });

    } catch (err: any) {
        console.error('[NASA POWER API Error]', err);
        return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
    }
}
