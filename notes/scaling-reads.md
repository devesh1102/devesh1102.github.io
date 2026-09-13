# Scaling Reads

Read scaling increases the number of queries a system can serve without
overloading its database. In an interview, first quantify the workload: read
QPS, read/write ratio, latency target, access patterns, data size, hotspot
distribution, and consistency requirements. Then apply the least complex
solution that removes the measured bottleneck.

## 1. Database Optimization

Optimize the primary database before introducing distributed infrastructure:

- **Create indexes for real access patterns.** Composite index column order
  should match common filters and sorting. A B-tree lookup is generally
  `O(log n)`, but a low-selectivity or mismatched index may still scan many
  rows. Confirm behavior with `EXPLAIN` or the database's query plan.
- **Select only required columns.** Smaller rows reduce disk reads, memory use,
  serialization work, and network transfer. A covering index can serve some
  queries without accessing the base table.
- **Avoid unbounded reads.** Use pagination and limits. Prefer keyset pagination
  over large offsets because the database does not need to scan and discard all
  preceding rows.
- **Fix inefficient query patterns.** Remove N+1 queries, batch related reads,
  and pre-compute expensive aggregations when they do not need to be calculated
  synchronously.
- **Pre-compute read models.** Materialized views store expensive query results,
  while denormalized tables duplicate joined data for faster reads; both trade
  freshness and write complexity for lower read latency.

## 2. Read Replicas

Read replicas copy data from a primary database and distribute read traffic
across additional database nodes. They are useful when the primary is
read-bound after its queries and indexes have been optimized.

- Route writes to the primary and read-only queries to replicas.
- Use connection pooling and load balancing across healthy replicas.
- Add replicas to increase aggregate read capacity, while remembering that one
  hot query or a shared storage bottleneck may still limit scaling.
- Plan for replication lag. A user who writes data and immediately reads from a
  replica may not see the update, so read-after-write flows may need primary
  reads, session stickiness, or a replication-position check.
- Replicas improve read capacity and availability, but add cost, failover
  complexity, monitoring requirements, and eventual-consistency trade-offs.

## 3. Sharding
Sharding divides a dataset across multiple databases. Unlike replication, each
shard owns a different subset of the data. It is primarily a write-scaling
technique, but it can also improve reads when a query can be routed to one
shard instead of scanning the entire dataset.

**Partitioning vs. sharding:** partitioning splits data within one logical
database, while sharding distributes those partitions across independent
database servers so they can scale horizontally.

### How to reason about a sharding design

1. **Choose a shard key from the access patterns.** For a social media app,
   most queries are user-centric: loading a user's posts, followers, or likes.
   Sharding by `user_id` keeps most of these reads on a single shard. A good
   shard key has high cardinality (many unique values), distributes data evenly
   across shards, and aligns with common query patterns so queries hit one
   shard instead of spanning multiple shards.
2. **Choose a distribution strategy.** Hash-based sharding distributes users
   more evenly than range-based sharding. Consistent hashing also reduces the
   amount of data that must move when capacity is added.
3. **Call out the trade-offs.** Global queries, such as "trending posts across
   all users," require a scatter-gather query across every shard and an
   aggregation step. A better approach is often to pre-compute trending content
   with a background job and serve it from a cache. Other trade-offs include
   operational complexity, hotspot risks from unusually active users, and
   harder joins and transactions across shards.
4. **Plan for growth.** Start with logical shards, for example 64 partitions
   mapped onto a smaller number of physical database nodes. As traffic grows,
   move logical shards to new nodes. Consistent hashing helps limit how much
   data moves during this rebalancing.

### Two-phase commit for cross-shard transactions

When one transaction must update multiple shards atomically, a coordinator can
use **two-phase commit (2PC)**:

1. **Prepare:** the coordinator asks every participating shard to perform and
   durably record the operation without committing it. Each shard votes yes or
   no and keeps the affected resources locked.
2. **Commit or abort:** if every shard votes yes, the coordinator tells all of
   them to commit. If any shard votes no, all participants roll back.

2PC provides atomicity across shards, but adds network round trips, increases
latency, and can leave locks held while a failed coordinator recovers. This
reduces availability, so cross-shard transactions should be uncommon. A good
shard key keeps related data together; workflows that can tolerate eventual
consistency can instead use sagas, idempotent events, or asynchronous
compensating operations.

## 4. Application Caching

Caching reduces database load and read latency by storing frequently accessed
data closer to the application. However, **cache invalidation remains the
primary challenge**: when the source data changes, the system must prevent
caches from serving stale values for longer than the product can tolerate.

### Hot keys and request coalescing

Traditional caching assumes requests are distributed across many keys. That
assumption breaks when one item becomes extremely popular. For example, a
celebrity post may suddenly receive 500,000 reads per second while the cache
node holding that key can serve only 50,000. The value is already in memory,
but repeatedly serializing and transferring it can still exhaust the node's CPU
or network capacity.

**Request coalescing**, also called single-flight, combines concurrent requests
for the same key into one upstream request. Every caller awaits the same task
instead of independently querying the remote cache or database.

```python
import asyncio


class CoalescingCache:
    def __init__(self):
        self.inflight = {}  # key -> shared Task

    async def get(self, key):
        task = self.inflight.get(key)

        if task is None:
            task = asyncio.create_task(fetch_from_backend(key))
            self.inflight[key] = task
            task.add_done_callback(
                lambda completed, cache_key=key:
                    self._remove_if_current(cache_key, completed)
            )

        # One cancelled caller must not cancel the shared upstream request.
        return await asyncio.shield(task)

    def _remove_if_current(self, key, task):
        if self.inflight.get(key) is task:
            del self.inflight[key]
```

With process-local coalescing, a burst produces at most one upstream request per
application server while the fetch is in flight. If there are `N` application
servers, the backend sees at most `N` concurrent fetches for that key rather
than one per user. A distributed lock or dedicated request-coalescing layer can
reduce this further, but adds coordination latency and failure modes.

Coalescing protects the upstream service during misses and refreshes, but does
not fully solve a sustained hot key whose cached value must still be returned
hundreds of thousands of times per second. Common additional protections
include a small in-process near-cache, stale-while-revalidate, and **cache key
fanout**.

With key fanout, store identical copies under several keys, such as
`feed:taylor-swift:1` through `feed:taylor-swift:10`. Clients select a suffix
randomly or by a stable hash so the copies map to different cache shards. Ten
well-distributed copies can turn 500,000 requests per second against one key
into roughly 50,000 requests per second per key.

Fanout trades capacity for availability: it consumes more memory, lowers the
hit rate while replicas warm up, and makes writes and invalidation more
expensive because every copy must be updated or made unreachable. It is most
useful for read-heavy, highly skewed workloads where a single hot key threatens
the availability of the cache cluster.

### Cache invalidation strategies

| Strategy | How it works | Trade-off |
|---|---|---|
| **Time-based expiration (TTL)** | Give each cached entry a fixed lifetime and refresh it after expiration. | Simple and resilient, but stale data may be served until the TTL expires. Works well when update patterns are predictable. |
| **Cache-aside with invalidate-on-write** | Write to the database, then delete the affected cache entries so the next read repopulates them. | Common and simple, but a failed invalidation or a racing late reader can leave stale data in the cache. |
| **Write-through caching** | Update the database and cache through one write path before acknowledging success. | Keeps cached data current, but increases write latency and requires a clear policy for partial failures. |
| **Event-driven invalidation** | Publish an invalidation event, preferably through a transactional outbox, and process it asynchronously. | Decouples cache maintenance from the request path, but introduces an eventual-consistency window and requires retries and idempotent consumers. |
| **Tagged invalidation** | Associate related cache entries with tags such as `user:123:posts`, then invalidate every entry carrying a changed tag. | Useful for complex dependencies, but the tag-to-key relationships add storage and operational complexity. |
| **Versioned keys** | Include a version in the cache key, such as `user:123:v7`, and increment the version when the data changes. | Makes old entries unreachable without explicitly deleting them, but requires version tracking and cleanup of obsolete entries. |

### Versioned keys and the late-writer problem

Store a version number with each database record rather than only in the cache.
Whenever the record changes, update the data and increment its version in the
same database transaction.

**On read:**

1. Read the current version from a small cached version key, falling back to the
   database when it is missing.
2. Construct the data key from the record ID and version, such as
   `event:123:v42`.
3. Read the data using that versioned key.
4. On a cache miss, fetch the record and its version together from the database.
   Cache the value under the version returned with that record, and refresh the
   version key if it changed during the read.

**On write:**

1. Begin a database transaction.
2. Update the row and increment its version, for example
   `version = version + 1`.
3. Commit the transaction.
4. Refresh the cached version key and optionally populate the new data key,
   such as `event:123:v43`.

This prevents the **late-writer problem** found in cache-aside systems. Suppose
a slow reader fetches version 42 just before another request commits version
43. If the slow reader finishes later, it can only write the stale value to
`event:123:v42`; it cannot overwrite `event:123:v43`. Once clients observe the
new version, they route around the old entry, so explicit deletion and partial
invalidation are unnecessary. Versioned URLs provide the same benefit for CDN
and browser caches.

Old versions should still have a TTL so they are eventually removed. The small
version key must also be refreshed or invalidated reliably after a commit;
otherwise clients may temporarily continue reading the old version even though
the stale data cannot overwrite the new cache entry.

The right strategy depends on the consistency requirement. Product catalogs and
public profiles can often tolerate short TTLs, while permissions, balances, and
inventory usually need immediate invalidation or a direct read from the source
of truth. In practice, systems often combine invalidate-on-write or
write-through caching with a TTL as a safety net, and use metrics for cache hit
rate, stale reads, eviction rate, and invalidation failures.

## 5. CDN and Edge Caching

A content delivery network caches responses at geographically distributed edge
locations. Requests are served closer to users, reducing origin traffic and
network latency. CDNs work best for static assets, media, downloads, and public
or safely partitioned API responses.

- Define cacheability with `Cache-Control`, `Expires`, `ETag`, and
  `Last-Modified` headers.
- Prefer immutable, versioned asset URLs such as `app.a1b2c3.js`; new content
  gets a new URL while old content expires naturally.
- Use a carefully designed cache key that includes every request attribute that
  changes the response, such as path, selected query parameters, locale, or
  encoding.
- Prevent a cold edge from overwhelming the origin with origin shielding,
  request coalescing, stale-while-revalidate, and stale-if-error.
- Purge or version content that must change quickly, while accounting for purge
  propagation time across edge locations.

Do not publicly cache personalized or authorized responses unless the cache key
and privacy controls prevent one user's data from being served to another.
Headers such as `Cache-Control: private` or `no-store` are appropriate when the
response must remain user-specific or must not be retained.

## 6. When Not to Use Read-Scaling Patterns

Read-scaling techniques add infrastructure, consistency risks, and operational
overhead. Use them only when read traffic is the actual bottleneck.

| Scenario | Why read-scaling patterns may be the wrong focus | Better starting point |
|---|---|---|
| **Write-heavy systems** | Workloads such as driver-location tracking update records every few seconds and may have a read/write ratio of only `2:1` or `1:1`. More caches and replicas do not address the primary bottleneck. | Scale ingestion and writes through partitioning, batching, append-only logs, or asynchronous processing. |
| **Small-scale applications** | A system serving roughly 1,000 users usually does not justify complex cache invalidation, replication, or sharding. Premature distribution creates more failure modes than value. | Start with a well-indexed single database, measure its capacity, and add complexity only when evidence requires it. |
| **Strongly consistent systems** | Stale balances, permissions, or inventory counts can cause financial loss or incorrect decisions. Replicas and caches may expose outdated state. | Read from the authoritative store when necessary, or use carefully designed caching with immediate invalidation, short TTLs, and explicit consistency guarantees. |
| **Real-time collaborative systems** | Applications such as collaborative document editors need changes to become visible immediately. Caching each rapidly changing value can increase staleness and invalidation traffic. | Prioritize real-time synchronization, ordered event delivery, conflict resolution, and persistent connections. |
| **Latency without database pressure** | If the database handles the request volume comfortably, reducing database load is not the real requirement. Adding database replicas or application caches may not improve the slowest part of the request path. | Profile end-to-end latency and consider edge computing, regional deployment, network optimization, or reducing service-to-service hops. |

Read scaling is primarily about reducing load on the database and increasing
read capacity, not simply making every request faster. A good design identifies
the measured bottleneck first and chooses the least complex solution that meets
the workload's capacity, latency, and consistency requirements.

## 7. Common Questions and Short Answers

### What happens when queries take longer as the dataset grows?

Add indexes that match the query's filters, joins, and sort order so the
database can avoid scanning most rows. A B-tree lookup is typically
`O(log n)`, while a full table scan is `O(n)`. Use the query execution plan to
confirm the index is selective and is actually being used; too many indexes
also increase storage and write cost.

### How do you handle millions of concurrent reads for the same cached data?

Use **request coalescing** so concurrent requests for one key share a single
upstream fetch. With process-local coalescing and `N` application servers, a
cache miss or refresh produces at most `N` concurrent backend requests instead
of one request per user. For sustained hot-key traffic, combine coalescing with
an in-process near-cache, CDN, or cache-key fanout.

### What happens when multiple requests rebuild an expired entry simultaneously?

This is a **cache stampede**. Use **probabilistic early refresh**: shortly before
expiration, give each request a small and increasing probability of refreshing
the entry. This spreads refreshes over time instead of making every caller
rebuild the value at the exact expiration instant. Coalescing or a per-key lock
should still ensure only one selected request performs the refresh.

### How do you make cache updates immediately visible?

If strict freshness is required, read from the authoritative database or
validate the cached version before returning it; asynchronous invalidation
alone cannot guarantee immediate visibility. Otherwise, commit the database
update and publish an invalidation event through a transactional outbox to
purge application caches, Redis, and CDN entries. Versioned keys or URLs route
new requests away from old content, while short TTLs provide a safety net when
an invalidation is delayed or missed.
