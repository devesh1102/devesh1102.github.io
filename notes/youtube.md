# YouTube — System Design (Video Storage & Streaming)

## TL;DR
* **Upload**: Pre-signed S3 URL — client uploads directly, your servers handle zero bytes of the file
* **Processing**: Async Kafka pipeline — FFmpeg workers transcode to HLS at multiple resolutions in parallel
* **Format**: HLS segments — adaptive bitrate, seekable, CDN-cacheable, no buffering the whole file
* **Serving**: CDN (CloudFront) — ~99% cache hit for popular videos; S3 only for first viewer per region
* **View counts**: Redis INCR → bulk DB flush every 30s — DB can't handle 1M writes/sec directly
* **Background jobs**: Transcode, thumbnail, captions, content policy check, analytics — all async
* **Key insight**: Upload → S3 directly. Process async. Serve from CDN. Your servers are just orchestrators.

---

## Step 1: Clarify Requirements

### Functional Requirements
- Creators upload videos (up to 12h, multi-GB)
- Videos stream in multiple resolutions (360p → 4K) with adaptive bitrate
- Seek to any point instantly, smooth playback on any device/network
- Search by title, description, tags
- Like, comment, subscribe
- Video recommendations

### Non-Functional Requirements
| Requirement | Target |
|---|---|
| Upload scale | 500 hours of video uploaded per minute |
| Streaming latency | Playback starts < 2s |
| Processing SLA | Video live < 5 min after upload |
| Availability | 99.99% for streaming |
| Storage | Exabyte scale — retain all videos |
| Consistency | Eventual — view count lags seconds is fine |

### Out of Scope
- Live streaming (different protocol — RTMP/HLS-LL)
- Ad serving
- Content ID / copyright matching internals

---

## Step 2: Capacity Estimation

| Metric | Estimate |
|---|---|
| Uploads/day | 500 hrs/min × 1440 min = **720k hours/day** |
| Storage/hour (all resolutions, HLS) | ~10 GB |
| New storage needed/day | 720k × 10 GB = **~7.2 PB/day** |
| DAV (viewers) | 2 billion |
| Avg watch time | 40 min/user/day |
| CDN bandwidth | 2B × 40min × ~5 Mbps = **massive** |

---

## Step 3: High-Level Architecture

![YouTube Upload & Serving Pipeline](./images/youtube-pipeline.svg)

```mermaid
flowchart TD
    subgraph Upload Path
        Creator([Creator]) -->|1. Request upload URL| US[Upload Service]
        US -->|2. Return pre-signed URL| Creator
        Creator -->|3. Direct multi-part upload| S3R[(S3\nRaw Uploads)]
        S3R -->|4. S3 event trigger| K[Kafka\nvideo.uploaded]
        K --> PP[Processing Pipeline]
        PP -->|Transcoded HLS segments| S3P[(S3\nProcessed Videos)]
        PP -->|Update status: READY| DB[(PostgreSQL\nVideo Metadata)]
    end

    subgraph Serve Path
        Viewer([Viewer]) -->|GET /watch?v=xyz| VS[Video Service]
        VS -->|metadata + manifest URL| Viewer
        Viewer -->|Fetch manifest + segments| CDN[CDN\nEdge Node]
        CDN -->|Cache miss only| S3P
    end

    style Creator fill:#f0883e,color:#fff
    style Viewer fill:#1f6feb,color:#fff
    style K fill:#f0883e,color:#fff
    style CDN fill:#a371f7,color:#fff
```

---

## Step 4: Deep Dive

### Why Pre-Signed S3 URL (Direct Upload)?

![Pre-signed S3 URL vs direct server upload](./images/youtube-presigned.svg)

```mermaid
flowchart LR
    subgraph "Bad: Upload via your server"
        C1([Creator]) -->|50GB video| YS[Your Server]
        YS -->|50GB video| S3A[(S3)]
        YS -.->|Bottleneck - Bandwidth doubled| X1[Problem]
    end

    subgraph "Good: Pre-signed URL"
        C2([Creator]) -->|1. GET /upload-url| US[Upload Service]
        US -->|2. Pre-signed S3 URL| C2
        C2 -->|3. Upload directly| S3B[(S3)]
    end
```

### Resumable Multi-part Upload
```
Video split into 5MB chunks → upload independently
Connection drops? → Resume from last successful chunk

S3 Multi-part Upload:
  1. CreateMultipartUpload  → returns uploadId
  2. UploadPart × N        → each part returns an ETag
  3. CompleteMultipartUpload → S3 assembles the full file
```

### Why HLS Instead of a Single MP4?
```
Problem with single MP4:
  Seek to 45:00 → must buffer first 45 min
  All viewers get same quality regardless of bandwidth
  CDN cannot efficiently cache partial byte-range requests

HLS solution:
  Video split into 2–10 second .ts segments
  Manifest (.m3u8) maps time offsets → segment filenames
  Player fetches segments one at a time
  Monitors bandwidth → switches resolution dynamically (ABR)
  CDN caches individual segments → tiny objects, huge hit rate
```

### HLS Folder Structure in S3

![HLS segments vs single MP4](./images/youtube-hls.svg)

```mermaid
flowchart TD
    V["/videos/{videoId}/"] --> M["manifest.m3u8\n(master playlist)"]
    V --> R1["360p/\n  index.m3u8\n  seg001.ts\n  seg002.ts"]
    V --> R2["720p/\n  index.m3u8\n  seg001.ts"]
    V --> R3["1080p/\n  index.m3u8\n  seg001.ts"]
    V --> R4["4K/\n  index.m3u8\n  seg001.ts"]
```

### Processing Pipeline (Async, Parallel)

```mermaid
flowchart TD
    UP[video.uploaded\nKafka Event] --> JS[Job Scheduler]
    JS --> T1[Transcode 360p]
    JS --> T2[Transcode 720p]
    JS --> T3[Transcode 1080p]
    JS --> T4[Transcode 4K]
    JS --> TH[Generate Thumbnails\n3 frame extracts]
    JS --> CC[Auto-Captions\nSpeech-to-text]
    JS --> CP[Content Policy\nML scan]
    T1 & T2 & T3 & T4 & TH & CC & CP --> DONE[All complete\nUpdate status: READY]

    style UP fill:#f0883e,color:#fff
    style DONE fill:#3fb950,color:#fff
```

### View Count — The Write Problem
```
Naive: UPDATE videos SET views = views + 1 WHERE id = ?
Problem: 1M concurrent viewers = 1M DB writes/sec → DB melts

Solution:
  View event → INCR views:{videoId} in Redis   (atomic, ~1M ops/sec)

  Background job (Cron every 30s):
    Scan all view:{*} keys in Redis
    Bulk UPDATE videos SET views = views + delta WHERE id = ?
    Reset Redis counters

  Tradeoff: View count lags by up to 30s. Totally acceptable.
```

### Background Jobs
| Job | Trigger | Action |
|---|---|---|
| Transcode | video.uploaded Kafka event | FFmpeg → HLS at all resolutions (parallel workers) |
| Thumbnail generation | video.uploaded | Extract 3 frames → S3 |
| Auto-captions | video.uploaded | Speech-to-text → .vtt file |
| Content policy check | video.uploaded | ML scan — flag before publishing |
| View count flush | Cron every 30s | Bulk write Redis counters to DB |
| Search index update | video.ready Kafka event | Index title/description/tags in Elasticsearch |
| Raw file cleanup | Cron after processing | Delete raw S3 upload — keep only HLS segments |
| Thumbnail A/B test | Scheduled | Rotate thumbnails, measure CTR, promote winner |

---

## Step 5: Key Design Decisions

| Decision | Choice | Alternative | Why |
|---|---|---|---|
| Upload | Pre-signed S3 URL | Route through server | Zero server bandwidth for file data |
| Video format | HLS segments | Single MP4 | Seekable, adaptive bitrate, CDN-friendly |
| Processing | Async Kafka pipeline | Sync during upload | Upload returns fast; heavy work async |
| Serving | CDN (CloudFront) | Serve from S3 | Edge caching — ~99% hit rate for popular videos |
| View counts | Redis + async DB flush | Direct DB write | DB can't absorb 1M writes/sec |
| Search | Elasticsearch | DB LIKE query | Full-text, relevance scoring, typo tolerance |

---

## Common Interview Follow-ups

**Q: How does seeking to the middle of a 2-hour video work instantly?**
The HLS manifest maps time offsets to segment filenames. The player calculates which `.ts` segment contains the timestamp and fetches only that segment from CDN — already cached.

**Q: How do you handle a 50GB video upload?**
S3 Multi-part Upload. Client splits into 5MB chunks, uploads in parallel. If connection drops, resume from last chunk using the `uploadId`. No server timeouts, no re-upload from scratch.

**Q: What if a video goes viral right after upload (cold CDN)?**
First viewer per CDN region triggers a cache miss → CDN fetches from S3 → caches. All subsequent viewers in that region hit the cache. With 100+ CDN regions, only 100 users ever hit S3.

**Q: How do you transcode 720k hours of video per day?**
Horizontally scaled FFmpeg workers consuming from Kafka. Auto-scale on worker queue depth. Run on GPU spot instances (70% cheaper). 1 hour of video ≈ 10 min transcode → need massive parallel fleet.
