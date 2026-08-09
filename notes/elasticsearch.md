# Elasticsearch Notes

## 1. Core purpose

Elasticsearch is a distributed search engine built on Lucene that uses an inverted index to enable fast full-text search and analytics at scale.

**In simple terms:** Elasticsearch is like a library catalog for your documents. It reads and organizes their words beforehand, so when you search for a word or phrase, it can quickly find, count and return the matching documents without reading every document from beginning to end each time.

Elasticsearch performs indexing work so repeated searches do not scan every document again. Its primary benefit is fast, scalable repeated search. It usually consumes additional storage rather than reducing it.

```
Receive document
  -> analyze text fields
  -> build inverted index
  -> store original source (_source)
  -> search and retrieve results
```

## 2. Inverted index

**Forward view (what you store):**
```
Doc 1: "Virat Kohli scored a century"
Doc 2: "Rohit Sharma and Virat Kohli played well"
Doc 3: "Virat played cricket with Kohli"
```

**Inverted view (what Elasticsearch builds):**
```
virat   -> [Doc 1, Doc 2, Doc 3]
kohli   -> [Doc 1, Doc 2, Doc 3]
century -> [Doc 1]
scored  -> [Doc 1]
played  -> [Doc 2, Doc 3]
```

Lucene uses a term dictionary and compressed postings lists. A posting can include document ID, term frequency and token positions. Searching is fast because you look up terms in the dictionary, get the postings list, intersect them, and rank results — no full document scans.

## 3. Mappings and analysis

| Field type | Behavior | Example |
|---|---|---|
| `text` | Analyzed into tokens; search uses inverted index | Article content |
| `keyword` | Indexed as one exact value; no analysis | URL, status, category |
| number/date | Uses type-specific structures; range queries | Views, publication time |

Analysis transforms raw text during indexing:
- Lowercasing: "VIRAT" → "virat"
- Stemming: "playing" → "play" (matches "played")
- Stop-word removal: ignore "the", "and", "a"
- Synonyms: "CEO" → "chief executive officer"
- N-grams: "kohli" → "k", "o", "h", "l", "i", "ko", "oh", ... (enables prefix matching)

Phrase matching uses positions in the analyzed token stream. Lowercasing, stemming, stop-word filters, synonyms and phrase slop can change results.

## 4. Virat Kohli phrase example

**Documents:**
```
Doc 1: "Virat Kohli scored a century"
Doc 2: "Rohit Sharma and Virat Kohli played well"
Doc 3: "Virat played cricket with Kohli"
Doc 4: "Kohli is a famous cricketer"
```

**Search query: "virat kohli" (exact phrase)**

| Document | virat position | kohli position | Phrase match? |
|---|---|---|---|
| 1 | 0 | 1 | Yes |
| 2 | 3 | 4 | Yes |
| 3 | 0 | 4 | No |
| 4 | Absent | 0 | No |

**How the search works:**
```
virat documents: [1, 2, 3]
kohli documents: [1, 2, 3, 4]
intersection: [1, 2, 3]
position verification: [1, 2]  (positions are adjacent)
matching document count: 2
```

Phrase matching requires position checks. Simply intersecting postings lists gives candidates; then positions are verified. This counts matching documents. Counting every phrase occurrence requires additional position/term-vector processing or a count stored during ingestion.

## 5. What is stored?

| Information | Purpose |
|---|---|
| `_source` | Original JSON used for retrieval and re-indexing |
| Term dictionary | Locate indexed terms |
| Postings lists | Locate documents containing terms |
| Frequency and positions | Scoring, phrase and proximity queries |
| `doc_values` | Sorting and aggregations |
| Metadata | Index, ID, version and sequence information |

**Search flow:**
```
query term
  -> term dictionary
  -> postings list
  -> candidate IDs
  -> frequency/position checks
  -> retrieve JSON from _source
```

Positions are details associated with postings; they are not a replacement for the inverted index.

## 6. Time and operational trade-offs

| Operation | Simplified cost |
|---|---|
| Index all tokens | O(total tokens) |
| Add one document | O(words in that document) |
| Scan without index | O(all document text) per query |
| Indexed query | Depends on postings, scoring, aggregation and shards |

Elasticsearch search is not simply O(1). Rare terms are generally cheaper than common terms. Phrase checks, BM25 scoring, result collection and shard fan-out add work.

Lucene uses immutable segments. Refreshes make new segments searchable, merging combines segments, and updates behave like delete plus re-index.

## 7. When Elasticsearch is unnecessary

- A small dataset or one-time search can be scanned directly.
- Exact key lookup can use a normal database index.
- One permanent condition can be counted during ingestion.
- Transactional consistency may be more important than search.
- Real-time updates critical — Elasticsearch's ~1 second refresh means staleness.
- Each index is divided into multiple shards for distribution
- **Primary shard**: Original shard containing documents
- **Replica shard**: Copy of primary shard for redundancy and read scaling

### Node
- Single server that stores data and participates in indexing/search
- Types:
  - **Master node**: Controls cluster, manages indices
  - **Data node**: Stores data and executes queries
  - **Ingest node**: Pre-processes documents before indexing
  - **Coordinating node**: Routes requests, handles search reduce phase

### Cluster
- Collection of nodes working together
- Identified by unique name
- All nodes must have same cluster name to join

## Architecture

```
Cluster
  └── Nodes (multiple servers)
       └── Indices (collections of data)
            └── Shards (distributed data)
                 └── Documents (JSON data)
```

### How Data is Distributed

1. Documents are hashed to determine which shard they belong to
2. Primary shards are distributed across nodes
3. Replica shards are placed on different nodes than their primaries
4. Read requests can be served by primary OR replica shards

## Inverted Index

Elasticsearch uses inverted index data structure for fast full-text searches:

- Maps terms to documents containing them
- Each field in a document is indexed separately
- Tokenization breaks text into terms
- Terms are normalized (lowercase, stemming, etc.)

Example:
```
Document 1: "The quick brown fox"
Document 2: "Quick brown dogs"

Inverted Index:
"quick" → [Doc1, Doc2]
"brown" → [Doc1, Doc2]
"fox"   → [Doc1]
"dog"   → [Doc2]
```

## Query Types

### Match Query
```json
{
  "query": {
    "match": {
      "title": "elasticsearch guide"
    }
  }
}
```
- Full-text search with analysis
- Documents must match at least one term

### Term Query
```json
{
  "query": {
    "term": {
      "status": "published"
    }
  }
}
```
- Exact match on non-analyzed fields
- Case-sensitive, no analysis

### Bool Query
```json
{
  "query": {
    "bool": {
      "must": [...],      // AND condition
      "should": [...],    // OR condition
      "must_not": [...],  // NOT condition
      "filter": [...]     // Filter without scoring
    }
  }
}
```

### Range Query
```json
{
  "query": {
    "range": {
      "age": {
        "gte": 10,
        "lte": 20
      }
    }
  }
}
```

## Aggregations

Statistical analysis and grouping of data:

### Metric Aggregations
- Calculate metrics (avg, sum, min, max, stats)

### Bucket Aggregations
- Group documents into buckets (terms, range, date histogram)

### Pipeline Aggregations
- Work on output of other aggregations

Example:
```json
{
  "aggs": {
    "group_by_category": {
      "terms": {
        "field": "category"
      },
      "aggs": {
        "avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

## Mapping

Defines how documents and fields are stored and indexed:

### Dynamic Mapping
- Automatically detects field types
- Can lead to unexpected types

### Explicit Mapping
```json
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "date": { "type": "date" },
      "price": { "type": "double" },
      "tags": { "type": "keyword" }
    }
  }
}
```

### Field Types
- **Text**: Full-text analyzed fields
- **Keyword**: Exact value, not analyzed
- **Numeric**: long, integer, short, byte, double, float
- **Date**: Date/datetime values
- **Boolean**: true/false
- **Object**: JSON object
- **Nested**: Array of objects with independent search

## Analyzers

Process text fields for indexing and searching:

1. **Character filters**: Remove HTML, map characters
2. **Tokenizer**: Split text into terms
3. **Token filters**: Lowercase, stemming, synonyms, stopwords

Standard analyzers:
- **Standard**: Default, lowercase, stopwords
- **Simple**: Lowercase, non-letter tokenization
- **Whitespace**: Split on whitespace only
- **Keyword**: No analysis, entire value as single term

## Scoring and Relevance

Elasticsearch uses **BM25** algorithm (default since version 5.0):

- **TF** (Term Frequency): How often term appears in document
- **IDF** (Inverse Document Frequency): Rarity of term across documents
- **Field Length Norm**: Shorter fields weighted higher

Score can be boosted:
```json
{
  "query": {
    "multi_match": {
      "query": "search text",
      "fields": ["title^3", "content"]
    }
  }
}
```

## Performance Optimization

### Indexing Performance
- Increase refresh interval during bulk indexing
- Use bulk API for multiple documents
- Disable replicas during initial load
- Increase index buffer size
- Use SSD storage

### Search Performance
- Use filters instead of queries when possible (cached)
- Avoid deep pagination (use search_after)
- Use routing for targeted searches
- Reduce result size with source filtering
- Use doc_values for sorting/aggregations

### Shard Sizing
- Keep shards between 10-50 GB
- Too many small shards = overhead
- Too few large shards = poor distribution
- Formula: (Source data × 1.45) / desired shard size

## CAP Theorem Trade-offs

Elasticsearch is **AP** (Availability + Partition tolerance):
- Prioritizes availability over consistency
- Eventually consistent
- Can serve stale data during network partitions

## Use Cases

1. **Full-text search**: Website search, document search
2. **Log analytics**: Application logs, server logs (ELK stack)
3. **Real-time analytics**: Dashboards, monitoring
4. **Security analytics**: SIEM, threat detection
5. **Business analytics**: Customer behavior, sales analysis
6. **Geospatial search**: Location-based queries

## ELK Stack

**Elasticsearch + Logstash + Kibana**:
- **Logstash**: Data collection and processing pipeline
- **Elasticsearch**: Storage and search engine
- **Kibana**: Visualization and UI
- **Beats**: Lightweight data shippers (Filebeat, Metricbeat, etc.)

## Advantages

- Extremely fast search performance
- Horizontal scalability
- Flexible schema
- Rich query DSL
- Real-time analytics
- High availability through replication
- Active community and ecosystem

## Disadvantages

- High memory requirements
- Complex cluster management
- Not suitable for ACID transactions
- Eventually consistent (not strongly consistent)
- Storage overhead (inverted index)
- Learning curve for query DSL
- Can be resource-intensive

## Common Operations

### Create Index
```bash
PUT /my_index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  }
}
```

### Index Document
```bash
POST /my_index/_doc/1
{
  "title": "Elasticsearch Guide",
  "content": "Learn Elasticsearch"
}
```

### Search
```bash
GET /my_index/_search
{
  "query": {
    "match": {
      "title": "elasticsearch"
    }
  }
}
```

### Delete Index
```bash
DELETE /my_index
```

## Best Practices

1. Plan shard count based on data size and growth
2. Use index templates for consistent settings
3. Monitor cluster health regularly
4. Use aliases for zero-downtime reindexing
5. Implement proper security (authentication/authorization)
6. Regular backups using snapshots
7. Use separate indices for time-series data
8. Optimize mappings before production
9. Test queries and aggregations at scale
10. Keep Elasticsearch version up to date
