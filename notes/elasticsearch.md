# Elasticsearch Notes

## What is Elasticsearch?

Elasticsearch is a distributed, open-source search and analytics engine built on Apache Lucene. It provides a RESTful API and is designed for horizontal scalability, reliability, and real-time search capabilities.

## Key Features

- **Full-text search**: Advanced text search with relevance scoring
- **Distributed architecture**: Horizontal scaling across multiple nodes
- **Real-time indexing**: Near real-time search capabilities (1 second refresh)
- **RESTful API**: JSON-based HTTP API for all operations
- **Schema-free**: Dynamic mapping for JSON documents
- **Analytics**: Aggregations for complex data analysis
- **Multi-tenancy**: Multiple indices with different configurations

## Core Concepts

### Document
- Basic unit of information that can be indexed
- Expressed in JSON format
- Similar to a row in a relational database

### Index
- Collection of documents with similar characteristics
- Similar to a database in relational systems
- Named in lowercase

### Shard
- A single Lucene index containing a subset of documents
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
