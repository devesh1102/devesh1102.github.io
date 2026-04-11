# Apache Kafka

## What
* **Distributed Event Streaming Platform** for high-throughput, fault-tolerant message processing
* Originally developed by LinkedIn, now Apache open source project
* Designed for real-time data pipelines and streaming applications
* Combines messaging, storage, and stream processing capabilities
* Horizontally scalable and fault-tolerant by design

## Why Kafka

* **High Throughput**: Millions of messages per second
* **Low Latency**: Sub-millisecond message delivery
* **Horizontal Scalability**: Add brokers and partitions as needed
* **Fault Tolerant**: Replication ensures no data loss
* **Durable**: Messages persisted to disk, can replay
* **Decoupling**: Producers and consumers are independent
* **Real-time Processing**: Stream processing with Kafka Streams
* **Multi-subscriber**: Multiple consumer groups can read same data
* **Long-term Storage**: Can retain messages for days/weeks/forever

## Common Use Cases

### 1. Event Sourcing
Store all state changes as sequence of events

### 2. Log Aggregation
Collect logs from multiple services into central topic

### 3. Stream Processing
Real-time data transformations with Kafka Streams or Flink

### 4. Metrics & Monitoring
Collect and process application metrics in real-time

### 5. Change Data Capture (CDC)
Stream database changes to other systems (Debezium + Kafka)

### 6. Commit Log for Distributed Systems
Replicate data changes across microservices

### 7. Real-time Analytics
Process clickstream, IoT sensor data in real-time

### 8. Message Queue
Decouple microservices communication

## Performance Characteristics

**Throughput:**
- 100K+ messages/second per partition
- Multi-GB/sec aggregate throughput per broker
- Limited mainly by network and disk I/O

**Latency:**
- 2-10ms end-to-end latency (producer to consumer)
- Sub-millisecond with optimized configuration

**Scalability:**
- Thousands of partitions per cluster
- Millions of messages per second per cluster
- Petabyte-scale storage

**Retention:**
- Default: 7 days
- Can be configured per topic
- Can enable compaction for infinite retention (keeps latest value per key)


## Core Terminologies

### 1. **Topic**
* Logical channel or category where messages are published
* Like a table in a database or a folder in a file system
* Each topic is identified by a unique name
* Topics are split into partitions for scalability
* Examples: "user-clicks", "payment-events", "order-updates"

### 2. **Producer**
* Application that publishes (writes) messages to Kafka topics
* Can write to one or more topics
* Decides which partition to send message to (via key or round-robin)
* Receives acknowledgment when message is stored
* Can configure delivery semantics (at-most-once, at-least-once, exactly-once)

### 3. **Consumer**
* Application that subscribes to (reads) messages from Kafka topics
* Can subscribe to one or more topics
* Reads messages in order within each partition
* Tracks its position (offset) in each partition
* Can be part of a consumer group for load balancing

### 4. **Partition**
* Physical subdivision of a topic
* Each partition is an ordered, immutable sequence of messages
* Messages within a partition are ordered by offset
* Partitions enable parallelism and scalability
* Each partition can be hosted on different brokers
* Cannot guarantee order across partitions, only within a partition

### 5. **Broker**
* Kafka server that stores data and serves client requests
* A Kafka cluster consists of multiple brokers
* Each broker handles reads/writes for a set of partitions
* Brokers coordinate using Zookeeper (or KRaft in newer versions)
* Identified by a unique broker ID

### 6. **Consumer Group**
* Set of consumers that cooperate to consume messages from topic(s)
* Each partition is consumed by exactly one consumer in the group
* Enables parallel processing and load balancing
* Multiple groups can consume the same topic independently
* Group coordinator manages consumer assignments

### 7. **Offset**
* Unique sequential ID (number) for each message within a partition
* Starts at 0 and increments for each new message
* Consumers track their current offset position
* Offsets can be committed to Kafka for fault tolerance
* Enables replay: consumers can reset offset to re-read messages

### 8. **Replication**
* Each partition has multiple copies (replicas) across brokers
* One replica is the **Leader** (handles all reads/writes)
* Other replicas are **Followers** (replicate leader's data)
* **Replication Factor**: Number of copies (e.g., RF=3 means 3 copies)
* **ISR (In-Sync Replicas)**: Replicas that are fully caught up with leader
* Provides fault tolerance: if leader fails, follower becomes new leader

### 9. **Zookeeper** (Legacy) / **KRaft** (Modern)
* **Zookeeper**: Used for cluster coordination, leader election, configuration
* **KRaft**: Kafka's built-in consensus protocol (replacing Zookeeper)
* Manages broker membership, topic metadata, partition leadership

### 10. **Message (Record/Event)**
* Unit of data in Kafka
* Structure: **Key | Value | Timestamp | Headers**
  - **Key**: Optional, used for partitioning and ordering
  - **Value**: Actual payload (bytes, JSON, Avro, etc.)
  - **Timestamp**: When message was created
  - **Headers**: Optional metadata

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KAFKA CLUSTER                                │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  Broker 1       │  │  Broker 2       │  │  Broker 3       │    │
│  │  (ID: 1)        │  │  (ID: 2)        │  │  (ID: 3)        │    │
│  │                 │  │                 │  │                 │    │
│  │  Topic: orders  │  │  Topic: orders  │  │  Topic: orders  │    │
│  │  Partition 0 (L)│  │  Partition 0 (F)│  │  Partition 1 (L)│    │
│  │  Partition 2 (L)│  │  Partition 1 (F)│  │  Partition 0 (F)│    │
│  │                 │  │  Partition 2 (F)│  │  Partition 1 (F)│    │
│  │                 │  │                 │  │  Partition 2 (F)│    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│         ▲                    ▲                    ▲                 │
│         └────────────────────┴────────────────────┘                 │
│                              │                                       │
│                    ┌─────────┴─────────┐                           │
│                    │   Zookeeper       │                           │
│                    │   (Coordination)  │                           │
│                    └───────────────────┘                           │
└───────────────────────────────────────────────────────────────────┘

Legend: (L) = Leader, (F) = Follower
```

## Topic with Partitions

```
Topic: "user-events" (3 partitions, replication factor = 2)

┌─────────────────────────────────────────────────────────────┐
│                      TOPIC: user-events                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Partition 0:                                                │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┐                         │
│  │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ ...  (Leader: Broker 1) │
│  └───┴───┴───┴───┴───┴───┴───┴───┘                         │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┐                         │
│  │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ ...  (Follower: Broker 2)│
│  └───┴───┴───┴───┴───┴───┴───┴───┘                         │
│                                                               │
│  Partition 1:                                                │
│  ┌───┬───┬───┬───┬───┬───┐                                 │
│  │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ ...      (Leader: Broker 2)     │
│  └───┴───┴───┴───┴───┴───┘                                 │
│  ┌───┬───┬───┬───┬───┬───┐                                 │
│  │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ ...      (Follower: Broker 3)   │
│  └───┴───┴───┴───┴───┴───┘                                 │
│                                                               │
│  Partition 2:                                                │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐                    │
│  │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ ...  (Leader: Broker 3)│
│  └───┴───┴───┴───┴───┴───┴───┴───┴───┘                    │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐                    │
│  │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ ...  (Follower: Broker 1)│
│  └───┴───┴───┴───┴───┴───┴───┴───┴───┘                    │
│                                                               │
│  Numbers = Offset (message position)                         │
│  Messages are immutable and ordered within partition         │
└─────────────────────────────────────────────────────────────┘
```

## Producer to Topic Flow

```
                  Producers
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    Producer 1   Producer 2   Producer 3
         │           │           │
         │           │           │
         └───────────┼───────────┘
                     │
              (Partitioning)
         Key Hash or Round-Robin
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │Partition│ │Partition│ │Partition│
   │    0    │ │    1    │ │    2    │
   ├─────────┤ ├─────────┤ ├─────────┤
   │ msg 0   │ │ msg 0   │ │ msg 0   │
   │ msg 1   │ │ msg 1   │ │ msg 1   │
   │ msg 2   │ │ msg 2   │ │ msg 2   │
   │ msg 3   │ │ msg 3   │ │ msg 3   │
   │  ...    │ │  ...    │ │  ...    │
   └─────────┘ └─────────┘ └─────────┘
        │           │           │
        └───────────┼───────────┘
                    │
              TOPIC: orders
```

**Partitioning Logic:**
- If message has a key: `partition = hash(key) % num_partitions`
- If no key: Round-robin or sticky partitioning
- Custom partitioner: User-defined logic

## Consumer Group Pattern

```
Topic: "payments" (4 partitions)

┌────────────────────────────────────────────────────────┐
│              Partition 0  [msg0, msg1, msg2...]        │
│              Partition 1  [msg0, msg1, msg2...]        │
│              Partition 2  [msg0, msg1, msg2...]        │
│              Partition 3  [msg0, msg1, msg2...]        │
└────────────────────────────────────────────────────────┘
       │           │           │           │
       │           │           │           │
       ▼           ▼           ▼           ▼
┌──────────────────────────────────────────────────────┐
│          Consumer Group: "payment-processors"         │
├──────────────────────────────────────────────────────┤
│  Consumer 1    Consumer 2    Consumer 3    Consumer 4│
│  (reads P0)    (reads P1)    (reads P2)    (reads P3)│
│      │              │             │             │     │
│      ▼              ▼             ▼             ▼     │
│   Process        Process       Process       Process │
└──────────────────────────────────────────────────────┘

KEY RULES:
1. Each partition consumed by exactly ONE consumer in the group
2. One consumer can handle multiple partitions
3. More consumers than partitions = some consumers idle
4. Partitions rebalanced when consumers join/leave
```

## Consumer Group Rebalancing

```
BEFORE (3 consumers, 4 partitions):

Consumer Group: "analytics"
┌─────────────────────────────────────────────────┐
│  Consumer A: [Partition 0, Partition 1]         │
│  Consumer B: [Partition 2]                      │
│  Consumer C: [Partition 3]                      │
└─────────────────────────────────────────────────┘


Consumer B CRASHES ❌

AFTER (Rebalancing):

Consumer Group: "analytics"
┌─────────────────────────────────────────────────┐
│  Consumer A: [Partition 0, Partition 1]         │
│  Consumer C: [Partition 2, Partition 3]         │
└─────────────────────────────────────────────────┘

Partition 2 reassigned to Consumer C
```

## Multiple Consumer Groups

```
              Topic: "user-activity"
         ┌────────────────────────────┐
         │  Partition 0               │
         │  Partition 1               │
         │  Partition 2               │
         └────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Group: "db" │ │Group:"cache"│ │Group:"alert"│
├─────────────┤ ├─────────────┤ ├─────────────┤
│ Consumer 1  │ │ Consumer 1  │ │ Consumer 1  │
│ Consumer 2  │ │ Consumer 2  │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
      │               │               │
      ▼               ▼               ▼
Write to DB    Update Cache    Send Alerts

Each group maintains independent offsets
All groups receive ALL messages
```

## Offset Management

```
Partition: orders-0

┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
│ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ ...
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
          ▲       ▲           ▲
          │       │           │
    Consumer A  Consumer B  Consumer C
    offset: 2   offset: 4   offset: 7

Each consumer tracks its own offset
Offsets committed to Kafka (or external store)
Can reset offset to replay messages
```

## Message Structure

```
┌─────────────────────────────────────────────────┐
│                  KAFKA MESSAGE                   │
├─────────────────────────────────────────────────┤
│  Key:        "user-12345"                       │
│              (Optional, used for partitioning)   │
├─────────────────────────────────────────────────┤
│  Value:      { "action": "purchase",            │
│                "amount": 99.99,                  │
│                "item": "book" }                  │
│              (Actual payload - bytes)            │
├─────────────────────────────────────────────────┤
│  Timestamp:  2026-01-29T10:30:00Z               │
│              (When message created)              │
├─────────────────────────────────────────────────┤
│  Headers:    source: "web-app"                  │
│              version: "v2"                       │
│              (Optional metadata)                 │
├─────────────────────────────────────────────────┤
│  Offset:     1247  (Set by Kafka)               │
│  Partition:  2     (Set by Kafka)               │
└─────────────────────────────────────────────────┘
```

## Replication and Leader Election

```
Topic: "transactions" (Partition 0, Replication Factor = 3)

NORMAL OPERATION:

┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Broker 1    │        │  Broker 2    │        │  Broker 3    │
│              │        │              │        │              │
│  Partition 0 │        │  Partition 0 │        │  Partition 0 │
│  (LEADER)    │───────▶│  (FOLLOWER)  │        │  (FOLLOWER)  │
│              │    │   │              │        │              │
│  ┌─┬─┬─┬─┐  │    │   │  ┌─┬─┬─┬─┐  │        │  ┌─┬─┬─┬─┐  │
│  │0│1│2│3│  │    └──▶│  │0│1│2│3│  │◀───────│  │0│1│2│3│  │
│  └─┴─┴─┴─┘  │        │  └─┴─┴─┴─┘  │        │  └─┴─┴─┴─┘  │
└──────────────┘        └──────────────┘        └──────────────┘
       ▲                                                │
       │                                                │
   Producers                                       Replication
   write here                                      (followers fetch)


BROKER 1 FAILS ❌:

┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Broker 1    │        │  Broker 2    │        │  Broker 3    │
│   (DEAD)     │        │              │        │              │
│      ❌      │        │  Partition 0 │        │  Partition 0 │
│              │        │  (NEW LEADER)│───────▶│  (FOLLOWER)  │
│              │        │              │        │              │
│              │        │  ┌─┬─┬─┬─┐  │        │  ┌─┬─┬─┬─┐  │
│              │        │  │0│1│2│3│  │        │  │0│1│2│3│  │
│              │        │  └─┴─┴─┴─┘  │        │  └─┴─┴─┴─┘  │
└──────────────┘        └──────────────┘        └──────────────┘
                               ▲
                               │
                          Producers
                          now write here

Zookeeper/KRaft detects failure
Promotes a follower from ISR to leader
No data loss (all ISR replicas were in sync)
```

## Producer Acknowledgment Modes

```
acks=0 (Fire and forget):
Producer ────────▶ Broker
           (no wait for ack)
↓ Fastest, may lose messages


acks=1 (Leader acknowledged):
Producer ────────▶ Leader Broker ────────▶ Followers
           ◀────── ack             (async replication)
         (wait for leader)
↓ Balanced, may lose messages if leader fails


acks=all (All in-sync replicas):
Producer ────────▶ Leader ────────▶ Followers (ISR)
                           ◀────────
           ◀────── ack
       (wait for all ISR)
↓ Slowest, no message loss (durable)
```

## Consumer Offset Commit Strategies

```
AUTO-COMMIT (enable.auto.commit=true):
┌──────────────────────────────────────┐
│ Read msg → Process msg → (auto commit every 5s) │
└──────────────────────────────────────┘
⚠️  Risk: If crash before auto-commit, messages re-processed


MANUAL COMMIT - Sync:
┌──────────────────────────────────────┐
│ Read msg → Process msg → Commit ✓    │
└──────────────────────────────────────┘
✓ No message loss, but slower


MANUAL COMMIT - Async:
┌──────────────────────────────────────┐
│ Read msg → Process msg → Commit (async) │
└──────────────────────────────────────┘
⚠️  Faster, but may duplicate if crash before commit completes


AT-LEAST-ONCE (most common):
Read → Process → Commit
If crash before commit: message re-processed (duplicate)


AT-MOST-ONCE (rare):
Read → Commit → Process
If crash during process: message lost


EXACTLY-ONCE (complex):
Use Kafka transactions + idempotent producer
Requires additional coordination
```


## Key Configurations

### Producer Configs:
```
acks: 0, 1, or all (reliability)
batch.size: Batching for throughput
linger.ms: Wait time for batching
compression.type: none, gzip, snappy, lz4, zstd
max.in.flight.requests.per.connection: Parallel requests
enable.idempotence: Exactly-once semantics
```

### Consumer Configs:
```
group.id: Consumer group identifier
auto.offset.reset: earliest, latest, none
enable.auto.commit: Auto vs manual commit
max.poll.records: Records per poll
session.timeout.ms: Heartbeat timeout
fetch.min.bytes: Min data to fetch
```

### Topic Configs:
```
num.partitions: Number of partitions
replication.factor: Number of replicas
retention.ms: Message retention time
retention.bytes: Max size before deletion
compression.type: Compression codec
min.insync.replicas: Min replicas for ack=all
```

## Design Questions Where Kafka Is Useful

### 1. Design Uber - Real-time Trip Updates
* **Use Case**: Stream trip events (pickup, dropoff, location updates)
* **Why Kafka**: High throughput, real-time processing, multiple consumers (riders, drivers, analytics)

### 2. Design Netflix - View Event Tracking
* **Use Case**: Track what users watch, when they pause, rewind
* **Why Kafka**: Handle millions of events/sec, feed recommendations, analytics, billing

### 3. Design LinkedIn - Activity Feed
* **Use Case**: User posts, likes, comments, shares
* **Why Kafka**: Real-time feed updates, fanout to followers, multiple downstream systems

### 4. Design Stock Trading Platform
* **Use Case**: Stock price updates, trade execution events
* **Why Kafka**: Ultra-low latency, order preservation, replay capability for audit

### 5. Design Payment System (Stripe, PayPal)
* **Use Case**: Payment events, transaction logs
* **Why Kafka**: Durability, exactly-once semantics, event sourcing for audit trail

### 6. Design Logging Infrastructure (Splunk, ELK)
* **Use Case**: Aggregate logs from thousands of services
* **Why Kafka**: High throughput, buffer spikes, decouple log producers from consumers

### 7. Design IoT Platform
* **Use Case**: Sensor data from millions of devices
* **Why Kafka**: Massive scale, real-time processing, time-series data

### 8. Design E-commerce - Inventory Management
* **Use Case**: Order events, inventory updates, stock alerts
* **Why Kafka**: Event-driven architecture, consistency across services

### 9. Design Fraud Detection System
* **Use Case**: Stream transactions for real-time fraud analysis
* **Why Kafka**: Low latency, multiple fraud detection algorithms consuming in parallel

### 10. Design Social Media - Notification System
* **Use Case**: Generate notifications from various events
* **Why Kafka**: Decouple event generation from notification delivery, handle bursts

### 11. Design Microservices Communication
* **Use Case**: Inter-service events, saga pattern for distributed transactions
* **Why Kafka**: Reliable async communication, event replay, temporal decoupling

### 12. Design Data Pipeline (ETL)
* **Use Case**: Move data from databases to data warehouse
* **Why Kafka**: CDC (Change Data Capture), reliable transport, parallel processing

### 13. Design Gaming Backend - Leaderboard
* **Use Case**: Stream game scores, achievements
* **Why Kafka**: Real-time updates, handle millions of players, replay for recalculation

### 14. Design Recommendation Engine
* **Use Case**: User behavior events feed ML models
* **Why Kafka**: Real-time feature updates, batch and streaming processing

### 15. Design Distributed Cache Invalidation
* **Use Case**: Broadcast cache invalidation events
* **Why Kafka**: Pub-sub pattern, guarantee all cache nodes receive message

## Kafka vs Other Systems

### Kafka vs RabbitMQ:
- **Kafka**: High throughput, replay, durable log, multiple consumers
- **RabbitMQ**: Complex routing, lower latency for small messages, message priority

### Kafka vs AWS Kinesis:
- **Kafka**: Self-hosted, more control, unlimited retention
- **Kinesis**: Managed, easier ops, tight AWS integration

### Kafka vs Redis Pub/Sub:
- **Kafka**: Durable, replay, guaranteed delivery
- **Redis**: Fire-and-forget, no durability, simpler for ephemeral messaging

### Kafka vs Database:
- **Kafka**: Append-only log, horizontal scaling, stream processing
- **Database**: ACID transactions, complex queries, point lookups

## Best Practices

1. **Partition by Key for Ordering**: Messages with same key go to same partition
2. **Right-size Partitions**: Balance between parallelism and overhead (10-100 per broker)
3. **Monitor Consumer Lag**: Track how far consumers are behind producers
4. **Use Schema Registry**: Manage message formats (Avro, Protobuf)
5. **Batch for Throughput**: Adjust batch.size and linger.ms
6. **Compress Messages**: Use snappy or lz4 for better throughput
7. **Set Appropriate Retention**: Balance storage cost with replay needs
8. **Monitor ISR**: Ensure replicas stay in-sync
9. **Tune for Your Use Case**: Optimize for throughput OR latency, not both
10. **Use Consumer Groups**: For parallel processing and fault tolerance

## Shortcomings

* **Operational Complexity**: Requires expertise to run and tune
* **No Built-in Transformations**: Need external stream processors (Kafka Streams, Flink)
* **Message Size Limits**: Default 1MB max (can increase but impacts performance)
* **No Message Priority**: FIFO only, can't prioritize urgent messages
* **Rebalancing Overhead**: Consumer groups rebalance when members join/leave
* **Storage Costs**: Durable storage can be expensive for high-volume data
* **Learning Curve**: Many concepts to understand (partitions, offsets, groups, etc.)
* **Zookeeper Dependency**: Legacy clusters require Zookeeper (being replaced by KRaft)
