# Bloom Filters

## What
* **Probabilistic Data Structure** for testing set membership
* Space-efficient way to check if an element is "possibly in set" or "definitely not in set"
* **Trade-off**: Allows false positives but NEVER false negatives
* Uses bit array and multiple hash functions
* Invented by Burton Howard Bloom in 1970

**Key Properties:**
* If Bloom filter says "NO" → element is **definitely not** in the set (100% accurate)
* If Bloom filter says "YES" → element **might be** in the set (could be false positive)
* Cannot remove elements (standard Bloom filter is write-only)
* Fixed memory size regardless of number of elements (until capacity reached)

## Storage or Compute?

**Bloom filter is purely a compute/memory structure — it stores NO actual data.**

| Role | Details |
|---|---|
| **NOT storage** | Does not store elements. You cannot retrieve what was inserted. |
| **In-memory structure** | Lives entirely in RAM as a bit array (very small — millions of items in MBs). |
| **Compute only** | Only answers one question: "Is this element possibly in the set?" |
| **Always paired with real storage** | DB, cache, or disk is the source of truth. Bloom filter is just the fast pre-filter in front of it. |

> **Rule of thumb**: Bloom filter = bouncer at the door. It quickly rejects people definitely not on the list. The actual guest list (real data) lives elsewhere.

## Why
* **Extreme Space Efficiency**: Uses bits instead of storing actual elements
    * Can represent millions of items in a few MB of memory
    * Example: 1 billion URLs in ~1.2 GB (vs several TB for actual storage)
* **Fast Operations**: O(k) time where k is number of hash functions (constant time in practice)
* **No False Negatives**: When you need to be absolutely sure something is NOT in the set
* **Perfect Pre-filter**: Quickly eliminate most negative cases before expensive lookups
* **Privacy-Friendly**: Don't need to expose actual data, just membership info

## How It Works

### Components:
1. **Bit Array**: Array of m bits, initially all set to 0
2. **Hash Functions**: k independent hash functions that map elements to array positions

### Adding an Element:
```
1. Pass element through k hash functions
2. Each hash function produces an index in the bit array
3. Set all k bits at those indices to 1

Example with k=3 hash functions:
Element "apple"
  h1("apple") → bit position 3  → set bit[3] = 1
  h2("apple") → bit position 7  → set bit[7] = 1
  h3("apple") → bit position 12 → set bit[12] = 1
```

### Checking Membership:
```
1. Pass element through same k hash functions
2. Check if ALL k bits at those indices are 1
3. If ANY bit is 0 → element definitely NOT in set
4. If ALL bits are 1 → element probably in set (might be false positive)

Example checking "banana":
  h1("banana") → bit position 3  → bit[3] = 1 ✓
  h2("banana") → bit position 8  → bit[8] = 0 ✗
  Result: "banana" is NOT in the set (guaranteed)

Example checking "grape" (false positive):
  h1("grape") → bit position 3  → bit[3] = 1 ✓
  h2("grape") → bit position 7  → bit[7] = 1 ✓
  h3("grape") → bit position 12 → bit[12] = 1 ✓
  Result: "grape" MIGHT be in set (but was never added, these bits were set by other elements)
```

### False Positive Rate:
The probability of false positives depends on:
* **m**: size of bit array
* **n**: number of elements inserted
* **k**: number of hash functions

**Formula**: `P(false positive) ≈ (1 - e^(-kn/m))^k`

**Optimal k**: `k = (m/n) * ln(2)` (approximately 0.7 * m/n)

**Example**:
* 1 million elements, 10 million bits, 7 hash functions → ~1% false positive rate
* Double the bits → ~0.01% false positive rate

## Common Use Cases

### 1. Web Crawler (Google, Common Crawl)
* A crawler visits billions of URLs — storing all visited URLs in memory or DB is too expensive
* Bloom filter holds all seen URLs in a few GB; before queuing a new URL, check the filter
* If filter says NO → definitely unvisited, add to queue. If YES → likely visited, skip it
* A rare false positive just means occasionally skipping a new URL — totally acceptable
* **Scale**: Google's crawler processes billions of URLs; Bloom filter makes this feasible

### 2. Database Storage Engines (Cassandra, RocksDB, LevelDB)
* Data is stored in SSTables on disk — reading disk for a key that doesn't exist is wasted I/O
* Each SSTable has a Bloom filter; before a disk read, check if the key *might* be in that file
* If filter says NO → skip the disk read entirely (saves 99%+ of wasted reads)
* If filter says YES → do the disk read (might be a false positive, costs one extra read)
* **Impact**: Dramatically reduces read amplification in LSM-tree storage engines

### 3. CDN / Edge Cache (Akamai, Cloudflare)
* Edge servers cache popular content; before fetching from origin, check if content is cached
* Bloom filter at each edge node tells whether a URL is *possibly* in cache
* Avoids unnecessary cache lookups for content that's definitely not there
* False positive = do a cache lookup that misses (still faster than hitting origin)

### 4. Chrome Safe Browsing
* Chrome maintains a local Bloom filter of ~millions of known malicious URLs
* When you visit a URL, Chrome checks the local filter first — no network call needed
* If filter says YES → Chrome contacts Google's servers to confirm (handles false positives)
* If filter says NO → page loads immediately, no server roundtrip
* **Result**: 99%+ of safe URLs never trigger a server call; privacy preserved

### 5. Email Spam Detection
* Maintain a Bloom filter of known spam sender addresses / domains
* Every incoming email is checked against the filter before hitting heavier ML models
* Fast first-pass eliminates obvious spam cheaply; false positives go to deeper inspection
* **Example**: Gmail's spam pipeline — Bloom filter as the cheapest first gate

### 6. Recommendation Engine (Medium, Netflix)
* Don't recommend an article / video the user has already seen
* Storing every user's full history in memory for fast lookup is expensive at scale
* Bloom filter per user tracks seen content; check before running recommendation algorithm
* False positive = occasionally skip recommending something (better than showing duplicates)
* **Scale**: Medium uses this pattern for hundreds of millions of user-article pairs

### 7. Password Breach Checker (HaveIBeenPwned)
* Database has billions of leaked password hashes — can't send user's password to a server
* Bloom filter of all breached hashes lives locally or uses k-anonymity API
* User's password hash is checked: filter says NO → definitely safe; YES → verify carefully
* **Privacy**: Actual password never leaves the device in the negative case

### 8. Distributed File Systems (HDFS, Cassandra vnodes)
* Each node holds a Bloom filter representing the keys/blocks it stores
* Coordinator node checks filters across nodes to route a query to the right node(s)
* Eliminates broadcast queries — instead of asking all N nodes, ask only likely candidates
* **Example**: Cassandra token-aware routing + per-SSTable Bloom filters

## Common Patterns

### 1. Bloom Filter as Cache Pre-check
* Check Bloom filter before expensive cache lookup
* Avoid cache misses for non-existent keys

### 2. Bloom Filter for Database Query Optimization
* Check if record exists before hitting database
* Save expensive disk I/O for non-existent records

### 3. Bloom Filter for Deduplication
* Quickly identify duplicate content, URLs, or data
* Used in web crawlers, backup systems

### 4. Bloom Filter in Distributed Systems
* Coordinate which nodes might have specific data
* Reduce network calls in P2P systems

### 5. Counting Bloom Filter
* Variant that allows deletions
* Uses counters instead of bits (more memory)

### 6. Scalable Bloom Filter
* Dynamically grows as more elements added
* Chain multiple Bloom filters with decreasing false positive rates

## Scale / Performance

**Space Complexity:**
* ~10 bits per element for 1% false positive rate
* ~5 bits per element for 10% false positive rate
* Example: 100 million elements @ 1% FP = ~120 MB

**Time Complexity:**
* Insert: O(k) where k = number of hash functions
* Lookup: O(k)
* In practice: microseconds for both operations

**Throughput:**
* Millions of operations per second on modern hardware
* Limited mainly by hashing speed and memory bandwidth

## Shortcomings

* **False Positives**
    * Will sometimes say element exists when it doesn't
    * Rate increases as more elements added
    * Cannot be eliminated, only reduced with more memory

* **Cannot Delete Elements**
    * Standard Bloom filter doesn't support removal
    * Setting bit to 0 might affect other elements
    * Need Counting Bloom Filter for deletions (uses more memory)

* **Fixed Capacity**
    * Performance degrades (more false positives) as it fills up
    * Need to know approximate size in advance
    * Or use Scalable Bloom Filter (more complex)

* **Cannot Enumerate Elements**
    * Can only test membership, not list what's inside
    * Cannot retrieve the original elements

* **Hash Function Dependency**
    * Need good, independent hash functions
    * Poor hash functions → clustering → higher false positive rate

* **No Membership Count**
    * Cannot tell how many times element was added
    * Cannot get cardinality (count of unique elements)

## Variants

### Counting Bloom Filter
* Uses counters (4-8 bits) instead of single bits
* Supports deletions by decrementing counters
* Uses 4-8x more memory

### Scalable Bloom Filter
* Automatically grows by adding new filters
* Each new filter has tighter false positive rate
* Maintains overall false positive probability

### Cuckoo Filter
* Alternative to Bloom filter
* Supports deletions
* Better lookup performance
* Slightly worse space efficiency

### Quotient Filter
* Cache-friendly alternative
* Supports deletions and merging
* Better for SSDs/modern hardware

## Design Questions Where Bloom Filters Are Useful

### 1. Design a Web Crawler
* **Use Case**: Avoid re-crawling URLs that were already visited
* **Why Bloom Filter**: Billions of URLs, only need to know "seen before or not"
* **Trade-off**: Occasional false positive means might skip a new URL (acceptable)

### 2. Design Medium / Content Platform - Recommendation System
* **Use Case**: Don't recommend articles user already read
* **Why Bloom Filter**: Quick check before expensive recommendation algorithm
* **Trade-off**: Might occasionally skip recommending an article (better than showing duplicates)

### 3. Design Gmail / Email System - Spam Detection
* **Use Case**: Check if email address is in known spam sender list
* **Why Bloom Filter**: Fast first-pass filter before ML models
* **Trade-off**: False positive means legitimate email checked more thoroughly (acceptable)

### 4. Design Akamai / CDN - Cache Check
* **Use Case**: Check if content exists in edge cache before forwarding to origin
* **Why Bloom Filter**: Avoid cache lookups for content definitely not cached
* **Trade-off**: False positive = unnecessary cache lookup (still faster than origin)

### 5. Design Bitcoin / Blockchain Wallet
* **Use Case**: Check if address has transactions without downloading entire blockchain
* **Why Bloom Filter**: SPV (Simplified Payment Verification) clients use Bloom filters
* **Trade-off**: Some privacy loss, but enables lightweight wallets

### 6. Design Chrome Browser - Safe Browsing
* **Use Case**: Check if URL is potentially malicious before full verification
* **Why Bloom Filter**: Local fast check before contacting Google servers
* **Trade-off**: False positive = extra server check (rare, acceptable)

### 7. Design Database Storage Engine (like Cassandra, RocksDB)
* **Use Case**: Check if key exists in SSTable before disk read
* **Why Bloom Filter**: Avoid expensive disk I/O for non-existent keys
* **Trade-off**: False positive = unnecessary disk read (still saves 99% of wasted reads)

### 8. Design Duplicate Content Detection System (YouTube, Instagram)
* **Use Case**: Detect if video/image was already uploaded
* **Why Bloom Filter**: Fast first check using content hash
* **Trade-off**: False positive = deeper comparison check (rare)

### 9. Design Distributed File System (like HDFS, GFS)
* **Use Case**: Check which nodes might have specific data blocks
* **Why Bloom Filter**: Each node maintains Bloom filter of its data
* **Trade-off**: False positive = query wrong node (costs one network call)

### 10. Design Password Breach Checker (like haveibeenpwned)
* **Use Case**: Check if password is in leaked password database
* **Why Bloom Filter**: Privacy-preserving check without sending actual password
* **Trade-off**: False positive = warn user unnecessarily (acceptable for security)

### 11. Design LinkedIn / Social Network - Connection Suggestions
* **Use Case**: Quickly filter out people already connected
* **Why Bloom Filter**: Fast negative check before graph traversal
* **Trade-off**: False positive = skip suggesting valid connection (minor)

### 12. Design Bitcoin Mining Pool
* **Use Case**: Prevent duplicate nonce submissions from miners
* **Why Bloom Filter**: Track billions of attempted nonces
* **Trade-off**: False positive = miner wastes small amount of work (rare)

### 13. Design Malware Scanner
* **Use Case**: Check if file hash matches known malware signatures
* **Why Bloom Filter**: Fast initial scan before deep analysis
* **Trade-off**: False positive = deeper scan on clean file (acceptable)

### 14. Design API Gateway - Request Deduplication
* **Use Case**: Detect duplicate requests within time window (idempotency)
* **Why Bloom Filter**: Fast check using request ID
* **Trade-off**: False positive = reject valid request (use with caution)

### 15. Design Backup/Sync System (Dropbox, Google Drive)
* **Use Case**: Check if file chunk already exists before upload
* **Why Bloom Filter**: Fast deduplication using content hash
* **Trade-off**: False positive = deeper check (minimal overhead)

## Best Practices

1. **Size Your Filter Properly**
   * Know approximate number of elements
   * Choose acceptable false positive rate
   * Calculate required bits: `m = -n*ln(p) / (ln(2))^2`

2. **Use Quality Hash Functions**
   * MurmurHash, xxHash, or cryptographic hashes
   * Ensure independence between hash functions

3. **Monitor Fill Rate**
   * False positive rate increases as filter fills
   * Consider rotating or expanding filter when >50% full

4. **Combine with Backend Storage**
   * Bloom filter as first line of defense
   * Actual storage (DB, cache) as source of truth
   * Handle false positives gracefully

5. **Document False Positive Impact**
   * Understand cost of false positive in your system
   * Choose rate based on this cost
   * Don't use where false positives are unacceptable

## When NOT to Use Bloom Filters

* When you need 100% accuracy on positive results
* When you need to enumerate or count elements
* When you need to delete elements frequently (use Counting Bloom Filter or Cuckoo Filter)
* When memory is unlimited and you can store full set
* When false positives have severe consequences (safety-critical systems)

## Real-World Implementations

* **Google Chrome**: Safe Browsing feature
* **Cassandra/RocksDB**: SSTable bloom filters
* **Bitcoin**: SPV wallet transaction filtering
* **Akamai CDN**: Cache presence checking
* **Squid Proxy**: Cache digest
* **PostgreSQL**: Partition pruning
* **Medium**: Article recommendations
