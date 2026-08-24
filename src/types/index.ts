export interface UMKM {
  id: string;
  name: string;
  google_place_id?: string;
  google_review_url: string;
  shortcode: string;
  created_at: string;
  updated_at?: string;
}

export interface ScanEvent {
  id: string;
  umkm_id: string;
  user_agent?: string;
  referer?: string;
  ip_hash?: string;
  created_at: string;
}

export interface UMKMStats {
  umkm: UMKM;
  total_scans: number;
  scans_7_days: number;
  scans_30_days: number;
  daily_trends: {
    date: string;
    count: number;
  }[];
}
