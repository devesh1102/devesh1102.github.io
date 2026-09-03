# Problem
Addressing the problem of read in application


## 1. Database optimization
* use INdex on the rows used in query. the indexding reduces the timecomplexity to log(n) vs n
* Use denormalized data.
    * pro: read fast
    * con: write slow


## 2. Read Replicas
* Useful when too many read reuests are comming
* create the copy of data into many clusters. the server can read form any cluster. 
* sacrificing read over write
* diffucult to  write. Either you miss consistency or avalability

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

## 4. application cachin

## 5. CDN and Edge Caching