A great example of this is using a write-heavy database like Cassandra. Cassandra achieves superior write throughput through its append-only commit log architecture. Instead of updating data in place (which requires expensive disk seeks), Cassandra writes everything sequentially to disk. This lets it handle 10,000+ writes per second on modest hardware, compared to maybe 1,000 writes per second for a traditional relational database doing the same work.

# 1.  Horizontal Sharding

# 2.  Vertical Partitioning
making smaller tables that is diving tables into smaaler tables and may use join in reading

# 3. Kafka for decoupling
Useful when we have burst of writes at one go.
* we can have a kafka in between.
*  the queue acts as a buffer, smoothing out traffic spikes. Your database processes writes at a steady rate while the queue handles bursts.
* increases delay
* when user writes intead of a task completion message user will get a task queued message and has to query if its executed.

# 4. Load Shedding Strategies

# 5. Batching 
One example of this is batching writes together. Instead of processing writes one by one, you batch multiple writes together to amortize this overhead. This can be done at the application layer, as an in-between process, or even at the database layer.\
Need to handle the dataloss. suppose if we are batching at application level and application crashes. we need to have a mechanism for this situaltion.
# 6.  Hierarchical Aggregation.