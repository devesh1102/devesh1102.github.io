# Server Capacity & Scaling Reference

A practical reference for back-of-envelope estimation in system design.
Numbers are rule-of-thumb — real benchmarks vary by workload, language, and tuning.

---

## Single Server Baselines

### Web / API Server (Node.js, Go, Python, Java)

| Type | Requests/sec | Notes |
|---|---|---|
| Python (Flask/Django, sync) | ~500–2K | GIL-limited, one thread per request |
| Python (FastAPI/async) | ~5K–15K | Async I/O, much better concurrency |
| Node.js | ~10K–30K | Single-threaded event loop, great for I/O-bound |
| Java (Spring Boot) | ~5K–20K | JVM warmup cost, then very efficient |
| Go | ~30K–80K | Goroutines are cheap, excellent throughput |
| Rust (Actix) | ~50K–100K+ | Near bare-metal performance |

**Rule of thumb**: a typical backend API server handles **5K–20K req/sec** depending on stack.

### Database Servers

| Database | Read ops/sec | Write ops/sec | Notes |
|---|---|---|---|
| PostgreSQL (single node) | ~10K–50K | ~5K–10K | Depends on query complexity and indexes |
| MySQL (single node) | ~10K–50K | ~5K–10K | Similar to Postgres |
| MongoDB (single node) | ~20K–80K | ~10K–30K | Faster for simple document reads |
| Redis (single node) | ~100K–1M | ~100K–500K | In-memory, extremely fast |
| Cassandra (single node) | ~10K–50K | ~20K–50K | Optimized for writes |
| DynamoDB | ~3K (default) | ~1K (default) | Provisioned throughput, scales with $$$ |
| Elasticsearch (single node) | ~1K–5K | ~500–2K | Search-optimized, indexing is expensive |

### Cache (Redis)

| Operation | Throughput |
|---|---|
| GET / SET | 100K–500K ops/sec per node |
| GEORADIUS | ~50K–100K ops/sec |
| Sorted set ops | ~50K–100K ops/sec |

### Message Brokers

| Broker | Throughput |
|---|---|
| Kafka (single broker) | 100K–1M messages/sec |
| RabbitMQ | 20K–50K messages/sec |
| SQS | ~3K–10K messages/sec per queue |

### Load Balancer

| Type | Requests/sec |
|---|---|
| Nginx (software LB) | 50K–100K req/sec |
| HAProxy | 100K–500K req/sec |
| AWS ALB / GCP LB (managed) | Effectively unlimited (auto-scales) |

---

## Memory & Storage Per Server

### Typical Server Sizes (AWS EC2 / GCP as reference)

| Instance class | CPU | RAM | Use case |
|---|---|---|---|
| Small (t3.medium) | 2 vCPU | 4 GB | Dev, low-traffic APIs |
| Standard (m5.xlarge) | 4 vCPU | 16 GB | General API servers |
| Memory-optimized (r5.2xlarge) | 8 vCPU | 64 GB | Redis, in-memory caches |
| Compute-optimized (c5.4xlarge) | 16 vCPU | 32 GB | CPU-bound processing |
| Storage-optimized (i3.2xlarge) | 8 vCPU | 61 GB | ~1.9 TB NVMe SSD | Cassandra, Elasticsearch |

**Rule of thumb for Redis sharding**: assume **25–32 GB usable RAM per node** after OS overhead.

---

## Horizontal Scaling — How Many Servers Do You Need?

### Formula

```
servers needed = ceil(peak_rps / rps_per_server)

Add 30–50% buffer for headroom:
servers_with_buffer = ceil(peak_rps / (rps_per_server × 0.7))
```

### Examples

**Scenario: 1 million req/sec to a Node.js API**
```
Node.js handles ~20K req/sec per server
1,000,000 / 20,000 = 50 servers
With 30% buffer → ceil(50 / 0.7) = 72 servers
```

**Scenario: Store 1 TB in Redis**
```
Usable RAM per node: ~32 GB
1,000 GB / 32 GB = 32 nodes (shards)
Add replicas (1 replica per shard) → 64 total nodes
```

**Scenario: 500K Kafka messages/sec**
```
Kafka broker handles ~500K msg/sec
1 broker is enough, but add 2 more for fault tolerance → 3 brokers
```

---

## Scaling Strategies

### Vertical Scaling (Scale Up)
- Increase CPU/RAM on a single server.
- Simple, no code changes, but has a ceiling.
- Good first step before adding complexity.
- **Limit**: biggest AWS instance is ~448 vCPU, 24 TB RAM (u-24tb1.metal).

### Horizontal Scaling (Scale Out)
- Add more servers behind a load balancer.
- Requires stateless services (no session pinning).
- Unlimited theoretical ceiling.
- **Best for**: API servers, cache clusters, Kafka brokers.

### Read Replicas
- Add read-only copies of the database.
- Writes go to master, reads distributed across replicas.
- Replication is async → eventual consistency on reads.
- **Good for**: read-heavy workloads (social feeds, product catalogs).
- **Rule of thumb**: 1 master + 2–5 read replicas covers most read-heavy apps.

### Sharding (Partitioning)
- Split data across multiple nodes by a shard key.
- Each shard handles a fraction of the total load.
- **Shard key choice is critical** — a bad key creates hot shards.
- Good shard keys: userId, sessionId, randomized hash.
- Bad shard keys: timestamp (all writes go to the latest shard), country (uneven distribution).

### Caching Layer
- Put Redis/Memcached in front of the DB.
- Cache-hit ratio of 90%+ means the DB sees only 10% of traffic.
- Rule of thumb: **20% of data accounts for 80% of reads** (Pareto principle) — cache that 20%.

---

## Latency Reference (Numbers to Memorize)

| Operation | Latency |
|---|---|
| L1 cache reference | ~0.5 ns |
| L2 cache reference | ~7 ns |
| RAM access | ~100 ns |
| SSD random read | ~100 µs (0.1 ms) |
| HDD random read | ~10 ms |
| Redis GET (in-region) | ~0.5–1 ms |
| Postgres query (indexed, in-region) | ~1–5 ms |
| Cross-datacenter roundtrip | ~50–150 ms |
| S3 GET (same region) | ~5–50 ms |

**Key takeaway**: memory is 1000x faster than SSD. SSD is 100x faster than HDD. Network adds ms-level latency.

---

## Quick Reference: Traffic to Servers

| Daily Active Users | Avg req/user/day | Peak req/sec | API Servers needed |
|---|---|---|---|
| 100K | 10 | ~20 | 1 |
| 1M | 10 | ~200 | 1–2 |
| 10M | 10 | ~2K | 1–2 (with caching) |
| 100M | 10 | ~20K | 1–2 (with caching + read replicas) |
| 1B | 10 | ~200K | ~10–20 |

**Peak formula**: DAU × avg_req_per_user / 86400 × peak_multiplier (2–5x for spikes)

```
Example: 10M DAU, 10 req/day each
= 100M req/day
= 100M / 86400 ≈ 1,160 req/sec average
× 3 (peak multiplier) ≈ 3,500 req/sec peak

Node.js server handles 20K req/sec → 1 server is enough at this scale
(in practice, run 2–3 for redundancy)
```

---

## Common Interview Estimation Pattern

```
1. Start with DAU and req/user/day
2. Calculate avg req/sec → × peak multiplier for peak req/sec
3. Divide by server capacity to get server count
4. Add 30–50% buffer
5. Add redundancy (minimum 2 nodes per role for HA)
6. Calculate storage: writes/day × record_size × retention_days
7. Divide storage by node capacity to get node count
```