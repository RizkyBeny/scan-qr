# Dedicated PostgreSQL Database Schema & Migration Guide

Dokumen ini berisi spesifikasi skema tabel dan instruksi DDL untuk deployment ke Dedicated PostgreSQL Database (misalnya AWS RDS, GCP Cloud SQL, Supabase Self-hosted, atau Baremetal PostgreSQL).

---

## 1. DDL SQL Schema

```sql
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: umkm
CREATE TABLE IF NOT EXISTS umkm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    google_place_id VARCHAR(255),
    google_review_url TEXT NOT NULL,
    shortcode VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup on redirect handler
CREATE UNIQUE INDEX IF NOT EXISTS idx_umkm_shortcode ON umkm(shortcode);

-- Table: scan_events
CREATE TABLE IF NOT EXISTS scan_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    umkm_id UUID NOT NULL REFERENCES umkm(id) ON DELETE CASCADE,
    user_agent TEXT,
    referer TEXT,
    ip_hash VARCHAR(64), -- Hashed IP untuk keunikan analitik tanpa menyimpan PII
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_scan_events_umkm_id ON scan_events(umkm_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_created_at ON scan_events(created_at);
CREATE INDEX IF NOT EXISTS idx_scan_events_umkm_date ON scan_events(umkm_id, created_at DESC);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_umkm_modtime
BEFORE UPDATE ON umkm
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();
```

---

## 2. Struktur Relasi Tabel (ERD)

```mermaid
erDiagram
    UMKM ||--o{ SCAN_EVENTS : "receives"
    UMKM {
        uuid id PK
        string name
        string google_place_id
        string google_review_url
        string shortcode UK
        timestamp created_at
        timestamp updated_at
    }
    SCAN_EVENTS {
        uuid id PK
        uuid umkm_id FK
        string user_agent
        string referer
        string ip_hash
        timestamp created_at
    }
```

---

## 3. Query Umum untuk Analytics

### A. Total Scan per UMKM (30 hari terakhir)
```sql
SELECT 
    u.name,
    COUNT(s.id) AS total_scans
FROM umkm u
LEFT JOIN scan_events s ON u.id = s.umkm_id 
    AND s.created_at >= NOW() - INTERVAL '30 days'
WHERE u.id = 'YOUR_UMKM_UUID'
GROUP BY u.id, u.name;
```

### B. Daily Scan Trend
```sql
SELECT 
    DATE(s.created_at) AS date,
    COUNT(s.id) AS scan_count
FROM scan_events s
WHERE s.umkm_id = 'YOUR_UMKM_UUID'
    AND s.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(s.created_at)
ORDER BY DATE(s.created_at) ASC;
```

---

## 4. Langkah Migrasi dari Supabase ke Dedicated PostgreSQL

1. **Dump Schema & Data dari Supabase:**
   ```bash
   pg_dump -h db.xxx.supabase.co -U postgres -d postgres --clean --if-exists -f backup.sql
   ```

2. **Restore ke Dedicated PostgreSQL Database:**
   ```bash
   psql -h your-dedicated-db-host -U postgres -d scan_qr_db -f backup.sql
   ```

3. **Update Connection String pada Environment Variables:**
   Ubah `DATABASE_URL` di `.env` aplikasi Next.js dari Supabase URL ke Dedicated PostgreSQL Connection String:
   ```env
   DATABASE_URL="postgresql://user:password@your-dedicated-db-host:5432/scan_qr_db?sslmode=require"
   ```
