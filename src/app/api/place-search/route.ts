import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ success: true, places: [] });
  }

  try {
    const q = encodeURIComponent(query.trim());
    // Search OpenStreetMap / Nominatim to get place details & coordinates, or fallback search
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&addressdetails=1&limit=5`,
      {
        headers: {
          'User-Agent': 'ScanQR-AutoReviewApp/1.0',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ success: true, places: [] });
    }

    const data = await response.json();
    const places = data.map((item: any) => ({
      name: item.display_name.split(',')[0],
      full_address: item.display_name,
      lat: item.lat,
      lon: item.lon,
      osm_id: item.osm_id,
    }));

    return NextResponse.json({ success: true, places });
  } catch (err) {
    console.error('Place search error:', err);
    return NextResponse.json({ success: false, error: 'Failed to search places' }, { status: 500 });
  }
}
