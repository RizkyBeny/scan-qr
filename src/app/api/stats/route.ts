import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const umkmId = searchParams.get('umkm_id');

  try {
    if (umkmId) {
      const stats = await mockStore.getUMKMStats(umkmId);
      return NextResponse.json({ success: true, stats });
    }

    const allUmkms = await mockStore.getAllUMKM();
    const statsList = await Promise.all(
      allUmkms.map((u) => mockStore.getUMKMStats(u.id))
    );

    const totalScansAll = statsList.reduce((acc, curr) => acc + curr.total_scans, 0);
    const scans7DaysAll = statsList.reduce((acc, curr) => acc + curr.scans_7_days, 0);

    return NextResponse.json({
      success: true,
      summary: {
        total_umkms: allUmkms.length,
        total_scans_all: totalScansAll,
        total_scans_7_days: scans7DaysAll,
      },
      stats_by_umkm: statsList,
    });
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
