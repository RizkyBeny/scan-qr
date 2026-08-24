import { createClient } from '@supabase/supabase-js';
import { UMKM, ScanEvent } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// In-memory fallback storage for offline/testing when Supabase credentials are demo/missing
class MockStore {
  private umkms: UMKM[] = [
    {
      id: 'demo-umkm-1',
      name: 'Kafe Kopi Kenangan Kasir 1',
      google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      shortcode: 'kopikenangan',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-umkm-2',
      name: 'Resto Bebek Goreng Pak H. Slamet',
      google_review_url: 'https://maps.google.com/?q=Bebek+Goreng+Pak+H+Slamet',
      shortcode: 'bebekslamet',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    }
  ];

  private scanEvents: ScanEvent[] = [
    { id: 'scan-1', umkm_id: 'demo-umkm-1', created_at: new Date().toISOString() },
    { id: 'scan-2', umkm_id: 'demo-umkm-1', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'scan-3', umkm_id: 'demo-umkm-1', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'scan-4', umkm_id: 'demo-umkm-2', created_at: new Date().toISOString() },
  ];

  async getUMKMByShortcode(shortcode: string): Promise<UMKM | null> {
    // Try real Supabase first
    try {
      if (!supabaseUrl.includes('demo-project')) {
        const { data, error } = await supabase
          .from('umkm')
          .select('*')
          .eq('shortcode', shortcode)
          .single();
        if (data && !error) return data as UMKM;
      }
    } catch {
      // fallback to mock
    }
    return this.umkms.find((u) => u.shortcode.toLowerCase() === shortcode.toLowerCase()) || null;
  }

  async getAllUMKM(): Promise<UMKM[]> {
    try {
      if (!supabaseUrl.includes('demo-project')) {
        const { data, error } = await supabase.from('umkm').select('*').order('created_at', { ascending: false });
        if (data && !error) return data as UMKM[];
      }
    } catch {
      // fallback
    }
    return [...this.umkms];
  }

  async createUMKM(name: string, google_review_url: string, google_place_id?: string, customShortcode?: string): Promise<UMKM> {
    const shortcode = customShortcode?.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) + Math.floor(100 + Math.random() * 900);
    const newUmkm: UMKM = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `umkm-${Date.now()}`,
      name,
      google_place_id: google_place_id || undefined,
      google_review_url,
      shortcode,
      created_at: new Date().toISOString(),
    };

    try {
      if (!supabaseUrl.includes('demo-project')) {
        const { data, error } = await supabase.from('umkm').insert([newUmkm]).select().single();
        if (data && !error) return data as UMKM;
      }
    } catch {
      // fallback
    }

    this.umkms.unshift(newUmkm);
    return newUmkm;
  }

  async recordScan(umkm_id: string, user_agent?: string, referer?: string): Promise<void> {
    const scan: ScanEvent = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `scan-${Date.now()}`,
      umkm_id,
      user_agent,
      referer,
      created_at: new Date().toISOString(),
    };

    try {
      if (!supabaseUrl.includes('demo-project')) {
        await supabase.from('scan_events').insert([scan]);
        return;
      }
    } catch {
      // fallback
    }

    this.scanEvents.push(scan);
  }

  async getUMKMStats(umkm_id: string) {
    let scans: ScanEvent[] = [];

    try {
      if (!supabaseUrl.includes('demo-project')) {
        const { data } = await supabase.from('scan_events').select('*').eq('umkm_id', umkm_id);
        if (data) scans = data as ScanEvent[];
      } else {
        scans = this.scanEvents.filter((s) => s.umkm_id === umkm_id);
      }
    } catch {
      scans = this.scanEvents.filter((s) => s.umkm_id === umkm_id);
    }

    const umkm = (await this.getAllUMKM()).find((u) => u.id === umkm_id);
    const now = Date.now();
    const ms7Days = 7 * 86400000;
    const ms30Days = 30 * 86400000;

    const scans7Days = scans.filter((s) => now - new Date(s.created_at).getTime() <= ms7Days).length;
    const scans30Days = scans.filter((s) => now - new Date(s.created_at).getTime() <= ms30Days).length;

    // Daily breakdown for last 7 days
    const dailyTrendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      dailyTrendMap[dateStr] = 0;
    }

    scans.forEach((s) => {
      const dateStr = new Date(s.created_at).toISOString().split('T')[0];
      if (dailyTrendMap[dateStr] !== undefined) {
        dailyTrendMap[dateStr]++;
      }
    });

    return {
      umkm,
      total_scans: scans.length,
      scans_7_days: scans7Days,
      scans_30_days: scans30Days,
      daily_trends: Object.entries(dailyTrendMap).map(([date, count]) => ({ date, count })),
    };
  }
}

export const mockStore = new MockStore();
