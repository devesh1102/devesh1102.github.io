# Database Comparison: Cassandra vs PostgreSQL vs DynamoDB

## Quick Overview

| Database | Type | Model | Best For |
|----------|------|-------|----------|
| **PostgreSQL** | SQL | Relational | Complex queries, ACID transactions |
| **Cassandra** | NoSQL | Wide-column | Write-heavy, distributed scale |
| **DynamoDB** | NoSQL | Key-value/Document | Serverless, predictable performance |

## Quick Decision Matrix

| Requirement | PostgreSQL | Cassandra | DynamoDB |
|-------------|-----------|-----------|----------|
| **ACID Transactions** | ✅ Best | ❌ No | ⚠️ Limited |
| **Complex Queries** | ✅ Best | ❌ Limited | ❌ Limited |
| **Write Scalability** | ❌ Limited | ✅ Best | ✅ Good |
| **Read Scalability** | ⚠️ Replicas | ✅ Best | ✅ Best |
| **Strong Consistency** | ✅ Always | ⚠️ Tunable | ⚠️ Optional |
| **Operational Simplicity** | ⚠️ Moderate | ❌ Complex | ✅ Best |
| **Cost (Low Traffic)** | ✅ Good | ❌ Expensive | ✅ Best |
| **Cost (High Traffic)** | ✅ Good | ✅ Good | ⚠️ Expensive |
| **Multi-region** | ❌ Complex | ✅ Built-in | ✅ Global Tables |
| **Latency** | 1-10ms | <1ms writes | 5-10ms |
| **Max Scale** | 10-100 TB | Petabytes | Unlimited |
| **Vendor Lock-in** | ✅ Portable | ✅ Portable | ❌ AWS only |

## Summary Table

| Database | Scale | Write Speed | Read Speed | Consistency | Best Use Case |
|----------|-------|-------------|------------|-------------|---------------|
| **PostgreSQL** | Moderate (10-100 TB) | 10-50K/sec | 100K+/sec | Strong (ACID) | Transactional systems, complex queries |
| **Cassandra** | Massive (PB+) | 1M+/sec | 1M+/sec | Tunable (eventual default) | Time-series, high-volume writes |
| **DynamoDB** | Unlimited | Unlimited (on-demand) | Unlimited (on-demand) | Eventual/Strong (configurable) | Serverless, variable traffic |


## Scalability

### PostgreSQL (Vertical + Limited Horizontal)

**Scaling Approach:**
```
Single master node (writes)
├── Read replicas (read scaling)
├── Vertical scaling (bigger machine)
└── Sharding (manual, complex)
```

**Scale Characteristics:**
- ⚠️ **Vertical scaling**: Scale up single server (CPU, RAM, disk)
- ⚠️ **Read replicas**: Scale reads across multiple servers
- ❌ **Write scaling**: Limited to single master
- ❌ **Sharding**: Possible but application-level, complex
- **Max practical scale**: ~10-100 TB per instance
- **Write throughput**: ~10,000-50,000 writes/sec (single node)
- **Read throughput**: ~100,000+ reads/sec (with replicas)

**Scaling Limitations:**
- Single master bottleneck for writes
- Manual sharding required for massive scale
- Cross-shard queries become complex
- Vertical scaling has hardware limits

### Cassandra (Horizontal)

**Scaling Approach:**
```
Distributed cluster (peer-to-peer)
├── Add more nodes → linear scale
├── No master/slave
├── Automatic data distribution
└── Multi-datacenter support
```

**Scale Characteristics:**
- ✅ **Horizontal scaling**: Add nodes, get more capacity
- ✅ **Linear scalability**: 2x nodes = 2x throughput
- ✅ **Write scaling**: All nodes accept writes
- ✅ **Read scaling**: Data replicated across nodes
- **Max practical scale**: Petabytes (Netflix: 1+ PB)
- **Write throughput**: 1,000,000+ writes/sec (cluster)
- **Read throughput**: 1,000,000+ reads/sec (cluster)

**Scaling Advantages:**
- No single point of failure
- Simple scaling (add nodes)
- Multi-region out of the box
- Handles massive write loads

### DynamoDB (Fully Managed Horizontal)

**Scaling Approach:**
```
AWS-managed distributed system
├── Auto-scaling (or on-demand)
├── Invisible infrastructure
├── Global tables (multi-region)
└── Partition-based distribution
```

**Scale Characteristics:**
- ✅ **Horizontal scaling**: Automatic partition management
- ✅ **Auto-scaling**: Responds to load automatically
- ✅ **On-demand mode**: No capacity planning needed
- ✅ **Write scaling**: Distributed across partitions
- ✅ **Read scaling**: Distributed + caching (DAX)
- **Max practical scale**: Unlimited (AWS-managed)
- **Write throughput**: Virtually unlimited (on-demand)
- **Read throughput**: Virtually unlimited (on-demand)

**Scaling Advantages:**
- Zero operational overhead
- Instant scaling (on-demand mode)
- Global replication built-in
- No capacity planning (on-demand)

## Read Performance

### PostgreSQL

**Read Speed:**
```
Single row by primary key: <1ms
Index lookup: 1-10ms
Complex JOIN: 10-1000ms+
Full table scan: Seconds to minutes
```

**Performance Characteristics:**
- ✅ **Excellent for complex queries** (JOINs, aggregations)
- ✅ **Strong consistency** (always latest data)
- ✅ **ACID transactions**
- ⚠️ **Slower for simple key lookups** vs NoSQL
- ❌ **Limited by single node** for writes

**Optimization:**
- Indexes (B-tree, Hash, GiST, etc.)
- Materialized views
- Query optimization
- Connection pooling

**Best Read Patterns:**
- Complex analytical queries
- Multi-table JOINs
- Aggregations (SUM, AVG, COUNT)
- Full-text search
- Geospatial queries

### Cassandra

**Read Speed:**
```
Single partition read: 1-10ms
Multi-partition read: 10-100ms
Range query (same partition): 5-50ms
Cross-partition scan: Slow (discouraged)
```

**Performance Characteristics:**
- ✅ **Very fast for single partition reads**
- ✅ **Linear scaling** (more nodes = more reads)
- ⚠️ **Tunable consistency** (trade consistency for speed)
- ❌ **No JOINs** (denormalization required)
- ❌ **Limited query flexibility**

**Consistency Levels (Read):**
```
ONE: Fastest, least consistent
QUORUM: Balanced
ALL: Slowest, most consistent
```

**Best Read Patterns:**
- Time-series data (by partition key)
- User profiles/sessions (by user ID)
- Simple key lookups
- Sequential data access
- High-volume reads

### DynamoDB

**Read Speed:**
```
Single item (primary key): <10ms (typically 1-5ms)
Query (partition key): 10-50ms
Scan (full table): Slow (avoid)
Global secondary index: 10-50ms
```

**Performance Characteristics:**
- ✅ **Consistent single-digit latency** (with DAX: <1ms)
- ✅ **Predictable performance** at any scale
- ✅ **Auto-scaling** handles traffic spikes
- ⚠️ **Eventual consistency** by default (strongly consistent available)
- ❌ **No complex queries** (limited query patterns)

**Read Consistency Options:**
```
Eventually Consistent: Faster, cheaper (default)
Strongly Consistent: Slower, 2x cost
```

**Optimization:**
- DynamoDB Accelerator (DAX) for caching
- Global secondary indexes
- Projection expressions (fetch only needed fields)
- Batch operations

**Best Read Patterns:**
- Key-value lookups
- Session storage
- User profiles
- Shopping carts
- Real-time leaderboards

## Write Performance

### PostgreSQL

**Write Speed:**
```
Single INSERT: 1-5ms
Batch INSERT: 10-100ms (1000s of rows)
UPDATE with index: 5-20ms
Complex UPDATE with triggers: 20-100ms+
```

**Performance Characteristics:**
- ✅ **ACID guarantees** (durability, consistency)
- ✅ **Transactions** (multi-statement atomicity)
- ⚠️ **Single master** limits write throughput
- ❌ **Write scaling** requires sharding
- ⚠️ **Slower than NoSQL** for simple writes

**Write Limitations:**
- ~10,000-50,000 writes/sec per instance
- Locking can cause contention
- Index updates add overhead
- WAL (Write-Ahead Log) ensures durability

**Best Write Patterns:**
- Transactional systems (banking, orders)
- Complex business logic
- Data integrity critical
- Referential integrity needed

### Cassandra

**Write Speed:**
```
Single write: <1ms
Batch write: 5-10ms
Write throughput: 1,000,000+ writes/sec (cluster)
```

**Performance Characteristics:**
- ✅ **Extremely fast writes** (append-only log)
- ✅ **Linear write scaling** (add nodes = more writes)
- ✅ **No locking** (conflict-free)
- ✅ **Writes to memory first** (fast acknowledgment)
- ⚠️ **Eventually consistent** (tunable)

**Why Writes Are Fast:**
```
1. Write to commit log (sequential disk write)
2. Write to memtable (in-memory)
3. Acknowledge immediately
4. Flush to disk later (async)
```

**Write Process:**
```
Client Write
    ↓
Commit Log (disk) ─┐
Memtable (memory) ─┤
    ↓              │
Return Success ←───┘
    ↓ (async)
SSTable (disk)
```

**Best Write Patterns:**
- Time-series data (IoT, logs, metrics)
- Event logging
- High-volume ingestion
- Sensor data
- Activity feeds

### DynamoDB

**Write Speed:**
```
Single item write: <10ms (typically 5-10ms)
Batch write (25 items): 20-50ms
Transaction (10 items): 50-100ms
```

**Performance Characteristics:**
- ✅ **Predictable latency** (single-digit ms)
- ✅ **Auto-scaling** handles spikes
- ✅ **On-demand mode** eliminates throttling
- ✅ **Serverless** (no capacity planning)
- ⚠️ **Higher latency than Cassandra** for writes
- ⚠️ **Costly at high volumes**

**Write Modes:**
```
On-Demand:
- Pay per request
- Auto-scales instantly
- No throttling
- Higher per-request cost

Provisioned:
- Pre-allocate capacity
- Auto-scaling (with delay)
- Can throttle if exceeded
- Lower per-request cost
```

**Best Write Patterns:**
- Variable/unpredictable traffic
- Serverless applications
- Low-to-medium write volumes
- Need predictable performance
- Multi-region writes (Global Tables)

## Consistency Models

### PostgreSQL
```
Consistency: STRONG (always)
Model: ACID transactions
```
- ✅ Always read your writes
- ✅ Linearizable
- ✅ ACID guarantees
- Perfect for: Financial systems, orders, inventory

### Cassandra
```
Consistency: TUNABLE (per query)
Model: Eventually consistent (by default)
```

**Consistency Levels:**
```
Write Levels:
- ONE: Write to 1 replica (fastest)
- QUORUM: Write to majority (N/2 + 1)
- ALL: Write to all replicas (slowest)

Read Levels:
- ONE: Read from 1 replica (fastest)
- QUORUM: Read from majority
- ALL: Read from all replicas
```

**Strong Consistency Recipe:**
```
Write at QUORUM + Read at QUORUM = Strong consistency
(but slower than eventual consistency)
```

**Trade-offs:**
- ONE/ONE: Fast but may read stale data
- QUORUM/QUORUM: Balanced (common choice)
- ALL/ALL: Slow but always consistent

### DynamoDB
```
Consistency: EVENTUAL (default) or STRONG (optional)
Model: Configurable per read
```

**Read Consistency:**
```
Eventually Consistent (default):
- Faster
- Cheaper (50% of strong)
- May read stale data (<1s old)

Strongly Consistent:
- Slower
- 2x cost
- Always latest data
```

**Writes:**
- Always strongly consistent
- Cannot read stale data on your own writes

## CAP Theorem Positioning

```
         Consistency
              ▲
              │
              │
        PostgreSQL
              │
              │
              │
┌─────────────┼─────────────┐
│             │             │
│             │             │
│             │             │
│        Cassandra      DynamoDB
│      (tunable)       (tunable)
│                             │
└─────────────────────────────┘
Availability              Partition
                         Tolerance
```

**PostgreSQL**: CP (Consistency + Partition Tolerance)
- Chooses consistency over availability
- Becomes unavailable during partitions

**Cassandra**: AP (Availability + Partition Tolerance)
- Chooses availability over consistency
- Always available, eventually consistent
- Can tune toward CP with QUORUM/ALL

**DynamoDB**: AP (with tunable consistency)
- Highly available
- Eventually consistent by default
- Strong consistency available (with trade-offs)

## Data Model Differences

### PostgreSQL (Relational)
```sql
-- Normalized tables with relationships
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    total DECIMAL(10,2),
    created_at TIMESTAMP
);

-- JOIN to get data
SELECT u.email, o.total
FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE u.user_id = 123;
```

### Cassandra (Wide-Column)
```sql
-- Denormalized, query-driven design
CREATE TABLE user_orders (
    user_id UUID,
    order_date TIMESTAMP,
    order_id UUID,
    email TEXT,
    total DECIMAL,
    PRIMARY KEY (user_id, order_date, order_id)
) WITH CLUSTERING ORDER BY (order_date DESC);

-- No JOINs, single partition read
SELECT * FROM user_orders
WHERE user_id = 123abc-...;
```

**Key Concepts:**
- **Partition Key**: Determines data distribution (user_id)
- **Clustering Key**: Sorts data within partition (order_date)
- **Denormalization**: Duplicate data for query patterns
- **No JOINs**: Design tables per query

### DynamoDB (Key-Value/Document)
```javascript
// Single table design common
{
  "PK": "USER#123",           // Partition key
  "SK": "ORDER#2024-01-15",   // Sort key
  "email": "user@example.com",
  "total": 99.99,
  "status": "completed",
  "GSI1PK": "ORDER#pending"   // For global secondary index
}

// Get user's orders
query({
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
  ExpressionAttributeValues: {
    ":pk": "USER#123",
    ":sk": "ORDER#"
  }
});
```

**Key Concepts:**
- **Partition Key (PK)**: Required, determines distribution
- **Sort Key (SK)**: Optional, enables range queries
- **Single Table Design**: Store multiple entity types in one table
- **Global Secondary Indexes (GSI)**: Alternate query patterns

## Cost Comparison

### PostgreSQL

**Hosting Costs:**
```
Self-hosted (AWS EC2):
- t3.medium: ~$30/month (dev)
- r5.2xlarge: ~$400/month (production)
- Storage: $0.10/GB/month

Managed (AWS RDS):
- db.t3.medium: ~$60/month
- db.r5.2xlarge: ~$800/month
- Storage: $0.115/GB/month
- Backups: Free (up to 100% of storage)

Additional costs:
- Read replicas: Cost of additional instances
- Backups: Storage costs
```

**Cost Characteristics:**
- Fixed monthly cost (regardless of usage)
- Scale vertically = higher tier = more cost
- Cheaper for consistent, high usage

### Cassandra

**Hosting Costs:**
```
Self-managed cluster (3 nodes):
- Dev: 3 × t3.medium = ~$90/month
- Production: 3 × i3.2xlarge = ~$1,200/month

Managed (AWS Keyspaces):
- On-demand: Pay per read/write
  - Reads: $0.28 per million
  - Writes: $1.43 per million
- Provisioned: Similar to DynamoDB

Managed (DataStax Astra):
- Serverless pricing model
- $0.25/hour per cluster + usage
```

**Cost Characteristics:**
- Higher base cost (need cluster)
- Linear cost scaling (more nodes = more cost)
- Cheaper than DynamoDB at very high scale
- Operational overhead if self-managed

### DynamoDB

**Pricing Models:**
```
On-Demand Mode:
- Writes: $1.25 per million
- Reads (eventual): $0.25 per million
- Reads (strong): $0.50 per million
- Storage: $0.25/GB/month

Provisioned Mode:
- Write capacity: $0.47 per WCU/month
- Read capacity: $0.09 per RCU/month
- Auto-scaling available
- Storage: $0.25/GB/month

Example (on-demand):
1M reads + 1M writes/month = $1.50
10M reads + 10M writes/month = $15
100M reads + 100M writes/month = $150
```

**Cost Characteristics:**
- Pay per request (on-demand)
- No base cost if not used
- Can get expensive at high scale
- Managed service (no operational cost)

**Cost Comparison Example (1 billion writes/month):**
- PostgreSQL (RDS): ~$800/month + operational work
- Cassandra (self-managed): ~$1,200-2,000/month + operational work
- DynamoDB (on-demand): ~$1,250/month, zero operational work
- DynamoDB (provisioned): ~$600-800/month, zero operational work

## When to Use Each

### Use PostgreSQL When:

✅ **Requirement Checklist:**
- [ ] Need **ACID transactions**
- [ ] **Complex queries** (JOINs, aggregations)
- [ ] **Data integrity** critical (foreign keys, constraints)
- [ ] **Structured data** with relationships
- [ ] **Ad-hoc queries** needed
- [ ] **Moderate scale** (< 10 TB)
- [ ] **Vertical scaling** acceptable
- [ ] Strong consistency required
- [ ] Team knows SQL well

**Perfect For:**
```
✅ E-commerce (orders, inventory, payments)
✅ Banking/Financial systems
✅ CRM systems
✅ ERP applications
✅ Content management systems
✅ Traditional web applications
✅ Admin dashboards
✅ Reporting and analytics
```

**Not Good For:**
```
❌ Write-heavy workloads (millions writes/sec)
❌ Massive scale (> 100 TB)
❌ Multi-region active-active
❌ Simple key-value access patterns
❌ Highly variable traffic (scale to zero)
```

### Use Cassandra When:

✅ **Requirement Checklist:**
- [ ] **Massive write throughput** (100k-1M+ writes/sec)
- [ ] **Linear scalability** needed
- [ ] **High availability** critical (no downtime)
- [ ] **Multi-datacenter** deployment
- [ ] **Time-series data** (logs, metrics, events)
- [ ] **Predictable query patterns**
- [ ] **Partition-tolerant** system needed
- [ ] Team can handle operational complexity
- [ ] Eventual consistency acceptable

**Perfect For:**
```
✅ Time-series data (IoT, logs, metrics)
✅ Event logging and analytics
✅ Messaging systems (message history)
✅ Activity feeds (social media)
✅ Product catalogs (e-commerce)
✅ Sensor data ingestion
✅ Real-time recommendations
✅ Gaming leaderboards
```

**Examples:**
- Netflix: Media metadata, viewing history
- Apple: 75,000+ Cassandra nodes
- Instagram: User feeds
- Uber: Trip data

**Not Good For:**
```
❌ Complex queries (JOINs, aggregations)
❌ Transactions across multiple rows
❌ Small datasets (< 1 TB)
❌ Unpredictable query patterns
❌ Strong consistency requirements
❌ Teams without NoSQL experience
```

### Use DynamoDB When:

✅ **Requirement Checklist:**
- [ ] **Serverless architecture**
- [ ] **Variable/unpredictable traffic**
- [ ] **Fast, simple queries** (key-value)
- [ ] **Zero operational overhead** wanted
- [ ] **Predictable performance** needed
- [ ] **AWS ecosystem** (Lambda, API Gateway)
- [ ] **Auto-scaling** required
- [ ] **Global replication** needed (Global Tables)
- [ ] Small-to-medium data size

**Perfect For:**
```
✅ Serverless applications
✅ Session storage
✅ Shopping carts
✅ User profiles
✅ Mobile app backends
✅ Gaming (player data, leaderboards)
✅ IoT data (moderate scale)
✅ Real-time voting/counting
✅ Metadata storage
```

**Examples:**
- Amazon.com: Shopping cart
- Lyft: Trip data
- Duolingo: User progress
- Snap: User data

**Not Good For:**
```
❌ Complex queries (JOINs, aggregations)
❌ Large scans (full table reads)
❌ Extremely high write volumes (cost)
❌ Need for SQL
❌ Multi-cloud requirements
❌ On-premise deployment
❌ Tight budget at high scale
```

## Migration Considerations

### PostgreSQL → Cassandra
**Reasons:**
- Need write scalability
- Require multi-region HA
- Simple query patterns
- Time-series workload

**Challenges:**
- Redesign data model (denormalization)
- Remove JOINs from queries
- Handle eventual consistency
- Operational complexity

### PostgreSQL → DynamoDB
**Reasons:**
- Reduce operational overhead
- Variable traffic patterns
- Move to serverless
- Need auto-scaling

**Challenges:**
- Redesign for single-table design
- Limited query patterns
- Vendor lock-in
- Cost at high scale

### Cassandra → DynamoDB
**Reasons:**
- Reduce operational burden
- Lower scale needs
- Want managed service
- Simplify architecture

**Challenges:**
- Cost comparison at scale
- Migration complexity
- Vendor lock-in


## Final Recommendations

**Start with PostgreSQL if:**
- You're building a traditional web application
- You need ACID guarantees
- Your data has complex relationships
- Your team knows SQL

**Choose Cassandra if:**
- You have massive write requirements
- You need multi-datacenter deployment
- You have time-series or event data
- You have experienced NoSQL team

**Choose DynamoDB if:**
- You're building on AWS (serverless)
- You want zero operational overhead
- You have variable/unpredictable traffic
- You need simple key-value access

**Remember:** You can use multiple databases in the same application (polyglot persistence)!
