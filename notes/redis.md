## What
* In memory Datastore
* Known for reliability
* good at what it does best: executing simple operations fast.
* Redis is a key-value store. Keys are strings while values which can be any of the data structures supported by Redis: binary data and strings, sets, lists, hashes, sorted sets, etc. All objects in Redis have a key.
* single threaded

Some of the most fundamental data structures supported by Redis:
* Strings
* Hashes (objects/dictionaries)
* Lists
* Sets
* Sorted Sets (Priority Queues)
* Bloom Filters (probabilistic set membership; allows false positives)
* Geospatial Indexes
* Time Series

## Why
* **Speed**: In-memory operations are 1000x faster than disk-based operations
* **Versatility**: Beyond simple caching - can handle complex data structures and operations
* **Atomic Operations**: All operations are atomic by default (single-threaded)
* **Built-in Pub/Sub**: Native support for real-time messaging patterns
* **Low Latency**: Ideal for real-time applications, session storage, leaderboards, rate limiting
* **Simple**: Easy to learn, deploy, and maintain

## patterns
* Redis as a Cache
* Redis as a Distributed Lock
    * TO avoid Race condition

* Redis for Leaderboards
    * use Sorted Sets
* Redis for Rate Limiting
    * . A common algorithm is a fixed-window rate limiter where we guarantee that the number of requests does not exceed N over some fixed window of time W.
Implementation of this in Redis is simple. When a request comes in, we increment (INCR) the key for our rate limiter and check the response. If the response is greater than N, we wait. If it's less than N, we can proceed. We call EXPIRE on our key so that after time period W, the value is reset.
* Redis for Proximity Search
    * Useful for geoSpatial search  GEOADD and GEOSEARCH    
* Redis as a pub SUb model
    * Redis also offers a pubsub model like kafka.
    * it is faster than kafka as it is inmemeory
    * Creating a topic and partition is quick and less resource intensive than kafka. Topics in redis are called channels
    * It is usefull where we want more realtime data and want to make hundereds of topic. ideal for chat bot system where we want total topics should be equal to number of online users and can change quickly so should be resource light
    * **Limitations**: 
        * Not suitable for critical message delivery requiring guaranteed persistence
        * Can become a bottleneck with too many subscribers on a single channel


#### Channels vs Topics - Key Differences:
* Redis Channels:
    * Lightweight: Exist only when there are active publishers/subscribers
    * No Persistence: Messages are ephemeral - if no subscribers are listening, messages disappear
    * No Pre-configuration: Created dynamically when first used
    * Simple Structure: Just a named channel, no partitioning concept
    * Fire-and-forget: No message storage or replay capability

* Kafka Topics:
    * Durable: Topics are persistent entities that exist independently of consumers
    * Partitioned: Topics are divided into partitions for scalability and ordering
    * Message Retention: Messages are stored on disk for a configurable time period
    Replay Capability: Consumers can read from any offset (replay old messages)
    * Consumer Groups: Multiple consumer groups can process the same topic independently
    * Schema Management: Can enforce message schemas and evolution

In Simple Terms:
* Redis Channels = Like a radio station - if you're not tuned in when the song plays, you miss it

* Kafka Topics = Like a DVR recording - messages are stored, you can replay them, and multiple viewers can watch independently

Use Cases:
Choose Redis Channels when:

Real-time notifications (live scores, alerts)
Chat systems with ephemeral messages
Live dashboards where only current data matters
Choose Kafka Topics when:

Event sourcing and audit trails
Data pipelines requiring guaranteed delivery
Systems needing to replay/reprocess historical events
High-throughput data streaming with durability requirements
The confusion in your document comes from Redis using "channels" while Kafka uses "topics" - they're fundamentally different architectures serving different messaging needs.

# Scale 
- ~1 millisecond latency
- 100k+ operations/second
- Memory-bound (up to 1TB)

# Shortcomings:

* **Hot Key Issue**
    * Single key receiving disproportionate traffic becomes a bottleneck
    * Solutions: Client-side caching, read replicas, key sharding, use hashes to split data
    
# Design Questions Where Redis is Useful:

## 1. Design a URL Shortener (like bit.ly)
* **Use Case**: Store mapping of short URL → long URL
* **Data Structure**: String (key: short_code, value: original_url)
* **Why Redis**: Fast lookups, high read throughput, TTL support for expiring links

## 2. Design Twitter/Social Media Feed
* **Use Case**: Store user timelines, trending topics, who-to-follow suggestions
* **Data Structure**: Lists (for feeds), Sorted Sets (for trending topics with scores)
* **Why Redis**: Fast insertion/retrieval, can maintain chronological order, support for pagination

## 3. Design an E-commerce Flash Sale System
* **Use Case**: Handle inventory counts, prevent overselling during high traffic
* **Data Structure**: Strings with DECR command, Distributed Locks
* **Why Redis**: Atomic operations prevent race conditions, high write throughput

## 4. Design a Real-time Gaming Leaderboard
* **Use Case**: Track player scores and rankings
* **Data Structure**: Sorted Sets (ZADD, ZRANGE, ZRANK)
* **Why Redis**: O(log N) insertion, efficient range queries, real-time score updates

## 5. Design a Session Management System
* **Use Case**: Store user session data across distributed servers
* **Data Structure**: Hashes (for session attributes) or Strings
* **Why Redis**: Fast access, TTL for auto-expiration, shared across servers

## 6. Design a Rate Limiter for API Gateway
* **Use Case**: Limit requests per user/IP (e.g., 100 requests/minute)
* **Data Structure**: Strings with INCR + EXPIRE, or Sorted Sets for sliding window
* **Why Redis**: Atomic increments, TTL support, centralized counting across servers

## 7. Design a Real-time Chat Application
* **Use Case**: Message queues, online user tracking, typing indicators
* **Data Structure**: Pub/Sub (for messaging), Sets (for online users), Lists (for message history)
* **Why Redis**: Built-in Pub/Sub, low latency, ephemeral data handling

## 8. Design a Job Queue System (like Celery)
* **Use Case**: Manage background tasks, priority queues
* **Data Structure**: Lists (LPUSH/RPOP for FIFO), Sorted Sets (for priority/delayed jobs)
* **Why Redis**: Blocking operations (BLPOP), atomic push/pop, persistent queues

## 9. Design an Auto-complete / Type-ahead Search
* **Use Case**: Suggest search queries as user types
* **Data Structure**: Sorted Sets with lexicographical ordering (ZRANGEBYLEX)
* **Why Redis**: Fast prefix matching, can store popularity scores

## 10. Design Uber - Driver Location Tracking
* **Use Case**: Find nearby drivers within radius
* **Data Structure**: Geospatial Indexes (GEOADD, GEORADIUS)
* **Why Redis**: Built-in geospatial commands, sub-millisecond queries

## 11. Design a Notification System
* **Use Case**: Track read/unread notifications, fanout notifications
* **Data Structure**: Sorted Sets (timestamp as score), Sets (for read status)
* **Why Redis**: Fast reads, can handle high write volume during fanout

## 12. Design a Distributed Lock Service
* **Use Case**: Coordinate access to shared resources across microservices
* **Data Structure**: Strings with SETNX/SET NX PX, or Redlock algorithm
* **Why Redis**: Atomic operations, TTL for auto-release, fast lock acquisition

## 13. Design a Caching Layer for Database
* **Use Case**: Cache frequently accessed data to reduce DB load
* **Data Structure**: Strings (serialized objects) or Hashes
* **Why Redis**: LRU eviction, cache-aside/write-through patterns, TTL support

## 14. Design a Stock Trading Platform
* **Use Case**: Real-time price updates, order book management
* **Data Structure**: Pub/Sub (price updates), Sorted Sets (order book)
* **Why Redis**: Low latency critical for trading, atomic operations

## 15. Design a Content Deduplication System
* **Use Case**: Detect duplicate content uploads (images, videos)
* **Data Structure**: Bloom Filters (probabilistic membership test)
* **Why Redis**: Memory-efficient duplicate checking, fast lookups
